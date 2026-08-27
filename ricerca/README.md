# Ricerca Touchfulness

Cartella di ricerca e sviluppo. **Non contiene prodotto** — e non deve contenerlo finché il
protocollo non arriva al gate G5.

> **Regola zero:** non si costruisce il prodotto finché non esiste evidenza sufficiente del problema.

---

## Documenti

| File | Cosa contiene |
|---|---|
| [`PROTOCOLLO-MASTER.md`](PROTOCOLLO-MASTER.md) | Il documento principale: obiettivo, ipotesi, popolazione, metodo, scoring, criteri di conferma e falsificazione, decision tree, regole di decisione |
| [`allegato-a-traccia-intervista.md`](allegato-a-traccia-intervista.md) | Traccia dell'intervista cieca, frasi vietate, checklist pre e post |
| [`allegato-b-scheda-dati.md`](allegato-b-scheda-dati.md) | Dizionario delle variabili e regole di compilazione |
| [`allegato-d-esperimento-01.md`](allegato-d-esperimento-01.md) | Esperimento contatto vs controllo attivo |
| [`allegato-e-consenso.md`](allegato-e-consenso.md) | Consenso informato e privacy |
| [`desk-research-01.md`](desk-research-01.md) | Mercato, concorrenza, aderenza, efficacia, prezzi — e cosa ciascun dato autorizza a concludere |
| [`autopsia-wellfulness.md`](autopsia-wellfulness.md) | Analisi retrospettiva dei dati Wellfulness già esistenti, con il registro delle ipotesi H-W1…H-W7 |
| [`evidenze-scientifiche-01.md`](evidenze-scientifiche-01.md) | **Cosa hanno già trovato gli studi randomizzati sull'auto-tocco** — e cosa resta non testato |
| [`autopsia-risultati-01.md`](autopsia-risultati-01.md) | **I risultati sui dati storici reali** — 500 giorni, 5.292 messaggi, 86 persone |
| [`autopsia.py`](autopsia.py) | Imbuto, curva di sopravvivenza, giorno modale di abbandono, divario di dose |
| [`whatsapp_autopsia.py`](whatsapp_autopsia.py) | Autopsia di un gruppo dall'export di chat: sopravvivenza, canali, coorti, linguaggio |
| [`autopsia-risultati-02.md`](autopsia-risultati-02.md) | **Mining delle conversazioni**: matrice pratica × cambio di stato × trasferimento |
| [`chat_mining.py`](chat_mining.py) | Lo strumento del mining: pratica → effetto → trasferimento → interiorizzazione |
| [`scoring.py`](scoring.py) | Calcolatore dei punteggi e dei verdetti (Allegato C) |
| [`dati/`](dati/) | Template CSV e dataset di esempio |

---

## Come si usa

**1. Si raccolgono le interviste** seguendo l'Allegato A, con Touchfulness mai nominato.

**2. Si compila il CSV** copiando il template:

```bash
cp ricerca/dati/interviste-template.csv ricerca/dati/interviste.csv
```

`interviste.csv` è escluso da git: contiene dati di persone reali e questo repository è pubblico.

**3. Si calcolano i punteggi:**

```bash
python3 ricerca/scoring.py ricerca/dati/interviste.csv
python3 ricerca/scoring.py ricerca/dati/interviste.csv --righe punteggi.csv   # dettaglio per riga
python3 ricerca/scoring.py ricerca/dati/interviste.csv --json                 # output macchina
```

Solo libreria standard Python 3, nessuna dipendenza da installare.

Per vedere come si legge il report senza avere ancora dati veri:

```bash
python3 ricerca/scoring.py ricerca/dati/interviste-esempio.csv
```

