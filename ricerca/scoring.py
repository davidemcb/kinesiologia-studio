#!/usr/bin/env python3
"""Allegato C - Calcolatore di scoring della ricerca Touchfulness.

Legge il CSV delle interviste (Allegato B), calcola Problem Score e Market Score
riga per riga, costruisce la scala di evidenza E0-E6 per ipotesi e applica i
criteri di conferma (§9) e di falsificazione (§10) del protocollo master.

    python3 ricerca/scoring.py ricerca/dati/interviste.csv
    python3 ricerca/scoring.py ricerca/dati/interviste-esempio.csv --righe /tmp/righe.csv
    python3 ricerca/scoring.py ricerca/dati/interviste.csv --json

Nessuna dipendenza esterna: solo libreria standard.
Versione 2 (protocollo v1.1): scala E0-E6, gruppi A/B/C, controllo di circolarita'.
"""

from __future__ import annotations

import argparse
import csv
import json
import statistics
import sys

# --- Costanti del protocollo (§7.2, §7.3, §8, §9, §10) --------------------
# Modificarle qui equivale a modificare il protocollo: va registrato in §17.

ANCORE_FREQUENZA = [  # (soglia volte/settimana inclusa, F)
    (0.25, 1),   # meno di 1 volta al mese
    (0.75, 3),   # 1-3 volte al mese
    (2.0, 5),    # 1-2 volte a settimana
    (5.0, 7),    # 3-5 volte a settimana
    (7.0, 9),    # quasi ogni giorno
]
F_MASSIMA = 10   # piu' volte al giorno

# §7.3 - scala di evidenza: E -> B derivato. E0/E1 non entrano nello scoring.
E_A_B = {0: None, 1: None, 2: 0.0, 3: 5.0, 4: 8.0, 5: 9.0, 6: 10.0}
E_ETICHETTA = {
    0: "opinione",
    1: "problema ricordato",
    2: "episodio concreto",
    3: "soluzione attuale",
    4: "costo misurabile",
    5: "insoddisfazione + ricerca",
    6: "acquisto recente",
}
E_MINIMA_SCORING = 2

# Compatibilita' con lo schema v1 (b_evidenza) - lo schema corrente usa `evidenza`.
B_LEGACY = {"nulla": 0, "informazioni": 1, "prova_singola": 2,
            "ricorrente_gratis": 3, "spesa_30_200": 4, "spesa_ricorrente": 5}

SOGLIA_P_FORTE = 6.0
SOGLIA_M_MERCATO = 5.0

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
GRUPPI = ("A", "B", "C", "W")   # W = coorte retrospettiva Wellfulness (Allegato G)

# §4.1-ter - la prevalenza di un'ipotesi dentro il gruppo reclutato per quell'ipotesi
# non e' evidenza: quei partecipanti sono esclusi dal calcolo del verdetto.
CIRCOLARI = {
    "H6": {"C"},    # gruppo C = "ha provato e non ha mantenuto" -> H6 e' garantita
    "H16": {"C"},   # idem per il rifiuto di un'altra disciplina
}


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


