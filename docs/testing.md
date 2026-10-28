# Verbindliche Testdefinition

Ein Test sichert ein relevantes Produktrisiko ab, verwendet reproduzierbare Daten
und prüft beobachtbares Verhalten. Eine Coverage-Prozentzahl allein ist keine
Freigabe. Asynchrone Server Components werden über den Produktionsserver geprüft,
nicht durch Nachbau des Frameworks in jsdom.

## Pflichtprüfung für Pull Requests und main

| Risiko | Abdeckung | Werkzeug |
| --- | --- | --- |
| Ungültiger Code | TypeScript und ESLint | `pnpm typecheck`, `pnpm lint` |
| Fehlerhafte Fachlogik | Validierung, Suche, URLs, Medienregeln, Fehlerfälle | Vitest |
| Unberechtigte Zugriffe | Anonyme Schreibzugriffe, interne Collections, Drafts, Preview | Vitest, HTTP |
| Datenschutz und Chat | Consent/Widerruf, Eingabelimits, Providerfehler, keine privaten Inhalte im Providerkontext | Komponenten und gemocktes HTTP |
| Veraltete CMS-Inhalte | Veröffentlichung, Bearbeitung, Slug-Wechsel, Rückzug, Löschen, Beziehungen und Globals; Cache, Suche, Sitemap | MongoDB, HTTP, Browser |
| Verlorene Anfragen | Formularvalidierung, erhaltene Eingabe nach Fehler, erfolgreiche Submission, Honeypot, Mail-Empfang | Browser, Mailpit |
| Defekte Besucherwege | Projektübersicht, Filter, Detail, Suche, Redirect, mobiles Menü, Consent, 404 | Playwright |
| Rendering und SEO | Erstinhalt ohne JS, Metadaten, Canonical, strukturierte Daten, Sitemap, Staging-Noindex | Produktionscontainer, HTTP, Browser |
| Unbedienbare Oberfläche | Tastatur, Fokus, Escape, Scrollfreigabe, schmale Ansichten, große Schrift, Cookie-Einstellungen | Komponenten, Browser |
| Defektes Release | Docker-Build, DB-Verbindung, Medien, Readiness und öffentliche Startseite | Docker, Playwright, Deployment-Script |

`pnpm test:deployment` prüft die Freigabelogik ohne Netzwerk: veraltete Commits,
fehlende Konfiguration, fehlgeschlagene Commit-Pins, Buildfehler, Abbruch,
Zeitüberschreitung, falsche Revision und fehlgeschlagene öffentliche Readiness.
Ein API-Fehler darf keine Tokens oder API-Antworten mit Secrets ausgeben.

CMS-REST-Antworten können vor Nexts nachgelagerter Cache-Invalidierung eintreffen.
Die betroffenen HTTP-Prüfungen fragen deshalb höchstens fünf Sekunden lang erneut
ab. Sie verlangen danach den neuen Inhalt beziehungsweise einen echten 404 und
die bereinigte Sitemap; ein bloßes Noindex-Metatag genügt nicht. Die Admin-Prüfung
unterscheidet ausdrücklich zwischen automatischem Entwurfsspeichern und Publish.

## Einordnung aller vorhandenen Suites

Die vorhandenen `tests/int/*.int.spec.ts` bleiben verbindlich: Sie sichern
Fachlogik, Rechte und Komponentenverhalten ab. Die früheren Tailwind-Klassenchecks
im Formular-Zugänglichkeitstest entfallen; Beschriftung, Fehlerzuordnung und
Bedienbarkeit bleiben geprüft. Datenbank- und SMTP-Fälle müssen in CI laufen.

| Browserdateien (`tests/e2e/`) | Einordnung und Grund |
| --- | --- |
| `cms`, `relationships` | Kern: CMS-Lifecycle, Preview, Admin und Invalidierung |
| `security` | Kern: API-/GraphQL-Rechte und interne Daten |
| `form` | Kern: vollständiger Formularweg; ergänzt um Pflichtfeld- und Fehler-/Retry-Fall |
| `visitor` | Kern: Besucherwege, mobiles Menü, Consent, Bildplatzreservierung |
| `server-rendering`, `seo` | Kern: initiales HTML, URLs und Suchmaschinenregeln |
| `accessibility`, `readiness` | Neue Kernfälle: Bedienbarkeit, Reflow, 404 und Containerbereitschaft |
| `frontend` | Audit: einfacher Startseitencheck ist durch Kernfälle abgedeckt |
| `animations`, `hero-motion`, `layout-feedback` | Audit: Animation und exakte Darstellung; Seed enthält zwei Phrasen und Leistungen-Navigation; Projektpfad wird aus CMS-Ausgabe abgeleitet |
| `projects-performance` | Audit: genaue Bilddimensionierung, Kontrast und Motion; funktionale Filterprüfung zusätzlich im Kern |
| `website-quality` | Audit: vollständiger Inhalts-Crawl und umfangreiche Ansichten; Formulare, Reflow und Navigation sind zusätzlich gezielt im Kern abgedeckt |
| `website-performance`, `lighthouse` | Audit: Labormessungen und detaillierte Präsentation; die Datei lighthouse führt keinen vollständigen Lighthouse-Lauf aus |
| `credits` | Audit: redaktionelle Credits-Inhalte und detailliertes Layout |
| `not-found` | Audit: umfangreiche 404-Darstellung/Messung und bekannter No-JS-Frameworkfall; echte 404 und Tastatur-Recovery bleiben im Kern |
| `development` | Nur lokale HMR-Prüfung, kein Releasecheck |

