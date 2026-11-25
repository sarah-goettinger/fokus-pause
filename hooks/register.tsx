import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type { Notes, Phase, Prefs, Run, Week } from '../types'
import {
  PALETTES,
  bigCard,
  breatheCard,
  doneCard,
  gridCard,
  colorCard,
  promptCard,
  resultCard,
  shapeCard,
  stepCard,
  wordsCard,
} from './cards'
import {
  EXERCISES,
  GAME,
  LEVEL_NAMES,
  byId,
  durationOf,
  isGame,
  GROUPS,
  groupOf,
  estimateSec,
  isNew,
  isPractice,
  judge,
  levelOf,
  make,
  questionOf,
  SEQ_SHAPES,
  showSecOf,
} from './content'
import type { Cat, Exercise, PickRound } from './content'
import type { Choice } from './pools'
import { beginPick, pickedKeys } from './pools'

const PANE = 'fokus-pause'
// Steht nach dem Laden im Store („loaded“): so lässt sich prüfen, welche Version läuft.
const VERSION = '10.5'
const TITLE = 'Fokus-Pause'
// Erst nach so vielen Sekunden aufgehen, damit kurze Antworten nicht stören.
const OPEN_DELAY_MS = 6000

const NO_NOTES: Notes = { next: '', know: '', grat: '', park: '', connect: '', prompt: '' }
const DEFAULT_PREFS: Prefs = { offGroups: [], off: [], mode: 'balanced', sound: true, rating: true, refocus: true, pad: true }
const NO_WEEK: Week = { week: '', breatheSec: 0, notes: 0, games: 0, waits: 0, care: 0 }

const phase = atom({ plugin: 'fokus-pause', key: 'phase' } as const, 'idle' as Phase)
const isEnabled = atom({ plugin: 'fokus-pause', key: 'isEnabled' } as const, true)
const ask = atom({ plugin: 'fokus-pause', key: 'ask' } as const, '')
const notes = atom({ plugin: 'fokus-pause', key: 'notes' } as const, NO_NOTES)
// Das Tag ändert sich, wenn sich die Felder eines Durchgangs ändern: ein
// Wert, den eine ältere Version gespeichert hat, wird dann verworfen.
const run = atom({ plugin: 'fokus-pause', key: 'run' } as const, null as Run | null, {
  shape: 'run-3',
})
const startedAt = atom({ plugin: 'fokus-pause', key: 'startedAt' } as const, 0)
const tick = atom({ plugin: 'fokus-pause', key: 'tick' } as const, 0)
const seconds = atom({ plugin: 'fokus-pause', key: 'seconds' } as const, 0)
const week = atom({ plugin: 'fokus-pause', key: 'week' } as const, NO_WEEK)
const isLanding = atom({ plugin: 'fokus-pause', key: 'isLanding' } as const, false)
const refocus = atom({ plugin: 'fokus-pause', key: 'refocus' } as const, [] as string[])
const view = atom({ plugin: 'fokus-pause', key: 'view' } as const, 'main' as 'main' | 'settings')
const prefs = atom({ plugin: 'fokus-pause', key: 'prefs' } as const, DEFAULT_PREFS)
const readiness = atom({ plugin: 'fokus-pause', key: 'readiness' } as const, 0)

type $ = EngineInterface

const short = (text: string, max: number) => {
  const one = text.replace(/\s+/g, ' ').trim()
  return one.length > max ? one.slice(0, max - 1) + '…' : one
}

const fmt = (sec: number) =>
  sec < 60 ? `${sec} s` : `${Math.floor(sec / 60)} min ${sec % 60} s`

/** ISO-Kalenderwoche, z. B. "2026-W47". */
const weekOf = (ms: number) => {
  const d = new Date(ms)
  const day = (d.getDay() + 6) % 7
  const thu = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 3)
  const jan4 = new Date(thu.getFullYear(), 0, 4)
  const w =
    1 +
    Math.round(
      ((thu.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7,
    )
  return `${thu.getFullYear()}-W${String(w).padStart(2, '0')}`
}

const weekLine = (w: Week) => {
  const parts: string[] = []
  const min = Math.round(w.breatheSec / 60)
  if (min > 0) parts.push(`${min} Atemminute${min === 1 ? '' : 'n'}`)
  if (w.notes > 0) parts.push(`${w.notes} Notiz${w.notes === 1 ? '' : 'en'}`)
  if (w.games > 0) parts.push(`${w.games} Denkspiel${w.games === 1 ? '' : 'e'}`)
  if (w.care > 0) parts.push(`${w.care} Check-in${w.care === 1 ? '' : 's'}`)
  if (w.waits > 0) parts.push(`${w.waits} Pause${w.waits === 1 ? '' : 'n'}`)
  return parts.length === 0 ? '' : `Diese Woche: ${parts.join(' · ')}`
}

const asNumberMap = (v: unknown): Record<string, number> =>
  v !== null && typeof v === 'object' ? { ...(v as Record<string, number>) } : {}

const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

/** Teilt eine Liste in Reihen zu je `n`. */
const rowsOf = <T,>(list: readonly T[], n: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n))
  return out
}

/** Zieht ein Element, jedes so wahrscheinlich wie sein Gewicht. */
const weighted = <T,>(list: T[], weightOf: (x: T) => number): T => {
  const ws = list.map(weightOf)
  let r = Math.random() * ws.reduce((a, b) => a + b, 0)
  for (let i = 0; i < list.length; i++) {
    r -= ws[i]
    if (r <= 0) return list[i]
  }
  return list[list.length - 1]
}

// Was das Modul sich zwischen den Ereignissen merkt. Bei einem Neuladen
// beginnt es von vorn; alles Bleibende steht in $.state und $.store.
let ticker: Timer | undefined
let isOpen = false
// Wer das Panel während einer Wartezeit schließt, bekommt es erst
// bei der nächsten Aufgabe wieder.
let isDismissed = false
// Wie viele Übungen in dieser Wartezeit schon kamen: die erste ist kurz.
let slot = 0
// Atemsekunden, die noch nicht in die Wochenstatistik geschrieben sind.
let breathed = 0
// Ein Takt, der noch läuft, wird nicht doppelt gestartet.
let isStepping = false
// Reizbalance: wie viele anregende Übungen (Spiele, Rätsel) diese Pause schon hatte.
let stimulating = 0
// Die echte Pause kommt höchstens einmal pro Wartezeit.
let isBreakShown = false
// Atempause zwischen zwei Übungen: bis wann (ms).
let breathUntil = 0
// Die zuletzt gestartete Übung (auch während der Atempause bekannt).
let lastStartedId: string | undefined
const BREATH_MS = 5000

/** Was advance() sonst am Ende einer Übung tut: Stufen, Überspringen-Zähler. */
const rememberDone = async ($: $, done: Run) => {
  const skips = asNumberMap(await $.store.get('skips'))
  skips[done.id] = Math.max(0, (skips[done.id] ?? 0) - 0.5)
  await $.store.set('skips', skips)
  const ex = byId(done.id)
  if (isPractice(ex)) {
    const practice = asNumberMap(await $.store.get('practice'))
    const count = (practice[ex.id] ?? 0) + 1
    practice[ex.id] = count
    await $.store.set('practice', practice)
    const up = levelOf(count)
    if (up > done.level) $.ui.toast(`🌱 ${ex.title}: Stufe ${up} „${LEVEL_NAMES[up]}“ erreicht`)
  }
}

