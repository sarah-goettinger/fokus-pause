// Stoff für Kreativität, Neugier & Wissen, Verbindung und Mikro-Ordnung.

import { pick, pickNew, pickNewMany } from './pools'
import { EXTRA } from './extra'

/** Eine Schreibaufgabe: Frage, freundliche Antwort danach, optional eine Prüfung. */
export type Write = { q: string; reply: string; check: '' | 'six' | 'acrostic'; word: string }

/** Ein Wissenshappen: Text und wo er herkommt. */
export type Fact = { text: string; source: string }

// --- Kreativität --------------------------------------------------------------

const SIX_THEMES = ['Montagmorgen', 'ein verlorener Schlüssel', 'die erste Tasse Kaffee', 'ein Sommerabend', 'ein Neuanfang', 'ein Roboter, der träumt', 'ein Meeting, das zu lang war', 'Urlaub', 'ein mutiger Moment', 'ein Hund im Büro']

export const sixWords = (): Write => ({
  q: `Erzähl eine Geschichte in genau 6 Wörtern. Thema: ${pick(SIX_THEMES)}.`,
  reply: 'Sechs Wörter, eine ganze Welt. Schön!',
  check: 'six',
  word: '',
})

const NAME_FOR = ['ein Café nur für Eulen', 'eine Farbe zwischen Blau und Grün', 'das Gefühl am Montagmorgen', 'ein Gericht aus Resten', 'ein Planet, auf dem es nur Wochenenden gibt', 'einen sehr höflichen Roboter', 'das Geräusch von Regen auf Zeltplanen', 'eine Band aus Küchengeräten', 'den Moment, wenn eine Idee klickt', 'ein Startup, das Pausen verkauft']

export const nameIt = (): Write => ({
  q: `Erfinde einen Namen für ${pickNew(NAME_FOR, x => x)}.`,
  reply: pick(['Klingt nach einer Marke! 😄', 'Den merk ich mir.', 'Herrlich. Kreativität darf Quatsch sein.']),
  check: '',
  word: '',
})

const WHAT_IF = [
  'Was wäre, wenn Büros Haustiere hätten – welches hätte deins?',
  'Was wäre, wenn du heute eine Superkraft hättest, die nur 10 Minuten hält?',
  'Was wäre, wenn deine Kaffeetasse sprechen könnte – was würde sie sagen?',
  'Was wäre, wenn Meetings gesungen werden müssten – welches Lied für dein nächstes?',
  'Was wäre, wenn du ein neues Schulfach erfinden dürftest?',
  'Was wäre, wenn Wolken Geschmack hätten – welchen?',
  'Was wäre, wenn dein Lieblingsessen eine Person wäre – wie wäre sie?',
  'Was wäre, wenn es einen Feiertag nur für dich gäbe – wie hieße er?',
  'Was wäre, wenn Gedanken eine Farbe hätten – welche hätte deiner gerade?',
  'Was wäre, wenn du einen Tag lang ein Tier sein könntest?',
]

export const whatIf = (): Write => ({ q: pickNew([...WHAT_IF, ...EXTRA.whatIf], q => q), reply: 'Was für ein Gedanke! Fantasie ist Training für das Gehirn.', check: '', word: '' })

const METAPHORS = [
  'Wenn dein Tag heute ein Wetter wäre – welches?',
  'Wenn deine Stimmung ein Tier wäre – welches?',
  'Wenn deine Woche ein Film wäre – welches Genre?',
  'Wenn deine Energie gerade ein Getränk wäre – welches?',
  'Wenn dein aktuelles Projekt eine Landschaft wäre – welche?',
  'Wenn dein Kopf gerade ein Raum wäre – wie sähe er aus?',
]

export const metaphor = (): Write => ({ q: pickNew([...METAPHORS, ...EXTRA.metaphors], q => q), reply: 'Bilder sagen oft mehr als Adjektive. Danke fürs Hinschauen.', check: '', word: '' })

const ACROSTIC_WORDS = ['FOKUS', 'PAUSE', 'MUT', 'RUHE', 'IDEE', 'LICHT', 'KAFFEE', 'TEAM']

