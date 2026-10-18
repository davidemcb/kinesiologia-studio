// Worker Cloudflare: riceve le foto dalla scheda, le fa leggere a Claude e restituisce
// una lettura strutturata che usa SOLO gli id della base di conoscenza inviata dall'app.
// Le foto non vengono salvate: passano in memoria e basta.
//
// Variabili: ANTHROPIC_API_KEY (segreto), ALLOWED_ORIGIN (es. https://tuodominio.it),
// APP_TOKEN (facoltativo: se impostato, l'app deve mandarlo come Bearer).

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';
const MAX_FOTO = 6;
const MAX_BYTES_FOTO = 2_500_000; // base64, ~1,8 MB di JPEG

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['qualita_foto', 'tipo_pelle', 'fototipo_stimato', 'inestetismi', 'segnalazioni_medico', 'note'],
  properties: {
    qualita_foto: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['etichetta', 'utilizzabile', 'problema'], properties: {
        etichetta: { type: 'string' }, utilizzabile: { type: 'boolean' }, problema: { type: 'string', description: 'Vuoto se utilizzabile; altrimenti cosa non va (buio, sfocata, trucco, filtro, troppo lontana, non è la vista richiesta).' } } }
    },
    tipo_pelle: { type: 'string', enum: ['secca', 'grassa', 'mista', 'normale', 'sensibile', 'non_valutabile'] },
    fototipo_stimato: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'non_valutabile'] },
    inestetismi: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['id', 'grado', 'zone', 'confidenza', 'evidenza'], properties: {
        id: { type: 'string', description: 'Un id del catalogo inestetismi, nessun altro.' },
        grado: { type: 'integer', minimum: 1, maximum: 3, description: '1 lieve, 2 moderato, 3 marcato' },
        zone: { type: 'array', items: { type: 'string' }, description: 'Solo id di zona del catalogo per quell\'area.' },
        confidenza: { type: 'string', enum: ['bassa', 'media', 'alta'] },
        evidenza: { type: 'string', description: 'Cosa si vede nella foto che lo giustifica, una frase, in italiano.' } } }
    },
    segnalazioni_medico: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['id', 'motivo'], properties: { id: { type: 'string' }, motivo: { type: 'string' } } }
    },
    note: { type: 'string', description: 'Osservazioni brevi per l\'estetista. Vuoto se nulla da aggiungere.' }
  }
};

