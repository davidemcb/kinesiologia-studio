# Scheda Estetica · prototipo

Programma per il centro estetico, costruito sullo stesso impianto di chePostura: l'estetista compila
l'anamnesi, scatta le foto di viso e corpo, una lettura automatica propone gli inestetismi, lei li
conferma, e il motore delle regole genera il piano di lavoro (tessuto bersaglio, trattamenti,
sequenza delle sedute, principi attivi, consigli per casa, abitudini da correggere).

Tutto resta nel perimetro degli inestetismi: nessuna diagnosi, e ogni segnale sospetto finisce in
una riga "da segnalare al medico" in cima al piano.

## Cosa c'è nella cartella

| File | Cosa fa |
|---|---|
| `index.html` | L'app: elenco schede, anamnesi, foto, lettura, piano stampabile. Vanilla JS, nessuna dipendenza. I dati restano sul dispositivo (IndexedDB). |
| `motore.js` | Il motore delle regole: anamnesi + inestetismi → controindicazioni, trattamenti ammessi ed esclusi, ciclo di sedute, attivi, consigli. Gira anche in Node per i test. |
| `conoscenza.json` | **La base di conoscenza, il cuore del prodotto.** Inestetismi, tessuti, trattamenti, principi attivi, controindicazioni, regole sulle abitudini, segnalazioni al medico. Si modifica senza toccare il codice. |
| `anamnesi.json` | Il questionario: sezioni, domande, e il collegamento di ogni domanda a controindicazioni, segnalazioni e regole sulle abitudini. |
| `esame.json` | L'esame al tatto guidato: 10 prove (tipo di pelle, spessore, elasticità, reattività, pizzicotto, noduli, temperatura, segno del dito, tono, circolazione) con opzioni spiegate che aggiornano da sole gli inestetismi. |
| `riferimenti/` | Foto di riferimento per le opzioni dell'esame al tatto, mostrate dall'app se presenti. |
| `worker/` | Worker Cloudflare che riceve le foto, le fa leggere a Claude e restituisce una lettura strutturata con i soli id della base di conoscenza. La chiave API sta lì, mai nel browser. |

## Provarlo subito

L'app va aperta da un server web (anche locale), non come file:

```bash
cd estetica
python3 -m http.server 8765
# poi apri http://localhost:8765/
```

Senza worker configurato, la lettura della pelle si compila a mano dal menu "Aggiungi un
inestetismo": il piano si genera comunque. È il modo più rapido per valutare la base di
conoscenza con l'estetista.

Se la cartella viene pubblicata insieme al sito, l'app risponde su `/estetica/`.

## Attivare la lettura automatica delle foto

```bash
cd estetica/worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY     # chiave da console.anthropic.com
npx wrangler secret put APP_TOKEN             # facoltativo: una password condivisa con l'app
npx wrangler deploy
```

Poi in `wrangler.toml` sostituire `ALLOWED_ORIGIN = "*"` con l'origine della pagina
(per esempio `https://www.kinesiologia-studio.it`) e rilanciare `npx wrangler deploy`.

Nell'app, icona ⚙ in alto a destra: incollare l'URL del worker e, se impostato, il token.
Il pulsante "Analizza le foto" si attiva quando ci sono foto e il consenso all'analisi.

Costo indicativo: ogni analisi manda al modello fino a 6 foto ridotte a 1280 px più il catalogo;
siamo nell'ordine di pochi centesimi a scheda. Il worker riporta i token usati nel campo `uso`.

## Le foto: fotocamera guidata e controllo di qualità

Il passo Foto apre la fotocamera dentro l'app (posteriore, alla massima risoluzione disponibile)
con una sagoma guida diversa per ogni scatto: ovale con la linea degli occhi per il frontale,
ovale e linea dell'orizzonte per i profili, silhouette con la linea dei piedi per il corpo,
riquadro per i ravvicinati. Una livella avvisa se il telefono è inclinato. Quando esiste una foto
precedente dello stesso scatto, appare in trasparenza per rimettersi nella stessa posizione.

