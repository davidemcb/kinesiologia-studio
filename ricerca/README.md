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

**4. Si porta il report al gate**, si scrive il verdetto nel registro delle decisioni
(§17 del protocollo) e si decide: CONTINUA, MODIFICA o ABBANDONA.

---

## Stato

| Fase | Stato |
|---|---|
| Protocollo pre-registrato | ✅ v1.0 — 2026-08-26 |
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

## Le prime tre cose da fare

1. **Scrivere il fabbisogno economico mensile reale** (il numero `R` di §14.4). Serve a
   sapere, prima di partire, quanti clienti al mese deve produrre il modello per esistere.
2. **Trovare le 12 persone dello strato S3** — quelle senza nessun rapporto con lo studio.
   È la parte più lenta e l'unica che rende i dati validi.
3. **Fare le prime 3 interviste e non codificarle** per 24 ore, per verificare sul campo che
   la regola del silenzio e la codifica differita siano davvero sostenibili.