Design-/Performance-Audits sind manuell mit `pnpm test:audit` ausführbar und
blockieren kein Deployment. Ihre Inhaltsannahmen passen nicht automatisch zum
minimalen Seed. Sie sollen gegen eine bewusste lokale Inhaltskopie laufen.
Fehlerberichte bleiben sichtbar. Ein bestätigter Sicherheits-, Funktions- oder
Zugänglichkeitsfehler wird behoben und erhält einen gezielten Kerntest.
`experiments/compiler` bleibt ein separates Experiment.

## Isolierte Ausführung

GitHub Actions erstellt MongoDB 8.0 als Replica Set und ein per Digest festgelegtes
Mailpit. Nur lokale Verbindungen zu `/easycode_test` sind erlaubt. Der Seed prüft
zusätzlich eine leere Datenbank und erzeugt synthetische Inhalte. Niemals echte
Staging-/Live-Zugangsdaten in Testjobs verwenden.

Für einen bewussten lokalen Kernlauf diese Variablen im Testprozess setzen:

```dotenv
TEST_DATABASE=true
TEST_MAILPIT=true
MONGODB_URI=mongodb://127.0.0.1:27017/easycode_test?replicaSet=rs0&directConnection=true
PAYLOAD_SECRET=ci-only-secret-never-use-in-production
PREVIEW_SECRET=ci-preview-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
APP_ENV=staging
SOURCE_COMMIT=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
AI_CHAT_ENABLED=false
EMAIL_TRANSPORT=
SMTP_HOST=127.0.0.1
SMTP_PORT=1026
SMTP_USER=
SMTP_PASS=
PAYLOAD_UPLOAD_DIR=./.test-media
```

Der vorhandene Entwicklungs-Mongo auf Port 27018 wird dafür nicht verwendet.
Mailpit: SMTP 1026, HTTP 8026; keine externen E-Mails oder KI-Anfragen.
Die Playwright-Kernprüfung verweigert externe Anwendungs- und Datenbankziele.

1. Testdienste starten, Replica Set initialisieren, `pnpm test:int` ausführen.
2. `pnpm payload run scripts/seed-test.ts` gegen die leere Testdatenbank ausführen.
3. Docker-Testimage mit BuildKit-Secrets bauen; Datenbank muss aus dem Builder
   erreichbar sein. Nur die Builder-Stufe vom Cache ausschließen.
4. Image mit Testvariablen und schreibbarem Medien-Volume starten. UID/GID 1001
   muss darauf zugreifen können. Readiness abwarten.
5. `PLAYWRIGHT_EXTERNAL_SERVER=true` setzen und `pnpm test:e2e` ausführen.

CI baut das Image genau einmal. Kein zusätzlicher Standalone-Build und keine
doppelte vollständige Browsersuite. Shared-Global-Fälle laufen seriell; die Tests
räumen ihre Dokumente und Änderungen auf. Für einen neuen Seed eine neue leere
Testdatenbank verwenden; keine bestehende Datenbank automatisch löschen.

`pnpm test:e2e` wählt ausschließlich das Projekt `core`. `CI=true` aktiviert das
Verbot von test.only, maximal eine Wiederholung und Fehlschlag bei instabilen oder
übersprungenen Pflichtfällen. Der HMR-Test wird ausschließlich über das Projekt
`development` mit `DEV_HMR_TEST=true` ausgewählt.

## Freigabe und Diagnose

Der Check **Quality gate** muss für main erforderlich sein. Er ist nur grün, wenn
`checks` und `container` erfolgreich sind; auch abgebrochene/übersprungene Jobs
geben keine Freigabe. Pull Requests erhalten keine Deployment-Secrets.

Limits: schnelle Checks 10 Minuten; Integration, Docker und Browser 20 Minuten.
Unter 15 Minuten Gesamtzeit ist ein zu messender Zielwert, keine bereits
nachgewiesene Laufzeit. Reports, Fehler-Screenshots und Traces bleiben 7 Tage,
Deployment-Metadaten 90 Tage erhalten.

Der gelieferte historische Lauf: 143 Vitest-Fälle bestanden; Browser: 39 bestanden,
10 fehlgeschlagen, 1 übersprungen in 29,1 Minuten. Das war kein grüner CI-Lauf.
Der spätere Dockercheck wurde dabei nicht erreicht. Der separate Coolify-Build
war erfolgreich. Aktuelle Prüfergebnisse gehören in den jeweiligen PR und dürfen
nicht durch historische Ergebnisse ersetzt werden.
