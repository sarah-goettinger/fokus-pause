// Der Übungskatalog: was es gibt, wie es sich je Durchgang verändert und mit
// der Übung wächst (Stufen), und der Stoff für die Denkspiele. Die Logik,
// wann was kommt, steht in register.tsx.

import type { NoteKey } from '../types'
import {
  AIR, BLITZ, ENERGY, LOGIC, MOOD, ODD, POSTURE, REMOTE, RIDDLES, SERIES, STROOP, TEEKESSEL, WATER,
  letterCount, sortWords,
} from './pools'
import type { Choice, Quiz } from './pools'
import {
  AI_FACTS, AI_TIPS, CONNECT_WRITES, FUN_FACTS, RARE_WORDS, acrostic, association, doodle,
  metaphor, nameIt, randomTask, sixWords, trueFalse, whatIf,
} from './pools2'
import type { Fact, Write } from './pools2'
import { extraConnect } from './pools2'
import { pickNew, pickNewMany } from './pools'
import { EXTRA, EXTRA_EXERCISES } from './extra'
import {
  CLAUDE_TIPS, GLOSSARY, butterflyHug, capitalQuiz, clockQuiz, connectMoment, createMix, deskStretch, emojiQuiz,
  grounding, innerSmile, journal, oppositeQuiz, palming, sayingQuiz, shakeOut, soundMap, thankBody, weekdayQuiz,
} from './pools3'

export type Cat = 'calm' | 'brain' | 'senses' | 'body' | 'reflect' | 'play' | 'mind' | 'puzzle' | 'care' | 'create' | 'learn' | 'connect' | 'tidy'
export type Look = 'breathe' | 'body' | 'note' | 'senses' | 'brain' | 'play' | 'mind' | 'puzzle' | 'care' | 'create' | 'learn' | 'connect' | 'tidy' | 'done'

/** Eine Atemphase: Beschriftung, Dauer, Größe des Kreises am Ende (0–1). */
export type Phase = { label: string; sec: number; scale: number }
export type Step = { text: string; sec: number }
export type Breath = { pattern: Phase[]; rounds: number; hint: string; cue: string }

type Base = { id: string; cat: Cat; title: string; look: Look; isShort?: true; addedAt?: string; isSpecial?: true }

export type Exercise = Base &
  (
    | { kind: 'breathe'; shape: 'circle' | 'square'; breath: (level: number) => Breath }
    | { kind: 'steps'; steps: (level: number) => Step[] }
    | { kind: 'note'; key: NoteKey; question: string; sec: number }
    | { kind: 'words' }
    | { kind: 'digits' }
    | { kind: 'grid' }
    | { kind: 'prefix' }
    | { kind: 'math' }
    | { kind: 'anagram' }
    | { kind: 'quiz'; quiz: () => Quiz }
    | { kind: 'blitz' }
    | { kind: 'pick'; rounds: () => PickRound[] }
    | { kind: 'sequence' }
    | { kind: 'choice'; flow: Choice; cooldownMin: number }
    | { kind: 'write'; write: () => Write }
    | { kind: 'fact'; fact: () => Fact }
    | { kind: 'task' }
  )

