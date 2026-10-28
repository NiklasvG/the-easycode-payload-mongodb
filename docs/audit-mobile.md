# Mobile, Barrierefreiheit und Grenzfälle

## Analyse vor der Umsetzung

Skills: `mobile-native`, `break-ui` einschließlich `CATALOG.md`; lokale Next.js-Dokumentation zu Accessibility und Link gelesen. Kein Expo-/Swift-Code im zugewiesenen Bereich.

| Wert | Quelle | Grenze | Optional |
| --- | --- | --- | --- |
| Feldlabel, Placeholder, Submitlabel | Payload Form Builder | keine Längengrenze gefunden | ja |
| Text, E-Mail, Textarea, Zahl | Form Builder / Besuchereingabe | Backend 4000 Zeichen pro Wert, 16000 Bytes gesamt | abhängig von required |
| Felder / Optionen | CMS | Backend maximal 50 übermittelte Felder | ja |
| Feldbreite | CMS | 0–100%, Frontend Klassenzuordnung | ja |
| Bestätigung | CMS Lexical / redirect | keine Textgrenze gefunden | ja |
| Chatnachricht | Besuchereingabe / NDJSON-Antwort | Chat-Protokoll begrenzt Eingabe; Modellantworten Markdown | ja |
| Chatstatus | API / Abbruch / Cooldown | feste Meldungen | ja |
| Consentdetails | feste Texte / Browserstorage | Notwendig + Analyse | nein |
| Bildhinweis | Media.isAIGenerated | fester Hinweistext | ja |

| # | Schwere | Feld / Grenzfall | Befund vor Fix | Vorgesehene Korrektur |
| --- | --- | --- | --- | --- |
| 1 | Broken | Halb-/Viertelspalten, 320px, lange Labels | CMS-Breiten gelten mobil unverändert; winzige Eingabespalten | mobil volle Breite, CMS-Spalten erst ab sm, min-width:0 |
| 2 | Broken | erforderliches Select / Checkbox | Fehler ohne aria-describedby/aria-invalid; Select-Controller ohne blur/ref | Fehler-ID, ARIA und Controlleranschluss |
| 3 | Broken | Serverfehler / Erfolg | Status/Fokus fehlen, englische technische Fehlermeldungen; Spinner ohne Beschriftung | deutscher wiederholbarer Fehler, fokussierte Statusregion, benannter Ladezustand |
| 4 | Broken | kleiner Querformatviewport / große Schrift | Cookie-Einleitung und Footer schrumpfen nicht und sind nicht scrollbar | gesamtes Banner scrollbar, sichere Abstände |
| 5 | Broken | Chat offen ohne Einwilligung / Escape | Fokus zielt auf deaktivierte Eingabe; Schließen verliert Fokus | passende Initialfokussierung und Escape mit Rücksprung |
| 6 | Fragile | lange Markdown-URL, Streaming | scrollIntoView auf jeder Änderung bewegt ggf. ganze Seite; kein Rücksicht auf Leseposition | nur inneren Scrollbereich aktualisieren, nur wenn am Ende, lange Wörter umbrechen |
| 7 | Fragile | Touch / große Schrift | kleine Checkbox/Select-Optionen, Textarea nicht vergrößerbar | größere Ziele, 16px Eingaben, vertikale Resize-Möglichkeit |

Vorhanden robust: Honeypot ist aus Tastatur-/Screenreaderfluss entfernt; Chat wartet auf ausdrückliche Einwilligung und bricht Anfragen bei Widerruf ab; Consent behandelt gesperrten Storage; Bildhinweis benutzt Portal, Escape und zugänglichen Namen. Keine echten Gerätetests verfügbar; Browseremulation erfolgt zentral durch Hauptagenten.

## Umsetzung und Prüfung

Nach obiger Analyse als eigener Arbeitsschritt umgesetzt:

