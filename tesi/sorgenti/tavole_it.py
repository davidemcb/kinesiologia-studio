# Traduce in italiano le etichette delle tavole di Gray (1918) e compone le tavole della tesi.
# Etichette esterne: cancellate e riscritte in italiano. Etichette sul disegno: coperte da un numero (legenda in didascalia).
import os, statistics
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
GRAY = os.path.join(HERE, 'gray')
S = 2  # fattore di ingrandimento di lavoro
MARGIN = 80  # margine bianco (px originali) per le etichette lunghe
FONT_IT = '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'
FONT_B = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

def load(n):
    im = Image.open(f'{GRAY}/Gray{n}.png').convert('RGB')
    im = im.crop(ImageOps.invert(im).getbbox())
    im = ImageOps.expand(im, border=MARGIN, fill='white')
    return im.resize((im.size[0] * S, im.size[1] * S), Image.LANCZOS)

def median_border(im, box):
    x0, y0, x1, y1 = box
    px = []
    for x in range(x0, x1, 3):
        for y in (y0 - 3, y1 + 3):
            if 0 <= y < im.size[1] and 0 <= x < im.size[0]: px.append(im.getpixel((x, y)))
    for y in range(y0, y1, 3):
        for x in (x0 - 3, x1 + 3):
            if 0 <= y < im.size[1] and 0 <= x < im.size[0]: px.append(im.getpixel((x, y)))
    if not px: return (255, 255, 255)
    return tuple(int(statistics.median(c[i] for c in px)) for i in range(3))

def erase(im, box, white):
    d = ImageDraw.Draw(im)
    if white:
        d.rectangle(box, fill=(255, 255, 255)); return
    d.rounded_rectangle(box, radius=3 * S, fill=(255, 255, 255), outline=(90, 90, 90), width=1)

def fit_text(d, text, box, maxw_factor=1.25):
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    bh = min(bh, 13 * S)
    maxw = int(max(bw * maxw_factor, 70 * S))
    for lines in (1, 2, 3):
        words = text.split()
        # suddivisione in righe bilanciate
        if lines == 1: parts = [text]
        else:
            n = len(words); per = -(-n // lines)
            parts = [' '.join(words[i:i + per]) for i in range(0, n, per)]
        size = int(bh / (lines * 0.95)) if lines > 1 else int(bh * 1.05)
        size = max(size, 9 * S)
        while size >= 9 * S:
            f = ImageFont.truetype(FONT_IT, size)
            widths = [d.textlength(p, font=f) for p in parts]
            if max(widths) <= maxw: return f, parts
            size -= 1
    f = ImageFont.truetype(FONT_IT, 9 * S)
    return f, parts

def write_label(im, text, box, white=True, anchor='c', maxw=1.25):
    box = [(v + MARGIN) * S for v in box]
    d = ImageDraw.Draw(im)
    f, parts = fit_text(d, text, box, maxw)
    lh = f.size * 1.05
    total = lh * len(parts)
    cx = (box[0] + box[2]) / 2; cy = (box[1] + box[3]) / 2
    tw = max(d.textlength(p, font=f) for p in parts)
    if anchor == 'c': tx0 = cx - tw / 2
    elif anchor == 'l': tx0 = box[0]
    else: tx0 = box[2] - tw
    tbox = [tx0 - 3 * S, cy - total / 2 - 2 * S, tx0 + tw + 3 * S, cy + total / 2 + 2 * S]
    y = cy - total / 2
    for p in parts:
        w = d.textlength(p, font=f)
        x = cx - w / 2 if anchor == 'c' else (box[0] if anchor == 'l' else box[2] - w)
        d.text((x, y), p, font=f, fill=(20, 20, 20))
        y += lh

def number_label(im, num, box, white=False, r=None):
    box = [(v + MARGIN) * S for v in box]
    d = ImageDraw.Draw(im)
    r = r or 9 * S
    cx = (box[0] + box[2]) / 2; cy = (box[1] + box[3]) / 2
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill='white', outline='black', width=max(1, S))
    f = ImageFont.truetype(FONT_B, int(r * 1.3))
    w = d.textlength(str(num), font=f)
    d.text((cx - w / 2, cy - f.size * 0.62), str(num), font=f, fill='black')

