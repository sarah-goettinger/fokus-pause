import { expect, mock, test } from 'claude-code/testing'

import { EXERCISES, isNew } from './content'
import { EXTRA_EXERCISES } from './extra'

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const PANE = {
  plugin: 'fokus-pause',
  component: 'Pane',
  requestId: 'fokus-pause',
  props: {
    title: 'Fokus-Pause',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('das Panel zeigt reihum alle Übungsfamilien und zeichnet jede Übung', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 10, 20, 9, 0, 0) })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('http.fetch', () => ({
    value: { status: 200, ok: true, headers: {}, text: '<rss><item><title>Testschlagzeile: KI verändert Führung im Mittelstand</title></item></rss>' },
  }))
  on('model.complete', () => ({
    value: {
      isAnswered: true,
      text: 'Was erwartest du von dem Deck?\nWem zeigst du es als Erstes?',
      usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    },
  }))
  on('tool.call', () => ({ result: {} }))
  on('turn.complete', (_, e) => ({ text: e.answer }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Bau mir bitte ein Deck', turnId: 't1' })
  await clock.advance(8000)

  const seen = new Set<string>()
  const cats = new Set<string>()
  for (let i = 0; i < 150; i++) {
    // Alle 5 Übungen eine neue Wartezeit: wie im Alltag, mit Reizbalance pro Pause.
    if (i > 0 && i % 5 === 0) {
      // Lange Antworten (5 Min.), damit auch lange Übungen in die Wartezeit passen.
      await $.turn.complete({ answer: 'ok', durationMs: 300000, isAborted: false, turnId: `t${i}`, reason: 'answer' })
      await $.turn.start({ text: 'Weiter geht’s mit dem nächsten Schritt', turnId: `t${i + 1}` })
      await clock.advance(8000)
    }
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const svg = await ui.find({ type: 'Svg' })
    expect(svg).toBeDefined()
    // Der Titel steht als Etikett oben in der Karte.
    const source = String(svg?.props.source ?? '')
    const title = /letter-spacing="2"[^>]*>([^<]+)</.exec(source)?.[1] ?? ''
    const ex = EXERCISES.find(x => esc(x.title.toUpperCase()) === title)
    if (ex) {
      seen.add(ex.id)
      cats.add(ex.cat)
    }
    await ui.press({ key: 'skip' })
    await ui.unmount()
    // Wohlbefinden-Fragen haben Wartezeiten: die Uhr läuft weiter.
    await clock.advance(1000)
  }
  // Jede Familie kommt vor, und die allermeisten Übungen.
  expect([...cats].sort()).toEqual(
    ['body', 'brain', 'calm', 'care', 'connect', 'create', 'learn', 'mind', 'play', 'puzzle', 'reflect', 'senses', 'tidy'],
  )
  const missing = EXERCISES.filter(x => !seen.has(x.id)).map(x => x.id)
  expect(missing.length).toBeLessThan(Math.ceil(EXERCISES.length * 0.5))
})

test('Knöpfe und Eingaben führen zu einem Ergebnis', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 10, 20, 15, 0, 0) })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('http.fetch', () => ({
    value: { status: 200, ok: true, headers: {}, text: '<rss><item><title>Testschlagzeile: KI verändert Führung im Mittelstand</title></item></rss>' },
  }))
  on('model.complete', () => ({
    value: {
      isAnswered: true,
      text: 'Was erwartest du von dem Deck?\nWem zeigst du es als Erstes?',
      usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    },
  }))
  on('tool.call', () => ({ result: {} }))
  on('turn.complete', (_, e) => ({ text: e.answer }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Recherchier mir was', turnId: 't1' })
  await clock.advance(8000)

  let answered = 0
  for (let i = 0; i < 80 && answered < 12; i++) {
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const buttons = (await ui.findAll({ type: 'Button' })).filter(
      b => b.key !== 'skip' && b.key !== 'close' && b.key !== 'settings',
    )
    const input = await ui.find({ type: 'Input' })
    if (input?.key !== undefined) {
      await ui.input({ key: input.key, text: 'Kerze Apfel Ball 13' })
      answered += 1
    } else if (buttons[0]?.key !== undefined) {
      await ui.press({ key: buttons[0].key })
      answered += 1
    }
    await ui.unmount()
    await clock.advance(1000)
    const again = await $.ui.mount({ ...PANE, surface: 'desktop' })
    // Nach einer Antwort ist immer noch eine Karte da (Ergebnis, nächste Runde oder nächste Übung).
    expect(await again.find({ type: 'Svg' })).toBeDefined()
    await again.press({ key: 'skip' })
    await again.unmount()
    await clock.advance(1000)
  }
  expect(answered).toBeGreaterThan(5)

  // Ende der Aufgabe: der Fertig-Screen erscheint.
  await $.turn.complete({ answer: 'fertig', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' })
  const done = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await done.find({ type: 'Button', key: 'back' }))?.text).toContain('Zurück')
  await done.unmount()
})