def livello_evidenza(grezza, id_riga, avvisi):
    """Legge `evidenza` (E0-E6). Ricade sullo schema v1 se il campo manca."""
    testo = (grezza.get("evidenza") or "").strip().upper().lstrip("E")
    if testo:
        if testo.isdigit() and 0 <= int(testo) <= 6:
            return int(testo)
        avvisi.append(f"{id_riga}: evidenza='{testo}' non valida (attesa E0-E6)")
        return None

    legacy = (grezza.get("b_evidenza") or "").strip().lower()
    if legacy in B_LEGACY:
        datato = (grezza.get("episodio_datato") or "").strip().lower() in ("si", "sì", "s", "1")
        e = max(B_LEGACY[legacy], 2) if datato else min(B_LEGACY[legacy], 1)
        avvisi.append(f"{id_riga}: schema v1 (b_evidenza='{legacy}') convertito in E{e} - "
                      f"da ricodificare a mano con la scala E0-E6 (§7.3)")
        return e

    avvisi.append(f"{id_riga}: manca `evidenza`, riga esclusa")
    return None


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
            id_riga = (grezza.get("id_riga") or "").strip()
            if not id_riga:
                continue

            e = livello_evidenza(grezza, id_riga, avvisi)
            if e is None:
                continue
            if e < E_MINIMA_SCORING:
                scartate.append((id_riga, f"E{e} ({E_ETICHETTA[e]}): sotto la soglia di "
                                          f"scoring E{E_MINIMA_SCORING} (§7.3)"))
                continue
            b = E_A_B[e]

            strato = (grezza.get("strato") or "").strip().upper()
            if strato not in STRATI:
                avvisi.append(f"{id_riga}: strato '{strato}' non valido, riga esclusa")
                continue

            gruppo = (grezza.get("gruppo") or "").strip().upper()
            if gruppo and gruppo not in GRUPPI:
                avvisi.append(f"{id_riga}: gruppo '{gruppo}' non valido, trattato come assente")
                gruppo = ""

            f_norm = frequenza_normalizzata(num(grezza.get("freq_sett"), "freq_sett", id_riga, avvisi))
            intensita = num(grezza.get("intensita"), "intensita", id_riga, avvisi, massimo=10)
            urgenza = num(grezza.get("urgenza"), "urgenza", id_riga, avvisi, massimo=10)
            desiderio = num(grezza.get("desiderio"), "desiderio", id_riga, avvisi, massimo=10)
            soddisfazione = num(grezza.get("soddisfazione"), "soddisfazione", id_riga, avvisi, massimo=10)
            costo = num(grezza.get("costo_eur_12m"), "costo_eur_12m", id_riga, avvisi) or 0.0
            tempo = num(grezza.get("tempo_min_sett"), "tempo_min_sett", id_riga, avvisi) or 0.0
            sostituzione = num(grezza.get("costo_sostituzione_eur_anno"),
                               "costo_sostituzione_eur_anno", id_riga, avvisi)

            mancanti = [n for n, v in (("freq_sett", f_norm), ("intensita", intensita),
                                       ("urgenza", urgenza), ("desiderio", desiderio)) if v is None]
            if mancanti:
                avvisi.append(f"{id_riga}: manca {', '.join(mancanti)}, riga esclusa dallo scoring")
                continue

            # Coerenza fra livello di evidenza dichiarato e numeri raccolti (§7.3).
            if e >= 4 and costo <= 0 and tempo <= 0:
                avvisi.append(f"{id_riga}: E{e} richiede un costo o un tempo misurato "
                              f"(§7.3), riga esclusa")
                continue
            if e == 6 and costo <= 0:
                avvisi.append(f"{id_riga}: E6 (acquisto recente) senza importo, riga esclusa")
                continue
            if e <= 2 and costo > 0:
                avvisi.append(f"{id_riga}: E{e} ma costo {costo:g} EUR: probabile E4, da ricodificare")

            # S non si stima quando non esiste una soluzione attuale: B=0 => M=0 (§7.2).
            s = None if soddisfazione is None else 10.0 - soddisfazione
            if s is None and b > 0:
                avvisi.append(f"{id_riga}: E{e} implica una soluzione attuale ma la "
                              f"soddisfazione non e' stata rilevata: M non calcolabile")

            p = media_geometrica([f_norm, intensita, urgenza, desiderio])
            m = 0.0 if s is None else media_geometrica([p, b, s])

            righe.append({
                "id_riga": id_riga,
                "partecipante": (grezza.get("partecipante") or "").strip(),
                "strato": strato, "gruppo": gruppo,
                "E": e, "F": f_norm, "I": intensita, "U": urgenza, "D": desiderio,
                "B": b, "S": s, "P": p, "M": m,
                "costo_eur_12m": costo,
                "costo_sostituzione_eur_anno": sostituzione,
                "ipotesi": elenco(grezza.get("ipotesi")),
                "problema_testo": (grezza.get("problema_testo") or "").strip(),
            })

    return righe, avvisi, scartate


