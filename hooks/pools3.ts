// Version 10: mehr Abwechslung. Claude-Tipps statt KI-News, neue Rätsel- und
// Spielformate, mehr Achtsamkeit, mehr Kreativ- und Reflexionsimpulse.

import { pick, pickNew, shuffle } from './pools'
import type { Quiz } from './pools'
import type { Fact, Write } from './pools2'

type Step = { text: string; sec: number }

// --- Claude-Tipps (dürfen sich wiederholen, kommen aber bevorzugt neu) ------

export const CLAUDE_TIPS: Fact[] = [
  { text: 'Sag Claude, wofür das Ergebnis gedacht ist und wer es liest. Kontext schlägt lange Anweisungen.', source: 'Claude-Tipp' },
  { text: 'Schreib dazu: „Stell mir erst drei Rückfragen, bevor du loslegst.“ Das spart oft zwei Korrekturrunden.', source: 'Claude-Tipp' },
  { text: 'Gib Claude ein Beispiel, wie das Ergebnis aussehen soll. Ton und Format sitzen dann viel schneller.', source: 'Claude-Tipp' },
  { text: 'In Projekten legst du Dokumente und Anweisungen einmal ab – Claude kennt sie dann in jedem Chat des Projekts.', source: 'Claude-Tipp' },
  { text: 'Was du Claude immer wieder gleich erklärst, kann ein Skill werden: einmal beschreiben, immer wieder nutzen.', source: 'Claude-Tipp' },
  { text: 'Bitte Claude, deinen Entwurf zu kritisieren statt ihn neu zu schreiben. So bleibt deine Stimme erhalten.', source: 'Claude-Tipp' },
  { text: 'Vor einer Entscheidung: „Bau mir eine Tabelle mit den Optionen, Vor- und Nachteilen und deiner Empfehlung.“', source: 'Claude-Tipp' },
  { text: '„Formuliere das in drei Varianten: sachlich, warm, knapp.“ Dann wählen statt grübeln.', source: 'Claude-Tipp' },
  { text: 'Große Aufgaben in Schritte teilen: erst die Gliederung freigeben, dann Abschnitt für Abschnitt.', source: 'Claude-Tipp' },
  { text: 'Frag nach: „Welche Annahmen hast du dabei getroffen?“ So findest du Lücken in Sekunden.', source: 'Claude-Tipp' },
  { text: 'Bei Zahlen und Zitaten: „Nenne die Quelle und markiere, was du nicht sicher weißt.“', source: 'Claude-Tipp' },
  { text: 'Ein Screenshot sagt oft mehr als eine Beschreibung: Claude kann Bilder lesen.', source: 'Claude-Tipp' },
  { text: 'Claude Code: Eine CLAUDE.md im Projektordner gibt Claude dauerhaft Kontext mit, ohne dass du ihn jedes Mal erklärst.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Mit /clear startest du frisch, wenn ein Chat lang und unscharf geworden ist.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: /compact fasst einen langen Verlauf zusammen, damit Claude den Faden behält.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Im Plan-Modus plant Claude erst und ändert nichts, bis du zustimmst. Gut für größere Vorhaben.', source: 'Claude-Code-Tipp' },
  { text: 'Läuft Claude in die falsche Richtung? Unterbrich ruhig und lenk neu, statt bis zum Ende zu warten.', source: 'Claude-Tipp' },
  { text: 'Geplante Aufgaben lassen Claude Routinen erledigen, zum Beispiel jeden Montag einen Wochenüberblick.', source: 'Claude-Tipp' },
  { text: 'Willst du etwas umsetzen? „Gib mir das als Checkliste mit Reihenfolge.“', source: 'Claude-Tipp' },
  { text: '„Erklär es mir wie einer klugen Person ohne Fachwissen.“ Perfekt für neue Themen.', source: 'Claude-Tipp' },
  { text: 'Lass Claude eine Rolle spielen: „Sei mein skeptischer Kunde und stell mir die drei härtesten Fragen.“', source: 'Claude-Tipp' },
  { text: 'Vor einer wichtigen Mail: „Wie könnte das beim Empfänger falsch ankommen?“', source: 'Claude-Tipp' },
  { text: 'Gib Claude Feedback wie einer Kollegin: konkret, was passt und was anders werden soll.', source: 'Claude-Tipp' },
  { text: 'Schweift Claude ab? Kurze Grenzen helfen: „Bitte nur X, ohne Y, maximal fünf Sätze.“', source: 'Claude-Tipp' },
  { text: 'Für wiederkehrende Texte einmal mit Claude eine Vorlage bauen und als Projektdatei oder Skill ablegen.', source: 'Claude-Tipp' },
  { text: 'Artefakte: Claude kann kleine interaktive Seiten bauen, etwa eine Checkliste oder einen Rechner zum Teilen.', source: 'Claude-Tipp' },
  { text: 'Meeting-Notizen einfügen und sagen: „Sortier das in Entscheidungen, To-dos mit Namen und offene Fragen.“', source: 'Claude-Tipp' },
  { text: '„Was würdest du an meiner Stelle als Nächstes tun, und warum?“ bringt oft schnell Klarheit.', source: 'Claude-Tipp' },
  { text: 'Nutze Claude als Sparringspartner: „Was ist das stärkste Gegenargument zu meinem Vorschlag?“', source: 'Claude-Tipp' },
  { text: 'Stimmt der Ton nicht? Gib Claude zwei, drei Sätze, die nach dir klingen, als Stilvorlage.', source: 'Claude-Tipp' },
  { text: 'Bitte am Ende: „Fass die Ergebnisse in drei Sätzen für jemanden zusammen, der nicht dabei war.“', source: 'Claude-Tipp' },
  { text: 'Wenn du nicht weißt, wie du fragen sollst: „Hilf mir, eine gute Anfrage für dieses Ziel zu formulieren.“', source: 'Claude-Tipp' },
  { text: 'Claude Code: Mit @ und einem Dateinamen zeigst du Claude direkt, welche Datei es lesen soll.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Screenshots einfach ins Eingabefeld ziehen oder einfügen – etwa eine Fehlermeldung oder eine Folie.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Ein Skill ist ein Ordner mit einer SKILL.md. Claude lädt ihn, sobald die Aufgabe dazu passt.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Bitte am Ende: „Schreib die wichtigsten Erkenntnisse in die CLAUDE.md.“ Dann weiß die nächste Sitzung davon.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Für breite Recherchen kann Claude Subagenten losschicken, die parallel suchen und nur das Ergebnis zurückbringen.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Frühere Sitzungen findest du in der Seitenleiste – dort kannst du einfach weitermachen.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: „Erst planen, noch nichts ändern“ – so siehst du den Vorschlag, bevor Dateien angefasst werden.', source: 'Claude-Code-Tipp' },
  { text: 'Claude Code: Lass Claude seine Arbeit selbst prüfen: „Teste das und zeig mir das Ergebnis, bevor du fertig meldest.“', source: 'Claude-Code-Tipp' },
]

