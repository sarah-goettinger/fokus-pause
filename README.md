# Fokus-Pause 🌬️

**Ein Panel für Claude Code, das die Wartezeit nutzt, während Claude arbeitet.**

Statt zum Handy zu greifen, bekommst du rechts neben dem Chat eine kurze Übung: atmen, bewegen, knobeln, schreiben oder einen nützlichen Claude-Tipp. Kurz bevor Claude fertig ist, holen dich zwei Fragen zurück zu deinem Thema, damit du bereit bist für die nächste Runde.

Gebaut von **Sarah Göttinger**, als privates Projekt aus eigenem Bedarf.

## Was passiert

- Du schickst Claude einen Auftrag, und rechts öffnet sich das Panel mit einem ruhigen „Ankommen“.
- Dauert es länger als ein paar Sekunden, startet eine Übung aus vier Gruppen, gemischt zu jeder Tageszeit:
  - 🧩 **Rätsel & Spiele**: Knobelrätsel, Wortspiele, Gedächtnis, Kopfrechnen
  - 🌿 **Achtsamkeit & Körper**: Atmen, Bewegen, Wahrnehmen, kleine Check-ins
  - 💡 **Wissen & Claude-Tipps**: praktische Tipps für die Arbeit mit Claude, Fun Facts, schöne Wörter
  - ✍️ **Kreativ & Reflexion**: kurze Schreibimpulse, Menschen, nächster Schritt
- Übungen mit Eingabe warten auf dich. Nichts springt weiter, während du tippst.
- Kurz vor dem Ende: „Gleich geht’s weiter“ mit zwei Fragen zu deinem Auftrag und der Frage, was du Claude als Nächstes sagen willst. Deine Antwort kannst du per Knopf direkt in die Chat-Eingabe übernehmen.
- Ist Claude fertig, erklingt ein sanfter Ton.
- Bewusst ohne Punkte, Highscores, Blinken oder News.

## Installieren

**Am einfachsten:** Kopiere diesen Text in Claude Code und schick ihn ab:

> Installiere mir bitte das Plugin „fokus-pause“ von GitHub: Füge den Marketplace `sarah-goettinger/fokus-pause` hinzu und installiere daraus `fokus-pause` für meinen Benutzer. Sag mir danach, ob ich eine neue Sitzung starten muss.

**Oder selbst im Terminal:**

```bash
claude plugin marketplace add sarah-goettinger/fokus-pause
claude plugin install fokus-pause@fokus-pause
```

Danach eine **neue Sitzung** starten.

## Voraussetzungen

- **Claude Code**, am besten im **Code-Tab der Claude Desktop-App** (dort erscheint das Panel mit Grafik rechts neben dem Chat). Im Terminal funktioniert es auch, die Karten erscheinen dort als Text.
- Eine aktuelle Version von Claude Code. Die Technik dahinter (Plugins mit eigener Oberfläche) ist noch neu.
- Im normalen Claude-Chat, auf claude.ai im Browser oder bei anderen KIs läuft das Panel nicht.

## Prüfen, ob es läuft

1. Im Chat `/fokus info` eingeben. Kommt „Fokus-Pause Version … · … Übungen in 4 Gruppen“, läuft es.
2. Claude etwas Längeres fragen. Rechts öffnet sich das Panel.

## Bedienen

- **⚙️ Anpassen** (unter jeder Übung): die vier Gruppen an- und ausschalten, dazu Ton, Rückkehr-Fragen, Prompt-Frage am Ende und eine gelegentliche „Wie bereit fühlst du dich?“-Frage.
- **Andere Übung** springt weiter, **Schließen** gilt nur für die aktuelle Wartezeit.
- Befehle: `/fokus` (an/aus) · `/fokus woche` (Wochen-Rückblick) · `/fokus info`.

## Gut zu wissen

- Deine Einstellungen, Notizen und Statistik bleiben lokal auf deinem Rechner.
- Für die zwei Rückkehr-Fragen wird dein Auftrag an ein kleines Claude-Modell (Haiku) geschickt, über dein eigenes Claude-Konto. Das kostet pro Auftrag nur einen winzigen Bruchteil eines Cents und lässt sich unter ⚙️ Anpassen abschalten.
- Ein Prototyp: Rückmeldungen sind sehr willkommen.

## Lizenz

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/): frei für private und nicht-kommerzielle Nutzung. Kommerzielle Nutzung, Weiterverkauf oder das Einbauen in eigene Produkte bitte nur nach Absprache mit Sarah Göttinger.