test('kurz vor der Schlussantwort kommen Fragen zurück zum Auftrag', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 10, 20, 15, 0, 0) })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('http.fetch', () => ({
    value: { status: 200, ok: true, headers: {}, text: '<rss><item><title>Testschlagzeile: KI verändert Führung im Mittelstand</title></item></rss>' },
  }))
  on('model.complete', () => ({
    value: {
      isAnswered: true,
      text: 'Was erwartest du von dem Deck?\nWem zeigst du es als Erstes?',
      usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    },
  }))
  on('tool.call', () => ({ result: {} }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Bau mir ein Deck über KI und Führung für das Weekly', turnId: 't1' })
  await clock.advance(9000)
  await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'fertig' } as never)
  await clock.advance(1000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Was erwartest du von dem Deck/ }))?.text).toContain('Deck')
  expect((await ui.find({ type: 'Text', text: /Du hattest gefragt/ }))?.text).toContain('Weekly')
  await ui.unmount()
})

test('jede neue Übung aus extra.ts erscheint im Panel', async ($, on) => {
  const now = Date.now()
  const fresh = EXTRA_EXERCISES.filter(ex => isNew(ex, now))
  if (fresh.length === 0) return
  const clock = mock.clock(on, { now })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Probe', turnId: 't1' })
  await clock.advance(8000)
  const want = new Set(fresh.map(ex => esc(ex.title.toUpperCase())))
  for (let i = 0; i < 400 && want.size > 0; i++) {
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const svg = await ui.find({ type: 'Svg' })
    const title = /letter-spacing="2"[^>]*>([^<]+)</.exec(String(svg?.props.source ?? ''))?.[1] ?? ''
    want.delete(title)
    await ui.press({ key: 'skip' })
    await ui.unmount()
    await clock.advance(1000)
  }
  expect([...want]).toEqual([])
})

const setup = async (
  $: Parameters<Parameters<typeof test>[1]>[0],
  on: Parameters<Parameters<typeof test>[1]>[1],
  before?: () => void,
) => {
  before?.()
  const clock = mock.clock(on, { now: Date.UTC(2026, 10, 21, 9, 0, 0) })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('audio.play', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('tool.call', () => ({ result: {} }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Schreib mir einen Entwurf', turnId: 't1' })
  await clock.advance(8000)
  return clock
}

const titleOf = (source: unknown) =>
  /letter-spacing="2"[^>]*>([^<]+)</.exec(String(source ?? ''))?.[1] ?? ''

test('Einstellungen: eine ausgeschaltete Gruppe kommt nicht mehr', async ($, on) => {
  const clock = await setup($, on)
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'settings' })
  await ui.unmount()
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Button', key: 'grp-play' }))?.text).toContain('✅')
  await ui.press({ key: 'grp-play' })
  await ui.unmount()
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Button', key: 'grp-play' }))?.text).toContain('⬜')
  await ui.press({ key: 'settings-done' })
  await ui.unmount()

  const playCats = new Set(['puzzle', 'play', 'brain'])
  const first = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await first.press({ key: 'skip' })
  await first.unmount()
  const groups = new Set<string>()
  for (let i = 0; i < 80; i++) {
    if (i > 0 && i % 5 === 0) {
      await $.turn.complete({ answer: 'ok', durationMs: 300000, isAborted: false, turnId: `s${i}`, reason: 'answer' })
      await $.turn.start({ text: 'Weiter', turnId: `s${i + 1}` })
      await clock.advance(8000)
    }
    const v = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const title = titleOf((await v.find({ type: 'Svg' }))?.props.source)
    const ex = EXERCISES.find(x => esc(x.title.toUpperCase()) === title)
    if (ex) {
      expect(playCats.has(ex.cat)).toBe(false)
      groups.add(ex.cat)
    }
    await v.press({ key: 'skip' })
    await v.unmount()
    await clock.advance(1000)
  }
  expect(groups.size).toBeGreaterThan(4)
})

test('Nächster Prompt: erst kurz vor dem Ende gefragt, danach kopierbar bis zum nächsten Prompt', async ($, on) => {
  let filled = ''
  const clock = await setup($, on, () =>
    on('prompt.fill', (_, e) => {
      filled = e.text
      return { isFilled: true }
    }),
  )
  // Während der Übungen: kein Feld.
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Input', key: 'prompt-pad' })).toBeUndefined()
  await ui.unmount()
  // Kurz vor dem Ende: die Frage erscheint.
  await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'fertig' } as never)
  await clock.advance(1000)
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'prompt-pad', text: 'Mach die Folie 3 kürzer und konkreter' })
  await ui.unmount()
  // Fertig: der Prompt steht da und lässt sich übernehmen.
  await $.turn.complete({ answer: 'fertig', durationMs: 60000, isAborted: false, turnId: 't1', reason: 'answer' })
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Folie 3/ }))?.text).toContain('Folie 3')
  await ui.press({ key: 'pad-fill' })
  await ui.unmount()
  expect(filled).toBe('Mach die Folie 3 kürzer und konkreter')
  // Nächster Prompt: alles beginnt von vorn.
  await $.turn.start({ text: 'Nächster Auftrag', turnId: 't2' })
  await clock.advance(1000)
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /Folie 3/ })).toBeUndefined()
  await ui.unmount()
})

