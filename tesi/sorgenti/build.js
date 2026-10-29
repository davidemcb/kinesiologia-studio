// Genera la tesi in formato .docx secondo le indicazioni KOSMOS.
// Uso: node build.js [pagemap.json] out.docx
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, HeadingLevel, PageBreak,
  Footer, PageNumber, FootnoteReferenceRun, Table, TableRow, TableCell, WidthType, ShadingType,
  LevelFormat, TabStopType, TabStopPosition, BorderStyle, VerticalAlign, PositionalTab,
  PositionalTabAlignment, PositionalTabLeader, PositionalTabRelativeTo, SectionType,
} = require('docx');
const sizeOf = (f) => { // dimensioni PNG
  const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

const IMGDIR = path.join(__dirname, 'img');
const raw = [...require('./content1'), ...require('./content2')];
// Le immagini che seguono direttamente un titolo vengono spostate dopo il primo paragrafo di testo,
// così il titolo non viene trascinato alla pagina successiva insieme alla figura.
const content = [];
let pendingImg = null;
for (const b of raw) {
  if (b.type === 'img' && content.length && /^h[123]$/.test(content[content.length - 1].type)) { pendingImg = b; continue; }
  content.push(b);
  if (pendingImg && b.type === 'p') { content.push(pendingImg); pendingImg = null; }
}
if (pendingImg) content.push(pendingImg);
const FN = require('./fn');
const pagemapFile = process.argv[2] && process.argv[2].endsWith('.json') ? process.argv[2] : null;
const outFile = process.argv[process.argv.length - 1];
const pagemap = pagemapFile && fs.existsSync(pagemapFile) ? JSON.parse(fs.readFileSync(pagemapFile, 'utf8')) : {};

const CM = 567; // twips per cm
const FONT = 'Times New Roman';
const LINE = 360; // interlinea 1,5
const TEXTW = 21 * CM - 2 * 3 * CM; // larghezza testo A4 con margini 3 cm = 15 cm

// ---- note a piè di pagina ----
let fnCounter = 0; const footnotes = {}; const seen = new Set();
function newFootnote(key) {
  let def = FN[key]; let k = key;
  if (def && def.same) { k = def.same; def = FN[k]; }
  if (!def) throw new Error('Nota non definita: ' + key);
  const text = seen.has(k) ? def.short : def.full; seen.add(k);
  fnCounter += 1;
  footnotes[fnCounter] = { children: [new Paragraph({ children: runs(text, { size: 20 }), alignment: AlignmentType.JUSTIFIED, spacing: { line: 240 } })] };
  return fnCounter;
}

// ---- testo con *corsivo* e [[note]] ----
function runs(text, opt = {}) {
  const out = [];
  const parts = text.split(/(\[\[\d+\]\]|\*[^*]+\*)/g);
  for (const p of parts) {
    if (!p) continue;
    let m;
    if ((m = p.match(/^\[\[(\d+)\]\]$/))) { out.push(new FootnoteReferenceRun(newFootnote(Number(m[1])))); }
    else if ((m = p.match(/^\*([^*]+)\*$/))) { out.push(new TextRun({ text: m[1], italics: true, font: FONT, size: opt.size || 24, bold: opt.bold })); }
    else out.push(new TextRun({ text: p, font: FONT, size: opt.size || 24, bold: opt.bold, italics: opt.italics }));
  }
  return out;
}
const para = (text, extra = {}) => new Paragraph({ children: runs(text, extra.run || {}), alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, after: 120 }, ...extra.p });

// ---- indice ----
const indexEntries = [];
function indexLine(level, text) {
  const pg = pagemap[text] != null ? String(pagemap[text]) : '';
  const indent = level === 1 ? 0 : level === 2 ? 0.6 * CM : 1.2 * CM;
  return new Paragraph({
    spacing: { line: 276, after: 40 }, indent: { left: indent, right: 1 * CM, hanging: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: TEXTW, leader: 'dot' }],
    children: [
      new TextRun({ text: text + '\t' + pg, font: FONT, size: 24, bold: level === 1 }),
    ],
  });
}

// ---- immagini ----
function image(file, caption, cm) {
  const f = fs.existsSync(path.join(IMGDIR, file)) ? path.join(IMGDIR, file) : path.join(__dirname, file);
  const { w, h } = sizeOf(f);
  const wpx = Math.round(cm * 37.8); const hpx = Math.round(wpx * h / w);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(f), transformation: { width: wpx, height: hpx } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200, line: 276 }, children: runs(caption, { size: 20, italics: true }) }),
  ];
}

