# Livegang-Prüfung vom 5. November 2026

## Nacharbeit am selben Tag

Dieser Bericht hält die ursprüngliche Prüfung fest. In der laufenden
Livegang-Vorbereitung wurden Next.js auf 16.4.5 und Payload auf 3.93.0 aktualisiert.
Der erneute Produktions-Audit meldet nur noch einen niedrigen deepmerge-Befund,
keine kritischen, hohen oder mittleren Befunde. 150 Integrationstests und die
Typprüfung bestanden; ein lokaler Produktionsbuild war erfolgreich. Weitere
Container-/Browserprüfungen und die Betriebsumstellung sind separat abzunehmen.

Die vorhandenen Easycode-DB-/Dateibackups wurden inzwischen über die tatsächliche
Coolify-Installation lesend bestätigt, jeweils mit erfolgreichem S3-Upload vom
5. November. Die unabhängigen Zeitpläne ersetzen keinen gemeinsamen Restoretest.
Der globale OpenAI-Endpunkt wurde mit einer synthetischen Anfrage erfolgreich
getestet (HTTP 200); der EU-Endpunkt wies den vorhandenen Schlüssel mit
`incorrect_hostname` ab. Der gewünschte globale Produktionsbetrieb wird explizit
vorbereitet. Der neue Releaseablauf ist in [release-workflow.md](release-workflow.md)
beschrieben. Die folgenden ursprünglichen Befunde sind entsprechend zeitlich einzuordnen.

## Entscheidung

**Der aktuelle Stand sollte noch nicht produktiv geschaltet werden.** Die technische
Deploymentkette ist nachgewiesen funktionsfähig. Vor dem Livegang müssen insbesondere
die Sicherheitsbefunde bearbeitet und die tatsächlich veröffentlichten
Datenschutzinformationen mit dem Betrieb abgeglichen werden. Für Wiederherstellung,
Monitoring und die finale Domainumstellung fehlen in dieser Prüfung belastbare Nachweise.

Die Prüfung umfasste Repository, Lockfile, GitHub-Checks und Branchschutz sowie
lesende HTTP-Abfragen der öffentlichen Staging-Anwendung. Es wurden keine Inhalte
im CMS verändert, Nachrichten versandt, Deployments gestartet oder Domains umgestellt.

## Bestätigte Ergebnisse

| Bereich | Ergebnis und Beleg |
| --- | --- |
| GitHub-main | `9a2435e890875f5ffeb0486e179ed5a49f85ec6d` |
| Lokaler Stand | `e09ec69`; gegenüber dem genannten main-Commit kein Dateiunterschied. Die bereits vorhandene unversionierte `docs/PROJEKT-SETUP-VORLAGE.md` wurde nicht verändert. |
| CI | [Quality-Lauf vom 28.10.2026](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/40650392017) erfolgreich: Typprüfung, ESLint, Deploymenttests, Integrationstests, Dockerbuild, Containerstart, Browser-Kerntests, Quality gate und Staging-Deployment. Dies ist ein vorhandener CI-Lauf, kein heute neu ausgeführter Volltest. |
| Branchschutz | `main` geschützt; `Quality gate` erforderlich; Regeln gelten auch für Admins. Konfigurierte Anzahl erforderlicher Review-Freigaben: 0. |
| Aktive Revision | `GET https://staging.the-easycode.eu/api/health/ready`: HTTP 200, `status=ready`, Revision entspricht GitHub-main. |
| Seiten | Alle 15 URLs aus der Staging-Sitemap liefern HTTP 200. Eine bewusst unbekannte URL liefert HTTP 404. Das ist eine HTTP-Prüfung, keine vollständige visuelle oder interaktive Abnahme. |
| Öffentliche Leserechte | Anonyme GET-Abfragen von `/api/users` und `/api/form-submissions` liefern HTTP 403. |
| HTTPS-Header | Auf Staging HSTS, `nosniff`, CSP-Grundschutz und `noindex, nofollow` vorhanden. |
| Staging-SEO | `robots.txt` sperrt Crawling; Sitemap und Startseiten-Canonical zeigen auf die Staging-Domain. In dieser Phase korrekt. |
| Lokale Deploymenttests | `node --test scripts/deploy-coolify.test.mjs`: 16 bestanden, 0 fehlgeschlagen, 0 übersprungen. Diese Fälle simulieren die Deployment-API. |

