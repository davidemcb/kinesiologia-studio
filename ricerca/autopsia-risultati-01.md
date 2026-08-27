# Autopsia Wellfulness — Risultati 01

**Data:** 2026-08-27 · **Fonte:** export WhatsApp del gruppo Wellfulness (7 apr 2025 → 20 ago 2026)
e del gruppo "Tutor seconda edizione" (10 apr → 29 mag 2025)
**Strumento:** `python3 ricerca/whatsapp_autopsia.py <_chat.txt> --erogatore "..."`

> **Privacy.** I dati grezzi contengono nomi e confidenze sulla salute di 86 persone reali:
> **non entrano in questo repository** e restano fuori da git. Qui ci sono solo aggregati e
> frammenti di testo non identificanti. Lo strumento non stampa mai nomi.

---

## 0. Il limite, prima dei risultati

Questa analisi misura **l'attività nel gruppo, non la pratica.** Chi ha praticato ogni giorno
senza mai scrivere risulta inattivo.

Il bias è noto e va in **una sola direzione: sottostima l'aderenza reale.** Va dichiarato in
ogni conclusione. Il dato che chiuderebbe la questione — **i report di presenza Zoom** — non è
in questi file: 1.883 sessioni hanno lasciato un registro presenze da qualche parte, ed è il
singolo documento più prezioso ancora mancante.

Con questa riserva, quattro dei sette H-W ricevono un verdetto, e ne nasce un ottavo.

---

## 1. Il fatto che cambia la domanda

**Wellfulness non è morto. È stato spento — e l'ultimo a smettere è stato chi lo erogava.**

| Periodo | Proposte di pratica | Partecipanti attivi | Quota di parola dell'erogatore |
|---|---|---|---|
| apr 2025 – gen 2026 | 120–159 al mese | 44 → 29 | 7–25% |
| **feb – mar 2026** | **149, 130** | **18, 15** | **75%, 74%** |
| apr 2026 | 84 | 24 | 48% |
| mag – ago 2026 | 33, 30, 24, **8** | 7, 4, 6, **3** | 24%, 3%, 0%, 0% |

**1.883 proposte di pratica in 500 giorni**, cinque al giorno (6:30 · 9:30 · 12:12/12:30 ·
19:00 · 22:30), erogate dal vivo per **dodici mesi consecutivi** senza cali.

Poi, per due mesi, tre quarti dei messaggi sono di una persona sola che parla a una stanza
quasi vuota. Da aprile 2026 l'offerta crolla: 84, 33, 30, 24, 8.

La sequenza è: **la domanda si erode lentamente per dieci mesi → l'offerta regge → l'erogatore
resta solo → l'offerta collassa.** Non è un abbandono degli utenti al giorno 3. È un logoramento
lungo, e il punto di rottura finale è il fornitore.

---

## 2. La sopravvivenza apparente è un'illusione

A prima vista i numeri sembrano ottimi: mediana di **157 giorni** fra il primo e l'ultimo
messaggio, 43% delle persone con più di 180 giorni di "permanenza".

Guardando i **giorni realmente attivi** — quelli in cui la persona ha scritto almeno una volta:

| Giorni attivi (su 500) | Persone | % |
|---|---|---|
| 1 solo giorno | 10 | 11,6% |
| 2–5 | 33 | 38,4% |
| 6–20 | 15 | 17,4% |
| 21–60 | 17 | 19,8% |
| 61–150 | 8 | 9,3% |
| 150+ | 3 | 3,5% |

**Mediana: 5,5 giorni attivi su 500. Metà delle persone si è fatta viva cinque volte o meno.**
La densità mediana è **0,106**: la persona "presente" scrive in un giorno su dieci.

E oggi: **64% in silenzio da oltre 180 giorni**, 5,8% attivi negli ultimi 30.

La concentrazione spiega il resto: **top 5 autori = 60% dei messaggi**, top 10 = 76%.
L'erogatore da solo il 21,7%. Un gruppo di 86 persone in cui parlano davvero in cinque.

---

## 3. Non c'è mai stato un momento di acquisto

Ricerca su 5.292 messaggi di parole come *euro, €, pagamento, bonifico, quota, prezzo,
abbonamento, PayPal, Satispay, fattura, acquisto*:

**Cinque occorrenze. Lette una per una, sono tutte falsi positivi** — "neuroni", "neuroplasticità",
"il prezzo del tempo", "il corpo ne paga il prezzo", "ho acquistato una Pandina gialla".

> **In 500 giorni e 5.292 messaggi, il denaro non compare mai.**

E l'acquisizione:

