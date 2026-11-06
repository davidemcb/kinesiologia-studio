# Prompt per le schede pazienti

Incollalo in una nuova sessione su questo repository, compila la parte tra parentesi quadre e lascia il resto com'è.

```text
Crea una scheda cliente per Kinesiologia Studio (Dott. Davide Scuderi, Modena) nello stile del sito.

CASO
- Cliente: [età, sesso, attività, lavoro]
- Problema: [sintomi, da quanto, sede, cosa lo peggiora e cosa lo migliora]
- Meccanismo scatenante: [gesto, carico, contesto]
- Cosa ho trovato in studio: [test fatti, forza, sensibilità, mobilità, dolenzie]
- Cosa ho già fatto e con quale risultato: [trattamento, risposta]
- Domande che il cliente mi ha fatto: [elenco, con le sue parole]
- Fase: [acuta / subacuta / ripresa del carico]
- Già visto da un medico? [sì/no, cosa ha detto, esami fatti]

STILE E FORMATO
- Leggi i token di colore e i caratteri da index.html del repository (variabili --brand, --accent, --danger, --ok, --surface, --ink, --muted; font Fraunces per i titoli e Instrument Sans per il testo) e usa quelli, con tema chiaro e scuro. Card con raggio 12, pill con raggio 999, fascia verde in testa con nome studio, titolo e sottotitolo, pill con fase e data.
- Produci una pagina HTML come artifact, poi un PDF A4 renderizzato con Chromium (Playwright, già installato): tema chiaro, sfondi stampati, layout a blocchi per la stampa, interruzioni di pagina tra le sezioni, nessuna card spezzata, nessuna pagina bianca. Controlla il PDF con un'anteprima di tutte le pagine prima di inviarlo.
- Piede di pagina: nome studio, telefono e WhatsApp +39 348 151 4382, infokinesiologia@gmail.com, frase "non sostituisce la visita medica".
- Salva HTML e PDF nella cartella schede/ del repository.

STRUTTURA, in quest'ordine
1. Il problema: cos'è, da dove deriva, cosa è successo nel gesto scatenante. Se il percorso del sintomo ha una forma (un nervo, una catena muscolare, un'articolazione), disegnala con un SVG semplice a stazioni numerate, ognuna collegata a un sintomo.
2. Le tue domande: una card per ogni domanda del cliente, con il suo perché spiegato in modo che lo capisca un non addetto. Usa analogie concrete (cavo, dimmer, cuscinetto) e nomi anatomici solo se seguiti da una spiegazione.
3. Indicazioni: due colonne, "Da fare" e "Da evitare", con il principio guida in una riga sopra.
4. Esercizi: tabella con esercizio, quante volte, quando; poi una card per esercizio con i passaggi numerati e la regola di stop (cosa vuol dire che va bene e cosa vuol dire che va male).
5. Attenzione: segnali da pronto soccorso lo stesso giorno (card rossa), segnali da chiamata al medico entro un giorno (card ambra), perché la visita medica non è rinviabile se serve, diario di controllo con una tabella da compilare e la misura di riferimento presa in studio.
6. Cosa aspettarsi: tempi realistici e fasi successive, con tre pill.

REGOLE DI CONTENUTO
- Scrivi al cliente, in seconda persona, italiano piano, frasi brevi. Niente promesse di guarigione.
- Nessuna diagnosi: descrivi il meccanismo probabile e di' che la conferma spetta al medico.
- Se c'è un deficit di forza, un disturbo di sensibilità, un sintomo notturno o un segno da bandiera rossa, la visita medica va indicata come urgente e non rinviabile, e gli esercizi di rinforzo del distretto debole vanno esclusi.
- Ogni esercizio deve avere dose, frequenza e regola di stop. Nessun esercizio che allunghi un nervo irritato, nessun carico nella direzione che ha causato il problema.
- Chiedi conferma al cliente sulle cose che non so dal caso, elencandole in fondo alla risposta, ma produci comunque la scheda completa con ipotesi dichiarate.
- Alla fine dimmi in poche righe cosa hai assunto e cosa devo verificare in studio prima di consegnarla.
```

Note:
- La sezione CASO è quella che conta. Più dettagli nei test e nelle domande del cliente, più le card "Le tue domande" escono precise.
- Fuori dal repository, sostituisci la prima riga di STILE con i valori fissi: verde #2F5D51, ambra #C98632, rosso #AC4530, sfondo #F4F3EC, testo #22302B, caratteri Fraunces e Instrument Sans.
