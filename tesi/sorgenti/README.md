# Sorgenti della tesi "Il piede piatto e pronato nella danza classica"

- `content1.js`, `content2.js`: testo della tesi (introduzione, capitolo 1, capitolo 2, conclusioni, bibliografia).
- `fn.js`: note a piè di pagina (chiave numerica -> citazione completa e forma abbreviata).
- `diagrams.js`: genera gli schemi originali (ciclo del passo, catene cinetiche, windlass) in PNG con Playwright.
- `img/`: fotografie e logo ripresi dalla tesina originale.
- `build.js`: genera il file Word secondo il formato KOSMOS (Times New Roman 12, interlinea 1,5, margini 3 cm,
  titoli dei capitoli in grassetto 14, note a piè di pagina, indice con numeri di pagina).
- `pagemap.json`: numeri di pagina dei titoli usati per l'indice (ricalcolati dal PDF).

Rigenerazione (richiede Node con il pacchetto `docx` e LibreOffice per il PDF):

```
node build.js pagemap.json tesi.docx
soffice --headless --convert-to pdf tesi.docx
```

Se il testo cambia, ricalcolare `pagemap.json` dal PDF (pagina del titolo meno 1 per la copertina) e rigenerare.

Le tavole anatomiche `tav1`-`tav5` sono composizioni di tavole di H. Gray, *Anatomy of the Human Body*,
20ª ed., 1918 (pubblico dominio), scaricate da Wikimedia Commons (file Gray268, 290, 354, 356, 439, 441,
442, 443, 444, 832, 833) e affiancate con etichette (a), (b), (c).
