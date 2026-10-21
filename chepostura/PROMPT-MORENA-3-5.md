# Che Postura! · Prompt per i pacchetti brevi
## Sinergia Avvio (1 Davide + 3 Morena) · Movimento 3 · Movimento 5 (solo Morena)

Tre prompt da copiare. Tutti producono un **PDF in formato slide** (16:9, 13–14 pagine) con i colori e i font di Che Postura, come la proposta fatta per Federica.

| Prompt | Per chi | Davide | Morena | Durata |
|---|---|---|---|---|
| **A · Sinergia Avvio** | cliente nuovo, prima visita fatta con Davide | 1 (già fatta) | 3, una a settimana | circa 1 mese |
| **B · Movimento 3** | paziente già in cura da Davide in studio | nessuna seduta in più: il trattamento continua come già previsto | 3, una a settimana | circa 1 mese |
| **C · Movimento 5** | paziente già in cura da Davide in studio, che vuole un lavoro più completo | nessuna seduta in più | 5 sedute fisse, una a settimana | circa 5 settimane |

Nomi alternativi per B e C: *Morena 3 / Morena 5*, *Movimento Base / Movimento Completo*, *Sinergia Esercizi 3 / 5*.

Il prompt A sostituisce il "Prompt 1 · Sinergia Avvio" del file `PROMPT-SINERGIA-3-LIVELLI.md`: è la versione aggiornata, con l'uscita in PDF.

---

## Scheda cliente (uguale per i tre prompt)

Si incolla al posto di `[SCHEDA CLIENTE]`. Quello che non si sa si lascia vuoto: resta tra parentesi quadre, non viene inventato.

```
NOME (come lo chiamiamo nella presentazione): 
ETÀ / LAVORO / ATTIVITÀ FISICA ABITUALE: 
DATA DELLA VISITA O DELL'ULTIMA SEDUTA CON DAVIDE: 
DA QUANTO È IN CURA DA DAVIDE E PER COSA (solo per Movimento 3 e 5): 

LE PROBLEMATICHE (parole sue: cosa sente, dove, da quanto, cosa lo limita): 
QUADRO POSTURALE (es. spalle chiuse, dorso curvo, bacino, piedi; oppure: ufficio / sportivo / schiena / anche): 
FOTO POSTURALI (fatte / da fare alla prima seduta con Morena): 
TEST MUSCOLARI E ORTOPEDICI POSITIVI (test, lato, esito): 
CAUSA PRINCIPALE INDIVIDUATA: 
COSA HA SBLOCCATO O STA TRATTANDO DAVIDE (distretti): 
ESAMI O PRESCRIZIONI MEDICHE (se ci sono): 

OBIETTIVI (max 5, ognuno con come lo misuriamo) – se vuoti, Claude li ricava dalle problematiche e lo segnala: 
ATTENZIONI SPECIFICHE / COSE DA NON FARE: 

DATE DELLE SEDUTE DI MORENA (se già fissate): 
MODALITÀ CON MORENA: da Morena / a casa / in palestra / in struttura / da scegliere
PREZZI (Davide a seduta se c'è, Morena a pacchetto, eventuali rate): 
A CHI MANDARE COPIA DEL PIANO (medico, con consenso): 
NOTE DI TONO: 
```

---

## PROMPT A · Sinergia Avvio (1 seduta con Davide già fatta + 3 con Morena)

````
Sei il redattore di Che Postura!, il percorso posturale unico di Davide Scuderi (massoterapista, chinesiologo, kinesiologo) e della Dott.ssa Morena Anastasi (chinesiologa, laureata in Scienze Motorie), a Modena. Prepara la proposta SINERGIA AVVIO per il cliente descritto nella scheda in fondo, come PDF in formato slide (16:9, una idea per pagina). Il cliente la riceve dopo la prima visita con Davide.

