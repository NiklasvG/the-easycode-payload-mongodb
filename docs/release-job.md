# Bedarfsweiser Easycode-Releasejob

Die auf Betreiberwunsch eingerichtete Ablösung des Release-Webdienstes verwendet
Python-Standardbibliothek auf dem Coolify-Controller. Kein dauerhaft laufender
Releaseprozess, kein zusätzlicher HTTP-Port und keine eigene Release-Domain.
Die tatsächliche Umschaltung und Releaseabnahme stehen im datierten
[Umschaltbeleg](release-job-abnahme-2026-11-05.md).

## Ablauf

`main → GitHub Quality gate → eingeschränktes SSH → systemd-Einmaljob → Coolify → Builder → Registry → Website → Prüfung`

GitHub führt im Requestjob keinen Checkout aus und besitzt keinen Coolify-Token.
Ein eigener SSH-Schlüssel darf ausschließlich `release <Run-ID>` und
`status <Run-ID>` für Easycode auslösen; kein allgemeiner Shellzugang, keine
Dateiübertragung, kein Forwarding. Der bekannte SSH-Hostschlüssel ist fest gepinnt.
Der Client wartet auf das geprüfte Endergebnis. Ein Runnerabbruch beendet den
serverseitigen Job nicht.

## Feste Zuordnung und Dateien

- Controller: `116.202.31.211`; eigener Job `easycode-release@<Run-ID>.service`.
- Root-eigener Code und private Konfiguration: `/srv/easycode-release/`.
- Nicht geheime Freigabe-/Buildbelege: `/var/lib/easycode-release/state.json` und
  `runs/<Run-ID>.json`; trotzdem nur für den Betreiber lesbar.
- Gemeinsames Release-/Backuplock: `/var/lib/easycode-release/operations.lock`.
- Website bleibt `rwzukgdnukwmpkgu0fyubgau`, Projekt
  `wwfukl2ylvs9rrjqcfbcm03k`, Builder und Registry unverändert.
- Quellen: `ops/release/`; Hostkopien werden nicht durch ein Website-Redeploy aktualisiert.

## Prüfungen und Fehler

Repository, Workflow, Main-Branch, aktueller Attempt, erfolgreicher `Quality gate`
und aktueller Main-HEAD werden vor Veränderung und nochmals vor Dispatch geprüft.
Die Zielanwendung muss zu Repository, Server, Registry, Dockerfile und festen
Domains passen. Freigabe setzt eindeutige SHA/Build-ID; Runtime-Secrets werden
nicht ersetzt. Readiness, Startseite, Canonical und Image-Digest müssen stimmen.
Bei Produktion zusätzlich robots.txt, Indexierbarkeit und Chat-Konfiguration.

Vor dem Dispatch wird Zustand atomar gespeichert. Eine verlorene Antwort wird
anhand der konkreten Deploymentliste abgeglichen. Kein automatischer zweiter
Build bei Timeout, falscher Readiness oder unklarem Status. Ein gespeicherter
unfertiger Release blockiert Backup und Folgefreigaben bis zur Wiederaufnahme
oder ausdrücklich begründeten Operatorabstimmung. Nach 24 Minuten aktiver
Deploymentzeit verlangt der Job einen Operator. Drei Stunden Diensttimeout
berücksichtigen zusätzlich Wartezeit auf einen laufenden Backupjob.

## Backup und Zugänge

Der vorhandene tägliche DB-/Medien-Backupjob verwendet dasselbe Hostlock. Er
sichert den neuen, geheimnisfreien Releasezustand nach S3 und lokal, bevor er
die Website für das konsistente DB-/Medienpaar kurz pausiert. Zustandskopien:
zwei lokal, vierzehn in eigenem S3-Präfix `release-job-state/<Projekt-UUID>/`.
Upload wird durch Rücklesen und SHA-256 geprüft. Alte native Sicherungen bleiben
erhalten; neue Sicherungen hängen nicht vom gestoppten Koordinatorcontainer ab.

GitHub: Variable `RELEASE_SSH_HOST`, Secrets `RELEASE_SSH_KEY` und
`RELEASE_SSH_KNOWN_HOSTS`; Freigabeschalter `COOLIFY_PRODUCTION_ENABLED`.
Private Coolify-/GitHub-Zugänge liegen nur in der root-lesbaren Serverkonfiguration.
Keine allgemeinen Rootschlüssel in GitHub, keine Secrets in Zustandsarchiven.
Rootausführung ist für den vorhandenen lokalen Coolify-Backupadapter erforderlich;
der CI-Schlüssel erlaubt trotzdem nur den festen Auslöser dieses Projekts.

## Updates und Rückweg

Hostcode nur nach Tests und verifiziertem Quellstand synchronisieren. Für einen
Rückweg zuerst Jobauslöser sperren, laufende Jobs und Backups abwarten und den
aktuellen Zustand sichern. Erst danach genau einen alten oder neuen Weg freigeben.
Die dokumentierte frühere Koordinatorarchitektur unter `release-workflow.md` ist
nach der Umschaltung historisch; keine parallelen Auslöser wieder aktivieren.
