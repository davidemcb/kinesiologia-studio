/* Il numero di versione vive in tre posti e devono dire tutti la stessa cosa:
     - version.json   -> quello che l'app scarica per sapere se e' nata una versione nuova
     - index.html     -> APP_VERSION, la versione che l'app sa di essere
     - sw.js          -> il nome della cache, per buttare via quella vecchia
   Se index.html resta indietro rispetto a version.json, l'app si accorge a ogni
   apertura che "esiste una versione piu' nuova", si ricarica, e da capo: l'app
   trema e non si riesce piu' a usarla. E' successo con la v41.
   Questo controllo gira a ogni push e blocca la pubblicazione prima che accada. */

import { readFileSync } from 'node:fs';

function leggi(file) {
  return readFileSync(new URL('../' + file, import.meta.url), 'utf8');
}

const versioni = {};

versioni['version.json'] = JSON.parse(leggi('version.json')).v;

const app = leggi('index.html').match(/var APP_VERSION = (\d+);/);
if (!app) {
  console.error('Non trovo APP_VERSION in index.html: il controllo non puo' + "'" + ' funzionare.');
  process.exit(1);
}
versioni['index.html (APP_VERSION)'] = Number(app[1]);

const cache = leggi('sw.js').match(/var CACHE = 'ks-v(\d+)';/);
if (!cache) {
  console.error('Non trovo il nome della cache in sw.js: il controllo non puo' + "'" + ' funzionare.');
  process.exit(1);
}
versioni['sw.js (nome della cache)'] = Number(cache[1]);

const valori = Object.values(versioni);
const tutteUguali = valori.every((v) => v === valori[0]);

for (const [dove, v] of Object.entries(versioni)) {
  console.log(`  ${tutteUguali ? '·' : '!'} ${dove}: ${v}`);
}

if (!tutteUguali) {
  console.error('\nLe versioni non sono allineate.');
  console.error('Portale tutte allo stesso numero, altrimenti l\'app si ricarica in continuazione.');
  process.exit(1);
}

console.log(`\nVersioni allineate: v${valori[0]}.`);