| Coorte di ingresso | Entrati | Giorni attivi mediani |
|---|---|---|
| **apr 2025 (lancio)** | **44** | **24,5** |
| mag 2025 | 14 | 3,0 |
| giu–dic 2025 | 27 in sette mesi | 1,5–9,0 |
| gen 2026 | 1 | 3,0 |

**Dopo il mese di lancio sono entrate 42 persone in quindici mesi**, e nessuna coorte
successiva ha mai avvicinato l'ingaggio della prima.

Questo riscrive la diagnosi. Stavamo discutendo di aderenza e di dose; i due anelli che non
sono mai esistiti sono **Acquisizione** e **Acquisto**. Non erano deboli: non c'erano.

---

## 4. Il canale predice quasi tutto

| Canale (dai tag nei nomi) | n | Giorni attivi mediani |
|---|---|---|
| edizione precedente | 6 | **26,5** |
| paziente dello studio | 4 | **22,5** |
| rete professionale (yoga, tango, olistico, reiki…) | 9 | **16,0** |
| referral da un membro (amica/o di…) | 10 | 5,0 |
| nessun tag | 57 | 4,0 |

Chi arriva con **una relazione già esistente** — professionale, terapeutica, o una edizione
precedente — resta attivo **4–6 volte di più** di chi arriva per passaparola.

I numeri sono piccoli e vanno trattati come indizio, non come prova. Ma la direzione è netta e
ha due implicazioni scomode:

1. **Il referral, che sembra il canale naturale, è il peggiore per permanenza** (5 giorni
   mediani). Fondare la crescita sul passaparola significa importare le persone che restano meno.
2. È il primo dato reale su **Q5 dell'Allegato G**: il fattore comune fra chi resta somiglia
   molto alla **relazione preesistente**, non al problema. Se è la relazione il principio
   attivo, un prodotto digitale che la rimuove rimuove ciò che funzionava.

---

## 5. Di cosa parlano davvero, quando nessuno chiede loro di parlare

859 messaggi sostanziali dei partecipanti (oltre 60 caratteri, esclusi i link), classificati
per tema. È **linguaggio spontaneo**: nessuno ha proposto queste categorie.

| Tema | Messaggi | % | Persone (su 86) |
|---|---|---|---|
| **corpo e sensazioni fisiche** | **251** | **29,2%** | **32** |
| gruppo e relazione | 247 | 28,8% | **40** |
| presenza e consapevolezza | 232 | 27,0% | 33 |
| mente e pensieri | 204 | 23,7% | 38 |
| emozioni | 133 | 15,5% | 29 |
| dolore | 27 | 3,1% | 15 |
| sonno | 26 | 3,0% | 16 |
| **stress** | **10** | **1,2%** | **6** |

**Del corpo si parla 25 volte più che dello stress.**

Frammenti tipici, senza attribuzione: *"ho sentito molto chiaramente il mio corpo"* ·
*"mi ha aiutato a percepirmi meglio"* · *"sento i piedi freschi, morbidi e leggeri"* ·
*"la meditazione funzionale mi fa notare…"*

**Questa è una convergenza indipendente.** Le [Evidenze scientifiche 01](evidenze-scientifiche-01.md)
§3 dicono, partendo da studi randomizzati, che l'auto-tocco batte i controlli attivi **solo
sulle misure corporee** e va alla pari sullo stress. Qui, partendo dal linguaggio non
sollecitato di 86 utenti reali su 500 giorni, esce lo stesso risultato: **il job è il corpo,
non lo stress.**

Due fonti che non hanno niente in comune indicano lo stesso punto. È l'evidenza più solida
prodotta finora in questa ricerca — e riguarda il posizionamento, non l'efficacia.

Da notare anche: **"gruppo e relazione" è il tema con più persone distinte (40 su 86)**, più
del corpo stesso. Il gruppo non era il contenitore del valore: era una parte del valore.

---

## 6. Il gruppo tutor è morto per primo

| | Gruppo Wellfulness | Gruppo Tutor |
|---|---|---|
| Durata | 500 giorni | **49 giorni** |
| Persone | 86 | 4 |
| Messaggi | 5.292 | 149 |

La struttura creata per **distribuire l'erogazione** — l'unica cosa che avrebbe potuto togliere
cinque sessioni al giorno dalle spalle di una persona sola — ha smesso di funzionare dopo sette
settimane. Dodici mesi prima che crollasse l'offerta.

---

## 7. Verdetti sulle ipotesi retrospettive

