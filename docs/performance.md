# Performance und Betriebsprüfung

Messung nach Produktionsbuild: `node scripts/measure-performance.mjs`. `PERF_ORIGIN`, `PERF_PATHS` (Kommaliste) und `PERF_RUNS` konfigurieren Ursprung, Seiten und Wiederholungen. Ausgabe: `test-results/performance.json` mit LCP, CLS, übertragenen Bytes und TTFB auf 390×844 und 1440×900, jeweils frischer und wiederholter Browserabruf. Lokaler Chromium ohne Drosselung liefert Laborwerte, keine mobilen Feldwerte. Frischer Browser bedeutet keinen kalten Servercache. Nach jeder Messung werden Consent-Ablehnung und Chat-Öffnen/Schließen als kontrollierte Interaktionen ausgeführt. Event Timing liefert labInteractionCandidateMs (nur Ereignisse ab 16 ms); das ist ausdrücklich kein repräsentatives Real-User-INP. Dafür bleibt die consentgebundene Messung der tatsächlichen Installation notwendig.

Vergleiche: identische Daten, Bilder, Hardware, Chromium-Version und Drosselung; mindestens drei Läufe. PERF_START_SERVER=true startet für jeden Fall einen eigenen Next-Prozess auf localhost:3002 (PERF_ORIGIN kann den lokalen Port ändern); Bereitschaft wird ohne wärmenden HTTP-Abruf geprüft. Frischer Browser/neuer Prozess, wiederholter Browser/laufender Prozess und frischer Browser/laufender Prozess werden getrennt erfasst. Das Script beendet ausschließlich seine eigenen Prozesse. Persistente Daten-/OS-Caches werden damit nicht geleert. Kalte Builds in separater Checkout-/Build-Umgebung ohne .next messen; warme Builds mit demselben Cache. Dauer und maximalen Speicher festhalten.

Umami: bestehende Integration aktiviert Performance erst nach Consent. Komponententests prüfen Laden, Widerruf, fremden Tab und unlesbaren Storage. Die Einrichtung des externen Dashboards muss über Coolify verifiziert werden.

Wiederherstellungsprobe: konsistenten MongoDB-Dump und Medienarchiv aus demselben Wartungsfenster in ein neues isoliertes Replica Set und leeres Medienvolume laden. Dokument-/Dateianzahlen, referenzierte Dateinamen und Prüfsummen vergleichen; anschließend öffentliche Seiten, Bildvarianten, Login und Veröffentlichung prüfen. Dauer, Snapshot-Zeitpunkt und fehlende Dateien dokumentieren. Synthetische CI-Daten belegen keine Wiederherstellbarkeit produktiver Backups.

Verfügbarkeit: externes Uptime Kuma auf zweitem Host für Startseite und eine CMS-Seite konfigurieren, erwarteten Text prüfen und Alarmtransport durch kontrollierten Testausfall verifizieren. Ohne Server-/Backup-Zugriff bleiben Ausfallerkennung und produktive Wiederherstellung offen.

## Lokale Ausgangsmessung

Gemessen am 10/03/2026 10:42:54, Produktionsbuild Webpack, synthetische CI-Inhalte, 3 Läufe je Fall. Kein kalter Server und keine Netzwerkdrosselung. Werte sind Mittelwerte der drei Läufe, keine Feldwerte.

| Breite | Seite | Browsercache | LCP ms | CLS | TTFB ms | Bytes |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | / | fresh-browser | 244 | 0 | 23 | 589130 |
| 1440 | / | repeat-browser | 97 | 0 | 24 | 19090 |
| 1440 | /projekte/testkunde/testprojekt | fresh-browser | 239 | 0 | 14 | 383488 |
| 1440 | /projekte/testkunde/testprojekt | repeat-browser | 117 | 0 | 16 | 18988 |
| 1440 | /projekte | fresh-browser | 261 | 0 | 25 | 589127 |
| 1440 | /projekte | repeat-browser | 92 | 0 | 21 | 19090 |
| 390 | / | fresh-browser | 531 | 0.0033 | 25 | 582743 |
| 390 | / | repeat-browser | 84 | 0 | 25 | 14732 |
| 390 | /projekte/testkunde/testprojekt | fresh-browser | 236 | 0 | 16 | 380362 |
| 390 | /projekte/testkunde/testprojekt | repeat-browser | 143 | 0 | 17 | 16228 |
| 390 | /projekte | fresh-browser | 216 | 0 | 24 | 583286 |
| 390 | /projekte | repeat-browser | 68 | 0 | 22 | 15283 |

## Wiederholte Prozessstarts und Layoutprüfung

Zusätzliche Messung mit drei Läufen je Seite/Viewport, frischen Serverprozessen und separaten Browsercaches durchgeführt. Vollständige Antwortzeit ergänzt TTFB, weil Streaming einen frühen ersten Bytewert von der fertigen CMS-Antwort trennt. Die erste mobile Prüfung fand CLS 0,126: Das Hero-Bild nahm seine Fläche erst nach dem Laden ein. Der Bildcontainer erhielt deshalb eine explizite Ressourcen-Aspect-Ratio und ein darin positioniertes Fill-Bild. Header und Streaming-Platzhalter besitzen passende responsive Mindesthöhen.

Das reproduzierbare Rohprotokoll liegt unter measurements/performance-lab-2026-10-03.json. Synthetische Bilder, lokale unge­drosselte Chromium-Läufe und unterschiedliche Build-/Cachezustände erlauben keine pauschale Vorher-/Nachher-Behauptung für produktive Fotos oder Internetverbindungen. Kalter Prozess enthält auch Initialisierungskosten; Feld-INP, Monitoring und echte Backup-Wiederherstellung benötigen weiterhin den produktiven Betrieb.

Build-Zeit und beobachteter Container-Speicher wurden mit je drei identischen, sequenziellen Docker-Compilerläufen verglichen; Tabelle und Grenzen stehen in turbopack.md. Docker-Layer-Cachetreffer werden dabei nicht als Compilerlauf gezählt.

## Nachprüfung der endgültigen Bildflächenreservierung

Drei neue Läufe der Startseite je Viewport; Medianwerte. Parallel lief der Docker-Compiler, deshalb dienen die Zeiten nicht einem Vorher-/Nachher-Geschwindigkeitsvergleich. Der Test mit absichtlich blockiertem Bild belegt unabhängig davon, dass der folgende Inhalt beim Bildempfang seine Position behält.

| Breite | Prozess / Browser | LCP ms | CLS | TTFB ms | vollständige Antwort ms | Bytes |
| --- | --- | --- | --- | --- | --- | --- |
| 390 | new-process / fresh-browser | 1572 | 0.0000 | 459 | 873 | 492722 |
| 390 | running-process / repeat-browser | 352 | 0.0000 | 3 | 52 | 18235 |
| 1440 | new-process / fresh-browser | 1928 | 0.0015 | 524 | 1064 | 496700 |
| 1440 | running-process / repeat-browser | 140 | 0.0000 | 3 | 52 | 22991 |

Rohdaten: measurements/performance-home-after-2026-10-03.json. Die vorherige Messung aller drei Seiten bleibt separat erhalten.
