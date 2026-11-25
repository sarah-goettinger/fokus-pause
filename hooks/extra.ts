// Laufend wachsender Zusatz-Stoff. Die wöchentliche Routine „fokus-pause-nachschub“
// ergänzt NUR diese Datei: neue Einträge unten an die passende Liste anhängen,
// neue Übungen an EXTRA_EXERCISES (mit addedAt = Datum, dann kommen sie eine
// Woche lang öfter dran). Bestehende Einträge nicht ändern oder löschen.

import { pick } from './pools'
import type { Quiz } from './pools'
import type { Fact } from './pools2'
import type { Exercise } from './content'

export type TrueFalse = { q: string; a: 'Wahr' | 'Falsch'; why: string }
export type OddSet = { words: string[]; odd: string; why: string }

export const EXTRA = {
  // Knobeln (Quiz: q, accept = akzeptierte Antworten klein & ohne Umlaute/Leerzeichen, show, hint)
  riddles: [
    { q: 'Was hat einen Kopf und einen Fuß, aber keinen Körper?', accept: ['bett', 'seite', 'buchseite'], show: 'Ein Bett (Kopfende und Fußende)', hint: 'Du liegst nachts darin.' },
    { q: 'Ich habe Blätter, bin aber kein Baum. Was bin ich?', accept: ['buch', 'heft', 'block', 'notizbuch', 'zeitung', 'notizblock'], show: 'Ein Buch (oder ein Heft)', hint: 'Man liest oder schreibt darin.' },
  ] as Quiz[],
  remote: [
    { q: 'Kopf · Sitz · Feder', accept: ['kissen'], show: 'Kissen (Kopfkissen, Sitzkissen, Federkissen)', hint: 'Weich und gemütlich.' },
    { q: 'Ohr · Finger · Nasen', accept: ['ring'], show: 'Ring (Ohrring, Fingerring, Nasenring)', hint: 'Ein Schmuckstück.' },
  ] as Quiz[],
  teekessel: [
    { q: 'Man isst es vom Teller – und dort spricht eine Richterin ihr Urteil.', accept: ['gericht'], show: 'Gericht', hint: 'Fängt mit G an.' },
  ] as Quiz[],
  series: [
    { q: '1 · 2 · 6 · 24 · 120 · ?', accept: ['720'], show: '720 (×2, ×3, ×4, ×5, ×6)', hint: 'Der Faktor wächst jedes Mal um 1.' },
  ] as Quiz[],
  // Wissen (Fact: text, source)
  aiFacts: [
    { text: 'Den Begriff „Machine Learning“ prägte Arthur Samuel um 1959 – mit einem Dame-Programm, das durch Spielen gegen sich selbst besser wurde.', source: 'KI-Geschichte' },
    { text: 'Frank Rosenblatts Perzeptron von 1958 gilt als eines der ersten künstlichen neuronalen Netze, die aus Beispielen lernen konnten.', source: 'KI-Geschichte' },
  ] as Fact[],
  /** KI-News, in eigenen Worten erklärt; source z. B. „KI-News · The Decoder, 2026-11-23“. */
  aiNews: [] as Fact[],
  aiTips: [
    { text: 'Bevor die KI einen langen Bericht zusammenfasst: Sag ihr, welche Entscheidung du danach treffen willst. Dann filtert sie gezielt, was dafür zählt.', source: 'KI-Tipp' },
  ] as Fact[],
  funFacts: [
    { text: 'Schnecken können je nach Art Tausende winzige Zähne haben. Sie sitzen auf einer Raspelzunge, der Radula.', source: 'Natur' },
    { text: 'Herbstlaub wird gelb, weil der Baum das grüne Chlorophyll abbaut – die gelben Farbstoffe steckten schon den ganzen Sommer im Blatt.', source: 'Natur' },
  ] as Fact[],
  words: [
    { text: 'Augenweide – etwas, das so schön ist, dass die Augen sich daran satt sehen möchten.', source: 'Schönes Wort' },
    { text: 'Wolkenkuckucksheim – ein Fantasieort für weltfremde Träume. Das Wort geht auf eine Komödie von Aristophanes zurück.', source: 'Schönes Wort' },
  ] as Fact[],
  trueFalse: [
    { q: 'Strauße stecken bei Gefahr den Kopf in den Sand.', a: 'Falsch', why: 'Ein Mythos – bei Gefahr laufen sie weg oder legen sich flach auf den Boden.' },
    { q: 'Eine Motte im Rechner hat das Wort „Bug“ für Computerfehler berühmt gemacht.', a: 'Wahr', why: '1947 fand ein Team um Grace Hopper eine Motte im Mark II. Das Wort „Bug“ gab es aber schon vorher.' },
  ] as TrueFalse[],
  // Spiele
  odd: [
    { words: ['Bleistift', 'Kugelschreiber', 'Radiergummi', 'Füller'], odd: 'Radiergummi', why: 'schreibt nicht, sondern löscht' },
  ] as OddSet[],
  blitz: [
    'Dinge, die gut riechen',
  ] as string[],
  anagrams: [
    'HERBST',
    'KASTANIE',
  ] as string[],
  // Kreativität, Verbindung, Ordnung
  whatIf: [
    'Was wäre, wenn du deinem Ich von vor fünf Jahren einen einzigen Satz schicken könntest?',
    'Was wäre, wenn jede Wohnung einen Raum nur zum Staunen hätte – wie sähe deiner aus?',
  ] as string[],
  metaphors: [
    'Wenn dein heutiger Tag ein Musikstück wäre – welches Tempo hätte er?',
  ] as string[],
  connect: [
    'Wer bringt dich zuverlässig zum Lachen – und wann habt ihr zuletzt miteinander gesprochen?',
  ] as string[],
  tidy: [
    'Richte die Dinge auf deinem Tisch gerade aus – Kanten parallel, ganz in Ruhe.',
  ] as string[],
}

/** Zusätzliche Übungen; `addedAt` (JJJJ-MM-TT) macht sie eine Woche lang „neu“. */
export const EXTRA_EXERCISES: (Exercise & { addedAt: string })[] = [
  {
    id: 'count-breath', cat: 'mind', kind: 'steps', title: 'Atemzüge zählen', look: 'mind', addedAt: '2026-11-23',
    steps: (level: number) => [
      { text: 'Setz dich bequem hin. Der Blick darf weich werden und sinken – die Augen bleiben offen, damit du mitlesen kannst.', sec: 7 },
      { text: 'Zähl beim nächsten Ausatmen still: eins.', sec: 8 },
      {
        text: pick([
          'Weiter bis fünf – bei jedem Ausatmen eine Zahl.',
          'Zähl weiter bis fünf. Die Zahl landet sanft auf dem Ausatmen.',
          'Bis fünf weiterzählen – und den Atem dabei einfach kommen lassen.',
        ]),
        sec: level >= 3 ? 20 : 16,
      },
      { text: 'Abgeschweift? Ganz normal. Freundlich wieder bei eins beginnen.', sec: 10 },
      ...(level >= 2 ? [{ text: 'Noch eine Runde von eins bis fünf, ganz ohne Eile.', sec: 18 }] : []),
      { text: 'Lass das Zählen los. Der Atem geht von allein weiter.', sec: 8 },
    ],
  },
]

// Damit der Import von `pick` immer genutzt ist, auch solange die Listen leer sind.
export const pickExtra = <T,>(list: readonly T[]): T | undefined => (list.length > 0 ? pick(list) : undefined)