*(quel dataset è **sintetico**: serve solo a collaudare lo script e a mostrare che aspetto ha
un'ipotesi viva, una morta e un artefatto di clientela.)*

**3-bis. Si analizza lo storico Wellfulness:**

```bash
cp ricerca/dati/wellfulness-template.csv ricerca/dati/wellfulness.csv   # poi si compila
python3 ricerca/autopsia.py ricerca/dati/wellfulness.csv
python3 ricerca/autopsia.py ricerca/dati/wellfulness-esempio.csv        # per vedere come si legge
```

Si compilano solo i campi che esistono davvero: lo script dichiara cosa manca e quali
conclusioni restano precluse senza quel dato.

**4. Si porta il report al gate**, si scrive il verdetto nel registro delle decisioni
(§17 del protocollo) e si decide: CONTINUA, MODIFICA o ABBANDONA.

---

## Stato

| Fase | Stato |
|---|---|
| Protocollo pre-registrato | ✅ v1.4 — 2026-08-27 |
| Desk Research 01 | ✅ completata — fonti primarie da agganciare (D5, D6, D7) |
| Evidenze scientifiche 01 | ✅ completata — 7 studi, 3 letti solo in abstract |
| Autopsia Wellfulness | 🟡 **primo blocco fatto** — mancano i report di presenza Zoom |
| Autopsia Wellfulness | ⬜ da avviare — **in parallelo alla Fase 1** |
| Fase 1 — interviste | ⬜ non iniziata |
| Gate G1 | ⬜ |
| Esperimento 1 | ⬜ |
| Gate G3 | ⬜ |
| Aderenza 7–30 giorni | ⬜ |
| Gate G4 | ⬜ |
| Test di prezzo reale | ⬜ |
| Gate G5 | ⬜ |
| Costruzione del prodotto | ⬜ **bloccata fino a G5** |

---

## Le prime quattro cose da fare

1. **Aprire l'inventario dell'autopsia Wellfulness** (Allegato G §2). È l'unica fonte che può
   già rispondere alle due domande che decidono il progetto — *quanto a lungo mantiene* e
   *perché smette* — e costa quasi zero. Il dato singolo più importante è **la data
   dell'ultima pratica per persona**.
2. **Scrivere il fabbisogno economico mensile reale** (il numero `R` di §14.4). Serve a
   sapere, prima di partire, quanti clienti al mese deve produrre il modello per esistere.
3. **Reclutare per gruppo (A/B/C, 10+10+10)** con il vincolo di almeno 12 persone in S3.
   È la parte più lenta e l'unica che rende i dati validi.
4. **Fare le prime 3 interviste e non codificarle** per 24 ore, per verificare sul campo che
   la regola del silenzio e la codifica differita siano davvero sostenibili.

## Quello che la letteratura ha già deciso

Tre risultati dalle [Evidenze scientifiche 01](evidenze-scientifiche-01.md) che cambiano il
progetto prima di raccogliere un solo dato nostro:

1. **Sullo stress l'auto-tocco è alla pari con la meditazione. Sulle misure corporee la
   batte.** Posizionarsi su stress e sonno significa combattere senza vantaggio; il corpo è
   l'unico terreno con un vantaggio dimostrato su controllo attivo.
2. **Più sessioni aumentano l'effetto, sessioni più lunghe no.** La frequenza di Wellfulness
   era l'istinto giusto sull'efficacia — ed è quello sbagliato sull'aderenza. L'ottimo è
   interno e si calcola.
3. **A 20 secondi al giorno, il 38% pratica quasi ogni giorno per un mese — e l'effetto
   esiste solo in chi pratica.** Sull'analisi che include tutti, l'effetto è zero.

## Quello che dicono i dati storici reali

Dall'[Autopsia — Risultati 01](autopsia-risultati-01.md), sull'export dei due gruppi WhatsApp:

- **In 500 giorni e 5.292 messaggi il denaro non compare mai.** Gli anelli mancanti erano
  Acquisizione e Acquisto, non l'aderenza.
- **Mediana: 5,5 giorni attivi su 500.** La permanenza lunga era un'illusione di calendario.
- **Del corpo si parla 25 volte più che dello stress** — stessa conclusione della letteratura,
  da una fonte che non ha niente in comune con essa.
- **1.883 sessioni dal vivo, cinque al giorno, una persona sola.** Il sistema si è fermato
  quando si è fermato chi lo erogava.
- **"Touchfulness": zero occorrenze nel corpo dei messaggi in 500 giorni.** Le persone
  descrivono ciò che succede loro, mai il nome del metodo.
- **Piedi e meditazione: stesso cambio di stato (~35–39%), trasferimento 12,3% contro 3,2%.**
  La pratica che le persone si portano nella vita reale è quella dei piedi.

## Da agganciare prima del gate G3

Tre numeri della desk research spostano le soglie del protocollo e vanno verificati con la
fonte primaria: **D5** (attrition 24,7%), **D6** (retention 3,3% a 30 giorni), **D7**
(g = 0,27). Finché la casella "verificata" è vuota, orientano ma non decidono.
