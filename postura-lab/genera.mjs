// Rigenera locandina-a4.png e locandina-a4.pdf da locandina.html.
// Uso: node postura-lab/genera.mjs   (serve Playwright con Chromium)
import pw from 'playwright'; const { chromium } = pw;
import { resolve } from 'node:path';
const dir = new URL('.', import.meta.url).pathname;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 2 });
await p.goto('file://' + resolve(dir, 'locandina.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
const card = await p.$('#a4');
await card.screenshot({ path: resolve(dir, 'locandina-a4.png') });
await p.pdf({ path: resolve(dir, 'locandina-a4.pdf'), width: '1240px', height: '1754px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await b.close();
console.log('ok');