export const GLOSSARY: Fact[] = [
  { text: 'Prompt: die Anweisung oder Frage, die du einem KI-Modell gibst. Je klarer Ziel, Kontext und Format, desto besser die Antwort.', source: 'KI-Begriff' },
  { text: 'System-Prompt: Anweisungen im Hintergrund, die festlegen, wie sich ein Assistent grundsätzlich verhält – noch bevor du etwas fragst.', source: 'KI-Begriff' },
  { text: 'Agent: ein KI-System, das nicht nur antwortet, sondern selbst Schritte plant und Werkzeuge nutzt, um eine Aufgabe zu erledigen.', source: 'KI-Begriff' },
  { text: 'Tool-Nutzung: Das Modell ruft Werkzeuge auf – etwa eine Websuche, einen Taschenrechner oder ein Programm – statt alles aus dem Gedächtnis zu beantworten.', source: 'KI-Begriff' },
  { text: 'RAG (Retrieval-Augmented Generation): Vor der Antwort werden passende Dokumente gesucht und mitgegeben, damit das Modell sich auf echte Quellen stützt.', source: 'KI-Begriff' },
  { text: 'Fine-Tuning: Ein bereits trainiertes Modell wird mit zusätzlichen Beispielen für eine bestimmte Aufgabe oder einen Stil nachtrainiert.', source: 'KI-Begriff' },
  { text: 'Multimodal: Ein Modell versteht nicht nur Text, sondern auch Bilder, Audio oder andere Formate.', source: 'KI-Begriff' },
  { text: 'Inferenz: das Anwenden eines fertig trainierten Modells – also jedes Mal, wenn es dir eine Antwort erzeugt.', source: 'KI-Begriff' },
  { text: 'Parameter: die gelernten Zahlenwerte in einem neuronalen Netz. Große Sprachmodelle haben davon viele Milliarden.', source: 'KI-Begriff' },
  { text: 'Benchmark: ein standardisierter Test, mit dem man Modelle vergleicht – etwa beim Programmieren oder Rechnen.', source: 'KI-Begriff' },
  { text: 'Open-Weight-Modell: Die trainierten Gewichte sind öffentlich. Man kann das Modell selbst betreiben und anpassen.', source: 'KI-Begriff' },
  { text: 'Few-Shot: Du gibst dem Modell ein paar Beispiele im Prompt mit, damit es das Muster übernimmt. Zero-Shot heißt: ganz ohne Beispiele.', source: 'KI-Begriff' },
  { text: 'Guardrails: Leitplanken, die verhindern sollen, dass ein KI-System Schaden anrichtet oder unerwünschte Inhalte erzeugt.', source: 'KI-Begriff' },
  { text: 'Destillation: Ein kleines Modell lernt von einem großen. Es wird dadurch schneller und günstiger, verliert aber etwas Können.', source: 'KI-Begriff' },
  { text: 'Latenz: die Wartezeit, bis eine Antwort beginnt. Genau die Zeit, die du gerade sinnvoll nutzt. 😉', source: 'KI-Begriff' },
]

