# Releaseablauf für The-EasyCode

Stand: 5. November 2026. Gemeinsame Grundlage sind die Betriebsregeln in der
übergeordneten Coolify-Ablage (`docs/best-practice/03-build-release-staging.md`,
`04-daten-backup-restore.md` und `06-zugaenge-und-secrets.md`). Die dortigen
projektspezifischen Shopware-Ausnahmen werden nicht auf Easycode übertragen.

## Ziel und aktueller Umstellungsstand

Die Änderungen werden auf Betreiberwunsch direkt auf `main` vorbereitet.
Coolify verwendet bereits `main`, die Website läuft weiterhin unter
`https://staging.the-easycode.eu`. Die bisherige Hauptdomain auf einem anderen
Server bleibt bis zur abschließenden Abnahme unverändert.

Der hier beschriebene neue Koordinator ist im Repository implementiert. Seine
Installation, Zugänge, Aktivierung und ein echter Release müssen gesondert
nachgewiesen werden. Das Vorhandensein von Dateien oder Variablen ist kein
Nachweis einer bereits umgestellten Betriebskette.

## Ein Veröffentlichungsweg

```text
main-Push → GitHub Quality gate → Request mit Run-ID
          → Easycode-Koordinator → Coolify → build-new (ARM64)
          → cxcr.eu → prod-app-01 → Readiness + Build-ID + Digest
```

GitHub baut ein einmaliges Testimage gegen eine isolierte MongoDB und Mailpit.
Das spätere Releaseimage wird separat auf dem ARM64-Builder aus der geprüften
SHA und den tatsächlichen veröffentlichten CMS-Inhalten gebaut. Es wird keine
unveränderte Übernahme des AMD64-Testimages behauptet.

Der Job `request` hat keinen Checkout und keinen Coolify-Operatorzugang. Er sendet
nur `GITHUB_RUN_ID` an `/v1/approve/production-website`. Der Koordinator prüft über
GitHub erneut Repository, Push-Event, Workflowpfad/-name, Branch, aktuelle Attempt,
erfolgreichen Job `Quality gate` und aktuellen Branch-HEAD. Er prüft den Attempt
erneut unmittelbar vor dem Dispatch. PRs und manuelle Workflowläufe dürfen keinen
Release anfordern. Fehlgeschlagene oder übersprungene Pflichtprüfungen geben nicht frei.

Reine Markdown-/`docs/`-Änderungen führen die schnellen Checks aus, überspringen
den Containerjob bewusst und lösen keinen Release aus. Der Pflichtcheck
`Quality gate` bleibt auch für solche Änderungen vorhanden. Änderungen an
Workflow, Betriebsprogramm und Anwendung werden vollständig geprüft.

## Feste Ressourcen

| Ressource | Zuordnung |
| --- | --- |
| Repository | `NiklasvG/the-easycode-payload-mongodb` |
| Projekt | `wwfukl2ylvs9rrjqcfbcm03k` |
| Website/Payload | `rwzukgdnukwmpkgu0fyubgau` |
| MongoDB | `cui3iuxrxvwqytlyw9htzsek` |
| Appserver | `ymz0a1hyeqyxjxzeyertbhpy` / `prod-app-01.ec-host.de` |
| Builder | `3ghcgycwe3rtdjcsyqa1phwf` / `build-new` |
| Website-Registry | `cxcr.eu/the-easycode.eu/website` |
| Aktuelle URL | `https://staging.the-easycode.eu` |
| Ziel-URL | `https://the-easycode.eu` |

Die technische Bezeichnung der vorhandenen Ressourcen enthält noch `staging`;
in Coolify liegen sie in der Umgebung `production`. Namen allein bestimmen
weder Laufzeitumgebung noch Datenbestand. Für ein späteres paralleles Staging
sind eigene DB, Medien, Secrets, Zugriffsschutz und Mailsink nötig.

## Koordinator betreiben

