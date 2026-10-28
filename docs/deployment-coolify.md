# Hetzner / Coolify deployment

For self-hosted analytics, performance and uptime alternatives, see
[Monitoring on Coolify](monitoring-coolify.md).
For the configured Umami integration and runtime variables, see
[Umami setup](umami-coolify.md).

## main als Deployment-Branch, Domain bleibt zunächst Staging

Die verbindliche Kette lautet:

`main → Quality gate → Coolify → build-new → Registry → prod-app-01.ec-host.de`

Das bisherige Live-Projekt unter the-easycode.eu liegt in einem anderen Repository
und wird nicht geändert. Es wird keine zweite dauerhafte Staging-Anwendung
aufgebaut: dieselbe Anwendung wird später zur Produktion.

### Einmalige Einrichtung vor Aktivierung

1. Automatisches Deployment bei Git-Push in Coolify deaktivieren. Vorher weder
   die bisher überwachte staging-Branch aktualisieren noch die Übernahme nach
   main als Deployment auslösen. GitHub App für Repositoryzugriff beibehalten.
2. Datenbank und Medien vom bisherigen Host sichern und auf den Zielserver
   übertragen. Ein MongoDB-Dump enthält keine Mediendateien. Schreibzugriffe für
   die finale Kopie kurz sperren; IDs und Beziehungen unverändert erhalten.
   Vorhandene MongoDB-Version beibehalten, kein gleichzeitiges Versionsupgrade.
3. Auf prod-app-01.ec-host.de MongoDB mit Authentifizierung, Replica Set und
   persistentem Datenvolume betreiben. Öffentliches versioniertes MongoDB-Image
   vom Docker Hub ist korrekt; es muss nicht in die private Website-Registry.
4. Anwendung als Dockerfile-Ressource auf dem Zielserver einrichten. Domain
   https://staging.the-easycode.eu, Branch main, APP_ENV=staging, Port 3000,
   Medienvolume /app/media mit UID/GID 1001:1001. DNS erst nach verifizierter
   Datenübernahme auf den neuen Zielserver umstellen.
5. build-new auf Rolle Builds only setzen. Live-Server auf Deployments only,
   Team-Fallback für Builds deaktivieren. Buildserver auswählen; keine zusätzliche
   Deployment-Destination für den Buildserver anlegen.
6. Registry auf beiden Hosts anmelden: Buildserver benötigt Push, Zielserver
   Pull. Image-Repository bewusst festlegen; Vorschlag cxcr.eu/easycode/website.
   Registry-Zugangsdaten bleiben in Coolify/Server-Docker-Konfigurationen.
7. MongoDB über private Verbindung vom Buildserver erreichbar machen. Eine
   Docker-interne Serviceadresse des Live-Servers reicht im Builder nicht aus.
   Build- und Runtime-URI dürfen unterschiedlich sein, müssen aber dasselbe CMS
   adressieren. Netzwerkzugriff nur für die beteiligten Hosts öffnen.
8. BuildKit-Secrets und Runtime-Variablen wie unten konfigurieren. Healthcheck aus
   dem Dockerfile verwenden: Node ruft /api/health/ready auf; kein curl nötig.
   Unhealthy Ersatzcontainer dürfen den gesunden bisherigen Container nicht
   ersetzen. Kein fester Containername und keine Host-Port-Bindung für die App.
9. In GitHub main schützen: erforderlicher Statuscheck Quality gate, Änderungen
   über Pull Requests und aktuelle Prüfungen vor Merge verlangen.

### GitHub-Konfiguration

Repository-Variablen (oder Variablen im Environment staging):

| Name | Wert |
| --- | --- |
| COOLIFY_URL | https://coolify.ec-host.de |
| COOLIFY_APPLICATION_UUID | UUID der Anwendung auf dem Zielserver |
| DEPLOY_PUBLIC_URL | https://staging.the-easycode.eu |
| COOLIFY_DEPLOY_ENABLED | Erst nach vollständiger Einrichtung true setzen; **Repository-Variable**, da sie vor Auswahl des Environments ausgewertet wird |

