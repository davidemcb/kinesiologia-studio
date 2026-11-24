# Che Postura

Area riservata dello studio, online all'indirizzo `/chepostura/` del sito.


Gestionale posturale dello studio: Davide e Morena vedono tutti i pazienti, ogni paziente entra con email e password e vede solo le sue visite, foto, esercizi e referti.

| File | Cosa fa |
|---|---|
| `index.html` | Accesso, elenco pazienti (con fase e filtro), vista Richiami, scheda paziente con il percorso in fasi, area del paziente |
| `analisi.html` | Nuova visita: foto, analisi automatica, consulto, esercizi, PDF, salvataggio nella scheda |
| `api.js` | Collegamento ai dati: Supabase online, oppure demo nel browser |
| `config.js` | Indirizzo e chiave pubblica di Supabase (vuoti = demo) |
| `supabase.sql` | Tabelle, regole di sicurezza e archivio foto da creare su Supabase |
| `PERCORSO.md` | Il percorso in cinque fasi: chi guida, ritmo, profili, richiami. È la base del campo fase e della vista Richiami |
| `../questionario/` | Questionario prima della valutazione: le risposte arrivano su WhatsApp a Davide, le domande stanno in `questionario/domande.txt`. Link e condivisione dall'elenco clienti |

Finché `config.js` è vuoto l'area gira in **versione dimostrativa**, con pazienti inventati salvati solo nel browser.

## Attivarla (piano gratuito, senza carta di credito)

1. Su supabase.com: entra con GitHub, **New project**, regione **Central EU (Frankfurt)**, piano **Free**.
2. **SQL Editor → New query**: incolla tutto `supabase.sql` e premi **Run**.
3. **Authentication → Sign In / Providers → Email**: lascia attivo Email e **disattiva "Confirm email"** (l'accesso alla scheda lo protegge il codice dello studio).
4. **Project Settings → API**: copia **Project URL** e **anon public key** in `config.js`. La chiave `service_role` non va mai nel sito.
5. Davide e Morena si registrano dal sito ("Crea il tuo accesso"), poi in fondo a `supabase.sql` si tolgono i `--` dalle righe AMMINISTRATORI, si mettono le due email e si riesegue.

## Il percorso in fasi e i richiami

Ogni scheda ha una **fase** (0 ingresso, 1 sblocco, 2 ripristino, 3 consolidamento, 4 mantenimento), la data da cui è in quella fase e un **profilo** (acuto, semplice, moderato, cronico strutturale, ricorrente). Le fasi e il ritmo sono spiegati in `PERCORSO.md`.

- Con la prima valutazione salvata da `analisi.html` il cliente entra da solo in fase 1 (sblocco); il profilo segue il piano proposto.
- Nella scheda, il riquadro **Percorso** mostra la fase, da quanti giorni e il ritmo atteso. "Passa a …" manda alla fase successiva da oggi; "Modifica" permette di scegliere fase, data e profilo a mano. Il cliente vede la stessa barra nella sua area.
- Nell'elenco clienti ogni riga ha l'etichetta della fase e si può filtrare per fase.
- **Richiami** (pulsante in alto e riquadro "da richiamare"): chi rischia di perdersi. Regole: in mantenimento senza seduta con Davide (visita o trattamento) da oltre 4 mesi, 2 sul cronico; in fase 2 o 3 senza sedute da oltre 3 settimane; in fase 0 o 1 senza sedute da oltre 2 settimane; valutazione fatta ma fase mai assegnata. Da ogni riga si apre la scheda o si scrive su WhatsApp con un messaggio già pronto. Le soglie stanno in `RECALL_DAYS` in cima allo script di `index.html`.

Se l'area è già attiva su Supabase, rieseguire `supabase.sql` una volta: aggiunge le tre colonne (`phase`, `phase_since`, `profile`) senza toccare i dati.

## Come entra un paziente

1. Lo studio crea la scheda: il programma mostra un **codice di accesso** (valido 60 giorni, si usa una volta).
2. Il paziente va sull'Area riservata, crea email e password, inserisce il codice.
3. Da quel momento vede solo la sua scheda. Password persa: lo studio genera un nuovo codice e il paziente crea un nuovo accesso.

## Limiti del piano gratuito

- 1 GB di archivio: circa 1000 visite con foto e referto.
- Se per 7 giorni nessuno entra il progetto va in pausa: si riattiva dal pannello di Supabase, i dati restano.
- Nessun backup automatico: usare **Scarica backup** dall'elenco pazienti (dati senza foto).

Prima di aprire l'area ai pazienti: modulo di consenso aggiornato (area riservata, Supabase come fornitore) e DPA di Supabase firmato.