# ---- definizioni per tavola: (tipo, testo/numero, box, white) ----
PL = {
 290: [('t', 'Astragalo', [104, 36, 148, 52], False), ('t', 'Calcagno', [40, 96, 116, 114], False),
       ('t', 'Navicolare', [183, 46, 226, 98], False), ('t', 'I cuneiforme', [216, 68, 270, 126], False),
       ('t', 'I metatarso', [268, 93, 368, 150], False), ('t', 'Falangi', [388, 146, 462, 174], False)],
 291: [('t', 'Astragalo', [328, 31, 382, 51], False), ('t', 'Calcagno', [358, 96, 437, 115], False),
       ('t', 'Cuboide', [278, 88, 322, 105], False), ('t', 'Navicolare', [268, 22, 322, 64], False),
       ('e', 0, [236, 33, 284, 52], False), ('t', 'II cuneif.', [206, 33, 258, 52], False), ('t', 'III cuneif.', [248, 54, 292, 77], False),
       ('t', 'Metatarso', [146, 90, 234, 129], False), ('t', 'Falangi', [46, 111, 124, 154], False)],
 354: [('t', 'Legamento deltoideo', [156, 130, 237, 144], True),
       ('t', 'Legamento talo-navicolare', [109, 144, 220, 158], True),
       ('t', 'Legamento cuneo-navicolare dorsale II', [66, 155, 185, 177], True),
       ('t', 'Legamento cuneo-navicolare dorsale I', [50, 179, 175, 202], True),
       ('t', 'Legamento tibio-astragalico posteriore', [427, 184, 541, 197], True, {'anchor': 'l'}),
       ('t', 'Legamento talo-calcaneare mediale', [422, 219, 543, 234], True, {'anchor': 'l'}),
       ('t', 'Legamento talo-calcaneare posteriore', [427, 247, 534, 260], True),
       ('t', 'Capsula articolare', [28, 358, 112, 372], True, {'maxw': 1.0}),
       ('t', 'Legamento cuneo-navicolare mediale', [116, 358, 228, 372], True, {'maxw': 1.0}),
       ('t', 'Legamento calcaneo-cuboideo', [132, 371, 250, 384], True),
       ('t', 'Legamento calcaneo-navicolare plantare', [186, 382, 292, 407], True),
       ('t', 'Legamento lungo plantare', [301, 406, 408, 419], True)],
 356: [('t', 'Tibia', [98, 36, 137, 54], False), ('t', 'Fibula', [153, 53, 197, 72], False),
       ('t', 'Astragalo', [58, 203, 102, 222], False), ('t', 'Calcagno', [133, 306, 212, 327], False),
       ('t', 'Legamento peroneo-astragalico anteriore', [246, 152, 420, 172], True, {'anchor': 'l'}),
       ('t', 'Legamento peroneo-astragalico posteriore', [245, 190, 424, 209], True, {'anchor': 'l'}),
       ('t', 'Legamento peroneo-calcaneare', [245, 208, 395, 224], True, {'anchor': 'l'}),
       ('t', 'Legamento talo-calcaneare laterale', [245, 225, 424, 240], True, {'anchor': 'l'}),
       ('t', 'Legamento talo-calcaneare anteriore', [0, 281, 77, 327], True, {'anchor': 'r', 'maxw': 1.0})],
 441: [('t', 'Tibiale anteriore', [257, 28, 382, 48], True),
       ('t', 'Estensore lungo delle dita', [290, 54, 445, 77], True),
       ('t', 'Estensore lungo dell’alluce', [457, 209, 568, 232], True, {'anchor': 'l'}),
       ('t', 'Estensore breve delle dita', [516, 233, 628, 252], True, {'anchor': 'l'}),
       ('t', 'Tendine d’Achille', [16, 400, 140, 419], True),
       ('t', 'Peroneo lungo', [59, 426, 185, 447], True),
       ('t', 'Peroneo breve', [134, 467, 256, 486], True),
       ('t', 'Peroneo terzo', [302, 467, 428, 486], True),
       ('n', 1, [150, 60, 220, 106], False), ('n', 2, [292, 196, 356, 250], False)],
 442: [('t', 'Tibiale anteriore', [368, 56, 487, 74], True),
       ('t', 'Tibiale posteriore', [285, 104, 411, 125], True),
       ('t', 'Flessore lungo delle dita', [215, 160, 348, 179], True),
       ('t', 'Estensore lungo dell’alluce', [188, 178, 299, 198], True),
       ('t', 'Flessore lungo dell’alluce', [343, 378, 501, 399], True),
       ('t', 'Borsa', [537, 396, 583, 413], True),
       ('t', 'Tendine d’Achille', [555, 413, 667, 430], True, {'anchor': 'l'}),
       ('n', 3, [507, 20, 566, 103], False), ('n', 4, [452, 110, 520, 148], False), ('n', 5, [370, 152, 420, 213], False)],
 439: [('t', 'Femore', [70, 9, 124, 29], False),
       ('n', 1, [31, 80, 87, 108], False), ('n', 2, [116, 80, 167, 108], False),
       ('n', 3, [77, 230, 141, 250], False), ('n', 4, [152, 205, 196, 290], False),
       ('n', 5, [177, 300, 199, 443], False), ('n', 6, [87, 365, 151, 420], False),
       ('n', 7, [57, 396, 81, 603], False), ('n', 8, [127, 462, 151, 648], False),
       ('n', 9, [151, 442, 171, 598], False)],
 443: [('t', 'Calcagno', [113, 33, 197, 54], False),
       ('n', 10, [128, 134, 186, 216], False), ('n', 11, [67, 200, 89, 372], False),
       ('n', 12, [128, 262, 202, 360], False), ('n', 13, [209, 200, 236, 382], False),
       ('n', 14, [186, 585, 214, 705], False), ('n', 15, [69, 618, 91, 702], False), ('n', 16, [80, 700, 96, 790], False)],
 444: [('t', 'Calcagno', [116, 48, 202, 72], False), ('t', 'Tuberosità', [120, 86, 222, 116], False),
       ('e', 0, [86, 165, 120, 300], False), ('n', 17, [112, 288, 140, 350], False), ('e', 0, [138, 348, 168, 412], False), ('n', 18, [120, 285, 225, 335], False),
       ('n', 19, [93, 343, 121, 500], False), ('n', 20, [118, 483, 142, 562], False)],
 833: [('t', 'Nervo plantare mediale', [1, 115, 60, 153], True, {'anchor': 'r', 'maxw': 1.0}),
       ('t', 'Nervo plantare laterale', [219, 96, 275, 134], True, {'anchor': 'l', 'maxw': 1.0}),
       ('t', 'Ramo profondo', [255, 261, 305, 293], True, {'anchor': 'l'}),
       ('n', 1, [100, 118, 178, 150], False), ('n', 2, [108, 190, 150, 268], False), ('n', 3, [92, 308, 110, 428], False)],
}

