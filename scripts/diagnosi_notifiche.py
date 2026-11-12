# -*- coding: utf-8 -*-
"""Diagnosi delle notifiche: cosa vede OneSignal dall'altra parte.

Non programma e non manda niente. Legge e stampa soltanto dei conti:
  1. le ultime notifiche partite o in programma, con quanti telefoni le hanno
     ricevute (recipients), quante consegnate (successful), fallite, errate;
  2. quanti telefoni risultano iscritti, su quale piattaforma (Chrome Android,
     Safari/iPhone, Firefox...), quanti si sono disiscritti o hanno un token
     non piu' valido, e da quanto sono attivi.

Nessun dato personale: nessun id di dispositivo, nessun indirizzo.
Gira su GitHub Actions (.github/workflows/diagnosi-notifiche.yml, a mano) con
la chiave nel segreto ONESIGNAL_REST_KEY; dal computer di casa con
`python diagnosi_notifiche.py` e la chiave nella variabile d'ambiente.
"""
import collections
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

APP_ID = "159d2224-7069-463a-9029-bda8d7731b53"

PIATTAFORME = {0: "iOS app", 1: "Android app", 5: "Chrome/Edge web (Android, PC)",
               7: "Safari (Mac)", 8: "Firefox web", 9: "macOS app", 11: "email",
               13: "sms", 14: "Edge web", 17: "Safari 16+ / iPhone app installata"}


def http(url, chiave):
    req = urllib.request.Request(url, headers={"Accept": "application/json",
                                               "Authorization": f"Key {chiave}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8") or "{}")
        except ValueError:
            return e.code, {}


def giorno(ts):
    if not ts:
        return "-"
    try:
        return datetime.datetime.fromtimestamp(int(ts), datetime.timezone.utc).strftime("%d/%m/%Y %H:%M")
    except (TypeError, ValueError, OSError):
        return str(ts)


def notifiche(chiave):
    print("=== 1. Le ultime notifiche (ora UTC; l'Italia e' +1) ===")
    stato, dati = http("https://api.onesignal.com/notifications?" + urllib.parse.urlencode(
        {"app_id": APP_ID, "limit": 20}), chiave)
    if stato != 200:
        print(f"OneSignal non risponde ({stato}): {json.dumps(dati)[:200]}")
        return
    for n in dati.get("notifications", []):
        titolo = (n.get("contents") or {}).get("en", "")[:50]
        quando = n.get("send_after") or n.get("queued_at")
        print(f"- {giorno(quando)}  «{titolo}»  post={((n.get('data') or {}).get('post_id') or '-')[:8]}")
        print(f"    completata: {giorno(n.get('completed_at'))}   annullata: {n.get('canceled')}")
        print(f"    destinatari={n.get('recipients')}  consegnate={n.get('successful')}  "
              f"fallite={n.get('failed')}  errate={n.get('errored')}  "
              f"in attesa={n.get('remaining')}  aperte={n.get('converted')}")
        pds = n.get("platform_delivery_stats") or {}
        for p, v in pds.items():
            print(f"    {p}: {json.dumps(v)}")
    print()


def iscritti(chiave):
    print("=== 2. I telefoni iscritti (sottoscrizioni) ===")
    tutti = []
    offset = 0
    totale = None
    while True:
        stato, dati = http("https://api.onesignal.com/players?" + urllib.parse.urlencode(
            {"app_id": APP_ID, "limit": 300, "offset": offset}), chiave)
        if stato != 200:
            print(f"OneSignal non risponde ({stato}): {json.dumps(dati)[:200]}")
            return
        totale = dati.get("total_count", totale)
        blocco = dati.get("players", [])
        tutti.extend(blocco)
        offset += len(blocco)
        if not blocco or offset >= (totale or 0) or offset >= 3000:
            break
    print(f"sottoscrizioni totali su OneSignal: {totale}  (lette: {len(tutti)})")
    adesso = datetime.datetime.now(datetime.timezone.utc).timestamp()
    per_piatt = collections.Counter()
    per_stato = collections.Counter()
    attivi7 = attivi30 = 0
    token_invalido = 0
    righe = []
    for p in tutti:
        piatt = PIATTAFORME.get(p.get("device_type"), f"tipo {p.get('device_type')}")
        nt = p.get("notification_types")
        if p.get("invalid_identifier"):
            token_invalido += 1
            st = "token non valido"
        elif nt is None:
            st = "sconosciuto"
        elif nt > 0:
            st = "iscritto"
        elif nt == -2:
            st = "disiscritto (-2)"
        elif nt == -31:
            st = "permesso negato (-31)"
        else:
            st = f"non iscritto ({nt})"
        per_piatt[piatt] += 1
        per_stato[st] += 1
        la = p.get("last_active") or 0
        if adesso - la < 7 * 86400:
            attivi7 += 1
        if adesso - la < 30 * 86400:
            attivi30 += 1
        tag = p.get("tags") or {}
        righe.append((la, piatt, st, giorno(p.get("created_at")), giorno(la),
                      ",".join(k for k, v in tag.items() if str(v) == "1")[:40],
                      (p.get("device_model") or p.get("device_os") or "")[:20]))
    print("per piattaforma:")
    for k, v in per_piatt.most_common():
        print(f"  {v:4d}  {k}")
    print("per stato:")
    for k, v in per_stato.most_common():
        print(f"  {v:4d}  {k}")
    print(f"attivi negli ultimi 7 giorni: {attivi7}   negli ultimi 30: {attivi30}   token non validi: {token_invalido}")
    print()
    print("ultime 40 sottoscrizioni (dalla piu' recente; nessun id):")
    print("  piattaforma | stato | creata | ultima apertura | etichette | sistema")
    for r in sorted(righe, reverse=True)[:40]:
        print("  " + " | ".join(str(x) for x in r[1:]))
    print()


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass
    chiave = os.environ.get("ONESIGNAL_REST_KEY", "").strip()
    if not chiave:
        print("Manca la chiave OneSignal nella variabile ONESIGNAL_REST_KEY.")
        return 1
    notifiche(chiave)
    iscritti(chiave)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # noqa: BLE001
        print(f"ERRORE: {e}")
        sys.exit(1)
