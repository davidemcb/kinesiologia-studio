// Motore delle regole: trasforma anamnesi + lettura della pelle in un piano di lavoro.
// Funziona sia nel browser (import) sia in Node (test). Nessuna dipendenza.

const PESO_GRADO = { 1: 1, 2: 2, 3: 3 };
const DURATA_MAX_SEDUTA = 90;

function unici(arr) { return [...new Set(arr)]; }

/** Valuta le risposte dell'anamnesi: controindicazioni attive, segnalazioni al medico, abitudini da correggere. */
export function valutaAnamnesi(kb, anamnesi, risposte = {}) {
  const attive = new Map();
  const segnalazioni = new Set();
  const domande = anamnesi.sezioni.flatMap(s => s.domande);

  for (const d of domande) {
    const r = risposte[d.id];
    if (r === undefined || r === null || r === '') continue;
    if (d.controindicazione && r === true) attive.set(d.controindicazione, d.id);
    if (d.mappa && d.mappa[r]) attive.set(d.mappa[r], d.id);
    if (d.segnala && r === true) segnalazioni.add(d.segnala);
  }

  const controindicazioni = [...attive.keys()].map(id => ({ id, domanda: attive.get(id), ...kb.controindicazioni[id] }));
  for (const c of controindicazioni) if (c.segnala_medico) segnalazioni.add('controindicazione:' + c.id);

  const abitudini = kb.abitudini.filter(a => {
    const r = risposte[a.domanda];
    if (r === undefined || r === null || r === '') return false;
    const q = a.quando;
    if ('is' in q) return r === q.is;
    if ('in' in q) return q.in.includes(r);
    const n = Number(r);
    if (Number.isNaN(n)) return false;
    if ('max' in q && n > q.max) return false;
    if ('min' in q && n < q.min) return false;
    return true;
  });

  return { controindicazioni, segnalazioni: [...segnalazioni], abitudini };
}

function ordinaInestetismi(kb, inestetismi, obiettivi) {
  return inestetismi
    .filter(i => kb.inestetismi[i.id])
    .map(i => {
      const def = kb.inestetismi[i.id];
      const grado = PESO_GRADO[i.grado] || 2;
      const bonus = obiettivi.includes(i.id) ? 1 : 0;
      return { ...i, def, peso: grado * def.priorita + bonus };
    })
    .sort((a, b) => b.peso - a.peso);
}

function pianoArea(kb, area, inestetismi, ctx) {
  if (!inestetismi.length) return null;
  const { bloccati, cautela, motivoBlocco, attiviVietati } = ctx;

  // Punteggio dei trattamenti: somma (peso inestetismo × priorità del trattamento per quell'inestetismo)
  const punteggio = new Map();
  const perche = new Map();
  for (const i of inestetismi) {
    for (const [t, p] of i.def.trattamenti) {
      punteggio.set(t, (punteggio.get(t) || 0) + i.peso * p);
      if (!perche.has(t)) perche.set(t, []);
      perche.get(t).push(i.def.nome);
    }
  }

  const esclusi = [];
  const ammessi = [];
  for (const [t, score] of punteggio) {
    const def = kb.trattamenti[t];
    if (!def || !def.area.includes(area)) continue;
    if (bloccati.has(t)) { esclusi.push({ id: t, nome: def.nome, motivo: motivoBlocco.get(t) }); continue; }
    ammessi.push({ id: t, score, def, cautela: cautela.has(t), perche: unici(perche.get(t)) });
  }
  ammessi.sort((a, b) => b.score - a.score);

  // Trattamenti fissi di apertura e chiusura
  const fissi = Object.entries(kb.trattamenti)
    .filter(([, d]) => d.area.includes(area) && (area === 'viso' ? d.sempre : d.sempre_corpo))
    .map(([id, def]) => ({ id, def, score: 0, fisso: true, perche: [] }));

  const perFase = {};
  for (const f of kb.fasi_seduta) perFase[f.id] = ammessi.filter(a => a.def.fase === f.id && !a.def.sempre && !a.def.sempre_corpo);

  const top = inestetismi.slice(0, 3);
  const nSedute = Math.min(12, Math.max(...top.map(i => i.def.sedute)));
  const frequenza = inestetismi[0].def.frequenza;

  const scegli = (lista, k, quante = 1) => {
    if (!lista.length) return [];
    const out = [lista[0]];
    if (quante > 1 && lista.length > 1) {
      const alt = lista.slice(1, 4);
      out.push(alt[k % alt.length]);
    } else if (lista.length > 1 && k % 2 === 1 && lista[1].score >= lista[0].score * 0.6) {
      // alterna fra i primi due quando hanno peso simile
      out[0] = lista[1];
    }
    return out;
  };

  const sedute = [];
  for (let k = 0; k < nSedute; k++) {
    const voci = [];
    for (const f of kb.fasi_seduta) {
      if (f.id === 'accoglienza') { voci.push({ fase: f, voce: null }); continue; }
      const fissiFase = fissi.filter(x => x.def.fase === f.id);
      for (const x of fissiFase) voci.push({ fase: f, voce: x });
      const lista = perFase[f.id];
      let scelti = [];
      if (f.id === 'azione') scelti = scegli(lista, k, 2);
      else if (['esfoliazione', 'massaggio', 'maschera'].includes(f.id)) scelti = scegli(lista, k, 1);
      else if (lista.length && lista[0].score > 0) scelti = [lista[0]];
      // mai due strumentali nella stessa fase
      const visti = new Set();
      for (const s of scelti) {
        const chiave = s.def.tipo === 'strumentale' ? 'strumentale' : s.id;
        if (visti.has(chiave)) continue;
        visti.add(chiave);
        voci.push({ fase: f, voce: s });
      }
    }
    // Rientra nel tempo massimo togliendo le voci secondarie meno pesanti
    let durata = voci.reduce((s, v) => s + (v.voce ? v.voce.def.durata_min : 5), 0);
    while (durata > DURATA_MAX_SEDUTA) {
      const rimovibili = voci.filter(v => v.voce && !v.voce.fisso).sort((a, b) => a.voce.score - b.voce.score);
      if (!rimovibili.length) break;
      voci.splice(voci.indexOf(rimovibili[0]), 1);
      durata = voci.reduce((s, v) => s + (v.voce ? v.voce.def.durata_min : 5), 0);
    }
    sedute.push({
      numero: k + 1,
      durata_min: durata,
      voci: voci.map(v => ({
        fase: v.fase.nome,
        fase_id: v.fase.id,
        trattamento: v.voce ? {
          id: v.voce.id, nome: v.voce.def.nome, tipo: v.voce.def.tipo, durata_min: v.voce.def.durata_min,
          descrizione: v.voce.def.descrizione, tessuti: v.voce.def.tessuti.map(t => kb.tessuti[t].nome),
          cautela: !!v.voce.cautela, perche: v.voce.perche
        } : null
      }))
    });
  }

  // Tessuti bersaglio in ordine di peso
  const pesoTessuto = new Map();
  for (const i of inestetismi) for (const t of i.def.tessuti) pesoTessuto.set(t, (pesoTessuto.get(t) || 0) + i.peso);
  const tessuti = [...pesoTessuto.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => ({ id: t, ...kb.tessuti[t] }));

  // Principi attivi: suggeriti dagli inestetismi, tolti quelli da evitare per altri inestetismi o controindicazioni
  const evitare = new Set([...attiviVietati, ...inestetismi.flatMap(i => i.def.evitare_attivi)]);
  const attivi = unici(inestetismi.flatMap(i => i.def.attivi))
    .filter(a => !evitare.has(a))
    .map(a => ({ id: a, ...kb.attivi[a] }));
  const attiviEvitati = [...evitare].filter(a => kb.attivi[a]).map(a => ({ id: a, nome: kb.attivi[a].nome }));

  const casa = unici(inestetismi.slice(0, 4).flatMap(i => i.def.casa)).slice(0, 10);

  return {
    area,
    inestetismi: inestetismi.map(i => ({ id: i.id, nome: i.def.nome, grado: i.grado, zone: i.zone || [], fonte: i.fonte, peso: i.peso, tessuti: i.def.tessuti.map(t => kb.tessuti[t].nome) })),
    tessuti,
    trattamenti: ammessi.slice(0, 8).map(a => ({ id: a.id, nome: a.def.nome, tipo: a.def.tipo, score: a.score, cautela: a.cautela, perche: a.perche })),
    esclusi,
    ciclo: { sedute: nSedute, frequenza, durata_media_min: Math.round(sedute.reduce((s, x) => s + x.durata_min, 0) / sedute.length) },
    sedute,
    attivi,
    attivi_evitati: attiviEvitati,
    casa
  };
}