// --- Rätsel & Spiele ---------------------------------------------------------

const CAPITALS: [string, string, string[]][] = [
  ['der Schweiz', 'Bern', []], ['Portugal', 'Lissabon', []], ['den Niederlanden', 'Amsterdam', []], ['Belgien', 'Brüssel', []],
  ['Dänemark', 'Kopenhagen', []], ['Schweden', 'Stockholm', []], ['Norwegen', 'Oslo', []], ['Finnland', 'Helsinki', []],
  ['Polen', 'Warschau', []], ['Tschechien', 'Prag', []], ['Ungarn', 'Budapest', []], ['Irland', 'Dublin', []], ['Kroatien', 'Zagreb', []], ['Slowenien', 'Ljubljana', []], ['der Slowakei', 'Bratislava', []],
  ['Rumänien', 'Bukarest', []], ['Bulgarien', 'Sofia', []], ['Estland', 'Tallinn', []], ['Lettland', 'Riga', []],
  ['Litauen', 'Vilnius', ['wilna']], ['Island', 'Reykjavík', ['reykjavik']], ['Kanada', 'Ottawa', []], ['Australien', 'Canberra', []],
  ['Brasilien', 'Brasília', ['brasilia']], ['Südkorea', 'Seoul', []], ['Ägypten', 'Kairo', []],
  ['Marokko', 'Rabat', []], ['Kenia', 'Nairobi', []], ['Argentinien', 'Buenos Aires', []], ['Neuseeland', 'Wellington', []],
  ['der Türkei', 'Ankara', []], ['Indien', 'Neu-Delhi', ['delhi', 'newdelhi']], ['Vietnam', 'Hanoi', []], ['Peru', 'Lima', []],
  ['Kasachstan', 'Astana', []], ['Nigeria', 'Abuja', []], ['Pakistan', 'Islamabad', []], ['Tansania', 'Dodoma', []],
  ['Montenegro', 'Podgorica', []], ['Albanien', 'Tirana', []], ['Nordmazedonien', 'Skopje', []], ['Moldau', 'Chișinău', ['chisinau', 'kischinau']],
  ['Georgien', 'Tiflis', ['tbilisi']], ['Armenien', 'Jerewan', ['eriwan', 'yerevan']], ['Aserbaidschan', 'Baku', []], ['der Mongolei', 'Ulaanbaatar', ['ulanbator', 'ulaanbator']],
  ['Myanmar', 'Naypyidaw', ['naypyitaw']], ['Malta', 'Valletta', []], ['Luxemburg', 'Luxemburg', []], ['Chile', 'Santiago de Chile', ['santiago']],
  ['Kolumbien', 'Bogotá', ['bogota']], ['Ecuador', 'Quito', []], ['Uruguay', 'Montevideo', []], ['Ghana', 'Accra', []],
]

