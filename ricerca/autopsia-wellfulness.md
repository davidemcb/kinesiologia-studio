# Allegato G — Autopsia di Wellfulness

**Analisi retrospettiva dei dati già esistenti.** Da eseguire **in parallelo** alla Fase 1,
non dopo: non condivide partecipanti con le 30 interviste e non ne contamina il campione.

---

## 0. Perché vale più di 30 interviste nuove

Le interviste di Fase 1 producono evidenza E2–E5: episodi, soluzioni, costi, insoddisfazione.
Wellfulness ha già prodotto **E6 e oltre**: persone vere che hanno iniziato, praticato,
pagato, interagito con un tutor e **smesso**.

| Cosa serve | Fase 1 (30 interviste) | Autopsia |
|---|---|---|
| Prova che il problema esiste | ✅ | parziale |
| Prova che qualcuno agisce | ✅ | ✅ |
| Prova che qualcuno paga | dichiarata sul passato | ✅ **osservata** |
| **Quanto a lungo mantiene** | non misurabile | ✅ **osservata** |
| **Perché smette** | non misurabile | ✅ **osservata** |
| Costo di raccolta | alto | quasi zero |

Le ultime due righe sono la ragione di questo documento: sono **le uniche due domande che
decidono il progetto** (§13 del protocollo) e sono **le uniche due a cui una intervista
prospettica non può rispondere**. Nessuno sa dire in anticipo quando smetterà.

---

## 1. E perché è la parte più pericolosa della ricerca

Tre problemi, tutti seri.

**1. È il tuo progetto.** Il bias di conferma qui è al massimo, e ha una forma specifica:
la spiegazione "le persone non erano abbastanza motivate" è disponibile, comoda e quasi
sempre falsa. Se l'autopsia arriva a quella conclusione, l'autopsia è fallita.

**2. Sopravvivenza.** Chi è rimasto non è il mercato: è l'eccezione. Costruire il prodotto
sui rimasti significa costruirlo per la coda della distribuzione. **Chi se n'è andato conta
di più**, ed è precisamente chi è più difficile ricontattare.

**3. È retrospettiva e non controllata.** Nessun risultato di qui può dimostrare efficacia,
né falsificare HE. L'autopsia **genera ipotesi e priori**, non conclusioni. Alimenta il
disegno di §13.3 (le dosi da testare) e le priorità di Fase 1; non salta nessun gate.

> Prima di aprire i dati, scrivere una frase e conservarla:
> **"cosa mi aspetto di vedere, e cosa vedrei invece se il problema fosse il metodo e non le persone?"**

---

## 2. Inventario: cosa esiste davvero

Primo passo, prima di qualunque analisi. Per ciascuna voce: esiste / non esiste / esiste in
parte, e in quale formato.

| Dato | Dove potrebbe essere | Esiste? |
|---|---|---|
| Elenco iscritti con data di iscrizione | mail, foglio, piattaforma | ⬜ |
| Chi ha pagato, quanto, quando | estratti, fatture, Stripe/PayPal | ⬜ |
| Chi ha iniziato vs chi si è solo iscritto | log, gruppo, tutor | ⬜ |
| **Data dell'ultima pratica per persona** | log, messaggi, diario | ⬜ ← *il dato più importante* |
| Pratiche effettivamente svolte per giorno | idem | ⬜ |
| Messaggi scambiati con il tutor | chat, WhatsApp, mail | ⬜ |
| Motivi di abbandono già espressi | chat, mail, disdette | ⬜ |
| Rimborsi richiesti e motivazione | pagamenti | ⬜ |
| Materiali usati (audio, testi, durate) | archivio | ⬜ |
| Contatti riutilizzabili per essere ricontattati | mailing, rubrica | ⬜ |

**Se manca la data dell'ultima pratica**, si ricostruisce con la migliore approssimazione
disponibile (ultimo messaggio, ultimo accesso, ultima interazione col tutor) e si **dichiara
l'approssimazione**. Un dato ricostruito dichiarato vale; un dato ricostruito spacciato per
misurato non vale niente.

