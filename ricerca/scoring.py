#!/usr/bin/env python3
"""Allegato C - Calcolatore di scoring della ricerca Touchfulness.

Legge il CSV delle interviste (Allegato B), calcola Problem Score e Market Score
riga per riga e applica al gruppo di ipotesi i criteri di conferma (§9) e di
falsificazione (§10) del protocollo master.

    python3 ricerca/scoring.py ricerca/dati/interviste.csv
    python3 ricerca/scoring.py ricerca/dati/interviste-esempio.csv --righe /tmp/righe.csv
    python3 ricerca/scoring.py ricerca/dati/interviste.csv --json

Nessuna dipendenza esterna: solo libreria standard.
"""

from __future__ import annotations

import argparse
import csv
import json
import statistics
import sys

# --- Costanti del protocollo (§7.2, §8, §9, §10) --------------------------
# Modificarle qui equivale a modificare il protocollo: va registrato in §17.

ANCORE_FREQUENZA = [  # (soglia volte/settimana inclusa, F)
    (0.25, 1),   # meno di 1 volta al mese
    (0.75, 3),   # 1-3 volte al mese
    (2.0, 5),    # 1-2 volte a settimana
    (5.0, 7),    # 3-5 volte a settimana
    (7.0, 9),    # quasi ogni giorno
]
F_MASSIMA = 10   # piu' volte al giorno

B_EVIDENZA = {
    "nulla": 0,
    "informazioni": 2,
    "prova_singola": 4,
    "ricorrente_gratis": 6,
    "spesa_30_200": 8,
    "spesa_ricorrente": 10,
}

SOGLIA_P_FORTE = 6.0
SOGLIA_P_GRIGIA = 4.0
SOGLIA_M_MERCATO = 5.0
SOGLIA_M_GRIGIA = 3.0

# §9 - criteri di conferma
CONF_PREV = 0.30
CONF_PREV_S3 = 0.25
CONF_FORTE = 0.50
CONF_MERCATO = 0.35
N_MINIMO = 25
N_MINIMO_S3 = 10

# §10 - criteri di falsificazione
F1_PREV = 0.15
F2_PREV_S1 = 0.30
F2_PREV_S3 = 0.10
F3_FORTE = 0.30
F4_MERCATO = 0.15

STRATI = ("S1", "S2", "S3")


# --- Utilita' -------------------------------------------------------------

def num(valore, campo, id_riga, avvisi, minimo=0.0, massimo=None):
    """Converte in float; restituisce None se vuoto o non valido."""
    testo = (valore or "").strip().replace(",", ".")
    if testo == "":
        return None
    try:
        x = float(testo)
    except ValueError:
        avvisi.append(f"{id_riga}: {campo}='{valore}' non e' un numero, ignorato")
        return None
    if x < minimo or (massimo is not None and x > massimo):
        avvisi.append(f"{id_riga}: {campo}={x:g} fuori scala, ignorato")
        return None
    return x


def frequenza_normalizzata(volte_settimana):
    """volte/settimana -> F su 0-10 secondo gli ancoraggi di §7.2."""
    if volte_settimana is None:
        return None
    if volte_settimana <= 0:
        return 0.0
    for soglia, f in ANCORE_FREQUENZA:
        if volte_settimana <= soglia:
            return float(f)
    return float(F_MASSIMA)


def media_geometrica(fattori):
    """Media geometrica: se un fattore e' 0, il risultato e' 0 (voluto, §8.3)."""
    prodotto = 1.0
    for x in fattori:
        if x <= 0:
            return 0.0
        prodotto *= x
    return prodotto ** (1.0 / len(fattori))


def pct(parte, totale):
    return 0.0 if not totale else 100.0 * parte / totale


def mediana(valori):
    return statistics.median(valori) if valori else 0.0


def elenco(campo):
    return [x.strip() for x in (campo or "").replace(",", ";").split(";") if x.strip()]


# --- Lettura e calcolo per riga -------------------------------------------

