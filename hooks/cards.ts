// Die Übungskarten als SVG: eigene Farben, damit sie in hellem wie dunklem
// Modus gleich ruhig aussehen, und CSS-Animation, wo sie hilft. Alles, was
// gelesen werden muss, ist auch ohne laufende Animation sichtbar.

export type Palette = { from: string; to: string; accent: string; soft: string }

export const PALETTES = {
  breathe: { from: '#0E1A2F', to: '#1D3B5C', accent: '#7FE3C4', soft: '#CFF7EA' },
  body: { from: '#1B1430', to: '#3A2A5E', accent: '#B9A7FF', soft: '#E6DFFF' },
  note: { from: '#2A1A12', to: '#5A3420', accent: '#FFB38A', soft: '#FFE3D1' },
  senses: { from: '#0F2420', to: '#1F4A3F', accent: '#9BE38B', soft: '#E0F7D8' },
  brain: { from: '#101B33', to: '#2B2F6B', accent: '#8FB8FF', soft: '#E1ECFF' },
  play: { from: '#2B1026', to: '#5C1F4F', accent: '#FF9ACB', soft: '#FFE1F0' },
  mind: { from: '#0F1E2E', to: '#1E4250', accent: '#8EDCE6', soft: '#DDF6F9' },
  puzzle: { from: '#2A2110', to: '#5C4515', accent: '#FFD27A', soft: '#FFF1D1' },
  care: { from: '#2B1420', to: '#5E2A3E', accent: '#FFA8C5', soft: '#FFE3EE' },
  create: { from: '#10261F', to: '#2C5A3A', accent: '#C8F07A', soft: '#F0FBD9' },
  learn: { from: '#0E2233', to: '#1B4A6B', accent: '#7FD3FF', soft: '#DFF4FF' },
  connect: { from: '#2E1214', to: '#6A2A2E', accent: '#FF9E9E', soft: '#FFE2E2' },
  tidy: { from: '#1E1E22', to: '#3D3A33', accent: '#E8D7A8', soft: '#F7F1E1' },
  done: { from: '#10261C', to: '#1E5A3C', accent: '#8EF0B5', soft: '#E3FBEC' },
} satisfies Record<string, Palette>

export type BreathPhase = { label: string; sec: number; scale: number }

const W = 360
const H = 280
const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const esc = (t: string) =>
  t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const r2 = (n: number) => Math.round(n * 100) / 100

/** Bricht einen Satz in Zeilen von höchstens `max` Zeichen. */
export const wrap = (text: string, max: number): string[] => {
  const out: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line === '') line = word
    else if ((line + ' ' + word).length <= max) line += ' ' + word
    else {
      out.push(line)
      line = word
    }
  }
  if (line !== '') out.push(line)
  return out
}

