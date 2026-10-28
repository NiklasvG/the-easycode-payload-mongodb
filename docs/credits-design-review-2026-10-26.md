# Credits – Design Engineering, 26. Oktober 2026

## Änderung

Die Credits-Seite nutzt dieselbe dunkle/türkise Gestaltung wie die überarbeitete 404: große Typografie, dezente Konturen und ein eigenes, statisches Code-/Herz-Motiv. Der Einstieg und die Quellenkarten werden serverseitig gerendert. Keine neue Bibliothek, Animation oder Bildanfrage.

| Before | After | Why |
| --- | --- | --- |
| Zwei Quellen in einem unstrukturierten Textabschnitt | Quellenkarten anhand der vorhandenen CMS-h2-Überschriften | Verständliche Gruppierung, auch bei zusätzlichen Quellen |
| Kleine Attributionslinks | Mindestens 44px hohe, unterstrichene Links mit bestehendem Fokusrahmen | Touch- und Tastaturbedienung |
| Allgemeiner Low-Impact-Einstieg | Credits-spezifische Komposition mit dekorativem SVG | Markenkohärenz zur 404 |

CMS-Titel, Überschriften, Attributionstexte, URLs, New-Tab-Verhalten und Inhalte bleiben unverändert. Lordicon bleibt `https://lordicon.com/` mit neuem Tab und sicheren Rel-Attributen; Freepik bleibt die redaktionell hinterlegte Adresse `http://www.freepik.com` im selben Tab. Keine Lizenzbehauptungen oder neuen Anbieter ergänzt. Keine CMS-Daten geändert.

Die Sonderdarstellung greift nur bei der CMS-Seite mit Slug `credits`. Bestehende Draft-/Live-Preview-, Redirect-, Metadaten- und ISR-Logik bleiben erhalten. Andere Seitentypen, Hero-Varianten und Blocktypen verwenden ihre bisherigen Renderer. CMS-Spaltenbreiten bleiben wirksam; freie Einleitungen, zusätzliche Quellen, formatierte Links und leere Lexical-Felder sind berücksichtigt. Die neuen allgemeinen Zeilen „Quellen & Ressourcen“ und „Danke an die kreativen Köpfe dahinter.“ gehören zur Darstellung; vorhandene redaktionelle Quellenangaben bleiben vollständig im CMS editierbar.

## Prüfung

Projektregeln und lokale Next-16.3.8-Dokumentation zu Server Components/CSS Modules gelesen; bestehende Design-/Mobile-Skills angewendet. Zwei Unteragenten haben Gestaltung und CMS-/Accessibility-Grenzfälle unabhängig geprüft. Drei Funde umgesetzt: CMS-Spaltenbreiten, normaler Textfluss in formatierten Links und keine leeren Quellenkarten.

Integration: 139 bestanden, vier wegen fehlender isolierter Datenbank-/Mailpit-Umgebung übersprungen. Produktionsbuild erfolgreich mit 29 generierten Seiten und ohne finale Compiler-Warnung; vollständiger ESLint, Typprüfung, Formatprüfung der neuen Dateien und `git diff --check` erfolgreich. Die erste Buildprüfung fand zwei fehlerhafte Typangaben im neuen Test; diese wurden korrigiert.

Browserlauf: drei neue Credits-Prüfungen erfolgreich, darunter unveränderte CMS-Quellen/Linkziele, zehn Breiten-/Schriftkombinationen bei320/390/768/1440/1920px und100/200% Schrift, mindestens44px hohe Links, keine Überläufe oder JavaScript-Ausnahmen, Inhalte ohne JavaScript sowie Sprunglink/Fokus per Tastatur. Finale Screenshots bei390/1440px visuell kontrolliert.

Der zusätzliche Regressionslauf umfasste15 Prüfungen:14 regulär erfolgreich und der bereits dokumentierte, ausdrücklich erwartete No-JS-Fehlschlag der **404**. Playwright meldet zusammen „15 passed“; die Credits-Seite selbst funktioniert ohne JavaScript. Diese bekannten404-Grenze wurde in diesem Folgeauftrag nicht verändert. Alle zehn CMS-Seiten und fünf Projekte sowie Suche/Leerzustand erneut bei1440/320px geprüft:34 Kombinationen, HTTP200, jeweils eine Hauptüberschrift, keine Überläufe und keine JavaScript-Ausnahmen. [Aktuelle Abdeckung](measurements/credits-site-coverage-2026-10-26.json).

Die isolierte Prüfung lief mit `NEXT_BUILD_DIR=.next/credits-review` auf Port3002. Die bestehende Standalone-Startwarnung ist unverändert; keine Hostingänderung. Automatisch ergänzte Typkonfiguration anschließend auf den vorgefundenen Entwicklungsstand zurückgesetzt; bestehender Entwicklungsserver auf Port3000 erhalten. Screenshots liegen im ignorierten Ordner `test-results/credits.e2e-credits-reflow-6e599-top-including-enlarged-text-chromium/`.

Browserprüfungen vergleichen Quellen und Links mit der aktuellen CMS-API, prüfen 320/390/768/1440/1920px einschließlich 200% Schrift sowie Tastatur und Darstellung ohne JavaScript. Zusätzlich wird der bestehende Prüfpfad für alle veröffentlichten Seiten/Projekte, gemeinsame Navigation, Suche, lokal simulierte Formularzustände und die 404 ausgeführt. Keine echten Nachrichten, Schreibabläufe oder Veröffentlichung. Mobile Nutzung ist browseremuliert; kein physisches Smartphone, Safari-/Firefox- oder echter Screenreadertest.
