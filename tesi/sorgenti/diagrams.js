const { chromium } = require('playwright');
const fs = require('fs');
const font = "font-family: 'Liberation Serif','Times New Roman',serif;";
const box = (x,y,w,h,title,lines,fill='#f3f6fa',stroke='#2b4c7e')=>{
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  s+=`<text x="${x+w/2}" y="${y+22}" text-anchor="middle" font-size="17" font-weight="bold" fill="#1b2d4a">${title}</text>`;
  lines.forEach((l,i)=>{ s+=`<text x="${x+w/2}" y="${y+44+i*18}" text-anchor="middle" font-size="14" fill="#222">${l}</text>`; });
  return s;
};
const arrow = (x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2b4c7e" stroke-width="2.5" marker-end="url(#ah)"/>`;
const defs = `<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#2b4c7e"/></marker></defs>`;

// 1. Ciclo del passo
function ciclo(){
  const W=1000,H=430; let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="${font}background:white">${defs}`;
  s+=`<text x="${W/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1b2d4a">Il ciclo del passo e il comportamento del piede</text>`;
  const x0=40, x1=960, y=70, h=50; const px=p=>x0+(x1-x0)*p/100;
  const phases=[[0,2,'Contatto iniziale','#c9daf0'],[2,12,'Risposta al carico','#b7cdeb'],[12,31,'Appoggio intermedio','#a5c0e6'],[31,50,'Appoggio terminale','#93b3e1'],[50,62,'Pre-oscillazione','#81a6dc'],[62,100,'Fase di oscillazione','#e4e4e4']];
  phases.forEach(([a,b,n,c])=>{ s+=`<rect x="${px(a)}" y="${y}" width="${px(b)-px(a)}" height="${h}" fill="${c}" stroke="#555"/>`;
    if((b-a)<4){ s+=`<text x="${(px(a)+px(b))/2}" y="${y+h/2+5}" text-anchor="middle" font-size="12" fill="#111">CI</text>`; } else { s+=`<text x="${(px(a)+px(b))/2}" y="${y+h/2+5}" text-anchor="middle" font-size="13" fill="#111">${n}</text>`; } });
  s+=`<text x="${px(0)}" y="${y+h+36}" font-size="12" fill="#555">CI = contatto iniziale (0–2%)</text>`;
  [0,12,31,50,62,100].forEach(p=>{ s+=`<text x="${px(p)}" y="${y+h+18}" text-anchor="middle" font-size="12" fill="#333">${p}%</text>`; });
  s+=`<text x="${(px(0)+px(62))/2}" y="${y-10}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1b2d4a">FASE DI APPOGGIO (circa 60%)</text>`;
  s+=`<text x="${(px(62)+px(100))/2}" y="${y-10}" text-anchor="middle" font-size="14" font-weight="bold" fill="#555">OSCILLAZIONE (circa 40%)</text>`;
  // lower boxes
  const by=168, bh=128, bw=215;
  s+=box(px(0),by,bw,bh,'Contatto e carico',['Retropiede in lieve supinazione','al contatto del tallone, poi','PRONAZIONE sottoastragalica:','il piede si “sblocca”, assorbe','l’urto e si adatta al terreno']);
  s+=box(px(0)+bw+22,by,bw,bh,'Appoggio intermedio',['Carico sull’intero piede,','la tibia avanza sull’astragalo','(dorsiflessione talocrurale).','Massima pronazione, poi','inizio della risupinazione']);
  s+=box(px(0)+2*(bw+22),by,bw,bh,'Appoggio terminale',['Sollevamento del tallone,','estensione delle dita:','meccanismo windlass, arco','che si innalza, SUPINAZIONE:','il piede diventa una leva rigida']);
  s+=box(px(0)+3*(bw+22),by,bw,bh,'Pre-oscillazione',['Spinta sull’avampiede','(tricipite surale, flessore lungo','dell’alluce, peroneo lungo).','Trasferimento del carico','all’arto controlaterale'],'#f7f3ea','#8a6d3b');
  s+=arrow(px(0)+bw,by+bh/2,px(0)+bw+20,by+bh/2); s+=arrow(px(0)+2*bw+22,by+bh/2,px(0)+2*bw+42,by+bh/2); s+=arrow(px(0)+3*bw+44,by+bh/2,px(0)+3*bw+64,by+bh/2);
  s+=`<text x="${W/2}" y="320" text-anchor="middle" font-size="15" fill="#1b2d4a" font-weight="bold">Piede mobile (pronazione) → adattamento e assorbimento  |  Piede rigido (supinazione) → stabilità e propulsione</text>`;
  s+=`<text x="${W/2}" y="350" text-anchor="middle" font-size="13" fill="#333">Nel piede piatto-pronato la fase di pronazione è eccessiva o prolungata e la risupinazione è ritardata o incompleta:</text>`;
  s+=`<text x="${W/2}" y="370" text-anchor="middle" font-size="13" fill="#333">la spinta avviene su un piede ancora “sbloccato”, con maggiore lavoro dei muscoli stabilizzatori (tibiale posteriore, intrinseci).</text>`;
  s+=`<text x="${W/2}" y="410" text-anchor="middle" font-size="11" fill="#777">Schema originale elaborato dall’autrice sulla base delle fasi del passo descritte da Perry e Burnfield (2010).</text>`;
  return s+'</svg>';
}
// 2. Catene cinetiche
function catene(){
  const W=1000,H=730; let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="${font}background:white">${defs}`;
  s+=`<text x="${W/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1b2d4a">Catena cinetica ascendente e discendente nel piede pronato</text>`;
  const lw=430, lx=40, rx=530, bh=84, gap=22, y0=70;
  s+=`<text x="${lx+lw/2}" y="${y0-8}" text-anchor="middle" font-size="16" font-weight="bold" fill="#8a2f2f">CATENA ASCENDENTE (dal piede verso l’alto)</text>`;
  s+=`<text x="${rx+lw/2}" y="${y0-8}" text-anchor="middle" font-size="16" font-weight="bold" fill="#2f5e8a">CATENA DISCENDENTE (dall’alto verso il piede)</text>`;
  const L=[['Piede: pronazione eccessiva',['eversione del calcagno, crollo dell’arco mediale,','abduzione dell’avampiede']],
           ['Caviglia e gamba',['rotazione interna della tibia accoppiata','alla pronazione sottoastragalica']],
           ['Ginocchio',['valgo dinamico, aumento dello stress','femoro-rotuleo e sul legamento collaterale mediale']],
           ['Anca e femore',['rotazione interna e adduzione del femore,','maggiore lavoro di glutei ed extrarotatori']],
           ['Bacino e rachide lombare',['tendenza all’anteversione, iperlordosi,','asimmetrie del cingolo pelvico']]];
  const R=[['Bacino e tronco',['anteversione pelvica, scarso controllo','lombo-pelvico, iperlordosi']],
           ['Anca',['debolezza di glutei ed extrarotatori,','turnout insufficiente dall’anca']],
           ['Ginocchio',['rotazione forzata della tibia per','“aprire” i piedi (screwing the knee)']],
           ['Caviglia e gamba',['rotazione esterna della tibia sul piede fisso,','retropiede che cede in valgo']],
           ['Piede: pronazione compensatoria',['“rolling in”: cedimento dell’arco mediale,','sovraccarico di tibiale posteriore e alluce']]];
  L.forEach(([t,l],i)=>{ const y=y0+i*(bh+gap); s+=box(lx,y,lw,bh,t,l,'#fbf1f1','#8a2f2f'); if(i<L.length-1) s+=arrow(lx+lw/2,y+bh,lx+lw/2,y+bh+gap-1); });
  R.forEach(([t,l],i)=>{ const y=y0+i*(bh+gap); s+=box(rx,y,lw,bh,t,l,'#eef4fb','#2f5e8a'); if(i<R.length-1) s+=arrow(rx+lw/2,y+bh,rx+lw/2,y+bh+gap-1); });
  const yb=y0+5*(bh+gap)+6;
  s+=`<rect x="${lx}" y="${yb}" width="${rx+lw-lx}" height="78" rx="8" fill="#f7f3ea" stroke="#8a6d3b" stroke-width="2"/>`;
  s+=`<text x="${W/2}" y="${yb+24}" text-anchor="middle" font-size="15" font-weight="bold" fill="#1b2d4a">Le due catene si sommano nel danzatore</text>`;
  s+=`<text x="${W/2}" y="${yb+46}" text-anchor="middle" font-size="13" fill="#222">Un piede piatto-pronato riduce la base stabile su cui costruire il turnout; un turnout forzato dall’alto scarica sul piede</text>`;
  s+=`<text x="${W/2}" y="${yb+64}" text-anchor="middle" font-size="13" fill="#222">la rotazione che l’anca non fornisce. Il risultato è un circolo vizioso di pronazione, instabilità e sovraccarico.</text>`;
  s+=`<text x="${W/2}" y="${H-12}" text-anchor="middle" font-size="11" fill="#777">Schema originale elaborato dall’autrice (concetti da Tiberio 1987; Khamis e Yizhar 2007; Howse 2000).</text>`;
  return s+'</svg>';
}
// 3. Windlass
function windlass(){
  const W=1000,H=430; let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="${font}background:white">${defs}`;
  s+=`<text x="${W/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1b2d4a">Il meccanismo windlass (argano) dell’aponeurosi plantare</text>`;
  const foot=(ox,oy,lift,toeAngle,label,desc)=>{
    // ground
    s+=`<line x1="${ox}" y1="${oy+120}" x2="${ox+420}" y2="${oy+120}" stroke="#888" stroke-width="3"/>`;
    // calcaneus
    const cx=ox+70, cy=oy+120-lift*1.1;
    s+=`<ellipse cx="${cx}" cy="${cy-30}" rx="40" ry="32" fill="#e8dcc8" stroke="#6b5a3e" stroke-width="2"/>`;
    // tibia
    s+=`<rect x="${cx+25}" y="${oy-40}" width="34" height="${90-lift*1.1}" fill="#e8dcc8" stroke="#6b5a3e" stroke-width="2"/>`;
    // talus
    s+=`<ellipse cx="${cx+42}" cy="${cy-55}" rx="34" ry="20" fill="#e8dcc8" stroke="#6b5a3e" stroke-width="2"/>`;
    // arch bones as a curved band
    const archH=40+lift;
    const mx=ox+300, my=oy+120-14; // metatarsal head
    s+=`<path d="M ${cx+20} ${cy-40} Q ${(cx+mx)/2} ${cy-40-archH} ${mx-20} ${my-18}" fill="none" stroke="#6b5a3e" stroke-width="22" stroke-linecap="round"/>`;
    s+=`<path d="M ${cx+20} ${cy-40} Q ${(cx+mx)/2} ${cy-40-archH} ${mx-20} ${my-18}" fill="none" stroke="#e8dcc8" stroke-width="16" stroke-linecap="round"/>`;
    // metatarsal head
    s+=`<circle cx="${mx}" cy="${my}" r="16" fill="#e8dcc8" stroke="#6b5a3e" stroke-width="2"/>`;
    // toe
    const tl=70; const tx=mx+tl*Math.cos(-toeAngle*Math.PI/180), ty=my+tl*Math.sin(-toeAngle*Math.PI/180);
    s+=`<line x1="${mx}" y1="${my}" x2="${tx}" y2="${ty}" stroke="#6b5a3e" stroke-width="18" stroke-linecap="round"/>`;
    s+=`<line x1="${mx}" y1="${my}" x2="${tx}" y2="${ty}" stroke="#e8dcc8" stroke-width="12" stroke-linecap="round"/>`;
    // plantar fascia: from calcaneus bottom to around met head to toe
    const fy=cy+2; const wrapX=mx+16*Math.cos((90-toeAngle/2)*Math.PI/180), wrapY=my+16*Math.sin((90-toeAngle/2)*Math.PI/180);
    s+=`<path d="M ${cx-10} ${fy} L ${mx-6} ${my+15} A 16 16 0 0 0 ${wrapX} ${wrapY} L ${tx} ${ty+10}" fill="none" stroke="#c0392b" stroke-width="4"/>`;
    s+=`<text x="${(cx+mx)/2}" y="${oy+112}" text-anchor="middle" font-size="12" fill="#c0392b" font-weight="bold">aponeurosi plantare</text>`;
    s+=`<text x="${cx-10}" y="${oy+145}" text-anchor="middle" font-size="12" fill="#333">calcagno</text>`;
    s+=`<text x="${mx}" y="${oy+145}" text-anchor="middle" font-size="12" fill="#333">testa del I metatarso</text>`;
    s+=`<text x="${tx+25}" y="${ty-6}" text-anchor="middle" font-size="12" fill="#333">alluce</text>`;
    s+=`<text x="${ox+210}" y="${oy+180}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1b2d4a">${label}</text>`;
    desc.forEach((d,i)=>s+=`<text x="${ox+210}" y="${oy+202+i*18}" text-anchor="middle" font-size="13" fill="#222">${d}</text>`);
  };
  foot(40,80,0,0,'A. Appoggio plantare completo',['Sotto carico l’arco si abbassa, l’aponeurosi','si tende e trattiene passivamente le estremità','dell’arco (calcagno e teste metatarsali).']);
  foot(540,80,22,55,'B. Estensione dell’alluce (relevé, spinta)',['L’aponeurosi si avvolge sulla testa del I metatarso','come la fune su un argano: si accorcia, l’arco si innalza,','il retropiede supina e il piede diventa una leva rigida.']);
  s+=arrow(470,180,530,180);
  s+=`<text x="${W/2}" y="${H-40}" text-anchor="middle" font-size="13" fill="#333">Nel piede piatto-pronato l’argano è meno efficiente: l’arco resta basso in propulsione e in relevé, con maggiore stress su aponeurosi, sesamoidi e flessore lungo dell’alluce.</text>`;
  s+=`<text x="${W/2}" y="${H-12}" text-anchor="middle" font-size="11" fill="#777">Schema originale elaborato dall’autrice sul modello descritto da Hicks (1954).</text>`;
  return s+'</svg>';
}
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({deviceScaleFactor:2});
  for(const [n,f] of [['ciclo_passo',ciclo],['catene_cinetiche',catene],['windlass',windlass]]){
    const svg=f(); fs.writeFileSync(n+'.svg',svg);
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const el=await p.$('svg'); await el.screenshot({path:n+'.png'});
  }
  await b.close();
})();
