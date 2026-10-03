# Testabdeckung und Medienregeln

Vitest prüft isoliert Cache-Schlüssel und Hooks sowie gegen eine lokale Testdatenbank den Seiten-Lifecycle, Editor-Login, Client-Schreibrechte und Upload/Ersetzung. Datenbanktests laufen nur mit `TEST_DATABASE=true` gegen `localhost/easycode_test`; erzeugte Dokumente werden danach gelöscht. Ohne diese Freigabe werden nur die Datenbanktests übersprungen.

Playwrights Visitor-Suite verwendet den synthetischen Seed: Projektübersicht → Detail, Suche, Redirect, mobiles Menü und Consent-Änderung. Die Umami-Komponententests prüfen insbesondere, dass vor Zustimmung kein Tracker geladen wird und nach Widerruf keine Sends mehr erlaubt sind.

Neue Medien: JPEG, PNG, WebP, AVIF, GIF, MP4, WebM und PDF; maximal 20 MiB. SVG/XML sind für neue Uploads ausgeschlossen. Bestehende Dateien werden nicht gelöscht. Das Collection-Limit ergänzt das Transportlimit des Reverse Proxy; für sehr große Requests muss dort ebenfalls ein Limit gesetzt werden.

CMS-Browsertests prüfen REST-Änderung → öffentliche Seite, Slug-Wechsel, Zurückziehen, Löschen, Sitemap-Aktualisierung, Admin-Login sowie Draft Mode und den automatisch geöffneten Live-Preview-Iframe. Posts besitzen eine eigene Detailroute. Projektseiten prüfen auch den Kunden-Slug. Fehlende Projekte liefern ohne Ladehülle den Not-found-Inhalt und das Noindex-Metatag.

Der Formulartest erstellt ein isoliertes Formular und eine Seite, prüft einen voreingestellten Wert, sendet über die Besucheroberfläche und kontrolliert den Empfang in Mailpit. Formular, Seite und Submission werden danach entfernt. Header-/Footer-/Redirect-Änderungen sowie Client-Namen/-Slugs, Medien-Alttexte und verschobene Elternseiten werden als vollständige Systemfälle geprüft. Nicht jede mögliche redaktionelle Feldkombination wird automatisch getestet.

Der SMTP-Adapter wird zusätzlich gegen ein ausschließlich lokal gebundenes Mailpit-Postfach getestet (`TEST_MAILPIT=true`, SMTP 1026, HTTP 8026). Das Image ist im Workflow per Digest fixiert. Gemini-Vertragstests mocken das SDK und decken Validierung, Streaming, Thought-Signature und Providerfehler ab; es wird keine kostenpflichtige Anfrage ausgeführt. Chat-Historie ist auf 20 validierte Nachrichten begrenzt.

Historischer Abschluss vor der Prerendering-Umstellung: 58 Integrationstests erfolgreich; Typprüfung erfolgreich; ESLint 0 Fehler/0 Warnungen. 17 Produktions-Browserfälle wurden geprüft, einschließlich der damals verwendeten zwei internen Instant-Fälle und künstlich verzögertem Hero-Bild. Der zusätzliche Entwicklungsfall wurde im Produktionslauf bewusst übersprungen.

Die Instant-Fälle wurden durch Browsertests der vollständigen ersten Anzeige ohne JavaScript ersetzt. Die interne Next-Test-API ist entfernt. PLAYWRIGHT_EXTERNAL_SERVER verhindert beim Containercheck den Start eines weiteren Servers. Die CI führt nach dem Docker-Smoke-Test dieselbe Browserprüfung gegen das Standalone-Image aus.

Prerendering-Umstellung: Webpack-Produktionsbuild gegen das vorhandene lokale CMS erfolgreich; die Startseite und veröffentlichte CMS-/Projektseiten stehen im Prerender-Manifest. Die Startseite liefert X-Nextjs-Cache: HIT. Beide Browserfälle gegen den Produktionsserver mit deaktiviertem JavaScript bestanden. Typprüfung und gezieltes ESLint bestanden; Vitest: 56 bestanden, vier wegen fehlender isolierter Datenbank-/Mailpit-Voraussetzungen übersprungen. Docker-/Coolify-Deployment wurde bei dieser Prüfung nicht ausgeführt.

Turbopack-Entwicklung: Admin-Login, alle 18 Lottie-Icons jeweils mobil/Desktop sowie CSS-Hot-Reload ohne Seitenneuladung bestehen ohne Retry. Zwei sporadische Turbopack-Standalone-Fälle sind in turbopack.md dokumentiert; Webpack bleibt deshalb Standard. Alle eigenen Testcontainer wurden entfernt; der vorhandene lokale Entwicklungs-MongoDB-Container bleibt bestehen. Kein Push und kein Deployment.
