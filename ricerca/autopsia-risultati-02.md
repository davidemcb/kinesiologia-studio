# Autopsia Wellfulness — Risultati 02: mining delle conversazioni

**Data:** 2026-08-27 · **Fonte:** stesso corpus di [Risultati 01](autopsia-risultati-01.md)
**Strumento:** `python3 ricerca/chat_mining.py <_chat.txt> --erogatore "..."` (nuovo, Allegato G)
**Domanda:** dentro il metodo, *quale pratica* genera descrizioni spontanee di cambiamento —
e quale viene usata fuori dal contesto guidato?

> **Privacy:** solo aggregati e frammenti non identificanti. I nomi non compaiono mai.

---

## 0. Verifiche incrociate e correzioni (prima dei risultati)

I conteggi di due analisi indipendenti sullo stesso corpus non coincidevano. Riconciliati:

| Voce | Conteggio DS | Verificato sul corpus | Spiegazione |
|---|---|---|---|
| Messaggi | 5.178 | **5.034 di contenuto** (5.485 righe-messaggio totali) | filtri diversi sui messaggi di sistema e media |
| Partecipanti | 92 nominativi | **82 hanno scritto almeno un messaggio** | 10 presenti solo in eventi di sistema |
| Abbandoni espliciti | 50 | **50 ✓** | confermato |
| Rimozioni | 11 | 7 "Hai rimosso" | probabile doppio conteggio con altri eventi |
| Ingressi via link | 22 | **2** "ha usato il link d'invito" | gli altri sono "Hai aggiunto" (29) |
| "Touchfulness" nei messaggi | ~0 | **0 esatto** | le 53 occorrenze grezze sono tutte dentro i nomi di 2 contatti in rubrica |

**Due errori nostri, corretti:**

1. **Risultati 01 §8 diceva "l'export non registra chi è uscito". Falso:** i 50 abbandoni sono
   nel file, riga per riga con la data. Il mio filtro li scartava male — contava quegli eventi
   (e i media omessi) come messaggi di contenuto. Corretto `whatsapp_autopsia.py`; le
   conclusioni di Risultati 01 reggono (mediana giorni attivi invariata a 5,5) ma gli
   scriventi reali sono **82**, e le persone attive un solo giorno salgono da 10 a **18 (22%)**.
   Il quadro peggiora leggermente, nella direzione già dichiarata.
2. I "22 ingressi via link" non esistono: sono 2. La crescita organica era ancora più
   debole di quanto scritto.

---

## 1. "Touchfulness": zero occorrenze in 500 giorni

Nessun partecipante — nemmeno una volta, in 5.034 messaggi — usa il nome del metodo per
descrivere quello che fa. Il nome compare solo nei nomi di contatto della rubrica di chi ha
esportato la chat.

Le persone descrivono **quello che succede loro**: piedi, mani, pancia, respiro, tensioni,
calma, presenza, centratura.

