// Che Postura · "Crea report e proposta": PDF per il paziente con confronto prima/dopo,
// cosa abbiamo trovato, lavoro fatto, proposta Sinergia e piano a 3 mesi.
(function () {
  'use strict';
  const SITE = 'https://davidemcb.github.io/che-postura/';
  const DISC = 'Sono misure e indizi, non diagnosi: la diagnosi è di competenza medica.';
  const VIEWS = [['frontale', 'di fronte'], ['posteriore', 'da dietro'], ['lat_dx', 'lato destro'], ['lat_sx', 'lato sinistro'], ['talloni', 'talloni'], ['bocca', 'bocca aperta']];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const longDate = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESI[m - 1]} ${y}`; };
  const shortDate = iso => { const [, m, d] = iso.split('-').map(Number); return `${d}/${m}`; };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const todayIso = () => new Date().toISOString().slice(0, 10);
  // i caratteri che i font standard del PDF non hanno
  const pdfTxt = t => String(t).replace(/→/g, '->').replace(/≈/g, 'circa ').replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/×/g, 'x').replace(/✓/g, '').replace(/≥/g, '>=').replace(/≤/g, '<=');
  const byDate = (a, b) => (a.date === b.date ? (a.created_at < b.created_at ? -1 : 1) : a.date < b.date ? -1 : 1);

  function loadScript(src) {
    return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  async function jspdfReady() {
    if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    return window.jspdf.jsPDF;
  }
  function loadImage(url) {
    return new Promise(ok => {
      if (!url) return ok(null);
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => {
        try {
          const max = 900, sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
          const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * sc); c.height = Math.round(im.naturalHeight * sc);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          ok({ url: c.toDataURL('image/jpeg', 0.82), ratio: c.height / c.width });
        } catch (e) { ok(null); }
      };
      im.onerror = () => ok(null); im.src = url;
    });
  }

  // catena muscolare a cui collegare ogni problema trovato
  function chainOf(title) {
    const t = title.toLowerCase();
    if (/testa|collo|cranio|anteposte|spalle anteposte/.test(t)) return 'Catena anteriore e spalle';
    if (/anteroversione|retroversione|rotazione|emipelvi|bacino|torsione/.test(t)) return 'Catena profonda e bacino';
    if (/spalla|scapol/.test(t)) return 'Spalla e braccio';
    if (/piede|tallone|valgo|varo|pronat|supinat/.test(t)) return 'Catena che sale dal piede';
    if (/mandibola|serramento|bruxismo/.test(t)) return 'Mandibola e collo';
    if (/respira|diaframma/.test(t)) return 'Catena profonda e respiro';
    return 'Postura generale';
  }
  function targetOf(label) {
    const l = label.toLowerCase();
    if (l.includes('testa sul piano laterale')) return 'Riduzione di almeno 2–3 cm.';
    if (l.includes('spalle sul piano laterale')) return 'Spalla più vicina alla linea dell\'anca.';
    if (l.startsWith('bacino sul piano laterale')) return 'Tra 5° e 12°.';
    if (l.includes('bacino') || l === 'spalle' || l === 'testa') return 'In asse (sotto 0,5 cm) anche a distanza dai trattamenti.';
    if (l.startsWith('tallone')) return 'Sotto i 5°, simile all\'altro lato.';
    if (l.includes('apertura')) return 'Tra 40 e 55 mm.';
    if (l.includes('mandibola')) return 'Centrata in apertura.';
    return 'Migliore di oggi.';
  }

  // ---------- modulo con le opzioni ----------
  function open(box, p, vs, ss) {
    const visits = vs.slice().sort(byDate);
    if (!visits.length) { box.className = 'card'; box.innerHTML = '<p class="empty">Serve almeno una visita per creare il report.</p>'; return; }
    const first = visits[0], last = visits[visits.length - 1];
    const start = last.date > todayIso() ? last.date : (last.date || todayIso());
    box.className = 'card';
    box.innerHTML = `<h3>Crea report e proposta</h3>
      <p class="hint">Il PDF unisce ${visits.length > 1 ? `il confronto tra la visita del ${esc(longDate(first.date))}${first.label ? ' (' + esc(first.label) + ')' : ''} e quella del ${esc(longDate(last.date))}${last.label ? ' (' + esc(last.label) + ')' : ''}` : `la visita del ${esc(longDate(last.date))}`}, cosa abbiamo trovato, il lavoro fatto e la proposta del percorso Sinergia a 3 mesi, con il link al sito Che Postura!. ${DISC}</p>
      <div class="row">
        <div class="field"><label class="lbl" for="rStart">Inizio del percorso</label><input id="rStart" type="date" value="${start}"></div>
        <div class="field"><label class="lbl" for="rWho">Nome sul report</label><input id="rWho" type="text" value="${esc(p.full_name)}"></div>
      </div>
      <div class="field"><span class="lbl">Sedute per fase (una a settimana, 4 settimane per fase)</span>
        <div class="tablewrap"><table><thead><tr><th>Fase</th><th>Con Davide</th><th>Con Morena</th></tr></thead><tbody>
          <tr><td>1 · liberare e riequilibrare</td><td><input id="rD1" type="number" min="0" max="4" value="4" style="width:70px"></td><td><input id="rM1" type="number" min="0" max="4" value="0" style="width:70px"></td></tr>
          <tr><td>2 · stabilizzare e rinforzare</td><td><input id="rD2" type="number" min="0" max="4" value="2" style="width:70px"></td><td><input id="rM2" type="number" min="0" max="4" value="2" style="width:70px"></td></tr>
          <tr><td>3 · integrare e mantenere</td><td><input id="rD3" type="number" min="0" max="4" value="1" style="width:70px"></td><td><input id="rM3" type="number" min="0" max="4" value="3" style="width:70px"></td></tr>
        </tbody></table></div></div>
      <label class="row hint"><input type="checkbox" id="rEval" checked> Morena fa una prima valutazione del movimento nella fase 1</label>
      <label class="row hint"><input type="checkbox" id="rPhotos" checked> Inserisci le foto</label>
      <label class="row hint"><input type="checkbox" id="rWork" checked> Inserisci il lavoro fatto (zone e tecniche dal diario, senza le note)</label>
      <label class="row hint"><input type="checkbox" id="rEx"> Inserisci gli esercizi dell'ultima visita</label>
      <div class="row"><button class="btn primary" type="button" id="rGo">Crea il PDF</button><button class="btn" type="button" id="rNo">Annulla</button><span class="hint" id="rMsg"></span></div>`;
    const $ = s => box.querySelector(s);
    $('#rNo').addEventListener('click', () => { box.innerHTML = ''; box.className = ''; });
    $('#rGo').addEventListener('click', async () => {
      const num = id => Math.max(0, Math.min(4, parseInt($(id).value, 10) || 0));
      const opt = { start: $('#rStart').value || start, who: $('#rWho').value.trim() || p.full_name,
        d: [num('#rD1'), num('#rD2'), num('#rD3')], m: [num('#rM1'), num('#rM2'), num('#rM3')],
        evalM: $('#rEval').checked, photos: $('#rPhotos').checked, work: $('#rWork').checked, ex: $('#rEx').checked };
      const btn = $('#rGo'), msg = $('#rMsg');
      btn.disabled = true; msg.textContent = 'Preparo il PDF…';
      try {
        const blob = await build(p, visits, ss, opt);
        const name = `Report e proposta - ${opt.who.replace(/[\\/:*?"<>|]/g, '')} - ${last.date}.pdf`;
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        msg.textContent = 'PDF creato: lo trovi nei download.';
      } catch (e) {
        msg.textContent = 'Non sono riuscito a creare il PDF: ' + (e.message || 'riprova.');
      }
      btn.disabled = false;
    });
  }

  // ---------- il PDF ----------
  async function build(p, visits, ss, opt) {
    const jsPDF = await jspdfReady();
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, M = 15, CW = W - 2 * M, BOTTOM = 282;
    const BRAND = [47, 93, 81], INK = [34, 48, 43], MUTED = [92, 107, 100], LINE = [221, 224, 210], SOFT = [238, 242, 236], GOLD = [176, 138, 46], BLUE = [91, 110, 154];
    let y = M;
    const first = visits[0], last = visits[visits.length - 1], two = visits.length > 1;
    const newPage = () => { doc.addPage(); y = M; };
    const ensure = h => { if (y + h > BOTTOM) newPage(); };
    const font = (size, style, color) => { doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); doc.setTextColor(...(color || INK)); };
    const text = (t, o = {}) => {
      const size = o.size || 9.5, lh = size * 0.42, x = M + (o.indent || 0), w = o.width || CW - (o.indent || 0);
      font(size, o.bold ? 'bold' : o.italic ? 'italic' : 'normal', o.color);
      for (const ln of doc.splitTextToSize(pdfTxt(t), w)) { ensure(lh + 1); doc.text(ln, x, y + lh * 0.8); y += lh; }
      y += o.after == null ? 1.6 : o.after;
    };
    const h2 = t => { ensure(32); y += 3; font(13.5, 'bold', BRAND); doc.text(pdfTxt(t), M, y + 5); y += 7.5; doc.setDrawColor(...LINE); doc.setLineWidth(0.4); doc.line(M, y, W - M, y); y += 3.5; };
    const h3 = t => { ensure(10); text(t, { size: 10.5, bold: true, after: 1 }); };
    const bullet = (t, indent = 0) => text('•  ' + t, { indent: indent + 2 });
    const box = (t, color, fill) => {
      font(8.8, 'normal', INK);
      const lines = doc.splitTextToSize(pdfTxt(t), CW - 10), h = lines.length * 3.8 + 5;
      ensure(h + 2);
      doc.setFillColor(...(fill || SOFT)); doc.rect(M, y, CW, h, 'F'); doc.setFillColor(...(color || BRAND)); doc.rect(M, y, 1.4, h, 'F');
      lines.forEach((ln, i) => doc.text(ln, M + 5, y + 4.6 + i * 3.8)); y += h + 3;
    };
    // tabella semplice: colonne con larghezze in mm
    const table = (head, rows, widths) => {
      const pad = 1.6, lh = 3.7;
      const draw = (cells, isHead) => {
        font(isHead ? 8.6 : 8.6, isHead ? 'bold' : 'normal', isHead ? BRAND : INK);
        const split = cells.map((c, i) => doc.splitTextToSize(pdfTxt(c == null ? '' : c), widths[i] - 2 * pad));
        const h = Math.max(...split.map(s => s.length)) * lh + 2 * pad;
        ensure(h);
        if (isHead) { doc.setFillColor(...SOFT); doc.rect(M, y, CW, h, 'F'); }
        let x = M;
        split.forEach((s, i) => { s.forEach((ln, j) => doc.text(ln, x + pad, y + pad + 2.9 + j * lh)); x += widths[i]; });
        y += h; doc.setDrawColor(...LINE); doc.setLineWidth(0.25); doc.line(M, y, W - M, y);
      };
      ensure(22); // intestazione e prima riga sulla stessa pagina
      draw(head, true); rows.forEach(r => draw(r, false)); y += 3;
    };

    // intestazione
    font(7.5, 'normal', MUTED); doc.text('CHE POSTURA · KINESIOLOGIA STUDIO', M, y + 3);
    font(8.5, 'normal', MUTED);
    ['Dott. Davide Scuderi · massoterapista posturologo', 'Dott.ssa Morena Anastasi · valutazione posturale e movimento', 'Via Capilupi 21, Modena'].forEach((l, i) => doc.text(pdfTxt(l), W - M, y + 3 + i * 4, { align: 'right' }));
    font(20, 'bold', BRAND); doc.text('Report posturale', M, y + 12); doc.text('e proposta di percorso a 3 mesi', M, y + 20);
    y += 24; doc.setDrawColor(...BRAND); doc.setLineWidth(1); doc.line(M, y, W - M, y); y += 5;
    text(`Paziente: ${opt.who}   ·   ${two ? `Valutazioni del ${longDate(first.date)}${first.label ? ' (' + first.label.toLowerCase() + ')' : ''} e del ${longDate(last.date)}${last.label ? ' (' + last.label.toLowerCase() + ')' : ''}` : `Valutazione del ${longDate(last.date)}`}`, { size: 9, color: MUTED, after: 2 });
    box(DISC + ' Le misure vengono da fotografie e servono soprattutto a confrontare i cambiamenti nel tempo; si confermano con i test manuali.');

    // sintesi
    const auto = v => Object.fromEntries((v.auto || []).map(a => [a.label, a]));
    const A1 = auto(first), A2 = auto(last);
    const changes = [];
    if (two) for (const [label, b] of Object.entries(A2)) {
      const a = A1[label];
      if (!a || a.num == null || b.num == null) continue;
      const d = Math.abs(b.num) - Math.abs(a.num);
      changes.push({ label, a: a.val, b: b.val, word: d < -0.3 ? 'migliorato' : d > 0.3 ? 'peggiorato' : 'stabile' });
    }
    h2('In sintesi');
    const better = changes.filter(c => c.word === 'migliorato'), same = changes.filter(c => c.word !== 'migliorato');
    if (two) text(better.length ? `Tra le due valutazioni è migliorato: ${better.map(c => c.label.toLowerCase()).join(', ')}.` + (same.length ? ` Restano da lavorare: ${same.map(c => c.label.toLowerCase()).join(', ')}.` : '') : 'Tra le due valutazioni le misure sono rimaste simili: è il punto di partenza del lavoro.', { size: 10.5 });
    const fsum = [...new Set([last, first].flatMap(v => (v.findings || []).map(f => f.title)))];
    text((fsum.length ? `Dalla valutazione emergono: ${fsum.join(', ').toLowerCase()}. ` : '') + 'Le abitudini posturali cambiano con circa 12 settimane di lavoro costante e guidato: per questo ti proponiamo un percorso di 3 mesi che unisce trattamento manuale e lavoro sul movimento.', { size: 10.5, after: 2 });

    // foto
    if (opt.photos) {
      const pairs = [];
      for (const [k, lab] of VIEWS) {
        const a = two ? first.photos && first.photos[k] : null, b = last.photos && last.photos[k];
        if (!a && !b) continue;
        pairs.push([k, lab, a, b]);
      }
      if (pairs.length) {
        h2(two ? 'Le foto: prima e dopo' : 'Le foto della valutazione');
        const colW = (CW - 6) / 2;
        const imgs = [];
        for (const [, lab, a, b] of pairs) imgs.push([lab, await loadImage(a && await window.Api.fileUrl(a)), await loadImage(b && await window.Api.fileUrl(b))]);
        if (two) {
          for (const [lab, ia, ib] of imgs) {
            if (!ia && !ib) continue;
            const hImg = Math.min(112, Math.max(ia ? colW * ia.ratio : 0, ib ? colW * ib.ratio : 0));
            ensure(hImg + 7);
            [[ia, `Prima · ${lab}`], [ib, `Dopo · ${lab}`]].forEach(([im, cap], j) => {
              const x0 = M + j * (colW + 6);
              if (im) { const w = Math.min(colW, hImg / im.ratio); doc.addImage(im.url, 'JPEG', x0 + (colW - w) / 2, y, w, w * im.ratio); }
              else { font(8.5, 'italic', MUTED); doc.text('foto non fatta', x0 + colW / 2, y + hImg / 2, { align: 'center' }); }
              font(8.2, 'bold', MUTED); doc.text(pdfTxt(cap), x0, y + hImg + 4);
            });
            y += hImg + 8;
          }
        } else {
          const list = imgs.map(r => [r[0], r[2]]).filter(r => r[1]);
          for (let i = 0; i < list.length; i += 2) {
            const row = list.slice(i, i + 2), hImg = Math.min(112, Math.max(...row.map(r => colW * r[1].ratio)));
            ensure(hImg + 7);
            row.forEach(([lab, im], j) => { const x0 = M + j * (colW + 6), w = Math.min(colW, hImg / im.ratio); doc.addImage(im.url, 'JPEG', x0 + (colW - w) / 2, y, w, w * im.ratio); font(8.2, 'bold', MUTED); doc.text(pdfTxt(lab), x0, y + hImg + 4); });
            y += hImg + 8;
          }
        }
      }
    }

    // misure
    h2('Cosa misurano le foto');
    if (two) {
      const labels = [...new Set([...Object.keys(A1), ...Object.keys(A2)])];
      table(['Misura', 'Prima', 'Dopo', 'Come leggerla'], labels.map(l => {
        const a = A1[l], b = A2[l], c = changes.find(x => x.label === l);
        return [l, a ? a.val : '—', b ? b.val : '—', c ? (c.word === 'migliorato' ? 'Migliorato.' : c.word === 'peggiorato' ? 'Da ricontrollare.' : 'Stabile, nel margine di misura.') : (b ? b.desc : 'Non confrontabile.')];
      }), [46, 34, 34, CW - 114]);
    } else {
      table(['Misura', 'Valore', 'Come leggerla'], Object.values(A2).map(a => [a.label, a.val, a.desc]), [50, 40, CW - 90]);
    }
    text('Misure calcolate dal programma Che Postura sulle fotografie. Il margine di errore delle misure su foto è di circa 1 cm e 2–3°.', { size: 8, color: MUTED });
    if (last.mobility && (last.mobility.rows || []).length) {
      h3(`Mobilità articolare: indice globale ${last.mobility.index}/100`);
      table(['Movimento', 'Angolo', 'Normale'], last.mobility.rows.map(r => [r.label, r.val + '°', r.normal + '°']), [90, 45, CW - 135]);
    }

    // cosa abbiamo trovato
    const fs = [];
    for (const v of [last, first]) for (const f of v.findings || []) if (!fs.some(x => x.title === f.title)) fs.push(f);
    if (fs.length) {
      h2('Le catene muscolari interessate');
      text('Il corpo lavora per catene: muscoli e fasce collegati che si influenzano a distanza. Questo è il quadro che abbiamo trovato.');
      table(['Catena', 'Cosa abbiamo osservato', 'Muscoli tesi o accorciati', 'Muscoli deboli'], fs.map(f => [chainOf(f.title), f.title, (f.corti || []).join(', '), (f.lunghi || []).join(', ')]), [34, 40, 53, CW - 127]);
    }

    // lavoro fatto
    if (opt.work) {
      const work = (ss || []).filter(s => (s.kind === 'trattamento' || s.kind === 'allenamento') && s.date >= first.date && s.date <= addDays(last.date, 1) && (s.zones || []).some(z => z.zone)).sort(byDate);
      if (work.length) {
        h2('Il lavoro fatto');
        for (const s of work) {
          h3(`${longDate(s.date)} · ${s.kind === 'trattamento' ? 'trattamento' : 'allenamento'}${s.author_name ? ' con ' + s.author_name : ''}`);
          for (const z of s.zones.filter(z => z.zone)) bullet(`${z.zone}${z.side ? ' ' + z.side : ''}${(z.tech || []).length ? ': ' + z.tech.join(', ').toLowerCase() : ''}`);
          y += 1;
        }
      }
    }

    // esercizi (facoltativi)
    if (opt.ex && (last.exercises || []).length) {
      h2('Gli esercizi');
      table(['Esercizio', 'Dose', 'Perché e come'], last.exercises.map(e => [e.name, e.dose, (e.why ? e.why + '. ' : '') + (e.how || '')]), [52, 36, CW - 88]);
    }

    // cosa aspettarsi
    h2('Cosa aspettarsi');
    table(['Quando', 'Cosa può succedere'], [
      ['Subito e nei 2 giorni dopo', 'Sensazione di leggerezza. È normale un leggero indolenzimento muscolare per 24–48 ore, come dopo un allenamento.'],
      ['Settimane 1–4', 'Meno tensione nelle zone trattate. Si impara a sentire la posizione corretta: il corpo "capisce" il nuovo equilibrio.'],
      ['Settimane 5–8', 'Migliora il controllo dei muscoli profondi: la postura corretta richiede meno sforzo e inizia a vedersi in foto.'],
      ['Settimane 9–12', 'Muscoli e fasce si adattano: la nuova postura diventa stabile anche sotto sforzo. Rivalutazione completa.']
    ], [42, CW - 42]);
    text('I tempi dipendono soprattutto dalla costanza: la seduta settimanale e la continuità del percorso sono la parte più importante.', { size: 8, color: MUTED });

    // proposta
    h2('La nostra proposta: percorso Sinergia');
    text('Per un risultato che duri non basta liberare i muscoli in seduta: bisogna anche insegnare al corpo a mantenere il nuovo equilibrio. Per questo lavoriamo in due, in modo coordinato:');
    ensure(24);
    const half = (CW - 6) / 2;
    [[BRAND, 'Davide Scuderi · trattamento', 'Massoterapia posturale: libera catene muscolari e fasce, riequilibra il bacino e scarica collo e spalle.'],
     [GOLD, 'Morena Anastasi · movimento', 'Valutazione posturale e lavoro sul movimento: insegna al corpo a tenere da solo la postura corretta e la rende stabile nel tempo.']].forEach(([col, t, d], j) => {
      const x0 = M + j * (half + 6);
      doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.rect(x0, y, half, 21); doc.setFillColor(...col); doc.rect(x0, y, 1.4, 21, 'F');
      font(9.5, 'bold', INK); doc.text(pdfTxt(t), x0 + 4, y + 5);
      font(8.5, 'normal', INK); doc.splitTextToSize(pdfTxt(d), half - 7).forEach((ln, i) => doc.text(ln, x0 + 4, y + 9.5 + i * 3.6));
    });
    y += 25;
    // codice QR e link al sito
    ensure(30);
    doc.setDrawColor(...LINE); doc.rect(M, y, CW, 27);
    const qr = await loadImage('qr-che-postura.png');
    if (qr) { doc.addImage(qr.url, 'JPEG', M + 3, y + 2.5, 22, 22); doc.link(M + 3, y + 2.5, 22, 22, { url: SITE }); }
    font(10.5, 'bold', INK); doc.text('Scopri chi siamo e come lavoriamo in équipe', M + 30, y + 9);
    font(8.8, 'normal', INK); doc.text('Inquadra il codice con la fotocamera del telefono, oppure apri:', M + 30, y + 14);
    font(10, 'bold', BRAND); doc.textWithLink(SITE, M + 30, y + 20, { url: SITE });
    y += 32;

    // piano
    h2('Il piano a 3 mesi');
    text('Una seduta a settimana per 12 settimane. In ogni fase cambia il peso tra trattamento e movimento: all\'inizio prevale il lavoro manuale, poi cresce il lavoro con Morena, fino a renderti autonomo.', { after: 2 });
    const s0 = opt.start, wk = i => addDays(s0, 7 * i);
    ensure(16);
    const ph = [[BRAND, 'Fase 1 · sett. 1–4', 'Liberare e riequilibrare', [227, 237, 231]], [GOLD, 'Fase 2 · sett. 5–8', 'Stabilizzare e rinforzare', [239, 233, 218]], [BLUE, 'Fase 3 · sett. 9–12', 'Integrare e mantenere', [230, 233, 240]]];
    ph.forEach(([, t, s, fill], j) => { const x0 = M + j * (CW / 3); doc.setFillColor(...fill); doc.rect(x0, y, CW / 3, 11, 'F'); font(9, 'bold', INK); doc.text(pdfTxt(t), x0 + 3, y + 4.5); font(8.2, 'normal', INK); doc.text(pdfTxt(s), x0 + 3, y + 8.8); });
    y += 12.5;
    font(6.8, 'normal', MUTED);
    for (let i = 0; i < 12; i++) doc.text(shortDate(wk(i)), M + (i + 0.5) * (CW / 12), y + 2.5, { align: 'center' });
    y += 6;
    const sess = (dn, mn) => [dn ? `${dn} ${dn === 1 ? 'seduta' : 'sedute'} di trattamento con Davide` : '', mn ? `${mn} ${mn === 1 ? 'seduta' : 'sedute'} con Morena` : ''].filter(Boolean).join(' e ');
    const phase = (n, col, title, items) => {
      h3(title);
      items.filter(Boolean).forEach(t => bullet(t)); y += 1;
    };
    phase(1, BRAND, `Fase 1 · settimane 1–4 (${longDate(wk(0))} – ${longDate(addDays(wk(4), -1))}): liberare e riequilibrare`, [
      `${sess(opt.d[0], opt.m[0]) || 'Sedute da concordare'}: trattamento delle catene interessate, con ritest dei muscoli a ogni seduta.`,
      opt.evalM ? 'Morena entra in una delle sedute per una prima valutazione del movimento: così il lavoro della fase 2 parte già impostato su di te.' : '']);
    phase(2, GOLD, `Fase 2 · settimane 5–8 (${longDate(wk(4))} – ${longDate(addDays(wk(8), -1))}): stabilizzare e rinforzare`, [
      `${sess(opt.d[1], opt.m[1]) || 'Sedute da concordare'}: rinforzo dei muscoli profondi, controllo del movimento e trattamenti di richiamo.`,
      `Controllo con foto il ${longDate(addDays(s0, 42))} (6 settimane): confronto con oggi in Che Postura e, se serve, aggiustamento del piano.`]);
    phase(3, BLUE, `Fase 3 · settimane 9–12 (${longDate(wk(8))} – ${longDate(addDays(wk(12), -1))}): integrare e mantenere`, [
      `${sess(opt.d[2], opt.m[2]) || 'Sedute da concordare'}: portare la nuova postura nei gesti di ogni giorno e nello sport.`,
      `Rivalutazione completa il ${longDate(addDays(s0, 84))}: foto, test muscolari, mobilità e appoggio dei piedi, per decidere insieme come proseguire.`]);
    const tot = [opt.d.reduce((a, b) => a + b, 0), opt.m.reduce((a, b) => a + b, 0)];
    table(['Fase', 'Sedute con Davide', 'Sedute con Morena', 'Controlli'], [
      ['1 · settimane 1–4', String(opt.d[0]), opt.m[0] + (opt.evalM ? ' + valutazione' : ''), '—'],
      ['2 · settimane 5–8', String(opt.d[1]), String(opt.m[1]), 'foto e test il ' + shortDate(addDays(s0, 42))],
      ['3 · settimane 9–12', String(opt.d[2]), String(opt.m[2]), 'rivalutazione il ' + shortDate(addDays(s0, 84))],
      ['Totale', String(tot[0]), tot[1] + (opt.evalM ? ' + valutazione' : ''), '12 settimane']
    ], [46, 38, 44, CW - 128]);
    text('Dopo i 3 mesi: percorso di mantenimento da concordare, con un controllo ogni 2–3 mesi.', { size: 8, color: MUTED });

    // progressi
    const keep = a => a.num != null || /tallone|mandibola|apertura/i.test(a.label);
    const meas = (last.auto || []).filter(keep).map(a => [a.label, a.val]);
    if (two) for (const a of (first.auto || []).filter(keep)) if (!meas.some(m => m[0] === a.label)) meas.push([a.label, `${a.val} (${shortDate(first.date)})`]);
    if (meas.length || last.mobility) {
      h2('Come misureremo i progressi');
      const rows = meas.map(([l, v]) => [l, v, targetOf(l)]);
      if (last.mobility) rows.push(['Mobilità articolare', `indice ${last.mobility.index}/100`, 'Sopra 90/100, differenze destra–sinistra sotto i 10°.']);
      table(['Parametro', 'Oggi', 'Obiettivo a 12 settimane'], rows, [62, 44, CW - 106]);
    }

    box(DISC + ' Se compaiono dolore notturno, formicolii, perdita di forza o un dolore che peggiora invece di migliorare, è importante parlarne subito con il medico.');
    box('Prossimo passo. Se la proposta ti convince, ne parliamo alla prossima seduta e fissiamo insieme le date. Siamo a disposizione per qualsiasi domanda.', GOLD, [246, 241, 228]);
    ensure(16); y += 8;
    doc.setDrawColor(...INK); doc.setLineWidth(0.3); doc.line(M, y, M + 80, y); doc.line(W - M - 80, y, W - M, y);
    font(8.8, 'normal', INK); doc.text('Dott. Davide Scuderi', M, y + 4); doc.text('Dott.ssa Morena Anastasi', W - M - 80, y + 4);
    // piè di pagina
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); font(7.2, 'normal', MUTED);
      doc.text(pdfTxt(`Che Postura · Kinesiologia Studio, Via Capilupi 21, Modena · ${longDate(todayIso())} · foto e dati trattati secondo il consenso firmato`), M, 291);
      doc.text(`${i}/${n}`, W - M, 291, { align: 'right' });
    }
    return doc.output('blob');
  }

  window.CPReport = { open, build };
})();