export const capitalQuiz = (): Quiz => {
  const [land, city, more] = pickNew(CAPITALS, c => c[0])
  return { q: `Wie heißt die Hauptstadt von ${land}?`, accept: [city, ...more], show: city, hint: `Sie beginnt mit „${city[0]}“.` }
}

const OPPOSITES: [string, string[]][] = [
  ['konkav', ['konvex']], ['Inflation', ['Deflation']], ['Zenit', ['Nadir']], ['Prolog', ['Epilog']],
  ['Altruismus', ['Egoismus']], ['introvertiert', ['extrovertiert', 'extravertiert']], ['explizit', ['implizit']],
  ['subjektiv', ['objektiv']], ['Mikrokosmos', ['Makrokosmos']], ['Konsens', ['Dissens']], ['homogen', ['heterogen']],
  ['Monolog', ['Dialog']], ['zentral', ['dezentral']], ['akut', ['chronisch']], ['synchron', ['asynchron']],
  ['Hochmut', ['Demut']], ['Fluch', ['Segen']], ['Diesseits', ['Jenseits']], ['induktiv', ['deduktiv']],
  ['Aufwand', ['Ertrag', 'Nutzen']], ['Soll', ['Haben']], ['Import', ['Export']], ['Theorie', ['Praxis']],
  ['progressiv', ['konservativ', 'regressiv']], ['Optimist', ['Pessimist']], ['abstrakt', ['konkret']],
  ['Hypertonie', ['Hypotonie']], ['quantitativ', ['qualitativ']], ['Divergenz', ['Konvergenz']],
  ['latent', ['manifest', 'offensichtlich']], ['ephemer', ['dauerhaft', 'beständig', 'ewig']], ['Antithese', ['These']],
  ['zentrifugal', ['zentripetal']], ['Anode', ['Kathode']], ['Synonym', ['Antonym']],
]


export const oppositeQuiz = (): Quiz => {
  const [word, opp] = pickNew(OPPOSITES, o => o[0])
  return { q: `Was ist das Gegenteil von „${word}“? (Achtung, etwas kniffliger)`, accept: opp, show: opp.join(' / '), hint: `Es beginnt mit „${opp[0]?.[0] ?? ''}“ und hat ${opp[0]?.length ?? 0} Buchstaben.` }
}