def calcola_righe(percorso):
    righe, avvisi, scartate = [], [], []

    with open(percorso, newline="", encoding="utf-8") as f:
        for grezza in csv.DictReader(f):
            id_riga = (grezza.get("id_riga") or "?").strip()
            if not id_riga or id_riga == "?":
                continue

            if (grezza.get("episodio_datato") or "").strip().lower() not in ("si", "sì", "s", "1"):
                scartate.append((id_riga, "nessun episodio concreto e datato (Allegato A §3)"))
                continue

            strato = (grezza.get("strato") or "").strip().upper()
            if strato not in STRATI:
                avvisi.append(f"{id_riga}: strato '{strato}' non valido, riga esclusa")
                continue

            chiave_b = (grezza.get("b_evidenza") or "").strip().lower()
            if chiave_b not in B_EVIDENZA:
                avvisi.append(f"{id_riga}: b_evidenza '{chiave_b}' non valida, riga esclusa")
                continue
            b = float(B_EVIDENZA[chiave_b])

            f_norm = frequenza_normalizzata(num(grezza.get("freq_sett"), "freq_sett", id_riga, avvisi))
            intensita = num(grezza.get("intensita"), "intensita", id_riga, avvisi, massimo=10)
            urgenza = num(grezza.get("urgenza"), "urgenza", id_riga, avvisi, massimo=10)
            desiderio = num(grezza.get("desiderio"), "desiderio", id_riga, avvisi, massimo=10)
            soddisfazione = num(grezza.get("soddisfazione"), "soddisfazione", id_riga, avvisi, massimo=10)
            costo = num(grezza.get("costo_eur_12m"), "costo_eur_12m", id_riga, avvisi) or 0.0

            mancanti = [n for n, v in (("freq_sett", f_norm), ("intensita", intensita),
                                       ("urgenza", urgenza), ("desiderio", desiderio)) if v is None]
            if mancanti:
                avvisi.append(f"{id_riga}: manca {', '.join(mancanti)}, riga esclusa dallo scoring")
                continue

            # Coerenza fra comportamento dichiarato e spesa ricostruita (Allegato B).
            incoerenza = None
            if costo >= 30 and b < 8:
                incoerenza = f"costo {costo:g} EUR con b_evidenza='{chiave_b}'"
            elif chiave_b == "spesa_30_200" and not (30 <= costo <= 200):
                incoerenza = f"b_evidenza='spesa_30_200' ma costo {costo:g} EUR"
            elif chiave_b == "spesa_ricorrente" and costo <= 200:
                incoerenza = f"b_evidenza='spesa_ricorrente' ma costo {costo:g} EUR"
            elif chiave_b == "nulla" and costo > 0:
                incoerenza = f"b_evidenza='nulla' ma costo {costo:g} EUR"
            if incoerenza:
                avvisi.append(f"{id_riga}: {incoerenza} - da risolvere, riga esclusa (Allegato B)")
                continue

            # S non si stima quando non esiste una soluzione attuale: B=0 => M=0 (§7.2).
            s = None if soddisfazione is None else 10.0 - soddisfazione
            if s is None and b > 0:
                avvisi.append(f"{id_riga}: comportamento presente ma soddisfazione non rilevata, S non stimabile")

            p = media_geometrica([f_norm, intensita, urgenza, desiderio])
            m = 0.0 if s is None else media_geometrica([p, b, s])

            righe.append({
                "id_riga": id_riga,
                "partecipante": (grezza.get("partecipante") or "").strip(),
                "strato": strato,
                "F": f_norm, "I": intensita, "U": urgenza, "D": desiderio,
                "B": b, "S": s, "P": p, "M": m,
                "costo_eur_12m": costo,
                "ipotesi": elenco(grezza.get("ipotesi")),
                "problema_testo": (grezza.get("problema_testo") or "").strip(),
            })

    return righe, avvisi, scartate


# --- Aggregazione per ipotesi ---------------------------------------------

