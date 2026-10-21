import os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTS = 'fonts'  # cartella con Fraunces.ttf e InstrumentSans.ttf scaricati da Google Fonts
OUT = '.'
os.makedirs(OUT, exist_ok=True)

VERDE='#2F5D51'; VERDE_SCURO='#24493F'; ARANCIO='#E8742A'; ARANCIO_CH='#F2A46C'
CREMA='#F6F3EA'; INCHIOSTRO='#22302B'; TENUE='#5C6B64'

class Face:
    def __init__(self, path):
        self.f = TTFont(path); self.upm = self.f['head'].unitsPerEm
        self.cmap = self.f.getBestCmap(); self.gs = self.f.getGlyphSet()
        self.hmtx = self.f['hmtx']; self.kern = self._kern()
    def _kern(self):
        k = {}
        if 'GPOS' not in self.f: return k
        gpos = self.f['GPOS'].table
        for lk in gpos.LookupList.Lookup:
            subs = lk.SubTable
            if lk.LookupType == 9: subs = [s.ExtSubTable for s in subs]
            for st in subs:
                if getattr(st, 'LookupType', lk.LookupType) != 2: continue
                cov = st.Coverage.glyphs
                if st.Format == 1:
                    for g1, ps in zip(cov, st.PairSet):
                        for pvr in ps.PairValueRecord:
                            v = pvr.Value1.XAdvance if pvr.Value1 and hasattr(pvr.Value1,'XAdvance') else 0
                            k.setdefault((g1, pvr.SecondGlyph), v)
                elif st.Format == 2:
                    c1 = st.ClassDef1.classDefs; c2 = st.ClassDef2.classDefs
                    for g1 in cov:
                        cl1 = c1.get(g1, 0)
                        for g2, cl2 in list(c2.items()) + [(None, 0)]:
                            if g2 is None: continue
                            rec = st.Class1Record[cl1].Class2Record[cl2]
                            v = rec.Value1.XAdvance if rec.Value1 and hasattr(rec.Value1,'XAdvance') else 0
                            if v: k.setdefault((g1, g2), v)
        return k
    def text(self, s, size, x=0, y=0, fill=None, letter=0):
        """returns (svg path d, advance width in px). baseline at y."""
        sc = size / self.upm
        d = []; pen_x = 0; prev = None
        for ch in s:
            g = self.cmap.get(ord(ch))
            if prev and g: pen_x += self.kern.get((prev, g), 0)
            if g:
                sp = SVGPathPen(self.gs)
                tp = TransformPen(sp, (sc, 0, 0, -sc, x + pen_x*sc, y))
                self.gs[g].draw(tp)
                d.append(sp.getCommands())
                pen_x += self.hmtx[g][0] + letter / sc
            prev = g
        return ' '.join(d), pen_x * sc

fr = Face(f'{FONTS}/Fraunces.ttf'); isans = Face(f'{FONTS}/InstrumentSans.ttf')

def mark(x, y, s, bg=VERDE_SCURO, fig=ARANCIO, dots=CREMA, rounded=True):
    """Il marchio: figura dritta con braccia al cielo (dal sito), in un quadrato arrotondato di lato s."""
    k = s / 100.0
    def P(px, py): return f'{x + px*k:.2f} {y + py*k:.2f}'
    parts = []
    if bg:
        r = 22*k if rounded else 0
        parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{s:.2f}" height="{s:.2f}" rx="{r:.2f}" fill="{bg}"/>')
    sw = lambda w: f'{w*k:.2f}'
    parts.append(f'<g fill="none" stroke="{fig}" stroke-linecap="round" stroke-linejoin="round">')
    # gambe
    parts.append(f'<path d="M{P(50,66)} L{P(43,88)} M{P(50,66)} L{P(57,88)}" stroke-width="{sw(6)}"/>')
    # tronco dritto
    parts.append(f'<path d="M{P(50,66)} L{P(50,37)}" stroke-width="{sw(9)}"/>')
    # braccia a V
    parts.append(f'<path d="M{P(50,43)} L{P(31,23)} M{P(50,43)} L{P(69,23)}" stroke-width="{sw(5)}"/>')
    parts.append('</g>')
    # testa
    parts.append(f'<circle cx="{x+50*k:.2f}" cy="{y+20*k:.2f}" r="{11*k:.2f}" fill="{fig}"/>')
    # sorriso e occhi
    parts.append(f'<path d="M{P(45.5,23)} q4.5 4 9 0" fill="none" stroke="{dots}" stroke-width="{sw(1.8)}" stroke-linecap="round"/>')
    parts.append(f'<circle cx="{x+46*k:.2f}" cy="{y+17.5*k:.2f}" r="{1.3*k:.2f}" fill="{dots}"/><circle cx="{x+54*k:.2f}" cy="{y+17.5*k:.2f}" r="{1.3*k:.2f}" fill="{dots}"/>')
    # vertebre: puntini sulla colonna
    for py in (42, 48, 54, 60):
        parts.append(f'<circle cx="{x+50*k:.2f}" cy="{y+py*k:.2f}" r="{1.4*k:.2f}" fill="{dots}"/>')
    return '\n'.join(parts)