// Gezeichnet wird auf 360×280. Die Karte ist so groß angelegt, dass sie immer die
// volle Breite des Panels füllt: Ziehst du das Panel breiter, wächst sie mit, wird es
// schmaler, schrumpft sie – die Proportionen bleiben gleich.
const SCALE = 5
const frame = (p: Palette, inner: string, style = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.from}"/><stop offset="1" stop-color="${p.to}"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>
<filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<style>
text{font-family:${FONT};}
.drift{animation:drift 14s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-12px)}}
.pulse{animation:pulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:.6}}
.float{animation:float 6s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
${style}
</style>
<rect width="${W}" height="${H}" rx="22" fill="url(#bg)"/>
<circle class="drift" cx="300" cy="50" r="70" fill="${p.accent}" opacity="0.10" filter="url(#blur)"/>
<circle class="drift" cx="50" cy="240" r="60" fill="${p.accent}" opacity="0.08" filter="url(#blur)" style="animation-delay:-7s"/>
${inner}
</svg>`

const label = (p: Palette, text: string) =>
  `<text x="24" y="38" font-size="12" font-weight="600" letter-spacing="2" fill="${p.accent}" opacity="0.9">${esc(text.toUpperCase())}</text>`

const corner = (p: Palette, text: string) =>
  `<text x="${W - 24}" y="38" text-anchor="end" font-size="12" font-weight="600" fill="${p.soft}" opacity="0.55">${esc(text)}</text>`

const lines = (p: Palette, rows: string[], cy: number, size: number, weight = 600) => {
  const gap = size * 1.3
  const top = cy - ((rows.length - 1) * gap) / 2
  return rows
    .map(
      (r, i) =>
        `<text x="${W / 2}" y="${r2(top + i * gap)}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" font-weight="${weight}" fill="${p.soft}">${esc(r)}</text>`,
    )
    .join('')
}

const footer = (p: Palette, text: string) =>
  `<text x="${W / 2}" y="${H - 20}" text-anchor="middle" font-size="12" fill="${p.soft}" opacity="0.6">${esc(text)}</text>`

const dots = (p: Palette, count: number, at: number) => {
  const gap = 16
  const x0 = W / 2 - ((count - 1) * gap) / 2
  return Array.from({ length: count }, (_, i) => {
    const isNow = i === at
    return `<circle cx="${x0 + i * gap}" cy="${H - 30}" r="${isNow ? 5 : 3.5}" fill="${p.accent}" opacity="${i <= at ? 1 : 0.3}"${isNow ? ' class="pulse"' : ''}/>`
  }).join('')
}

/** Eine Leiste, die in `total` Sekunden leer läuft, rein per CSS: die Karte
 * bleibt dabei unverändert und muss nicht jede Sekunde neu gezeichnet werden. */
const timer = (p: Palette, total: number) => {
  const w = 120
  return `<style>.tm{animation:tm ${total}s linear forwards;transform-box:fill-box;transform-origin:left center;}@keyframes tm{from{transform:scaleX(1)}to{transform:scaleX(0)}}</style>
<rect x="${W / 2 - w / 2}" y="${H - 34}" width="${w}" height="4" rx="2" fill="${p.accent}" opacity="0.2"/>
<rect class="tm" x="${W / 2 - w / 2}" y="${H - 34}" width="${w}" height="4" rx="2" fill="${p.accent}"/>`
}

/** Ein Atemmuster als ein CSS-Zyklus: der Kreis (oder das Quadrat) folgt den Phasen. */
export const breatheCard = (
  title: string,
  pattern: BreathPhase[],
  hint: string,
  shape: 'circle' | 'square',
  badge = '',
) => {
  const p = PALETTES.breathe
  const total = pattern.reduce((n, ph) => n + ph.sec, 0)
  const start = pattern[pattern.length - 1].scale
  let t = 0
  const frames = [`0%{transform:scale(${start})}`]
  const labels: string[] = []
  pattern.forEach((ph, i) => {
    const from = (t / total) * 100
    t += ph.sec
    const to = (t / total) * 100
    frames.push(`${r2(to)}%{transform:scale(${ph.scale})}`)
    const a = r2(Math.max(0, from))
    const b = r2(Math.max(a + 0.5, to - 2))
    const steps =
      i === 0
        ? `0%,${b}%{opacity:1}${r2(b + 1)}%,99%{opacity:0}100%{opacity:1}`
        : `0%,${r2(Math.max(0, a - 0.5))}%{opacity:0}${r2(a + 1)}%,${b}%{opacity:1}${r2(Math.min(100, b + 1))}%,100%{opacity:0}`
    labels.push(`@keyframes l${i}{${steps}} .l${i}{animation:l${i} ${total}s linear infinite;}`)
  })
  const style = `
.orb{animation:breathe ${total}s ease-in-out infinite;transform-box:fill-box;transform-origin:center;transform:scale(${start});}
@keyframes breathe{${frames.join('')}}
${labels.join('\n')}`
  const cx = W / 2
  const cy = 146
  const body =
    shape === 'square'
      ? `<rect x="${cx - 100}" y="${cy - 100}" width="200" height="200" rx="40" fill="url(#glow)"/><rect x="${cx - 68}" y="${cy - 68}" width="136" height="136" rx="22" fill="${p.accent}" fill-opacity="0.22" stroke="${p.accent}" stroke-width="2"/>`
      : `<circle cx="${cx}" cy="${cy}" r="100" fill="url(#glow)"/><circle cx="${cx}" cy="${cy}" r="70" fill="${p.accent}" fill-opacity="0.22" stroke="${p.accent}" stroke-width="2"/>`
  const guide =
    shape === 'square'
      ? `<rect x="${cx - 88}" y="${cy - 88}" width="176" height="176" rx="30" fill="none" stroke="${p.accent}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="2 6"/>`
      : `<circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="${p.accent}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="2 6"/>`
  const texts = pattern
    .map(
      (ph, i) =>
        `<text class="l${i}" x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${ph.label.length > 16 ? 16 : 21}" font-weight="600" fill="${p.soft}" opacity="${i === 0 ? 1 : 0}">${esc(ph.label)}</text>`,
    )
    .join('')
  return frame(p, `${label(p, title)}${badge ? corner(p, badge) : ''}${guide}<g class="orb">${body}</g>${texts}${footer(p, hint)}`, style)
}

