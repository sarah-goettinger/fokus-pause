// Stoff für Knobelrätsel, Spiele und Wohlbefinden. Reine Daten und kleine
// Generatoren, ohne Abhängigkeit von der restlichen Logik.

export const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]
export const shuffle = <T,>(list: readonly T[]): T[] => {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// --- Ungesehenes zuerst ------------------------------------------------------
// Vor dem Erzeugen einer Übung setzt das Panel, was schon gezeigt wurde;
// pickNew wählt dann bevorzugt Ungesehenes und merkt sich, was es gewählt hat.
const ctx = { avoid: new Set<string>(), picked: [] as string[] }

export const beginPick = (avoid: readonly string[]) => {
  ctx.avoid = new Set(avoid)
  ctx.picked = []
}

export const pickedKeys = (): string[] => [...ctx.picked]

export const pickNew = <T,>(list: readonly T[], keyOf: (x: T) => string): T => {
  const fresh = list.filter(x => !ctx.avoid.has(keyOf(x)))
  const x = pick(fresh.length > 0 ? fresh : list)
  ctx.picked.push(keyOf(x))
  return x
}

/** Mehrere verschiedene, Ungesehenes zuerst. */
export const pickNewMany = <T,>(list: readonly T[], n: number, keyOf: (x: T) => string): T[] => {
  const fresh = shuffle(list.filter(x => !ctx.avoid.has(keyOf(x))))
  const rest = shuffle(list.filter(x => ctx.avoid.has(keyOf(x))))
  const out = [...fresh, ...rest].slice(0, n)
  for (const x of out) ctx.picked.push(keyOf(x))
  return out
}

/** Ein Rätsel: Frage, akzeptierte Antworten, Auflösung, Tipp. */
export type Quiz = { q: string; accept: string[]; show: string; hint: string; pre?: string; preSec?: number }

// --- Knobeln ----------------------------------------------------------------

export const RIDDLES: Quiz[] = [
  { q: 'Was wird nasser, je mehr es trocknet?', accept: ['handtuch', 'tuch'], show: 'Ein Handtuch', hint: 'Du benutzt es nach dem Duschen.' },
  { q: 'Was hat Zähne, beißt aber nie?', accept: ['kamm', 'saege', 'reissverschluss', 'zahnrad'], show: 'Ein Kamm (oder eine Säge, ein Reißverschluss …)', hint: 'Liegt oft im Bad.' },
  { q: 'Je mehr du davon wegnimmst, desto größer wird es. Was ist es?', accept: ['loch'], show: 'Ein Loch', hint: 'Man gräbt es.' },
  { q: 'Was hat einen Hals, aber keinen Kopf?', accept: ['flasche', 'vase', 'pullover'], show: 'Eine Flasche', hint: 'Man trinkt daraus.' },
  { q: 'Was kann man brechen, ohne es zu berühren?', accept: ['versprechen', 'schweigen', 'rekord', 'herz', 'wort'], show: 'Ein Versprechen (oder das Schweigen)', hint: 'Man gibt es jemandem.' },
  { q: 'Was gehört dir, wird aber von anderen viel öfter benutzt als von dir?', accept: ['name', 'meinname', 'dername'], show: 'Dein Name', hint: 'Man ruft dich damit.' },
  { q: 'Was hat Augen, kann aber nicht sehen?', accept: ['kartoffel', 'wuerfel', 'nadel', 'sturm', 'hurrikan'], show: 'Eine Kartoffel (oder ein Würfel)', hint: 'Wächst unter der Erde.' },
  { q: 'Ich habe Städte, aber keine Häuser, Wälder, aber keine Bäume. Was bin ich?', accept: ['karte', 'landkarte', 'stadtplan', 'atlas'], show: 'Eine Landkarte', hint: 'Man braucht mich zur Orientierung.' },
  { q: 'Was geht hoch und runter, bewegt sich aber nicht?', accept: ['treppe', 'treppen', 'temperatur', 'strasse'], show: 'Eine Treppe', hint: 'Man steigt darauf.' },
  { q: 'Leichter als eine Feder – und doch kann es niemand lange halten. Was ist es?', accept: ['atem', 'luft', 'atemzug'], show: 'Der Atem', hint: 'Du tust es gerade.' },
  { q: 'Wie viele Monate haben 28 Tage?', accept: ['alle', '12', 'zwoelf', 'allezwoelf'], show: 'Alle zwölf', hint: 'Nicht nur der Februar …' },
  { q: 'Was kommt einmal in jeder Minute vor, zweimal in jedem Moment, aber nie in tausend Jahren?', accept: ['m', 'buchstabem', 'derbuchstabem'], show: 'Der Buchstabe M', hint: 'Schau dir die Wörter genau an.' },
  { q: 'Was hat ein Bett, schläft aber nie?', accept: ['fluss', 'bach', 'strom'], show: 'Ein Fluss', hint: 'Es fließt.' },
  { q: 'Was hat Tasten, öffnet aber keine Tür?', accept: ['klavier', 'tastatur', 'keyboard', 'piano', 'telefon'], show: 'Ein Klavier (oder eine Tastatur)', hint: 'Man kann darauf spielen.' },
  { q: 'Was wird kürzer, je länger es brennt?', accept: ['kerze', 'streichholz', 'zuendschnur'], show: 'Eine Kerze', hint: 'Steht oft auf dem Tisch.' },
  { q: 'Was hat ein Gesicht und zwei Hände, aber keine Arme?', accept: ['uhr', 'wanduhr', 'armbanduhr'], show: 'Eine Uhr', hint: 'Sie zeigt dir etwas an.' },
  { q: 'Was ist immer vor dir, aber du kannst es nie sehen?', accept: ['zukunft', 'diezukunft'], show: 'Die Zukunft', hint: 'Es geht um Zeit.' },
  { q: 'Was wird größer, je mehr man es teilt?', accept: ['freude', 'glueck', 'liebe', 'wissen'], show: 'Freude (oder Wissen)', hint: 'Ein Gefühl.' },
]

export const REMOTE: Quiz[] = [
  { q: 'Schnee · Fuß · Spiel', accept: ['ball'], show: 'Ball (Schneeball, Fußball, Spielball)', hint: 'Es ist rund.' },
  { q: 'Haus · Tür · Auto', accept: ['schluessel'], show: 'Schlüssel', hint: 'Es klimpert in der Tasche.' },
  { q: 'Zahn · Haar · Schuh', accept: ['buerste'], show: 'Bürste', hint: 'Hat Borsten.' },
  { q: 'Sonnen · Regen · Fall', accept: ['schirm'], show: 'Schirm', hint: 'Schützt dich.' },
  { q: 'Tisch · Bett · Woll', accept: ['decke'], show: 'Decke', hint: 'Liegt oben drauf.' },
  { q: 'Brief · Brot · Feder', accept: ['tasche'], show: 'Tasche', hint: 'Man trägt etwas darin.' },
  { q: 'Kinder · Bilder · Koch', accept: ['buch'], show: 'Buch', hint: 'Hat Seiten.' },
  { q: 'Grab · Edel · Back', accept: ['stein'], show: 'Stein', hint: 'Ist hart.' },
  { q: 'Mond · Sonnen · Tages', accept: ['licht'], show: 'Licht', hint: 'Macht hell.' },
  { q: 'Feuer · Hand · Kunst', accept: ['werk'], show: 'Werk', hint: 'Etwas Gemachtes.' },
  { q: 'Arm · Hals · Stirn', accept: ['band'], show: 'Band', hint: 'Man kann es binden.' },
  { q: 'Blumen · Kräuter · Rosen', accept: ['garten', 'beet'], show: 'Garten', hint: 'Draußen, grün.' },
  { q: 'Winter · Mittags · Halb', accept: ['schlaf'], show: 'Schlaf', hint: 'Augen zu.' },
  { q: 'Kaffee · Tee · Gieß', accept: ['kanne'], show: 'Kanne', hint: 'Hat einen Henkel und einen Ausguss.' },
  { q: 'Apfel · Orangen · Tomaten', accept: ['saft'], show: 'Saft', hint: 'Man trinkt es.' },
  { q: 'Tanz · Musik · Kunst', accept: ['schule', 'stueck'], show: 'Schule (oder Stück)', hint: 'Dort lernt man.' },
]

export const TEEKESSEL: Quiz[] = [
  { q: 'Man sitzt darauf im Park – und bringt sein Geld dorthin.', accept: ['bank'], show: 'Bank', hint: 'Vier Buchstaben.' },
  { q: 'Man isst sie als Obst – und schraubt sie in die Lampe.', accept: ['birne', 'gluehbirne'], show: 'Birne', hint: 'Fünf Buchstaben.' },
  { q: 'Ein großer Vogel – und ein Bund Blumen.', accept: ['strauss'], show: 'Strauß', hint: 'Fängt mit S an.' },
  { q: 'Ein Nadelbaum – und ein Knochen im Gesicht.', accept: ['kiefer'], show: 'Kiefer', hint: 'Du kaust damit.' },
  { q: 'Ein weißes Pferd – und ein Belag auf altem Brot.', accept: ['schimmel'], show: 'Schimmel', hint: 'Fängt mit Sch an.' },
  { q: 'Ein Insekt, das sticht – und etwas, das ein Auto stoppt.', accept: ['bremse'], show: 'Bremse', hint: 'Ein Pedal im Auto.' },
  { q: 'Ein männliches Huhn – und das, was man am Waschbecken aufdreht.', accept: ['hahn', 'wasserhahn'], show: 'Hahn', hint: 'Kräht morgens.' },
  { q: 'Man steigt auf ihr hoch – und sie führt ein Team.', accept: ['leiter', 'leiterin'], show: 'Leiter', hint: 'Hat Sprossen.' },
  { q: 'Ein Gebäude für Könige – und das, was die Tür verschließt.', accept: ['schloss'], show: 'Schloss', hint: 'Man braucht einen Schlüssel.' },
  { q: 'Ein kleines Nagetier – und ein Gerät am Computer.', accept: ['maus'], show: 'Maus', hint: 'Klick!' },
  { q: 'Ein festliches Tanzfest – und etwas Rundes zum Spielen.', accept: ['ball'], show: 'Ball', hint: 'Cinderella war dort.' },
  { q: 'Ein Teil vom Baum – und ein Zweig der Familie.', accept: ['ast', 'zweig', 'stamm'], show: 'Stamm (Baumstamm, Familienstamm)', hint: 'Der dicke Teil.' },
]

export const SERIES: Quiz[] = [
  { q: '2 · 4 · 8 · 16 · ?', accept: ['32'], show: '32 (jeweils verdoppelt)', hint: 'Mal …' },
  { q: '1 · 1 · 2 · 3 · 5 · 8 · ?', accept: ['13'], show: '13 (die zwei davor zusammen)', hint: 'Addiere die letzten beiden.' },
  { q: '1 · 4 · 9 · 16 · ?', accept: ['25'], show: '25 (Quadratzahlen)', hint: '1×1, 2×2, …' },
  { q: '100 · 90 · 81 · 73 · ?', accept: ['66'], show: '66 (−10, −9, −8, −7)', hint: 'Die Abstände werden kleiner.' },
  { q: '2 · 3 · 5 · 7 · 11 · ?', accept: ['13'], show: '13 (Primzahlen)', hint: 'Nur durch 1 und sich selbst teilbar.' },
  { q: '1 · 3 · 7 · 15 · ?', accept: ['31'], show: '31 (verdoppeln, plus 1)', hint: 'Mal 2 und …' },
  { q: '5 · 10 · 9 · 18 · 17 · ?', accept: ['34'], show: '34 (×2, −1, ×2, −1 …)', hint: 'Zwei Rechenschritte im Wechsel.' },
  { q: '1 · 2 · 4 · 7 · 11 · ?', accept: ['16'], show: '16 (+1, +2, +3, +4, +5)', hint: 'Schau auf die Abstände.' },
  { q: '81 · 27 · 9 · 3 · ?', accept: ['1'], show: '1 (jeweils durch 3)', hint: 'Teilen …' },
  { q: '3 · 6 · 12 · 24 · ?', accept: ['48'], show: '48 (verdoppelt)', hint: 'Mal …' },
  { q: '64 · 32 · 16 · 8 · ?', accept: ['4'], show: '4 (halbiert)', hint: 'Durch …' },
  { q: '2 · 6 · 12 · 20 · 30 · ?', accept: ['42'], show: '42 (+4, +6, +8, +10, +12)', hint: 'Die Abstände wachsen um 2.' },
]

const NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Ella', 'Finn', 'Greta', 'Hugo', 'Ida', 'Jonas', 'Lena', 'Mats']

export const LOGIC: (() => Quiz)[] = [
  () => {
    const [a, b, c] = shuffle(NAMES).slice(0, 3)
    const isSmall = Math.random() < 0.5
    return {
      q: `${a} ist größer als ${b}. ${b} ist größer als ${c}. Wer ist am ${isSmall ? 'kleinsten' : 'größten'}?`,
      accept: [isSmall ? c.toLowerCase() : a.toLowerCase()],
      show: isSmall ? c : a,
      hint: 'Stell sie dir in einer Reihe vor.',
    }
  },
  () => {
    const [a, b, c] = shuffle(NAMES).slice(0, 3)
    return {
      q: `${a} ist älter als ${b}, aber jünger als ${c}. Wer ist in der Mitte?`,
      accept: [a.toLowerCase()],
      show: a,
      hint: 'Ordne nach Alter.',
    }
  },
  () => ({ q: '3 Katzen fangen 3 Mäuse in 3 Minuten. Wie lange brauchen 100 Katzen für 100 Mäuse?', accept: ['3', '3minuten', 'drei', 'dreiminuten'], show: '3 Minuten', hint: 'Jede Katze fängt eine Maus …' }),
  () => ({ q: 'Ein Schläger und ein Ball kosten zusammen 1,10 €. Der Schläger kostet 1 € mehr als der Ball. Was kostet der Ball?', accept: ['5', '5cent', '005', '005euro', '5ct', 'fuenfcent'], show: '5 Cent (nicht 10!)', hint: 'Prüf deine erste Antwort nach.' }),
  () => ({ q: 'Seerosen verdoppeln sich jeden Tag. Nach 48 Tagen ist der See voll. An welchem Tag war er halb voll?', accept: ['47', 'tag47', 'am47'], show: 'Tag 47', hint: 'Denk einen Tag zurück.' }),
  () => ({ q: 'Du überholst im Rennen die Person auf Platz 2. Auf welchem Platz bist du jetzt?', accept: ['2', 'zwei', 'zweiter', 'platz2', 'zweite'], show: 'Platz 2 (nicht 1!)', hint: 'Du nimmst ihren Platz ein.' }),
  () => ({ q: 'Ein Ziegelstein wiegt 1 kg plus einen halben Ziegelstein. Wie schwer ist er?', accept: ['2', '2kg', 'zwei', 'zweikilo', '2kilo'], show: '2 kg', hint: 'Der halbe Stein wiegt 1 kg.' }),
  () => ({ q: 'Wie oft kann man 5 von 25 abziehen?', accept: ['1', 'einmal', 'eins', '1mal'], show: 'Einmal – danach ist es 20 😉', hint: 'Ganz wörtlich nehmen.' }),
  () => ({ q: 'Ein Bauer hat 17 Schafe. Alle bis auf 9 laufen weg. Wie viele bleiben?', accept: ['9', 'neun'], show: '9', hint: '„Alle bis auf …“' }),
  () => ({ q: 'Wie viele Tiere jeder Art nahm Mose mit auf die Arche?', accept: ['0', 'keine', 'null', 'keins', 'garkeine'], show: 'Keine – das war Noah 😄', hint: 'Wer war mit der Arche unterwegs?' }),
]

export const SORT_WORDS = ['Mond', 'Apfel', 'Tiger', 'Rose', 'Kanu', 'Insel', 'Zebra', 'Feder', 'Burg', 'Opal', 'Lampe', 'Hafen', 'Dose', 'Engel', 'Garten']

const SENTENCES = [
  'Der Regen tanzt leise auf dem Dach der alten Scheune.',
  'Heute ist ein guter Tag, um etwas Neues zu beginnen.',
  'Eine kleine Pause macht den Kopf wieder frei.',
  'Die Katze schläft gemütlich auf dem warmen Fensterbrett.',
  'Am Morgen riecht der Kaffee besonders gut.',
  'Wer langsam geht, sieht mehr vom Weg.',
  'Der Wind trägt den Duft von frischem Heu herüber.',
  'Gute Ideen entstehen oft beim Spazierengehen.',
]

/** Buchstaben zählen: ein Satz, nach dem er weg ist, die Frage nach einem Buchstaben. */
export const letterCount = (): Quiz => {
  const sentence = pick(SENTENCES)
  const letter = pick(['e', 'a', 'n', 'r', 't', 's'])
  const count = sentence.toLowerCase().split('').filter(ch => ch === letter).length
  return {
    pre: sentence,
    preSec: 8,
    q: `Wie oft kam der Buchstabe „${letter}“ im Satz vor?`,
    accept: [String(count)],
    show: `${count}× „${letter}“ – ${sentence}`,
    hint: 'Geh den Satz im Kopf Wort für Wort durch.',
  }
}

/** Kopf-Sortieren: Wörter merken, dann alphabetisch eintippen. */
export const sortWords = (): Quiz => {
  const words = shuffle(SORT_WORDS).slice(0, 4)
  const sorted = [...words].sort((a, b) => a.localeCompare(b, 'de'))
  return {
    pre: words.join(' · '),
    preSec: 10,
    q: 'Tipp die 4 Wörter alphabetisch sortiert ein.',
    accept: [sorted.join(' ')],
    show: sorted.join(' · '),
    hint: `Das erste beginnt mit „${sorted[0]?.[0] ?? ''}“.`,
  }
}

// --- Spiele -----------------------------------------------------------------

export const BLITZ = [
  'Obstsorten', 'Tiere mit vier Beinen', 'Städte in Deutschland', 'Dinge in einer Küche', 'Berufe',
  'Musikinstrumente', 'Dinge, die rot sind', 'Sportarten', 'Länder in Europa', 'Gemüsesorten',
  'Dinge am Strand', 'Wörter, die mit K beginnen', 'Dinge, die fliegen können', 'Getränke',
  'Dinge in einem Büro', 'Vornamen mit M', 'Blumen', 'Dinge, die man im Winter braucht',
]

export const STROOP = [
  { name: 'Rot', ink: '#FF7A7A' },
  { name: 'Blau', ink: '#7AB2FF' },
  { name: 'Grün', ink: '#74E08E' },
  { name: 'Gelb', ink: '#FFE07A' },
]

export type OddSet = { words: string[]; odd: string; why: string }
export const ODD: OddSet[] = [
  { words: ['Apfel', 'Birne', 'Kirsche', 'Karotte'], odd: 'Karotte', why: 'Gemüse, kein Obst' },
  { words: ['Hund', 'Katze', 'Adler', 'Pferd'], odd: 'Adler', why: 'ein Vogel, keine vier Beine' },
  { words: ['Berlin', 'Hamburg', 'Paris', 'München'], odd: 'Paris', why: 'nicht in Deutschland' },
  { words: ['Rot', 'Blau', 'Tisch', 'Grün'], odd: 'Tisch', why: 'keine Farbe' },
  { words: ['Montag', 'Juni', 'Freitag', 'Sonntag'], odd: 'Juni', why: 'ein Monat, kein Wochentag' },
  { words: ['Kreis', 'Quadrat', 'Würfel', 'Dreieck'], odd: 'Würfel', why: 'ein Körper, keine Fläche' },
  { words: ['Rose', 'Tulpe', 'Eiche', 'Nelke'], odd: 'Eiche', why: 'ein Baum, keine Blume' },
  { words: ['Gabel', 'Messer', 'Teller', 'Löffel'], odd: 'Teller', why: 'kein Besteck' },
  { words: ['Wal', 'Hai', 'Delfin', 'Robbe'], odd: 'Hai', why: 'ein Fisch, kein Säugetier' },
  { words: ['3', '5', '9', '7'], odd: '9', why: 'keine Primzahl' },
  { words: ['Merkur', 'Mars', 'Mond', 'Venus'], odd: 'Mond', why: 'kein Planet' },
  { words: ['Auge', 'Ohr', 'Nase', 'Knie'], odd: 'Knie', why: 'kein Sinnesorgan' },
  { words: ['Kupfer', 'Gold', 'Holz', 'Silber'], odd: 'Holz', why: 'kein Metall' },
  { words: ['Geige', 'Gitarre', 'Trommel', 'Harfe'], odd: 'Trommel', why: 'keine Saiten' },
  { words: ['Frühling', 'Sommer', 'Morgen', 'Herbst'], odd: 'Morgen', why: 'keine Jahreszeit' },
  { words: ['Brot', 'Brötchen', 'Butter', 'Brezel'], odd: 'Butter', why: 'kein Backwerk' },
  { words: ['Elbe', 'Rhein', 'Bodensee', 'Donau'], odd: 'Bodensee', why: 'ein See, kein Fluss' },
  { words: ['Bus', 'Zug', 'Fahrrad', 'Flugzeug'], odd: 'Fahrrad', why: 'ohne Motor' },
]


// --- Wohlbefinden -------------------------------------------------------------

/** Eine Frage mit Antwort-Knöpfen; eine Antwort führt weiter oder antwortet. */
export type Choice = { q: string; options: Option[] }
export type Option = { label: string; say?: string; reply?: string; next?: Choice }

const NEEDS: Choice = {
  q: 'Was brauchst du gerade?',
  options: [
    { label: '☕ Eine Pause', reply: 'Dann nimm sie dir: Nach dieser Antwort 5 Minuten weg vom Bildschirm. Die Arbeit wartet.' },
    { label: '💧 Wasser', reply: 'Hol dir ein Glas – jetzt, solange Claude noch arbeitet.' },
    { label: '🚶 Bewegung', reply: 'Steh kurz auf, streck dich, geh ein paar Schritte. Schon 2 Minuten helfen.' },
    { label: '💬 Austausch', reply: 'Wem könntest du nachher kurz schreiben oder wen anrufen? Verbindung tut gut.' },
    { label: '🤫 Ruhe', reply: 'Schließ für drei Atemzüge die Augen. Du musst gerade nichts.' },
    { label: '🙂 Nichts – passt', reply: 'Schön. Nimm das kurz wahr: Gerade passt es.' },
  ],
}

export const MOOD: Choice = {
  q: 'Wie geht’s dir gerade – wirklich?',
  options: [
    { label: '😣 Schwer', say: 'Danke, dass du ehrlich hinschaust. Es ist okay, dass es gerade schwer ist.', next: NEEDS },
    { label: '😕 Angespannt', say: 'Anspannung darf da sein – sie zeigt, dass dir etwas wichtig ist.', next: NEEDS },
    { label: '😐 Geht so', say: 'Auch „geht so“ ist eine ehrliche Antwort.', next: NEEDS },
    { label: '🙂 Gut', say: 'Schön zu hören!', next: NEEDS },
    { label: '😊 Richtig gut', say: 'Wie schön! Genieß das bewusst.', next: NEEDS },
  ],
}

export const WATER: Choice = {
  q: 'Hast du heute schon genug getrunken?',
  options: [
    { label: '💧 Ja, gut dabei', reply: 'Super! Ein Schluck jetzt schadet trotzdem nicht.' },
    { label: '🤔 Eher nicht', reply: 'Dann hol dir gleich ein Glas Wasser. Schon wenig zu trinken kann Konzentration und Laune drücken.' },
    { label: '🤷 Weiß nicht', reply: 'Dann ist jetzt ein guter Moment für ein Glas. 😉' },
  ],
}

export const AIR: Choice = {
  q: 'Zeit für eine Pause an der frischen Luft?',
  options: [
    { label: '🌳 Ja, nach der Antwort', reply: 'Schön! Schon zehn Minuten draußen machen den Kopf spürbar frischer.' },
    { label: '🪟 Fenster auf – jetzt', reply: 'Gute Idee. Ein paar tiefe Atemzüge am offenen Fenster.' },
    { label: '✅ War heute schon draußen', reply: 'Super – dein Kopf dankt es dir.' },
    { label: '🙅 Heute nicht drin', reply: 'Völlig okay. Dann wenigstens ein Blick in die Ferne aus dem Fenster.' },
  ],
}

export const POSTURE: Choice = {
  q: 'Wie sitzt du gerade?',
  options: [
    { label: '🦐 Eher krumm', reply: 'Einmal aufrichten: Scheitel nach oben, Schultern zurück und locker, Füße auf den Boden.' },
    { label: '🧘 Aufrecht', reply: 'Prima! Dann einmal die Schultern nach hinten kreisen – einfach so.' },
    { label: '🧍 Ich stehe', reply: 'Super! Verteil dein Gewicht gleichmäßig auf beide Füße.' },
    { label: '🛋️ Gemütlich gefläzt', reply: 'Darf auch mal sein. 😄 Spür kurz, ob dein Nacken gerade gut liegt.' },
  ],
}

export const ENERGY: Choice = {
  q: 'Wie ist deine Energie gerade?',
  options: [
    { label: '🔋 Voll', reply: 'Nutz sie! Was ist das Wichtigste, das du heute noch schaffen willst?' },
    { label: '🪫 Halb leer', reply: 'Ein Glas Wasser, ein paar Schritte oder ein Fenster auf – such dir eins aus.' },
    { label: '😴 Ziemlich leer', reply: 'Vielleicht ist nach dieser Aufgabe Zeit für eine echte Pause. Du darfst sie nehmen.' },
  ],
}