def wordmark(x, baseline, size, color, bang=ARANCIO):
    d1, w1 = fr.text('Che Postura', size, x, baseline)
    d2, w2 = fr.text('!', size, x + w1, baseline)
    return (f'<path d="{d1}" fill="{color}"/>\n<path d="{d2}" fill="{bang}"/>', w1 + w2)

def svg(w, h, body, bg=None, label='Che Postura!'):
    bgr = f'<rect width="{w}" height="{h}" fill="{bg}"/>\n' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">\n'
            f'{bgr}{body}\n</svg>\n')

def save(name, content):
    with open(f'{OUT}/{name}', 'w') as f: f.write(content)
    print('scritto', name)

# ---- 1. orizzontale (testo scuro, per sfondi chiari) e chiaro (per sfondi verdi)
def orizzontale(color, bg, name):
    size = 120; S = 128; pad = 24
    d, w = wordmark(0, 0, size, color)
    # bounding box del testo per centrare verticalmente
    bp = BoundsPen(fr.gs)
    for ch in 'ChePostura!':
        g = fr.cmap[ord(ch)]; fr.gs[g].draw(bp)
    xmin, ymin, xmax, ymax = bp.bounds
    sc = size / fr.upm; asc = ymax*sc; desc = -ymin*sc
    text_h = asc + desc
    H = max(S, text_h) + 2*pad
    y_mark = (H - S)/2
    baseline = (H - text_h)/2 + asc
    gap = 36
    body = mark(pad, y_mark, S) + '\n' + wordmark(pad + S + gap, baseline, size, color)[0]
    W = pad + S + gap + w + pad
    save(name, svg(W, H, body, bg))
    return W, H

orizzontale(VERDE_SCURO, None, 'che-postura-logo.svg')
orizzontale(CREMA, VERDE_SCURO, 'che-postura-logo-su-verde.svg')
orizzontale(CREMA, None, 'che-postura-logo-chiaro.svg')

# ---- 2. verticale: marchio sopra, scritta sotto, tagline
def verticale(color, bg, name, tagline=True):
    S = 200; size = 96; pad = 40; gap = 28
    d, w = wordmark(0, 0, size, color)
    W = max(w, S) + 2*pad
    y = pad
    body = mark((W - S)/2, y, S); y += S + gap
    bp = BoundsPen(fr.gs)
    for ch in 'ChePostura!':
        fr.gs[fr.cmap[ord(ch)]].draw(bp)
    xmin, ymin, xmax, ymax = bp.bounds; sc = size/fr.upm
    baseline = y + ymax*sc
    body += '\n' + wordmark((W - w)/2, baseline, size, color)[0]
    y = baseline - ymin*sc + 18
    if tagline:
        tsize = 26
        td, tw = isans.text('Due professionisti. Un solo percorso: il tuo.', tsize, 0, 0, letter=0.4)
        tcol = TENUE if color == VERDE_SCURO else ARANCIO_CH
        body += '\n' + f'<path d="{isans.text("Due professionisti. Un solo percorso: il tuo.", tsize, (W - tw)/2, y + tsize*0.75, letter=0.4)[0]}" fill="{tcol}"/>'
        y += tsize + 6
    H = y + pad
    save(name, svg(W, H, body, bg))

verticale(VERDE_SCURO, None, 'che-postura-logo-verticale.svg')
verticale(CREMA, VERDE_SCURO, 'che-postura-logo-verticale-su-verde.svg')

# ---- 3. solo marchio (icona) e solo scritta
save('che-postura-marchio.svg', svg(512, 512, mark(0, 0, 512)))
save('che-postura-marchio-crema.svg', svg(512, 512, mark(0, 0, 512, bg=CREMA, fig=VERDE_SCURO, dots=CREMA) ))
d, w = wordmark(0, 0, 160, VERDE_SCURO)
bp = BoundsPen(fr.gs)
for ch in 'ChePostura!': fr.gs[fr.cmap[ord(ch)]].draw(bp)
xmin, ymin, xmax, ymax = bp.bounds; sc = 160/fr.upm
H = (ymax - ymin)*sc + 40
save('che-postura-scritta.svg', svg(w + 40, H, wordmark(20, 20 + ymax*sc, 160, VERDE_SCURO)[0]))
save('che-postura-scritta-crema.svg', svg(w + 40, H, wordmark(20, 20 + ymax*sc, 160, CREMA)[0]))
