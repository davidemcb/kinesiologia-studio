# Allegato B — Scheda dati e dizionario delle variabili

**Schema v2** (protocollo v1.1). I dati si raccolgono in un unico CSV: `dati/interviste.csv`
(template vuoto: `dati/interviste-template.csv` · esempio sintetico: `dati/interviste-esempio.csv`).

**Unità di analisi = il problema, non la persona.** Una persona che riferisce tre problemi
distinti genera tre righe con lo stesso `partecipante`.

---

## Dizionario

| Colonna | Tipo | Valori ammessi | Note |
|---|---|---|---|
| `id_riga` | testo | `P01-1`, `P01-2`… | partecipante + progressivo del problema |
| `partecipante` | testo | `P01`…`P30` | **pseudonimo**: l'anagrafica sta in un file separato, non versionato |
| `strato` | enum | `S1` `S2` `S3` | contaminazione: S1 pazienti · S2 ex pazienti · S3 esterni |
| `gruppo` | enum | `A` `B` `C` `W` | profilo (§4.1-bis) · `W` = coorte retrospettiva Wellfulness |
| `data` | data | `AAAA-MM-GG` | data dell'intervista |
| `problema_testo` | testo | verbatim | **le parole sue**, non le nostre |
| `situazione` | testo | libero | quando accade |
| **`evidenza`** | enum | `E0`…`E6` | §7.3 — **sostituisce `episodio_datato` e `b_evidenza`** |
| `freq_sett` | numero | ≥ 0 | volte a settimana, contate sull'ultima settimana |
| `intensita` | 0–10 | intero | dichiarata |
| `durata_min` | numero | ≥ 0 | minuti per episodio |
| `impatto_testo` | testo | libero | cosa gli impedisce di fare |
| `soluzione_attuale` | testo | libero | vuoto = nessuna soluzione |
| `costo_eur_12m` | numero | ≥ 0 | € spesi negli ultimi 12 mesi per questo problema |
| `costo_sostituzione_eur_anno` | numero | ≥ 0 | €/anno di ciò che usa già (app, abbonamenti) |
| `tempo_min_sett` | numero | ≥ 0 | minuti a settimana dedicati |
| `provate` | testo | `a; b; c` | soluzioni già provate, separate da `;` |
| `soddisfazione` | 0–10 | intero o vuoto | vuoto se non c'è soluzione attuale |
| `frustrazione` | 0–10 | intero | descrittiva, non entra in P |
| `desiderio` | 0–10 | intero | D |
| `urgenza` | 0–10 | intero | U — "nei prossimi 30 giorni" |
| `disp_dichiarata` | 0–10 | intero | **sempre E0**: mai nello scoring |
| `ipotesi` | testo | `H2; H4` | codifica differita ≥24 h, dalla trascrizione |
| `codificatore` | testo | `DS` / `XX` | chi ha codificato (per la doppia codifica) |
| `note` | testo | libero | citazioni notevoli, dubbi, contesto |

### `evidenza` → B

| E | Cosa ha detto | B | Nello scoring |
|---|---|---|---|
| `E0` | opinione ("mi piacerebbe") | — | **no** |
| `E1` | problema ricordato ("mi succede spesso") | — | **no** |
| `E2` | episodio concreto e datato | 0 | sì |
| `E3` | soluzione attuale in atto | 5 | sì |
| `E4` | costo misurabile (€ o ore) | 8 | sì |
| `E5` | insoddisfazione + ricerca attiva | 9 | sì |
| `E6` | acquisto recente | 10 | sì |

### Controlli automatici di `scoring.py`

| Controllo | Conseguenza |
|---|---|
| `evidenza` = E0 o E1 | riga registrata fra le scartate, esclusa dai punteggi |
| E ≥ 4 senza `costo_eur_12m` né `tempo_min_sett` | riga esclusa, avviso |
| E6 senza importo | riga esclusa, avviso |
| E ≤ 2 con costo > 0 | avviso: probabile E4 da ricodificare |
| E ≥ 3 con `soddisfazione` vuota | avviso: M non calcolabile |
| `strato` o `gruppo` non validi | riga esclusa / gruppo ignorato |
| schema v1 (`b_evidenza`) | convertito automaticamente **con avviso**: va ricodificato a mano |

---

## Regole di compilazione

1. **Verbatim.** `problema_testo` contiene le parole del partecipante. Se c'è scritto
   "disconnessione corporea" e lui ha detto "mi sento un tronco", il dato è già rovinato.
2. **Vuoto ≠ zero.** Campo non chiesto → vuoto. Campo chiesto con risposta "niente" → `0`.
3. **Niente codifica a caldo.** `ipotesi` ed `evidenza` si compilano almeno 24 ore dopo,
   leggendo la trascrizione.
4. **Il livello E lo assegna il codificatore**, mai l'intervistato, e riguarda il *tipo di
   prova*, non l'intensità del racconto. Una persona molto convincente che non ha mai fatto
   niente resta E1.
5. **Nessuna riga si modifica dopo il gate.** Correzioni: riga nuova + nota, mai sovrascrittura.
6. **Doppia codifica:** ≥ 6 righe su 30 vanno codificate anche da una seconda persona che
   riceve la trascrizione **senza** la codifica originale. Concordanza minima 70%, sia sulle
   ipotesi sia sul livello E.

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
