# Performance und Betriebsprüfung

Messung nach Produktionsbuild: `node scripts/measure-performance.mjs`. `PERF_ORIGIN`, `PERF_PATHS` (Kommaliste) und `PERF_RUNS` konfigurieren Ursprung, Seiten und Wiederholungen. Ausgabe: `test-results/performance.json` mit LCP, CLS, übertragenen Bytes und TTFB auf 390×844 und 1440×900, jeweils frischer und wiederholter Browserabruf. Lokaler Chromium ohne Drosselung liefert Laborwerte, keine mobilen Feldwerte. Frischer Browser bedeutet keinen kalten Servercache. INP ist ohne repräsentative Interaktionen nicht belastbar; dafür Umami mit Consent nutzen.

Vergleiche: identische Daten, Bilder, Hardware, Chromium-Version und Drosselung; mindestens drei Läufe. Kalten Server separat neu starten. Kalte Builds in separater Checkout-/Build-Umgebung ohne .next messen; warme Builds mit demselben Cache. Dauer und maximalen Speicher festhalten.

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