Secret COOLIFY_TOKEN im GitHub-Environment staging oder Repository hinterlegen.
Token benötigt Anwendung lesen/aktualisieren sowie Deployment starten/lesen.
Keine Tokens in Dateien oder Chatnachrichten ablegen. GitHubs eingebauter Token
reicht für das Lesen des aktuellen main-Commits.

Das Deployment-Script prüft Repository, Branch, Dockerfile, Domain, deaktivierte
Push-Automatik und Registry-Image. Es überspringt überholte main-Commits, setzt
git_commit_sha und den Image-Tag auf den geprüften SHA, liest den Pin zurück und
startet danach das Deployment. Laufende Jobs werden nicht automatisch abgebrochen.
Der GitHub-Deploymentjob ist pro Anwendung serialisiert. Keine parallelen manuellen
Deployments währenddessen starten, weil diese die Quellrevision ändern könnten.

Coolify wird mit force=true aufgerufen: CMS-Inhalte und Secrets invalidieren keine
Docker-Layer. In Actions wird nur die Builder-Stufe erzwungen und der Dependency-
Cache wiederverwendet. Coolifys Standard-API kann diese selektive Cachefreigabe
nicht vorgeben; dort wird daher sicherheitshalber der gesamte Releasebuild frisch
ausgeführt. CI-Testimage und CMS-Releaseimage sind bewusst getrennt.

Das Script wartet maximal 24 Minuten plus begrenzte einzelne HTTP-Anfragen;
Workflowlimit 27 Minuten. Nur status=finished mit dem geprüften Commit und
erfolgreicher öffentlicher Readiness/Startseite zählt als Erfolg. Timeout oder
HTTP-Fehler erzeugt keine blinde erneute Deployment-Anfrage; Coolify zuerst prüfen.
Die öffentliche Readiness muss denselben SHA als revision melden. Dafür wird
Coolifys automatisch gesetzte Runtime-Variable SOURCE_COMMIT verwendet; nicht
manuell überschreiben. Eine noch auf den alten Server zeigende Domain gibt keine
Freigabe. Auch die Auswahl des separaten Buildservers wird vorab geprüft.

### Übertragener Datenbestand (27.10.2026)

- Zielanwendung: rwzukgdnukwmpkgu0fyubgau auf prod-app-01.ec-host.de.
- Ziel-MongoDB: cui3iuxrxvwqytlyw9htzsek, MongoDB 8.0, Replica Set rs0, PRIMARY.
- Die CMS-Datenbank heißt **easycode_import**. Die Anzeige Initial database=easycode
  ist kein Grund, den importierten Namespace zu ändern. Der Benutzer easycode_app
  wird in easycode authentifiziert und hat readWrite auf easycode_import.
- Wiederhergestellt und mit dem Anwendungsbenutzer geprüft: 10 Pages, 5 Projects,
  35 Media-Dokumente, 2 Users. Der Import meldete 494 Dokumente ohne Fehler.
- Medienvolume rwzukgdnukwmpkgu0fyubgau-the-easycode-staging-media an /app/media:
  202 Dateien, UID/GID 1001:1001. MongoDB-Dump und Medienarchiv sind getrennte Backups.
- MongoDB ist an die private Hostadresse 10.1.0.2:27017 gebunden. Die Verbindung
  aus einem Container auf build-new wurde mit dem Anwendungsbenutzer geprüft.
- Build- und Appserver laufen auf ARM64; GitHub prüft den Container auf AMD64.
  Der erste tatsächliche Releasebuild auf ARM64 bleibt zusätzlich abzunehmen.

Die übertragenen Daten sind eine Momentaufnahme. Vor endgültiger Umschaltung
weitere Änderungen an der Quelle ausschließen oder DB und Medien erneut konsistent
übertragen. Neue Backup-Zeitpläne, öffentliche Erreichbarkeit, Domain-Umschaltung
und der erste vollständige Registry-Release sind noch gesondert zu prüfen.