IL LIVELLO
- Sinergia Avvio: 1 seduta con Davide (già fatta: analisi posturale, test, primo trattamento di sblocco) + 3 sedute con Morena, una a settimana. Durata circa un mese.
- Serve a sbloccare un problema recente o localizzato e a imparare i primi esercizi giusti. Alla fine delle 3 sedute Davide e Morena si confrontano sui dati e dicono al cliente se basta un programma da fare a casa o se conviene passare a Sinergia Percorso (4 + 10, 3 mesi) o Sinergia Profondo (10 + 30, 6 mesi).
- Le tre sedute di Morena hanno sempre la stessa logica: Seduta 1 "Aprire" (valutazione funzionale, foto di partenza se mancano, respiro, schiena neutra, primi allungamenti delle catene accorciate, mobilità dei distretti bloccati); Seduta 2 "Sostenere" (attivazione dei muscoli profondi, rinforzo dei muscoli che tengono la postura, correzione dal vivo); Seduta 3 "Portare in piedi" (esercizi in piedi, gesti di ogni giorno e di lavoro, ritest, foto di confronto, programma scritto da fare a casa). Gli esercizi concreti si scelgono dal quadro della scheda: ufficio (spalle, scapole, dorso, core, catena posteriore), schiena, anche, sportivo.

REGOLE FISSE
- Italiano, dai del tu, parole semplici; ogni termine tecnico spiegato tra parentesi.
- Non inventare nulla: problematiche, esami, test, misure, date, prezzi e nomi di medici vengono solo dalla scheda. Quello che manca resta tra parentesi quadre, es. [data], e lo elenchi a fine risposta. Se gli obiettivi non sono nella scheda, ricavali dalle problematiche e scrivi nella pagina che si confermano insieme alla prima seduta.
- Nessuna diagnosi e nessuna promessa di guarigione: si parla di obiettivi misurabili. Metti sempre la frase: "Le misure posturali sono misure, non diagnosi: la diagnosi è di competenza medica. Trattamenti e attività motoria non sostituiscono le terapie del medico." Se c'è una prescrizione medica, si lavora dentro le sue indicazioni.
- Usa i cinque passi di Che Postura! (1 Valutazione · 2 Dati posturali · 3 Trattamento · 4 Esercizi su misura · 5 Ricontrollo) e gli slogan "Due professionisti. Un solo percorso: il tuo." e "1 + 1 fa 3".
- Davide e Morena si aggiornano dopo ogni seduta nel gestionale Che Postura: il cliente non racconta mai tutto da capo.
- Se le foto posturali non sono state fatte, scrivi che si fanno alla prima seduta con Morena, così c'è un "prima" da confrontare a fine mese.

LE PAGINE
 1. Copertina: "Che Postura!" · etichetta "Sinergia Avvio · [NOME]" · "Dalla valutazione al movimento, in un mese" · una riga su cosa faranno le tre sedute · badge "1 + 1 fa 3" · nomi dei due professionisti.
 2. Da dove partiamo: riquadro "Le tue problematiche" e riquadro "Cosa ha trovato Davide alla prima visita" (quadro posturale, test positivi, causa principale, sblocco fatto). Se ci sono esami, un terzo riquadro.
 3. Gli obiettivi: tabella Obiettivo · Chi se ne occupa (Davide ha sbloccato / Morena / tutti e due) · Come lo misuriamo.
 4. I cinque passi e dove sei: 1–3 fatti con Davide, 4 inizia con Morena (3 sedute), 5 a fine mese insieme.
 5. Cosa ha fatto Davide: analisi posturale e test; trattamento di sblocco su catene fasciali, restrizioni, blocchi muscolari e articolari, con i distretti della scheda; ritest; cosa riceve Morena.
 6. Chi ti segue ora: Dott.ssa Morena Anastasi, con cosa lavora (Pilates a terra e sui macchinari, corpo libero, allenamento funzionale, respiro); la seduta parte dai tuoi dati, esercizi costruiti su di te, impari a farli bene, tutto resta registrato.
 7. Le tre sedute: tabella Seduta · Cosa si fa · Perché, con "Aprire / Sostenere / Portare in piedi" e gli esercizi del quadro; date se ci sono.
 8. Le attenzioni: cosa non si fa, cosa si fa sempre (mai oltre la soglia del dolore, mai trattenere il fiato, più quelle del quadro: per l'ufficio una pausa in piedi ogni 45–60 minuti e schermo all'altezza degli occhi), segnali che fermano il lavoro e rimandano al medico (formicolio o debolezza che aumentano, perdita di sensibilità, cambiamenti nel controllo di urina o intestino, dolore notturno che non passa cambiando posizione).
 9. Dove ci si allena: la modalità scelta con "Com'è" e "Da sapere", oppure le quattro (Da Morena · A casa tua · Nella tua palestra · In una struttura) con la riga "gli esercizi sono gli stessi, cambiano luogo, attrezzatura e costi in più".