const SYSTEM = `Sei un sistema di supporto per estetiste professioniste. Osservi fotografie di viso e corpo e descrivi gli INESTETISMI visibili, usando esclusivamente il catalogo che ti viene fornito nel messaggio.

Regole:
- Lavori nel perimetro estetico: descrivi inestetismi, mai patologie. Non fai diagnosi. Se vedi qualcosa che potrebbe richiedere un medico (neo irregolare o cambiato, lesione che non guarisce, acne infiammatoria con noduli, dermatite estesa, sospetta rosacea, gonfiore di una sola gamba, varici dolenti, sospetto lipedema), lo inserisci in segnalazioni_medico con l'id corrispondente del catalogo e un motivo breve, senza nominare malattie come certe.
- Usa solo gli id del catalogo inestetismi e solo gli id di zona elencati per quell'area. Se un inestetismo visibile non ha una voce nel catalogo, scrivilo nelle note.
- Il grado è visivo: 1 appena percettibile, 2 evidente, 3 marcato. La confidenza riflette quanto la foto lo mostra con chiarezza; con luce o messa a fuoco scarsa abbassa la confidenza e segnalalo in qualita_foto.
- Prima giudica ogni foto: utilizzabile o no, e perché. Non inventare dettagli su foto inutilizzabili.
- Non valutare età, peso, bellezza o aspetto in generale: solo inestetismi del catalogo.
- Tieni conto del contesto fornito (età, fototipo dichiarato, pelle percepita, obiettivi) ma non farti guidare: se la foto non lo conferma, dillo nelle note.
- Rispondi in italiano, con frasi brevi e concrete nelle evidenze. L'estetista rivedrà e confermerà ogni voce.`;

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map(s => s.trim());
  const ok = allowed.includes('*') || allowed.includes(origin);
  return {
    'access-control-allow-origin': ok ? (origin || '*') : allowed[0],
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '86400',
    vary: 'origin'
  };
}

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const h = cors(origin, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/analizza') return json({ errore: 'Usa POST /analizza' }, 404, h);

    if (env.APP_TOKEN) {
      const auth = request.headers.get('authorization') || '';
      if (auth !== 'Bearer ' + env.APP_TOKEN) return json({ errore: 'Non autorizzato' }, 401, h);
    }
    if (!env.ANTHROPIC_API_KEY) return json({ errore: 'ANTHROPIC_API_KEY non configurata nel worker' }, 500, h);

    let body;
    try { body = await request.json(); } catch { return json({ errore: 'JSON non valido' }, 400, h); }
    const { foto, contesto = {}, catalogo } = body || {};
    if (!Array.isArray(foto) || !foto.length) return json({ errore: 'Nessuna foto' }, 400, h);
    if (foto.length > MAX_FOTO) return json({ errore: 'Al massimo ' + MAX_FOTO + ' foto' }, 400, h);
    if (!catalogo || !Array.isArray(catalogo.inestetismi) || !catalogo.zone) return json({ errore: 'Catalogo mancante' }, 400, h);
    for (const f of foto) {
      if (typeof f.data !== 'string' || f.data.length > MAX_BYTES_FOTO) return json({ errore: 'Foto troppo grande o non valida: ' + f.etichetta }, 400, h);
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.media_type)) return json({ errore: 'Formato non supportato: ' + f.media_type }, 400, h);
    }

    const catalogoTesto = [
      'CATALOGO INESTETISMI (id · nome · area · segni visibili · zone tipiche):',
      ...catalogo.inestetismi.map(i => `- ${i.id} · ${i.nome} · ${i.area} · ${i.segni} · zone: ${(i.zone_tipiche || []).join(', ')}`),
      '',
      'ZONE VISO: ' + catalogo.zone.viso.join(', '),
      'ZONE CORPO: ' + catalogo.zone.corpo.join(', '),
      '',
      'SEGNALAZIONI AL MEDICO (id · descrizione):',
      ...(catalogo.segnalazioni || []).map(s => `- ${s.id} · ${s.nome}`)
    ].join('\n');

    const contestoTesto = [
      'CONTESTO DICHIARATO DALLA CLIENTE:',
      contesto.eta ? `- età: ${contesto.eta}` : null,
      contesto.fototipo_dichiarato ? `- fototipo dichiarato: ${contesto.fototipo_dichiarato}` : null,
      contesto.pelle_percepita ? `- pelle percepita: ${contesto.pelle_percepita}` : null,
      contesto.obiettivi && contesto.obiettivi.length ? `- obiettivi: ${contesto.obiettivi.join(', ')}` : null,
      contesto.note ? `- note: ${String(contesto.note).slice(0, 500)}` : null
    ].filter(Boolean).join('\n');

    const content = [];
    for (const f of foto) {
      const avvisi = Array.isArray(f.avvisi_qualita) && f.avvisi_qualita.length ? ` (controllo qualità dell'app: ${f.avvisi_qualita.join('; ')})` : '';
      content.push({ type: 'text', text: `Foto "${f.etichetta}"${f.descrizione ? ' · ' + f.descrizione : ''}${avvisi}:` });
      content.push({ type: 'image', source: { type: 'base64', media_type: f.media_type, data: f.data } });
    }
    content.push({ type: 'text', text: `${catalogoTesto}\n\n${contestoTesto}\n\nLeggi le foto e compila la lettura strutturata.` });

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const res = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content }],
        output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } }
      });
      if (res.stop_reason === 'refusal') return json({ errore: 'Il modello ha rifiutato di leggere queste foto. Riprova con foto più neutre o compila a mano.' }, 422, h);
      if (res.stop_reason === 'max_tokens') return json({ errore: 'Risposta troncata, riprova.' }, 502, h);
      const testo = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
      const lettura = JSON.parse(testo);

      // Difesa in profondità: scarta id fuori catalogo anche se il modello li inventasse
      const ids = new Set(catalogo.inestetismi.map(i => i.id));
      const areaDi = Object.fromEntries(catalogo.inestetismi.map(i => [i.id, i.area]));
      const segIds = new Set((catalogo.segnalazioni || []).map(s => s.id));
      lettura.inestetismi = (lettura.inestetismi || []).filter(i => ids.has(i.id)).map(i => ({ ...i, zone: (i.zone || []).filter(z => (catalogo.zone[areaDi[i.id]] || []).includes(z)) }));
      lettura.segnalazioni_medico = (lettura.segnalazioni_medico || []).filter(s => segIds.has(s.id));
      lettura.modello = res.model;
      lettura.uso = { input: res.usage.input_tokens, output: res.usage.output_tokens, cache: res.usage.cache_read_input_tokens || 0 };
      return json(lettura, 200, h);
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) return json({ errore: 'Troppe richieste, riprova fra poco.' }, 429, h);
      if (e instanceof Anthropic.AuthenticationError) return json({ errore: 'Chiave API non valida.' }, 500, h);
      if (e instanceof Anthropic.APIConnectionError) return json({ errore: 'Connessione all\'API fallita, riprova.' }, 504, h);
      if (e instanceof Anthropic.APIError) return json({ errore: 'Errore API ' + e.status + ': ' + e.message }, 502, h);
      if (e instanceof SyntaxError) return json({ errore: 'Risposta non leggibile dal modello, riprova.' }, 502, h);
      return json({ errore: 'Errore interno: ' + (e && e.message) }, 500, h);
    }
  }
};