const SAYINGS: [string, string, string[]][] = [
  ['Wer anderen eine Grube gräbt, …', 'fällt selbst hinein', ['selbsthinein', 'faelltselbstdarein']],
  ['Morgenstund hat …', 'Gold im Mund', ['goldimmund']],
  ['Wer zuletzt lacht, …', 'lacht am besten', ['lachtambesten']],
  ['Übung macht den …', 'Meister', []],
  ['Aller Anfang ist …', 'schwer', []],
  ['Was du heute kannst besorgen, …', 'das verschiebe nicht auf morgen', ['nichtaufmorgen']],
  ['Ohne Fleiß …', 'kein Preis', ['keinpreis']],
  ['Der Apfel fällt nicht weit …', 'vom Stamm', ['vomstamm']],
  ['Lügen haben …', 'kurze Beine', ['kurzebeine']],
  ['Wer A sagt, …', 'muss auch B sagen', ['auchbsagen']],
  ['Reden ist Silber, …', 'Schweigen ist Gold', ['schweigenistgold']],
  ['Viele Köche …', 'verderben den Brei', ['verderbendenbrei']],
  ['In der Ruhe liegt …', 'die Kraft', ['kraft']],
  ['Kommt Zeit, …', 'kommt Rat', ['kommtrat']],
  ['Ende gut, …', 'alles gut', ['allesgut']],
  ['Gut Ding will …', 'Weile haben', ['weilehaben']],
  ['Wo ein Wille ist, …', 'ist auch ein Weg', ['einweg']],
  ['Steter Tropfen …', 'höhlt den Stein', ['hoehltdenstein']],
  ['Geteiltes Leid ist …', 'halbes Leid', ['halbesleid']],
  ['Wer rastet, …', 'der rostet', ['rostet']],
  ['Wie man in den Wald hineinruft, …', 'so schallt es heraus', ['schalltesheraus', 'schalltesauchheraus']],
  ['Der frühe Vogel …', 'fängt den Wurm', ['faengtdenwurm']],
]

export const sayingQuiz = (): Quiz => {
  const [start, end, more] = pickNew(SAYINGS, s => s[0])
  const head = start.replace(' …', '')
  // Jedes zweite Mal andersherum: Wie fängt es an? Das ist deutlich kniffliger.
  if (Math.random() < 0.5) {
    return { q: `Wie fängt das Sprichwort an? „… ${end}“`, accept: [head], show: `${head} ${end}.`, hint: `Es beginnt mit „${head.split(' ')[0] ?? ''}“.` }
  }
  return { q: `Wie geht das Sprichwort weiter? „${start}“`, accept: [end, ...more], show: `${head} ${end}.`, hint: `Es fängt an mit „${end.split(' ')[0] ?? ''}“.` }
}

const EMOJIS: [string, string, string[]][] = [
  ['🌧️ + ☂️', 'Regenschirm', []], ['❄️ + ⚽', 'Schneeball', []], ['🍎 + 🌳', 'Apfelbaum', []], ['🧊 + 🐻', 'Eisbär', []],
  ['🌊 + 🐴', 'Seepferdchen', ['seepferd']], ['🦶 + ⚽', 'Fußball', []], ['📚 + 🐛', 'Bücherwurm', []], ['☀️ + 🕶️', 'Sonnenbrille', []],
  ['🔑 + 🕳️', 'Schlüsselloch', []], ['🍞 + 🔪', 'Brotmesser', []], ['🧠 + ⚡', 'Geistesblitz', ['gedankenblitz']], ['🐌 + 🏠', 'Schneckenhaus', []],
  ['🍓 + 🍨', 'Erdbeereis', []], ['🌳 + 🏠', 'Baumhaus', []], ['🎵 + 🔑', 'Notenschlüssel', []], ['✈️ + ⚓', 'Flughafen', []],
  ['🐝 + 🏠', 'Bienenstock', ['bienenhaus']], ['☀️ + 🌼', 'Sonnenblume', []], ['🔥 + 🧯', 'Feuerlöscher', []], ['🌙 + 💡', 'Mondlicht', ['mondschein']],
  ['⏰ + 💣', 'Zeitbombe', []], ['🐠 + 🥣', 'Fischsuppe', []],
]

