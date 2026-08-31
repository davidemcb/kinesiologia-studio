# kinesiologia-studio

App dello studio (PWA su GitHub Pages). I post ("Novità dallo studio") vivono su
Firestore e possono essere programmati per un giorno futuro.

## Notifica automatica dei post nuovi

Ogni ora il workflow `Post nuovi: anteprime social e notifica` guarda i post
diventati visibili e, per quelli non ancora annunciati, manda la notifica push
tramite OneSignal (`scripts/notifica-post-nuovo.mjs`). Chi è già stato
annunciato resta segnato in `.github/post-notificati.json`.

Perché le notifiche partano serve **un solo passaggio a mano**, una volta:
in GitHub → Settings → Secrets and variables → Actions → *New repository
secret*, creare `ONESIGNAL_API_KEY` con la REST API Key dell'app OneSignal
(OneSignal → Settings → Keys & IDs). Senza il segreto il workflow continua a
generare le anteprime social e segnala solo un avviso.