# --- Aggregazione per ipotesi ---------------------------------------------

def analizza(righe):
    partecipanti = {r["partecipante"] for r in righe}
    per_strato = {s: {r["partecipante"] for r in righe if r["strato"] == s} for s in STRATI}
    per_gruppo = {g: {r["partecipante"] for r in righe if r["gruppo"] == g} for g in GRUPPI}

    ipotesi = sorted({h for r in righe for h in r["ipotesi"]},
                     key=lambda h: (len(h), h))
    esito = []

    for h in ipotesi:
        sel = [r for r in righe if h in r["ipotesi"]]
        part_h = {r["partecipante"] for r in sel}
        prev = len(part_h) / len(partecipanti) if partecipanti else 0.0

        prev_s = {s: (len({r["partecipante"] for r in sel if r["strato"] == s}) / len(per_strato[s])
                      if per_strato[s] else 0.0) for s in STRATI}
        prev_g = {g: (len({r["partecipante"] for r in sel if r["gruppo"] == g}) / len(per_gruppo[g])
                      if per_gruppo[g] else 0.0) for g in GRUPPI}

        # §4.1-ter: fuori i gruppi circolari dal calcolo del verdetto.
        circolari = CIRCOLARI.get(h, set())
        base_nc = {p for p in partecipanti
                   if not any(p in per_gruppo[g] for g in circolari)}
        part_h_nc = part_h & base_nc
        prev_nc = len(part_h_nc) / len(base_nc) if base_nc else 0.0
        sel_nc = [r for r in sel if r["partecipante"] in base_nc]

        base = sel_nc or sel
        forte = sum(1 for r in base if r["P"] >= SOGLIA_P_FORTE) / len(base)
        mercato = sum(1 for r in base if r["M"] >= SOGLIA_M_MERCATO) / len(base)

        # Scala di evidenza per ipotesi (§8.5): persone per gradino, cumulativo.
        scala = {liv: len({r["partecipante"] for r in sel if r["E"] >= liv})
                 for liv in range(2, 7)}

        prev_verdetto = prev_nc if circolari else prev
        campione_pieno = len(partecipanti) >= N_MINIMO and len(per_strato["S3"]) >= N_MINIMO_S3

        if (prev_verdetto >= CONF_PREV and prev_s["S3"] >= CONF_PREV_S3
                and forte >= CONF_FORTE and mercato >= CONF_MERCATO):
            verdetto, regola = "VIVA", "§9 criteri 1-4"
        elif prev_s["S1"] >= F2_PREV_S1 and prev_s["S3"] < F2_PREV_S3:
            verdetto, regola = "ARTEFATTO DI CLIENTELA", "F2"
        elif circolari and prev >= CONF_PREV and prev_nc < F1_PREV:
            verdetto, regola = "ARTEFATTO DI RECLUTAMENTO", f"§4.1-ter (vive solo nel gruppo {'/'.join(sorted(circolari))})"
        elif prev_verdetto < F1_PREV:
            verdetto, regola = "MORTA", "F1 (prevalenza < 15%)"
        elif forte < F3_FORTE:
            verdetto, regola = "TIEPIDA", "F3 (problema forte < 30%)"
        elif mercato < F4_MERCATO:
            verdetto, regola = "SENZA MERCATO", "F4 (mercato < 15%)"
        else:
            verdetto, regola = "ZONA GRIGIA", "nessun criterio soddisfatto"

        esito.append({
            "ipotesi": h, "righe": len(sel), "persone": len(part_h),
            "prevalenza": prev, "prevalenza_non_circolare": prev_nc if circolari else None,
            "circolari": sorted(circolari),
            "prevalenza_strato": prev_s, "prevalenza_gruppo": prev_g,
            "forte": forte, "mercato": mercato, "scala_E": scala,
            "P_mediana": mediana([r["P"] for r in sel]),
            "M_mediana": mediana([r["M"] for r in sel]),
            "verdetto": verdetto, "regola": regola,
            "provvisorio": not campione_pieno,
        })

    esito.sort(key=lambda e: (-e["M_mediana"], -e["P_mediana"]))
    for e in [x for x in esito if x["verdetto"] == "VIVA"][:3]:
        e["prioritaria"] = True

    livelli = {
        "L1": sum(1 for r in righe if r["P"] >= SOGLIA_P_FORTE),
        "L2": sum(1 for r in righe if r["P"] >= SOGLIA_P_FORTE and r["B"] >= 4),
        "L3": sum(1 for r in righe if r["P"] >= SOGLIA_P_FORTE and r["M"] >= SOGLIA_M_MERCATO
                  and r["costo_eur_12m"] > 0),
    }
    distribuzione_e = {liv: sum(1 for r in righe if r["E"] == liv) for liv in range(2, 7)}

    return {
        "partecipanti": len(partecipanti),
        "partecipanti_strato": {s: len(v) for s, v in per_strato.items()},
        "partecipanti_gruppo": {g: len(v) for g, v in per_gruppo.items() if v},
        "righe": len(righe),
        "distribuzione_E": distribuzione_e,
        "livelli": livelli,
        "ipotesi": esito,
    }