export const acrostic = (): Write => {
  const word = pick(ACROSTIC_WORDS)
  return {
    q: `Bilde aus ${word.split('').join('-')} einen Satz: Jedes Wort beginnt mit dem nächsten Buchstaben.`,
    reply: 'Wortakrobatik! 🤸',
    check: 'acrostic',
    word,
  }
}

const ASSOC = ['Meer', 'Montag', 'Licht', 'Wald', 'Zukunft', 'Kindheit', 'Mut', 'Stadt', 'Musik', 'Herbst']

export const association = (): Write => ({
  q: `Schreib schnell 5 Wörter, die dir zu „${pick(ASSOC)}“ einfallen – das erste zuerst, nicht nachdenken.`,
  reply: 'Spannend, wohin die Gedanken springen.',
  check: '',
  word: '',
})

const DOODLES = ['eine Katze', 'dein Lieblingsessen', 'ein Haus am See', 'einen Baum', 'dein heutiges Gefühl', 'eine Rakete', 'deine Kaffeetasse', 'ein Gesicht']
const DOODLE_RULES = ['mit geschlossenen Augen', 'mit der „falschen“ Hand', 'nur aus Kreisen', 'in einer einzigen Linie, ohne abzusetzen', 'so klein wie möglich', 'in 10 Sekunden']

export const doodle = (): { text: string; sec: number }[] => [
  { text: 'Schnapp dir Stift und Zettel.', sec: 5 },
  { text: `Zeichne ${pick(DOODLES)} – ${pick(DOODLE_RULES)}.`, sec: 25 },
  { text: 'Schau es dir an. Perfekt unperfekt. 😄', sec: 6 },
]

// --- Neugier & Wissen ---------------------------------------------------------

export const AI_FACTS: Fact[] = [
  { text: 'Der Begriff „Künstliche Intelligenz“ geht auf einen Forschungsantrag von 1955 zurück – für eine Konferenz 1956 am Dartmouth College.', source: 'KI-Geschichte' },
  { text: 'Das „T“ in GPT steht für Transformer – eine Architektur, die Google-Forschende 2017 im Paper „Attention Is All You Need“ vorgestellt haben.', source: 'KI-Technik' },
  { text: 'Sprachmodelle lesen keine Wörter, sondern Tokens – Wortstücke. Lange deutsche Wörter zerfallen oft in mehrere davon.', source: 'KI-Technik' },
  { text: '1997 schlug IBMs Schachcomputer Deep Blue den Weltmeister Garri Kasparow.', source: 'KI-Geschichte' },
  { text: '2016 besiegte AlphaGo von DeepMind den Go-Profi Lee Sedol. Go galt lange als zu komplex für Computer.', source: 'KI-Geschichte' },
  { text: 'ELIZA, einer der ersten Chatbots, entstand Mitte der 1960er am MIT – und schon damals erzählten Menschen ihm Persönliches.', source: 'KI-Geschichte' },
  { text: 'Der Turing-Test geht auf Alan Turings Aufsatz von 1950 zurück. Er selbst nannte ihn „Imitation Game“.', source: 'KI-Geschichte' },
  { text: '„Halluzination“ nennt man es, wenn ein KI-Modell plausibel klingende, aber falsche Inhalte erzeugt.', source: 'KI-Begriff' },
  { text: 'Die „Temperatur“ steuert, wie zufällig ein Sprachmodell das nächste Token wählt: niedrig = vorhersehbarer, hoch = kreativer.', source: 'KI-Begriff' },
  { text: 'Das Kontextfenster ist das Arbeitsgedächtnis eines Sprachmodells: alles, was es in einer Unterhaltung gleichzeitig berücksichtigen kann.', source: 'KI-Begriff' },
  { text: 'ChatGPT erreichte nach dem Start Ende 2022 Schätzungen zufolge in rund zwei Monaten 100 Millionen Nutzer – damals ein Rekord.', source: 'KI-Geschichte' },
  { text: 'Künstliche neuronale Netze sind nur lose vom Gehirn inspiriert. Mit echten Nervenzellen haben ihre „Neuronen“ wenig gemeinsam.', source: 'KI-Technik' },
  { text: 'Es gab zwei „KI-Winter“: in den 1970ern und Ende der 1980er brachen Fördergelder ein, weil KI die Erwartungen nicht erfüllte.', source: 'KI-Geschichte' },
  { text: 'Bei RLHF lernen Sprachmodelle aus menschlichem Feedback, welche Antworten hilfreicher sind.', source: 'KI-Begriff' },
  { text: 'Embeddings verwandeln Wörter in lange Zahlenlisten. Wörter mit ähnlicher Bedeutung liegen darin nah beieinander.', source: 'KI-Technik' },
  { text: 'Sprachmodelle haben ohne zusätzliche Werkzeuge keinen Internetzugang – sie antworten aus dem, was sie im Training gelernt haben.', source: 'KI-Technik' },
]