deployment-record.json protokolliert Commit, Deployment-ID, Image-Referenz, Status
und den Manifest-Digest, falls Coolifys BuildKit-Logs ihn liefern. Fehlt der Digest,
ist er bei der Abnahme aus der Registry zu ergänzen; nicht aus einer beliebigen
sha256-Zeichenfolge ableiten. Alte Images für Rollbacks behalten. Rollbacks setzen
nicht die Datenbank zurück; Datenänderungen müssen kompatibel bleiben.

### Abnahme und Go-live

- In einem Pull Request einen Pflichtcheck fehlschlagen lassen: kein Deployment.
- Erfolgreichen PR aus staging nach main übernehmen; der tatsächliche main-Commit
  durchläuft die Prüfungen erneut. Nur Push auf main darf deployen.
- Image in Registry, Build auf build-new, Laufzeit ausschließlich auf Zielserver
  sowie Commit und Digest nachweisen.
- Registryfehler, DB-Ausfall und fehlschlagenden Healthcheck kontrolliert erproben.
- Login, Upload/Ersetzung, Veröffentlichung und Formularversand prüfen; erneuter
  Deploy muss DB-Inhalte und Uploads erhalten. Backup-Restore und Image-Rollback
  in isolierter Umgebung erproben.
- Zum Go-live Branch main beibehalten. Domain, NEXT_PUBLIC_SERVER_URL und APP_ENV
  auf Produktion umstellen, domainabhängige Integrationen prüfen und frisch bauen.
  Canonical, Sitemap, HTTPS und entfernten Indexierungsschutz nachweisen. Erst
  dann DNS/Domain von der bisherigen Website auf dieses Projekt umstellen.

## Variablen und Datenhaltung während der Staging-Phase

- Branch: `main`. Deploy to `https://staging.the-easycode.eu`.
- Use the new Hetzner MongoDB as the staging database initially. Never point
  staging at the existing production database or production upload directory.
- Give production its own database credentials and media volume before cutover.
- Leave the current website and Vercel Blob running until migration is verified.

## Application resource

- Git repository, branch `main`, Dockerfile build pack; push auto-deploy disabled.
- Repository root as build context; Dockerfile at `/Dockerfile`.
- Exposed container port: `3000`; listen address is `0.0.0.0`.
- Same Coolify destination network as MongoDB.
- Domain: the chosen HTTPS staging domain; create its DNS record first.
- Persist uploads in a named volume mounted at `/app/media`. Do not mount the
  entire `/app` directory. The runtime process has UID/GID `1001:1001`.
- Confirm upload-directory ownership after mounting. A host bind mount may need
  its ownership set to `1001:1001` once by a server administrator.

## Environment variables

Set these as **build and runtime** variables:

```dotenv
NEXT_PUBLIC_SERVER_URL=https://staging.the-easycode.eu
APP_ENV=staging
MONGODB_URI=mongodb://easycode_app:APP_PASSWORD@BUILD_REACHABLE_HOST:27017/easycode_import?authSource=easycode&replicaSet=rs0&directConnection=true
PAYLOAD_SECRET=YOUR_SECRET
UMAMI_SCRIPT_URL=https://YOUR_UMAMI_HOST/script.js
UMAMI_WEBSITE_ID=YOUR_UMAMI_WEBSITE_ID
```

Set these as **runtime only**, using actual credentials in Coolify:

```dotenv
PAYLOAD_UPLOAD_DIR=/app/media
PREVIEW_SECRET=YOUR_PREVIEW_SECRET
CRON_SECRET=YOUR_CRON_SECRET
SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USER
SMTP_PASS=YOUR_SMTP_PASSWORD
AI_CHAT_ENABLED=false
OPENAI_CHAT_REGION=eu
OPENAI_EU_APPROVED=false
OPENAI_API_KEY=
PUBLIC_TRUSTED_CLIENT_IP_HEADER=
```

Keep the existing `PAYLOAD_SECRET` when transferring the current installation.
Configure staging SMTP so test submissions cannot send unintended customer
emails. Vercel Blob credentials are no longer required by this branch.