def process(n):
    im = load(n)
    rows = [(r[0], r[1], r[2], r[3], r[4] if len(r) > 4 else {}) for r in PL[n]]
    # passata 1: coperture
    for kind, val, box, white, opt in rows:
        b = [(v + MARGIN) * S for v in box]
        if kind == 't' and not white:
            d = ImageDraw.Draw(im); f, parts = fit_text(d, val, b, opt.get('maxw', 1.25))
            lh = f.size * 1.05; total = lh * len(parts); cx = (b[0] + b[2]) / 2; cy = (b[1] + b[3]) / 2
            tw = max(d.textlength(p, font=f) for p in parts)
            tb = [cx - tw / 2 - 3 * S, cy - total / 2 - 2 * S, cx + tw / 2 + 3 * S, cy + total / 2 + 2 * S]
            erase(im, [min(b[0], tb[0]), min(b[1], tb[1]), max(b[2], tb[2]), max(b[3], tb[3])], False)
        else:
            erase(im, b, white)
    # passata 2: scritte e numeri
    for kind, val, box, white, opt in rows:
        if kind == 't': write_label(im, val, box, white, **opt)
        elif kind == 'n': number_label(im, val, box, white)
    bb = ImageOps.invert(im.convert('RGB')).getbbox(); p = 8 * S
    im = im.crop((max(0, bb[0] - p), max(0, bb[1] - p), min(im.size[0], bb[2] + p), min(im.size[1], bb[3] + p)))
    im.save(os.path.join(HERE, f'it{n}.png'))
    return im

font_ab = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf', 20 * S)
def compose(nums, H, out):
    ims = []
    for n in nums:
        im = process(n); w, h = im.size
        s = H * S / h
        ims.append(im.resize((int(w * s), int(h * s)), Image.LANCZOS))
    gap = 25 * S; W = sum(i.size[0] for i in ims) + gap * (len(ims) + 1); Hc = max(i.size[1] for i in ims) + 35 * S
    sheet = Image.new('RGB', (W, Hc), 'white'); d = ImageDraw.Draw(sheet); x = gap
    for k, im in enumerate(ims):
        y = (Hc - 35 * S - im.size[1]) // 2
        sheet.paste(im, (x, y))
        if len(ims) > 1: d.text((x, Hc - 30 * S), '(' + 'abc'[k] + ')', fill='black', font=font_ab)
        x += im.size[0] + gap
    sheet.save(os.path.join(HERE, out)); print(out, sheet.size)

if __name__ == '__main__':
    compose([290, 291], 185, 'tav1_scheletro.png')
    compose([354, 356], 400, 'tav2_legamenti.png')
    compose([441, 442], 440, 'tav3_tendini.png')
    compose([439, 443, 444], 800, 'tav4_profondo_plantari.png')
    compose([833], 594, 'tav5_nervi.png')
