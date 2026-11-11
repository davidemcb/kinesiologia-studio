# Questionario prima della valutazione

Pagina pubblica: **https://davidemcb.github.io/kinesiologia-studio/questionario/**

Il cliente risponde dal telefono e preme "Invia su WhatsApp": si apre WhatsApp con tutte le risposte già scritte, dirette a Davide. Il sito non salva nulla. I referti il cliente li manda in foto nella stessa chat.

Il sito Che Postura ha un questionario suo, separato, con le domande di Morena.

## Cambiare le domande (senza programmare)

Le domande stanno nel file **`domande.txt`**. Per modificarle:

1. Apri https://github.com/davidemcb/kinesiologia-studio/edit/main/questionario/domande.txt (serve un account GitHub con accesso al progetto).
2. Modifica il testo come in un blocco note.
3. In alto a destra premi **Commit changes**, poi ancora **Commit changes** nella finestra che si apre.
4. Dopo 1-2 minuti la pagina online è aggiornata.

### Regole del file

- Le righe che iniziano con `#` sono appunti e non si vedono.
- Una sezione inizia con `== Titolo`. Una riga sotto che inizia con `>` è la frase di spiegazione.
- Ogni domanda sta su una riga: `Domanda | tipo | dettagli`
  - tipi: `testo` (una riga), `testo lungo` (più righe), `una scelta`, `più scelte`
  - per le scelte, nei dettagli vanno le voci separate da virgola
  - per i testi, nei dettagli si può mettere un esempio in grigio (facoltativo)
  - un `*` alla fine della domanda la rende obbligatoria
- In alto: `titolo =`, `intro =` e `destinatario = Nome | numero WhatsApp` (il primo destinatario è quello predefinito).

Se una riga è scritta male, la pagina la ignora e mostra il resto.
