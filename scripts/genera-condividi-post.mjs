// Genera le paginette di condivisione (anteprime social) per i post del giorno.
// I post vivono su Firestore e sono leggibili pubblicamente (come fa l'app);
// qui diventano pagine statiche con i tag Open Graph, una per post, in condividi/.
// Eseguito ogni ora da GitHub Actions: i post futuri (programmati) restano fuori
// finché non arriva il loro giorno.
import { readdirSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://davidemcb.github.io/kinesiologia-studio/';
const API_KEY = 'AIzaSyDbPhrjVUolDP1Y17NvMACUVYZZ_c8TDBQ'; // chiave pubblica dell'app
const DIR = 'condividi';

const res = await fetch(
  `https://firestore.googleapis.com/v1/projects/kinesiologia-studio/databases/(default)/documents:runQuery?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: 60
      }
    })
  }
);
if (!res.ok) {
  console.error('Firestore ha risposto', res.status);
  process.exit(1);
}
const rows = await res.json();

const posts = [];
for (const r of rows) {
  if (!r.document) continue;
  const f = r.document.fields || {};
  const createdAt = f.createdAt?.timestampValue ? new Date(f.createdAt.timestampValue) : null;
  if (createdAt && createdAt.getTime() > Date.now()) continue; // programmato: non svelarlo
  posts.push({
    id: r.document.name.split('/').pop(),
    title: f.title?.stringValue || '',
    text: f.text?.stringValue || ''
  });
}

const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

mkdirSync(DIR, { recursive: true });
const attesi = new Set();
for (const p of posts) {
  const file = `post-${p.id}.html`;
  attesi.add(file);
  const url = `${SITE}${DIR}/${file}`;
  const desc = p.text.length > 200 ? p.text.slice(0, 197) + '…' : p.text;
  writeFileSync(join(DIR, file), `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escAttr(p.title)} — Kinesiologia Studio</title>
<meta name="description" content="${escAttr(desc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escAttr(p.title)} — Kinesiologia Studio">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}icons/icon-512.png">
<meta property="og:site_name" content="Kinesiologia Studio — Dott. Davide Scuderi, Modena">
<meta name="twitter:card" content="summary">
<link rel="canonical" href="${url}">
<style>body{font-family:system-ui,sans-serif;background:#F5F1E8;color:#2A2A25;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center}a{color:#2F5D51;font-weight:700}</style>
</head>
<body>
<div><h1 style="font-size:22px">${escAttr(p.title)}</h1><p>${escAttr(desc)}</p>
<p>Ti sto portando all’app… <a href="${SITE}">Apri Kinesiologia Studio</a></p></div>
<script>location.replace(${JSON.stringify(SITE)});</script>
</body>
</html>
`);
}

// via le pagine dei post che non esistono più (gli articoli fissi restano)
let rimosse = 0;
for (const f of readdirSync(DIR)) {
  if (f.startsWith('post-') && f.endsWith('.html') && !attesi.has(f)) {
    unlinkSync(join(DIR, f));
    rimosse++;
  }
}
console.log(`Generate ${attesi.size} pagine post, rimosse ${rimosse}.`);
