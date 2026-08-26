# Desk Research 01 — Mercato, concorrenza, aderenza, efficacia, prezzi

**Data:** 2026-08-26 · **Fase:** pre-interviste · **Fonte:** ricerca desk condotta da DS

> **Cosa fa questo documento:** restringe il campo e fissa i *benchmark esterni* contro cui
> leggere i dati che raccoglieremo.
> **Cosa NON fa:** non valida Touchfulness. Nessuna riga qui dentro fa passare un gate.

---

## 0. Stato delle fonti

Ogni dato usato come benchmark decisionale deve avere la fonte primaria agganciata **prima**
del gate in cui viene usato. Finché la casella è vuota, il numero orienta ma non decide.

| # | Dato | Fonte dichiarata | Verificata | Usato in |
|---|---|---|---|---|
| D1 | Italia 10ª economia wellness, ~140,6 mld $ | Global Wellness Institute | ⬜ | *nessun gate* (vedi §1) |
| D2 | 68% approccio proattivo alla salute; 35% cerca novità | NielsenIQ Italia | ⬜ | contesto |
| D3 | Priorità in crescita: dormire bene 59%, invecchiare bene 58% | NielsenIQ Italia | ⬜ | §3, ipotesi H9 |
| D4 | ~50% disposto a 88–400 €/mese per lifestyle wellness | NielsenIQ Italia | ⬜ | contesto prezzo |
| D5 | Attrition ponderata 24,7% negli RCT di app mindfulness (70 studi, n=9.258); 38,7% nei trial grandi | meta-analisi 2023 | ⬜ | **§13 soglie aderenza** |
| D6 | Retention mediana a 30 giorni 3,3% su 93 app di salute mentale; ~4,7% per mindfulness | studio su uso reale | ⬜ | **§13 soglie aderenza** |
| D7 | Effetto medio app salute mentale su stress percepito g = 0,27 (0,10 dopo correzione small-study) | meta-analisi 2024, 69 RCT | ⬜ | **§11–12 soglie efficacia** |
| D8 | Prezzi: Calm 49,99 €/anno (lifetime 329,99) · Meditopia ~49,99 €/anno · Petit BamBou 59,90 €/anno · Calming lifetime 49,95 € | App Store IT | ⬜ | **§14 test di prezzo** |
| D9 | Modello free→premium diffuso (es. percorso di scoperta gratuito senza carta) | App Store IT | ⬜ | §14 struttura offerta |

D5, D6, D7 sono i tre numeri che **spostano le soglie del protocollo**. Vanno verificati con
la fonte primaria prima del gate G3. Gli altri restano contesto.

---

## 1. Il dato di mercato non è evidenza

L'Italia come 10ª economia wellness da 140,6 miliardi (D1) **non entra in nessun gate.**

Un TAM di quella dimensione è compatibile con qualunque conclusione: è compatibile con
Touchfulness che funziona ed è compatibile con Touchfulness che non vende una copia. Non
discrimina fra le due, quindi non è informazione decisionale.

Vale la stessa cosa per D2 e D4: dicono che **esiste comportamento economico nel settore**,
non che esista disponibilità a pagare *per questo*. Serve a sapere che il settore non è
deserto — cosa che già sapevamo.

**Conclusione operativa:** nessun materiale di questo progetto, interno o esterno, deve usare
i numeri di mercato come argomento a favore. È esattamente il tipo di dato che fa sembrare
fondata una decisione che non lo è.

---

## 2. Cosa è escluso dalla scansione competitiva

Il campo digitale è saturo su quattro posizioni. Nessuna delle quattro è disponibile:

| Posizione | Perché è chiusa |
|---|---|
| "App di benessere" | categoria, non posizione |
| "Meditazione guidata" | Meditopia, 7Mind, Calm, Petit BamBou, La Mindfulness App — migliaia di contenuti ciascuna |
| "Audio per rilassarsi" | commodity, prezzo già a ~50 €/anno |
| "Tornare in contatto con se stessi" | astratto: non dice quando usarlo |

**Questo è il risultato più utile della desk research.** Non è un risultato incoraggiante ed
è per questo che vale: elimina quattro strade prima che costino qualcosa.

### La differenza strutturale rilevata