export const emojiQuiz = (): Quiz => {
  const [e, word, more] = pickNew(EMOJIS, x => x[0])
  return { q: `Welches zusammengesetzte Wort steckt in ${e}?`, accept: [word, ...more], show: word, hint: `${word.length} Buchstaben, beginnt mit „${word[0]}“.` }
}

const pad = (n: number) => String(n).padStart(2, '0')

export const clockQuiz = (): Quiz => {
  const h = 6 + Math.floor(Math.random() * 12)
  const m = pick([0, 10, 15, 20, 30, 40, 45, 50])
  const addH = 1 + Math.floor(Math.random() * 4)
  const addM = pick([15, 20, 25, 35, 40, 45, 50])
  const total = h * 60 + m + addH * 60 + addM
  const rh = Math.floor(total / 60) % 24
  const rm = total % 60
  const answer = `${pad(rh)}:${pad(rm)}`
  return {
    q: `Es ist ${pad(h)}:${pad(m)} Uhr. Wie spät ist es in ${addH} Std. ${addM} Min.?`,
    accept: [answer, `${rh}:${pad(rm)}`, `${pad(rh)}${pad(rm)}`, `${rh}${pad(rm)}`],
    show: `${answer} Uhr`,
    hint: 'Erst die Stunden dazu, dann die Minuten.',
  }
}

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

export const weekdayQuiz = (): Quiz => {
  const start = Math.floor(Math.random() * 7)
  const plus = 3 + Math.floor(Math.random() * 25)
  const target = DAYS[(start + plus) % 7] ?? ''
  return {
    q: `Heute ist ${DAYS[start]}. Welcher Wochentag ist in ${plus} Tagen?`,
    accept: [target],
    show: `${target} (${plus} Tage = ${Math.floor(plus / 7)} Wochen und ${plus % 7} Tage)`,
    hint: 'Volle Wochen kannst du weglassen.',
  }
}

// --- Achtsamkeit & Körper ------------------------------------------------------

const v = <T,>(list: readonly T[]) => pick(list)

export const palming = (level: number): Step[] => [
  { text: 'Reib deine Handflächen aneinander, bis sie warm werden.', sec: 8 },
  {
    text: `Lies erst, dann Augen zu: Leg die warmen Hände sanft über die geschlossenen Augen, ohne zu drücken. ${v(['Genieß die Dunkelheit und die Wärme.', 'Lass die Augen in der Dunkelheit ausruhen.', 'Spür, wie die Augenmuskeln weich werden.'])} Nach fünf ruhigen Atemzügen nimmst du die Hände langsam weg.`,
    sec: level >= 3 ? 40 : 30,
  },
  { text: 'Wie fühlen sich deine Augen jetzt an?', sec: 8 },
]

export const shakeOut = (level: number): Step[] => [
  ...shuffle([
    { text: 'Schüttel die Hände aus, ganz locker aus dem Handgelenk.', sec: 8 },
    { text: 'Jetzt die Arme dazu, als würdest du Wasser abschütteln.', sec: 8 },
    { text: 'Im Sitzen: die Beine locker wackeln lassen.', sec: 8 },
    { text: 'Schultern hoch, runter, hoch, runter – ganz schnell, dann Stopp.', sec: 8 },
  ]).slice(0, level >= 2 ? 4 : 3),
  { text: 'Stopp. Spür nach: Wo kribbelt es jetzt?', sec: 10 },
]

export const soundMap = (level: number): Step[] => [
  {
    text: `Lies erst, dann Augen zu: Male im Kopf eine Landkarte aus Geräuschen. ${v(['Was ist vor dir, was hinter dir?', 'Was ist links, was rechts?', 'Was ist ganz nah, was ganz fern?'])}${level >= 3 ? ' Halte am Ende alle Punkte gleichzeitig.' : ''} Öffne die Augen, wenn du so weit bist. Spätestens holt dich der sanfte Klang zurück, wenn Claude fertig ist.`,
    sec: level >= 3 ? 45 : 32,
  },
  { text: v(['Welches Geräusch hat dich überrascht?', 'Welches Geräusch war am gleichmäßigsten?']), sec: 8 },
]

