# -*- coding: utf-8 -*-
"""Affida a OneSignal la notifica di ogni post dell'app che deve ancora uscire.

Legge da Firestore i post con data futura (l'app li tiene nascosti fino ad
allora), guarda su OneSignal quali hanno gia' una notifica in programma e
programma quelle che mancano. La notifica parte un'ora dopo che il post
compare nell'app (i post escono alle 7 del mattino, la notifica alle 8) e,
toccandola, si apre proprio quel post.

Si puo' lanciare quante volte si vuole: non programma mai due volte lo stesso
post, perche' ogni notifica porta con se' l'id del post.

Gira da solo ogni ora su GitHub Actions (.github/workflows/notifiche-post.yml),
con la chiave OneSignal nel segreto ONESIGNAL_REST_KEY. Dal computer di casa
si lancia con `python programma_notifiche.py` dalla cartella KINESIOLOGIA STUDIO,
che legge la chiave da onesignal-key.txt.

Usa solo la libreria standard: non serve installare niente.
"""
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

APP_ID = "159d2224-7069-463a-9029-bda8d7731b53"
PROJECT = "kinesiologia-studio"
# chiave pubblica dell'app, la stessa di genera-condividi-post.mjs: legge e basta
FIREBASE_KEY = "AIzaSyDbPhrjVUolDP1Y17NvMACUVYZZ_c8TDBQ"
SITO = "https://davidemcb.github.io/kinesiologia-studio/"
RITARDO_MINUTI = 60      # la notifica parte un'ora dopo la comparsa del post
FINESTRA_RECUPERO_ORE = 12  # un post uscito da poco senza notifica la riceve subito
ORIZZONTE_GIORNI = 28    # OneSignal non accetta notifiche piu' in la' di un mese


def http(metodo, url, body=None, headers=None):
    dati = json.dumps(body).encode("utf-8") if body is not None else None
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    h.update(headers or {})
    req = urllib.request.Request(url, data=dati, method=metodo, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            corpo = json.loads(e.read().decode("utf-8") or "{}")
        except ValueError:
            corpo = {}
        return e.code, corpo


def adesso_utc():
    return datetime.datetime.now(datetime.timezone.utc)


def leggi_ts(s):
    # Firestore scrive ad esempio 2026-11-09T06:00:00Z oppure con i decimali
    s = s.replace("Z", "+00:00")
    if "." in s:
        testa, coda = s.split(".", 1)
        s = testa + coda[coda.index("+"):] if "+" in coda else testa + "+00:00"
    return datetime.datetime.fromisoformat(s).astimezone(datetime.timezone.utc)


def post_da_notificare():
    """Post futuri, piu' quelli usciti nelle ultime ore (recupero se qualcosa era fermo)."""
    da = adesso_utc() - datetime.timedelta(hours=FINESTRA_RECUPERO_ORE)
    url = (f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)"
           f"/documents:runQuery?key={FIREBASE_KEY}")
    query = {"structuredQuery": {
        "from": [{"collectionId": "posts"}],
        "where": {"fieldFilter": {
            "field": {"fieldPath": "createdAt"}, "op": "GREATER_THAN",
            "value": {"timestampValue": da.strftime("%Y-%m-%dT%H:%M:%SZ")}}},
        "orderBy": [{"field": {"fieldPath": "createdAt"}, "direction": "ASCENDING"}],
        "limit": 60}}
    stato, righe = http("POST", url, query)
    if stato != 200:
        raise RuntimeError(f"Firestore ha risposto {stato}: {json.dumps(righe)[:200]}")
    posts = []
    for r in righe:
        d = r.get("document")
        if not d:
            continue
        f = d.get("fields", {})
        posts.append({
            "id": d["name"].split("/")[-1],
            "title": f.get("title", {}).get("stringValue", "").strip(),
            "quando": leggi_ts(f["createdAt"]["timestampValue"]),
        })
    return posts


def notifiche_esistenti(chiave):
    """Id dei post che hanno gia' una notifica (programmata o gia' partita) su OneSignal."""
    url = "https://api.onesignal.com/notifications?" + urllib.parse.urlencode(
        {"app_id": APP_ID, "limit": 50})
    stato, dati = http("GET", url, headers={"Authorization": f"Key {chiave}"})
    if stato != 200:
        raise RuntimeError(f"OneSignal non risponde ({stato}): {json.dumps(dati)[:200]}")
    gia = {}
    for n in dati.get("notifications", []):
        if n.get("canceled"):
            continue
        pid = (n.get("data") or {}).get("post_id")
        if pid:
            gia[pid] = n
    return gia


def programma(chiave, post):
    quando = post["quando"] + datetime.timedelta(minutes=RITARDO_MINUTI)
    subito = quando <= adesso_utc()
    body = {
        "app_id": APP_ID,
        "included_segments": ["Total Subscriptions"],
        "headings": {"en": "Kinesiologia Studio"},
        "contents": {"en": post["title"]},
        "url": f"{SITO}?vai=post-{post['id']}",
        "chrome_web_icon": f"{SITO}icons/icon-192.png",
        "data": {"post_id": post["id"]},
    }
    if not subito:
        body["send_after"] = quando.strftime("%Y-%m-%d %H:%M:%S GMT+0000")
    stato, dati = http("POST", "https://api.onesignal.com/notifications", body,
                       {"Authorization": f"Key {chiave}"})
    if stato != 200 or dati.get("errors"):
        return False, f"NON programmata ({stato}): {dati.get('errors') or json.dumps(dati)[:150]}"
    quando_txt = "adesso" if subito else quando.strftime("%d/%m %H:%M UTC")
    return True, f"programmata per {quando_txt} (id {dati.get('id', '')[:8]})"


def main():
    try:  # su Windows la console non e' sempre in UTF-8: meglio un carattere strano di un crash
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass
    chiave = os.environ.get("ONESIGNAL_REST_KEY", "").strip()
    if not chiave:
        print("Manca la chiave OneSignal: metti il contenuto di onesignal-key.txt nella variabile")
        print("ONESIGNAL_REST_KEY (su GitHub: Settings > Secrets and variables > Actions).")
        return 1

    posts = post_da_notificare()
    if not posts:
        print("Nessun post in programma: niente da notificare.")
        return 0

    gia = notifiche_esistenti(chiave)
    limite = adesso_utc() + datetime.timedelta(days=ORIZZONTE_GIORNI)
    errori = 0
    nuove = 0
    for p in posts:
        riga = f"{p['quando'].strftime('%d/%m %H:%M UTC')}  {p['title'][:48]}"
        if p["id"] in gia:
            print(f"{riga}\n      gia' programmata (id {gia[p['id']].get('id', '')[:8]})")
            continue
        if p["quando"] > limite:
            print(f"{riga}\n      ancora lontano: si programma nei prossimi giri")
            continue
        ok, esito = programma(chiave, p)
        print(f"{riga}\n      {esito}")
        if ok:
            nuove += 1
        else:
            errori += 1

    print()
    if nuove:
        print(f"Fatto: {nuove} notifiche affidate ai server di OneSignal. Partono da sole.")
    else:
        print("Tutto gia' in ordine: ogni post in programma ha la sua notifica.")
    if errori:
        print(f"ATTENZIONE: {errori} notifiche non programmate, vedi sopra.")
    return 1 if errori else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # noqa: BLE001 - si vuole un messaggio chiaro, non un traceback
        print(f"ERRORE: {e}")
        sys.exit(1)
