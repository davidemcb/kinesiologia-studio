#!/usr/bin/env python3
"""Allegato G - Autopsia di Wellfulness: imbuto, sopravvivenza, dose, economia.

Legge un CSV con una riga per persona (template: dati/wellfulness-template.csv) e
calcola le quattro analisi dell'Allegato G:

  1. imbuto  contattati -> iscritti -> paganti -> prima pratica -> D7 -> D30 -> D90
  2. curva di sopravvivenza e giorno modale di abbandono
  3. divario fra dose prescritta e dose reale
  4. conversione economica e valore per persona

    python3 ricerca/autopsia.py ricerca/dati/wellfulness.csv
    python3 ricerca/autopsia.py ricerca/dati/wellfulness-esempio.csv --json

Compilare solo i campi che esistono davvero: lo script dichiara cosa manca e quali
conclusioni restano precluse. Un dato ricostruito va marcato in `qualita_dato`.
Nessuna dipendenza esterna.
"""

from __future__ import annotations

import argparse
import csv
import json
import statistics
import sys
from datetime import date, datetime

TAPPE = [7, 30, 90]
# Coorti dell'Allegato G §3
W0, W1, W2 = "W0 mai partiti", "W1 partiti e usciti", "W2 rimasti oltre 30 giorni"


def data(valore):
    testo = (valore or "").strip()
    if not testo:
        return None
    for formato in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(testo, formato).date()
        except ValueError:
            continue
    return None


def numero(valore):
    testo = (valore or "").strip().replace(",", ".").replace("€", "")
    if not testo:
        return None
    try:
        return float(testo)
    except ValueError:
        return None