export const stepCard = (
  p: Palette,
  title: string,
  step: string,
  at: number,
  count: number,
  badge = '',
) =>
  frame(
    p,
    `${label(p, title)}${badge ? corner(p, badge) : ''}<g class="float">${lines(p, wrap(step, 26), 140, 21)}</g>${count > 1 ? dots(p, count, at) : ''}`,
  )

export const promptCard = (p: Palette, title: string, question: string, total = 0, badge = '') => {
  const isLong = question.length > 90
  const rows = wrap(question, isLong ? 32 : 26).slice(0, 6)
  const size = isLong ? 16 : question.length > 60 ? 19 : 22
  return frame(
    p,
    `${label(p, title)}${badge ? corner(p, badge) : ''}${lines(p, rows, 140, size)}${total > 0 ? timer(p, total) : ''}`,
  )
}

/** Ein großes Wort in eigener Farbe (Farbe-oder-Wort). */
export const colorCard = (p: Palette, title: string, word: string, ink: string, sub: string, badge: string) =>
  frame(
    p,
    `${label(p, title)}${corner(p, badge)}
<text x="${W / 2}" y="130" text-anchor="middle" dominant-baseline="middle" font-size="56" font-weight="800" letter-spacing="4" fill="${ink || p.soft}">${esc(word)}</text>
<text x="${W / 2}" y="200" text-anchor="middle" font-size="15" fill="${p.soft}" opacity="0.75">${esc(sub)}</text>`,
  )

/** Ein Symbol der Folge, groß, mit Punkten für die Position. */
export const shapeCard = (p: Palette, title: string, shape: string, color: string, at: number, count: number) =>
  frame(
    p,
    `${label(p, title)}${corner(p, 'Merk dir die Folge')}${shapeSvg(shape, color, W / 2, 130, 44)}${dots(p, count, at)}`,
  )

/** Große Zeichen in der Mitte: Ziffern, ein Rechenschritt, ein Anagramm. */
export const bigCard = (
  p: Palette,
  title: string,
  big: string,
  sub: string,
  total: number,
) => {
  const size = big.length > 9 ? 34 : big.length > 5 ? 44 : 60
  return frame(
    p,
    `${label(p, title)}
<text class="float" x="${W / 2}" y="135" text-anchor="middle" dominant-baseline="middle" font-size="${size}" font-weight="700" letter-spacing="${big.length > 5 ? 4 : 8}" fill="${p.soft}">${esc(big)}</text>
${sub ? `<text x="${W / 2}" y="200" text-anchor="middle" font-size="14" fill="${p.soft}" opacity="0.7">${esc(sub)}</text>` : ''}
${total > 0 ? timer(p, total) : ''}`,
  )
}

/** Die Wörter der Wortkette als ruhige Chips. */
export const wordsCard = (p: Palette, title: string, words: string[], total: number) => {
  const rows = [words.slice(0, 3), words.slice(3)]
  const chips = rows
    .map((row, ri) => {
      const widths = row.map(w => 26 + w.length * 10.5)
      const sum = widths.reduce((a, b) => a + b, 0) + (row.length - 1) * 10
      let x = W / 2 - sum / 2
      return row
        .map((w, i) => {
          const cw = widths[i]
          const y = 92 + ri * 58
          const out = `<rect x="${r2(x)}" y="${y}" width="${r2(cw)}" height="40" rx="20" fill="${p.accent}" fill-opacity="0.16" stroke="${p.accent}" stroke-opacity="0.5"/><text x="${r2(x + cw / 2)}" y="${y + 21}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="600" fill="${p.soft}">${esc(w)}</text>`
          x += cw + 10
          return out
        })
        .join('')
    })
    .join('')
  return frame(p, `${label(p, title)}${corner(p, 'Merk sie dir')}${chips}${timer(p, total)}`)
}