def analizza(righe):
    partecipanti = {r["partecipante"] for r in righe}
    per_strato = {s: {r["partecipante"] for r in righe if r["strato"] == s} for s in STRATI}

    ipotesi = sorted({h for r in righe for h in r["ipotesi"]}, key=lambda h: (len(h), h))
    esito = []

    for h in ipotesi:
        sel = [r for r in righe if h in r["ipotesi"]]
        part_h = {r["partecipante"] for r in sel}
        prev = len(part_h) / len(partecipanti) if partecipanti else 0.0
        prev_s = {s: (len({r["partecipante"] for r in sel if r["strato"] == s}) / len(per_strato[s])
                      if per_strato[s] else 0.0) for s in STRATI}
        forte = sum(1 for r in sel if r["P"] >= SOGLIA_P_FORTE) / len(sel)
        mercato = sum(1 for r in sel if r["M"] >= SOGLIA_M_MERCATO) / len(sel)

        campione_pieno = len(partecipanti) >= N_MINIMO and len(per_strato["S3"]) >= N_MINIMO_S3

        if (prev >= CONF_PREV and prev_s["S3"] >= CONF_PREV_S3
                and forte >= CONF_FORTE and mercato >= CONF_MERCATO):
            verdetto, regola = "VIVA", "§9 criteri 1-4"
        elif prev_s["S1"] >= F2_PREV_S1 and prev_s["S3"] < F2_PREV_S3:
            verdetto, regola = "ARTEFATTO DI CLIENTELA", "F2"
        elif prev < F1_PREV:
            verdetto, regola = "MORTA", "F1 (prevalenza < 15%)"
        elif forte < F3_FORTE:
            verdetto, regola = "TIEPIDA", "F3 (problema forte < 30%)"
        elif mercato < F4_MERCATO:
            verdetto, regola = "SENZA MERCATO", "F4 (mercato < 15%)"
        else:
            verdetto, regola = "ZONA GRIGIA", "nessun criterio soddisfatto"

        esito.append({
            "ipotesi": h, "righe": len(sel), "persone": len(part_h),
            "prevalenza": prev, "prevalenza_strato": prev_s,
            "forte": forte, "mercato": mercato,
            "P_mediana": mediana([r["P"] for r in sel]),
            "M_mediana": mediana([r["M"] for r in sel]),
            "verdetto": verdetto, "regola": regola,
            "provvisorio": not campione_pieno,
        })

    esito.sort(key=lambda e: (-e["M_mediana"], -e["P_mediana"]))
    vive = [e for e in esito if e["verdetto"] == "VIVA"]
    for e in vive[:3]:
        e["prioritaria"] = True

    livelli = {
        "L1": sum(1 for r in righe if r["P"] >= SOGLIA_P_FORTE),
        "L2": sum(1 for r in righe if r["P"] >= SOGLIA_P_FORTE and r["B"] >= 4),
        "L3": sum(1 for r in righe if r["P"] >= SOGLIA_P_FORTE and r["M"] >= SOGLIA_M_MERCATO
                  and r["costo_eur_12m"] > 0),
    }

    return {
        "partecipanti": len(partecipanti),
        "partecipanti_strato": {s: len(v) for s, v in per_strato.items()},
        "righe": len(righe),
        "livelli": livelli,
        "ipotesi": esito,
    }


# --- Report ---------------------------------------------------------------

def barra(frazione, larghezza=20):
    pieni = int(round(frazione * larghezza))
    return "#" * pieni + "." * (larghezza - pieni)