// Wie breit das Panel zuletzt gezeichnet wurde (Spalten), zur Fehlersuche.
let lastColumns = 0
// Die Rückkehr-Karte kam schon vor dem Ende, weil es absehbar Richtung Ende ging.
let isEarlyLanding = false
// Welche Übungen diese Pause zeigte: für die Bereitschafts-Frage am Ende.
let shown: string[] = []

const loadPrefs = async ($: $): Promise<Prefs> => {
  const raw = (await $.store.get('prefs')) as Partial<Prefs> | undefined
  return { ...DEFAULT_PREFS, ...(raw ?? {}) }
}

/** Ändert eine Einstellung, merkt sie sich dauerhaft und zeichnet neu. */
const setPrefs = async ($: $, change: (p: Prefs) => Prefs) => {
  const next = change(await loadPrefs($))
  await $.store.set('prefs', next)
  await update($, prefs, () => next)
}

const toggleGroup = async ($: $, id: string) => {
  await setPrefs($, p => {
    const was = p.offGroups ?? []
    const offGroups = was.includes(id) ? was.filter(g => g !== id) : [...was, id]
    // Mindestens eine Gruppe bleibt an.
    return offGroups.length >= GROUPS.length ? p : { ...p, offGroups }
  })
}

const setView = async ($: $, v: 'main' | 'settings') => {
  await update($, view, () => v)
}