export const AI_TIPS: Fact[] = [
  { text: 'Gib Kontext: Wer bist du, für wen ist das Ergebnis, wofür wird es gebraucht?', source: 'KI-Tipp' },
  { text: 'Zeig ein Beispiel, wie das Ergebnis aussehen soll – das wirkt oft mehr als lange Beschreibungen.', source: 'KI-Tipp' },
  { text: 'Bitte die KI, dir erst Rückfragen zu stellen, bevor sie loslegt.', source: 'KI-Tipp' },
  { text: 'Lass dir drei Varianten geben und wähle – statt die erste zu perfektionieren.', source: 'KI-Tipp' },
  { text: 'Prüf Zahlen, Zitate und Quellen nach: Sprachmodelle können überzeugend falsch liegen.', source: 'KI-Tipp' },
  { text: 'Sag auch, was du NICHT willst: Länge, Ton, Fachbegriffe, Floskeln.', source: 'KI-Tipp' },
  { text: 'Gib der KI eine Rolle: „Antworte als skeptischer CFO“ oder „als neugierige Teilnehmerin“.', source: 'KI-Tipp' },
  { text: 'Große Aufgaben in Schritte teilen: erst die Gliederung, dann Abschnitt für Abschnitt.', source: 'KI-Tipp' },
  { text: 'Bitte um Feedback auf deinen eigenen Entwurf statt um einen Text von null.', source: 'KI-Tipp' },
  { text: 'Speicher gute Prompts als Vorlage – oder gleich als Skill. 😉', source: 'KI-Tipp' },
  { text: 'Frag nach den Annahmen: „Welche Annahmen steckst du in diese Antwort?“', source: 'KI-Tipp' },
  { text: 'Lass dir Kritik geben: „Was ist die stärkste Gegenposition zu meinem Vorschlag?“', source: 'KI-Tipp' },
]

export const FUN_FACTS: Fact[] = [
  { text: 'Oktopusse haben drei Herzen und blaues Blut.', source: 'Natur' },
  { text: 'Bananen sind botanisch gesehen Beeren – Erdbeeren dagegen nicht.', source: 'Natur' },
  { text: 'Ein Tag auf der Venus dauert länger als ein Venus-Jahr.', source: 'Weltall' },
  { text: 'Wombats hinterlassen würfelförmigen Kot.', source: 'Natur' },
  { text: 'Das Gehirn macht etwa 2 % des Körpergewichts aus, verbraucht aber rund 20 % der Energie.', source: 'Körper' },
  { text: 'Der Eiffelturm ist im Sommer etwas höher, weil sich das Metall in der Wärme ausdehnt.', source: 'Physik' },
  { text: 'Seeotter halten sich beim Schlafen oft an den Pfoten, damit sie nicht auseinandertreiben.', source: 'Natur' },
  { text: 'Ein Blitz ist mehrmals heißer als die Oberfläche der Sonne.', source: 'Physik' },
  { text: 'Flamingos sind rosa wegen der Farbstoffe in ihrer Nahrung.', source: 'Natur' },
  { text: '„Handy“ für Mobiltelefon ist ein Scheinanglizismus – im Englischen sagt man „mobile“ oder „cell phone“.', source: 'Sprache' },
  { text: 'Honig verdirbt praktisch nie. In ägyptischen Gräbern fand man jahrtausendealten Honig, der nicht verdorben war.', source: 'Natur' },
  { text: 'Auf der Erde gibt es mehr Bäume als Sterne in der Milchstraße – Schätzungen zufolge rund drei Billionen.', source: 'Natur' },
]