test('/fokus info antwortet bei einer frischen Installation', async ($, on) => {
  mock.clock(on, { now: Date.UTC(2026, 10, 21, 9, 0, 0) })
  mock.store(on)
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.panes', () => ({ value: [] }))
  on('http.fetch', () => ({ value: { status: 500, ok: false, headers: {}, text: '' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r = await $.command.run({ command: 'fokus', args: 'info' } as never)
  expect(String((r as { text?: string }).text)).toContain('Fokus-Pause Version')
  const off = await $.command.run({ command: 'fokus', args: '' } as never)
  expect(String((off as { text?: string }).text)).toContain('aus')
  const on2 = await $.command.run({ command: 'fokus', args: '' } as never)
  expect(String((on2 as { text?: string }).text)).toContain('an')
})

test('beim Abschicken eines Prompts öffnet sich das Panel sofort (erbeten)', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 10, 21, 9, 0, 0) })
  mock.store(on)
  const opens: string[] = []
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', (_, e) => {
    opens.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.submit', (_, e) => ({ text: e.text }) as never)
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.prompt.submit({ text: 'Fass mir das kurz zusammen' } as never)
  await clock.settle()
  expect(opens).toContain('fokus-pause')
  await $.turn.start({ text: 'Fass mir das kurz zusammen', turnId: 't1' })
  // Erste Sekunden: Ankommen
  await clock.advance(2000)
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Svg' }))?.props.source).toContain('ANKOMMEN')
  await ui.unmount()
  // Schnelle Antwort: kein Fertig-Screen, ruhige Ansicht
  await $.turn.complete({ answer: 'ok', durationMs: 3000, isAborted: false, turnId: 't1', reason: 'answer' })
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /bereit/ }))?.text).toContain('Fokus-Pause')
  await ui.unmount()
})

test('Wiederholung: an einem Tag kommt keine Übung öfter als zwei- (Atmung: drei-) mal', async ($, on) => {
  const clock = await setup($, on)
  const counts = new Map<string, number>()
  for (let i = 0; i < 100; i++) {
    if (i > 0 && i % 4 === 0) {
      await $.turn.complete({ answer: 'ok', durationMs: 300000, isAborted: false, turnId: `w${i}`, reason: 'answer' })
      await $.turn.start({ text: 'Weiter', turnId: `w${i + 1}` })
      await clock.advance(8000)
    }
    const v = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const title = titleOf((await v.find({ type: 'Svg' }))?.props.source)
    const ex = EXERCISES.find(x => esc(x.title.toUpperCase()) === title)
    if (ex) counts.set(ex.id, (counts.get(ex.id) ?? 0) + 1)
    await v.press({ key: 'skip' })
    await v.unmount()
    await clock.advance(1000)
  }
  const tooOften = [...counts].filter(([id, n]) => n > (EXERCISES.find(x => x.id === id)?.kind === 'breathe' ? 3 : 2))
  expect(tooOften).toEqual([])
  // Und es ist bunt: viele verschiedene Übungen.
  expect(counts.size).toBeGreaterThan(40)
})

test('Übungen zum Eintippen bleiben stehen, bis man antwortet oder weiterklickt', async ($, on) => {
  const clock = await setup($, on)
  let key: string | undefined
  for (let i = 0; i < 60 && key === undefined; i++) {
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const input = await ui.find({ type: 'Input' })
    if (input?.key !== undefined) key = input.key
    else await ui.press({ key: 'skip' })
    await ui.unmount()
    await clock.advance(1000)
  }
  expect(key).toBeDefined()
  // Drei Minuten nichts tun: dieselbe Eingabe steht noch da.
  await clock.advance(180000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Input' }))?.key).toBe(key)
  await ui.unmount()
})

test('kurz vor dem typischen Ende kommt die Rückkehr-Karte statt einer neuen Übung', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 10, 21, 9, 0, 0) })
  // Bisher dauerten Claudes Antworten etwa 90 Sekunden.
  mock.store(on, { durations: [90, 90, 90, 90, 90] })
  on('command.register', () => ({ value: { command: 'fokus' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.panes', () => ({ value: [] }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: 'Was erwartest du?\nWas machst du danach?', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } },
  }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.start({ text: 'Schreib mir einen längeren Entwurf für das Weekly', turnId: 't1' })
  let landed = false
  for (let s = 0; s < 200 && !landed; s += 2) {
    await clock.advance(2000)
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const svg = String((await ui.find({ type: 'Svg' }))?.props.source ?? '')
    if (svg.includes('GLEICH GEHT')) landed = true
    // Eingabe-Übungen warten auf uns: in diesem Test einfach weiterklicken.
    else {
      const answerButtons = (await ui.findAll({ type: 'Button' })).filter(
        b => !['skip', 'close', 'settings'].includes(String(b.key)),
      )
      if ((await ui.find({ type: 'Input' })) !== undefined || answerButtons.length > 0) await ui.press({ key: 'skip' })
    }
    await ui.unmount()
  }
  expect(landed).toBe(true)
})