/** Wie lange Claudes Antworten bei dir typischerweise dauern (Median der letzten 20), in Sekunden. */
const typicalWait = async ($: $): Promise<number | undefined> => {
  const list = ((await $.store.get('durations')) as number[] | undefined) ?? []
  if (list.length < 3) return undefined
  const sorted = [...list].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

/** Notizblock: den nächsten Prompt festhalten. */
const savePad = async ($: $, text: string) => {
  const t = text.trim().slice(0, 2000)
  await update($, notes, n => ({ ...n, prompt: t }))
}

/** Nächsten Prompt merken und direkt ins Chatfeld schreiben: ein Klick. */
const padToChat = async ($: $, text: string) => {
  const t = text.trim()
  if (t === '') return
  await savePad($, t)
  await fillPrompt($)
}

/** Den notierten Prompt in die Chat-Eingabe übernehmen. */
const fillPrompt = async ($: $) => {
  const t = (await read($, notes)).prompt ?? ''
  if (t === '') return
  const r = await $.prompt.fill({ text: t, mode: 'replace' })
  $.ui.toast(r.isFilled ? 'In die Chat-Eingabe übernommen ✓' : 'Ging gerade nicht – kopier ihn einfach.')
}

const copyPrompt = async ($: $, surface?: string) => {
  const t = (await read($, notes)).prompt ?? ''
  if (t === '') return
  const r = await $.ui.copy(surface === undefined ? { text: t } : ({ text: t, surface } as never))
  $.ui.toast(r.isCopied ? 'Kopiert ✓' : 'Kopieren ging hier nicht – nutz „In die Chat-Eingabe“.')
}

/** Bereitschafts-Frage am Ende: lernt, welche Übungen dich gut zurückbringen. */
const rateReadiness = async ($: $, score: number) => {
  const ratings = ((await $.store.get('ratings')) as Record<string, { sum: number; n: number }> | undefined) ?? {}
  for (const id of shown) {
    const r = ratings[id] ?? { sum: 0, n: 0 }
    ratings[id] = { sum: r.sum + score, n: r.n + 1 }
  }
  await $.store.set('ratings', ratings)
  await update($, readiness, () => 2)
}

// --- Wochenstatistik (bleibt über Sitzungen) ----------------------------

const bump = async ($: $, field: Exclude<keyof Week, 'week'>, n: number) => {
  if (n <= 0) return
  const now = weekOf(await $.clock.now())
  const raw = (await $.store.get('week')) as Week | undefined
  const w: Week = raw && raw.week === now ? { ...NO_WEEK, ...raw } : { ...NO_WEEK, week: now }
  w[field] += n
  await $.store.set('week', w)
  await update($, week, () => w)
}

const flushBreath = async ($: $) => {
  const n = breathed
  breathed = 0
  await bump($, 'breatheSec', n)
}

// --- Auswahl der nächsten Übung ----------------------------------------

const choose = async ($: $): Promise<Exercise> => {
  const written = await read($, notes)
  const recent = asStrings(await $.store.get('recent'))
  const skips = asNumberMap(await $.store.get('skips'))
  const groupSeen = asNumberMap(await $.store.get('groupSeen'))
  const catSeen = asNumberMap(await $.store.get('catSeen'))
  const now = await $.clock.now()
  const last = (await read($, run))?.id ?? lastStartedId
  const pref = await loadPrefs($)
  const off = pref.offGroups ?? []
  const elapsed = (now - (await read($, startedAt))) / 1000
  const today = await todayCounts($)

  // Lange Wartezeit: einmal eine echte Pause vorschlagen (nur mit Ton, damit du nicht nachsehen musst).
  if (elapsed >= 180 && !isBreakShown && pref.sound && !off.includes('mind')) {
    isBreakShown = true
    return byId('realbreak')
  }
  // Den nächsten Schritt fragen wir in längeren Pausen einmal, als dritte Übung.
  if (slot === 2 && written.next === '' && !off.includes('create') && (today.next ?? 0) < 1) return byId('next')

  let pool = EXERCISES.filter(
    ex => ex.isSpecial !== true && !(ex.kind === 'note' && (written[ex.key] ?? '') !== ''),
  )
  // Was du ausgeschaltet hast, kommt nicht.
  const allowed = pool.filter(ex => !off.includes(groupOf(ex.cat)))
  if (allowed.length > 0) pool = allowed
  // Wohlbefinden-Fragen nicht zu oft: jede hat ihre eigene Wartezeit.
  const careSeen = asNumberMap(await $.store.get('careSeen'))
  pool = pool.filter(
    ex => ex.kind !== 'choice' || now - (careSeen[ex.id] ?? 0) >= ex.cooldownMin * 60000,
  )
  // Passend zur Wartezeit: lieber etwas, das noch fertig wird.
  const typical = await typicalWait($)
  if (typical !== undefined && slot > 0) {
    const left = Math.max(25, typical - elapsed + 15)
    const fits = pool.filter(ex => estimateSec(ex) <= left)
    if (fits.length > 0) pool = fits
  }

  // Gegen Wiederholung: nichts von den letzten 25 Übungen, und jede Übung
  // höchstens zweimal am Tag (Atemübungen dreimal). Erst wenn gar nichts
  // mehr übrig ist, wird gelockert.
  // Rätsel, Wissen und Kreatives höchstens einmal am Tag; Achtsamkeit & Körper
  // (Atmen, Bewegen, Check-ins, Pausen) zweimal, Atemübungen dreimal. Ist eine
  // Gruppe für heute durch, kommen eben die anderen dran. Erst wenn alles durch
  // ist, wird wiederholt – und dann zuerst Achtsamkeit.
  const isMindful = (ex: Exercise) => groupOf(ex.cat) === 'mind'
  const limit = (ex: Exercise) => (ex.kind === 'breathe' ? 3 : isMindful(ex) ? 2 : 1)
  const fresh = pool.filter(ex => !recent.includes(ex.id) && (today[ex.id] ?? 0) < limit(ex))
  const underLimit = pool.filter(ex => (today[ex.id] ?? 0) < limit(ex))
  const mindful = pool.filter(isMindful)
  pool = fresh.length > 0 ? fresh : underLimit.length > 0 ? underLimit : mindful.length > 0 ? mindful : pool

  // Gruppe wählen: alle Gruppen gleich gern, zu jeder Tageszeit. Je länger eine
  // nicht dran war, desto wahrscheinlicher; nie zweimal dieselbe hintereinander.
  const lastGroup = last === undefined ? undefined : groupOf(byId(last).cat)
  let groups = [...new Set(pool.map(ex => groupOf(ex.cat)))]
  if (groups.length > 1) groups = groups.filter(g => g !== lastGroup)
  const groupScore = (g: string) => {
    const since = groupSeen[g] === undefined ? 60 : Math.min(60, (now - groupSeen[g]) / 60000)
    const fresh = EXERCISES.some(ex => groupOf(ex.cat) === g && isNew(ex, now)) ? 1.3 : 1
    return (1 + since / 3) * fresh
  }
  const group = groups.length === 0 ? undefined : weighted(groups, groupScore)
  if (group !== undefined) {
    pool = pool.filter(ex => groupOf(ex.cat) === group)
    groupSeen[group] = now
    await $.store.set('groupSeen', groupSeen)
  }
  // Die erste Übung einer Pause ist möglichst kurz.
  if (slot === 0) {
    const short = pool.filter(ex => ex.isShort === true)
    if (short.length > 0) pool = short
  }
  // Innerhalb der Gruppe die Unterfamilien reihum (z. B. Rätsel, Wortspiel, Gedächtnis).
  const cats = [...new Set(pool.map(ex => ex.cat))]
  if (cats.length > 1) {
    const catScore = (c: Cat) => 1 + Math.min(120, catSeen[c] === undefined ? 120 : (now - catSeen[c]) / 60000) / 10
    const cat = weighted(cats, catScore)
    pool = pool.filter(ex => ex.cat === cat)
    catSeen[cat] = now
    await $.store.set('catSeen', catSeen)
  }

  // Was oft übersprungen wird, kommt seltener – aber nie gar nicht mehr.
  // Was dich laut Bereitschafts-Frage gut zurückbringt, kommt etwas öfter.
  const ratings = ((await $.store.get('ratings')) as Record<string, { sum: number; n: number }> | undefined) ?? {}
  const ratingFactor = (id: string) => {
    const r = ratings[id]
    return r === undefined || r.n < 2 ? 1 : Math.max(0.6, Math.min(1.5, 1 + (r.sum / r.n - 3) * 0.2))
  }
  return weighted(
    pool,
    ex => ((isNew(ex, now) ? 3 : 1) * ratingFactor(ex.id)) / (1 + Math.min(6, skips[ex.id] ?? 0)),
  )
}

/** Wie oft jede Übung heute schon kam (setzt sich jeden Tag zurück). */
const todayCounts = async ($: $): Promise<Record<string, number>> => {
  const day = new Date(await $.clock.now()).toDateString()
  const held = (await $.store.get('today')) as { day?: string; counts?: Record<string, number> } | undefined
  return held?.day === day ? { ...(held.counts ?? {}) } : {}
}

const countToday = async ($: $, id: string) => {
  const day = new Date(await $.clock.now()).toDateString()
  const counts = await todayCounts($)
  counts[id] = (counts[id] ?? 0) + 1
  await $.store.set('today', { day, counts })
}

const start = async ($: $, ex: Exercise) => {
  const digits = Number((await $.store.get('digits')) ?? 4) || 4
  const seqLen = Number((await $.store.get('seq')) ?? 4) || 4
  // Rätsel, Fakten & Co.: Ungesehenes zuerst. Achtsamkeit und Check-ins dürfen sich wiederholen.
  const seenContent = (await $.store.get('seenContent')) as Record<string, string[]> | undefined
  beginPick(seenContent?.[ex.id] ?? [])
  const made = make(ex, digits, seqLen)
  const keys = pickedKeys()
  if (keys.length > 0) {
    const all = { ...(seenContent ?? {}) }
    all[ex.id] = [...keys, ...(all[ex.id] ?? []).filter(k => !keys.includes(k))].slice(0, 300)
    await $.store.set('seenContent', all)
  }
  const practice = asNumberMap(await $.store.get('practice'))
  const level = levelOf(practice[ex.id] ?? 0)
  const breath = ex.kind === 'breathe' ? ex.breath(level) : undefined
  const first: Run['stage'] = ex.kind === 'choice' || ex.kind === 'write' || ex.kind === 'task'
    ? 'ask'
    : !isGame(ex)
    ? 'plain'
    : showSecOf(ex, made) > 0
      ? 'show'
      : 'ask'
  const next: Run = {
    id: ex.id,
    stage: first,
    stageAt: 0,
    data: made.data,
    solution: made.solution,
    steps: ex.kind === 'steps' ? ex.steps(level) : [],
    pattern: breath?.pattern ?? [],
    rounds: breath?.rounds ?? 0,
    hint: breath?.hint ?? '',
    cue: breath?.cue ?? '',
    level,
    headline: '',
    detail: '',
    isGood: false,
    picks: [],
    key: (await $.clock.now()) % 1000000,
  }
  if (ex.kind === 'choice') {
    const careSeen = asNumberMap(await $.store.get('careSeen'))
    careSeen[ex.id] = await $.clock.now()
    await $.store.set('careSeen', careSeen)
  }
  await update($, seconds, () => 0)
  await update($, run, () => next)
  slot += 1
  lastStartedId = ex.id
  if (!ex.isSpecial) shown = [...shown.filter(id => id !== ex.id), ex.id]
  const recent = asStrings(await $.store.get('recent')).filter(id => id !== ex.id)
  await $.store.set('recent', [ex.id, ...recent].slice(0, 25))
  await countToday($, ex.id)
}

/** Zur nächsten Übung. `isSkip`: die Person hat weitergeklickt. */
const advance = async ($: $, isSkip: boolean) => {
  const now = await read($, run)
  if (now !== null) {
    const skips = asNumberMap(await $.store.get('skips'))
    const was = skips[now.id] ?? 0
    skips[now.id] = isSkip ? was + 1 : Math.max(0, was - 0.5)
    await $.store.set('skips', skips)

    const ex = byId(now.id)
    if (!isSkip && isPractice(ex)) {
      const practice = asNumberMap(await $.store.get('practice'))
      const count = (practice[ex.id] ?? 0) + 1
      practice[ex.id] = count
      await $.store.set('practice', practice)
      const up = levelOf(count)
      if (up > now.level) {
        $.ui.toast(`🌱 ${ex.title}: Stufe ${up} „${LEVEL_NAMES[up]}“ erreicht`)
      }
    }
  }
  await flushBreath($)
  await start($, await choose($))
}

/** Wertet eine Antwort aus und zeigt das Ergebnis. */
const answer = async ($: $, value: string) => {
  const now = await read($, run)
  if (now === null || now.stage !== 'ask') return
  const ex = byId(now.id)
  const v = judge(ex, now, value)
  if (ex.kind === 'digits') {
    const level = Number((await $.store.get('digits')) ?? 4) || 4
    await $.store.set('digits', v.isGood ? Math.min(9, level + 1) : Math.max(3, level - 1))
  }
  const sec = await read($, seconds)
  await update($, run, r =>
    r === null
      ? r
      : { ...r, stage: 'result' as const, stageAt: sec, headline: v.headline, detail: v.detail, isGood: v.isGood },
  )
  await bump($, 'games', 1)
}

/** Eine Runde mit Antwort-Knöpfen beantworten (Farbe-oder-Wort, Was passt nicht?). */
const pressPick = async ($: $, value: string) => {
  const now = await read($, run)
  if (now === null || now.stage !== 'ask') return
  const rounds = now.data.map(d => JSON.parse(d) as PickRound)
  const picks = [...now.picks, value]
  if (picks.length < rounds.length) {
    await update($, run, r => (r === null ? r : { ...r, picks }))
    return
  }
  const right = rounds.filter((round, i) => picks[i] === round.answer).length
  const detail = now.id === 'odd' ? rounds.map(round => round.why).join(' · ') : (rounds[0]?.why ?? '')
  const sec = await read($, seconds)
  await update($, run, r =>
    r === null
      ? r
      : {
          ...r,
          picks,
          stage: 'result' as const,
          stageAt: sec,
          headline: `${right} von ${rounds.length} richtig`,
          detail,
          isGood: right === rounds.length,
        },
  )
  await bump($, 'games', 1)
}

const seqLabel = (id: string) => SEQ_SHAPES.find(x => x.id === id)?.label ?? id

/** Ein Symbol der Folge antippen; ein Fehler beendet die Runde. */
const pressSeq = async ($: $, id: string) => {
  const now = await read($, run)
  if (now === null || now.stage !== 'ask') return
  const picks = [...now.picks, id]
  const at = picks.length - 1
  const isWrong = picks[at] !== now.data[at]
  const isDone = picks.length >= now.data.length
  if (!isWrong && !isDone) {
    await update($, run, r => (r === null ? r : { ...r, picks }))
    return
  }
  const n = now.data.length
  await $.store.set('seq', isWrong ? Math.max(3, n - 1) : Math.min(8, n + 1))
  const sec = await read($, seconds)
  await update($, run, r =>
    r === null
      ? r
      : {
          ...r,
          picks,
          stage: 'result' as const,
          stageAt: sec,
          headline: isWrong ? `${at} von ${n} – fast!` : `Alle ${n} richtig!`,
          detail: isWrong ? `Die Folge war: ${now.data.map(seqLabel).join(' → ')}` : `Nächstes Mal ${Math.min(8, n + 1)} Symbole.`,
          isGood: !isWrong,
        },
  )
  await bump($, 'games', 1)
}

/** Die Frage, bei der eine Wohlbefinden-Übung gerade steht. */
const nodeOf = (flow: Choice, picks: string[]): Choice => {
  let node = flow
  for (const p of picks) {
    const next = node.options[Number(p)]?.next
    if (next === undefined) break
    node = next
  }
  return node
}

/** Eine Antwort auf eine Wohlbefinden-Frage: weiter zur nächsten oder antworten. */
const pressChoice = async ($: $, index: number) => {
  const now = await read($, run)
  if (now === null || now.stage !== 'ask') return
  const ex = byId(now.id)
  if (ex.kind !== 'choice') return
  const node = nodeOf(ex.flow, now.picks)
  const option = node.options[index]
  if (option === undefined) return
  const picks = [...now.picks, String(index)]
  if (option.next !== undefined) {
    await update($, run, r => (r === null ? r : { ...r, picks }))
    return
  }
  // Was die Antworten unterwegs sagten, und dann die Antwort selbst.
  const says: string[] = []
  let at = ex.flow
  for (const p of now.picks) {
    const o = at.options[Number(p)]
    if (o?.say) says.push(o.say)
    if (o?.next) at = o.next
  }
  if (option.say) says.push(option.say)
  const sec = await read($, seconds)
  await update($, run, r =>
    r === null
      ? r
      : {
          ...r,
          picks,
          stage: 'result' as const,
          stageAt: sec,
          headline: option.label,
          detail: [...says, option.reply ?? ''].filter(Boolean).join(' '),
          isGood: true,
        },
  )
  await bump($, 'care', 1)
}

/** Eine Schreibaufgabe abgeben: freundliche Antwort, bei „Verbindung“ als Erinnerung merken. */
const submitWrite = async ($: $, value: string) => {
  const now = await read($, run)
  if (now === null || now.stage !== 'ask') return
  const text = short(value, 200)
  if (text === '') return
  const ex = byId(now.id)
  const check = now.data[2] ?? ''
  let headline = `„${text}“`
  let detail = now.data[1] ?? ''
  if (check === 'six') {
    const n = text.split(/\s+/).filter(Boolean).length
    detail = n === 6 ? `Genau 6 Wörter ✓ ${detail}` : `${n} Wörter – fast! Sechs ist die Kunst. ${detail}`
  } else if (check === 'acrostic') {
    const word = now.data[3] ?? ''
    const initials = text.split(/\s+/).filter(Boolean).map(w => w[0]?.toUpperCase() ?? '').join('')
    detail = initials === word ? `${word} ✓ ${detail}` : `Fast: ${initials} statt ${word}. Trotzdem schön!`
  }
  if (ex.cat === 'connect') await update($, notes, n => ({ ...n, connect: text }))
  const sec = await read($, seconds)
  await update($, run, r =>
    r === null ? r : { ...r, stage: 'result' as const, stageAt: sec, headline, detail, isGood: true },
  )
  await bump($, 'notes', 1)
}

/** Mini-Ordnung: erledigt oder später. */
const pressTask = async ($: $, isDone: boolean) => {
  const now = await read($, run)
  if (now === null || now.stage !== 'ask') return
  const sec = await read($, seconds)
  await update($, run, r =>
    r === null
      ? r
      : {
          ...r,
          stage: 'result' as const,
          stageAt: sec,
          headline: isDone ? '✓ Erledigt' : 'Später',
          detail: isDone
            ? 'Schön! Kleine Ordnung, freier Kopf.'
            : 'Völlig okay. Vielleicht ja nach der Antwort.',
          isGood: isDone,
        },
  )
  if (isDone) await bump($, 'care', 1)
}

const REFOCUS_GENERIC = [
  'Woran wirst du merken, dass die Antwort gut ist?',
  'Was ist dein erster Schritt, sobald du die Antwort liest?',
  'Was erwartest du – was wird in der Antwort stehen?',
  'Worauf willst du beim Lesen besonders achten?',
  'Was davon willst du heute noch umsetzen?',
]

/** Zwei Fragen, die zum Auftrag zurückführen: erst allgemeine, dann passende vom Modell. */
const prepareRefocus = async ($: $, request: string) => {
  // Erst eine schlichte Kurzfassung, dann (wenn möglich) eine bessere vom Modell.
  const plain = short(request, 140)
  await update($, refocus, () => (plain === '' ? [] : [plain]))
  if (request.trim().length < 40) return
  try {
    const r = await $.model.complete({
      model: 'claude-haiku-5-5',
      maxTokens: 80,
      timeoutMs: 25000,
      system:
        'Fasse den Auftrag einer Person an einen KI-Assistenten in einem einzigen kurzen Satz auf Deutsch zusammen, höchstens 15 Wörter, ohne Einleitung, ohne Anführungszeichen. Beginne mit einem Verb oder Substantiv, nicht mit „Du“.',
      prompt: `<auftrag>\n${request.slice(0, 2000)}\n</auftrag>`,
    })
    if (!r.isAnswered) return
    const line = r.text.split('\n').map(l => l.trim()).find(l => l.length > 5) ?? ''
    if (line.length > 5 && line.length < 200) await update($, refocus, () => [line.replace(/^[„"]|[“"]$/g, '')])
  } catch {
    // Dann bleibt die schlichte Kurzfassung.
  }
}

/** Öffnet das Panel und merkt sich, was dabei herauskam (zur Fehlersuche). */
const openPane = async ($: $) => {
  try {
    const opened = await $.ui.open({ id: PANE, title: TITLE, rows: 40, columns: 90 })
    await $.store.set('lastOpen', { at: await $.clock.now(), isPlaced: opened.isPlaced, reason: opened.isPlaced ? '' : opened.reason })
    if (!opened.isPlaced) $.ui.log(`fokus-pause: ${opened.reason}`)
  } catch (err) {
    await $.store.set('lastOpen', { at: await $.clock.now(), isPlaced: false, reason: String(err).slice(0, 300) })
  }
}

const close = async ($: $) => {
  await $.ui.close({ id: PANE })
}

/**
 * Nach einer fertigen Übung: Geht es absehbar Richtung Ende (nach deiner
 * typischen Wartezeit), keine neue Übung mehr, sondern schon die Rückkehr-Karte.
 */
const afterExercise = async ($: $, elapsed: number, typical: number | undefined) => {
  // Die Rückkehr-Karte kommt nur noch beim echten Signal (Claude beginnt die
  // Schlussantwort). Damit kurz davor keine neue Übung aufblitzt, liegt zwischen
  // zwei Übungen eine kurze Atempause; kommt das Ende genau dann, geht es direkt
  // zur Rückkehr-Karte.
  void elapsed
  void typical
  await flushBreath($)
  const now = await read($, run)
  if (now !== null) await rememberDone($, now)
  await update($, run, () => null)
  breathUntil = (await $.clock.now()) + BREATH_MS
}

// --- Der Takt: einmal pro Sekunde --------------------------------------

const step = async ($: $) => {
  if ((await read($, phase)) !== 'working') return
  if (!isOpen) {
    if (isDismissed) return
    const waited = (await $.clock.now()) - (await read($, startedAt))
    if (waited < OPEN_DELAY_MS) return
    isOpen = true
    if (slot === 0) await start($, await choose($))
    await bump($, 'waits', 1)
    await openPane($)
    return
  }

  // Alle paar Sekunden nachsehen, ob das Fenster wirklich noch da ist (z. B. nach
  // einem Neuladen der App). Fehlt es, öffnet es sich von selbst wieder.
  if (Number(await read($, tick)) % 4 === 0) {
    const mine = (await $.ui.panes()).find(x => x.id === PANE)
    await $.store.set('paneCheck', { at: await $.clock.now(), listed: mine !== undefined, shown: mine?.isShown ?? false, placed: mine?.isPlaced ?? false, columns: lastColumns })
    if (mine === undefined && !isDismissed) await openPane($)
  }

  await update($, tick, n => n + 1)
  const elapsed = ((await $.clock.now()) - (await read($, startedAt))) / 1000
  const typical = await typicalWait($)
  if (await read($, isLanding)) {
    return
  }
  const now = await read($, run)
  if (now === null) {
    // Die ersten Sekunden: Ankommen. Zwischen zwei Übungen: kurze Atempause.
    if (elapsed * 1000 < OPEN_DELAY_MS) return
    if ((await $.clock.now()) < breathUntil) return
    const isFirst = slot === 0
    await start($, await choose($))
    if (isFirst) await bump($, 'waits', 1)
    return
  }
  const ex = byId(now.id)
  const sec = (await read($, seconds)) + 1
  await update($, seconds, () => sec)
  if (ex.kind === 'breathe') breathed += 1

  // Übungen zum Eintippen oder Antippen warten, bis du antwortest oder
  // „Andere Übung“ klickst. Weiter geht es von selbst nur nach dem Ergebnis.
  if (ex.kind === 'write' || ex.kind === 'task') {
    if (now.stage === 'result' && sec - now.stageAt >= 8) await afterExercise($, elapsed, typical)
    return
  }
  if (ex.kind === 'choice') {
    if (now.stage === 'result' && sec - now.stageAt >= GAME.choiceResult) await afterExercise($, elapsed, typical)
    return
  }
  if (ex.kind === 'note') return
  if (isGame(ex)) {
    if (now.stage === 'show' && sec >= showSecOf(ex, now)) {
      await update($, run, r => (r === null ? r : { ...r, stage: 'ask' as const, stageAt: sec }))
    } else if (
      now.stage === 'result' &&
      sec - now.stageAt >= (ex.kind === 'quiz' || ex.kind === 'pick' ? GAME.result + 3 : GAME.result)
    ) {
      await afterExercise($, elapsed, typical)
    }
    return
  }
  if (sec >= durationOf(ex, now)) await afterExercise($, elapsed, typical)
}


export const register: Register = on => {
  // --- Ereignisse ---------------------------------------------------------

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'fokus',
      description: 'Fokus-Pause an/aus · woche · info',
      argumentHint: '[woche|info]',
    })
    isOpen = (await $.ui.panes()).some(p => p.id === PANE)
    const loadedPrefs = await loadPrefs($)
    await update($, prefs, () => loadedPrefs)
    const enabled = await $.store.get('enabled')
    if (typeof enabled === 'boolean') await update($, isEnabled, () => enabled)
    const w = (await $.store.get('week')) as Week | undefined
    if (w && w.week === weekOf(await $.clock.now())) await update($, week, () => ({ ...NO_WEEK, ...w }))

    await $.store.set('loaded', { version: VERSION, exercises: EXERCISES.length, at: await $.clock.now() })

    // Ein Takt pro Sitzung. Er tut nichts, solange Claude nicht arbeitet.
    ticker?.cancel()
    ticker = $.clock.every(1000, () => {
      if (isStepping) return
      isStepping = true
      void step($).finally(() => {
        isStepping = false
      })
    })

    return next(e)
  })

  on('command.run', { command: 'fokus' }, async ($, e) => {
    if (e.args.trim().toLowerCase().startsWith('info')) {
      return {
        text: `Fokus-Pause Version ${VERSION}: ${EXERCISES.filter(x => x.isSpecial !== true).length} Übungen in ${GROUPS.length} Gruppen.`,
      }
    }
    if (e.args.trim().toLowerCase().startsWith('woche')) {
      const raw = (await $.store.get('week')) as Week | undefined
      const now = weekOf(await $.clock.now())
      const w = raw && raw.week === now ? { ...NO_WEEK, ...raw } : { ...NO_WEEK, week: now }
      const line = weekLine(w)
      return {
        text:
          line === ''
            ? 'Diese Woche gab es noch keine Fokus-Pause. Sie kommt beim nächsten längeren Auftrag.'
            : `${line}. Schön, dass du dir die Pausen nimmst.`,
      }
    }

    const now = !(await read($, isEnabled))
    await update($, isEnabled, () => now)
    await $.store.set('enabled', now)
    if (!now) {
      await update($, phase, () => 'idle' as Phase)
      if (isOpen) await close($)
      isOpen = false
    }
    return {
      text: now
        ? 'Fokus-Pause ist an: Bei längeren Antworten geht neben dem Chat eine kurze Übung auf.'
        : 'Fokus-Pause ist aus. Mit /fokus schaltest du sie wieder an.',
    }
  })

  // Öffnet das Panel in dem Moment, in dem du einen Prompt abschickst. Die App
  // zeigt so ein „erbetenes“ Fenster immer an; eines, das ein Timer später von
  // selbst öffnet, nur bei sehr breitem Fenster.
  on('prompt.submit', async ($, e, next) => {
    try {
      if (e.command === undefined && e.isMeta !== true && (await read($, isEnabled))) {
        isOpen = true
        void $.ui
          .open({ id: PANE, title: TITLE, rows: 40, columns: 90 })
          .then(async opened => {
            await $.store.set('lastOpen', {
              at: await $.clock.now(),
              via: 'prompt',
              isPlaced: opened.isPlaced,
              reason: opened.isPlaced ? '' : opened.reason,
            })
          })
          .catch(() => undefined)
      }
    } catch {
      // Das Abschicken des Prompts darf nie daran hängen.
    }
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined || !(await read($, isEnabled))) return next(e)
    if ((await read($, phase)) === 'working') return next(e)

    isDismissed = false
    slot = 0
    breathed = 0
    stimulating = 0
    isBreakShown = false
    isEarlyLanding = false
    breathUntil = 0
    shown = []
    await update($, readiness, () => 0)
    if (e.text.trim() !== '') await update($, ask, () => short(e.text, 220))
    const t = await $.clock.now()
    await update($, startedAt, () => t)
    await update($, notes, () => NO_NOTES)
    await update($, run, () => null)
    await update($, seconds, () => 0)
    await update($, isLanding, () => false)
    await update($, phase, () => 'working' as Phase)
    if ((await loadPrefs($)).refocus) void prepareRefocus($, e.text)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    if ((await read($, phase)) !== 'working') return next(e)

    await flushBreath($)
    if (!e.isAborted && e.durationMs > 10000) {
      const list = ((await $.store.get('durations')) as number[] | undefined) ?? []
      await $.store.set('durations', [Math.round(e.durationMs / 1000), ...list].slice(0, 20))
    }
    if (!isOpen || e.isAborted || slot === 0) {
      // Schnelle Antwort (noch keine Übung) oder abgebrochen: ruhig bleiben.
      await update($, phase, () => 'idle' as Phase)
      return next(e)
    }
    const pref = await loadPrefs($)
    if (pref.sound) {
      // Ein sanfter Zweiklang: du musst nicht nachsehen, ob Claude fertig ist.
      void $.audio.play({ asset: 'sounds/chime.wav' }, { gain: 0.6 }).catch(() => undefined)
    }
    const count = Number((await $.store.get('doneCount')) ?? 0) + 1
    await $.store.set('doneCount', count)
    await update($, readiness, () => (pref.rating && shown.length > 0 && count % 3 === 0 ? 1 : 0))
    await update($, view, () => 'main' as const)
    await update($, phase, () => 'done' as Phase)
    void $.ui.open({ id: PANE, title: 'Claude ist fertig', rows: 40, columns: 90 }).catch(() => undefined)
    $.ui.toast('Claude ist fertig – zurück zu deiner Aufgabe.')
    return next(e)
  })

  // In der Claude-App ruft Claude kurz vor der Schlussantwort das Werkzeug
  // für die Zusammenfassung auf: das Zeichen, gleich zur Aufgabe zurückzukehren.
  on('tool.call', async ($, e, next) => {
    try {
      if (e.tool.endsWith('wrap_up') && (await read($, phase)) === 'working') {
        isEarlyLanding = false
        await update($, isLanding, () => true)
      }
    } catch {
      // nur ein Hinweis fürs Panel; das Werkzeug läuft in jedem Fall
    }
    return next(e)
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) {
      // Merkt sich nur, dass zu ist; ein Fehler hier darf das Schließen nie aufhalten.
      isOpen = false
      try {
        const now = await read($, phase)
        if (now === 'working') isDismissed = true
        if (now === 'done') await update($, phase, () => 'idle' as Phase)
      } catch {
        // egal: das Panel schließt trotzdem
      }
    }
    return next(e)
  })

  // --- Zeichnen -------------------------------------------------------------

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    lastColumns = e.props.bodyColumns
    const els = $.ui.resolve(e)
    const { Box, Text, Button, Input } = els
    // Wo die Oberfläche keine Grafik zeichnet (Terminal), steht der Text da.
    const Svg = 'Svg' in els ? els.Svg : undefined
    const card = (source: string, alt: string) =>
      // Als Bild eingebettet: passt sich der Panelbreite an und wächst beim Breiterziehen
      // mit (ein interaktiver Rahmen hätte eine feste Größe). Animationen laufen weiter.
      Svg !== undefined ? <Svg source={source} alt={alt} /> : <Text bold>{alt}</Text>
    const now = await read($, phase)
    const written = await read($, notes)
    const pref = await read($, prefs)

    // --- Einstellungen -------------------------------------------------------
    if ((await read($, view)) === 'settings') {
      const toggle = (key: string, isOn: boolean, label: string, change: (p: Prefs) => Prefs) => (
        <Button key={key} onPress={() => setPrefs($, change)}>
          {isOn ? '✅' : '⬜️'} {label}
        </Button>
      )
      const offGroups = pref.offGroups ?? []
      return (
        <Box flexDirection="column" gap="md">
          <Text bold>⚙️ Worauf hast du heute Lust?</Text>
          <Text dimColor>Tippe zum An- und Ausschalten. Was an ist, kommt zu jeder Tageszeit gemischt.</Text>
          {GROUPS.map(g => (
            <Box flexDirection="column">
              <Button key={`grp-${g.id}`} variant={offGroups.includes(g.id) ? 'secondary' : 'primary'} onPress={() => toggleGroup($, g.id)}>
                {offGroups.includes(g.id) ? '⬜️' : '✅'} {g.label}
              </Button>
              <Text dimColor>{g.hint}</Text>
            </Box>
          ))}
          <Text bold>Extras</Text>
          {toggle('opt-sound', pref.sound, 'Sanfter Ton, wenn Claude fertig ist (und echte Pause nach 3 Min.)', x => ({ ...x, sound: !x.sound }))}
          {toggle('opt-refocus', pref.refocus, 'Kurzfassung deines Prompts kurz vor der Antwort (per kleinem Claude-Modell)', x => ({ ...x, refocus: !x.refocus }))}
          {toggle('opt-pad', pref.pad, 'Kurz vor dem Ende fragen: Was sagst du Claude als Nächstes?', x => ({ ...x, pad: !x.pad }))}
          {toggle('opt-rating', pref.rating, 'Ab und zu fragen: Wie bereit fühlst du dich?', x => ({ ...x, rating: !x.rating }))}
          <Button key="settings-done" variant="primary" onPress={() => setView($, 'main')}>
            Fertig
          </Button>
        </Box>
      )
    }

    const settingsButton = (
      <Button key="settings" onPress={() => setView($, 'settings')}>
        ⚙️ Anpassen
      </Button>
    )

    // Nächster Prompt: gefragt wird erst kurz vor dem Ende; die Antwort bleibt
    // sichtbar und kopierbar, bis du den nächsten Prompt abschickst.
    const nextPrompt = !pref.pad ? null : (written.prompt ?? '') === '' ? (
      <Box flexDirection="column" gap="sm">
        <Text bold>📝 Dein nächster Prompt</Text>
        <Input
          key="prompt-pad"
          placeholder="Was sagst du Claude als Nächstes? (optional)"
          submitLabel="Ins Chatfeld"
          rows={2}
          onSubmit={v => void padToChat($, v)}
        />
      </Box>
    ) : (
      <Box flexDirection="column" gap="sm">
        <Text dimColor>📝 Dein nächster Prompt (steht im Chatfeld)</Text>
        <Text bold>{written.prompt}</Text>
        <Box gap="sm">
          <Button key="pad-fill" variant="primary" onPress={() => fillPrompt($)}>
            Nochmal ins Chatfeld
          </Button>
          <Button key="pad-copy" onPress={press => copyPrompt($, press.surface)}>
            Kopieren
          </Button>
          <Button key="pad-edit" onPress={() => savePad($, '')}>
            Ändern
          </Button>
        </Box>
      </Box>
    )

    if (now === 'idle') {
      return (
        <Box flexDirection="column" gap="md">
          <Text bold>🌬️ Die Fokus-Pause ist bereit.</Text>
          <Text dimColor>Braucht Claude länger als ein paar Sekunden, startet hier eine kurze Übung.</Text>
          <Box gap="sm">
            {settingsButton}
            <Button key="close" role="dismiss" onPress={() => close($)}>
              Schließen
            </Button>
          </Box>
        </Box>
      )
    }

    if (now !== 'working') {
      const asked = await read($, ask)
      const line = weekLine(await read($, week))
      const readinessNow = await read($, readiness)
      return (
        <Box flexDirection="column" gap="md">
          {card(doneCard(), '✓ Claude ist fertig')}
          {asked !== '' && (
            <Box flexDirection="column">
              <Text dimColor>Du hattest gefragt</Text>
              <Text>„{asked}“</Text>
            </Box>
          )}
          {written.next !== '' && (
            <Box flexDirection="column">
              <Text dimColor>Dein nächster Schritt</Text>
              <Text bold>→ {written.next}</Text>
            </Box>
          )}
          {written.park !== '' && (
            <Box flexDirection="column">
              <Text dimColor>Geparkt – wartet auf dich</Text>
              <Text>{written.park}</Text>
            </Box>
          )}
          {(written.connect ?? '') !== '' && (
            <Box flexDirection="column">
              <Text dimColor>Deine Verbindungs-Idee</Text>
              <Text>💬 {written.connect}</Text>
            </Box>
          )}
          {nextPrompt}
          {readinessNow === 1 && (
            <Box flexDirection="column" gap="sm">
              <Text>Wie bereit fühlst du dich jetzt für die nächste Runde?</Text>
              <Box gap="sm">
                {['1 😴', '2', '3', '4', '5 🚀'].map((label, i) => (
                  <Button key={`ready-${i + 1}`} onPress={() => rateReadiness($, i + 1)}>
                    {label}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
          {readinessNow === 2 && <Text dimColor>Danke! Die Pausen lernen daraus, was dich gut zurückbringt.</Text>}
          {line !== '' && <Text dimColor>{line}</Text>}
          <Box gap="sm">
            <Button key="back" variant="primary" role="dismiss" onPress={() => close($)}>
              Zurück zum Chat
            </Button>
            {settingsButton}
          </Box>
        </Box>
      )
    }

    await read($, tick)
    if (await read($, isLanding)) {
      const summary = (await read($, refocus))[0] ?? (await read($, ask))
      return (
        <Box flexDirection="column" gap="md">
          {card(promptCard(PALETTES.done, 'Gleich geht’s weiter', summary !== '' ? summary : 'Claude ist gleich fertig.'), summary)}
          {nextPrompt}
        </Box>
      )
    }
    const r = await read($, run)
    const sec = await read($, seconds)
    const nowMs = await $.clock.now()
    const waited = Math.max(0, Math.round((nowMs - (await read($, startedAt))) / 1000))
    const footer = (
      <Box gap="sm" justifyContent="space-between">
        <Text dimColor>
          Claude arbeitet · {fmt(waited)}
          {r !== null && isNew(byId(r.id), nowMs) ? ' · ✨ neu' : ''}
        </Text>
        <Box gap="sm">
          <Button key="skip" onPress={() => advance($, true)}>
            Andere Übung
          </Button>
          {settingsButton}
          <Button key="close" role="dismiss" onPress={() => close($)}>
            Schließen
          </Button>
        </Box>
      </Box>
    )

    if (r === null) {
      return (
        <Box flexDirection="column" gap="md">
          {slot === 0
            ? card(
                promptCard(PALETTES.breathe, 'Ankommen', 'Claude legt los. Ein ruhiger Atemzug – in ein paar Sekunden kommt deine Übung.'),
                'Claude legt los. Ein ruhiger Atemzug.',
              )
            : card(promptCard(PALETTES.breathe, 'Kurz durchatmen', 'Ein Atemzug. Gleich kommt die nächste Übung.'), 'Kurz durchatmen.')}
          {footer}
        </Box>
      )
    }

    const ex = byId(r.id)
    const p = PALETTES[ex.look]
    const field = (placeholder: string, submitLabel: string, onSubmit: (v: string) => void) => (
      <Input
        key={`in-${r.key}`}
        placeholder={placeholder}
        submitLabel={submitLabel}
        autoFocus
        onSubmit={onSubmit}
      />
    )

    let body
    if (ex.kind === 'breathe') {
      body = (
        <Box flexDirection="column" gap="sm">
          {card(
            breatheCard(ex.title, r.pattern, r.hint, ex.shape, `Stufe ${r.level}`),
            `${ex.title}: ${r.hint}`,
          )}
          {r.cue !== '' && <Text dimColor>{r.cue}</Text>}
        </Box>
      )
    } else if (ex.kind === 'steps') {
      let at = 0
      let acc = 0
      for (let i = 0; i < r.steps.length; i++) {
        acc += r.steps[i].sec
        at = i
        if (sec < acc) break
      }
      const text = r.steps[at]?.text ?? ''
      body = card(stepCard(p, ex.title, text, at, r.steps.length, `Stufe ${r.level}`), text)
    } else if (ex.kind === 'note') {
      const done = written[ex.key]
      body = (
        <Box flexDirection="column" gap="sm">
          {card(promptCard(p, ex.title, ex.question), ex.question)}
          {done === '' ? (
            field('Ein Satz reicht …', 'Merken', v => {
              const t = short(v, 200)
              if (t === '') return
              void (async () => {
                await update($, notes, n => ({ ...n, [ex.key]: t }))
                await bump($, 'notes', 1)
                await advance($, false)
              })()
            })
          ) : (
            <Text>✓ Notiert: {done}</Text>
          )}
        </Box>
      )
    } else if (ex.kind === 'choice') {
      if (r.stage === 'result') {
        body = card(promptCard(p, ex.title, r.detail), r.detail)
      } else {
        const node = nodeOf(ex.flow, r.picks)
        body = (
          <Box flexDirection="column" gap="sm">
            {card(promptCard(p, ex.title, node.q), node.q)}
            {rowsOf(node.options.map((o, i) => ({ o, i })), 2).map(row => (
              <Box gap="sm">
                {row.map(({ o, i }) => (
                  <Button key={`c-${r.picks.length}-${i}`} onPress={() => pressChoice($, i)}>
                    {o.label}
                  </Button>
                ))}
              </Box>
            ))}
          </Box>
        )
      }
    } else if (r.stage === 'result') {
      body = card(resultCard(p, ex.title, r.isGood, r.headline, r.detail), `${r.headline}. ${r.detail}`)
    } else if (ex.kind === 'words') {
      body =
        r.stage === 'show' ? (
          card(wordsCard(p, ex.title, r.data, GAME.wordsShow), `Merk dir: ${r.data.join(', ')}`)
        ) : (
          <Box flexDirection="column" gap="sm">
            {card(promptCard(p, ex.title, questionOf(ex, r)), questionOf(ex, r))}
            {field('Wörter mit Leerzeichen …', 'Prüfen', v => void answer($, v))}
          </Box>
        )
    } else if (ex.kind === 'digits') {
      body =
        r.stage === 'show' ? (
          card(
            bigCard(p, ex.title, r.data.join(' '), `${r.data.length} Ziffern – merk dir die Reihenfolge`, GAME.digitsShow),
            `Ziffern: ${r.data.join(' ')}`,
          )
        ) : (
          <Box flexDirection="column" gap="sm">
            {card(bigCard(p, ex.title, '← ? ? ?', questionOf(ex, r), 0), questionOf(ex, r))}
            {field('Ziffern rückwärts …', 'Prüfen', v => void answer($, v))}
          </Box>
        )
    } else if (ex.kind === 'grid') {
      body =
        r.stage === 'show' ? (
          card(gridCard(p, ex.title, r.data.slice(0, 9), false, GAME.gridShow), 'Ein Raster aus 9 Formen – präg es dir ein')
        ) : (
          <Box flexDirection="column" gap="sm">
            {card(gridCard(p, ex.title, r.data.slice(9), true, 0), questionOf(ex, r))}
            {[0, 1, 2].map(row => (
              <Box gap="sm">
                {[1, 2, 3].map(c => {
                  const n = String(row * 3 + c)
                  return (
                    <Button key={`cell-${n}`} hotkey={n} onPress={() => answer($, n)}>
                      Feld {n}
                    </Button>
                  )
                })}
              </Box>
            ))}
          </Box>
        )
    } else if (ex.kind === 'prefix') {
      body = (
        <Box flexDirection="column" gap="sm">
          {card(bigCard(p, ex.title, `${r.solution}…`, '3 Wörter, die so beginnen', 0), questionOf(ex, r))}
          {field('Wörter mit Leerzeichen …', 'Prüfen', v => void answer($, v))}
        </Box>
      )
    } else if (ex.kind === 'math') {
      if (r.stage === 'show') {
        const at = Math.min(r.data.length - 1, Math.floor(sec / GAME.mathStep))
        body = card(
          bigCard(
            p,
            ex.title,
            r.data[at],
            at === 0 ? 'Startzahl – rechne im Kopf mit' : `Schritt ${at} von ${r.data.length - 1}`,
            0,
          ),
          r.data[at],
        )
      } else {
        body = (
          <Box flexDirection="column" gap="sm">
            {card(bigCard(p, ex.title, '= ?', questionOf(ex, r), 0), questionOf(ex, r))}
            {field('Ergebnis …', 'Prüfen', v => void answer($, v))}
          </Box>
        )
      }
    } else if (ex.kind === 'anagram') {
      const isHint = sec - r.stageAt >= 20
      body = (
        <Box flexDirection="column" gap="sm">
          {card(bigCard(p, ex.title, r.data[0], 'Welches Wort steckt darin?', 0), questionOf(ex, r))}
          {field('Lösung …', 'Prüfen', v => void answer($, v))}
          {isHint && <Text dimColor>Tipp: Es beginnt mit „{r.solution[0]}“.</Text>}
        </Box>
      )
    }

    if (ex.kind === 'write') {
      body =
        r.stage === 'result' ? (
          card(promptCard(p, ex.title, `${r.headline} – ${r.detail}`), `${r.headline} – ${r.detail}`)
        ) : (
          <Box flexDirection="column" gap="sm">
            {card(promptCard(p, ex.title, r.data[0] ?? ''), r.data[0] ?? '')}
            {field('Einfach losschreiben …', 'Fertig', v => void submitWrite($, v))}
          </Box>
        )
    } else if (ex.kind === 'fact') {
      const text = r.data[0] ?? ''
      body = (
        <Box flexDirection="column" gap="sm">
          {card(promptCard(p, ex.title, text, 0, r.data[1] ?? ''), text)}
        </Box>
      )
    } else if (ex.kind === 'task') {
      const task = r.data[0] ?? ''
      body =
        r.stage === 'result' ? (
          card(promptCard(p, ex.title, `${r.headline} · ${r.detail}`), r.detail)
        ) : (
          <Box flexDirection="column" gap="sm">
            {card(promptCard(p, ex.title, task), task)}
            <Box gap="sm">
              <Button key="task-done" variant="primary" onPress={() => pressTask($, true)}>
                ✓ Erledigt
              </Button>
              <Button key="task-later" onPress={() => pressTask($, false)}>
                Später
              </Button>
            </Box>
          </Box>
        )
    } else if (ex.kind === 'quiz' && r.stage !== 'result') {
      const pre = r.data[0] ?? ''
      const q = r.data[1] ?? ''
      const isHint = r.stage === 'ask' && sec - r.stageAt >= GAME.quizHint
      body =
        r.stage === 'show' ? (
          card(promptCard(p, ex.title, pre, showSecOf(ex, r), 'Lies genau'), pre)
        ) : (
          <Box flexDirection="column" gap="sm">
            {card(promptCard(p, ex.title, q, 0), q)}
            {field('Deine Antwort …', 'Prüfen', v => void answer($, v))}
            {isHint && <Text dimColor>Tipp: {r.data[3] ?? ''}</Text>}
          </Box>
        )
    } else if (ex.kind === 'blitz' && r.stage !== 'result') {
      body = (
        <Box flexDirection="column" gap="sm">
          {card(promptCard(p, ex.title, questionOf(ex, r), 0), questionOf(ex, r))}
          {field('Mit Komma oder Leerzeichen …', 'Fertig', v => void answer($, v))}
        </Box>
      )
    } else if (ex.kind === 'pick' && r.stage !== 'result') {
      const rounds = r.data.map(d => JSON.parse(d) as PickRound)
      const at = Math.min(rounds.length - 1, r.picks.length)
      const round = rounds[at]
      if (round !== undefined) {
        const badge = `${at + 1} / ${rounds.length}`
        body = (
          <Box flexDirection="column" gap="sm">
            {round.ink !== ''
              ? card(colorCard(p, ex.title, round.big, round.ink, round.sub, badge), `${round.big}: ${round.sub}`)
              : card(promptCard(p, ex.title, round.sub, 0, badge), round.sub)}
            {rowsOf(round.options, 2).map(row => (
              <Box gap="sm">
                {row.map(o => (
                  <Button key={`p-${at}-${o}`} onPress={() => pressPick($, o)}>
                    {o}
                  </Button>
                ))}
              </Box>
            ))}
          </Box>
        )
      }
    } else if (ex.kind === 'sequence' && r.stage !== 'result') {
      if (r.stage === 'show') {
        const at = Math.min(r.data.length - 1, Math.floor(sec / GAME.seqStep))
        const shape = SEQ_SHAPES.find(x => x.id === r.data[at]) ?? SEQ_SHAPES[0]
        body =
          shape === undefined
            ? null
            : card(shapeCard(p, ex.title, shape.id, shape.color, at, r.data.length), shape.label)
      } else {
        const q = `Tippe die Folge nach: ${r.picks.length} von ${r.data.length}`
        body = (
          <Box flexDirection="column" gap="sm">
            {card(promptCard(p, ex.title, q, 0), q)}
            {rowsOf(SEQ_SHAPES, 2).map(row => (
              <Box gap="sm">
                {row.map(x => (
                  <Button key={`s-${x.id}`} onPress={() => pressSeq($, x.id)}>
                    {x.label}
                  </Button>
                ))}
              </Box>
            ))}
          </Box>
        )
      }
    }

    return (
      <Box flexDirection="column" gap="md">
        {body}
        {footer}
      </Box>
    )
  })
}
