# Logo Che Postura!

Marchio: la figura dritta con le braccia al cielo e la colonna segnata dai puntini, presa dall'illustrazione del sito (la terza figura, quella arrivata alla meta). Scritta "Che Postura" in Fraunces con il punto esclamativo arancio, come nell'intestazione del sito. I testi sono convertiti in tracciati: i file SVG si aprono ovunque senza bisogno dei font.

Colori: verde scuro `#24493F`, arancio `#E8742A`, crema `#F6F3EA`.

| File | Quando si usa |
|---|---|
| `che-postura-logo.svg` / `.png` | Versione principale, su sfondo bianco o crema (carta intestata, PDF, slide chiare) |
| `che-postura-logo-su-verde.svg` / `.png` | Su fondo verde, già con lo sfondo incluso (copertine, social) |
| `che-postura-logo-chiaro.svg` / `.png` | Scritta crema senza sfondo, da appoggiare su foto scure o sul verde |
| `che-postura-logo-verticale*.svg` / `.png` | Marchio sopra la scritta, con lo slogan "Due professionisti. Un solo percorso: il tuo." (profilo social, biglietto, locandina) |
| `che-postura-marchio.svg` / `.png` | Solo il quadrato con la figura (icona app, avatar, timbro) |
| `che-postura-marchio-crema.svg` / `.png` | Stessa icona in verde su crema |
| `che-postura-scritta*.svg` / `.png` | Solo la scritta, senza figura |
| `icona-512.png`, `icona-192.png`, `favicon-64.png` | Icone per sito, manifest e scheda del browser |

Spazio di rispetto: intorno al logo lasciare almeno l'altezza della testa della figura. Non deformare, non cambiare i colori, non togliere il punto esclamativo.

Per rigenerare: `python3 build.py` con fontTools installato e i due font in una cartella `fonts/` (Fraunces 700 e Instrument Sans 600 da Google Fonts).