/** Eine Runde mit Antwort-Knöpfen: großes Wort (evtl. farbig), Optionen, richtige Antwort. */
export type PickRound = { big: string; ink: string; sub: string; options: string[]; answer: string; why: string }

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]
const shuffle = <T,>(list: readonly T[]): T[] => {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// --- Stufen ---------------------------------------------------------------

/** Alle 3 vollständigen Durchgänge eine Stufe weiter, bis Stufe 4. */
export const LEVEL_EVERY = 3
export const MAX_LEVEL = 4
export const LEVEL_NAMES = ['', 'Ankommen', 'Vertiefen', 'Verweilen', 'Offen']
export const levelOf = (count: number) => Math.min(MAX_LEVEL, 1 + Math.floor(count / LEVEL_EVERY))
export const isPractice = (ex: Exercise) => ex.kind === 'breathe' || ex.kind === 'steps'

/** Wie viele Runden ein Atemzyklus braucht, damit es etwa `target` Sekunden sind. */
const roundsFor = (pattern: Phase[], target: number) =>
  Math.max(3, Math.round(target / pattern.reduce((n, p) => n + p.sec, 0)))

// Worauf die Aufmerksamkeit beim Atmen ruht: jedes Mal ein anderer Anker.
const BREATH_CUES = [
  'Spür den Atem an der Nasenspitze',
  'Spür, wie sich der Bauch hebt und senkt',
  'Mit jedem Ausatmen sinken die Schultern',
  'Zähl still die Atemzüge mit',
  'Spür die kühle Luft beim Ein-, die warme beim Ausatmen',
  'Lass den Ausatem ganz von allein auslaufen',
  'Spür, wie sich die Rippen zur Seite weiten',
  'Stell dir vor, du atmest in den Rücken hinein',
  'Lass Gedanken kommen und ziehen wie Wolken',
  'Weich lächeln beim Ausatmen',
]
const ADVANCED_CUES = [
  'Beobachte die kleine Pause nach dem Ausatmen',
  'Lass den Atem atmen – du schaust nur zu',
  'Spür den Atem im ganzen Körper zugleich',
  'Bemerke, wo der Atem gerade am deutlichsten ist',
]
const cueFor = (level: number) => pick(level >= 3 ? [...BREATH_CUES, ...ADVANCED_CUES] : BREATH_CUES)

// --- Körper ---------------------------------------------------------------

type Region = { name: string; texts: string[] }

const REGIONS: Region[] = [
  { name: 'Stirn', texts: ['Lass die Stirn glatt und weit werden.', 'Spür deine Stirn – darf sie weicher werden?', 'Die Stirn entspannt sich, wie nach einem Lächeln.'] },
  { name: 'Augen', texts: ['Lass die Augen schwer in ihren Höhlen ruhen.', 'Die Muskeln um die Augen werden weich.', 'Lass den Blick unscharf werden.'] },
  { name: 'Kiefer', texts: ['Kiefer lösen: Zähne auseinander, Zunge liegt locker.', 'Lass den Unterkiefer ein kleines Stück sinken.', 'Spür, ob du die Zähne zusammenbeißt – und lass los.'] },
  { name: 'Nacken', texts: ['Spür deinen Nacken. Lass den Kopf ein wenig schwerer werden.', 'Der Nacken wird lang, der Scheitel strebt nach oben.', 'Wo im Nacken hältst du gerade fest?'] },
  { name: 'Schultern', texts: ['Schultern einmal hochziehen … und fallen lassen.', 'Lass die Schultern sinken, weg von den Ohren.', 'Spür das Gewicht deiner Arme an den Schultern.'] },
  { name: 'Brust', texts: ['Spür, wie sich die Brust beim Atmen bewegt.', 'Lass die Brust weit und weich werden.', 'Spür den Herzschlag – oder einfach die Wärme dort.'] },
  { name: 'Bauch', texts: ['Lass den Bauch los. Er darf rund werden.', 'Spür den Atem im Bauch.', 'Wie fühlt sich dein Bauch gerade an – eng oder weit?'] },
  { name: 'Hände', texts: ['Spür, wo deine Hände gerade liegen.', 'Spür jeden einzelnen Finger, vom Daumen bis zum kleinen.', 'Kribbeln, Wärme, Kühle – was ist in den Händen?'] },
  { name: 'Rücken', texts: ['Spür, wo dein Rücken die Lehne berührt.', 'Lass den unteren Rücken weich werden.', 'Spür die Wirbelsäule – aufgerichtet, aber nicht steif.'] },
  { name: 'Becken', texts: ['Spür dein Gewicht auf dem Stuhl.', 'Lass dich vom Stuhl tragen.', 'Spür die Sitzknochen auf der Fläche.'] },
  { name: 'Beine', texts: ['Lass die Oberschenkel schwer werden.', 'Spür deine Knie und Waden.', 'Wie fühlen sich deine Beine gerade an?'] },
  { name: 'Füße', texts: ['Spür deine Füße auf dem Boden.', 'Spür die Fußsohlen – Ferse, Ballen, Zehen.', 'Drück die Füße sanft in den Boden und lass wieder los.'] },
]

const DEEPEN = [
  'Ist es dort warm, kühl oder neutral?',
  'Fühlt es sich eng oder weit an?',
  'Gibt es dort Bewegung, Kribbeln oder Stille?',
  'Du musst nichts verändern – nur bemerken.',
]

const PMR: Step[][] = [
  [
    { text: 'Ball beide Hände fest zu Fäusten … halten …', sec: 6 },
    { text: '… und loslassen. Spür den Unterschied.', sec: 8 },
  ],
  [
    { text: 'Zieh die Schultern hoch zu den Ohren … halten …', sec: 6 },
    { text: '… und fallen lassen. Spür die Schwere.', sec: 8 },
  ],
  [
    { text: 'Kneif das Gesicht zusammen: Augen, Nase, Mund … halten …', sec: 6 },
    { text: '… und lösen. Das Gesicht wird weich.', sec: 8 },
  ],
  [
    { text: 'Zieh die Zehen zu dir und spann die Beine an … halten …', sec: 6 },
    { text: '… und loslassen. Die Beine werden schwer.', sec: 8 },
  ],
  [
    { text: 'Spann den Bauch an, als würdest du dich wappnen … halten …', sec: 6 },
    { text: '… und loslassen. Der Atem fließt wieder frei.', sec: 8 },
  ],
]

/** Ein Körper-Check, der jedes Mal anders ist und mit der Stufe stiller wird. */
const bodyScan = (level: number): Step[] => {
  const theme = pick(['down', 'up', 'pmr', 'breath', 'contact', 'random'] as const)
  const count = level >= 4 ? 3 : level >= 3 ? 4 : 5
  const sec = level >= 4 ? 16 : level >= 3 ? 13 : level >= 2 ? 10 : 9
  const say = (r: Region) => pick(r.texts)

  let steps: Step[]
  if (theme === 'pmr') {
    steps = shuffle(PMR).slice(0, level >= 3 ? 2 : 3).flat()
  } else {
    let regions: Region[]
    if (theme === 'down') regions = pickOrdered(REGIONS, count)
    else if (theme === 'up') regions = pickOrdered(REGIONS, count).reverse()
    else if (theme === 'contact') regions = REGIONS.filter(r => ['Füße', 'Becken', 'Rücken', 'Hände'].includes(r.name))
    else regions = shuffle(REGIONS).slice(0, count)

    steps = regions.map(r => ({
      text: theme === 'breath' ? `Atme in ${dativ(r.name)} hinein. ${say(r)}` : say(r),
      sec,
    }))
    // Ab Stufe 2 eine Frage, die genauer hinspüren lässt.
    if (level >= 2 && steps.length > 1) {
      const at = 1 + Math.floor(Math.random() * (steps.length - 1))
      steps[at] = { text: `${steps[at].text} ${pick(DEEPEN)}`, sec: sec + 3 }
    }
  }
  const intro = pick([
    'Komm kurz an. Wo bist du gerade?',
    'Setz dich bequem hin. Ein ruhiger Atemzug.',
    'Lass die Aufgabe kurz liegen. Du bist hier.',
  ])
  const outro =
    level >= 3
      ? pick([
          'Weite die Aufmerksamkeit auf den ganzen Körper. Einfach da sein.',
          'Spür deinen Körper als Ganzes – von innen, ohne Worte.',
        ])
      : pick(['Ein tiefer Atemzug durch die Nase, langsam aus.', 'Spür noch einmal den ganzen Körper.'])
  return [{ text: intro, sec: 6 }, ...steps, { text: outro, sec: level >= 3 ? 20 : 9 }]
}

/** Wählt `n` Regionen und behält ihre Reihenfolge von Kopf bis Fuß. */
const pickOrdered = (list: Region[], n: number) => {
  const keep = new Set(shuffle(list.map((_, i) => i)).slice(0, n))
  return list.filter((_, i) => keep.has(i))
}

const dativ = (name: string) =>
  ({ Stirn: 'die Stirn', Augen: 'die Augen', Kiefer: 'den Kiefer', Nacken: 'den Nacken', Schultern: 'die Schultern', Brust: 'die Brust', Bauch: 'den Bauch', Hände: 'die Hände', Rücken: 'den Rücken', Becken: 'das Becken', Beine: 'die Beine', Füße: 'die Füße' })[name] ?? name

const MOVES: Step[] = [
  { text: 'Kopf langsam zur Seite kreisen – dreimal links, dreimal rechts.', sec: 14 },
  { text: 'Hände locker ausschütteln.', sec: 8 },
  { text: 'Aufstehen, Arme nach oben, ganz lang machen.', sec: 12 },
  { text: 'Augen-Acht: Zieh mit den Augen langsam eine liegende 8.', sec: 12 },
  { text: 'Schultern fünfmal nach hinten kreisen.', sec: 10 },
  { text: 'Hände hinter dem Rücken verschränken, Brust öffnen.', sec: 12 },
  { text: 'Im Sitzen: Oberkörper sanft nach rechts drehen … und nach links.', sec: 14 },
  { text: 'Handgelenke kreisen, Finger spreizen und schließen.', sec: 10 },
  { text: 'Ohr zur Schulter neigen – rechts halten, dann links.', sec: 14 },
  { text: 'Auf die Zehenspitzen gehen und langsam wieder absenken.', sec: 10 },
  { text: 'Hände aneinander reiben, bis sie warm sind, und für drei Atemzüge auf die Augen legen. Dann weiterlesen.', sec: 16 },
  { text: 'Einmal kräftig gähnen und strecken wie eine Katze.', sec: 8 },
]

const moves = (level: number): Step[] => [
  ...shuffle(MOVES).slice(0, 3 + Math.min(2, level - 1)),
  { text: pick(['Hinsetzen, einmal tief durchatmen.', 'Spür nach: Wo ist jetzt mehr Raum?']), sec: 6 },
]

// --- Wahrnehmung -----------------------------------------------------------

const senses = (level: number): Step[] => {
  if (level >= 3 && Math.random() < 0.5) {
    // Fortgeschritten: offenes Gewahrsein statt Zählen.
    return [
      { text: 'Lass alle Geräusche gleichzeitig zu dir kommen – ohne sie zu benennen.', sec: 15 },
      { text: 'Nimm jetzt dazu wahr, was du siehst – alles auf einmal, wie ein Bild.', sec: 15 },
      { text: 'Und dazu den Körper: Berührung, Gewicht, Temperatur.', sec: 15 },
      { text: 'Alles zugleich. Du bist mittendrin.', sec: 15 },
    ]
  }
  const wordless = level >= 2 ? ' Ohne Worte – nur wahrnehmen.' : ''
  const see = pick(['Nenne still 5 Dinge, die du gerade siehst.', 'Finde 5 Dinge in deinem Blickfeld, die du heute noch nicht bemerkt hast.', 'Finde 5 verschiedene Farbtöne um dich herum.'])
  const hear = pick(['Nenne still 4 Dinge, die du gerade hörst.', 'Finde 4 Geräusche – zwei nahe, zwei ferne.', 'Hör 4 Geräusche – auch das leiseste.'])
  const feel = pick(['Spür 3 Dinge, die dich berühren (Stuhl, Kleidung, Boden).', 'Spür 3 Temperaturen an deinem Körper.', 'Spür 3 Stellen, an denen dein Körper aufliegt.'])
  const smell = pick(['Nimm 2 Gerüche wahr, oder stell sie dir vor.', 'Riech 2 Dinge – oder erinnere dich an deinen Lieblingsduft.'])
  const last = pick(['Ein langer, ruhiger Atemzug.', 'Spür einen Geschmack im Mund – oder einfach den Atem.'])
  const order = level >= 2 && Math.random() < 0.5 ? [feel, hear, see] : [see, hear, feel]
  return [
    { text: order[0] + wordless, sec: 12 },
    { text: order[1] + wordless, sec: 12 },
    { text: order[2] + wordless, sec: 12 },
    { text: smell, sec: 10 },
    { text: last, sec: 8 },
  ]
}

const colorHunt = (level: number): Step[] => {
  const n = level >= 3 ? 5 : level >= 2 ? 4 : 3
  const single = ['blaue', 'rote', 'grüne', 'gelbe', 'runde', 'eckige', 'weiche', 'glänzende', 'hölzerne']
  const thing =
    level >= 3
      ? `${n} Dinge, die ${pick(['blau', 'rot', 'grün', 'gelb', 'weiß'])} UND ${pick(['rund', 'eckig', 'klein', 'glatt'])} sind`
      : `${n} ${pick(single)} Dinge`
  return [
    { text: `Finde in deinem Raum ${thing}.`, sec: 16 + n * 2 },
    { text: pick(['Welches davon gefällt dir am besten?', 'Welches hast du vorher noch nie bemerkt?', 'Schau eins davon 5 Sekunden ganz genau an.']), sec: 8 },
  ]
}

const listen = (level: number): Step[] => {
  // Mit geschlossenen Augen kann man nicht lesen: erst alles lesen, dann Augen zu.
  const back = 'Öffne die Augen, wenn du so weit bist. Spätestens holt dich der sanfte Klang zurück, wenn Claude fertig ist.'
  const sec = level >= 3 ? 40 : 28
  const v = pick([
    { task: 'Finde das leiseste Geräusch – und dann das, das am weitesten weg ist.', after: 'Was war das leiseste Geräusch?' },
    { task: 'Hör erst nach links, dann nach rechts. Was ist wo?', after: 'Welche Seite war lauter?' },
    { task: 'Hör auf die Stille zwischen den Geräuschen.', after: 'Wie lang war die längste Lücke?' },
    { task: 'Folge einem einzigen Geräusch, bis es verklingt. Dann dem nächsten.', after: 'Welchem Geräusch bist du gefolgt?' },
  ])
  return [
    { text: `Lies erst, dann Augen zu: ${v.task} ${back}`, sec },
    { text: v.after, sec: 8 },
  ]
}

const farView = (level: number): Step[] => {
  const v = pick([
    [
      { text: 'Schau aus dem Fenster – so weit weg wie möglich.', sec: 6 },
      { text: 'Lass den Blick dort ruhen. Die Augen dürfen weich werden.', sec: 18 },
    ],
    [
      { text: 'Such den entferntesten Punkt, den du sehen kannst.', sec: 6 },
      { text: 'Bleib mit dem Blick dort. Was erkennst du alles?', sec: 18 },
    ],
    [
      { text: 'Schau geradeaus, ohne etwas zu fixieren.', sec: 6 },
      { text: 'Nimm die Ränder deines Sichtfelds wahr – links, rechts, oben, unten.', sec: 18 },
    ],
    [
      { text: 'Schau abwechselnd auf deinen Daumen und in die Ferne.', sec: 14 },
      { text: 'Dann bleib in der Ferne und lass die Augen ruhen.', sec: 12 },
    ],
  ])
  return [
    ...v.map(s => ({ ...s, sec: level >= 3 ? s.sec + 6 : s.sec })),
    { text: 'Ein paarmal langsam blinzeln.', sec: 5 },
  ]
}

// --- Achtsamkeit -------------------------------------------------------------

const fingers = (level: number): Step[] => {
  const sec = level >= 3 ? 8 : 6
  const names = ['Daumen', 'Zeigefinger', 'Mittelfinger', 'Ringfinger', 'kleinen Finger']
  return [
    { text: 'Spreiz eine Hand vor dir. Mit dem Zeigefinger der anderen fährst du ihre Kontur nach.', sec: 7 },
    ...names.map(n => ({ text: `Am ${n} hoch – einatmen … und runter – ausatmen.`, sec })),
    ...(level >= 2 ? [{ text: 'Und den ganzen Weg zurück, noch etwas langsamer.', sec: sec * 3 }] : []),
  ]
}

const thoughts = (level: number): Step[] => {
  const sec = level >= 3 ? 18 : level >= 2 ? 14 : 11
  const v = pick([
    ['Stell dir einen weiten Himmel vor.', 'Jeder Gedanke ist eine Wolke. Sie kommt … und zieht weiter.', 'Du musst keine Wolke festhalten. Du bist der Himmel.'],
    ['Stell dir einen ruhigen Bach vor, auf dem Blätter treiben.', 'Leg jeden Gedanken, der kommt, auf ein Blatt – und lass ihn davontreiben.', 'Kommt ein neuer Gedanke, ein neues Blatt. Ganz ohne Eile.'],
    ['Stell dir vor, du stehst an einem Bahnsteig.', 'Gedanken sind Züge. Du siehst sie einfahren – und lässt sie wieder abfahren.', 'Du musst in keinen Zug einsteigen.'],
    ['Beobachte, was dir gerade durch den Kopf geht.', 'Gib jedem Gedanken ein kleines Etikett: „Planen“, „Erinnern“, „Sorgen“, „Bewerten“.', 'Und dann lass ihn wieder los. Etikett drauf, weiter.'],
  ] as const)
  return [
    ...v.map(text => ({ text, sec })),
    ...(level >= 3 ? [{ text: 'Bemerke auch die kleinen Lücken zwischen den Gedanken.', sec: 18 }] : []),
  ]
}

const METTA_WISHES = [
  'Möge es dir gut gehen. Mögest du in Frieden sein.',
  'Mögest du gesund sein. Mögest du dich sicher fühlen.',
  'Mögest du glücklich sein. Mögest du mit Leichtigkeit leben.',
]
const metta = (level: number): Step[] => {
  const wish = pick(METTA_WISHES)
  const circles = [
    'Denk an dich selbst – so, wie du gerade hier sitzt.',
    'Denk an einen Menschen, den du gern hast.',
    'Denk an jemanden, den du nur flüchtig kennst – die Person vom Bäcker, ein Kollege.',
    'Und jetzt an alle Menschen, die gerade auch arbeiten, warten, atmen.',
  ].slice(0, Math.min(4, level + 1))
  return [
    { text: 'Leg, wenn du magst, eine Hand aufs Herz.', sec: 6 },
    ...circles.flatMap(c => [
      { text: c, sec: 7 },
      { text: `Wünsch innerlich: ${wish}`, sec: 10 },
    ]),
  ]
}

const feelings = (level: number): Step[] => [
  { text: 'Welches Gefühl ist gerade da? Gib ihm einen Namen – ein Wort reicht.', sec: 12 },
  { text: 'Wo spürst du es im Körper?', sec: 10 },
  { text: pick(['Wie stark ist es – auf einer Skala von 1 bis 10?', 'Hat es eine Farbe, eine Form, eine Temperatur?', 'Ist es eher eng oder eher weit?']), sec: 10 },
  { text: 'Atme sanft dorthin. Das Gefühl darf da sein.', sec: level >= 3 ? 16 : 10 },
  ...(level >= 2 ? [{ text: 'Was möchte dir dieses Gefühl vielleicht sagen?', sec: 12 }] : []),
]

const stop = (level: number): Step[] => [
  { text: 'S – Stopp. Halte kurz inne, wo du gerade bist.', sec: 5 },
  { text: 'T – Tief atmen. Ein bewusster Atemzug.', sec: 7 },
  { text: 'O – Observieren: Was nimmst du gerade wahr – Körper, Gefühl, Gedanken?', sec: level >= 3 ? 14 : 10 },
  { text: 'P – Weitermachen: Womit möchtest du gleich bewusst weitermachen?', sec: 8 },
]

const sip = (level: number): Step[] => [
  { text: 'Nimm dein Glas oder deine Tasse in die Hand. (Kein Getränk da? Dann ist jetzt der Moment, eins zu holen 😉)', sec: 8 },
  { text: pick(['Spür das Gewicht und die Temperatur.', 'Wie fühlt sich das Gefäß in deiner Hand an?']), sec: 6 },
  { text: 'Nimm einen langsamen Schluck. Spür ihn im Mund.', sec: 7 },
  { text: 'Und wie er hinunterfließt.', sec: level >= 3 ? 10 : 6 },
]

const PLACES = ['einen Strand am frühen Morgen', 'einen Wald nach dem Regen', 'einen Berggipfel mit weiter Sicht', 'dein Lieblingscafé', 'einen Garten im Sommer', 'eine Wiese am Abend']
const calmPlace = (level: number): Step[] => {
  const place = pick(PLACES)
  return [
    { text: `Gleich darfst du die Augen schließen. Stell dir dann ${place} vor: Was siehst du, was hörst du, wie riecht es, wie fühlt sich die Luft an?`, sec: 12 },
    { text: `Augen zu und los. Bleib dort, solange es guttut. Dieser Ort ist immer für dich da. Öffne die Augen, wenn du so weit bist. Spätestens holt dich der sanfte Klang zurück, wenn Claude fertig ist.`, sec: level >= 3 ? 60 : 45 },
  ]
}

const compassion = (level: number): Step[] => [
  { text: 'Leg eine Hand auf dein Herz – oder auf deinen Arm. Spür die Wärme.', sec: 7 },
  { text: pick(['Sag dir innerlich: Das ist gerade anstrengend.', 'Sag dir innerlich: Das ist gerade viel.']), sec: 8 },
  { text: 'Anderen geht es auch manchmal so. Du bist damit nicht allein.', sec: 9 },
  { text: 'Was würdest du jetzt einer guten Freundin sagen? Sag es dir selbst.', sec: level >= 2 ? 14 : 10 },
]

// --- Der Katalog ----------------------------------------------------------

export const EXERCISES: Exercise[] = [
  // Runterfahren: jede Stufe ein etwas längerer Ausatem oder längeres Halten.
  {
    id: 'calm', cat: 'calm', kind: 'breathe', title: 'Ruhig atmen', look: 'breathe', shape: 'circle',
    breath: level => {
      const [inn, out] = [[4, 6], [4, 7], [4, 8], [5, 9]][level - 1] ?? [4, 6]
      const pattern = [
        { label: 'Einatmen', sec: inn, scale: 1 },
        { label: 'Ausatmen', sec: out, scale: 0.45 },
      ]
      return { pattern, rounds: roundsFor(pattern, 60), hint: `${inn} Sekunden ein · ${out} Sekunden aus`, cue: cueFor(level) }
    },
  },
  {
    id: 'sigh', cat: 'calm', kind: 'breathe', title: 'Physiologischer Seufzer', look: 'breathe', shape: 'circle', isShort: true,
    breath: level => {
      const pattern = [
        { label: 'Durch die Nase ein', sec: 2, scale: 0.8 },
        { label: 'Nochmal kurz ein', sec: 1, scale: 1 },
        { label: 'Lang durch den Mund aus', sec: 6 + Math.min(2, level - 1), scale: 0.45 },
        ...(level >= 3 ? [{ label: 'Stille', sec: 3, scale: 0.45 }] : []),
      ]
      return { pattern, rounds: 3, hint: 'Zweimal ein, einmal lang aus', cue: cueFor(level) }
    },
  },
  {
    id: 'box', cat: 'calm', kind: 'breathe', title: 'Box Breathing', look: 'breathe', shape: 'square',
    breath: level => {
      const s = [4, 5, 5, 6][level - 1] ?? 4
      const pattern = [
        { label: 'Einatmen', sec: s, scale: 1 },
        { label: 'Halten', sec: s, scale: 1 },
        { label: 'Ausatmen', sec: s, scale: 0.45 },
        { label: 'Halten', sec: s, scale: 0.45 },
      ]
      return { pattern, rounds: roundsFor(pattern, 64), hint: `${s} ein · ${s} halten · ${s} aus · ${s} halten`, cue: cueFor(level) }
    },
  },
  {
    id: 'hum', cat: 'calm', kind: 'breathe', title: 'Summ-Atmung', look: 'breathe', shape: 'circle',
    breath: level => {
      const out = [8, 9, 10, 12][level - 1] ?? 8
      const sound = pick(['mmm', 'mmm', 'ooo', 'nnn'])
      const pattern = [
        { label: 'Einatmen', sec: 4, scale: 1 },
        { label: `Summend aus … ${sound}`, sec: out, scale: 0.45 },
      ]
      return { pattern, rounds: roundsFor(pattern, 50), hint: 'Leise summen beruhigt den Vagusnerv', cue: cueFor(level) }
    },
  },

  // Wahrnehmung
  { id: 'senses', cat: 'senses', kind: 'steps', title: '5 · 4 · 3 · 2 · 1', look: 'senses', steps: senses },
  { id: 'color', cat: 'senses', kind: 'steps', title: 'Farbjagd', look: 'senses', isShort: true, steps: colorHunt },
  { id: 'sound', cat: 'senses', kind: 'steps', title: 'Hinhören', look: 'senses', isShort: true, steps: listen },
  { id: 'far', cat: 'senses', kind: 'steps', title: 'Weitblick', look: 'senses', isShort: true, steps: farView },

  // Körper
  { id: 'body', cat: 'body', kind: 'steps', title: 'Körper-Check', look: 'body', steps: bodyScan },
  { id: 'move', cat: 'body', kind: 'steps', title: 'Kurz bewegen', look: 'body', steps: moves },

  // Reflexion
  {
    id: 'next', cat: 'reflect', kind: 'note', key: 'next', title: 'Nächster Schritt', look: 'note',
    question: 'Was machst du als Erstes, wenn Claude fertig ist?', sec: 75,
  },
  {
    id: 'know', cat: 'reflect', kind: 'note', key: 'know', title: 'Was weiß ich schon?', look: 'note',
    question: 'Was weißt du über deine Aufgabe schon sicher?', sec: 75,
  },
  {
    id: 'grat', cat: 'reflect', kind: 'note', key: 'grat', title: 'Mini-Dankbarkeit', look: 'note',
    question: 'Was lief heute schon gut?', sec: 60,
  },
  {
    id: 'park', cat: 'reflect', kind: 'note', key: 'park', title: 'Gedanken parken', look: 'note',
    question: 'Was schwirrt dir gerade im Kopf herum? Schreib es hier ab – es wartet auf dich.', sec: 75,
  },

  // Gedächtnis
  { id: 'words', cat: 'brain', kind: 'words', title: 'Wortkette', look: 'brain' },
  { id: 'digits', cat: 'brain', kind: 'digits', title: 'Zahlen rückwärts', look: 'brain', isShort: true },
  { id: 'grid', cat: 'brain', kind: 'grid', title: 'Was hat sich verändert?', look: 'brain' },

  { id: 'sequence', cat: 'brain', kind: 'sequence', title: 'Symbolfolge', look: 'brain' },
  { id: 'letters', cat: 'brain', kind: 'quiz', title: 'Buchstaben zählen', look: 'brain', quiz: letterCount },
  { id: 'sort', cat: 'brain', kind: 'quiz', title: 'Kopf-Sortieren', look: 'brain', quiz: sortWords },

  // Denkspiele
  { id: 'prefix', cat: 'play', kind: 'prefix', title: 'Wortfindung', look: 'play', isShort: true },
  { id: 'math', cat: 'play', kind: 'math', title: 'Kettenrechnen', look: 'play' },
  { id: 'anagram', cat: 'play', kind: 'anagram', title: 'Anagramm', look: 'play' },
  { id: 'stroop', cat: 'play', kind: 'pick', title: 'Farbe oder Wort?', look: 'play', isShort: true, rounds: stroopRounds },
  { id: 'odd', cat: 'play', kind: 'pick', title: 'Was passt nicht?', look: 'play', isShort: true, rounds: oddRounds },
  { id: 'blitz', cat: 'play', kind: 'blitz', title: 'Kategorie-Blitz', look: 'play' },

  // Knobeln
  { id: 'riddle', cat: 'puzzle', kind: 'quiz', title: 'Rätselfrage', look: 'puzzle', quiz: () => pickNew([...RIDDLES, ...EXTRA.riddles], q => q.q) },
  { id: 'remote', cat: 'puzzle', kind: 'quiz', title: 'Das verbindende Wort', look: 'puzzle', quiz: () => pickNew([...REMOTE, ...EXTRA.remote], q => q.q) },
  { id: 'teekessel', cat: 'puzzle', kind: 'quiz', title: 'Teekesselchen', look: 'puzzle', quiz: () => pickNew([...TEEKESSEL, ...EXTRA.teekessel], q => q.q) },
  { id: 'series', cat: 'puzzle', kind: 'quiz', title: 'Zahlenreihe', look: 'puzzle', quiz: () => pickNew([...SERIES, ...EXTRA.series], q => q.q) },
  { id: 'logic', cat: 'puzzle', kind: 'quiz', title: 'Logik-Nuss', look: 'puzzle', quiz: () => pick(LOGIC)() },

  // Achtsamkeit
  {
    id: '478', cat: 'calm', kind: 'breathe', title: '4-7-8-Atmung', look: 'breathe', shape: 'circle',
    breath: level => {
      const [a, b, c] = level === 1 ? [3, 5, 6] : [4, 7, 8]
      const pattern = [
        { label: 'Durch die Nase ein', sec: a, scale: 1 },
        { label: 'Halten', sec: b, scale: 1 },
        { label: 'Durch den Mund aus', sec: c, scale: 0.45 },
      ]
      return { pattern, rounds: level >= 4 ? 4 : 3, hint: `${a} ein · ${b} halten · ${c} aus`, cue: cueFor(level) }
    },
  },
  {
    id: 'coherence', cat: 'calm', kind: 'breathe', title: 'Herz-Kohärenz', look: 'breathe', shape: 'circle',
    breath: level => {
      const s = [4, 5, 5, 6][level - 1] ?? 5
      const pattern = [
        { label: 'Einatmen', sec: s, scale: 1 },
        { label: 'Ausatmen', sec: s, scale: 0.45 },
      ]
      return { pattern, rounds: roundsFor(pattern, 60), hint: `Gleichmäßig: ${s} ein · ${s} aus`, cue: cueFor(level) }
    },
  },
  { id: 'finger', cat: 'mind', kind: 'steps', title: 'Fingeratmung', look: 'mind', steps: fingers },
  { id: 'thoughts', cat: 'mind', kind: 'steps', title: 'Gedanken beobachten', look: 'mind', steps: thoughts },
  { id: 'metta', cat: 'mind', kind: 'steps', title: 'Freundlichkeit', look: 'mind', steps: metta },
  { id: 'feel', cat: 'mind', kind: 'steps', title: 'Gefühle benennen', look: 'mind', steps: feelings },
  { id: 'stop', cat: 'mind', kind: 'steps', title: 'STOP', look: 'mind', isShort: true, steps: stop },
  { id: 'place', cat: 'mind', kind: 'steps', title: 'Ort der Ruhe', look: 'mind', steps: calmPlace },

  // Wohlbefinden
  { id: 'mood', cat: 'care', kind: 'choice', title: 'Wie geht’s dir?', look: 'care', isShort: true, flow: MOOD, cooldownMin: 60 },
  { id: 'water', cat: 'care', kind: 'choice', title: 'Trinkpause', look: 'care', isShort: true, flow: WATER, cooldownMin: 90 },
  { id: 'air', cat: 'care', kind: 'choice', title: 'Frische Luft', look: 'care', isShort: true, flow: AIR, cooldownMin: 120 },
  { id: 'posture', cat: 'care', kind: 'choice', title: 'Haltung', look: 'care', isShort: true, flow: POSTURE, cooldownMin: 60 },
  { id: 'energy', cat: 'care', kind: 'choice', title: 'Energie-Check', look: 'care', isShort: true, flow: ENERGY, cooldownMin: 90 },
  { id: 'sip', cat: 'care', kind: 'steps', title: 'Achtsamer Schluck', look: 'care', isShort: true, steps: sip },
  { id: 'compassion', cat: 'care', kind: 'steps', title: 'Selbstmitgefühl', look: 'care', steps: compassion },

  // Kreativität
  { id: 'sixwords', cat: 'create', kind: 'write', title: 'Sechs-Wort-Geschichte', look: 'create', write: sixWords },
  { id: 'nameit', cat: 'create', kind: 'write', title: 'Namen erfinden', look: 'create', isShort: true, write: nameIt },
  { id: 'whatif', cat: 'create', kind: 'write', title: 'Was wäre, wenn …?', look: 'create', isShort: true, write: whatIf },
  { id: 'metaphor', cat: 'create', kind: 'write', title: 'In Bildern', look: 'create', isShort: true, write: metaphor },
  { id: 'acrostic', cat: 'create', kind: 'write', title: 'Buchstaben-Satz', look: 'create', write: acrostic },
  { id: 'assoc', cat: 'create', kind: 'write', title: 'Gedankensprünge', look: 'create', isShort: true, write: association },
  { id: 'doodle', cat: 'create', kind: 'steps', title: 'Mini-Kritzelei', look: 'create', steps: () => doodle() },

  // Neugier & Wissen
  { id: 'aifact', cat: 'learn', kind: 'fact', title: 'KI-Fun-Fact', look: 'learn', isShort: true, fact: () => pickNew([...AI_FACTS, ...EXTRA.aiFacts], f => f.text) },
  { id: 'aitip', cat: 'learn', kind: 'fact', title: 'Claude-Tipp', look: 'learn', isShort: true, fact: () => pickNew([...CLAUDE_TIPS.filter(t => t.source !== 'Claude-Code-Tipp'), ...AI_TIPS, ...EXTRA.aiTips.filter(t => t.source !== 'Claude-Code-Tipp')], f => f.text) },
  { id: 'cctip', cat: 'learn', kind: 'fact', title: 'Claude-Code-Tipp', look: 'learn', isShort: true, fact: () => pickNew([...CLAUDE_TIPS, ...EXTRA.aiTips].filter(t => t.source === 'Claude-Code-Tipp'), f => f.text) },
  { id: 'glossar', cat: 'learn', kind: 'fact', title: 'KI-Begriff erklärt', look: 'learn', isShort: true, fact: () => pickNew(GLOSSARY, f => f.text) },
  { id: 'funfact', cat: 'learn', kind: 'fact', title: 'Wusstest du …?', look: 'learn', isShort: true, fact: () => pickNew([...FUN_FACTS, ...EXTRA.funFacts], f => f.text) },
  { id: 'word', cat: 'learn', kind: 'fact', title: 'Schönes Wort', look: 'learn', isShort: true, fact: () => pickNew([...RARE_WORDS, ...EXTRA.words], f => f.text) },
  { id: 'truefalse', cat: 'learn', kind: 'pick', title: 'Wahr oder falsch?', look: 'learn', rounds: trueFalse },

  // Verbindung
  { id: 'connect', cat: 'connect', kind: 'write', title: 'Verbindung', look: 'connect', isShort: true, write: () => pick([...CONNECT_WRITES.map(f => f()), ...extraConnect()]) },
  { id: 'memory', cat: 'connect', kind: 'steps', title: 'Menschen im Herzen', look: 'connect', steps: () => connectMoment() },

  // Mikro-Ordnung
  { id: 'tidy', cat: 'tidy', kind: 'task', title: 'Mini-Ordnung', look: 'tidy', isShort: true },

  // Neu in Version 10
  { id: 'capital', cat: 'puzzle', kind: 'quiz', title: 'Hauptstädte', look: 'puzzle', quiz: capitalQuiz },
  { id: 'opposite', cat: 'play', kind: 'quiz', title: 'Gegenteile', look: 'play', isShort: true, quiz: oppositeQuiz },
  { id: 'saying', cat: 'puzzle', kind: 'quiz', title: 'Sprichwort-Ende', look: 'puzzle', isShort: true, quiz: sayingQuiz },
  { id: 'emoji', cat: 'play', kind: 'quiz', title: 'Emoji-Wörter', look: 'play', isShort: true, quiz: emojiQuiz },
  { id: 'clock', cat: 'brain', kind: 'quiz', title: 'Uhrzeit-Rechnen', look: 'brain', quiz: clockQuiz },
  { id: 'weekday', cat: 'brain', kind: 'quiz', title: 'Wochentag-Sprung', look: 'brain', isShort: true, quiz: weekdayQuiz },
  { id: 'palming', cat: 'body', kind: 'steps', title: 'Augen ausruhen', look: 'body', steps: palming },
  { id: 'shake', cat: 'body', kind: 'steps', title: 'Ausschütteln', look: 'body', isShort: true, steps: shakeOut },
  { id: 'stretch', cat: 'body', kind: 'steps', title: 'Schreibtisch-Dehnen', look: 'body', steps: deskStretch },
  { id: 'soundmap', cat: 'senses', kind: 'steps', title: 'Geräusch-Landkarte', look: 'senses', steps: soundMap },
  { id: 'thankbody', cat: 'mind', kind: 'steps', title: 'Danke, Körper', look: 'mind', steps: thankBody },
  { id: 'grounding', cat: 'mind', kind: 'steps', title: 'Erden', look: 'mind', isShort: true, steps: grounding },
  { id: 'smile', cat: 'mind', kind: 'steps', title: 'Inneres Lächeln', look: 'mind', steps: innerSmile },
  { id: 'butterfly', cat: 'mind', kind: 'steps', title: 'Schmetterlings-Umarmung', look: 'mind', steps: butterflyHug },
  { id: 'journal', cat: 'reflect', kind: 'write', title: 'Ein Satz für dich', look: 'note', isShort: true, write: journal },
  { id: 'createmix', cat: 'create', kind: 'write', title: 'Kreativ-Funke', look: 'create', isShort: true, write: createMix },

  // Nicht in der normalen Auswahl: kommt nach etwa 3 Minuten Wartezeit einmal.
  {
    id: 'realbreak', cat: 'care', kind: 'steps', title: 'Echte Pause', look: 'care', isSpecial: true,
    steps: () => [
      { text: 'Du wartest schon ein paar Minuten. Zeit für eine echte Pause.', sec: 8 },
      { text: pick(['Steh auf und streck dich einmal ganz lang.', 'Hol dir ein Glas Wasser.', 'Geh ans Fenster und schau in die Ferne.', 'Geh ein paar Schritte durch den Raum.']), sec: 20 },
      { text: 'Du musst nicht nachsehen: Ein sanfter Ton sagt dir, wenn Claude fertig ist.', sec: 60 },
    ],
  },

  // Was die wöchentliche Routine dazugeschrieben hat
  ...EXTRA_EXERCISES,
]

/** In der ersten Woche nach `addedAt` gilt eine Übung als neu. */
export const isNew = (ex: Exercise, now: number) =>
  ex.addedAt !== undefined && now - Date.parse(ex.addedAt) < 7 * 86400000

function stroopRounds(): PickRound[] {
  return Array.from({ length: 4 }, () => {
    const word = pick(STROOP)
    const ink = pick(STROOP.filter(c => c.name !== word.name))
    return {
      big: word.name.toUpperCase(),
      ink: ink.ink,
      sub: 'Welche Farbe hat die Schrift?',
      options: STROOP.map(c => c.name),
      answer: ink.name,
      why: 'Die Schriftfarbe zu nennen statt das Wort zu lesen, trainiert die Aufmerksamkeitssteuerung.',
    }
  })
}

function oddRounds(): PickRound[] {
  return pickNewMany([...ODD, ...EXTRA.odd], 2, set => set.words.join('|'))
    .map(set => ({
      big: '?',
      ink: '',
      sub: 'Was passt nicht dazu?',
      options: shuffle(set.words),
      answer: set.odd,
      why: `${set.odd}: ${set.why}`,
    }))
}

export const SEQ_SHAPES = [
  { id: 'circle', color: '#7FE3C4', label: '● Kreis' },
  { id: 'square', color: '#B9A7FF', label: '■ Quadrat' },
  { id: 'triangle', color: '#FFB38A', label: '▲ Dreieck' },
  { id: 'diamond', color: '#FFE07A', label: '◆ Raute' },
]

export const byId = (id: string): Exercise =>
  EXERCISES.find(ex => ex.id === id) ?? EXERCISES[0]

// Zeiten der Denkspiele, in Sekunden.
export const GAME = {
  wordsShow: 12,
  digitsShow: 5,
  gridShow: 10,
  mathStep: 4,
  ask: 40,
  result: 6,
  choiceResult: 10,
  seqStep: 1,
  quizHint: 20,
}

/** Dauer einer Übung, wie sie für diesen Durchgang erzeugt wurde. */
export const durationOf = (
  ex: Exercise,
  run: { steps: Step[]; pattern: Phase[]; rounds: number; data: string[] },
): number => {
  if (ex.kind === 'fact') return Math.round(9 + (run.data[0] ?? '').length / 14)
  if (ex.kind === 'breathe') return run.pattern.reduce((n, p) => n + p.sec, 0) * run.rounds
  if (ex.kind === 'steps') return run.steps.reduce((n, s) => n + s.sec, 0)
  if (ex.kind === 'note') return ex.sec
  return 0
}

/**
 * Wie wahrscheinlich jede Familie gerade drankommt: morgens eher aktivierend,
 * nachmittags eher beruhigend. Die Reihenfolge selbst ist jedes Mal neu.
 */
export const catWeights = (hour: number): Record<Cat, number> => {
  const base = { create: 3, learn: 3, connect: 2.5, tidy: 2 }
  if (hour < 12) return { ...base, brain: 3, body: 3, play: 3, puzzle: 3, reflect: 2, calm: 1.5, senses: 1.5, mind: 1.5, care: 2 }
  if (hour < 14) return { ...base, calm: 2.5, brain: 2, senses: 2, reflect: 2, play: 2, body: 2, puzzle: 2, mind: 2, care: 2.5 }
  return { ...base, calm: 3, senses: 3, body: 2.5, mind: 3, reflect: 2, care: 2.5, play: 2, puzzle: 2, brain: 1.5 }
}

// --- Stoff für die Spiele -------------------------------------------------

const WORDS = [
  'Apfel', 'Brücke', 'Wolke', 'Kerze', 'Schlüssel', 'Fenster', 'Garten', 'Tiger', 'Löffel', 'Insel',
  'Trommel', 'Spiegel', 'Laterne', 'Feder', 'Muschel', 'Kompass', 'Zitrone', 'Leiter', 'Koffer', 'Mond',
  'Teppich', 'Rakete', 'Gitarre', 'Ballon', 'Anker', 'Pinsel', 'Igel', 'Kaktus', 'Schirm', 'Uhr',
  'Wald', 'Krone', 'Hafen', 'Biene', 'Kissen', 'Taschenlampe', 'Brezel', 'Vulkan', 'Glocke', 'Fahrrad',
]

const ANAGRAMS = [
  'FOKUS', 'RUHIG', 'GARTEN', 'KAFFEE', 'SOMMER', 'WOLKE', 'LACHEN', 'STILLE', 'BLUME', 'FREUDE',
  'MORGEN', 'KERZE', 'INSEL', 'WINTER', 'APFEL', 'TIGER', 'FEDER', 'LAMPE', 'BRIEF', 'SONNE',
  'KOMPASS', 'MUSIK', 'PAUSE', 'ATMEN', 'HIMMEL', 'NEUGIER', 'ZUKUNFT', 'GEDULD', 'MUTIG', 'KLARHEIT',
]

const PREFIXES = ['Sch', 'Bl', 'Kr', 'Tr', 'St', 'Fl', 'Gr', 'Sp', 'Br', 'Pf', 'Kl', 'Wa', 'Mo', 'Ha']

export const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const
export const COLORS = ['#7FE3C4', '#B9A7FF', '#FFB38A', '#FFE07A'] as const

export type Made = { data: string[]; solution: string }

const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')

/** Neuer Stoff für ein Spiel. `level` ist die Länge der Ziffernfolge. */
export const make = (ex: Exercise, level: number, seqLen = 4): Made => {
  switch (ex.kind) {
    case 'write': {
      const w = ex.write()
      return { data: [w.q, w.reply, w.check, w.word], solution: '' }
    }
    case 'fact': {
      const f = ex.fact()
      return { data: [f.text, f.source], solution: '' }
    }
    case 'task':
      return { data: [randomTask()], solution: '' }
    case 'quiz': {
      const q = ex.quiz()
      return { data: [q.pre ?? '', q.q, q.show, q.hint, String(q.preSec ?? 0)], solution: q.accept.join('|') }
    }
    case 'blitz':
      return { data: [pickNew([...BLITZ, ...EXTRA.blitz], x => x)], solution: '' }
    case 'pick':
      return { data: ex.rounds().map(r => JSON.stringify(r)), solution: '' }
    case 'sequence': {
      const ids = Array.from({ length: seqLen }, () => pick(SEQ_SHAPES).id)
      return { data: ids, solution: ids.join(' ') }
    }
    case 'words': {
      const words = shuffle(WORDS).slice(0, 5)
      return { data: words, solution: words.join(' ') }
    }
    case 'digits': {
      const digits = Array.from({ length: level }, () => String(Math.floor(Math.random() * 10)))
      return { data: digits, solution: [...digits].reverse().join('') }
    }
    case 'grid': {
      const cells = Array.from({ length: 9 }, () => `${pick(SHAPES)}|${pick(COLORS)}`)
      const at = Math.floor(Math.random() * 9)
      const [shape, color] = cells[at].split('|')
      const changed = [...cells]
      changed[at] =
        Math.random() < 0.5
          ? `${pick(SHAPES.filter(s => s !== shape))}|${color}`
          : `${shape}|${pick(COLORS.filter(c => c !== color))}`
      return { data: [...cells, ...changed], solution: String(at + 1) }
    }
    case 'prefix': {
      const p = pick(PREFIXES)
      return { data: [p], solution: p }
    }
    case 'math': {
      let n = 3 + Math.floor(Math.random() * 15)
      const chain = [String(n)]
      for (let i = 0; i < 4; i++) {
        const op = pick(n <= 40 ? ['+', '−', '×'] : ['+', '−'])
        if (op === '+') {
          const k = 2 + Math.floor(Math.random() * 9)
          n += k
          chain.push(`+ ${k}`)
        } else if (op === '−') {
          const k = 1 + Math.floor(Math.random() * Math.min(9, n - 1))
          n -= k
          chain.push(`− ${k}`)
        } else {
          n *= 2
          chain.push('× 2')
        }
      }
      return { data: chain, solution: String(n) }
    }
    case 'anagram': {
      const word = pickNew([...ANAGRAMS, ...EXTRA.anagrams], x => x)
      let mixed = word
      for (let i = 0; i < 10 && mixed === word; i++) mixed = shuffle(word.split('')).join('')
      return { data: [mixed], solution: word }
    }
    default:
      return { data: [], solution: '' }
  }
}

export type Verdict = { isGood: boolean; headline: string; detail: string }

/** Wertet eine Antwort aus: freundlich, ohne Punkte. */
export const judge = (ex: Exercise, made: Made, answer: string): Verdict => {
  switch (ex.kind) {
    case 'quiz': {
      // Genau getroffen, oder (bei längeren Antworten) mit ein paar Wörtern drumherum.
      const given = norm(answer)
      const ok = made.solution.split('|').some(a => {
        const want = norm(a)
        return want !== '' && (given === want || (want.length >= 5 && given.includes(want)))
      })
      return { isGood: ok, headline: ok ? 'Richtig!' : 'Auflösung', detail: made.data[2] ?? '' }
    }
    case 'blitz': {
      const words = [...new Set(answer.split(/[,;\n]+|\s+/).map(w => w.trim()).filter(w => w.length > 1))]
      return {
        isGood: words.length >= 5,
        headline: words.length >= 5 ? `${words.length} gefunden – stark!` : `${words.length} gefunden`,
        detail: words.length > 0 ? words.join(' · ') : 'Nächstes Mal sprudelt es bestimmt.',
      }
    }
    case 'words': {
      const given = answer.split(/[\s,;]+/).map(norm).filter(Boolean)
      const hit = made.data.filter(w => given.includes(norm(w)))
      const missing = made.data.filter(w => !given.includes(norm(w)))
      return {
        isGood: hit.length >= 4,
        headline: hit.length === 5 ? 'Alle 5 – stark!' : `${hit.length} von 5`,
        detail: missing.length === 0 ? made.data.join(' · ') : `Gefehlt: ${missing.join(', ')}`,
      }
    }
    case 'digits': {
      const ok = answer.replace(/\D/g, '') === made.solution
      return {
        isGood: ok,
        headline: ok ? 'Richtig!' : 'Fast',
        detail: ok
          ? `Nächstes Mal ${made.data.length + 1} Ziffern`
          : `Rückwärts war es ${made.solution.split('').join(' ')}`,
      }
    }
    case 'grid': {
      const ok = answer === made.solution
      return {
        isGood: ok,
        headline: ok ? 'Genau das!' : 'Knapp daneben',
        detail: `Verändert hat sich Feld ${made.solution}`,
      }
    }
    case 'prefix': {
      const p = norm(made.solution)
      const words = [...new Set(answer.split(/[\s,;]+/).map(w => w.trim()).filter(w => norm(w).startsWith(p) && norm(w).length > p.length))]
      return {
        isGood: words.length >= 3,
        headline: words.length >= 3 ? `${words.length} Wörter – super!` : `${words.length} gefunden`,
        detail: words.length > 0 ? words.join(' · ') : `Zum Beispiel: ${made.solution}…`,
      }
    }
    case 'math': {
      const ok = answer.replace(/\s/g, '') === made.solution
      return {
        isGood: ok,
        headline: ok ? 'Richtig gerechnet!' : 'Nicht ganz',
        detail: `${made.data.join(' ')} = ${made.solution}`,
      }
    }
    case 'anagram': {
      const ok = norm(answer) === norm(made.solution)
      return {
        isGood: ok,
        headline: ok ? 'Gelöst!' : 'Auflösung',
        detail: made.solution,
      }
    }
    default:
      return { isGood: true, headline: '', detail: '' }
  }
}

/** Was das Spiel in der Frage-Phase fragt. */
export const questionOf = (ex: Exercise, made: Made): string => {
  switch (ex.kind) {
    case 'quiz': return made.data[1] ?? ''
    case 'blitz': return `Nenne so viele ${made.data[0] ?? ''} wie möglich – mindestens 5.`
    case 'words': return 'Welche 5 Wörter waren es?'
    case 'digits': return 'Tippe die Ziffern rückwärts ein.'
    case 'grid': return 'Welches Feld hat sich verändert?'
    case 'prefix': return `Schreib 3 Wörter, die mit „${made.solution}“ beginnen.`
    case 'math': return 'Und? Was kommt raus?'
    case 'anagram': return `Welches Wort steckt in ${made.data[0]}?`
    default: return ''
  }
}

/** Wie lange das Spiel seinen Stoff zeigt, bevor es fragt. */
export const showSecOf = (ex: Exercise, made: Made): number => {
  switch (ex.kind) {
    case 'words': return GAME.wordsShow
    case 'digits': return GAME.digitsShow
    case 'grid': return GAME.gridShow
    case 'math': return GAME.mathStep * made.data.length
    case 'quiz': return Number(made.data[4] ?? 0) || 0
    case 'sequence': return made.data.length * GAME.seqStep + 1
    default: return 0
  }
}

export const isGame = (ex: Exercise) =>
  ex.kind === 'words' || ex.kind === 'digits' || ex.kind === 'grid' ||
  ex.kind === 'prefix' || ex.kind === 'math' || ex.kind === 'anagram' ||
  ex.kind === 'quiz' || ex.kind === 'blitz' || ex.kind === 'pick' || ex.kind === 'sequence'

// --- Einstellungen & Auswahlhilfen ------------------------------------------

/** Die vier Gruppen, die man in den Einstellungen an- und ausschaltet. */
export type Group = 'play' | 'mind' | 'learn' | 'create'

export const GROUPS: { id: Group; label: string; hint: string; cats: Cat[] }[] = [
  { id: 'play', label: '🧩 Rätsel & Spiele', hint: 'Knobeln, Wortspiele, Gedächtnis, Kopfrechnen', cats: ['puzzle', 'play', 'brain'] },
  { id: 'mind', label: '🌿 Achtsamkeit & Körper', hint: 'Atmen, Bewegen, Wahrnehmen, Check-ins, Mini-Ordnung', cats: ['calm', 'mind', 'body', 'senses', 'care', 'tidy'] },
  { id: 'learn', label: '💡 Wissen & Claude-Tipps', hint: 'Tipps für Claude, KI-Fakten, Fun Facts, schöne Wörter', cats: ['learn'] },
  { id: 'create', label: '✍️ Kreativ & Reflexion', hint: 'Schreibimpulse, Menschen, nächster Schritt', cats: ['create', 'reflect', 'connect'] },
]

export const groupOf = (cat: Cat): Group => GROUPS.find(g => g.cats.includes(cat))?.id ?? 'mind'

/** Die Familien, wie sie in den Einstellungen heißen. */
export const FAMILIES: { cat: Cat; label: string }[] = [
  { cat: 'calm', label: '🌬️ Atmung' },
  { cat: 'mind', label: '🧘 Achtsamkeit' },
  { cat: 'body', label: '🤸 Körper & Bewegung' },
  { cat: 'senses', label: '👁️ Wahrnehmung' },
  { cat: 'care', label: '💗 Wohlbefinden & Check-ins' },
  { cat: 'reflect', label: '✍️ Reflexion & Notizen' },
  { cat: 'connect', label: '💬 Verbindung' },
  { cat: 'create', label: '🎨 Kreativität' },
  { cat: 'learn', label: '🔍 Wissen & KI-News' },
  { cat: 'tidy', label: '🧹 Mini-Ordnung' },
  { cat: 'brain', label: '🧠 Gedächtnis-Spiele' },
  { cat: 'play', label: '🎲 Denkspiele' },
  { cat: 'puzzle', label: '🧩 Knobeln & Worträtsel' },
]

/** Was den Kopf eher anregt als beruhigt: in einer Pause nur in Maßen. */
export const STIMULATING: readonly Cat[] = ['brain', 'play', 'puzzle']

/** Im Modus „Ruhig“ nur diese Familien. */
export const CALM_ONLY: readonly Cat[] = ['calm', 'mind', 'body', 'senses', 'care', 'reflect', 'connect', 'tidy']

/** Ungefähre Dauer einer Übung in Sekunden, für die Wahl nach Wartezeit. */
export const estimateSec = (ex: Exercise): number => {
  switch (ex.kind) {
    case 'breathe': return 60
    case 'steps': return ex.isShort ? 30 : 65
    case 'note': return 50
    case 'write': return 45
    case 'fact': return 15
    case 'task': return 20
    case 'choice': return 25
    case 'pick': return 30
    case 'sequence': return 30
    case 'digits': return 30
    default: return 45
  }
}