Quellen: `ops/coolify/coordinator.mjs`, eigenes Dockerfile in demselben Verzeichnis.
Das Image benötigt keine npm-Abhängigkeiten. Root-eigene Konfiguration unter
`/config/targets.json` nur lesbar mounten oder die feste Zielkonfiguration über
die ausschließlich serverseitige Runtime-Variable `TARGETS_JSON` setzen.
Ein eigenes persistentes, für `node`
schreibbares `/data` hält Freigaben, aktive Deployments und letzte Ergebnisse.
Ein Prozesslock verhindert zwei Koordinatorprozesse auf demselben Zustand.
Kein Docker-Socket, keine Root-Laufzeit und keine gemeinsame Datenablage mit der Website.

`targets.example.json` ist absichtlich deaktiviert und zeigt noch auf die
Staging-Domain. Bei Einrichtung die tatsächlichen Werte abgleichen. Für den
Live-Wechsel `publicUrl`, `healthUrl` und `appEnv` gemeinsam mit Coolify umstellen.

Private Runtime-Variablen des Dienstes:

- `COOLIFY_API_URL`: API-Ursprung inklusive `/api/v1`.
- `COOLIFY_API_TOKEN`: eigener auf das Easycode-Projekt beschränkter Betriebszugang;
  benötigte Lese-/Schreib-/Deployrechte einzeln prüfen, keine Löschrechte.
- `GITHUB_READ_TOKEN`: nur Repository-/Actions-Leserechte für dieses Repository.
- `EASYCODE_PRODUCTION_RELEASE_TOKEN`: zufälliger Schlüssel für GitHub-Requests.
- `EASYCODE_OPERATIONS_TOKEN`: anderer Schlüssel für Status, Pause, Resume und
  begründete Wiederholungen; nicht an GitHub weitergeben.

GitHub-Variable `COOLIFY_COORDINATOR_URL` zeigt auf den eigenen HTTPS-Dienst.
`COOLIFY_PRODUCTION_ENABLED=true` darf erst nach Einrichtung und Abnahme gesetzt
werden; der Schalter ist eine Repository-Variable. Im Environment `production`
das Secret `COOLIFY_PRODUCTION_RELEASE_TOKEN` hinterlegen. Bestehende main-Regel
`Quality gate` beibehalten. Tokenlaufzeit und rechtzeitige Rotation dokumentieren.

Den bisherigen direkten `COOLIFY_DEPLOY_ENABLED`-/`COOLIFY_TOKEN`-Weg nach der
Umstellung deaktivieren und unbenutzte CI-Zugänge gezielt entfernen. Der alte
CLI-Einstieg `scripts/deploy-coolify.mjs` verweigert direkte Deployments.
Push-Autodeploy in Coolify bleibt aus; während koordinierter Releases keine
parallelen manuellen Deployments starten.

## Artefakt und Fehlerfälle

Jeder Release bekommt ein neues `<SHA>-<BUILD_ID>`-Tag. `SOURCE_COMMIT` und
`BUILD_ID` werden vor dem Build als Build- und Runtime-Werte gesetzt.
Commit und Image-Tag werden zurückgelesen; bei ENV-Werten werden nur Existenz
und Build-/Runtime-Metadaten geprüft. Der Betriebszugang hat bewusst keine
sensiblen Leserechte. Die tatsächlichen Werte werden durch die aus dem gebauten
Image ausgelieferte Readiness nachgewiesen. Next.js bindet die öffentlichen
Release-Metadaten beim Build ein.
Readiness verweigert eine zur gebauten SHA widersprüchliche Runtime-Revision.
Der Koordinator akzeptiert nur die erwartete SHA und gebaute ID, eine erreichbare
Startseite und einen aus dem konkreten Buildlog erfassten Manifest-Digest.
Für Produktion prüft er zusätzlich die erforderliche Chat-Konfiguration,
Mailtransport, finale URL und unerwünschtes `noindex` auf der Startseite.