const shapeSvg = (shape: string, color: string, cx: number, cy: number, s: number) => {
  switch (shape) {
    case 'square':
      return `<rect x="${cx - s}" y="${cy - s}" width="${2 * s}" height="${2 * s}" rx="4" fill="${color}"/>`
    case 'triangle':
      return `<path d="M ${cx} ${cy - s * 1.1} L ${cx + s * 1.1} ${cy + s * 0.9} L ${cx - s * 1.1} ${cy + s * 0.9} Z" fill="${color}"/>`
    case 'diamond':
      return `<path d="M ${cx} ${cy - s * 1.2} L ${cx + s * 1.2} ${cy} L ${cx} ${cy + s * 1.2} L ${cx - s * 1.2} ${cy} Z" fill="${color}"/>`
    default:
      return `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${color}"/>`
  }
}

/** Ein 3×3-Raster aus Formen; mit Nummern, wenn gefragt wird. */
export const gridCard = (
  p: Palette,
  title: string,
  cells: string[],
  isNumbered: boolean,
  total: number,
) => {
  const size = 52
  const gap = 8
  const x0 = W / 2 - (3 * size + 2 * gap) / 2
  const y0 = 56
  const out = cells
    .map((c, i) => {
      const [shape, color] = c.split('|')
      const x = x0 + (i % 3) * (size + gap)
      const y = y0 + Math.floor(i / 3) * (size + gap)
      const cell = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="12" fill="#FFFFFF" fill-opacity="0.06" stroke="${p.accent}" stroke-opacity="0.25"/>`
      const num = isNumbered
        ? `<text x="${x + 8}" y="${y + 15}" font-size="11" font-weight="700" fill="${p.soft}" opacity="0.7">${i + 1}</text>`
        : ''
      return cell + shapeSvg(shape, color, x + size / 2, y + size / 2 + 2, 14) + num
    })
    .join('')
  return frame(
    p,
    `${label(p, title)}${corner(p, isNumbered ? 'Welches Feld?' : 'Präg es dir ein')}${out}${timer(p, total)}`,
  )
}

export const resultCard = (p: Palette, title: string, isGood: boolean, headline: string, detail: string) =>
  frame(
    p,
    `${label(p, title)}
<circle cx="${W / 2}" cy="92" r="30" fill="${p.accent}" fill-opacity="0.2" stroke="${p.accent}" stroke-width="2"/>
<text x="${W / 2}" y="94" text-anchor="middle" dominant-baseline="middle" font-size="26" fill="${p.soft}">${isGood ? '✓' : '~'}</text>
${lines(p, [headline], 158, 24, 700)}
${lines(p, wrap(detail, 34).slice(0, 3), 210, 15, 500)}`,
  )

export const doneCard = () => {
  const p = PALETTES.done
  const style = `
.ring{animation:ring 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes ring{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`
  const cx = W / 2
  const inner = `${label(p, 'Geschafft')}
<g class="ring"><circle cx="${cx}" cy="118" r="70" fill="url(#glow)"/><circle cx="${cx}" cy="118" r="42" fill="${p.accent}" fill-opacity="0.2" stroke="${p.accent}" stroke-width="2.5"/></g>
<path d="M ${cx - 17} 118 l 12 12 l 24 -26" fill="none" stroke="${p.soft}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<text x="${cx}" y="210" text-anchor="middle" font-size="22" font-weight="700" fill="${p.soft}">Claude ist fertig</text>
<text x="${cx}" y="238" text-anchor="middle" font-size="13" fill="${p.soft}" opacity="0.7">Ein Atemzug – dann zurück zu deiner Aufgabe.</text>`
  return frame(p, inner, style)
}