/** Genera il piano di lavoro completo a partire dalla scheda. */
export function generaPiano(kb, anamnesi, scheda) {
  const risposte = scheda.risposte || {};
  const valutazione = valutaAnamnesi(kb, anamnesi, risposte);

  const bloccati = new Set();
  const cautela = new Set();
  const motivoBlocco = new Map();
  const attiviVietati = new Set();
  for (const c of valutazione.controindicazioni) {
    for (const t of c.blocca || []) { bloccati.add(t); if (!motivoBlocco.has(t)) motivoBlocco.set(t, c.nome); }
    for (const t of c.cautela || []) cautela.add(t);
    for (const a of c.evita_attivi || []) attiviVietati.add(a);
  }

  const obiettivi = [...(risposte.obiettivi_viso || []), ...(risposte.obiettivi_corpo || [])];
  const tutti = ordinaInestetismi(kb, scheda.inestetismi || [], obiettivi);
  const ctx = { bloccati, cautela, motivoBlocco, attiviVietati };

  const segnalazioni = unici([...(valutazione.segnalazioni), ...((scheda.segnalazioni || []).map(s => typeof s === 'string' ? s : s.id))])
    .map(id => {
      if (id.startsWith('controindicazione:')) {
        const c = kb.controindicazioni[id.split(':')[1]];
        return { id, nome: c.nome, azione: 'Chiedere il nulla osta del medico curante prima di iniziare.' };
      }
      const s = kb.segnalazioni_medico.find(x => x.id === id);
      const extra = (scheda.segnalazioni || []).find(x => x && x.id === id);
      return s ? { ...s, motivo: extra && extra.motivo } : { id, nome: id, azione: 'Valutare con il medico.' };
    });

  return {
    generato_il: new Date().toISOString(),
    cliente: { nome: risposte.nome || '', eta: risposte.eta || '', fototipo: risposte.fototipo || '' },
    controindicazioni: valutazione.controindicazioni.map(c => ({ id: c.id, nome: c.nome, nota: c.nota })),
    segnalazioni,
    abitudini: valutazione.abitudini.map(a => ({ id: a.id, consiglio: a.consiglio, impatto: a.impatto.filter(i => tutti.some(x => x.id === i)).map(i => kb.inestetismi[i].nome) })),
    viso: pianoArea(kb, 'viso', tutti.filter(i => i.def.area === 'viso'), ctx),
    corpo: pianoArea(kb, 'corpo', tutti.filter(i => i.def.area === 'corpo'), ctx)
  };
}