Historische Hinweise in `docs/testing.md` auf fehlgeschlagene Browserprüfungen
sind damit keine zutreffende Beschreibung des letzten GitHub-Laufs mehr.

## 1. Sicherheitsabhängigkeiten vor dem Livegang bearbeiten

`pnpm audit --prod --json` wurde am Prüfungstag erfolgreich gegen die Registry
ausgewertet und meldet **25 Befunde: 3 kritisch, 8 hoch, 10 mittel, 4 niedrig**.
Der Audit selbst endet wegen der Befunde mit Exitcode 1. Er untersucht den
Produktions-Abhängigkeitsbaum aus dem Lockfile; er beweist keine erfolgreiche
Ausnutzung und keine Erreichbarkeit jedes betroffenen Codes im laufenden Image.

| Paket im Lockfile | Stand | Mindestens korrigierter Stand laut aktuellen Meldungen | Maßnahme |
| --- | --- | --- | --- |
| Next.js | 16.3.8 | 16.4.1 | Mit Payload kompatibel aktualisieren; Next-bezogene Werkzeuge abstimmen. |
| DOMPurify | 3.4.16 | 3.4.17 | Bestehenden Override aktualisieren bzw. durch korrigierte reguläre Auflösung ersetzen. |
| Undici über Payload | 7.30.0 | 7.30.1 | Override und tatsächlich aufgelöste Version korrigieren. |
| Happy DOM über Lexical | 20.14.5 | 21.0.4 für die aktuell gemeldeten Befunde | Bevorzugt kompatibles Payload-/Lexical-Update; einen Major-Override gesondert validieren. |
| Nodemailer | 10.0.13 | 10.1.4 | Override korrigieren, SMTP und Formulare erneut prüfen. |
| fast-uri über AJV | 3.1.8 | 3.1.9 | Transitive Auflösung aktualisieren. |
| deepmerge | 4.3.1 | Keine korrigierte Version im Audit angegeben | Niedrigen Befund auf verwendete Aufrufpfade prüfen und dokumentiert behandeln; keine fiktive Fixversion setzen. |

Diese Versionsangaben sind Mindeststände für die hier gefundenen Meldungen,
keine pauschale Kompatibilitätszusage und keine abschließende Updateplanung.

Besonders relevant ist [GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r):
Der Hersteller beschreibt einen Denial of Service bei App-Router-Anwendungen mit
mindestens einer Server Action. `src/app/(payload)/layout.tsx` enthält eine
`'use server'`-Funktion; die beschriebenen grundlegenden Anwendungsvoraussetzungen
sind hier erfüllt. Es wurde kein Angriffsversuch durchgeführt.

Zwei wichtige Einschränkungen zu den kritischen Next-Meldungen:

- Für [GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)
  nennt der Hersteller `sharp >= 0.35.5` als Workaround. Das Lockfile enthält
  ausschließlich Sharp 0.35.5; der Workaround ist im geprüften Abhängigkeitsstand
  damit berücksichtigt. Das tatsächlich gebaute Image wurde nicht intern untersucht.
- Die zweite kritische Next-Meldung
  [GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)
  betrifft besondere `use cache`-Rückgaben. `next.config.js` setzt
  `cacheComponents: false`; die Ausnutzbarkeit ist hier nicht nachgewiesen.

Auch die [kritische DOMPurify-Meldung](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7)
hat spezifische Konfigurations- und Eingabevoraussetzungen. Eine erreichbare
Angriffskette durch Monaco/Payload wurde nicht nachgewiesen. Der Befund bleibt
bis zum Update oder einer begründeten Bewertung offen.