---

## 3. Le tre coorti

| Coorte | Definizione | Cosa insegna |
|---|---|---|
| **W0 — mai partiti** | iscritti, mai una pratica | il problema è nella **promessa** o nell'ingresso |
| **W1 — partiti e usciti** | ≥1 pratica, poi stop | il problema è nella **dose, nell'attrito o nell'effetto** |
| **W2 — rimasti** | attivi oltre 30 giorni | cosa rende una persona un caso raro |

I numeri assoluti contano meno delle proporzioni. Un progetto con W0 grande ha un problema di
messaggio; con W1 grande ha un problema di prodotto; con W2 minuscolo ma W1 lungo ha un
problema di formato. **Sono tre progetti diversi da sistemare.**

---

## 4. Le quattro analisi

### 4.1 Imbuto

```
contattati → iscritti → paganti → prima pratica → giorno 3 → giorno 7 → giorno 30
```

Ogni passaggio con numero assoluto e percentuale sul precedente. **Il gradino più ripido è
il problema principale**, e va identificato prima di formulare qualunque spiegazione.

### 4.2 Curva di sopravvivenza e giorno modale di abbandono

Per ogni persona: giorno dell'ultima pratica. Poi istogramma.

**Il giorno modale di abbandono è il singolo numero più informativo dell'intera autopsia**,
e le sue letture sono diverse e mutuamente esclusive:

| Picco di abbandono | Lettura |
|---|---|
| giorno 0–1 | promessa non mantenuta, o ingresso troppo faticoso |
| **giorno 2–4** | **dose troppo alta**: la vita reale è rientrata e non c'era spazio |
| giorno 7–10 | decadimento della novità; manca la ragione per continuare |
| giorno 14–21 | l'effetto c'era ma non bastava a giustificare il costo di tempo |
| distribuzione piatta | non c'è un punto di rottura: cause individuali, non strutturali |

### 4.3 Divario di dose (prescritta vs reale)

```
Divario = pratiche prescritte al giorno − pratiche effettivamente svolte al giorno
```

Da calcolare **giorno per giorno**, non in media. Se il divario si apre già al giorno 2 e non
si richiude più, la dose era fuori scala fin dall'inizio: e questo è un dato che si ottiene
gratis, oggi, e che vale direttamente come priore per il disegno delle tre dosi di §13.3.

Domanda collegata: **quante pratiche al giorno facevano davvero i rimasti (W2)?** Se anche
W2 ne faceva una invece di cinque, la dose reale del prodotto era già una — e nessuno lo
aveva scritto da nessuna parte.

### 4.4 Effetto tutor

Confronto fra chi ha interagito con il tutor e chi no, su durata e completamento.

**Attenzione all'inversione causale:** chi era già motivato scrive di più al tutor. Il tutor
può essere effetto della permanenza, non causa. L'unica lettura onesta è descrittiva; per una
lettura causale servirebbe un'assegnazione casuale, che qui non c'è. Se emerge una differenza
forte, diventa un braccio da testare in Esperimento 2, non una conclusione.

---

## 5. Interviste di uscita — il pezzo più prezioso

**Target: 8–12 persone della coorte W1** (uscite), più 3–4 di W0 (mai partite).
W2 si intervista per ultimo e conta meno.

### 5.1 Base legale e forma del contatto

Ricontattare vecchi iscritti richiede una base giuridica valida per il trattamento originario
e un contatto che **non sia commerciale**. Il messaggio dichiara che non c'è niente in vendita
— e deve essere vero, anche se la tentazione di riattivarli sarà forte.

> "Ciao, sto rivedendo da capo il percorso che avevi iniziato, e sto cercando di capire cosa
> non funzionava. Non c'è niente da comprare e non sto riaprendo nulla: mi servono 20 minuti
> per capire dove ho sbagliato io. Se non ti va, nessun problema, non ti scrivo più."

Chi non risponde non si ricontatta una seconda volta.

