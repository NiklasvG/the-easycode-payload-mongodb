# Alte Releasekoordinatoren entfernt

Stand: 5. November 2026. Nach erfolgreicher Umstellung auf bedarfsweise Releasejobs
hat der Betreiber ausdrücklich die Löschung beider gestoppter Altkoordinatoren
und die Prüfung/Löschung ihrer entbehrlichen Sicherungen beauftragt.

## Gelöschte Ressourcen

| Projekt | Alte Anwendung | Alter Zustandsbackupplan |
| --- | --- | --- |
| Easycode | `87bn9vgwdcdelqo8tnsmlgef` | `54iegz3fcx3xd9ik8kc55i4w` |
| von-grzymala / Barrierescouts | `15jhsk7eg8egbzssjwc6ell5` | `2rq9rdm9vdjiosnjidq70t6o` |

Beide Anwendungen lagen auf prod-app-01, waren gestoppt und hatten keine aktiven
Deployments. Ihre Zuordnung zu den jeweiligen Projekten, Storages und Sicherungen
wurde vor der Entfernung direkt in Coolify und Docker geprüft. Keine anderen
Container verwendeten die alten Datenpfade oder das Easycode-Zustandsvolume.

Über die nativen, storagegebundenen Coolify-Endpunkte wurden zuerst die beiden
Backuppläne einschließlich ihrer Archive gelöscht: pro Koordinator genau eine
lokale Sicherung und eine S3-Kopie, insgesamt zwei lokale und zwei S3-Archive.
Die S3-Schlüssel wurden vorab exakt mit den Backupausführungen abgeglichen.
Anschließend wurden beide alten Anwendungen mit ihren Konfigurationsverzeichnissen
und zugehörigen Zustandsdaten entfernt. Das unbenutzte Easycode-Docker-Volume
`87bn9vgwdcdelqo8tnsmlgef-easycode-release-state` ist ebenfalls entfernt.

Ein globales Docker-Cleanup und das Löschen verbundener gemeinsamer Netzwerke
waren ausdrücklich deaktiviert. Es erfolgte kein pauschales Image-/Volume-Prune.

## Zusätzliche alte Kopien

Zwei identische Kopien des alten Easycode-Koordinatorarchivs aus dem isolierten
Restoretest wurden nach SHA-256-Abgleich entfernt:

- Controller: `/srv/the-easycode-restore-20261105/release.archive`.
- Coolify-Container: `/tmp/the-easycode-restore-20261105/release.archive`.

Außerdem wurden die beiden ausdrücklich als `old-web-state.json` abgelegten
Migrationskopien unter `/var/lib/easycode-release/` und
`/var/lib/barrierescouts-release/` entfernt. Die aktiven `state.json`-Dateien
blieben nachweislich bytegleich. Die DB-/Medienarchive und der historische
Restore-Prüfbeleg wurden nicht gelöscht.

## Abschlussprüfung

- Alte Anwendungen auch einschließlich gelöschter Datensätze nicht mehr vorhanden.
- Beide alten Backuppläne und ihre lokalen/S3-Archive nicht mehr vorhanden.
- Beide alten Appserver-Anwendungsverzeichnisse und das alte Named Volume nicht
  mehr vorhanden.
- Alle zuvor erfassten neuen Jobzustands-Sicherungen lokal und in S3 erhalten.
- Aktive Jobzustände per SHA-256 unverändert, beide neuen Projektzugänge funktionieren.
- Die Backup-Timer `the-easycode-backup.timer` und
  `barrierescouts-release-state-backup.timer` bleiben aktiviert.
- Website-DB-/Medien-Backuppläne und Zahl ihrer vorhandenen Ausführungen unverändert.
- Easycode-Staging und von-grzymala liefern HTTP 200 mit derselben geprüften SHA
  und Build-ID wie vor der Löschung. Kein Website-Neustart oder neuer Build nötig.

Die frühere Rückwegoption über die alten Koordinatorressourcen ist damit bewusst
aufgehoben. Der aktuelle Betrieb und seine Sicherungen verwenden ausschließlich
die neuen Releasejobs. Frühere Umstellungsberichte beschreiben die damals noch
aufbewahrten Altressourcen und sind entsprechend historisch einzuordnen.