// ---- tabella ----
function table(header, rows) {
  const n = header.length; const cw = Array(n).fill(Math.floor(TEXTW / n));
  const cell = (t, head, last) => new TableCell({
    width: { size: cw[0], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: head ? { fill: 'E7E6E6', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 40, bottom: 40, left: 70, right: 70 },
    children: [new Paragraph({ spacing: { line: 240, after: 0 }, keepLines: true, children: runs(t, { size: 18, bold: head }) })],
  });
  return [new Table({
    width: { size: TEXTW, type: WidthType.DXA }, columnWidths: cw,
    rows: [new TableRow({ tableHeader: true, cantSplit: true, children: header.map(h => cell(h, true, false)) }), ...rows.map((r, i) => new TableRow({ cantSplit: true, children: r.map(c => cell(c, false, i === rows.length - 1)) }))],
  }), new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'Tabella 1 – Sintesi del protocollo massoterapico (durata indicativa complessiva 50 minuti circa).', font: FONT, size: 20, italics: true })], alignment: AlignmentType.CENTER })];
}

// ---- corpo ----
const body = [];
let first = true;
for (const b of content) {
  switch (b.type) {
    case 'h1':
      indexEntries.push([1, b.text]);
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { before: 0, after: 240, line: LINE }, children: [new TextRun({ text: b.text, font: FONT, size: 28, bold: true, color: '000000' })] }));
      break;
    case 'h2':
      indexEntries.push([2, b.text]);
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 240, after: 120, line: LINE }, children: [new TextRun({ text: b.text, font: FONT, size: 24, bold: true, color: '000000' })] }));
      break;
    case 'h3':
      indexEntries.push([3, b.text]);
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, spacing: { before: 180, after: 100, line: LINE }, children: [new TextRun({ text: b.text, font: FONT, size: 24, bold: true, italics: true, color: '000000' })] }));
      break;
    case 'p': body.push(para(b.text)); break;
    case 'ul':
      for (const it of b.items) body.push(new Paragraph({ numbering: { reference: 'bul', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, after: 80 }, children: runs(it) }));
      break;
    case 'img': body.push(...image(b.file, b.caption, b.cm)); break;
    case 'table': body.push(...table(b.header, b.rows)); break;
    case 'bib':
      for (const it of b.items) body.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 240, after: 40 }, indent: { left: 0.8 * CM, hanging: 0.8 * CM }, children: runs(it, { size: 22 }) }));
      break;
  }
}

// ---- indice (pagina) ----
const indexParas = [
  new Paragraph({ spacing: { after: 240, line: LINE }, children: [new TextRun({ text: 'INDICE', font: FONT, size: 28, bold: true })] }),
  ...indexEntries.map(([l, t]) => indexLine(l, t)),
];

// ---- frontespizio ----
const center = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after || 0, line: 276 }, children: [new TextRun({ text: t, font: FONT, size: o.size || 24, bold: o.bold, allCaps: o.caps })] });
const right = (t, o = {}) => new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: o.after || 0, line: 276 }, children: [new TextRun({ text: t, font: FONT, size: o.size || 24, bold: o.bold })] });
const logo = sizeOf(path.join(IMGDIR, 'fig-000.png'));
const cover = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(IMGDIR, 'fig-000.png')), transformation: { width: 150, height: Math.round(150 * logo.h / logo.w) } })] }),
  center('CORSO FINALIZZATO AL CONSEGUIMENTO', { size: 26 }),
  center('DELLA QUALIFICA PROFESSIONALE DI', { size: 26 }),
  center('Massaggiatore Capo Bagnino degli Stabilimenti Idroterapici', { size: 26, bold: true, after: 1400 }),
  center('IL PIEDE PIATTO E PRONATO NELLA', { size: 36, bold: true }),
  center('DANZA CLASSICA', { size: 36, bold: true, after: 1800 }),
  right('Candidato', { bold: true }),
  right('Beatrice Bacci', { after: 240 }),
  right('ID CORSO', { bold: true }),
  right('ID 28757', { after: 1400 }),
  center('ANNO ACCADEMICO 2024/2026', { bold: true }),
];

const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 22 })] })] });
const pageProps = { size: { width: 11906, height: 16838 }, margin: { top: 3 * CM, bottom: 3 * CM, left: 3 * CM, right: 3 * CM } };

const doc = new Document({
  creator: 'Beatrice Bacci', title: 'Il piede piatto e pronato nella danza classica',
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 28, bold: true, color: '000000' }, paragraph: { outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: '000000' }, paragraph: { outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, italics: true, color: '000000' }, paragraph: { outlineLevel: 2 } },
    ],
  },
  numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 0.8 * CM, hanging: 0.5 * CM } } } }] }] },
  footnotes,
  sections: [
    { properties: { page: pageProps }, children: cover },
    { properties: { page: { ...pageProps, pageNumbers: { start: 1 } }, type: SectionType.NEXT_PAGE }, footers: { default: footer }, children: [...indexParas, ...body] },
  ],
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outFile, buf); fs.writeFileSync(path.join(__dirname, 'headings.json'), JSON.stringify(indexEntries)); console.log('scritto', outFile, 'note:', fnCounter); });