export const RARE_WORDS: Fact[] = [
  { text: 'Kummerspeck – das Gewicht, das man sich aus Frust anfuttert.', source: 'Schönes Wort' },
  { text: 'Waldeinsamkeit – das Gefühl, allein und geborgen im Wald zu sein.', source: 'Schönes Wort' },
  { text: 'Fisimatenten – Ausflüchte, Unsinn, Umstände. „Mach keine Fisimatenten!“', source: 'Schönes Wort' },
  { text: 'Verschlimmbessern – etwas verbessern wollen und es dabei schlimmer machen.', source: 'Schönes Wort' },
  { text: 'Kopfkino – Bilder, die im Kopf ablaufen, ganz ohne Leinwand.', source: 'Schönes Wort' },
  { text: 'Torschlusspanik – die Angst, eine Gelegenheit endgültig zu verpassen.', source: 'Schönes Wort' },
  { text: 'Feierabend – ein Wort, um das uns viele Sprachen beneiden.', source: 'Schönes Wort' },
  { text: 'Sitzfleisch – die Ausdauer, lange an etwas dranzubleiben.', source: 'Schönes Wort' },
  { text: 'Schnapsidee – ein Einfall, der verdächtig nach zu später Stunde klingt.', source: 'Schönes Wort' },
  { text: 'Lampenfieber – die Aufregung vor einem Auftritt.', source: 'Schönes Wort' },
  { text: 'Fernweh – die Sehnsucht nach Orten, an denen man noch nie war.', source: 'Schönes Wort' },
  { text: 'Ohrwurm – ein Lied, das sich im Kopf festbeißt.', source: 'Schönes Wort' },
]

const TRUE_FALSE = [
  { q: 'Goldfische haben ein Gedächtnis von nur drei Sekunden.', a: 'Falsch', why: 'Goldfische können sich Dinge über Wochen und Monate merken.' },
  { q: 'Der Mensch nutzt nur 10 % seines Gehirns.', a: 'Falsch', why: 'Über den Tag sind praktisch alle Hirnregionen aktiv.' },
  { q: 'Tomaten sind botanisch Früchte.', a: 'Wahr', why: 'Sie entstehen aus der Blüte und tragen Samen.' },
  { q: 'Fledermäuse sind blind.', a: 'Falsch', why: 'Fledermäuse können sehen – viele orientieren sich zusätzlich per Echo.' },
  { q: 'Die Chinesische Mauer ist vom Mond aus mit bloßem Auge zu sehen.', a: 'Falsch', why: 'Dafür ist sie viel zu schmal.' },
  { q: 'Ein Jahr auf dem Mars ist länger als ein Erdenjahr.', a: 'Wahr', why: 'Ein Marsjahr dauert fast zwei Erdenjahre.' },
  { q: 'Pinguine leben am Nordpol.', a: 'Falsch', why: 'Pinguine leben auf der Südhalbkugel.' },
  { q: 'Blitze schlagen nie zweimal an derselben Stelle ein.', a: 'Falsch', why: 'Hohe Gebäude werden oft viele Male im Jahr getroffen.' },
  { q: 'Napoleon war außergewöhnlich klein.', a: 'Falsch', why: 'Er war für seine Zeit etwa durchschnittlich groß.' },
  { q: 'Das erste Modell namens GPT erschien 2018.', a: 'Wahr', why: 'OpenAI stellte GPT-1 im Jahr 2018 vor.' },
  { q: 'Sprachmodelle haben ohne Zusatzwerkzeuge Zugang zum Internet.', a: 'Falsch', why: 'Sie antworten aus ihrem Training – Suche braucht ein extra Werkzeug.' },
  { q: 'Der Begriff „Künstliche Intelligenz“ stammt aus den 1950ern.', a: 'Wahr', why: 'Er wurde 1955 für die Dartmouth-Konferenz geprägt.' },
]

export const trueFalse = () =>
  pickNewMany([...TRUE_FALSE, ...EXTRA.trueFalse], 3, x => x.q)
    .map(x => ({ big: '', ink: '', sub: x.q, options: ['Wahr', 'Falsch'], answer: x.a, why: x.why }))

