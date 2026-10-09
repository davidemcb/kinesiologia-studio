/* Strato dati dell'Area riservata.
   - Online: Supabase (accessi, database, archivio privato delle foto).
   - Demo: se config.js e' vuoto, tutto resta in questo browser con pazienti di esempio. */
(function () {
  'use strict';
  const CFG = window.AREA_CONFIG || {};
  const ONLINE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const PCOLS = 'id,full_name,birth,phone,email,consent_date,notes,user_id,code_created_at,created_at,updated_at';
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  function newCode() {
    const b = new Uint8Array(8); crypto.getRandomValues(b);
    const s = [...b].map(x => ALPHA[x % ALPHA.length]).join('');
    return s.slice(0, 4) + '-' + s.slice(4);
  }
  async function sha256(t) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const today = () => new Date().toISOString().slice(0, 10);
  const err = m => { const e = new Error(m); e.userMessage = m; return e; };

  // riassunto per l'elenco: ultima visita e prossimo controllo
  function summarize(patients, visits) {
    const t = today();
    return patients.map(p => {
      const vs = visits.filter(v => v.patient_id === p.id).sort((a, b) => (a.date < b.date ? 1 : -1));
      const last = vs[0];
      const next = last && last.plan && Array.isArray(last.plan.next) ? (last.plan.next.find(n => n.date >= t) || null) : null;
      return { ...p, visits_count: vs.length, last_visit: last ? last.date : null, next_control: next };
    });
  }

  /* ------------------------------------------------------------------ ONLINE */
  function makeOnline() {
    const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
    const bucket = () => sb.storage.from('pazienti');
    const urlCache = {};
    const check = ({ data, error }) => { if (error) throw err(error.message || 'Errore del database'); return data; };
    async function removeFolder(prefix) {
      const items = check(await bucket().list(prefix, { limit: 1000 })) || [];
      const files = [];
      for (const it of items) {
        if (it.id) files.push(prefix + '/' + it.name);
        else files.push(...(await listAll(prefix + '/' + it.name)));
      }
      if (files.length) check(await bucket().remove(files));
    }
    async function listAll(prefix) {
      const items = check(await bucket().list(prefix, { limit: 1000 })) || [];
      return items.filter(i => i.id).map(i => prefix + '/' + i.name);
    }
    return {
      mode: 'online',
      async session() {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return null;
        const prof = check(await sb.from('profiles').select('role,full_name,patient_id').eq('id', session.user.id).maybeSingle());
        return { user: { id: session.user.id, email: session.user.email }, role: prof ? prof.role : null, name: prof ? prof.full_name : '', patientId: prof ? prof.patient_id : null };
      },
      async signIn(email, password) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw err(/invalid/i.test(error.message) ? 'Email o password non corrette.' : error.message);
      },
      async signUp(email, password) {
        const { data, error } = await sb.auth.signUp({ email, password });
        if (error) throw err(/registered/i.test(error.message) ? 'Questa email ha gia\' un accesso: entra con la tua password.' : error.message);
        if (!data.session) throw err('Controlla la tua email per confermare l\'accesso, poi entra.');
      },
      async signOut() { await sb.auth.signOut(); },
      async claim(code) {
        const { data, error } = await sb.rpc('claim_patient', { code: normCode(code) });
        if (error) throw err(/scaduto|valido/i.test(error.message) ? 'Codice non valido o scaduto: chiedi allo studio un nuovo codice.' : error.message);
        return data;
      },
      async listPatients() {
        const ps = check(await sb.from('patients').select(PCOLS).order('full_name'));
        const vs = check(await sb.from('visits').select('patient_id,date,plan'));
        return summarize(ps, vs);
      },
      async getPatient(id) { return check(await sb.from('patients').select(PCOLS).eq('id', id).single()); },
      async createPatient(d) {
        const code = newCode();
        const row = { ...d, access_code_hash: await sha256(normCode(code)), code_created_at: new Date().toISOString() };
        const patient = check(await sb.from('patients').insert(row).select(PCOLS).single());
        return { patient, code };
      },
      async updatePatient(id, d) { check(await sb.from('patients').update({ ...d, updated_at: new Date().toISOString() }).eq('id', id)); },
      async newAccessCode(id) {
        const code = newCode();
        check(await sb.from('patients').update({ access_code_hash: await sha256(normCode(code)), code_created_at: new Date().toISOString() }).eq('id', id));
        return code;
      },
      async deletePatient(id) { await removeFolder(id); check(await sb.from('patients').delete().eq('id', id)); },
      async listVisits(pid) {
        return check(await sb.from('visits').select('*').eq('patient_id', pid).order('date', { ascending: false }).order('created_at', { ascending: false }));
      },
      async getVisit(id) { return check(await sb.from('visits').select('*').eq('id', id).single()); },
      async saveVisit(pid, visit, files, pdf) {
        const { data: { user } } = await sb.auth.getUser();
        const v = check(await sb.from('visits').insert({ ...visit, patient_id: pid, photos: {}, created_by: user ? user.id : null }).select('id').single());
        const photos = {};
        for (const [vk, blob] of Object.entries(files || {})) {
          const path = `${pid}/${v.id}/${vk}.jpg`;
          check(await bucket().upload(path, blob, { contentType: 'image/jpeg', upsert: true }));
          photos[vk] = path;
        }
        let pdf_path = null;
        if (pdf) { pdf_path = `${pid}/${v.id}/referto.pdf`; check(await bucket().upload(pdf_path, pdf, { contentType: 'application/pdf', upsert: true })); }
        check(await sb.from('visits').update({ photos, pdf_path }).eq('id', v.id));
        return v.id;
      },
      async deleteVisit(v) { await removeFolder(`${v.patient_id}/${v.id}`); check(await sb.from('visits').delete().eq('id', v.id)); },
      async fileUrl(path) {
        if (!path) return null;
        const c = urlCache[path];
        if (c && c.exp > Date.now()) return c.url;
        const { data, error } = await bucket().createSignedUrl(path, 3600);
        if (error) return null;
        urlCache[path] = { url: data.signedUrl, exp: Date.now() + 3000 * 1000 };
        return data.signedUrl;
      },
      async listSessions(pid) {
        return check(await sb.from('sessions').select('*').eq('patient_id', pid).order('date', { ascending: false }).order('created_at', { ascending: false }));
      },
      async addSession(pid, e) {
        const s = await this.session();
        return check(await sb.from('sessions').insert({ ...e, patient_id: pid, author_id: s ? s.user.id : null, author_name: s ? s.name : null }).select().single());
      },
      async deleteSession(id) { check(await sb.from('sessions').delete().eq('id', id)); },
      async backup() {
        return { esportato: new Date().toISOString(), pazienti: check(await sb.from('patients').select(PCOLS)), visite: check(await sb.from('visits').select('*')), sedute: check(await sb.from('sessions').select('*')) };
      }
    };
  }

  /* -------------------------------------------------------------------- DEMO */
  function makeDemo() {
    const KEY = 'area_demo_v1';
    const mem = { data: null };
    const load = () => {
      if (mem.data) return mem.data;
      try { const s = localStorage.getItem(KEY); if (s) mem.data = JSON.parse(s); } catch (e) {}
      if (!mem.data) mem.data = seed();
      return mem.data;
    };
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem.data)); } catch (e) {} };
    const uid = () => Math.random().toString(36).slice(2, 10);
    // file della demo (foto, PDF) in IndexedDB, se il browser lo permette
    const idb = {
      p: null,
      open() {
        if (!this.p) this.p = new Promise((res) => {
          try {
            const r = indexedDB.open('area_demo_files', 2);
            r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('f')) r.result.createObjectStore('f'); };
            r.onsuccess = () => res(r.result); r.onerror = () => res(null);
          } catch (e) { res(null); }
        });
        return this.p;
      },
      async put(k, v) { const db = await this.open(); if (!db) return; await new Promise(r => { const t = db.transaction('f', 'readwrite'); t.objectStore('f').put(v, k); t.oncomplete = r; t.onerror = r; }); },
      async get(k) { const db = await this.open(); if (!db) return null; return new Promise(r => { const q = db.transaction('f').objectStore('f').get(k); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); }); },
      async del(k) { const db = await this.open(); if (!db) return; db.transaction('f', 'readwrite').objectStore('f').delete(k); }
    };
    const urls = {};
    // pazienti in piu' pubblicati accanto alla demo (file facoltativo, privato)
    const extraP = fetch('demo-extra.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
    async function mergeExtra() {
      const ex = await extraP, d = load();
      if (!ex) return;
      let changed = false;
      for (const p of ex.patients || []) if (!d.patients.some(x => x.id === p.id)) { d.patients.push(p); changed = true; }
      for (const v of ex.visits || []) if (!d.visits.some(x => x.id === v.id)) { d.visits.push(v); changed = true; }
      if (changed) save();
    }
    return {
      mode: 'demo',
      async session() { await mergeExtra(); return load().session || null; },
      async demoLogin(who) {
        const d = load();
        const maria = d.patients.find(p => p.user_id === 'demo-maria');
        d.session = who === 'paziente'
          ? { user: { id: 'demo-maria', email: 'maria.rossi@esempio.it' }, role: 'patient', name: maria ? maria.full_name : 'Maria Rossi', patientId: maria ? maria.id : null }
          : { user: { id: 'demo-' + who, email: who + '@studio.it' }, role: 'admin', name: who === 'morena' ? 'Morena Anastasi' : 'Davide Scuderi', patientId: null };
        save();
      },
      async signIn() { throw err('Nella versione dimostrativa entra con i pulsanti di prova qui sotto.'); },
      async signUp() { throw err('Nella versione dimostrativa entra con i pulsanti di prova qui sotto.'); },
      async signOut() { load().session = null; save(); },
      async claim(code) {
        const d = load(), p = d.patients.find(x => x.demo_code && normCode(x.demo_code) === normCode(code));
        if (!p) throw err('Codice non valido o scaduto: chiedi allo studio un nuovo codice.');
        p.user_id = 'demo-' + p.id; p.demo_code = null; p.code_created_at = null;
        d.session = { user: { id: p.user_id, email: p.email || '' }, role: 'patient', name: p.full_name, patientId: p.id };
        save(); return p.full_name;
      },
      async listPatients() { const d = load(); return summarize(d.patients.slice().sort((a, b) => a.full_name.localeCompare(b.full_name)), d.visits); },
      async getPatient(id) { const p = load().patients.find(x => x.id === id); if (!p) throw err('Paziente non trovato.'); return p; },
      async createPatient(f) {
        const d = load(), code = newCode();
        const p = { id: uid(), ...f, user_id: null, demo_code: code, code_created_at: new Date().toISOString(), created_at: new Date().toISOString() };
        d.patients.push(p); save(); return { patient: p, code };
      },
      async updatePatient(id, f) { Object.assign(load().patients.find(x => x.id === id), f); save(); },
      async newAccessCode(id) { const p = load().patients.find(x => x.id === id), code = newCode(); p.demo_code = code; p.code_created_at = new Date().toISOString(); save(); return code; },
      async deletePatient(id) {
        const d = load();
        for (const v of d.visits.filter(v => v.patient_id === id)) await this.deleteVisit(v);
        d.patients = d.patients.filter(p => p.id !== id); save();
      },
      async listVisits(pid) { return load().visits.filter(v => v.patient_id === pid).sort((a, b) => (a.date === b.date ? (a.created_at < b.created_at ? 1 : -1) : a.date < b.date ? 1 : -1)); },
      async getVisit(id) { const v = load().visits.find(x => x.id === id); if (!v) throw err('Visita non trovata.'); return v; },
      async saveVisit(pid, visit, files, pdf) {
        const d = load(), id = uid(), photos = {};
        for (const [vk, blob] of Object.entries(files || {})) { const k = `${pid}/${id}/${vk}.jpg`; await idb.put(k, blob); photos[vk] = k; }
        let pdf_path = null;
        if (pdf) { pdf_path = `${pid}/${id}/referto.pdf`; await idb.put(pdf_path, pdf); }
        d.visits.push({ ...visit, id, patient_id: pid, photos, pdf_path, created_at: new Date().toISOString() }); save();
        return id;
      },
      async deleteVisit(v) {
        for (const k of [...Object.values(v.photos || {}), v.pdf_path].filter(Boolean)) await idb.del(k);
        const d = load(); d.visits = d.visits.filter(x => x.id !== v.id); save();
      },
      async fileUrl(path) {
        if (!path) return null;
        if (path.startsWith('demo/')) return path;
        if (urls[path]) return urls[path];
        const b = await idb.get(path);
        return b ? (urls[path] = URL.createObjectURL(b)) : null;
      },
      async listSessions(pid) {
        const d = load(), s = d.session;
        return (d.sessions || []).filter(x => x.patient_id === pid && (!s || s.role === 'admin' || x.visible_to_patient))
          .sort((a, b) => (a.date === b.date ? (a.created_at < b.created_at ? 1 : -1) : a.date < b.date ? 1 : -1));
      },
      async addSession(pid, e) {
        const d = load(); d.sessions = d.sessions || [];
        const row = { ...e, id: uid(), patient_id: pid, author_name: d.session ? d.session.name : '', created_at: new Date().toISOString() };
        d.sessions.push(row); save(); return row;
      },
      async deleteSession(id) { const d = load(); d.sessions = (d.sessions || []).filter(x => x.id !== id); save(); },
      async backup() { const d = load(); return { esportato: new Date().toISOString(), pazienti: d.patients, visite: d.visits, sedute: d.sessions || [] }; },
      async resetDemo() { mem.data = seed(); save(); await mergeExtra(); }
    };
  }

  /* pazienti e visite di esempio per la demo (inventati) */
  function seed() {
    const F = {
      incl: { title: 'Emipelvi dx più alta', text: 'Il bacino è inclinato di lato: il lato dx sale. Si accorciano i flessori laterali del tronco dx e gli abduttori sx.', corti: ['Quadrato dei lombi dx', 'Adduttori dx', 'Medio gluteo sx', 'TFL sx'], lunghi: ['Quadrato dei lombi sx', 'Medio gluteo dx', 'TFL dx'] },
      testa: { title: 'Testa avanti', text: 'La testa è davanti alla linea delle spalle: nuca e collo anteriore si accorciano, i flessori profondi del collo e i muscoli tra le scapole perdono forza.', corti: ['Suboccipitali', 'SCM', 'Scaleni', 'Trapezio superiore', 'Piccolo pettorale'], lunghi: ['Flessori profondi del collo', 'Trapezio medio', 'Trapezio inferiore', 'Romboidi'] },
      spalla: { title: 'Spalla dx più alta', text: 'La spalla dx sale: lavorano troppo gli elevatori dx, mentre la spalla sx è tirata in basso dal gran dorsale sx.', corti: ['Trapezio superiore dx', 'Elevatore della scapola dx', 'Gran dorsale sx'], lunghi: ['Trapezio inferiore dx', 'Gran dorsale dx'] },
      ant: { title: 'Spalle anteposte', text: 'Le spalle sono in avanti e ruotate verso l\'interno: pettorali accorciati, muscoli tra le scapole allungati.', corti: ['Piccolo pettorale', 'Grande pettorale'], lunghi: ['Romboidi', 'Trapezio medio', 'Sottospinoso e piccolo rotondo'] }
    };
    const EX = {
      clam: { group: 'rinforzo', name: 'Clamshell con elastico', dose: '3×15 per lato', why: 'rinforza medio gluteo dx. Entrambi i lati, una serie in più a dx', how: 'Anche leggermente flesse, bacino fermo: si apre solo il ginocchio.' },
      mermaid: { group: 'allungamento', name: 'Mermaid', dose: '2×6 per lato', why: 'allunga e scarica quadrato dei lombi dx', how: 'Seduto, inclina il busto lontano dal lato da allungare e respira nel fianco.' },
      chin: { group: 'rinforzo', name: 'Chin tuck da supino', dose: '3×10, tieni 5 s', why: 'rinforza flessori profondi del collo; allunga e scarica suboccipitali', how: 'Annuisci piano come per dire sì: la nuca scivola sul lettino.' },
      ytw: { group: 'rinforzo', name: 'Y, T, W da prono', dose: '2×8 per lettera', why: 'rinforza trapezio medio, trapezio inferiore, romboidi', how: 'Pollici in su: porta le scapole indietro e in basso prima di sollevare le braccia.' },
      trap: { group: 'allungamento', name: 'Allungamento del trapezio superiore', dose: '2×30 s per lato', why: 'allunga e scarica trapezio superiore', how: 'Mano sotto la sedia, orecchio verso la spalla opposta e mento un po\' in basso.' },
      door: { group: 'allungamento', name: 'Allungamento dei pettorali alla porta', dose: '2×30 s per lato', why: 'allunga e scarica grande e piccolo pettorale', how: 'Avambraccio sullo stipite, fai un passo avanti senza inarcare la schiena.' }
    };
    const A = (label, val, desc, sev, num) => ({ label, val, desc, sev, num });
    return {
      session: null,
      sessions: [
        { id: 's1', patient_id: 'p1', date: '2026-06-10', kind: 'trattamento', author_name: 'Davide Scuderi', visible_to_patient: false, exercises: [], created_at: '2026-06-10T10:00:00Z',
          zones: [{ zone: 'Lombare', side: 'dx', tech: ['Miofasciale', 'Decontratturante'] }, { zone: 'Bacino e sacro-iliache', side: 'dx', tech: ['Manipolazioni'] }, { zone: 'Coscia (adduttori)', side: 'dx', tech: ['Stretching'] }],
          tests: [{ name: 'Lasègue', side: 'dx', result: 'Negativo', note: '' }, { name: 'FABER (Patrick)', side: 'dx', result: 'Positivo', note: 'dolore sacro-iliaco' }],
          text: 'Dolore lombare da 5 a 3 su 10 a fine seduta.' },
        { id: 's2', patient_id: 'p1', date: '2026-06-17', kind: 'allenamento', author_name: 'Morena Anastasi', visible_to_patient: true, created_at: '2026-06-17T18:00:00Z',
          zones: [{ zone: 'Glutei', side: 'bilaterale', tech: ['Rinforzo'] }, { zone: 'Dorsale', side: '', tech: ['Pilates mat work', 'Mobilità'] }], tests: [],
          text: 'Prima seduta di rinforzo, buona esecuzione. Da curare la posizione del bacino nel clamshell.',
          exercises: [{ name: 'Clamshell con elastico', dose: '3×15 per lato', load: 'elastico leggero', note: 'una serie in più a dx' }, { name: 'Y, T, W da prono', dose: '2×8', load: 'corpo libero', note: '' }, { name: 'Mermaid', dose: '2×6 per lato', load: '', note: '' }] },
        { id: 's3', patient_id: 'p1', date: '2026-07-01', kind: 'allenamento', author_name: 'Morena Anastasi', visible_to_patient: true, created_at: '2026-07-01T18:00:00Z',
          zones: [{ zone: 'Core e addome', side: '', tech: ['Pilates mat work'] }, { zone: 'Glutei', side: 'bilaterale', tech: ['Rinforzo'] }],
          tests: [{ name: 'Trendelenburg', side: 'dx', result: 'Migliorato', note: '' }],
          text: 'Aumentato il carico, nessun fastidio lombare.',
          exercises: [{ name: 'The Hundred', dose: '1×100', load: '', note: '' }, { name: 'Shoulder bridge', dose: '3×8 per lato', load: 'corpo libero', note: 'nuovo' }, { name: 'Clamshell', dose: '3×15 per lato', load: 'elastico medio', note: '' }] }
      ],
      patients: [
        { id: 'p1', full_name: 'Maria Rossi', birth: '1988-04-12', phone: '333 000 0001', email: 'maria.rossi@esempio.it', consent_date: '2026-06-03', notes: 'Impiegata, molte ore al computer. Lombalgia saltuaria.', user_id: 'demo-maria', demo_code: null, code_created_at: null },
        { id: 'p2', full_name: 'Luca Bianchi', birth: '1975-11-02', phone: '333 000 0002', email: '', consent_date: '2026-09-20', notes: '', user_id: null, demo_code: 'K7MP-Q4XZ', code_created_at: '2026-09-20T10:00:00Z' },
        { id: 'p3', full_name: 'Giulia Verdi', birth: '1992-02-21', phone: '', email: 'giulia@esempio.it', consent_date: '2026-10-01', notes: 'Prima visita da fare.', user_id: null, demo_code: 'R2TD-8HWN', code_created_at: '2026-10-01T10:00:00Z' }
      ],
      visits: [
        { id: 'v1', patient_id: 'p1', date: '2026-06-03', height: 165, notes: 'Dolore lombare 5/10.',
          auto: [A('Bacino (livello delle anche)', 'dx più alto di 1,6 cm', 'Lato dx più alto (media di 2 viste).', 'warn', 1.6), A('Spalle', 'sx più alto di 1,2 cm', 'Lato sx più alto.', 'warn', 1.2), A('Testa sul piano laterale', '6,4 cm avanti', 'L\'orecchio è davanti alla spalla: testa avanti.', 'warn', 6.4)],
          findings: [F.incl, F.testa], exercises: [EX.clam, EX.chin, EX.ytw, EX.mermaid, EX.trap], extras: [],
          plan: { name: 'Piano moderato', next: [{ date: '2026-06-10', label: 'Seconda seduta' }, { date: '2026-06-24', label: 'Terza seduta' }, { date: '2026-07-15', label: 'Controllo a sei settimane' }] },
          photos: {}, pdf_path: null, created_at: '2026-06-03T10:00:00Z' },
        { id: 'v2', patient_id: 'p1', date: '2026-07-15', height: 165, notes: 'Dolore lombare 2/10.',
          auto: [A('Bacino (livello delle anche)', 'dx più alto di 0,7 cm', 'Differenza piccola.', 'ok', 0.7), A('Spalle', 'sx più alto di 0,5 cm', 'Differenza piccola.', 'ok', 0.5), A('Testa sul piano laterale', '4,2 cm avanti', 'Orecchio quasi sulla linea della spalla.', 'ok', 4.2)],
          findings: [], exercises: [EX.chin, EX.ytw, EX.mermaid], extras: [],
          plan: { name: 'Piano lieve', next: [{ date: '2026-10-15', label: 'Controllo a tre mesi' }, { date: '2027-01-15', label: 'Mantenimento' }] },
          photos: {}, pdf_path: null, created_at: '2026-07-15T10:00:00Z' },
        { id: 'v3', patient_id: 'p2', date: '2026-09-20', height: 178, notes: '',
          auto: [A('Spalle', 'dx più alto di 1,8 cm', 'Lato dx più alto.', 'warn', 1.8), A('Spalle sul piano laterale', '5,1 cm avanti', 'La spalla è davanti all\'anca: spalle anteposte.', 'warn', 5.1)],
          findings: [F.spalla, F.ant], exercises: [EX.ytw, EX.door, EX.trap], extras: [],
          plan: { name: 'Piano moderato', next: [{ date: '2026-09-27', label: 'Seconda seduta' }, { date: '2026-10-11', label: 'Terza seduta' }, { date: '2026-11-01', label: 'Controllo a sei settimane' }] },
          photos: {}, pdf_path: null, created_at: '2026-09-20T10:00:00Z' }
      ]
    };
  }

  window.Api = ONLINE ? makeOnline() : makeDemo();
  window.Api.normCode = normCode;
})();