- Responsive CMS-Spalten und min-width:0, 16px Eingaben, sichtbare Fokusringe, lesbare Labels, vergrößerbare Textarea, größere Select-/Checkbox-Ziele.
- Required/invalid/error-Verknüpfungen für alle Formularfeldtypen; Selects leiten Controller-Ref und Blur weiter. Texteingaben beachten 4000-Zeichen-Backendgrenze, Required-Whitespace wird lokal abgefangen, E-Mail-Prüfung entspricht dem Backend.
- Wiederholbare deutsche Server-/Netzwerkfehler erhalten die Eingaben; nicht-JSON-Fehlerantworten funktionieren. Doppelsenden wird gesperrt. Laden ist benannt, Erfolg/Fehler haben Statussemantik und Fokus.
- Cookie-Panel ist vollständig scrollbar, berücksichtigt Safe Area, benennt beide Checkboxen, ist per Label bedienbar und stellt nach manuellem Aufruf den Fokus wieder her. Motion auf kurze Opazität reduziert.
- Chat nutzt dynamische Viewporthöhe/Safe Area, Escape und Rücksprung zum Launcher. Consent bekommt den Anfangsfokus, Nachrichten halten Scrollen im Chat, respektieren Leseposition und lange URLs. Fokus-/Status-/Datenschutzfunktionen bleiben erhalten. Dauer-Puls entfällt.

`AIImageBadge` geprüft und unverändert: keine lokale Funktionskorrektur erforderlich; vergrößerte Trefferfläche als zentraler CSS-Fund an Hauptagenten gemeldet.

Gezielte lokale Prüfung: **23/23 Tests in 5 Dateien bestanden**, eingeschränkte ESLint-Prüfung aller geänderten Produktionsbereiche und Regressionstests **ohne Befund**. Neue Regressionstests: Feldfehler/Fokus, mobiles Einspaltengrid, lange E-Mail und nicht-JSON-Fehler, Doppelsenden, benannter Lade-/Erfolgszustand, Required-Whitespace, leere/einzelne Felder, Backend-Textgrenze, Chat-Escape, initialer Einwilligungsfokus, Cookie-Fokusrückkehr und Vermeidung von globalem scrollIntoView. Sämtliche Netzwerkanfragen in Tests sind gemockt; keine Nachricht versendet. Ein erster eingeschränkter Vitest-Lauf scheiterte an temporären Prozess-/Dateirechten; erneuter Lauf mit lokalen Prozessrechten grün.

Temporärer dev-only Harness `/prototypes/form-edge-cases` bot Demo data / Worst case / Empty / One an echten FormBlock-Props, mit sicher abgefangenem Submit ohne Anfrage. Daten enthalten 25/75%-Spalten, lange deutsche Labels, lange E-Mail, diakritische Namen/Emoji/CJK und eine Beschreibung bis 4000 Zeichen. Der Hauptagent prüfte alle vier Datensätze bei320/1440px im isolierten Browser; Formular-scrollWidth entsprach stets clientWidth. Nach Logokorrektur auch bei320px/200%-Schrift kein Dokumentüberlauf. Visuelle Sichtprüfung auf Desktop/Mobil durchgeführt. Die Testroute ist vollständig entfernt; Fixtures bleiben in Regressionstests. Keine Hardwaretests behauptet.

Zentraler erster 320px-Browsertest fand zusätzlich ein Rasterproblem trotz min-width:0: elf horizontale 24px-Gaps im 12-Spalten-Raster erzwingen 264px Mindestbreite und clippten Inhalte im 231px-Formular. Korrektur: tatsächlich eine Spalte auf Mobilgeräten und erst ab sm zwölf Spalten; CMS-Spans entsprechend auf sm begrenzt. Separat korrigiert wurde der rein temporäre Harness-SSR-Initializer (URL-Parameter werden serverseitig übergeben).

Unabhängige read-only Code-Gegenprüfung von Header/Nav/Link des Hauptagenten: native Dialogfokusführung, Escape/Close, Scroll-Cleanup, Breakpoint, pathname-Key und Resolver für verschachtelte CMS-Seiten schlüssig; kein blockierender Befund. Zentrale Browserprüfung soll zusätzlich Tab/Shift+Tab, Escape-Rückkehr, Routewechsel bei offenem Menü und Resize über 1024px abdecken.

Finale zentrale Browserprüfung: diese Navigationsfälle bestanden. Zusätzlich Kurzviewport-/Großschrift-Cookieprüfung mit Fokusrückkehr und echter Kontaktformularoberfläche bestanden: E-Mail-Validierung lokal, abgefangene503-Antwort mit Datenerhalt/Fehlerfokus und abgefangene200-Wiederholung mit Erfolg. Keine Übermittlung oder CMS-Datenschreibaktion. Gesamtergebnisse im gemeinsamen Website-Audit.