Nach Coolify-Status `finished` gibt es bis zu 60 Sekunden für Bereitschaft und
Proxyumschaltung. Es wird kein zweiter Build allein wegen verzögerter Readiness
gestartet. Unklare Dispatchantworten bleiben dauerhaft gespeichert und werden
gegen die anwendungsbezogene Deploymentliste abgeglichen. Bei Mehrdeutigkeit
oder 24-Minuten-Timeout bleibt der Slot gesperrt und verlangt einen Operator.
Fehler führen nicht zu unbegrenzten oder blinden Neubauten.

`cachedBuilds=false` bleibt zunächst erhalten: Die gemeinsamen Vorgaben verlangen
vor Wegfall von `force` den Nachweis eines frischen Inhaltsbuilds bei gleicher
SHA auf der tatsächlichen Coolify-Version. `BUILD_ID` wird bereits im Build
verwendet, ersetzt diesen Abnahmetest aber nicht.

## Sicherung und Rückweg

Bestätigte native Pläne: MongoDB `yalqgutj3zvfvdjoymsjirhv`, Dateien
`ztcmdo9mufusjyywkdqzty6a`. Beide hatten am 5. November erfolgreiche Ausführungen
mit bestätigtem S3-Upload. Sie laufen aktuell unabhängig um 02:15 bzw. 02:30 UTC;
das ist noch kein nachgewiesen konsistentes Paar bei laufenden CMS-Schreibzugriffen.

Vor Produktionsfreigabe müssen Release und konsistentes Backup denselben
Projektslot verwenden. Der Koordinator bietet dazu mit dem **Betriebsschlüssel**
`POST /v1/pause/production-website`, `status` und `resume`. Nach Pause zuerst
`active=null` abwarten; erst danach CMS-Schreiber kontrolliert anhalten, Mount-UUID
prüfen und DB/Medien zusammen sichern. Unabhängige native Kalender erst nach
funktionierender koordinierter Ablösung umstellen. Bestehende Sicherungen nicht löschen.
Die Backupintegration und der isolierte Restore sind nicht allein durch diese
Endpunkte als eingerichtet oder bestanden nachgewiesen.

Vor DNS-Umschaltung einen aktuellen gemeinsamen Restorepunkt und das bisherige
Image am unveränderlichen Digest festhalten. Nach neuen CMS-Änderungen oder
Kontaktanfragen ist ein Zurücksetzen der Datenbank kein normaler Image-Rollback.
Die bisherige Hauptdomain-Anwendung und deren Originalmedien bis zur bestätigten
Ablösung erhalten.

## Abnahme vor Aktivierung

1. Koordinatortests, Typprüfung, ESLint, Produktions-Audit, Integration, Linuxbuild
   und Browser-Kerntests erfolgreich; echten GitHub-Lauf für den finalen Commit prüfen.
2. Dienst und eigenes Projekt-Token installieren; Zugriff auf fremde Projekte
   muss abgewiesen werden. Unauthentifizierte Requests und falsche Run-IDs ablehnen.
3. Einen echten ARM64-Release auf der Staging-Domain nachweisen: SHA, Build-ID,
   Digest, Zielserver, Medien, CMS und Formulare; Datenbestand vorher sichern/vergleichen.
4. Backupkoordination, externes Restorepaar und Rückweg prüfen. Vorhandene
   gemeinsame Disk-/RAM-Monitore ersetzen keinen externen Website-Verfügbarkeitscheck.
5. Datenschutzseite im CMS aktualisieren; globalen Chat mit aktiver Einwilligung,
   Folgefrage und Widerruf auf der ausgelieferten Anwendung abnehmen.
6. Erst dann Produktionsdomain und Buildkonfiguration umstellen, neu bauen,
   Host/SNI vor DNS prüfen und die finale Umschaltung freigeben.
