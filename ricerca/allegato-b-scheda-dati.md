# Allegato B — Scheda dati e dizionario delle variabili

I dati si raccolgono in un unico CSV: `dati/interviste.csv`
(template vuoto: `dati/interviste-template.csv` · esempio sintetico: `dati/interviste-esempio.csv`).

**Unità di analisi = il problema, non la persona.** Una persona che riferisce tre problemi
distinti genera tre righe con lo stesso `partecipante`.

---

## Dizionario

| Colonna | Tipo | Valori ammessi | Note |
|---|---|---|---|
| `id_riga` | testo | `P01-1`, `P01-2`… | partecipante + progressivo del problema |
| `partecipante` | testo | `P01`…`P30` | **pseudonimo**: l'anagrafica sta in un file separato, non versionato |
| `strato` | enum | `S1` `S2` `S3` | S1 pazienti · S2 ex pazienti · S3 esterni |
| `data` | data | `AAAA-MM-GG` | data dell'intervista |
| `problema_testo` | testo | verbatim | **le parole sue**, non le nostre |
| `situazione` | testo | libero | quando accade |
| `episodio_datato` | enum | `si` `no` | `no` ⇒ riga **esclusa dallo scoring** (è un'opinione) |
| `freq_sett` | numero | ≥ 0 | volte a settimana, contate sull'ultima settimana |
| `intensita` | 0–10 | intero | dichiarata |
| `durata_min` | numero | ≥ 0 | minuti per episodio |
| `impatto_testo` | testo | libero | cosa gli impedisce di fare |
| `soluzione_attuale` | testo | libero | vuoto = nessuna soluzione |
| `costo_eur_12m` | numero | ≥ 0 | € spesi negli ultimi 12 mesi per questo problema |
| `tempo_min_sett` | numero | ≥ 0 | minuti a settimana dedicati |
| `provate` | testo | `a; b; c` | soluzioni già provate, separate da `;` |
| `soddisfazione` | 0–10 | intero o vuoto | vuoto se non c'è soluzione attuale |
| `frustrazione` | 0–10 | intero | descrittiva, non entra in P |
| `desiderio` | 0–10 | intero | D |
| `urgenza` | 0–10 | intero | U — "nei prossimi 30 giorni" |
| `disp_dichiarata` | 0–10 | intero | **evidenza debole**: mai nello scoring |
| `b_evidenza` | enum | vedi sotto | comportamento **osservato**, non dichiarato |
| `ipotesi` | testo | `H1; H4` | codifica differita ≥24 h, dalla trascrizione |
| `codificatore` | testo | `DS` / `XX` | chi ha codificato (per la doppia codifica) |
| `note` | testo | libero | citazioni notevoli, dubbi, contesto |

### `b_evidenza` → B

| Valore | B | Significato |
|---|---|---|
| `nulla` | 0 | non ha mai fatto niente |
| `informazioni` | 2 | ha solo cercato informazioni |
| `prova_singola` | 4 | ha provato qualcosa di gratuito, una volta |
| `ricorrente_gratis` | 6 | pratica gratuita ricorrente, oppure un acquisto singolo < 30 € |
| `spesa_30_200` | 8 | ha speso 30–200 € negli ultimi 12 mesi |
| `spesa_ricorrente` | 10 | > 200 €/anno, o abbonamento attivo oggi |

**Coerenza obbligatoria:** `b_evidenza` deve essere compatibile con `costo_eur_12m` e
`tempo_min_sett`. `scoring.py` segnala le incoerenze e le esclude dai punteggi finché non
sono risolte.

---

## Regole di compilazione

1. **Verbatim.** `problema_testo` contiene le parole del partecipante. Se c'è scritto
   "disconnessione corporea" e lui ha detto "mi sento un tronco", il dato è già rovinato.
2. **Vuoto ≠ zero.** Campo non chiesto → vuoto. Campo chiesto con risposta "niente" → `0`.
3. **Niente codifica a caldo.** `ipotesi` si compila almeno 24 ore dopo, leggendo la trascrizione.
4. **Nessuna riga si modifica dopo il gate.** Correzioni: riga nuova + nota, mai sovrascrittura.
5. **Doppia codifica:** ≥ 6 righe su 30 vanno codificate anche da una seconda persona che
   riceve la trascrizione **senza** la codifica originale. Concordanza minima 70%.

---

## File e privacy

| File | Contenuto | Versionato in git |
|---|---|---|
| `dati/interviste-template.csv` | solo intestazioni | **sì** |
| `dati/interviste-esempio.csv` | righe **sintetiche** per collaudare lo script | **sì** |
| `dati/interviste.csv` | dati reali pseudonimizzati | **no** (`.gitignore`) |
| `dati/anagrafica.csv` | codice ↔ persona | **no**, e va tenuto offline |
| registrazioni audio | — | **no**, cancellate dopo la trascrizione |

`dati/interviste.csv` e `dati/anagrafica.csv` sono esclusi da git: contengono dati personali
di persone reali e questo repository è pubblico.
