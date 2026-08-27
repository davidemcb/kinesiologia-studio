#!/usr/bin/env python3
"""Allegato G - Mining delle conversazioni: pratica -> effetto -> trasferimento.

Legge un export WhatsApp e classifica ogni messaggio sostanziale dei partecipanti
lungo quattro assi indipendenti:

  PRATICA        di quale pratica parla (piedi, mani, respiro, linfatico...)
  CAMBIO STATO   descrive un prima/dopo? (arrivata tesa -> pratica -> calma)
  TRASFERIMENTO  usa la pratica FUORI dal contesto guidato (macchina, lavoro...)
  INTERIORIZZ.   la richiama da sola, mentalmente, senza collegarsi

e produce la matrice pratica x segnali: quale pezzo del metodo genera piu'
descrizioni spontanee di cambiamento e piu' uso nella vita reale.

    python3 ricerca/chat_mining.py "_chat.txt" --erogatore "Nome Cognome"
    python3 ricerca/chat_mining.py "_chat.txt" --erogatore "..." --json
    python3 ricerca/chat_mining.py "_chat.txt" --erogatore "..." --frasi 5

LIMITI DA DICHIARARE SEMPRE
- Classificazione per parole chiave: indica proporzioni, non misura. Le categorie
  si sovrappongono (un messaggio puo' citare piedi E respiro).
- Il corpus e' fatto da chi scrive: sovra-rappresenta i piu' coinvolti.
- Nessuna causalita': l'effetto descritto e' pratica+gruppo+guida+aspettativa insieme.
PRIVACY: non stampa mai nomi. Con --frasi stampa frammenti SENZA autore: vanno
riletti a mano prima di qualunque uso esterno.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

RIGA = re.compile(r"^\[(\d{1,2}/\d{1,2}/\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?)\] ([^:]{1,80}?): (.*)$")

SISTEMA = ("Hai aggiunto", "Hai rimosso", "ha usato il link", "Hai creato", "Hai cambiato",
           "Hai eliminato", "Hai fissato", "Hai disattivato", "Hai attivato", "Hai modificato",
           "I messaggi e le chiamate", "è uscito", "sei uscito", "ha cambiato il", "è entrato",
           "ti ha aggiunto", "Questo messaggio è stato eliminato", "Chat vocale",
           "ha abbandonato", "immagine omessa", "video omesso", "audio omesso",
           "sticker omesso", "GIF esclusa", "documento omesso")

PRATICHE = {
    "piedi": ["piedi", "piede", "pianta del", "dita dei"],
    "mani": ["mani", "mano", "palmo", "polso", "dita della"],
    "viso e testa": ["viso", "volto", "fronte", "testa con le", "cuoio", "mandibola", "occhi con"],
    "pancia e diaframma": ["pancia", "diaframma", "addome", "ventre"],
    "respiro": ["respir", "espir", "inspir"],
    "meditazione": ["meditazion", "meditativ", "12 porte", "meditazione funzionale"],
    "linfatico": ["linfatic", "linfa", "stazioni linfatiche", "drenagg"],
    "automassaggio": ["massagg", "automassagg", "frizion", "strofinare", "do in", "do-in"],
    "movimento": ["camminata", "camminare", "movimento", "rotazione", "allungamento", "stretching"],
}

CAMBIO_STATO = ["mi ha portato", "mi sono sentita", "mi sono sentito", "mi ha dato",
                "mi ha fatto", "mi ha aiutat", "mi ha permesso", "sono riuscita a", "sono riuscito a",
                "mi sento più", "mi sono calmat", "mi sono tranquillizzat", "si è sciolt",
                "ha sciolto", "rilasciat", "alleggerim", "mi ha rilassat", "centratura", "centrat",
                "sono arrivata", "sono arrivato", "e ora mi", "adesso mi sento", "stato d'animo",
                "cambiato il mio stato", "prima della pratica ero", "dopo la pratica"]

TRASFERIMENTO = ["in macchina", "mentre guidav", "al lavoro", "in ufficio", "dal dentista",
                 "dal medico", "in fila", "al supermercato", "sul treno", "in autobus",
                 "nella vita di tutti i giorni", "nel quotidiano", "vita quotidiana",
                 "durante la giornata", "fuori dalla pratica", "sto iniziando a portare",
                 "porto la pratica", "portare la pratica", "l'ho usato", "l'ho usata",
                 "mi è servito", "mi è servita", "situazioni stressogene", "prima di una riunione",
                 "mentre lavoravo", "mentre facevo"]

INTERIORIZZAZIONE = ["anche quando non riesco", "anche quando non posso", "anche se non",
                     "mentalmente", "senza collegarmi", "a modo mio", "da sola", "da solo",
                     "in differita", "con la registrazione", "registrazione della pratica",
                     "richiamo l'attenzione", "mi arriva la connessione", "per conto mio"]


def pulisci(riga):
    return riga.rstrip("\n").replace("‎", "").replace(" ", " ").replace("\xa0", " ")


def parse(percorso):
    messaggi, corrente = [], None
    with open(percorso, encoding="utf-8", errors="ignore") as f:
        for grezza in f:
            riga = pulisci(grezza)
            m = RIGA.match(riga)
            if m:
                if corrente:
                    messaggi.append(corrente)
                dt = None
                for formato in ("%d/%m/%y %H:%M:%S", "%d/%m/%y %H:%M",
                                "%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M"):
                    try:
                        dt = datetime.strptime(f"{m.group(1)} {m.group(2)}", formato)
                        break
                    except ValueError:
                        continue
                if dt is None:
                    continue
                corrente = {"dt": dt, "autore": m.group(3).strip(), "testo": m.group(4)}
            elif corrente:
                corrente["testo"] += "\n" + riga
    if corrente:
        messaggi.append(corrente)
    return messaggi


def sistema(testo):
    return any(s in testo[:80] for s in SISTEMA)


def trova(testo, chiavi):
    return [k for k in chiavi if k in testo]


def analizza(messaggi, erogatore, lunghezza_minima):
    contenuto = [m for m in messaggi if not sistema(m["testo"])]
    uscite = [m for m in messaggi if "ha abbandonato" in m["testo"][:80]]
    corpus = [m for m in contenuto
              if m["autore"] != erogatore and "zoom.us" not in m["testo"].lower()
              and "http" not in m["testo"].lower() and len(m["testo"]) >= lunghezza_minima]

    righe = []
    for m in corpus:
        t = m["testo"].lower()
        pratiche = [p for p, kw in PRATICHE.items() if any(k in t for k in kw)]
        righe.append({
            "autore": m["autore"], "dt": m["dt"], "testo": m["testo"],
            "pratiche": pratiche,
            "cambio": bool(trova(t, CAMBIO_STATO)),
            "trasferimento": bool(trova(t, TRASFERIMENTO)),
            "interiorizzazione": bool(trova(t, INTERIORIZZAZIONE)),
        })

    matrice = {}
    for pratica in PRATICHE:
        sel = [r for r in righe if pratica in r["pratiche"]]
        if not sel:
            continue
        persone = {r["autore"] for r in sel}
        matrice[pratica] = {
            "messaggi": len(sel),
            "persone": len(persone),
            "cambio_stato": sum(r["cambio"] for r in sel),
            "trasferimento": sum(r["trasferimento"] for r in sel),
            "quota_cambio": round(100 * sum(r["cambio"] for r in sel) / len(sel), 1),
            "quota_trasferimento": round(100 * sum(r["trasferimento"] for r in sel) / len(sel), 1),
        }

    pers_trasf = {r["autore"] for r in righe if r["trasferimento"]}
    pers_inter = {r["autore"] for r in righe if r["interiorizzazione"]}
    pers_cambio = {r["autore"] for r in righe if r["cambio"]}
    pers_tot = {r["autore"] for r in righe}

    uscite_mese = Counter(m["dt"].strftime("%Y-%m") for m in uscite)

    return {
        "messaggi_contenuto": len(contenuto),
        "corpus_sostanziale": len(righe),
        "persone_nel_corpus": len(pers_tot),
        "matrice": dict(sorted(matrice.items(), key=lambda x: -x[1]["messaggi"])),
        "segnali_globali": {
            "cambio_stato": {"messaggi": sum(r["cambio"] for r in righe), "persone": len(pers_cambio)},
            "trasferimento": {"messaggi": sum(r["trasferimento"] for r in righe), "persone": len(pers_trasf)},
            "interiorizzazione": {"messaggi": sum(r["interiorizzazione"] for r in righe),
                                  "persone": len(pers_inter)},
            "trasferimento_e_interiorizzazione": len(pers_trasf & pers_inter),
        },
        "uscite_esplicite": {"totale": len(uscite), "per_mese": dict(sorted(uscite_mese.items()))},
        "_righe": righe,
    }


def barra(frazione, larghezza=20):
    n = int(round(max(0.0, min(1.0, frazione)) * larghezza))
    return "#" * n + "." * (larghezza - n)


def stampa(a, frasi):
    print("\n" + "=" * 78)
    print("  MINING DELLE CONVERSAZIONI - pratica -> effetto -> trasferimento")
    print("=" * 78)
    print(f"\nMessaggi di contenuto: {a['messaggi_contenuto']}"
          f"   corpus sostanziale analizzato: {a['corpus_sostanziale']}"
          f"   persone: {a['persone_nel_corpus']}")

    print("\n--- Matrice pratica x segnali ---")
    print(f"  {'pratica':<20}{'msg':>5}{'pers':>6}{'cambio':>8}{'trasf':>7}{'%cambio':>9}{'%trasf':>8}")
    for pratica, v in a["matrice"].items():
        print(f"  {pratica:<20}{v['messaggi']:>5}{v['persone']:>6}"
              f"{v['cambio_stato']:>8}{v['trasferimento']:>7}"
              f"{v['quota_cambio']:>8.1f}%{v['quota_trasferimento']:>7.1f}%")
    print("  Le categorie si sovrappongono: un messaggio puo' citare piu' pratiche.")

    g = a["segnali_globali"]
    print("\n--- Segnali globali (tutto il corpus) ---")
    for nome, chiave in [("descrive un cambio di stato", "cambio_stato"),
                         ("trasferimento nella vita reale", "trasferimento"),
                         ("interiorizzazione (pratica da soli)", "interiorizzazione")]:
        v = g[chiave]
        print(f"  {nome:<38}{v['messaggi']:>5} msg   {v['persone']:>3} persone")
    print(f"  {'persone con trasferimento E interiorizzazione':<44}{g['trasferimento_e_interiorizzazione']:>3}")

    u = a["uscite_esplicite"]
    print(f"\n--- Uscite esplicite dal gruppo: {u['totale']} ---")
    massimo = max(u["per_mese"].values() or [1])
    for k, v in u["per_mese"].items():
        print(f"  {k}  {v:3d}  {barra(v / massimo)}")

    if frasi:
        print(f"\n--- Frammenti con trasferimento (max {frasi}, SENZA autore - rileggere a mano) ---")
        stampati = 0
        for r in a["_righe"]:
            if r["trasferimento"] and r["cambio"]:
                testo = " ".join(r["testo"].split())[:220]
                print(f"  [{r['dt'].date()}] {testo}")
                stampati += 1
                if stampati >= frasi:
                    break

    print("\n  LIMITI: keyword matching, categorie sovrapposte, corpus fatto da chi scrive.")
    print("  Nessuna causalita': l'effetto descritto e' pratica+gruppo+guida+aspettativa insieme.\n")


def main():
    ap = argparse.ArgumentParser(description="Mining delle conversazioni (Allegato G)")
    ap.add_argument("chat", help="file _chat.txt esportato da WhatsApp")
    ap.add_argument("--erogatore", default="", help="nome esatto di chi eroga (escluso dal corpus)")
    ap.add_argument("--min", type=int, default=60, help="lunghezza minima del messaggio (default 60)")
    ap.add_argument("--frasi", type=int, default=0, help="stampa N frammenti anonimi di trasferimento")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    try:
        messaggi = parse(args.chat)
    except FileNotFoundError:
        sys.exit(f"File non trovato: {args.chat}")
    if not messaggi:
        sys.exit("Nessun messaggio riconosciuto.")

    a = analizza(messaggi, args.erogatore, args.min)
    a.pop("_righe") if args.json else None
    if args.json:
        print(json.dumps(a, ensure_ascii=False, indent=2, default=str))
    else:
        stampa(a, args.frasi)


if __name__ == "__main__":
    main()