# --- Report ---------------------------------------------------------------

def barra(frazione, larghezza=20):
    return "#" * int(round(frazione * larghezza)) + "." * (larghezza - int(round(frazione * larghezza)))


def stampa(a, avvisi, scartate):
    n = a["partecipanti"]
    print()
    print("=" * 78)
    print("  RICERCA TOUCHFULNESS - Scoring Fase 1   (protocollo v1.1)")
    print("=" * 78)
    strati = "  ".join(f"{s}={a['partecipanti_strato'][s]}" for s in STRATI)
    gruppi = "  ".join(f"{g}={v}" for g, v in a["partecipanti_gruppo"].items()) or "non registrati"
    print(f"\nPartecipanti: {n}   strati: {strati}   gruppi: {gruppi}")
    print(f"Righe valide: {a['righe']}   scartate (E0-E1): {len(scartate)}   avvisi: {len(avvisi)}")

    if n < N_MINIMO or a["partecipanti_strato"]["S3"] < N_MINIMO_S3:
        print(f"\n  ATTENZIONE: campione sotto il minimo del gate G1 "
              f"(n>={N_MINIMO}, S3>={N_MINIMO_S3}). Tutti i verdetti sono PROVVISORI.")

    print("\n--- Distribuzione dell'evidenza (§7.3) ---")
    for liv in range(2, 7):
        c = a["distribuzione_E"][liv]
        print(f"  E{liv}  {E_ETICHETTA[liv]:<26}{c:3d} righe  {barra(c / max(a['righe'], 1))}")
    print("  E0-E1 non entrano nello scoring: un'affermazione non vale come evidenza.")

    print("\n--- Tre livelli (§8.4) ---")
    for chiave, etichetta, criterio in (("L1", "il problema esiste", "P>=6"),
                                        ("L2", "genera comportamento", "P>=6, B>=4"),
                                        ("L3", "genera spesa reale", "P>=6, M>=5, costo>0")):
        c = a["livelli"][chiave]
        print(f"  {chiave}  {etichetta:<22}{criterio:<24}{c:3d}/{a['righe']:<3d} "
              f"{barra(c / max(a['righe'], 1))} {pct(c, a['righe']):5.1f}%")
    print("  Solo L3 interessa come business.")

    print("\n--- Ipotesi (ordinate per M mediana) ---")
    intest = (f"  {'H':<5}{'righe':>6}{'pers':>6}{'prev':>7}{'S1':>5}{'S2':>5}{'S3':>5}"
              f"{'A':>5}{'B':>5}{'C':>5}{'forte':>7}{'merc':>7}{'P~':>6}{'M~':>6}  verdetto")
    print(intest)
    print("  " + "-" * (len(intest) - 2))
    for e in a["ipotesi"]:
        stella = "*" if e.get("prioritaria") else " "
        pg = e["prevalenza_gruppo"]
        print(f"  {e['ipotesi']:<5}{e['righe']:>6}{e['persone']:>6}"
              f"{e['prevalenza'] * 100:>6.0f}%"
              f"{e['prevalenza_strato']['S1'] * 100:>4.0f}%{e['prevalenza_strato']['S2'] * 100:>4.0f}%"
              f"{e['prevalenza_strato']['S3'] * 100:>4.0f}%"
              f"{pg['A'] * 100:>4.0f}%{pg['B'] * 100:>4.0f}%{pg['C'] * 100:>4.0f}%"
              f"{e['forte'] * 100:>6.0f}%{e['mercato'] * 100:>6.0f}%"
              f"{e['P_mediana']:>6.1f}{e['M_mediana']:>6.1f}  {stella}{e['verdetto']}"
              + (" [provv.]" if e["provvisorio"] else ""))
    print("\n  * = prioritaria (prime tre per M mediana fra le ipotesi vive)")
    print("  prev = % di partecipanti che riferiscono l'ipotesi; forte = % righe con P>=6;")
    print("  merc = % righe con M>=5; P~ / M~ = mediane.")

    circ = [e for e in a["ipotesi"] if e["circolari"]]
    if circ:
        print("\n  Circolarita' (§4.1-ter) - verdetto calcolato SENZA il gruppo di reclutamento:")
        for e in circ:
            print(f"    {e['ipotesi']:<5} gruppo {'/'.join(e['circolari'])} escluso   "
                  f"prev totale {e['prevalenza'] * 100:.0f}%  ->  "
                  f"prev fuori dal gruppo {e['prevalenza_non_circolare'] * 100:.0f}%")

    print("\n--- Scala di evidenza per ipotesi (§8.5) ---")
    mostrate = [e for e in a["ipotesi"] if e["persone"] >= 2]
    for e in mostrate:
        scala = e["scala_E"]
        print(f"\n  {e['ipotesi']}  problema riferito       {e['persone']:>3}/{n}")
        for liv in range(2, 7):
            print(f"       E{liv}+  {E_ETICHETTA[liv]:<26}{scala[liv]:>3}/{n}")
    omesse = len(a["ipotesi"]) - len(mostrate)
    if omesse:
        print(f"\n  ({omesse} ipotesi con una sola persona non mostrate: "
              f"la scala non e' leggibile su n=1)")

    print("\n--- Verdetti ---")
    for e in a["ipotesi"]:
        print(f"  {e['ipotesi']:<5} {e['verdetto']:<26} <- {e['regola']}")

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
        for msg in avvisi:
            print(f"  ! {msg}")

    print("\n  Prima di leggere questi numeri, rispondere per iscritto:")
    print('  "cosa vedrei oggi, se avessi torto?"  (§10, regola anti-innamoramento)\n')


def esporta_righe(righe, percorso):
    campi = ["id_riga", "partecipante", "strato", "gruppo", "E", "F", "I", "U", "D",
             "B", "S", "P", "M", "costo_eur_12m", "costo_sostituzione_eur_anno",
             "ipotesi", "problema_testo"]
    with open(percorso, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(campi)
        for r in righe:
            w.writerow([("; ".join(r[c]) if c == "ipotesi" else
                         ("" if r[c] is None else
                          (f"{r[c]:.2f}" if isinstance(r[c], float) else r[c])))
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
        sys.exit("Nessuna riga valida: controllare `evidenza` (E2-E6), `strato` e i campi 0-10.")

    analisi = analizza(righe)

    if args.righe:
        esporta_righe(righe, args.righe)

    if args.json:
        print(json.dumps({"analisi": analisi, "avvisi": avvisi,
                          "scartate": [{"id_riga": i, "motivo": m} for i, m in scartate]},
                         ensure_ascii=False, indent=2))
    else:
        stampa(analisi, avvisi, scartate)
        if args.righe:
            print(f"  Punteggi riga per riga scritti in: {args.righe}\n")


if __name__ == "__main__":
    main()
