#!/usr/bin/env python3
"""Allegato G - Autopsia di un gruppo WhatsApp (export .txt di WhatsApp).

Ricostruisce dal solo export di chat: sopravvivenza reale dei partecipanti,
coorti di ingresso, canali di acquisizione, cadenza dell'offerta, concentrazione
delle conversazioni, linguaggio spontaneo per tema, attrito tecnico e segnali
economici.

    python3 ricerca/whatsapp_autopsia.py "_chat.txt" --erogatore "Nome Cognome"
    python3 ricerca/whatsapp_autopsia.py "_chat.txt" --erogatore "..." --json

LIMITE DA DICHIARARE SEMPRE: questo misura l'attivita' nel gruppo, NON la pratica.
Chi pratica ogni giorno senza mai scrivere risulta inattivo. Il bias e' noto e va
in una sola direzione: sottostima l'aderenza reale. Per misurarla servono i report
di presenza (Zoom, registro presenze), non la chat.

PRIVACY: lo script non stampa mai nomi. I partecipanti diventano P01, P02...
La mappa nome -> codice si scrive solo se si passa --mappa FILE, e quel file
non va mai versionato.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import statistics
import sys
from collections import Counter, defaultdict
from datetime import datetime

RIGA = re.compile(r"^\[(\d{1,2}/\d{1,2}/\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?)\] ([^:]{1,80}?): (.*)$")

SISTEMA = ("Hai aggiunto", "Hai rimosso", "ha usato il link", "Hai creato", "Hai cambiato",
           "Hai eliminato", "Hai fissato", "Hai disattivato", "Hai attivato", "Hai modificato",
           "I messaggi e le chiamate", "è uscito", "sei uscito", "ha cambiato il", "è entrato",
           "ti ha aggiunto", "Questo messaggio è stato eliminato", "Chat vocale")

TEMI = {
    "corpo e sensazioni fisiche": ["corpo", "sentire il", "percep", "sensazion", "muscol",
                                   "respir", "diaframma", "piedi", "schiena", "spalle", "collo",
                                   "pancia", "tensione", "contratt", "calore", "formicol",
                                   "leggerezz", "radica"],
    "presenza e consapevolezza": ["consapevol", "presenza", "present", "attenzione", "ascolto",
                                  "accorg", "centrat"],
    "gruppo e relazione": ["gruppo", "insieme", "condivid", "condivision", "compagn",
                           "sostegno", "famiglia"],
    "mente e pensieri": ["pensier", "mente", "testa", "rimugin", "chiacchier"],
    "emozioni": ["emozion", "commoss", "pianto", "lacrim", "rabbia", "paura", "gioia",
                 "tristezz", "amore", "cuore"],
    "dolore": ["dolor", "male a", "mal di", "fa male", "sciatic", "cervical", "lombar"],
    "sonno": ["dormi", "sonno", "addorment", "insonnia", "riposat", "svegli"],
    "stress": ["stress", "ansia", "ansios", "agitat", "nervos", "preoccupa"],
}

ECONOMICI = ["euro", "€", "pagamento", "bonifico", "quota", "prezzo", "abbonamento",
             "paypal", "satispay", "fattura", "costo del", "iscrizione a pagamento", "acquist"]

ATTRITO = ["non riesco ad entrare", "non riesco a entrare", "non riesco a collegarmi",
           "non riesco più ad aprire", "non riesco ad aprire", "non si apre",
           "non funziona il link", "non mi fa entrare", "non riesco a connetter"]

CANALI = {
    "rete professionale": ["tango", "accademia", "olistico", "reiki", "maestra", "nutrizionista",
                           "yoga", "counselor", "naturopat"],
    "paziente dello studio": ["cliente", "kinesiologia studio", "paziente"],
    "edizione precedente": ["challenge", "edizione", "prima edizione", "seconda edizione"],
    "referral da un membro": ["amica", "amico", "moglie", "marito", "sorella", "mamma"],
}


def pulisci(riga):
    return riga.rstrip("\n").replace("‎", "").replace(" ", " ").replace("\xa0", " ")


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
    return [m for m in messaggi if not any(s in m["testo"][:70] for s in SISTEMA)]


def canale(nome):
    n = nome.lower()
    for etichetta, chiavi in CANALI.items():
        if any(k in n for k in chiavi):
            return etichetta
    return "nessun tag nel nome"


def analizza(messaggi, erogatore, parola_offerta):
    if not messaggi:
        return None
    inizio, fine = messaggi[0]["dt"].date(), messaggi[-1]["dt"].date()

    offerta = [m for m in messaggi if parola_offerta in m["testo"].lower()]
    per_mese_offerta = Counter(m["dt"].strftime("%Y-%m") for m in offerta)

    persone = defaultdict(lambda: {"giorni": set(), "n": 0, "primo": None, "ultimo": None})
    per_mese_attivi, per_mese_vol, per_mese_erog = defaultdict(set), Counter(), Counter()
    for m in messaggi:
        p, d, k = persone[m["autore"]], m["dt"].date(), m["dt"].strftime("%Y-%m")
        p["giorni"].add(d)
        p["n"] += 1
        p["primo"] = p["primo"] or d
        p["ultimo"] = d
        per_mese_vol[k] += 1
        if m["autore"] == erogatore:
            per_mese_erog[k] += 1
        else:
            per_mese_attivi[k].add(m["autore"])

    altri = {k: v for k, v in persone.items() if k != erogatore}
    codici = {nome: f"P{i:02d}" for i, nome in enumerate(sorted(altri), 1)}

    giorni_attivi = sorted(len(v["giorni"]) for v in altri.values())
    densita = [len(v["giorni"]) / max((v["ultimo"] - v["primo"]).days + 1, 1) for v in altri.values()]

    per_canale = defaultdict(list)
    for nome, v in altri.items():
        per_canale[canale(nome)].append(len(v["giorni"]))

    coorti = defaultdict(list)
    for v in altri.values():
        coorti[v["primo"].strftime("%Y-%m")].append(len(v["giorni"]))

    sostanziali = [m for m in messaggi
                   if m["autore"] != erogatore and parola_offerta not in m["testo"].lower()
                   and len(m["testo"]) > 60]
    temi_msg, temi_persone = Counter(), defaultdict(set)
    for m in sostanziali:
        t = m["testo"].lower()
        for tema, chiavi in TEMI.items():
            if any(k in t for k in chiavi):
                temi_msg[tema] += 1
                temi_persone[tema].add(m["autore"])

    def occorrenze(chiavi):
        return [m for m in messaggi
                if any(k in m["testo"].lower() for k in chiavi)
                and parola_offerta not in m["testo"].lower()]

    conteggio = Counter(v["n"] for v in persone.values())
    totale = sum(v["n"] for v in persone.values())
    ordinati = sorted((v["n"] for v in persone.values()), reverse=True)

    return {
        "periodo": {"inizio": str(inizio), "fine": str(fine), "giorni": (fine - inizio).days},
        "messaggi": len(messaggi), "sostanziali": len(sostanziali),
        "persone": len(altri),
        "offerta": {"totale": len(offerta), "per_mese": dict(sorted(per_mese_offerta.items()))},
        "attivi_per_mese": {k: len(v) for k, v in sorted(per_mese_attivi.items())},
        "volume_per_mese": dict(sorted(per_mese_vol.items())),
        "quota_erogatore_per_mese": {k: round(100 * per_mese_erog[k] / max(per_mese_vol[k], 1))
                                     for k in sorted(per_mese_vol)},
        "giorni_attivi": {
            "mediana": statistics.median(giorni_attivi), "media": round(statistics.mean(giorni_attivi), 1),
            "max": max(giorni_attivi),
            "distribuzione": {et: sum(1 for x in giorni_attivi if a <= x <= b)
                              for a, b, et in [(1, 1, "1 giorno"), (2, 5, "2-5"), (6, 20, "6-20"),
                                               (21, 60, "21-60"), (61, 150, "61-150"),
                                               (151, 10**6, "150+")]},
        },
        "densita_mediana": round(statistics.median(densita), 3),
        "silenzio": {et: sum(1 for v in altri.values() if a <= (fine - v["ultimo"]).days <= b)
                     for a, b, et in [(0, 30, "attivi ultimi 30 gg"), (31, 90, "silenti 31-90"),
                                      (91, 180, "silenti 91-180"), (181, 10**6, "silenti 180+")]},
        "canali": {k: {"n": len(v), "mediana_giorni_attivi": statistics.median(v)}
                   for k, v in sorted(per_canale.items(), key=lambda x: -statistics.median(x[1]))},
        "coorti": {k: {"entrati": len(v), "mediana_giorni_attivi": statistics.median(v)}
                   for k, v in sorted(coorti.items())},
        "temi": {t: {"messaggi": temi_msg[t], "quota": round(100 * temi_msg[t] / max(len(sostanziali), 1), 1),
                     "persone": len(temi_persone[t])}
                 for t, _ in temi_msg.most_common()},
        "concentrazione": {
            "erogatore_quota": round(100 * persone[erogatore]["n"] / max(totale, 1), 1)
            if erogatore in persone else None,
            **{f"top_{k}": round(100 * sum(ordinati[:k]) / max(totale, 1), 1) for k in (3, 5, 10, 20)},
        },
        "attrito_tecnico": len(occorrenze(ATTRITO)),
        "segnali_economici": len(occorrenze(ECONOMICI)),
        "un_solo_messaggio": conteggio[1],
        "_codici": codici,
    }


def barra(frazione, larghezza=30):
    n = int(round(max(0.0, min(1.0, frazione)) * larghezza))
    return "#" * n + "." * (larghezza - n)


def stampa(a):
    p = a["periodo"]
    print("\n" + "=" * 78)
    print("  AUTOPSIA DI UN GRUPPO - dall'export di chat")
    print("=" * 78)
    print(f"\nPeriodo: {p['inizio']} -> {p['fine']}  ({p['giorni']} giorni)")
    print(f"Messaggi: {a['messaggi']}  di cui sostanziali dei partecipanti: {a['sostanziali']}")
    print(f"Persone che hanno scritto almeno una volta: {a['persone']}")

    print("\n--- 1. Cadenza dell'offerta (quante volte e' stata proposta la pratica) ---")
    massimo = max(a["offerta"]["per_mese"].values() or [1])
    for k, v in a["offerta"]["per_mese"].items():
        print(f"  {k}  {v:4d}  {barra(v / massimo)}")
    print(f"  totale: {a['offerta']['totale']}")

    print("\n--- 2. Partecipanti attivi per mese (erogatore escluso) e sua quota di parola ---")
    mx = max(a["attivi_per_mese"].values() or [1])
    for k in a["attivi_per_mese"]:
        att, quota = a["attivi_per_mese"][k], a["quota_erogatore_per_mese"].get(k, 0)
        segnale = "  <-- parla quasi solo l'erogatore" if quota >= 60 else ""
        print(f"  {k}  attivi {att:3d}  msg {a['volume_per_mese'][k]:4d}  "
              f"erogatore {quota:3d}%  {barra(att / mx, 20)}{segnale}")

    g = a["giorni_attivi"]
    print(f"\n--- 3. Giorni realmente attivi per persona ---")
    print(f"  mediana {g['mediana']}   media {g['media']}   max {g['max']}")
    tot = sum(g["distribuzione"].values())
    for et, n in g["distribuzione"].items():
        print(f"  {et:<10}{n:3d}  {100 * n / max(tot, 1):5.1f}%  {barra(n / max(tot, 1), 20)}")
    print(f"\n  Densita' mediana: {a['densita_mediana']} -> la persona mediana scrive nel "
          f"{a['densita_mediana'] * 100:.0f}% dei giorni in cui risulta 'presente'.")
    print("  La differenza fra 'presente a lungo' e 'attivo' e' tutta qui.")

    print("\n--- 4. Stato attuale ---")
    for et, n in a["silenzio"].items():
        print(f"  {et:<22}{n:3d}  {100 * n / max(a['persone'], 1):5.1f}%")

    print("\n--- 5. Canale di ingresso (dai tag nei nomi) ---")
    for k, v in a["canali"].items():
        print(f"  {k:<26}n={v['n']:3d}   giorni attivi mediani: {v['mediana_giorni_attivi']:5.1f}")

    print("\n--- 6. Coorti di ingresso ---")
    for k, v in a["coorti"].items():
        print(f"  {k}  entrati {v['entrati']:3d}   giorni attivi mediani {v['mediana_giorni_attivi']:5.1f}")

    print("\n--- 7. Di cosa parlano davvero i partecipanti ---")
    print(f"  {'tema':<30}{'messaggi':>9}{'%':>7}{'persone':>9}")
    for t, v in a["temi"].items():
        print(f"  {t:<30}{v['messaggi']:>9}{v['quota']:>6.1f}%{v['persone']:>9}")
    print("  E' il linguaggio spontaneo: nessuno ha chiesto loro di parlare di questi temi.")

    c = a["concentrazione"]
    print("\n--- 8. Concentrazione della conversazione ---")
    if c["erogatore_quota"] is not None:
        print(f"  erogatore: {c['erogatore_quota']}% di tutti i messaggi")
    for k in (3, 5, 10, 20):
        print(f"  top {k:2d} autori: {c[f'top_{k}']}% dei messaggi")
    print(f"  persone con un solo messaggio: {a['un_solo_messaggio']}")

    print("\n--- 9. Due conteggi che valgono da soli ---")
    print(f"  attrito tecnico (non riesco a entrare/collegarmi):  {a['attrito_tecnico']}")
    print(f"  segnali economici (prezzo, pagamento, quota...):    {a['segnali_economici']}")

    print("\n  LIMITE: questo misura l'attivita' nel gruppo, NON la pratica. Chi pratica ogni")
    print("  giorno senza scrivere risulta inattivo. Il bias sottostima l'aderenza reale:")
    print("  per misurarla servono i report di presenza, non la chat.\n")


def main():
    ap = argparse.ArgumentParser(description="Autopsia di un gruppo WhatsApp (Allegato G)")
    ap.add_argument("chat", help="file _chat.txt esportato da WhatsApp")
    ap.add_argument("--erogatore", default="", help="nome esatto di chi eroga (escluso dai conteggi)")
    ap.add_argument("--offerta", default="zoom.us",
                    help="stringa che identifica la proposta di pratica (default: zoom.us)")
    ap.add_argument("--mappa", metavar="FILE", help="scrive la mappa nome->codice (NON versionare)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    try:
        messaggi = parse(args.chat)
    except FileNotFoundError:
        sys.exit(f"File non trovato: {args.chat}")
    if not messaggi:
        sys.exit("Nessun messaggio riconosciuto: l'export non ha il formato atteso.")

    a = analizza(messaggi, args.erogatore, args.offerta.lower())
    codici = a.pop("_codici")

    if args.mappa:
        with open(args.mappa, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["codice", "nome"])
            for nome, codice in sorted(codici.items(), key=lambda x: x[1]):
                w.writerow([codice, nome])
        print(f"Mappa dei codici scritta in {args.mappa} - NON versionare questo file.")

    print(json.dumps(a, ensure_ascii=False, indent=2)) if args.json else stampa(a)


if __name__ == "__main__":
    main()