| ID | Ipotesi | Verdetto | Sulla base di cosa |
|---|---|---|---|
| **H-W1** | La dose (5/giorno) ha ridotto l'aderenza | **NON DECIDIBILE** — serve la presenza Zoom | dose confermata (1.883 proposte, 5 orari fissi). La mediana di 5,5 giorni attivi è compatibile ma non è una misura di pratica |
| **H-W2** | Job non abbastanza specifico | **PARZIALMENTE FALSIFICATA** nella forma "non capivano" | chi è rimasto ha un linguaggio molto convergente e specifico (§5). Il job era chiaro a loro: non è mai stato quello dichiarato in un'offerta |
| **H-W3** | Apprezzavano senza una ragione per continuare | **SUPPORTATA** | valore percepito alto e articolato, uscite esplicite quasi assenti, dissolvenza lenta invece di rottura |
| **H-W4** | Touchfulness è più riconoscibile di Wellfulness | **NON DECIDIBILE** (come pre-dichiarato) | nessun dato retrospettivo può dirlo |
| **H-W5** | Il tocco differenzia | **SUPPORTATA da fonte indipendente** | §5: il linguaggio spontaneo è corporeo, e coincide con dove la letteratura trova il vantaggio |
| **H-W6** | Una dose brevissima terrebbe di più | **NON TESTABILE QUI** | non è mai stata provata una versione breve |
| **H-W7** | Il valore sta nell'accompagnamento | **SUPPORTATA** | "gruppo e relazione" è il tema con più persone (40/86); il canale relazionale predice 4–6× la permanenza; il gruppo tutor è morto per primo |
| **H-W8** | **NUOVA — Il vincolo non è l'aderenza dell'utente ma la sostenibilità dell'erogatore** | **APERTA, con forte supporto** | 1.883 sessioni dal vivo in 500 giorni, una persona sola, due mesi finali al 75% di quota di parola, poi il crollo dell'offerta |

**H-W8 è la scoperta di questa autopsia** e non era in nessuna delle nostre liste. Stavamo
cercando perché le persone smettessero. Il dato dice che il sistema si è fermato perché
**una persona sola non può erogare cinque sessioni al giorno per sedici mesi** — e che nessuna
struttura di supporto è sopravvissuta più di sette settimane.

Il criterio di falsificazione di H-W8, da verificare: se i report di presenza mostrano che le
sessioni erano già quasi vuote da mesi prima di febbraio 2026, allora l'erogatore ha smesso
*dopo* la domanda, non *prima*, e H-W8 diventa secondaria rispetto a H-W1.

---

## 8. Cosa manca e va cercato

| Dato | Dove potrebbe essere | Cosa deciderebbe |
|---|---|---|
| **Report di presenza Zoom** | account Zoom, report riunioni | **H-W1**: quante persone entravano davvero, e a quale delle cinque fasce orarie |
| Elenco iscritti con data | mail, foglio, admin del gruppo | l'imbuto vero (adesso abbiamo solo chi ha scritto) |
| Eventuali pagamenti | estratti, fatture | se un momento di acquisto è esistito altrove |
| Chat individuali con i tutor | telefono | perché la struttura tutor si è fermata a 49 giorni |
| Chi è uscito dal gruppo e quando | l'export non lo registra | l'uscita esplicita vs la dissolvenza |

Le **interviste di uscita** (Allegato G §5) adesso hanno un campione preciso: le persone con
2–5 giorni attivi entrate dopo aprile 2025 — 33 su 86, la parte più informativa e mai ascoltata.

---

## 9. Cosa cambia nel protocollo

| Cambio | Dove | Motivo |
|---|---|---|
| Confermato: la Y primaria è corporea, non stress | §11.4 | §5, convergente con Evidenze 01 |
| H3 e H17 confermate prioritarie; H2/H9 confermate come terreno senza vantaggio | §3.1 | §5 |
| Nuovo criterio di sostenibilità dell'erogatore nel gate G5 | §14.4 | H-W8 |
| Il referral non è il canale di crescita: va testato, non assunto | §14 | §4 |
| L'acquisizione diventa un'ipotesi da testare esplicitamente, non un dettaglio | §14 | §3 |

### Il criterio che mancava a §14.4

Il calcolo di sostenibilità considerava solo il fabbisogno economico. Ne mancava metà:

```
Ore di erogazione richieste al mese  ≤  ore che una persona può sostenere per 24 mesi
```

Wellfulness ha fallito questo test prima di fallire quello economico. Un modello che richiede
cinque sessioni dal vivo al giorno non è sostenibile a nessun prezzo — e questo si sapeva
calcolare **prima**, non dopo sedici mesi.
