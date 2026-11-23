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

**Am einfachsten:** Öffne in der Claude Desktop-App den Tab **„Code“**, kopiere diesen Text ins Chatfeld und schick ihn ab:

> Bitte installiere mir das Plugin „fokus-pause“. Führe dazu genau diesen Befehl im Terminal aus und sag mir das Ergebnis:
> `C=$(command -v claude || ls -d "$HOME/Library/Application Support/Claude/claude-code/"*/*/claude.app/Contents/MacOS/claude | tail -1); "$C" plugin marketplace add sarah-goettinger/fokus-pause && "$C" plugin install fokus-pause@fokus-pause`

Claude fragt dich eventuell, ob es den Befehl ausführen darf: einfach erlauben. Danach eine **neue Sitzung** starten.

**Oder im Terminal** (wenn `claude` dort installiert ist):

```bash
claude plugin marketplace add sarah-goettinger/fokus-pause
claude plugin install fokus-pause@fokus-pause
```

**Falls ein Apple-Fenster „Entwicklerwerkzeuge installieren“ erscheint:** Das braucht der Mac einmalig, um das Plugin von GitHub zu laden. „Installieren“ klicken, warten, dann den Prompt noch einmal schicken.

## Voraussetzungen

- **Claude Code**, am besten im **Code-Tab der Claude Desktop-App** (dort erscheint das Panel mit Grafik rechts neben dem Chat). Im Terminal funktioniert es auch, die Karten erscheinen dort als Text.
- Eine aktuelle Version von Claude Code. Die Technik dahinter (Plugins mit eigener Oberfläche) ist noch neu.
- Im normalen Claude-Chat, auf claude.ai im Browser oder bei anderen KIs läuft das Panel nicht.

## Prüfen, ob es läuft

1. Im Chat `/fokus info` eingeben. Kommt „Fokus-Pause Version … · … Übungen in 4 Gruppen“, läuft es.
2. Claude etwas Längeres fragen. Rechts öffnet sich das Panel.

## Wenn etwas nicht klappt

| Was passiert | Was hilft |
|---|---|
| `/fokus info` ist ein unbekannter Befehl | Neue Sitzung starten. Hilft das nicht: Claude-App aktualisieren (Menü Claude → Nach Updates suchen). Die Technik ist neu und kommt mit aktuellen Versionen. |
| Installation meldet einen Fehler mit „marketplace“ oder „not allowed“ | Möglicherweise erlaubt deine Firma keine Plugins von außerhalb. Dann bitte die IT fragen. |
| Das Fenster rechts erscheint nicht | Einen Prompt abschicken: Das Fenster öffnet sich beim Abschicken. Liegt rechts ein anderer Bereich davor (Dateien, Browser), nach dem Tab „Fokus-Pause“ schauen. |
| Kein Ton | Der Ton funktioniert nur auf dem Mac. Und unter ⚙️ Anpassen prüfen, ob er an ist. |

## Bedienen

- **⚙️ Anpassen** (unter jeder Übung): die vier Gruppen an- und ausschalten, dazu Ton, Rückkehr-Fragen, Prompt-Frage am Ende und eine gelegentliche „Wie bereit fühlst du dich?“-Frage.
- **Andere Übung** springt weiter, **Schließen** gilt nur für die aktuelle Wartezeit.
- Befehle: `/fokus` (an/aus) · `/fokus woche` (Wochen-Rückblick) · `/fokus info`.

## Gut zu wissen

- Deine Einstellungen, Notizen und Statistik bleiben lokal auf deinem Rechner.
- Für die zwei Rückkehr-Fragen wird dein Auftrag an ein kleines Claude-Modell (Haiku) geschickt, über dein eigenes Claude-Konto. Das kostet pro Auftrag nur einen winzigen Bruchteil eines Cents und lässt sich unter ⚙️ Anpassen abschalten.
- Ein Prototyp: Rückmeldungen sind sehr willkommen.

## Lizenz

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/) mit einer zusätzlichen Erlaubnis (siehe [LICENSE.md](LICENSE.md)):

- ✅ Du darfst die Fokus-Pause privat **und für deine eigene Arbeit nutzen, auch im Job**.
- ✅ Du darfst sie für dich anpassen.
- ❌ Nicht ohne Absprache mit Sarah Göttinger: verkaufen, gegen Geld weitergeben oder in kommerzielle Produkte, Dienstleistungen, Trainings oder Programme einbauen.
