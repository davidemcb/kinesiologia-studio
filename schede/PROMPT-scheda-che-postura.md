# Prompt per la scheda Che Postura

Incollalo in una nuova sessione su questo repository, compila la parte tra parentesi quadre e lascia il resto com'è. I campi del CASO sono gli stessi del consulto di Che Postura (chepostura/analisi.html), così puoi copiarli dal referto.

```text
Crea la scheda posturale per un cliente di Kinesiologia Studio (Dott. Davide Scuderi e Morena Anastasi, Modena) a partire dalla valutazione fatta con Che Postura, nello stile del sito.

CASO
- Cliente: [nome, età, sesso, lavoro, sport o attività, ore seduto al giorno]
- Perché è venuto: [dolore o fastidio, sede, da quanto, cosa lo peggiora e cosa lo migliora; oppure "controllo posturale senza dolore"]
- Fase: [acuto da meno di 6 settimane / subacuto / cronico da più di 3 mesi / ricorrente] · Dolore oggi: [0–10]
- Foto analizzate: [frontale, posteriore, laterale destra, laterale sinistra, talloni] con altezza [cm]
- Misure dalle foto: [filo a piombo: testa, spalle, bacino, ginocchia rispetto alla linea; inclinazione spalle in gradi e lato alto; inclinazione bacino in gradi e lato alto; testa avanti in cm; curve laterali: dorso, lombare; indice di mobilità /100 se fatto]
- Consulto, bacino: [sagittale: anteroversione / retroversione / neutro; frontale: emipelvi più alta dx / sx / pari; trasverso: rotazione dx / sx / nessuna]
- Consulto, collo spalle mandibola: [testa avanti / neutra; inclinata verso dx / sx; ruotata verso dx / sx; spalla più alta dx / sx; spalle anteposte sì / no; mandibola devia verso dx / sx / dritta; serramento o bruxismo sì / no]
- Consulto, respiro e piedi: [respiro alto o diaframma in tensione sì / no; tallone: pronato / supinato / neutro, dx e sx]
- Cicatrici, protesi, interventi: [sede, anno, dolorosa sì / no; oppure nessuna]
- Test fatti e esito: [nome del test del catalogo di Che Postura e esito: positivo / negativo / non fatto, con il lato; es. "Thomas positivo dx (ileopsoas)", "Trendelenburg negativo", "piccolo pettorale corto bilaterale", "trapezio inferiore debole sx"]
- Test di sicurezza: [segnali d'allarme, neurologico, vascolare cervicale, stabilità cervicale: tutti negativi, oppure quale è positivo]
- Muscoli confermati: [tesi o accorciati: elenco] · [deboli o inibiti: elenco] · [esclusi al test: elenco]
- Catena o schema: [es. schema crociato superiore, schema crociato inferiore, catena anteriore corta, torsione iliaca sx anteriore dx posteriore, componente ascendente dai piedi, componente discendente da bocca o occhi]
- Trattamento fatto oggi e risposta: [cosa, ritest a fine seduta, come è uscito]
- Esercizi scelti nel consulto: [nome, dose, tipo di lavoro: mobilità / allungamento / attivazione / forza / respiro / equilibrio]
- Piano: [lieve / moderato / complesso / con dolore acuto / prima il medico] · Data del consulto: [gg/mm/aaaa] · Plantari o bite consegnati: [sì / no]
- Domande che il cliente mi ha fatto: [elenco, con le sue parole]
- Già visto da un medico? [sì / no, cosa ha detto, esami fatti]
- Note per chi segue il movimento (Morena): [carichi, cose da evitare, cosa controllare; non vanno nella scheda del cliente]

STILE E FORMATO
- Leggi i token di colore e i caratteri da index.html del repository (variabili --brand, --accent, --danger, --ok, --surface, --ink, --muted; font Fraunces per i titoli e Instrument Sans per il testo) e usa quelli, con tema chiaro e scuro. Card con raggio 12, pill con raggio 999, fascia verde in testa con nome studio, titolo "La tua postura" con il nome del cliente, sottotitolo, pill con piano, dolore e data. Se nel repository esiste schede/scheda-laura.html, usalo come modello di impaginazione.
- Produci una pagina HTML come artifact, poi un PDF A4 renderizzato con Chromium (Playwright, già installato): tema chiaro, sfondi stampati, interruzioni di pagina tra le sezioni, nessuna card spezzata, nessuna pagina bianca. Controlla il PDF con un'anteprima di tutte le pagine prima di inviarlo.
- Piede di pagina: nome studio, telefono e WhatsApp +39 348 151 4382, infokinesiologia@gmail.com, frase "non sostituisce la visita medica".
- Salva HTML e PDF nella cartella schede/ del repository.

STRUTTURA, in quest'ordine
1. La tua postura in foto: cosa misurano le quattro foto e il filo a piombo, spiegato con parole semplici. Un SVG con la sagoma vista di fronte e di lato, la linea verticale e le stazioni numerate (testa, spalle, bacino, ginocchia, piedi), ognuna con la misura trovata e cosa vuol dire. Nessun numero senza spiegazione di cosa cambia per il cliente.
2. Cosa abbiamo trovato: lo schema (es. schema crociato) raccontato come una catena di cause, dal punto che si è adattato al punto che fa male. Tabella con tre colonne: zona, muscoli che tirano troppo, muscoli che lavorano poco, in italiano piano con il nome anatomico tra parentesi. Spiega che i muscoli tesi si allentano e i muscoli deboli si allenano, e che fare il contrario peggiora.
3. I test che abbiamo fatto: una riga per test positivo, con cosa misura e cosa ha mostrato. I test negativi in una riga sola, come cose escluse. Se un test di sicurezza è positivo, questa sezione va prima di tutto e dice che prima viene il medico.
4. Le tue domande: una card per ogni domanda del cliente, con il suo perché spiegato in modo che lo capisca un non addetto. Analogie concrete, nomi anatomici solo se seguiti da una spiegazione.
5. Indicazioni: due colonne, "Da fare" e "Da evitare", con il principio guida in una riga sopra. Includi scrivania, telefono, sonno, borsa o zaino, scarpe, e, se presenti, plantari e bite con come usarli.
6. Esercizi: tabella con esercizio, quante volte, quando; poi una card per esercizio con i passaggi numerati, il muscolo su cui lavora e la regola di stop. Solo gli esercizi scelti nel consulto, nella dose scelta. Nessun carico sui muscoli deboli finché il dolore è sopra 3/10 nel piano acuto.
7. Il percorso: il piano scelto con le date dei controlli a partire dalla data del consulto, la proposta Sinergia in due card (Davide, trattamento; Morena, movimento), le tre fasi a 12 settimane (liberare e riequilibrare; stabilizzare e rinforzare; integrare e mantenere) e come misuriamo i progressi (foto Dopo, ritest dei positivi, pedana se c'è). Spiega perché il trattamento da solo non basta e perché il lavoro sul movimento è la parte che fa durare il risultato.
8. Attenzione: segnali da pronto soccorso lo stesso giorno (card rossa), segnali da chiamata al medico entro un giorno (card ambra), perché la visita medica non è rinviabile se serve, diario di controllo con tabella da compilare e le misure di riferimento prese in studio (dolore su 10, misure dalle foto, test da ripetere).
9. Cosa aspettarsi: tempi realistici per fase, con tre pill, e cosa cambia se il cliente salta le sedute o gli esercizi.

REGOLE DI CONTENUTO
- Scrivi al cliente, in seconda persona, italiano piano, frasi brevi. Niente promesse di guarigione e niente "postura perfetta": l'obiettivo è una postura che costa meno fatica e fa meno male.
- Nessuna diagnosi: descrivi il meccanismo probabile e di' che la conferma spetta al medico. Non chiamare "scoliosi", "ernia" o "artrosi" quello che si vede in foto.
- Se un test di sicurezza è positivo, o c'è un deficit di forza, un disturbo di sensibilità, un sintomo notturno o un segno da bandiera rossa, il piano è "prima il medico": la visita va indicata come urgente, niente manipolazioni e niente esercizi di rinforzo del distretto coinvolto.
- Ogni esercizio deve avere dose, frequenza e regola di stop. Nessun esercizio che allunghi un nervo irritato, nessun allungamento di un muscolo già debole o allungato, nessun rinforzo di un muscolo già accorciato prima di averlo allentato.
- Le note per chi segue il movimento non vanno nella scheda del cliente: producile a parte, in un blocco di testo copiabile per WhatsApp, con i muscoli confermati, le cose da evitare e i carichi.
- Chiedi conferma al cliente sulle cose che non so dal caso, elencandole in fondo alla risposta, ma produci comunque la scheda completa con ipotesi dichiarate.
- Alla fine dimmi in poche righe cosa hai assunto e cosa devo verificare in studio prima di consegnarla.
```

Note:
- La riga che conta di più è "Muscoli confermati": tesi, deboli, esclusi. La scheda sceglie gli esercizi e il "da evitare" da lì. Se la lasci vuota, il programma deduce i muscoli dallo schema e te lo segnala in fondo.
- I nomi dei test vanno presi dal catalogo di Che Postura (chepostura/test-catalogo.js), così la scheda sa cosa misura ciascuno e lo spiega al cliente.
- Fuori dal repository, sostituisci la prima riga di STILE con i valori fissi: verde #2F5D51, ambra #C98632, rosso #AC4530, sfondo #F4F3EC, testo #22302B, caratteri Fraunces e Instrument Sans.