export const thankBody = (level: number): Step[] => {
  const parts = shuffle([
    'deinen Füßen, die dich heute getragen haben',
    'deinen Händen, die so viel für dich tun',
    'deinen Augen, die so viel aufnehmen',
    'deinem Atem, der einfach weitergeht',
    'deinem Rücken, der dich aufrecht hält',
    'deinem Herzen, das ohne Pause schlägt',
  ]).slice(0, level >= 3 ? 4 : 3)
  return [
    { text: 'Eine kleine Dankbarkeit für deinen Körper.', sec: 6 },
    ...parts.map(p => ({ text: `Sag innerlich Danke zu ${p}.`, sec: 9 })),
  ]
}

export const grounding = (level: number): Step[] => [
  { text: v(['Stell beide Füße flach auf den Boden.', 'Spür, wo dein Körper gerade aufliegt.']), sec: 6 },
  { text: v(['Drück die Füße sanft in den Boden, als würdest du Wurzeln schlagen.', 'Stell dir vor, dein Gewicht sinkt mit jedem Ausatmen tiefer.']), sec: 12 },
  { text: v(['Nenne still drei Dinge, die gerade sicher und stabil sind.', 'Spür den Kontakt von Rücken und Stuhl.', 'Leg die Hände auf die Oberschenkel und spür ihr Gewicht.']), sec: 12 },
  ...(level >= 2 ? [{ text: 'Du bist hier. Genau jetzt. Mehr braucht es gerade nicht.', sec: 10 }] : []),
]

export const innerSmile = (level: number): Step[] => [
  { text: 'Lass ein ganz kleines Lächeln entstehen, nur in den Mundwinkeln.', sec: 8 },
  { text: 'Lass das Lächeln in die Augen wandern.', sec: 8 },
  { text: v(['Und weiter in die Schultern, als würden sie mitlächeln.', 'Und in den Bauch, ganz weich.', 'Und in die Hände.']), sec: 10 },
  ...(level >= 3 ? [{ text: 'Bleib einfach mit diesem Lächeln hier.', sec: 15 }] : []),
]

export const butterflyHug = (level: number): Step[] => [
  { text: 'Kreuz die Arme vor der Brust, die Hände liegen unter den Schlüsselbeinen.', sec: 8 },
  { text: 'Tippe abwechselnd mit links und rechts, langsam, wie Flügelschläge.', sec: level >= 3 ? 30 : 22 },
  { text: 'Hör auf und spür nach. Wie fühlt sich dein Brustkorb jetzt an?', sec: 8 },
]

export const deskStretch = (level: number): Step[] => [
  ...shuffle([
    { text: 'Verschränk die Finger, Handflächen nach außen, Arme lang nach vorn schieben.', sec: 10 },
    { text: 'Arme über den Kopf, einmal nach rechts neigen, einmal nach links.', sec: 12 },
    { text: 'Kinn sanft zur Brust, der Nacken wird lang.', sec: 10 },
    { text: 'Im Sitzen: ein Bein ausstrecken, Fußspitze zu dir ziehen. Seitenwechsel.', sec: 14 },
    { text: 'Hände auf die Knie, Rücken rund machen wie eine Katze, dann aufrichten.', sec: 12 },
  ]).slice(0, level >= 2 ? 4 : 3),
  { text: 'Und einmal tief ausatmen.', sec: 5 },
]

// --- Kreativ & Reflexion ---------------------------------------------------------