def leggi(percorso):
    persone, avvisi = [], []
    with open(percorso, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            pid = (r.get("persona") or "").strip()
            if not pid:
                continue
            ingresso = data(r.get("data_ingresso"))
            prima = data(r.get("data_prima_pratica"))
            ultima = data(r.get("data_ultima_pratica"))
            pratiche = numero(r.get("pratiche_totali"))
            prescritte = numero(r.get("pratiche_prescritte_giorno"))
            pagato = numero(r.get("pagato_eur")) or 0.0

            if prima and ultima and ultima < prima:
                avvisi.append(f"{pid}: ultima pratica precedente alla prima, date ignorate")
                prima = ultima = None

            giorni = (ultima - prima).days + 1 if (prima and ultima) else None

            persone.append({
                "persona": pid,
                "canale": (r.get("canale") or "").strip(),
                "ingresso": ingresso, "prima": prima, "ultima": ultima,
                "giorni_sopravvissuti": giorni,
                "pratiche_totali": pratiche,
                "prescritte_giorno": prescritte,
                "pagato_eur": pagato,
                "rinnovo": (r.get("rinnovo") or "").strip().lower() in ("si", "sì", "1", "true"),
                "referral": numero(r.get("referral")) or 0.0,
                "tutor": (r.get("interazioni_tutor") or "").strip(),
                "qualita_dato": (r.get("qualita_dato") or "").strip().lower(),
                "motivo_uscita": (r.get("motivo_uscita") or "").strip(),
            })
    return persone, avvisi


def analizza(persone):
    n0 = len(persone)
    partiti = [p for p in persone if p["prima"]]
    misurabili = [p for p in partiti if p["giorni_sopravvissuti"] is not None]

    attivi = {t: sum(1 for p in misurabili if p["giorni_sopravvissuti"] >= t) for t in TAPPE}
    paganti = [p for p in persone if p["pagato_eur"] > 0]

    coorti = {
        W0: [p for p in persone if not p["prima"]],
        W1: [p for p in misurabili if p["giorni_sopravvissuti"] < 30],
        W2: [p for p in misurabili if p["giorni_sopravvissuti"] >= 30],
    }

    # Giorno modale di abbandono, in fasce (Allegato G §4.2)
    fasce = [(0, 1, "0-1  promessa o ingresso"), (2, 4, "2-4  DOSE"),
             (5, 10, "5-10 decadimento della novita'"), (11, 21, "11-21 valore vs costo di tempo"),
             (22, 10**6, "22+  uscita tardiva")]
    istogramma = {et: sum(1 for p in coorti[W1] if a <= p["giorni_sopravvissuti"] <= b)
                  for a, b, et in fasce}

    # Divario di dose
    reali = [p["pratiche_totali"] / p["giorni_sopravvissuti"]
             for p in misurabili
             if p["pratiche_totali"] is not None and p["giorni_sopravvissuti"] > 0]
    prescritte = [p["prescritte_giorno"] for p in persone if p["prescritte_giorno"]]
    dose_reale = statistics.median(reali) if reali else None
    dose_prescritta = statistics.median(prescritte) if prescritte else None

    # Dose reale di chi e' rimasto: la domanda di §4.3
    reali_w2 = [p["pratiche_totali"] / p["giorni_sopravvissuti"]
                for p in coorti[W2]
                if p["pratiche_totali"] is not None and p["giorni_sopravvissuti"] > 0]

    ricavo = sum(p["pagato_eur"] for p in persone)
    ricostruiti = sum(1 for p in persone if p["qualita_dato"].startswith("ricostr"))

    return {
        "n0": n0, "n1": len(partiti), "misurabili": len(misurabili),
        "attivi": attivi, "coorti": {k: len(v) for k, v in coorti.items()},
        "istogramma_uscita": istogramma,
        "mediana_giorni_W1": statistics.median([p["giorni_sopravvissuti"] for p in coorti[W1]])
        if coorti[W1] else None,
        "dose_reale_mediana": dose_reale,
        "dose_prescritta_mediana": dose_prescritta,
        "dose_reale_W2": statistics.median(reali_w2) if reali_w2 else None,
        "paganti": len(paganti), "ricavo_totale": ricavo,
        "ricavo_per_entrato": ricavo / n0 if n0 else 0.0,
        "rinnovi": sum(1 for p in paganti if p["rinnovo"]),
        "referral": sum(p["referral"] for p in persone),
        "dati_ricostruiti": ricostruiti,
        "motivi_uscita": sorted({p["motivo_uscita"] for p in coorti[W1] if p["motivo_uscita"]}),
    }


def pct(a, b):
    return 0.0 if not b else 100.0 * a / b


def barra(frazione, larghezza=24):
    n = int(round(max(0.0, min(1.0, frazione)) * larghezza))
    return "#" * n + "." * (larghezza - n)


def stampa(a, avvisi):
    n0, n1 = a["n0"], a["n1"]
    print("\n" + "=" * 76)
    print("  AUTOPSIA WELLFULNESS - imbuto, sopravvivenza, dose, economia")
    print("=" * 76)

    print("\n--- 1. Imbuto ---")
    tappe = [("N0  entrati", n0, n0), ("N1  hanno iniziato", n1, n0)]
    precedente = n1
    for t in TAPPE:
        tappe.append((f"N{t}  attivi a {t} giorni", a["attivi"][t], precedente))
        precedente = a["attivi"][t]
    for etichetta, valore, base in tappe:
        print(f"  {etichetta:<26}{valore:>5}  {barra(valore / max(n0, 1))} "
              f"{pct(valore, n0):5.1f}% di N0   ({pct(valore, base):5.1f}% del passo prima)")

    passi = [(tappe[i][0], pct(tappe[i][1], tappe[i - 1][1])) for i in range(1, len(tappe))]
    if passi:
        peggiore = min(passi, key=lambda x: x[1])
        print(f"\n  Gradino piu' ripido: {peggiore[0].strip()} "
              f"({peggiore[1]:.1f}% sopravvive al passaggio)")
        print("  E' li' che si rompeva il sistema: le spiegazioni riguardano quel passaggio,")
        print("  non il prodotto in generale.")
        print("  Nota: i passaggi coprono finestre di ampiezza diversa (1 giorno, 6, 23, 60):")
        print("  un calo su una finestra lunga non e' confrontabile con uno su una corta.")

    print("\n--- 2. Coorti (§3) ---")
    for nome, quanti in a["coorti"].items():
        print(f"  {nome:<32}{quanti:>4}  {pct(quanti, n0):5.1f}%")
    if a["coorti"][W0] > a["coorti"][W1]:
        print("  -> W0 > W1: problema di PROMESSA/ingresso, non di prodotto.")
    elif a["coorti"][W1] > a["coorti"][W2] * 3:
        print("  -> W1 domina: problema di DOSE, attrito o effetto percepito.")

    print("\n--- 3. Giorno modale di abbandono (§4.2) ---")
    if a["mediana_giorni_W1"] is not None:
        print(f"  Mediana dei giorni sopravvissuti in W1: {a['mediana_giorni_W1']:.0f}\n")
    for etichetta, quanti in a["istogramma_uscita"].items():
        print(f"  giorni {etichetta:<34}{quanti:>4}  {barra(quanti / max(a['coorti'][W1], 1))}")
    if a["coorti"][W1]:
        picco = max(a["istogramma_uscita"].items(), key=lambda x: x[1])
        print(f"\n  Lettura: picco su '{picco[0].strip()}'.")
        print("  Le cinque letture sono mutuamente esclusive: vedi Allegato G §4.2.")

    print("\n--- 4. Divario di dose (§4.3) ---")
    dp, dr = a["dose_prescritta_mediana"], a["dose_reale_mediana"]
    if dp is None or dr is None:
        print("  Dato insufficiente: servono `pratiche_totali` e `pratiche_prescritte_giorno`.")
        print("  Senza questi, H-W1 (dose) NON e' decidibile.")
    else:
        print(f"  Prescritte  {dp:.2f} pratiche/giorno")
        print(f"  Reali       {dr:.2f} pratiche/giorno   -> divario {dp - dr:+.2f}")
        if a["dose_reale_W2"] is not None:
            print(f"  Reali fra chi e' RIMASTO (W2): {a['dose_reale_W2']:.2f} pratiche/giorno")
            if a["dose_reale_W2"] < dp * 0.6:
                print("  -> anche chi e' rimasto faceva molto meno del prescritto:")
                print("     la dose reale del prodotto era gia' un'altra, e nessuno l'aveva scritto.")

    print("\n--- 5. Economia ---")
    print(f"  Paganti            {a['paganti']:>5}  ({pct(a['paganti'], n0):.1f}% di N0)")
    print(f"  Ricavo totale      {a['ricavo_totale']:>8.2f} EUR")
    print(f"  Ricavo per entrato {a['ricavo_per_entrato']:>8.2f} EUR")
    print(f"  Rinnovi            {a['rinnovi']:>5}")
    print(f"  Referral generati  {a['referral']:>5.0f}")
    print("\n  Il ricavo per entrato e' il numero che entra nel calcolo di sostenibilita'")
    print("  del protocollo (§14.4): fabbisogno mensile / ricavo per entrato = persone da")
    print("  esporre ogni mese.")

    if a["motivi_uscita"]:
        print("\n--- 6. Motivi di uscita registrati ---")
        for m in a["motivi_uscita"]:
            print(f"  - {m}")
        print("  Attenzione: 'non avevo tempo' e' una risposta cortese, non una causa.")
        print("  Va sostituita con la domanda comportamentale (Allegato G §5.2).")

    if a["dati_ricostruiti"]:
        print(f"\n  {a['dati_ricostruiti']} righe marcate come RICOSTRUITE: dichiararlo in ogni")
        print("  conclusione. Un dato ricostruito e dichiarato vale; spacciato per misurato, no.")

    if avvisi:
        print("\n--- Avvisi ---")
        for msg in avvisi:
            print(f"  ! {msg}")

    print("\n  Prima di leggere questi numeri, rileggere la frase scritta prima di aprirli:")
    print('  "cosa vedrei, se il problema fosse il metodo e non le persone?"\n')


def main():
    ap = argparse.ArgumentParser(description="Autopsia Wellfulness (Allegato G)")
    ap.add_argument("csv", help="CSV storico, una riga per persona")
    ap.add_argument("--json", action="store_true", help="output JSON invece del report")
    args = ap.parse_args()

    try:
        persone, avvisi = leggi(args.csv)
    except FileNotFoundError:
        sys.exit(f"File non trovato: {args.csv}")
    if not persone:
        sys.exit("Nessuna riga leggibile: serve almeno la colonna `persona`.")

    a = analizza(persone)
    if args.json:
        print(json.dumps({"analisi": a, "avvisi": avvisi}, ensure_ascii=False, indent=2, default=str))
    else:
        stampa(a, avvisi)


if __name__ == "__main__":
    main()