### 5.2 Le domande

**Regola: si chiede il comportamento, mai il giudizio.** "Perché hai smesso?" produce risposte
cortesi — *non avevo tempo* — che sono vere e inutili: nessuno ha tempo per niente, eppure
tutti fanno qualcosa. La versione utile è comportamentale.

| Invece di | Chiedere |
|---|---|
| "Perché hai smesso?" | "Qual è stato l'ultimo giorno in cui l'hai fatto? Cosa è successo quel giorno?" |
| "Non avevi tempo?" | "In quel momento della giornata, cosa hai fatto invece?" |
| "Ti è piaciuto?" | "Ti ricordi una volta in cui hai sentito qualcosa? Cosa hai sentito?" |
| "Era troppo?" | "Quante ne facevi davvero al giorno, verso la fine?" |
| "Torneresti?" | "Da quando hai smesso, hai provato qualcos'altro? Cosa?" |

Poi le due domande che valgono il colloquio:

> **"Cosa ti aspettavi che succedesse quando ti sei iscritto?"**
> (la distanza fra questa risposta e quello che il percorso faceva **è** il problema di posizionamento)

> **"Se ti dicessi che esiste una versione da un minuto al giorno, cosa penseresti?"**
> — da fare **solo alla fine**, e da registrare come E0: è un'opinione, e vale come opinione.

### 5.3 Codifica

Stesse regole della Fase 1: verbatim, codifica differita di 24 ore, scala E0–E6, righe nello
stesso CSV con `gruppo = W` e `strato = S2`. **Le righe W entrano nella scala di evidenza ma
restano identificabili e separabili in ogni report** — sono retrospettive e riguardano un
prodotto che non esiste più.

---

## 6. Domande pre-registrate

Scritte prima di guardare i dati. Per ognuna, cosa vedremmo **se avessimo torto**.

| # | Domanda | Se l'ipotesi comoda fosse falsa, vedrei… |
|---|---|---|
| **Q1** | Il gradino più ripido dell'imbuto qual è? | se è **prima** della prima pratica, il problema non è mai stato il metodo: era la promessa |
| **Q2** | Qual è il giorno modale di abbandono? | un picco al giorno 2–4 dice **dose**, non motivazione |
| **Q3** | I rimasti facevano davvero la dose prescritta? | se anche loro ne facevano una su cinque, la dose reale era già una |
| **Q4** | Chi ha pagato è rimasto di più di chi non ha pagato? | se no, il pagamento non crea impegno e la traccia "impegnata" di §13.1 non esiste |
| **Q5** | Chi è rimasto ha qualcosa in comune? | se hanno in comune **il rapporto con te** e non il problema, il prodotto non è scalabile: è un servizio |
| **Q6** | Le ragioni di uscita convergono? | se convergono su "troppo", conferma HD; se convergono su "non sentivo niente", il problema è HE e non la dose |

**Q5 è la domanda scomoda.** Se il fattore comune fra i rimasti è la relazione personale con
te, allora ciò che funzionava era la relazione, e un prodotto digitale che la rimuove
rimuove il principio attivo. Sarebbe un risultato negativo per l'app e **positivo per lo
studio** — e va accettato in quella forma, non riscritto.

---

## 7. Output

Un documento unico, `autopsia-risultati.md`, con:

1. inventario di cosa esisteva e cosa mancava
2. imbuto con numeri assoluti
3. curva di sopravvivenza + giorno modale
4. divario di dose giorno per giorno
5. tabella delle ragioni di uscita, codificate E0–E6
6. risposta scritta a Q1–Q6, **anche dove la risposta è "il dato non c'è"**
7. tre priori dichiarati per l'Esperimento 2: dose da testare, momento della giornata, durata

E una riga nel registro delle decisioni del protocollo master (§17).

**Cosa questo documento non produrrà mai:** una conclusione su se Touchfulness funziona.
Non è quello che i dati retrospettivi possono dire, e chiederglielo sarebbe il primo modo per
rovinare anche questa parte della ricerca.