Gli scatti previsti sono nove, tre dei quali facoltativi e pensati per ciò che la foto standard non
mostra: **mimica** (sopracciglia alzate e sorriso, per le rughe d'espressione), **ravvicinato**
(guancia e naso, per pori, grana e capillari) e **pizzicotto** (coscia pizzicata, per la cellulite
allo stadio iniziale). Le foto del viso sono tenute a 2048 px, quelle del corpo a 1600.

Prima di salvare, ogni foto passa un controllo di qualità fatto nel browser: luce troppo scarsa o
eccessiva, foto mossa o sfocata, dominante calda o fredda, luce da un lato solo sul viso (le ombre
sembrano rughe). Gli avvisi restano visibili sul riquadro, i problemi gravi evidenziano il riquadro
in rosso e vengono passati anche al modello insieme alla foto. Le soglie sono empiriche e vanno
tarate sulle luci del centro.

"Archivia e nuovo controllo" mette da parte il set di foto attuale con la data e libera i
riquadri: le nuove foto si scattano con le vecchie in trasparenza e la scheda mostra il prima e
dopo affiancato.

## L'esame al tatto

Tipo di pelle, ritenzione, consistenza dei noduli, temperatura, elasticità: sono cose che si
sentono con le mani. Nel passo Lettura, sotto la lettura automatica, c'è l'esame al tatto guidato:
per ogni prova l'app spiega come si fa e propone le opzioni con la descrizione di cosa si osserva e
la foto di riferimento se presente in `riferimenti/`. Scegliere un'opzione aggiunge o conferma
l'inestetismo con il grado corrispondente (etichetta "tatto" o "confermato al tatto") e, dove serve,
accende la segnalazione al medico, per esempio per il gonfiore di una sola gamba. L'esame si
compila anche senza foto e senza chiave API.

## Come funziona la lettura

1. L'app riduce le foto nel browser (max 1280 px, JPEG) e le invia al worker con il catalogo degli
   inestetismi (id, nome, segni visibili, zone) e il contesto dichiarato (età, fototipo, obiettivi).
2. Il worker chiede al modello una risposta in un formato JSON rigido: qualità di ogni foto, tipo di
   pelle, fototipo stimato, inestetismi con grado 1-3, zone, confidenza ed evidenza visiva,
   eventuali segnalazioni al medico.
3. Il worker scarta qualsiasi id fuori catalogo e restituisce la lettura. Nulla viene salvato.
4. Nell'app ogni voce arriva con la spunta attiva (tranne quelle a confidenza bassa): l'estetista
   conferma, corregge grado e zone, aggiunge o toglie. Solo le voci confermate entrano nel piano.

## Come ragiona il motore

- **Controindicazioni**: ogni risposta "sì" alle domande di salute attiva una voce di
  `controindicazioni` che blocca certi trattamenti (`blocca`), ne segnala altri come da usare con
  cautela (`cautela`) e vieta certi attivi per casa (`evita_attivi`). I blocchi si vedono nel piano
  alla voce "Esclusi per sicurezza", con il motivo.
- **Priorità**: ogni inestetismo ha una priorità clinica (1-3) che si moltiplica per il grado
  osservato; un punto in più se è fra gli obiettivi dichiarati dalla cliente.
- **Trattamenti**: ogni inestetismo elenca i trattamenti indicati con un peso. Il punteggio di un
  trattamento è la somma dei pesi sugli inestetismi presenti, quindi vince ciò che lavora su più
  problemi insieme.
- **Sedute**: per ogni fase della seduta (detersione, esfoliazione, preparazione, azione specifica,
  massaggio, maschera, chiusura) il motore sceglie il trattamento ammesso con il punteggio più
  alto, alterna i primi due quando hanno peso simile, non mette mai due strumentali nella stessa
  fase e taglia le voci secondarie se si superano i 90 minuti.
- **Attivi per casa**: unione degli attivi suggeriti dagli inestetismi, tolti quelli da evitare per
  altri inestetismi presenti o per le controindicazioni.
- **Abitudini**: le regole in `abitudini` leggono le risposte su acqua, zuccheri, sale, alcol, fumo,
  sonno, movimento, sole e SPF, e scrivono un consiglio collegato agli inestetismi su cui incide.

## Riempire la base di conoscenza

È la parte da fare insieme all'estetista, riga per riga. In `conoscenza.json`:

- **`inestetismi`**: per ognuno nome, area, zone tipiche, tessuti, `segni` (la descrizione che guida
  la lettura automatica: più è concreta, più la lettura è precisa), priorità, numero di sedute,
  frequenza, trattamenti con peso, attivi consigliati, attivi da evitare, consigli per casa.
- **`trattamenti`**: nome, tipo (manuale, strumentale, cosmetico), fase della seduta, tessuti,
  durata, descrizione. Qui vanno i macchinari e le tecniche davvero presenti nel centro: ciò che non
  c'è si cancella, ciò che manca si aggiunge.
- **`attivi`**: i principi attivi, da legare poi alle linee di prodotto usate dal centro.
- **`controindicazioni`**: ogni voce dice cosa blocca e cosa va usato con cautela. Va rivista con
  i manuali dei macchinari.
- **`abitudini`** e **`segnalazioni_medico`**: le regole di buon senso e i campanelli d'allarme.

Gli id sono parole chiave in minuscolo con underscore; un trattamento citato da un inestetismo
deve esistere in `trattamenti`, un attivo in `attivi`, e così via. Questo controllo si fa in Node:

```bash
node -e "const k=require('./conoscenza.json');const T=Object.keys(k.trattamenti),A=Object.keys(k.attivi);let e=[];for(const [id,i] of Object.entries(k.inestetismi)){for(const [t] of i.trattamenti)if(!T.includes(t))e.push(id+' > '+t);for(const a of [...i.attivi,...i.evitare_attivi])if(!A.includes(a))e.push(id+' > '+a)}console.log(e.length?e:'OK')"
```

## Privacy

Le foto del viso sono dati biometrici: la scheda chiede due consensi separati (raccolta foto e
analisi automatica), non si può analizzare senza il secondo, le foto vengono ridotte e restano
nel browser del dispositivo, il worker non le conserva, e la scheda si elimina con un tocco. Per
un uso reale servono ancora: informativa scritta da far firmare, backup cifrato delle schede (oggi
sono solo sul dispositivo) e un registro dei trattamenti.

## Prossimi passi

1. Sessione con l'estetista sulla base di conoscenza: macchinari reali, linee di prodotto, sequenze
   secondo il suo metodo.
2. Prova della lettura automatica su 20-30 foto reali, con il suo giudizio a confronto, per tarare
   `segni` e le soglie di confidenza.
3. Foto di riferimento per l'esame al tatto nella cartella `riferimenti/`, e taratura delle soglie
   del controllo di qualità sulle luci reali della cabina.
4. Account e archivio in cloud (Firebase, come il resto del sito) per usare la scheda da più
   dispositivi e non perderla.
5. Manifest e icona per installarla sul telefono come chePostura.