def stampa(a, righe, avvisi, scartate):
    print()
    print("=" * 78)
    print("  RICERCA TOUCHFULNESS - Scoring Fase 1")
    print("=" * 78)
    strati = "  ".join(f"{s}={a['partecipanti_strato'][s]}" for s in STRATI)
    print(f"\nPartecipanti: {a['partecipanti']}   ({strati})")
    print(f"Righe valide: {a['righe']}   scartate: {len(scartate)}   avvisi: {len(avvisi)}")

    if a["partecipanti"] < N_MINIMO or a["partecipanti_strato"]["S3"] < N_MINIMO_S3:
        print(f"\n  ATTENZIONE: campione sotto il minimo del gate G1 "
              f"(n>={N_MINIMO}, S3>={N_MINIMO_S3}). Tutti i verdetti sono PROVVISORI.")

    print("\n--- Tre livelli (§8.4) ---")
    for chiave, etichetta, criterio in (("L1", "il problema esiste", "P>=6"),
                                        ("L2", "genera comportamento", "P>=6, B>=4"),
                                        ("L3", "genera spesa reale", "P>=6, M>=5, costo>0")):
        n = a["livelli"][chiave]
        print(f"  {chiave}  {etichetta:<22}{criterio:<24}{n:3d}/{a['righe']:<3d} "
              f"{barra(n / max(a['righe'], 1))} {pct(n, a['righe']):5.1f}%")
    print("  Solo L3 interessa come business.")

    print("\n--- Ipotesi (ordinate per M mediana) ---")
    intest = f"  {'H':<5}{'righe':>6}{'pers':>6}{'prev':>7}{'S1':>6}{'S2':>6}{'S3':>6}{'forte':>7}{'merc':>7}{'P~':>6}{'M~':>6}  verdetto"
    print(intest)
    print("  " + "-" * (len(intest) - 2))
    for e in a["ipotesi"]:
        stella = "*" if e.get("prioritaria") else " "
        print(f"  {e['ipotesi']:<5}{e['righe']:>6}{e['persone']:>6}"
              f"{e['prevalenza'] * 100:>6.0f}%"
              f"{e['prevalenza_strato']['S1'] * 100:>5.0f}%"
              f"{e['prevalenza_strato']['S2'] * 100:>5.0f}%"
              f"{e['prevalenza_strato']['S3'] * 100:>5.0f}%"
              f"{e['forte'] * 100:>6.0f}%{e['mercato'] * 100:>6.0f}%"
              f"{e['P_mediana']:>6.1f}{e['M_mediana']:>6.1f}  {stella}{e['verdetto']}"
              + (" [provv.]" if e["provvisorio"] else ""))
    print("\n  * = prioritaria (fra le prime tre per M mediana tra le ipotesi vive)")
    print("  prev = % di partecipanti che riferiscono l'ipotesi; forte = % righe con P>=6;")
    print("  merc = % righe con M>=5; P~ / M~ = mediane.")

    print("\n--- Verdetti e regole ---")
    for e in a["ipotesi"]:
        print(f"  {e['ipotesi']:<5} {e['verdetto']:<22} <- {e['regola']}")

    vive = [e for e in a["ipotesi"] if e["verdetto"] == "VIVA"]
    print("\n--- Gate G1 ---")
    if not vive:
        print("  NESSUNA ipotesi viva. Se il campione e' completo scatta F5:")
        print("  non si abbassano le soglie, si cambia popolazione e si rifa' la Fase 1.")
    else:
        print(f"  {len(vive)} ipotesi vive: {', '.join(e['ipotesi'] for e in vive)}")
        print("  Al gate G2 passa UNA sola ipotesi prioritaria (due solo se condividono")
        print("  lo stesso momento della giornata).")

    if scartate:
        print("\n--- Righe scartate ---")
        for id_riga, motivo in scartate:
            print(f"  {id_riga}: {motivo}")

    if avvisi:
        print("\n--- Avvisi da risolvere ---")
        for a_ in avvisi:
            print(f"  ! {a_}")

    print("\n  Prima di leggere questi numeri, rispondere per iscritto:")
    print('  "cosa vedrei oggi, se avessi torto?"  (§10, regola anti-innamoramento)\n')


def esporta_righe(righe, percorso):
    campi = ["id_riga", "partecipante", "strato", "F", "I", "U", "D", "B", "S", "P", "M",
             "costo_eur_12m", "ipotesi", "problema_testo"]
    with open(percorso, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(campi)
        for r in righe:
            w.writerow([("; ".join(r[c]) if c == "ipotesi" else
                         ("" if r[c] is None else (f"{r[c]:.2f}" if isinstance(r[c], float) else r[c])))
                        for c in campi])


def main():
    ap = argparse.ArgumentParser(description="Scoring della ricerca Touchfulness (Allegato C)")
    ap.add_argument("csv", help="CSV delle interviste (schema in Allegato B)")
    ap.add_argument("--righe", metavar="FILE", help="esporta i punteggi riga per riga in CSV")
    ap.add_argument("--json", action="store_true", help="stampa l'analisi in JSON invece del report")
    args = ap.parse_args()

    try:
        righe, avvisi, scartate = calcola_righe(args.csv)
    except FileNotFoundError:
        sys.exit(f"File non trovato: {args.csv}")

    if not righe:
        sys.exit("Nessuna riga valida: controllare episodio_datato, strato e b_evidenza.")

    analisi = analizza(righe)

    if args.righe:
        esporta_righe(righe, args.righe)

    if args.json:
        print(json.dumps({"analisi": analisi, "avvisi": avvisi,
                          "scartate": [{"id_riga": i, "motivo": m} for i, m in scartate]},
                         ensure_ascii=False, indent=2))
    else:
        stampa(analisi, righe, avvisi, scartate)
        if args.righe:
            print(f"  Punteggi riga per riga scritti in: {args.righe}\n")


if __name__ == "__main__":
    main()