Le soluzioni esistenti passano quasi tutte per: **mente → respiro → meditazione → sonno**.
Il corpo compare come oggetto di osservazione (body scan) o di movimento (yoga), raramente
come **strumento attivo**: *"usa le tue mani per aumentare deliberatamente l'attenzione alle
sensazioni corporee"* è poco presidiato.

**Cosa autorizza e cosa no.** Autorizza a dire: esiste uno spazio poco occupato.
Non autorizza a dire: esiste una domanda. Uno spazio vuoto in un mercato saturo ha due
spiegazioni possibili, e la seconda è molto più comune della prima:

1. nessuno l'ha ancora presidiato → opportunità
2. è già stato provato e non funziona → spazio vuoto per una ragione

**Il protocollo deve distinguere fra le due, non presumere la prima.** Il modo per farlo è
il gate G2 (esiste comportamento economico su quel problema specifico?) e non l'entusiasmo
per l'originalità dell'idea.

---

## 3. Il vero campo di battaglia: l'aderenza, non l'efficacia

Qui la desk research produce la scoperta che cambia il progetto.

| | Efficacia | Aderenza |
|---|---|---|
| Stato del campo | g ≈ 0,27, che scende a 0,10 corretto (D7) | retention mediana a 30 giorni 3,3–4,7% (D6); attrition negli RCT 24,7–38,7% (D5) |
| Lettura | tutti ottengono un effetto piccolo | quasi nessuno riesce a far tornare le persone |

**Se l'effetto medio del campo è piccolo e uguale per tutti, l'efficacia non è un
differenziatore. Il differenziatore è l'aderenza.**

Questo riorienta l'intero progetto. La domanda centrale non è più *"Touchfulness funziona
meglio?"* — ammesso di batterla, si vincerebbe uno scarto piccolo su una misura dove tutti
sono simili. La domanda centrale diventa:

> **Qual è la dose minima che produce un effetto percepibile e che la persona mantiene
> davvero, senza sollecito, dopo 30 giorni?**

È la **DME — dose minima efficace mantenibile**. Entra nel protocollo come RQ8 e come
meta-ipotesi HD (§3.2 del protocollo master).

**Conseguenza diretta su Wellfulness:** cinque pratiche al giorno erano una richiesta
strutturalmente incompatibile con le basi di aderenza del settore. Non era un problema di
motivazione degli utenti né di qualità del contenuto: era una dose fuori scala. La regola
"più pratica = più valore" è teoricamente difendibile e commercialmente falsa, e da qui in
avanti nel protocollo è **trattata come ipotesi da falsificare, non come premessa**.

---

## 4. Attenzione a come si usa il 3,3%

D6 è il numero più citabile e il più facile da usare male.

Quel 3,3% è la **retention mediana a 30 giorni di app scaricate gratuitamente dagli store**.
Confrontarci una coorte di 20 persone che hanno pagato 67 € e conoscono personalmente chi
ha costruito il percorso significa confrontare due popolazioni diverse: la seconda parte da
una base molto più alta per costruzione (selezione, impegno economico, relazione).

**Regola operativa:** ogni soglia di aderenza del protocollo dichiara **contro quale base**
è misurata. Due tracce separate, mai mescolate:

- **traccia libera** (nessun pagamento, nessuna relazione) → benchmark 3,3–4,7%
- **traccia impegnata** (pagamento e/o relazione diretta) → benchmark da costruire; non
  esiste in D6 e non va preso in prestito

Usare il 3,3% come asticella per una coorte a pagamento renderebbe banale superarla, e il
successo sarebbe un artefatto del confronto sbagliato.

---

## 5. Attenzione a come si usa il g = 0,27

D7 è **il benchmark sbagliato per l'Esperimento 1**, e va detto prima di raccogliere i dati.

| | g = 0,27 (D7) | Esperimento 1 |
|---|---|---|
| Confronto | fra gruppi | dentro la stessa persona |
| Costrutto | stress percepito, misura di tratto | stato immediato |
| Tempo | dopo settimane di uso | dopo 3 minuti |

Un effetto acuto su una misura di stato si muove **molto più facilmente** di una misura di
tratto dopo settimane. Superare 0,27 in acuto **non è un risultato**: è quasi garantito da
qualunque cosa faccia fermare una persona per tre minuti — incluso il controllo.