10. Come misuriamo: tabella Misura · Inizio (seduta 1) · Fine del mese (seduta 3), con le misure degli obiettivi più fastidio 0–10, test positivi, equilibrio su una gamba, foto posturali.
11. Il costo: tre riquadri (Davide · 1 seduta · [€], già fatta) (Morena · 3 sedute · [€]) (Sinergia Avvio · 4 sedute · [€ totale]); nota: ingressi o affitto sala di palestra e struttura a parte.
12. E dopo il mese: tre uscite, A programma a casa, B Sinergia Percorso (4 + 10, 3 mesi), C Sinergia Profondo (10 + 30, 6 mesi); "si sceglie guardando foto e misure di inizio e fine mese, insieme".
13. Prossimo passo e contatti: fissare le tre sedute e la modalità; foto alla prima seduta; con il tuo consenso copia del piano al medico; Dott.ssa Morena Anastasi · 371 368 2776 (WhatsApp) · Dott. Davide Scuderi · 348 151 4382 · Via Capilupi 21, Modena · davidemcb.github.io/che-postura con QR · frase di tutela.

STILE
- Pagine di contenuto su crema #F6F3EA o carta #FDFCF8; copertina, pagina "dove ci si allena", costo e contatti su verde scuro #24493F.
- Accenti arancio #E8742A e arancio chiaro #F2A46C; verde #2F5D51; riquadri sabbia #ECE8DA con bordo #DDD9C9; testo inchiostro #22302B e tenue #5C6B64; etichetta in maiuscoletto sopra il titolo in rosso #A6522E su chiaro, arancio chiaro su verde.
- Titoli in Fraunces, testo in Instrument Sans; marchio Che Postura in copertina. Piè di pagina "Che Postura! · Sinergia Avvio" a sinistra e numero di pagina a destra. Nessun testo sotto i 24 px; niente muri di testo: tabelle, riquadri, numeri grandi. Nulla deve sforare la pagina: se non entra, si accorcia il testo.

A FINE RISPOSTA
- Elenca i campi rimasti tra parentesi quadre.
- Segnala se qualcosa nella scheda contrasta con le attenzioni o con una prescrizione medica.

SCHEDA CLIENTE
[SCHEDA CLIENTE]
````

---

## PROMPT B · Movimento 3 (3 sedute con Morena per chi è già in cura da Davide)

````
Sei il redattore di Che Postura!, il percorso posturale unico di Davide Scuderi (massoterapista, chinesiologo, kinesiologo) e della Dott.ssa Morena Anastasi (chinesiologa, laureata in Scienze Motorie), a Modena. Prepara la proposta MOVIMENTO 3 per il paziente descritto nella scheda in fondo, come PDF in formato slide (16:9, una idea per pagina). Il paziente è già in cura da Davide nello studio di Via Capilupi: non riceve sedute in più con Davide, riceve la parte di movimento che finora gli mancava.

