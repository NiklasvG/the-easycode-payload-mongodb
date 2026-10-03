# Automatische Prüfungen

`.github/workflows/quality.yml` prüft PRs und Änderungen an main/staging mit Node 24 und pnpm 10.23.0. Installation erfolgt mit frozen Lockfile. Typprüfung, ESLint, Vitest, Produktionsbuild, Playwright gegen `pnpm start` sowie Docker-Build, HTTP-Startprüfung und dieselben Browserfälle gegen das Standalone-Image sind verpflichtende Schritte.

MongoDB läuft als Wegwerfcontainer mit Replica Set rs0. Der Seed verweigert andere Hosts, Datenbanknamen und nicht leere Datenbanken. Uploads werden synthetisch erzeugt. SMTP verwendet das lokale Mailpit; der Docker-Build verwendet JSON-Transport. Gemini bekommt keinen gültigen Schlüssel. CI enthält keine Produktions-Secrets. Beide Produktionsbuilds lesen veröffentlichte CMS-Daten aus der Testdatenbank; Docker erhält die Zugangsdaten als BuildKit-Secrets und nutzt in der Linux-CI das Hostnetzwerk.

Lokal: dieselben Variablen wie im Workflow setzen, eine leere `easycode_test`-Datenbank im lokalen Replica Set verwenden, `pnpm payload run scripts/seed-test.ts`, `pnpm build`, danach `CI=true pnpm test:e2e`. CI akzeptiert keinen bereits laufenden Entwicklungsserver.

Der Workflow wird erst nach einem Push von GitHub ausgeführt. Lokale erfolgreiche Prüfungen allein bestätigen keinen grünen GitHub-Lauf. Branch Protection muss im Repository auf den Job `verify` eingestellt werden, damit er Merges verbindlich blockiert.

Der Workflow startet außerdem ein per Digest fixiertes Mailpit-Postfach. App-SMTP zeigt ausschließlich auf 127.0.0.1:1026 mit leeren Zugangsdaten; Nachrichten verlassen den Testdienst nicht. Das Docker-Smoke-Image erhält dieselben Testvariablen und ein schreibgeschütztes synthetisches Medienvolume.

Die SSR-Browserfälle prüfen die erste Anzeige ohne JavaScript und ohne Ladehülle. PLAYWRIGHT_EXTERNAL_SERVER verhindert beim Containercheck den Start eines zusätzlichen Servers.
