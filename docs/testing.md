# Testabdeckung und Medienregeln

Vitest prüft isoliert Cache-Schlüssel und Hooks sowie gegen eine lokale Testdatenbank den Seiten-Lifecycle, Editor-Login, Client-Schreibrechte und Upload/Ersetzung. Datenbanktests laufen nur mit `TEST_DATABASE=true` gegen `localhost/easycode_test`; erzeugte Dokumente werden danach gelöscht. Ohne diese Freigabe werden nur die Datenbanktests übersprungen.

Playwrights Visitor-Suite verwendet den synthetischen Seed: Projektübersicht → Detail, Suche, Redirect, mobiles Menü und Consent-Änderung. Die Umami-Komponententests prüfen insbesondere, dass vor Zustimmung kein Tracker geladen wird und nach Widerruf keine Sends mehr erlaubt sind.

Neue Medien: JPEG, PNG, WebP, AVIF, GIF, MP4, WebM und PDF; maximal 20 MiB. SVG/XML sind für neue Uploads ausgeschlossen. Bestehende Dateien werden nicht gelöscht. Das Collection-Limit ergänzt das Transportlimit des Reverse Proxy; für sehr große Requests muss dort ebenfalls ein Limit gesetzt werden.

CMS-Browsertests prüfen REST-Änderung → öffentliche Seite, Slug-Wechsel, Zurückziehen, Löschen, Sitemap-Aktualisierung, Admin-Login sowie Draft Mode und den automatisch geöffneten Live-Preview-Iframe. Posts besitzen jetzt eine eigene Detailroute. Projektseiten prüfen auch den Kunden-Slug. Wegen des gestreamten Ladezustands können fehlende Projekte eine HTTP-200-Hülle liefern; die Tests verlangen dann den Not-found-Inhalt ohne Projekt und das Noindex-Metatag.

Der Formulartest erstellt ein isoliertes Formular und eine Seite, prüft einen voreingestellten Wert, sendet über die Besucheroberfläche und kontrolliert den Empfang in Mailpit. Formular, Seite und Submission werden danach entfernt. Header-/Footer-/Redirect-Änderungen sowie Client-Namen/-Slugs, Medien-Alttexte und verschobene Elternseiten werden als vollständige Systemfälle geprüft. Nicht jede mögliche redaktionelle Feldkombination wird automatisch getestet.

Der SMTP-Adapter wird zusätzlich gegen ein ausschließlich lokal gebundenes Mailpit-Postfach getestet (`TEST_MAILPIT=true`, SMTP 1026, HTTP 8026). Das Image ist im Workflow per Digest fixiert. Gemini-Vertragstests mocken das SDK und decken Validierung, Streaming, Thought-Signature und Providerfehler ab; es wird keine kostenpflichtige Anfrage ausgeführt. Chat-Historie ist auf 20 validierte Nachrichten begrenzt.

Abschluss: 58 Integrationstests erfolgreich; Typprüfung erfolgreich; ESLint 0 Fehler/0 Warnungen. 17 Produktions-Browserfälle sind geprüft, einschließlich der zwei internen Instant-Fälle und künstlich verzögertem Hero-Bild. Der zusätzliche Entwicklungsfall ist im Produktionslauf bewusst übersprungen.

Finales Webpack-Standalone-Image: 15 Browserfälle ohne Retry bestanden; drei Fälle bewusst übersprungen (CSS-HMR und die zwei internen Instant-Fälle). NEXT_INSTANT_TEST exponiert die interne Next-API ausschließlich in isolierten Testbuilds. PLAYWRIGHT_EXTERNAL_SERVER verhindert beim Containercheck den Start eines weiteren Servers. Die CI führt nach dem Docker-Smoke-Test diese Browserprüfung aus.

Turbopack-Entwicklung: Admin-Login, alle 18 Lottie-Icons jeweils mobil/Desktop sowie CSS-Hot-Reload ohne Seitenneuladung bestehen ohne Retry. Zwei sporadische Turbopack-Standalone-Fälle sind in turbopack.md dokumentiert; Webpack bleibt deshalb Standard. Alle eigenen Testcontainer wurden entfernt; der vorhandene lokale Entwicklungs-MongoDB-Container bleibt bestehen. Kein Push und kein Deployment.