Enable **Use Docker Build Secrets** in Coolify for `MONGODB_URI` and
`PAYLOAD_SECRET`. The Dockerfile requires these BuildKit secret IDs and does not
accept credentials as ordinary build arguments. If BuildKit secrets are missing,
the build fails instead of embedding credentials in the image.

Enter bare values in Coolify's individual variable fields, without surrounding
single or double quotes. Literal may stay enabled. Some Coolify versions wrap
Literal values in single quotes when passing them as build secrets. The build
removes exactly one such wrapper without evaluating or expanding the contents;
embedded password characters remain intact. Remaining outer quotes are rejected.
`NEXT_BUNDLER` is optional and defaults to `webpack`; missing optional secrets
use separate temporary environment names so they cannot erase build-argument
defaults. Configuration errors are reported without printing variable values.

The public URL, environment, optional bundler and Umami settings can also be
passed as BuildKit secrets. The Dockerfile explicitly mounts them because Coolify
does not automatically extend RUN commands that already contain secret mounts.
Both Umami variables need build and runtime scope: their values are included in
the prerendered page. The tracker still loads only after analytics consent.

MongoDB must be reachable from the build container, not just the runtime network.
Use a private address reachable by the builder; a runtime-only Docker service name
may not resolve during image builds. If build and runtime need different database
addresses, pass the builder address through the `MONGODB_URI` build secret and
keep the runtime URI for the application container. Both must target the same CMS.

The build reads published CMS content and prerenders complete pages with ISR.
Existing CMS hooks invalidate pages after publication, withdrawal, deletion and
changes to related content. Draft previews bypass the public page cache.
SMTP uses non-delivering build placeholders. OpenAI is initialized only for enabled runtime requests; no build key is needed. See [AI chat setup](ai-chat-openai.md) before enabling the chat.

Force the builder stage to run on each deployment that must reread CMS content.
For a custom Docker command use `--no-cache-filter builder` with `docker buildx
build`, or `--no-cache` with `docker build`; in Coolify use **Disable Build Cache**
or **Force deploy (without cache)**. Changed secret values and external database
content alone do not invalidate Docker layers.

`APP_ENV=staging` adds `X-Robots-Tag: noindex, nofollow` and blocks crawling in
robots.txt. This is not access control: protect staging separately if it contains
private content. Set `APP_ENV=production` and the production URL for the final
production build.

## Optional migration rehearsal

1. Export a copy of the current MongoDB with `mongodump`. Restore **only** into
   the staging database. Preserve document IDs and relations, and exclude the
   source `admin`, `config`, and `local` databases and their users.
2. Copy Vercel Blob media to staging storage, including original files and all
   image variants. A database dump does not include media files.
3. Rewrite Blob-specific media URLs and any embedded URLs in the staging copy
   to Payload's local `/api/media/file/<filename>` endpoints. Disabling the Blob
   adapter does not migrate existing media or URL fields automatically.
4. Check frontend images, thumbnails, rich text, previews, downloads, and the
   relationships between pages, projects, clients and media.
5. Test login, edits, publishing, forms, AI chat, a new upload, and a redeploy.
   Verify that both database changes and uploaded files survive the redeploy.

Migration commands/scripts will be prepared separately for the actual source
database and Blob store. No migration has been executed by these code changes.

## Production cutover

- Configure off-server backups for MongoDB **and** media; test restoration.
- Address the MongoDB startup warnings (file descriptor limits, filesystem and
  kernel settings) on the Hetzner host before production use.
- Rehearse staging first, then freeze content changes briefly for a final copy
  into the separate production database and media storage.
- Deploy the verified branch/commit with production environment values.
- Pause automatic deployments on the old hosting platform before merging the
  storage changes into its watched branch. Keep its known-good deployment intact
  for rollback while the new production deployment is tested.
- Switch the public domain only after the production deployment passes checks.
- Keep the old deployment and source media available for rollback initially.

A single-member replica set supports transactions, but provides no server
failover. Container volumes are persistence, not backups.
