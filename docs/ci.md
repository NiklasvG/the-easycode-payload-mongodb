# Automatische Prüfungen

`.github/workflows/quality.yml` prüft PRs und Änderungen an main/staging mit Node 24 und pnpm 10.23.0. Installation erfolgt mit frozen Lockfile. Typprüfung, ESLint, Vitest, Produktionsbuild, Playwright gegen `pnpm start` sowie Docker-Build und HTTP-Startprüfung sind verpflichtende Schritte.

MongoDB läuft als Wegwerfcontainer mit Replica Set rs0. Der Seed verweigert andere Hosts, Datenbanknamen und nicht leere Datenbanken. Uploads werden synthetisch erzeugt. SMTP verwendet JSON-Transport; Gemini bekommt keinen gültigen Schlüssel. CI enthält keine Produktions-Secrets.

Lokal: dieselben Variablen wie im Workflow setzen, eine leere `easycode_test`-Datenbank im lokalen Replica Set verwenden, `pnpm payload run scripts/seed-test.ts`, `pnpm build`, danach `CI=true pnpm test:e2e`. CI akzeptiert keinen bereits laufenden Entwicklungsserver.

Der Workflow wird erst nach einem Push von GitHub ausgeführt. Lokale erfolgreiche Prüfungen allein bestätigen keinen grünen GitHub-Lauf. Branch Protection muss im Repository auf den Job `verify` eingestellt werden, damit er Merges verbindlich blockiert.