// --- Verbindung ---------------------------------------------------------------

export const CONNECT_WRITES: (() => Write)[] = [
  () => ({ q: 'Wem könntest du heute danken – und wofür?', reply: 'Sag es der Person nachher in einem Satz. Kleine Dankesworte wirken lange.', check: '', word: '' }),
  () => ({ q: 'Wem könntest du nachher eine kurze Nachricht schreiben – einfach so?', reply: 'Schön. Ein „Hab an dich gedacht“ reicht völlig.', check: '', word: '' }),
  () => ({ q: 'Welches ehrliche Kompliment könntest du heute jemandem machen?', reply: 'Mach es! Komplimente kosten nichts und bleiben hängen.', check: '', word: '' }),
  () => ({ q: 'Welche Frage, die nichts mit Arbeit zu tun hat, würdest du gern mal einer Kollegin oder einem Kollegen stellen?', reply: 'Vielleicht beim nächsten Kaffee? Solche Fragen bauen echte Verbindung.', check: '', word: '' }),
  () => ({ q: 'Von wem hast du schon länger nichts gehört, obwohl du die Person magst?', reply: 'Vielleicht ist heute ein guter Tag für ein kurzes Hallo.', check: '', word: '' }),
  () => ({ q: 'Wer hat dir zuletzt geholfen, ohne dass du darum gebeten hast?', reply: 'Schön, so jemanden zu haben. Vielleicht weiß die Person gar nicht, wie gut das tat?', check: '', word: '' }),
]

export const connectMemory = (): { text: string; sec: number }[] => [
  { text: 'Denk an einen schönen Moment mit einem Menschen, den du magst.', sec: 8 },
  { text: pick(['Wo wart ihr? Was habt ihr gemacht?', 'Was hat euch zum Lachen gebracht?', 'Was hast du an diesem Menschen in dem Moment gemocht?']), sec: 12 },
  { text: 'Lass das Gefühl kurz da sein. Es gehört dir.', sec: 10 },
]

// --- Mikro-Ordnung ------------------------------------------------------------

export const TIDY_TASKS = [
  'Räum ein Ding vom Schreibtisch weg, das da nicht hingehört.',
  'Bring eine leere Tasse oder ein Glas in die Küche.',
  'Wirf drei Dinge weg: Zettel, Verpackung, Kram.',
  'Wisch einmal über Bildschirm oder Tastatur.',
  'Leg Stifte und Kabel ordentlich zusammen.',
  'Gieß eine Pflanze – oder schau, ob sie Wasser braucht.',
  'Füll deine Wasserflasche auf und stell sie neben dich.',
  'Leg dein Handy außer Reichweite – Bildschirm nach unten.',
  'Schließ drei Browser-Tabs, die du nicht mehr brauchst.',
  'Sortier die Zettel auf deinem Tisch auf einen Stapel.',
  'Stell deinen Stuhl einmal richtig ein: Füße flach, Rücken an der Lehne.',
  'Öffne kurz das Fenster und lass frische Luft rein.',
]

export const randomTask = () => pick([...TIDY_TASKS, ...EXTRA.tidy])

/** Verbindungsfragen aus der Routine bekommen eine allgemeine, freundliche Antwort. */
export const extraConnect = (): Write[] =>
  EXTRA.connect.map(q => ({ q, reply: 'Schön. Vielleicht wird daraus heute noch ein kurzer Moment.', check: '', word: '' }))

/** Holt KI-Schlagzeilen aus einem RSS-Feed: Titel und Datum, nichts sonst. */
export const parseFeed = (xml: string): string[] => {
  const out: string[] = []
  const items = xml.split('<item>').slice(1)
  for (const item of items) {
    const m = /<title>([\s\S]*?)<\/title>/.exec(item)
    if (!m || m[1] === undefined) continue
    const title = m[1]
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#8222;|&#8220;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8217;/g, '’')
      .replace(/&#\d+;/g, '')
      .replace(/<[^>]+>/g, '')
      .trim()
    if (title.length > 10 && title.length < 220) out.push(title)
    if (out.length >= 20) break
  }
  return out
}
