# Testabdeckung und Medienregeln

Vitest prüft isoliert Cache-Schlüssel und Hooks sowie gegen eine lokale Testdatenbank den Seiten-Lifecycle, Editor-Login, Client-Schreibrechte und Upload/Ersetzung. Datenbanktests laufen nur mit `TEST_DATABASE=true` gegen `localhost/easycode_test`; erzeugte Dokumente werden danach gelöscht. Ohne diese Freigabe werden nur die Datenbanktests übersprungen.

Playwrights Visitor-Suite verwendet den synthetischen Seed: Projektübersicht → Detail, Suche, Redirect, mobiles Menü und Consent-Änderung. Die Umami-Komponententests prüfen insbesondere, dass vor Zustimmung kein Tracker geladen wird und nach Widerruf keine Sends mehr erlaubt sind.

Neue Medien: JPEG, PNG, WebP, AVIF, GIF, MP4, WebM und PDF; maximal 20 MiB. SVG/XML sind für neue Uploads ausgeschlossen. Bestehende Dateien werden nicht gelöscht. Das Collection-Limit ergänzt das Transportlimit des Reverse Proxy; für sehr große Requests muss dort ebenfalls ein Limit gesetzt werden.

Noch erforderlich: redaktioneller Browserablauf mit Bearbeiten/Veröffentlichen/Live Preview, echter SMTP-Vertrag gegen Mailpit, Form-Builder-Endpunkt und kontrollierte Gemini-Antworten sowie Posts-/Projekt-Lifecycle gegen DB. Ein echter Dienstaufruf ist kein Ersatz für isolierte Tests.

Der SMTP-Adapter wird zusätzlich gegen ein ausschließlich lokal gebundenes Mailpit-Postfach getestet (`TEST_MAILPIT=true`, SMTP 1026, HTTP 8026). Das Image ist im Workflow per Digest fixiert. Gemini-Vertragstests mocken das SDK und decken Validierung, Streaming, Thought-Signature und Providerfehler ab; es wird keine kostenpflichtige Anfrage ausgeführt. Chat-Historie ist auf 20 validierte Nachrichten begrenzt.