Da cui due correzioni pre-registrate:

1. **Esperimento 1:** la soglia non si legge su D7. Si legge sul contrasto contatto vs
   controllo — Δ_T − Δ_C ≥ 1,0 punti e d_z del contrasto ≥ 0,5. Un effetto acuto che non
   batte nettamente una pausa non è un effetto del contatto.
2. **Efficacia a 30 giorni (§12):** *lì* D7 è il benchmark giusto. E il traguardo realistico
   è **la parità** (g ≈ 0,27), non il superamento. La parità sull'efficacia con un vantaggio
   sull'aderenza è una posizione difendibile; il contrario non lo è.

---

## 6. Prezzo: il confronto non è con il prezzo, è con il costo di sostituzione

D8 fissa il campo: **50–60 € all'anno** per cataloghi con centinaia o migliaia di contenuti.

67 € una tantum non è assurdo. Ma la domanda che il cliente si fa non è *"67 € sono tanti?"*.
È:

> *"Perché dovrei pagare 67 € una volta, quando con 50 € ho un anno intero di un'app piena
> di contenuti?"*

Risposte che non reggono: *"perché è più bello"*, *"perché è originale"*, *"perché è italiano"*,
*"perché c'è un metodo dietro"*.

L'unica risposta che regge ha questa forma: **"perché risolve precisamente X, che hai già
provato a risolvere con Y e non ci sei riuscito"** — e X e Y devono uscire dalle interviste,
non da noi.

Da cui:
- **nuova domanda obbligatoria in intervista** (Allegato A §4): *"cosa usi già oggi, e quanto
  ti costa all'anno?"* → campo `costo_sostituzione_eur_anno`
- **nuovo criterio di falsificazione F12** (§10 del protocollo): se al test di prezzo le
  persone qualificate non sanno articolare da sole perché questo e non un'app da 50 €/anno,
  HP è a rischio a prescindere dalla conversione osservata su un campione piccolo

D9 (free → premium) resta plausibile come struttura, ma è una **scelta di packaging da fare
dopo G4**, non una decisione da prendere adesso.

---

## 7. Vincolo di posizionamento (per la Fase 8, non prima)

Tutti i concorrenti promettono un risultato immediatamente comprensibile: *sonno*, *stress*,
*concentrazione*, *rilassamento*. Nessuno vende il proprio metodo per nome prima di aver
venduto il problema che risolve.

**Vincolo registrato: "Touchfulness" non è il messaggio d'ingresso.** L'ingresso ha la forma
*"quando ti succede X, prova questo"*. Il nome del metodo arriva dopo che la persona ha già
avuto l'esperienza.

Questo vale per i materiali del test di prezzo (§14): se il test viene fatto con un annuncio
che dice "Touchfulness", non si sta testando il prezzo — si sta testando la comprensibilità
del nome, e il risultato sarà basso per la ragione sbagliata.

---

## 8. Cosa cambia nel protocollo master

| Cambio | Dove | Motivo |
|---|---|---|
| Nuove ipotesi H16, H17, H18 | §3.1 | tre candidate della mappa DS non riducibili a H1–H15 |
| Nuova RQ8 e meta-ipotesi HD (dose minima efficace mantenibile) | §2, §3.2 | D5 + D6 |
| Scala di evidenza E0–E6 sostituisce `b_evidenza` | §7.3, §8 | scala DS, più fine e più ancorata al comportamento |
| Seconda dimensione di campionamento: gruppo A/B/C | §4 | reclutamento per profilo, ortogonale allo strato |
| Soglie di aderenza con colonna "confronto" e doppia traccia | §13 | D5, D6 e §4 di questo documento |
| Soglia Esperimento 1 spostata sul contrasto T−C | §11.5 | §5 di questo documento |
| Obiettivo efficacia a 30 giorni = parità con g ≈ 0,27 | §12 | §5 di questo documento |
| Nuovo criterio F12 (costo di sostituzione) | §10 | §6 di questo documento |
| Vincolo di posizionamento sui materiali del test di prezzo | §14 | §7 di questo documento |

Tutte registrate in §17 del protocollo master, con data.