const JOURNAL = [
  'Was hat dich heute schon überrascht?',
  'Worauf bist du diese Woche ein bisschen stolz?',
  'Was würdest du heute weglassen, wenn du müsstest?',
  'Welche Frage beschäftigt dich gerade am meisten?',
  'Was hast du heute über dich selbst gelernt?',
  'Was ist gerade dein wichtigster Gedanke, in einem Satz?',
  'Wofür hättest du heute gern mehr Zeit?',
  'Was würde dein Tag heute leichter machen?',
  'Welche kleine Entscheidung könntest du heute einfach treffen?',
  'Was möchtest du heute Abend gern erledigt haben?',
  'Was gibt dir gerade Energie, was zieht sie?',
  'Welcher Moment heute war besser als erwartet?',
  'Was würdest du einer Freundin in deiner Lage raten?',
  'Was ist gerade wirklich wichtig, und was nur laut?',
]

export const journal = (): Write => ({
  q: pickNew(JOURNAL, q => q),
  reply: v(['Danke fürs Hinschauen.', 'Gut, dass du es aufgeschrieben hast.', 'Ein Satz Klarheit für zwischendurch.']),
  check: '',
  word: '',
})

const CREATE_MIX = [
  'Gib deinem heutigen Tag einen Buchtitel.',
  'Erzähl deinen Morgen in fünf Emojis.',
  'Schreib ein Mini-Gedicht mit genau vier Wörtern über Kaffee.',
  'Erfinde einen Werbeslogan für deine Lieblingstasse.',
  'Beschreib die Farbe Blau, ohne „Himmel“ oder „Meer“ zu benutzen.',
  'Welches Tier wäre dein Bürokollege – und warum?',
  'Erfinde ein neues Wort für „müde, aber zufrieden“.',
  'Schreib den ersten Satz eines Romans, der in deiner Küche spielt.',
  'Wenn deine Woche ein Song wäre: Wie hieße er?',
  'Beschreib deinen Schreibtisch in drei Adjektiven.',
  'Erfinde eine Mini-Superkraft, die im Alltag wirklich nützt.',
  'Schreib einen Glückskeks-Spruch für dich heute.',
  'Gib deiner aktuellen Aufgabe einen Filmtitel.',
  'Welche drei Dinge würdest du auf eine einsame Insel mitnehmen – heute?',
]

export const createMix = (): Write => ({
  q: pickNew(CREATE_MIX, q => q),
  reply: v(['Herrlich!', 'Kreativität darf Quatsch sein. Schön!', 'Das merk ich mir. 😄']),
  check: '',
  word: '',
})

const CONNECT_MOMENTS = [
  'Denk an jemanden, der dich zuverlässig zum Lachen bringt.',
  'Denk an ein richtig gutes Gespräch aus dieser Woche.',
  'Denk an eine Person, die an dich geglaubt hat, bevor du es selbst tatest.',
  'Denk an jemanden, von dem du etwas Wichtiges gelernt hast.',
  'Denk an einen Moment, in dem dir jemand unerwartet geholfen hat.',
  'Denk an eine Person, die du gern mal wieder sehen würdest.',
  'Denk an jemanden, mit dem Schweigen angenehm ist.',
  'Denk an ein Team, in dem du dich richtig wohlgefühlt hast.',
  'Denk an eine kleine Geste, die dir jemand diese Woche geschenkt hat.',
  'Denk an jemanden, der dich gerade inspiriert.',
]

const CONNECT_FOLLOW = [
  'Was genau schätzt du an diesem Menschen?',
  'Welches Bild taucht als Erstes auf?',
  'Was würdest du der Person gern sagen?',
  'Wie fühlt es sich an, an sie zu denken?',
]

/** Ersetzt den alten „schönen Moment“: viele verschiedene Anstöße. */
export const connectMoment = (): Step[] => [
  { text: pickNew(CONNECT_MOMENTS, x => x), sec: 10 },
  { text: v(CONNECT_FOLLOW), sec: 12 },
  { text: v(['Lass das Gefühl kurz da sein.', 'Vielleicht schreibst du der Person später ein paar Zeilen?', 'Nimm die Wärme mit zurück an deine Aufgabe.']), sec: 8 },
]