**Abnahme:** Lockfile aktualisieren; vollständigen Quality-Lauf wiederholen;
Produktions-Audit erneut ausführen. Hohe/kritische Befunde beheben oder ihre
Nichtbetroffenheit konkret belegen. `.github/workflows/quality.yml` enthält bislang
keinen Abhängigkeits-Audit; ein grüner Quality-Lauf bewertet diese Meldungen nicht.

## 2. Veröffentlichte Datenschutzseite stimmt nicht mit dem Projekt überein

Die am Prüfungstag abgerufene
[Staging-Datenschutzseite](https://staging.the-easycode.eu/datenschutz)
beschreibt unter anderem:

- Hosting und CMS-Infrastruktur bei Vercel;
- Sentry zur Fehleranalyse;
- Google Analytics 4 und Google Ads;
- Gemini API im Free Tier als Chat-Anbieter.

Der aktuelle Code und die Deploymentunterlagen sehen Hetzner/Coolify, Umami und
OpenAI vor. `GET /api/ai-chat` meldet auf Staging `available: true`; eine Nachricht
wurde nicht gesendet. Die Antwort bestätigt nur die konfigurierten Schalter und
Voraussetzungen, keine erfolgreiche Provideranfrage und keine Vertragsfreigabe.

Der überarbeitete Markdown-Entwurf in `docs/datenschutzerklaerung-entwurf.md`
aktualisiert die Payload-Seite nicht automatisch. Er enthält außerdem noch offene
Angaben zu Protokollen, Analytics-Aufbewahrung, Chat-Betriebsmodus und Backups.

**Abnahme:** Tatsächliche Dienste und Speicher-/Löschregeln feststellen, passenden
Text fertigstellen und im CMS veröffentlichen; danach die ausgelieferte Seite
erneut abgleichen. Consent und Widerruf in der realen Installation prüfen.
Dies ist eine Feststellung zur inhaltlichen Übereinstimmung, keine rechtliche Freigabe.

## 3. Chat-Betriebsmodus für Produktion entscheiden

`src/app/api/ai-chat/route.ts` erlaubt den globalen OpenAI-Endpunkt ausschließlich
bei `APP_ENV=staging`. Produktion verlangt für den EU-Endpunkt
`OPENAI_CHAT_REGION=eu`, `OPENAI_EU_APPROVED=true`, einen API-Schlüssel und einen
vertrauten Client-IP-Header. Die Unterlagen belegen einen globalen Staging-Test;
eine aktuelle EU-Freigabe wurde hier nicht nachgewiesen.

**Abnahme:** Entweder mit deaktiviertem Chat starten oder die tatsächlichen
Voraussetzungen für EU-Betrieb bestätigen und den vollständigen Chatablauf testen.
Den Freigabeschalter erst entsprechend dieser Bestätigung setzen. Beim Wechsel
auf Produktion nicht voraussetzen, dass der bisherige globale Chat weiterläuft.

## 4. Betriebsnachweise vervollständigen

Die Deploymentunterlagen dokumentieren einen Import vom 27.10.2026 mit 10 Pages,
5 Projects, 35 Media-Dokumenten und 202 Mediendateien. Das ist eine historische
Momentaufnahme. Die heutige HTTP-Prüfung weist weder einen aktuellen vollständigen
Datenabgleich noch ein funktionierendes Backup nach.

Vor Umschaltung nachweisen:

- [ ] MongoDB **und** Medien extern sichern; Rhythmus, Aufbewahrung und Fehleralarm festhalten.
- [ ] Beide Bestände gemeinsam in einer isolierten Umgebung wiederherstellen und Beziehungen/Medien prüfen.
- [ ] Rückkehr zu einem vorherigen Image proben und die Grenzen eines Datenbank-Rollbacks festhalten.
- [ ] Monitoring für öffentliche Erreichbarkeit, Readiness, Fehler und Speicherplatz samt Alarmempfang testen.
- [ ] In der Zielinstallation Login, Upload/Ersetzung, Veröffentlichung/Preview und Kontaktformular mit tatsächlichem SMTP-Empfang abnehmen.
- [ ] Prüfen, dass neu angelegte Inhalte und Uploads einen weiteren Deploy überstehen.
- [ ] Image-Referenz/Digest und den tatsächlichen Build-/Appserver dokumentieren.
- [ ] Bei Nutzung zeitgesteuerter Veröffentlichungen externen Scheduler mit `CRON_SECRET` nachweisen.

Diese Punkte sind **in dieser Prüfung nicht belegt**. Daraus folgt nicht, dass
die Einrichtungen auf den Servern zwingend fehlen. Es gab keinen authentifizierten
Zugriff auf Coolify, Server, Backups oder Registry.

## 5. Produktionsumschaltung vorbereiten und abnehmen

- [ ] Abgenommenen Commit und aktuellen Inhaltsbestand festlegen; Änderungen an der bisherigen Quelle während der finalen Übernahme kontrollieren.
- [ ] Produktionsdomain und `NEXT_PUBLIC_SERVER_URL` festlegen; `APP_ENV=production` für Build und Laufzeit setzen.
- [ ] GitHub-Variable `DEPLOY_PUBLIC_URL` sowie Coolify-Domain passend umstellen: Das Deployment-Script verlangt Übereinstimmung.
- [ ] Umami, Consent, Preview, Mail und optional Chat gegen die finale Domain prüfen.
- [ ] Frisch bauen; geänderte CMS-Inhalte und Build-Secrets allein invalidieren den Docker-Buildcache nicht zuverlässig.
- [ ] HTTPS, Startseite, Medien, Kontakt, echte 404, Canonicals und Sitemap auf der Produktionsdomain prüfen.
- [ ] Entfernten `X-Robots-Tag: noindex` und freigegebenes `robots.txt` nachweisen.
- [ ] Bestehende produktive URLs mit neuen Pfaden vergleichen und nötige Weiterleitungen einrichten.
- [ ] Erst nach Abnahme Domain/DNS umschalten; bisherige Anwendung und Medien zunächst als Rückfallmöglichkeit erhalten.

Die heutige Staging-Sperre für Suchmaschinen ist richtig. Sie wird erst dann zum
Problem, wenn dieser Stand unverändert als Produktionsseite eingesetzt wird.

## Lokale Einschränkungen und nachrangige Pflege

- `node_modules` enthält Verknüpfungen auf einen früheren Projektpfad. Der Zugriff
  auf `node_modules/next/dist/docs` schlägt fehl. Ein vollständiger lokaler
  Build-/Typ-/Browserlauf wurde daher nicht als bestanden gewertet. Vor weiteren
  Codeänderungen Abhängigkeiten sauber installieren und die vom Projekt verlangte
  Next-Dokumentation lesen.
- Docker Desktop stellt momentan keinen erreichbaren Linux-Dienst bereit.
- Die zunächst fehlende pnpm-Bereitstellung konnte für den Online-Audit aufgelöst
  werden; eine vollständige Neuinstallation der Projektabhängigkeiten erfolgte nicht.
- `docker-compose.yml` verwendet noch Node 18, Yarn und `mongo:latest` mit
  veröffentlichtem Datenbankport. Für die beschriebene Produktion gilt der
  Dockerfile-/Coolify-Weg. Die alte Compose-Anleitung sollte vor weiterer Nutzung
  ersetzt oder eindeutig als veraltet markiert werden.
- README und Teile der CI-Dokumentation enthalten veraltete Template-/Testangaben.

## Empfohlene Reihenfolge

1. Sicherheitsupdates und Lockfile behandeln; neuen vollständigen Quality-Lauf erhalten.
2. Veröffentlichte Datenschutzinformationen, Löschregeln und Produktions-Chatmodus abgleichen.
3. Backup-Restore, Rollback, Alarmierung und reale Redaktions-/Mailabläufe abnehmen.
4. Produktionsvariablen und Domain umstellen, frisch bauen und abschließend prüfen.
5. Öffentlichen Traffic erst danach umschalten.
