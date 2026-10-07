# Area riservata

Gestionale posturale dello studio: Davide e Morena vedono tutti i pazienti, ogni paziente entra con email e password e vede solo le sue visite, foto, esercizi e referti.

| File | Cosa fa |
|---|---|
| `index.html` | Accesso, elenco pazienti, scheda paziente, area del paziente |
| `analisi.html` | Nuova visita: foto, analisi automatica, consulto, esercizi, PDF, salvataggio nella scheda |
| `api.js` | Collegamento ai dati: Supabase online, oppure demo nel browser |
| `config.js` | Indirizzo e chiave pubblica di Supabase (vuoti = demo) |
| `supabase.sql` | Tabelle, regole di sicurezza e archivio foto da creare su Supabase |

Finché `config.js` è vuoto l'area gira in **versione dimostrativa**, con pazienti inventati salvati solo nel browser.

## Attivarla (piano gratuito, senza carta di credito)

1. Su supabase.com: entra con GitHub, **New project**, regione **Central EU (Frankfurt)**, piano **Free**.
2. **SQL Editor → New query**: incolla tutto `supabase.sql` e premi **Run**.
3. **Authentication → Sign In / Providers → Email**: lascia attivo Email e **disattiva "Confirm email"** (l'accesso alla scheda lo protegge il codice dello studio).
4. **Project Settings → API**: copia **Project URL** e **anon public key** in `config.js`. La chiave `service_role` non va mai nel sito.
5. Davide e Morena si registrano dal sito ("Crea il tuo accesso"), poi in fondo a `supabase.sql` si tolgono i `--` dalle righe AMMINISTRATORI, si mettono le due email e si riesegue.

## Come entra un paziente

1. Lo studio crea la scheda: il programma mostra un **codice di accesso** (valido 60 giorni, si usa una volta).
2. Il paziente va sull'Area riservata, crea email e password, inserisce il codice.
3. Da quel momento vede solo la sua scheda. Password persa: lo studio genera un nuovo codice e il paziente crea un nuovo accesso.

## Limiti del piano gratuito

- 1 GB di archivio: circa 1000 visite con foto e referto.
- Se per 7 giorni nessuno entra il progetto va in pausa: si riattiva dal pannello di Supabase, i dati restano.
- Nessun backup automatico: usare **Scarica backup** dall'elenco pazienti (dati senza foto).

Prima di aprire l'area ai pazienti: modulo di consenso aggiornato (area riservata, Supabase come fornitore) e DPA di Supabase firmato.
