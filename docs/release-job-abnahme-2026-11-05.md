# Abnahme: bedarfsweise Releasejobs

Stand: 5. November 2026. Auf ausdrücklichen Betreiberauftrag wurden Easycode und
von-grzymala/Barrierescouts vom dauerhaften Release-Webdienst auf projektbezogene
Einmaljobs umgestellt. Andere Projektkoordinatoren und gemeinsame Serverlimits
wurden nicht geändert. Die Easycode-Hauptdomain wurde nicht umgeschaltet.

## Tatsächlich veröffentlichte Releases

| Projekt | Commit | Build-ID | Coolify-Deployment | Manifest-Digest |
| --- | --- | --- | --- | --- |
| easycode | 05ee63c9e5b0cab5829156eb0c395843e9de2ea0 | 02246852-c9bd-4104-aa60-9eea41abe7ed | mdzvhgeuhe7ewckaavuvjgge | sha256:023c85d534f866f986fd2813ff19e0748f20763f5d33870341a9ee15e6650afc |
| barrierescouts | d3c7af832e313487d1b5f74f1d5bd2034050dc2a | d8eddc33-14f3-436e-9c8f-d5cc6923381c | 4jq1u8oyddnddv2p9ac6f0mt | sha256:0d32f4a8235b9391939d05cafdd6ec74afe830f4cce24b94e7b2f0f2061df2cd |

GitHub-Läufe: [Easycode, Attempt 2](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/42101763622)
und [von-grzymala](https://github.com/The-Easycode/barrierescouts-frontend-gatbsy/actions/runs/42102749576),
beide erfolgreich einschließlich des auf das Server-Endergebnis wartenden Requestjobs.
Easycode: 152 Integrations- und 25 Browser-Kerntests, 15 Release-/Fehlerfalltests und
6 Backup-Fehlertests. Von-grzymala: 16 Release-/Fehlerfalltests einschließlich der
unterschiedlichen Canonical-Anforderungen.

Die tatsächlichen RepoDigests der laufenden Websitecontainer stimmen mit den
Manifest-Digests überein. Öffentliche Readiness liefert jeweils die erwartete SHA
und Build-ID. Easycode: 15 Sitemap-Seiten HTTP 200, private Benutzer-/Formulardaten
anonym 403, unbekannte Seite 404. Von-grzymala: acht interne Website-Routen 200,
unbekannte Seite 404. Keine Kontaktmails oder Geschäftsvorgänge für diese Abnahme.

## Ausführung und Sicherheitsnachweise

- Auf Controller 116.202.31.211: easycode-release@<Run-ID>.service und
  barrierescouts-release@<Run-ID>.service; beide nach Abschluss inactive, kein
  laufender Releaseprozess (ExecMainPID=0). Kein eigener öffentlicher HTTP-Port.
- Root-eigener Code und private Konfiguration je unter /srv/<Projekt>-release;
  geheimer Coolify-/GitHub-Zugang bleibt ausschließlich dort. Zustand und Lock
  unter /var/lib/<Projekt>-release. Hostkopien werden getrennt von Websites aktualisiert.
- Pro Projekt eigener erzwungener SSH-Befehl mit bestätigtem Hostschlüssel. Die
  Schlüssel verweigerten im echten Test allgemeine Shellbefehle. GitHub kann
  ausschließlich release/status mit numerischer Run-ID anfordern.
- GitHub-Pflichtjob im aktuellen Attempt, Repository, Workflow, Main-HEAD und SHA
  werden vor dem Dispatch geprüft. Unklare Aufträge werden mit gespeicherter
  Deployment-ID abgeglichen; keine blinden zweiten Builds.
- Während des ersten von-grzymala-Piloten erzeugte die doppelte gleiche Anfrage
  genau einen Build; konkurrierende Projektlock-Anforderung wurde verweigert.
- Von-grzymala behält seine bestehenden Coolify-Rechte. Der Controlleradapter
  liefert ausschließlich den Digest einer festen Projektanwendung, keine Logs
  oder Secretwerte. Easycodes bereits genehmigter Zugangsumfang bleibt erhalten.

## Sicherung und Rückweg

Easycodes bestehender DB-/Medien-Timer (02:15 UTC) verwendet dasselbe Hostlock
wie der Releasejob. Echter neuer Backup-Erstlauf:
5e4d2b73-cf51-4963-92ee-70d341d6aab4, erfolgreich einschließlich S3 und
Wiederfreigabe der kurz pausierten Website. Releasezustand wird separat lokal
und in eigenem S3-Präfix gesichert, mit Rückleseprüfung per SHA-256.

Von-grzymalas neuer Zustandsbackuptimer läuft täglich 06:15 UTC; zusätzlich wurde
der endgültige Dienst einmal manuell erfolgreich ausgeführt. Beide Jobzustände
haben zwei lokale und vierzehn S3-Stände. Configdateien und Schlüssel sind nicht
Teil dieser Zustandsarchive. Ein abgeschlossener zukünftiger Nachtlauf wird
damit nicht behauptet.

Alte native Releasezustandspläne bleiben deaktiviert; ihre Originalbackups und
Volumen bleiben erhalten. Die alten Koordinatorressourcen sind gestoppt und
gegen automatischen Containerwiederanlauf gesichert. Das sind Rückwegkopien, kein
zweiter aktiver Releaseweg. Die DNS-Einträge easycode-release.ec-host.de und
deploy-barrierescouts.ec-host.de sowie die ersetzten HTTP-CI-Token/URL-Variablen
sind entfernt. Ein Rückweg benötigt die kontrollierte Sperre des neuen Wegs,
den aktuellen Zustand und genau einen wieder freigegebenen Auslöser.

## Besonderheiten und Grenzen

Der erste von-grzymala-Build war erfolgreich, seine neue Abschlussprüfung
verlangte jedoch einen bisher nicht vorhandenen Canonical. PR 7 korrigierte
den Prüfvertrag: bei der statischen Seite wird ein vorhandener Canonical geprüft;
Easycode verlangt ihn weiterhin. Der nachfolgende vollständige Main-Lauf war
erfolgreich. Die vorhandene Website selbst wurde hierfür nicht verändert.

Easycodes erster Main-Lauf hatte den neuen Auslöser noch deaktiviert. Die
Abnahme nutzte deshalb einen vollständigen neuen Attempt mit erneut bestandenen
Pflichtprüfungen. Sein nativer Build wartete regulär auf die von anderen Projekten
belegten Builderplätze. Fremde Builds und Buildparallelität blieben unangetastet.

Mailcow-Aufbewahrung und die endgültige veröffentlichte Datenschutzseite bleiben
separate Punkte der Livegang-Vorbereitung. Easycode läuft weiterhin auf Staging.

Gemeinsame Auswahlregel mit Stackbeispielen:
E:/Coding/coolify Projekte/docs/best-practice/08-release-steuerung-entscheiden.md.
