// Avvisa sul telefono quando esce un articolo nuovo.
// I post vivono su Firestore e quasi sempre sono programmati: qui, ogni ora da
// GitHub Actions, si guarda se ne e' appena diventato visibile uno e parte la
// notifica push verso chi le ha attivate nell'app (OneSignal).
// Chi e' gia' stato annunciato resta segnato in .github/post-notificati.json,
// cosi' la stessa notizia non arriva due volte.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SITE = 'https://davidemcb.github.io/kinesiologia-studio/';
const API_KEY = 'AIzaSyDbPhrjVUolDP1Y17NvMACUVYZZ_c8TDBQ'; // chiave pubblica dell'app
const APP_ID = '159d2224-7069-463a-9029-bda8d7731b53';     // app OneSignal dell'app
const STATO = '.github/post-notificati.json';
const FINESTRA = 24 * 60 * 60 * 1000; // un post piu' vecchio di un giorno non si annuncia piu'
const RICORDA = 60;                   // quanti post tenere in memoria nel file di stato

const CHIAVE = (process.env.ONESIGNAL_API_KEY || '').trim();
if (!CHIAVE) {
  console.log('::warning::Manca il segreto ONESIGNAL_API_KEY: nessuna notifica inviata.');
  process.exit(0);
}

// ---- chi e' gia' stato annunciato ----
let stato = { notificati: [] };
try {
  const letto = JSON.parse(readFileSync(STATO, 'utf8'));
  if (Array.isArray(letto.notificati)) stato = letto;
} catch (e) {} // primo giro: il file non c'e' ancora

const gia = new Set(stato.notificati.map(n => n.id));

// ---- i post gia' visibili, dal piu' recente ----
const res = await fetch(
  `https://firestore.googleapis.com/v1/projects/kinesiologia-studio/databases/(default)/documents:runQuery?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: 20
      }
    })
  }
);
if (!res.ok) {
  console.error('Firestore ha risposto', res.status);
  process.exit(1);
}

const ora = Date.now();
const nuovi = [];
for (const r of await res.json()) {
  if (!r.document) continue;
  const f = r.document.fields || {};
  const id = r.document.name.split('/').pop();
  const quando = f.createdAt?.timestampValue ? new Date(f.createdAt.timestampValue).getTime() : null;
  if (quando === null) continue;
  if (quando > ora) continue;              // programmato: il suo giorno non e' arrivato
  if (ora - quando > FINESTRA) continue;   // vecchio: annunciarlo adesso sarebbe fuori tempo
  if (gia.has(id)) continue;               // gia' annunciato
  nuovi.push({
    id,
    quando,
    title: f.title?.stringValue || 'Novità dallo studio',
    text: f.text?.stringValue || ''
  });
}

if (!nuovi.length) {
  console.log('Nessun post nuovo da annunciare.');
  process.exit(0);
}

// Stesso post, stessa chiave: se un invio parte due volte (un giro andato male,
// il file di stato non salvato) OneSignal riconosce il doppione e non lo rimanda.
function chiaveInvio(id) {
  const h = createHash('md5').update('kinesiologia-post-' + id).digest('hex').split('');
  h[12] = '4';
  h[16] = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  const s = h.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function anteprima(t) {
  const pulito = t.replace(/\s+/g, ' ').trim();
  return pulito.length > 140 ? pulito.slice(0, 137) + '…' : pulito;
}

// OneSignal accetta la chiave nel modo nuovo ("Key"); le app piu' vecchie
// rispondono solo al modo storico ("Basic"): si prova l'uno e poi l'altro.
async function invia(post) {
  const corpo = {
    app_id: APP_ID,
    included_segments: ['Subscribed Users'],
    headings: { en: post.title, it: post.title },
    contents: { en: anteprima(post.text), it: anteprima(post.text) },
    url: SITE + '?vai=post-' + post.id,
    chrome_web_icon: SITE + 'icons/icon-192.png',
    chrome_web_badge: SITE + 'icons/icon-192.png',
    external_id: chiaveInvio(post.id)
  };

  let ultima = null;
  for (const schema of ['Key', 'Basic']) {
    const r = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': schema + ' ' + CHIAVE
      },
      body: JSON.stringify(corpo)
    });
    const testo = await r.text();
    if (r.ok) return { ok: true, testo };
    ultima = r.status + ' ' + testo;
    if (r.status !== 401 && r.status !== 403) break; // non e' la chiave: inutile riprovare
  }
  return { ok: false, testo: ultima };
}

// dal piu' vecchio al piu' recente: se ne escono due, arrivano in ordine
nuovi.sort((a, b) => a.quando - b.quando);

let errori = 0;
for (const post of nuovi) {
  const esito = await invia(post);
  if (esito.ok) {
    console.log('Notifica inviata:', post.title);
    stato.notificati.push({ id: post.id, titolo: post.title, il: new Date().toISOString() });
  } else {
    console.error('::error::Notifica non inviata per "' + post.title + '": ' + esito.testo);
    errori++;
  }
}

// il file di stato si salva comunque: quelli riusciti non vanno rimandati
stato.notificati = stato.notificati.slice(-RICORDA);
mkdirSync('.github', { recursive: true });
writeFileSync(STATO, JSON.stringify(stato, null, 2) + '\n');

process.exit(errori ? 1 : 0);