Questo conferma sul campo il vincolo di posizionamento già pre-registrato in v1.1 (§14.1-ter:
il nome non è il messaggio d'ingresso) e lo rafforza: **non è che il nome "non serve" — è che
non è mai entrato nel linguaggio di chi pure viveva l'esperienza con entusiasmo.**
L'esperienza è più comprensibile del brand.

---

## 2. La matrice pratica × segnali

Corpus: 840 messaggi sostanziali di 65 persone. Ogni messaggio classificato su quattro assi
indipendenti: pratica citata · descrive un **cambio di stato** (prima/dopo) · descrive un
**trasferimento** (uso fuori dal contesto guidato) · descrive **interiorizzazione** (pratica
da soli, mentalmente, senza collegarsi).

| Pratica | Msg | Persone | % cambio di stato | % trasferimento |
|---|---|---|---|---|
| respiro | 67 | 22 | 19,4% | 7,5% |
| mani | 62 | 21 | 19,4% | 4,8% |
| **meditazione** | 62 | 24 | **38,7%** | **3,2%** |
| **piedi** | 57 | 18 | **35,1%** | **12,3%** |
| pancia e diaframma | 47 | 19 | 25,5% | 4,3% |
| viso e testa | 44 | 21 | 27,3% | 4,5% |
| automassaggio | 38 | 23 | 18,4% | 5,3% |
| movimento | 21 | 12 | 23,8% | 4,8% |
| linfatico | 7 | 5 | 57,1% | 0,0% |

*(categorie sovrapposte: un messaggio può citare più pratiche; linfatico ha n troppo piccolo
per dire qualcosa)*

### La dissociazione che decide

**Meditazione e piedi hanno lo stesso tasso di cambio di stato (≈36–39%) ma un tasso di
trasferimento quadruplo l'una dall'altra:**

- **meditazione**: molto cambio di stato, **quasi zero trasferimento** (3,2%). Funziona
  *dentro* la sessione. È anche la categoria più affollata del mercato.
- **piedi**: stesso cambio di stato, **il trasferimento più alto del corpus** (12,3%).
  Dal dentista, in macchina, al lavoro. È la pratica che le persone si portano via.

L'intuizione "piedi → alta applicabilità quotidiana" trova riscontro nei numeri. Con la
cautela dovuta: 57 messaggi, 18 persone, keyword matching. È un **priore forte per la scelta
della micro-esperienza dell'Esperimento 1**, non una conclusione.

---

## 3. La catena pratica → capacità → uso spontaneo esiste, ed è piccola

| Segnale | Messaggi | Persone (su 65 nel corpus) |
|---|---|---|
| descrive un cambio di stato | 127 | 33 |
| **trasferimento nella vita reale** | 26 | **15** |
| **interiorizzazione** (pratica da soli/mentalmente) | 14 | **11** |
| trasferimento **e** interiorizzazione | — | **6** |

La sequenza che interessa — *pratica guidata → interiorizzazione → auto-utilizzo in situazioni
reali* — **è documentata**. Il caso più pulito, verificato verbatim: intervento dal dentista,
un'ora, *"sentivo il cuore che batteva fortissimo… ho ascoltato i piedi, le mani e il
respiro… mi sono tranquillizzata"*, con l'aggiunta *"sto iniziando a portare anche nella mia
vita di tutti i giorni"*. Struttura completa: situazione reale → uso spontaneo → effetto
percepito → trasferimento dichiarato.

**Ed è rara: 15 persone su 82 scriventi (18%), 6 con la catena completa.** Due letture
compatibili, non distinguibili con questi dati:

- il trasferimento è l'esito naturale ma lento, raggiunto solo da chi resta abbastanza;
- il trasferimento è la competenza che il formato non insegnava esplicitamente, emersa
  per caso in alcuni.

Se è vera la seconda, **il prodotto è l'insegnamento esplicito del trasferimento** — non la
pratica quotidiana in sé. È la differenza fra vendere sessioni e vendere una capacità.
Decidere quale lettura è vera è esattamente ciò che misura l'ipotesi HT (sotto, §6).

---

## 4. Le uscite esplicite: erosione, non rottura

50 abbandoni espliciti in 15 mesi, ~3 al mese, con due picchi: **settembre 2025 (10)** e
**dicembre 2025 (7)**.

Nessun esodo, nessun evento unico: un logoramento costante — coerente con la dissolvenza di
Risultati 01, e con H-W3 (apprezzamento senza ragione per restare). I due picchi sono la prima
domanda concreta per le interviste di uscita: **cosa è successo a settembre 2025?** (Ripresa
post-estate? Un cambio di formato? Il registro delle decisioni di allora non esiste — un
motivo in più perché questo protocollo ce l'abbia.)

---

## 5. Il confondente gruppo, e cosa isola davvero l'Esperimento 1

Nelle chat il valore relazionale è dichiarato in continuazione (*"l'energia del gruppo"*,
*"avvolta come una coperta"*, *"la presenza dei compagni aggiunge un valore inestimabile"* —
verificati nel corpus). Qualunque effetto osservato in quel contesto è:

```
Effetto = pratica + gruppo + guida + aspettativa + rituale + attenzione ricevuta
```

Quindi nessun dato storico attribuisce niente a Touchfulness in sé. Giusto. Ma il disegno
sperimentale del protocollo **già tiene conto di questo**, e conviene dirlo con precisione
invece di progettare subito un fattoriale a 4 bracci:

| Componente | Esperimento 1 (cross-over T vs C) | Come |
|---|---|---|
| guida / attenzione ricevuta | **controllata** | stessa persona presente in entrambe le condizioni |
| gruppo | **controllata** | assente in entrambe |
| aspettativa | mitigata | stesse parole, questionari a freddo, analisi in cieco |
| **contatto** | **isolata** | è l'unica differenza fra T e C |

Il fattoriale A/B/C/D (da solo / con guida / con gruppo / controllo) è la domanda giusta **per
l'Esperimento 2 e oltre**, quando si testa il formato. Regola pre-registrata da subito:
**l'Esperimento 2 si eroga individualmente, senza gruppo** — altrimenti la dose si confonde
con la relazione e non si impara niente. Il gruppo si testa dopo, come moltiplicatore di
aderenza (H-W7), non mescolato alla dose.

---

## 6. Le tre ipotesi nuove, mappate su quelle esistenti

Le tre ipotesi emerse da questa lettura **non aprono una tassonomia parallela**: due esistono
già nel protocollo, una è nuova e va registrata.

| Proposta | Nel protocollo | Stato |
|---|---|---|
| *H-T1: il valore è l'aumento rapido di presenza corporea, non il rilassamento* | **HE riformulata** — già fatto in v1.2: Y primaria corporea, non stress. Questo mining è la terza fonte convergente (letteratura + linguaggio spontaneo + cluster "mi riporta a me") | confermata come formulazione |
| *H-T2: una pratica breve viene usata spontaneamente nella vita quotidiana* | **NUOVA → HT**, promossa da "segnale qualitativo" (§12) a ipotesi secondaria pre-registrata con misure proprie | da testare |
| *H-T3: chi ha il problema e sperimenta beneficio ripetibile paga* | **è HP** (§14), invariata: la domanda di pagamento arriva solo dopo il comportamento | da testare |

### HT — trasferimento (nuova, pre-registrata oggi)

> Dopo una singola micro-esperienza guidata, una parte misurabile dei partecipanti usa
> spontaneamente la pratica in una situazione reale entro 7 giorni, senza che sia stato
> chiesto di farlo.

| Misura | Quando | Soglia |
|---|---|---|
| "l'hai usata da solo/a, senza che nessuno te lo chiedesse?" (sì/no + contesto verbatim) | +24 h e +7 giorni | ≥ **30%** a 7 giorni |
| numero di usi spontanei riferiti | +7 giorni | mediana ≥ 2 fra chi la usa |

**Attenzione alla misura:** chiedere "l'hai usata?" *insegna* che ci si aspetta l'uso. La
domanda si fa **una sola volta, a +7 giorni**, aperta ("in questi giorni è successo qualcosa
che vuoi raccontarmi?") prima di quella diretta — e le risposte spontanee valgono più delle
sollecitate, marcate separatamente. Il 18% osservato nel corpus storico (con mesi di pratica
alle spalle) suggerisce che il 30% dopo UNA esperienza è una soglia esigente: se viene
mancata di poco ma i contesti verbatim sono ricchi, l'esito è MODIFICA, non ABBANDONA.

---

## 7. Cosa questi dati NON dimostrano (fermo restando §19 di DS)

- non dimostrano efficacia, né superiorità su altre pratiche, né causalità;
- il corpus è fatto da chi scrive: 65 persone su 82, e i 15 "trasferitori" sono
  probabilmente i più coinvolti — sopravvissuti due volte;
- le % della matrice confrontano pratiche *dentro lo stesso corpus distorto*: le differenze
  relative (piedi vs meditazione) sono più difendibili dei valori assoluti;
- nessun segnale economico: su questo il corpus resta muto (Risultati 01 §3).

Quello che dimostrano: **nel materiale storico esiste un segnale consistente di esperienza
soggettiva positiva legata ad attenzione corporea e contatto, con una minoranza documentata
che trasferisce la pratica nella vita reale.** Abbastanza per continuare la ricerca.
Non abbastanza per costruire il prodotto. La Regola zero non si sposta.

---

## 8. Modifiche al protocollo (v1.4)

| Cambio | Dove | Motivo |
|---|---|---|
| Nuova ipotesi secondaria **HT** (trasferimento) con misure e soglia | §3.2, §12 | §3 e §6 |
| Micro-esperienza candidata per l'Esperimento 1: **pratica dei piedi** | Allegato D | §2: unica pratica con cambio di stato alto E trasferimento alto |
| Regola: Esperimento 2 erogato individualmente, senza gruppo | §13 | §5: la dose non si deve confondere con la relazione |
| Tabella "cosa isola l'Esperimento 1" | Allegato D | §5 |
| Errata di Risultati 01 (§8 uscite; 82 scriventi; 18 un-giorno-solo) | Risultati 01 | §0 |