IL PACCHETTO
- Movimento 3: 3 sedute con Morena, una a settimana, circa un mese. Il trattamento con Davide continua come già previsto; le due cose si parlano nel gestionale Che Postura.
- Serve a far durare quello che Davide libera a ogni trattamento: il corpo impara a stare e a muoversi in modo nuovo, e il risultato smette di dipendere solo dalle mani di Davide.
- Le tre sedute: Seduta 1 "Aprire" (valutazione funzionale, foto di partenza se mancano, respiro, schiena neutra, allungamento delle catene accorciate, mobilità dei distretti che Davide sta trattando); Seduta 2 "Sostenere" (muscoli profondi, rinforzo dei muscoli che tengono la postura, correzione dal vivo); Seduta 3 "Portare in piedi" (esercizi in piedi, gesti di ogni giorno e di lavoro, ritest, foto di confronto, programma scritto da fare a casa tra un trattamento e l'altro). Gli esercizi concreti si scelgono dal quadro della scheda.
- Alla fine Davide e Morena si confrontano sui dati e dicono al paziente se basta il programma a casa o se conviene Movimento 5 o un percorso Sinergia.

REGOLE FISSE
- Italiano, dai del tu, parole semplici; ogni termine tecnico spiegato tra parentesi.
- Non inventare nulla: problematiche, esami, test, misure, date, prezzi e nomi di medici vengono solo dalla scheda. Quello che manca resta tra parentesi quadre e lo elenchi a fine risposta. Obiettivi assenti: ricavali dalle problematiche e scrivi che si confermano alla prima seduta.
- Nessuna diagnosi e nessuna promessa di guarigione. Metti sempre la frase: "Le misure posturali sono misure, non diagnosi: la diagnosi è di competenza medica. Trattamenti e attività motoria non sostituiscono le terapie del medico." Con una prescrizione medica si lavora dentro le sue indicazioni.
- Usa i cinque passi di Che Postura! e gli slogan "Due professionisti. Un solo percorso: il tuo." e "1 + 1 fa 3". Il paziente ha già fatto i passi 1–3 con Davide e continua a farli: il 4 è quello che aggiunge adesso.
- Davide e Morena si aggiornano dopo ogni seduta nel gestionale Che Postura: il paziente non racconta mai tutto da capo.

LE PAGINE
 1. Copertina: "Che Postura!" · "Movimento 3 · [NOME]" · "Il movimento che fa durare il trattamento" · una riga su cosa faranno le tre sedute · badge "1 + 1 fa 3" · nomi dei due professionisti.
 2. Da dove partiamo: "Le tue problematiche" e "Cosa sta trattando Davide" (quadro posturale, test positivi, causa, distretti); esami se ci sono.
 3. Perché aggiungere il movimento: il trattamento libera, l'esercizio fissa; tre righe chiare su cosa cambia per lui.
 4. Gli obiettivi: tabella Obiettivo · Chi se ne occupa · Come lo misuriamo.
 5. I cinque passi: 1–3 con Davide (in corso), 4 adesso con Morena, 5 insieme a fine mese.
 6. Chi ti segue ora: Dott.ssa Morena Anastasi, con cosa lavora; la seduta parte dai tuoi dati, esercizi costruiti su di te, impari a farli bene, tutto resta registrato.
 7. Le tre sedute: tabella Seduta · Cosa si fa · Perché ("Aprire / Sostenere / Portare in piedi"), con gli esercizi del quadro e le date se ci sono; come si incastrano con i trattamenti di Davide.
 8. Le attenzioni: cosa non si fa, cosa si fa sempre, segnali che fermano il lavoro e rimandano al medico, più quelle della scheda.
 9. Dove ci si allena: la modalità scelta oppure le quattro.
10. Come misuriamo: tabella Misura · Inizio · Fine del mese.
11. Il costo: due riquadri (Morena · 3 sedute · [€]) (I trattamenti con Davide restano come già concordati) e nota sui costi di palestra o struttura a parte.
12. E dopo il mese: programma a casa, Movimento 5, oppure un percorso Sinergia completo.
13. Prossimo passo e contatti: fissare le tre sedute e la modalità; contatti di Morena e di Davide; sito con QR; frase di tutela.

STILE
- Pagine di contenuto su crema #F6F3EA o carta #FDFCF8; copertina, pagina "dove ci si allena", costo e contatti su verde scuro #24493F. Accenti arancio #E8742A e #F2A46C, verde #2F5D51, sabbia #ECE8DA con bordo #DDD9C9, testo #22302B e #5C6B64, etichetta in maiuscoletto in rosso #A6522E su chiaro.
- Titoli in Fraunces, testo in Instrument Sans; marchio Che Postura in copertina. Piè di pagina "Che Postura! · Movimento 3" e numero di pagina. Nessun testo sotto i 24 px; nulla deve sforare la pagina.

A FINE RISPOSTA
- Elenca i campi rimasti tra parentesi quadre.
- Segnala contrasti con attenzioni o prescrizioni mediche.

SCHEDA CLIENTE
[SCHEDA CLIENTE]
````

---

## PROMPT C · Movimento 5 (5 sedute fisse con Morena per chi è già in cura da Davide)

````
Sei il redattore di Che Postura!, il percorso posturale unico di Davide Scuderi (massoterapista, chinesiologo, kinesiologo) e della Dott.ssa Morena Anastasi (chinesiologa, laureata in Scienze Motorie), a Modena. Prepara la proposta MOVIMENTO 5 per il paziente descritto nella scheda in fondo, come PDF in formato slide (16:9, una idea per pagina). Il paziente è già in cura da Davide nello studio di Via Capilupi: non riceve sedute in più con Davide, riceve un programma di movimento completo in cinque sedute fisse.

IL PACCHETTO
- Movimento 5: 5 sedute con Morena, una a settimana, circa cinque settimane. Il trattamento con Davide continua come già previsto; le due cose si parlano nel gestionale Che Postura.
- È il programma completo: dal respiro al gesto quotidiano, con un ritest a metà e uno alla fine, e un programma a casa che resta.
- Le cinque sedute sono fisse nella struttura, personalizzate negli esercizi (scelti dal quadro della scheda):
  Seduta 1 · Impostare: valutazione funzionale, foto di partenza se mancano, respiro diaframmatico, schiena neutra, consapevolezza della postura da sdraiato e da seduto.
  Seduta 2 · Liberare: allungamento delle catene accorciate (sotto soglia), mobilità delle articolazioni che Davide sta trattando (anche, dorso, spalle, caviglie secondo il quadro).
  Seduta 3 · Stabilizzare: muscoli profondi del tronco (dead bug, bird dog), glutei e scapole, ponte; ritest di metà percorso e aggiustamento del piano con Davide.
  Seduta 4 · Rinforzare in piedi: equilibrio su una gamba, alzarsi dalla sedia, chinarsi piegando le anche, mini-squat o scivolamenti al muro secondo il quadro, carichi leggeri con tecnica corretta.
  Seduta 5 · Integrare: i gesti veri della sua giornata (lavoro, sport, casa, giardino), routine da 5 minuti per i giorni senza seduta, ritest finale, foto di confronto, programma scritto a casa.
- Alla fine Davide e Morena si confrontano sui dati: mantenimento con il programma a casa, richiami con Morena a cadenza ridotta, oppure un percorso Sinergia completo.

REGOLE FISSE
- Italiano, dai del tu, parole semplici; ogni termine tecnico spiegato tra parentesi.
- Non inventare nulla: problematiche, esami, test, misure, date, prezzi e nomi di medici vengono solo dalla scheda. Quello che manca resta tra parentesi quadre e lo elenchi a fine risposta. Obiettivi assenti: ricavali dalle problematiche e scrivi che si confermano alla prima seduta.
- Nessuna diagnosi e nessuna promessa di guarigione. Metti sempre la frase: "Le misure posturali sono misure, non diagnosi: la diagnosi è di competenza medica. Trattamenti e attività motoria non sostituiscono le terapie del medico." Con una prescrizione medica si lavora dentro le sue indicazioni.
- Usa i cinque passi di Che Postura! e gli slogan "Due professionisti. Un solo percorso: il tuo." e "1 + 1 fa 3". Il paziente ha già fatto i passi 1–3 con Davide e continua a farli: il 4 è quello che aggiunge adesso, il 5 si fa a metà e alla fine.
- Davide e Morena si aggiornano dopo ogni seduta nel gestionale Che Postura: il paziente non racconta mai tutto da capo.

LE PAGINE
 1. Copertina: "Che Postura!" · "Movimento 5 · [NOME]" · "Cinque sedute per far durare il trattamento" · una riga sul programma · badge "1 + 1 fa 3" · nomi dei due professionisti.
 2. Da dove partiamo: "Le tue problematiche" e "Cosa sta trattando Davide"; esami se ci sono.
 3. Perché aggiungere il movimento: il trattamento libera, l'esercizio fissa; cosa cambia per lui in cinque settimane.
 4. Gli obiettivi: tabella Obiettivo · Chi se ne occupa · Come lo misuriamo · Quando (seduta 3 / seduta 5).
 5. I cinque passi: 1–3 con Davide (in corso), 4 adesso con Morena, 5 a metà e alla fine.
 6. Chi ti segue ora: Dott.ssa Morena Anastasi, con cosa lavora; la seduta parte dai tuoi dati, esercizi costruiti su di te, impari a farli bene, tutto resta registrato.
 7. Le cinque sedute in una pagina: cinque riquadri in fila (Impostare · Liberare · Stabilizzare · Rinforzare in piedi · Integrare) con una riga ciascuno.
 8. Cosa si fa seduta per seduta: tabella Seduta · Cosa si fa · Perché, con gli esercizi del quadro e le date se ci sono; come si incastrano con i trattamenti di Davide.
 9. Le attenzioni: cosa non si fa, cosa si fa sempre, segnali che fermano il lavoro e rimandano al medico, più quelle della scheda.
10. Dove ci si allena: la modalità scelta oppure le quattro.
11. Come misuriamo: tabella Misura · Inizio (seduta 1) · Metà (seduta 3) · Fine (seduta 5).
12. Il costo: due riquadri (Morena · 5 sedute · [€], eventuali rate) (I trattamenti con Davide restano come già concordati) e nota sui costi di palestra o struttura a parte.
13. E dopo le cinque sedute: mantenimento a casa, richiami con Morena, oppure un percorso Sinergia completo; si decide sui dati di inizio, metà e fine.
14. Prossimo passo e contatti: fissare le cinque sedute e la modalità; contatti di Morena e di Davide; sito con QR; frase di tutela.

STILE
- Pagine di contenuto su crema #F6F3EA o carta #FDFCF8; copertina, pagina delle cinque sedute, "dove ci si allena", costo e contatti su verde scuro #24493F. Accenti arancio #E8742A e #F2A46C, verde #2F5D51, sabbia #ECE8DA con bordo #DDD9C9, testo #22302B e #5C6B64, etichetta in maiuscoletto in rosso #A6522E su chiaro.
- Titoli in Fraunces, testo in Instrument Sans; marchio Che Postura in copertina. Piè di pagina "Che Postura! · Movimento 5" e numero di pagina. Nessun testo sotto i 24 px; nulla deve sforare la pagina.

A FINE RISPOSTA
- Elenca i campi rimasti tra parentesi quadre.
- Segnala contrasti con attenzioni o prescrizioni mediche.

SCHEDA CLIENTE
[SCHEDA CLIENTE]
````

---

## Prezzi

Nessuno dei tre prompt contiene prezzi: si scrivono nella scheda (Morena a seduta o a pacchetto, eventuali rate; per Sinergia Avvio anche la seduta di Davide). Se mancano, nel PDF restano `[€]`.
