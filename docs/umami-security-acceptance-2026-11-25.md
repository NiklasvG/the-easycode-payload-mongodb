# Paket 01: Umami produktiv abgesichert

Abnahme: **25. November 2026, 19:26 Uhr Europe/Berlin** (18:26 UTC). Paket 01 abgeschlossen. Die anderen Pakete wurden nicht bearbeitet.

## Produktiver Stand

Bestehender Service `pg71i1kdbqjyhh81knlksgoc`, Projekt `wwfukl2ylvs9rrjqcfbcm03k`, Produktionsumgebung 7, AMD64-Controller `116.202.31.211`. Nativer Coolify-Service-PATCH mit `instant_deploy`; kein SSH-/Portainer-Deployment und kein Emulationsbuild. Das bereits vorhandene geprüfte Image wurde unverändert verwendet.

| Komponente | Vorher | Live abgenommen |
| --- | --- | --- |
| Umami | 3.4.0 | 3.5.0, Upstream `dbb8d606fbd4e99220fb83bcb4abad3e0f97f42a` |
| Next / Node | alter Umami-Imagestand | 16.4.5 / 22.23.5 |
| PostgreSQL | 16.15 | 16.16 |
| Zugriff | Verwaltung öffentlich erreichbar | HTTPS-Gateway mit Basic Auth und signierter Sitzung |
| Coolify / Container | zwei gesunde Container | `running:healthy`; App, DB und Gateway gesund, jeweils `unless-stopped` |

App und Gateway verwenden `cxcr.eu/the-easycode.eu/umami-security-amd64@sha256:e4c3c9fd224cf0b358c33312449833370981c0cc042aeed1705b3dc298110274`. Architektur und tatsächliche Image-ID sind AMD64 bzw. derselbe SHA-256-Wert. PostgreSQL ist auf `postgres:16.16-alpine@sha256:f2f98726820d0342055351c6e9d36e705f5bfffb3dd53ff556325114b08afb6d` gepinnt.

Die bestehende Domain `https://analytics.the-easycode.eu` gehört jetzt ausschließlich dem Gateway `nmykxwlbty7buiqbxveht83z`. Die App hat keine eigene Proxyroute (`traefik.enable=false`). Keiner der drei Container veröffentlicht einen Hostport. Bestehendes APP_SECRET, DATABASE_URL/DATABASE_TYPE und Volume `pg71i1kdbqjyhh81knlksgoc_postgresql-data` sind unverändert nachgewiesen.

## Quellstand und Freigabe

- [PR 11](https://github.com/NiklasvG/the-easycode-payload-mongodb/pull/11) regulär gemergt, ohne Adminumgehung oder Force-Push. Geprüfter HEAD `91481c499fe40a622222df730743d2185e047510`; Main-Merge `20a59dcb292d6187215c85723ccd860dcefca02e`. Beide Dateibäume exakt `8ede832924a915c86155ffa2da1386eaceff5a0a`.
- [Quality 45673618436](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/45673618436): Audit, Typprüfung, Lint, Deployment-/Koordinator-/Backup-/Releasetests sowie vollständige Container-, Integrations- und Browserprüfung erfolgreich; Quality gate erfolgreich.
- Auch der Main-Merge bestand dieselbe vollständige [Quality-Prüfung 45674653383](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/45674653383). Der Website-Releasejob `request` wurde dabei wie vorgesehen übersprungen.
- Native AMD64-Sicherheitsbuilds am selben HEAD [45673618394](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/45673618394) und [45673607906](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/45673607906) einschließlich Gatewaytest erfolgreich. Diese regulären CI-Builds ersetzen das bereits vorhandene Produktionsartefakt nicht.
- Das tatsächlich verwendete Originalartefakt stammt weiterhin aus [45655679090](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/45655679090), Code-SHA `ac6735c9d5129b0f7ab653eef06f3b97d9594a35`. Dockerfile, Quellmanifest und Lizenz sind am neuen HEAD unverändert; nur dieses bestehende Digest wurde promotet.
- Der tatsächlich gestartete Gatewaycode stimmt per SHA-256 mit `gateway.mjs` überein: `a083c96dda99725f4e19a043ca00a8ea958bbb8080e71e02efea5f925a0a8a3d`.
- Der bestehende allgemeine Workflow führt weiterhin alle bisherigen Qualitätsprüfungen aus. Sein zusätzlicher `website_release`-Ausgang verhindert bei reinen Umami-/CI-Änderungen den unbeteiligten Website-Release. Die laufende Website blieb auf `eee8beba1e3fb00a07c482628cc1cd02cad1757b`, Deployment `givouuwdffyg9b6fy8rgjwxs`.

## Zugriff und Tracking

Öffentlich sind ausschließlich `GET/HEAD /script.js` sowie `POST/OPTIONS /api/send`. Der tatsächlich eingesetzte Tracker nutzt auch für die aktivierte Performance-Erfassung `/api/send`; zusätzliche Trackingausnahmen waren nicht erforderlich.

Verwaltungsrouten verlangen Basic Auth. Danach ermöglicht eine achtstündige HMAC-signierte `__Host-`-Sitzung mit `Secure`, `HttpOnly`, `SameSite=Strict` Umamis eigene Anmeldung und Bearer-API. Basic wird vor dem Appaufruf entfernt; Bearer bleibt unverändert. API-Clients holen zunächst mit Basic die Gateway-Sitzung und senden deren Cookie anschließend zusammen mit ihrem Umami-Bearer. Die Gateway-Sitzung ersetzt Umamis Anmeldung nicht.

Ratenbegrenzung je vom Reverseproxy übermitteltem Peer: Tracking 20/s mit Burst 120, fehlgeschlagene Gateway-Authentifizierung 2/s mit Burst 30, authentifizierte Verwaltung 50/s mit Burst 300. Dashboard-Assetbursts sind getestet. Keine Änderungen am gemeinsamen Proxy.

Live über HTTPS geprüft: `/`, `/login`, Verwaltungs-/Reports-/Share-API und unzulässige Pfad-/Methodenkombinationen ohne Gatewayzugang 401; Skript 200; Preflight 204; Loginseite mit Basic 200. Nach Gatewayauthentifizierung lehnt Umami ungültige eigene Anmeldedaten/Bearer mit 401 ab. Ein Send-Aufruf mit nicht existierender Website erreicht Umami und wird mit 400 abgelehnt. **Keine synthetischen Produktionsereignisse geschrieben.** Ein erfolgreicher Login mit gültigem Umami-Bearer und die tatsächliche Ereignisspeicherung wurden im isolierten Restore bewiesen; kein visueller Livebrowser-Test mit einem produktiven Benutzerkonto.

Basic-Zugang liegt separat unter `C:/Users/nikla/.codex/secrets/umami-gateway-access-20261125.json`, mit eingeschränkter Windows-ACL. Der Controller besitzt die private rootgeschützte Laufzeitkopie einschließlich Signierschlüssel unter `/var/log/codex-security-rollout-20261125/umami-gateway-live/gateway-access.json`. Keine Zugangswerte in Dokumentation oder Git.

## Frischer Backup und Restore

Umami-Writer für die konsistente Sicherung angehalten; die nächtliche Bereinigung war inaktiv, ihr nächster Termin lag außerhalb des Wartungsfensters. Die App besitzt keine Dateimounts; es gibt keine zusätzlich zu paarenden Mediendateien. Private Compose-Rücknahmekopie mit Modus 0600 gesichert.

- Bestehender nativer Backupplan `blytmjdpebjx1iucvqpvbqwl`; frische Ausführung `3tgxjfaqzvxdennrvrm8mwo4`: erfolgreich, lokal vorhanden und S3-Upload erfolgreich.
- Vollständig aus S3 rückgelesen: 91.496 Bytes, SHA-256 `22c6b398546fff05ee90282e12b2bd8e3991fbeb6960ad4da058692098cf4a9e`, identisch zum lokalen Dump.
- Genau dieser frische Stand auf PostgreSQL 16.16 im internen Testnetz restauriert und auf das Produktionsimage migriert. Alle **26 bestehenden Geschäftstabellen** vor/nach Migration mit gleichen Zeilenzahlen und vollständigen Zeilenhashes. Keine offenen Migrationen oder nicht validierten Constraints; produktiv anschließend 27 abgeschlossene Migrationen.
- Isoliert: tatsächlicher Basic-/Umami-Login 200, gültige Bearer-Verifizierung 200, Skript 200, Preflight 204, Tracking 200 und genau ein gespeichertes Testereignis. Keine externen Produktionsintegrationen. Alle Testcontainer anschließend gestoppt; keine Altbackups oder Volumes gelöscht.
- Backupplan, Ressourcenbindung, Aktivierung, 02:45-UTC-Kalender und S3-Einstellung sind vor/nach dem Deployment identisch. Keine Retentionänderung. Controllerbackup-Dateisystem separat geprüft; kein Eingriff in das Produktionsbackupvolume.

## Belege und Grenzen

Secretfreie JSON-Belege unter `E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/`: `umami-gateway-release.json`, `umami-gateway-backup.json`, `umami-gateway-readback.json`, `umami-gateway-fresh-restore.json`, `umami-gateway-live-acceptance.json`, `umami-gateway-backup-plan-before.json` und `umami-gateway-backup-plan-after.json`. Operative Helfer unter `.verification-config/umami-gateway-20261125/`; nicht ohne Ressourcenprüfung bzw. gegen Einmalguards erneut ausführen.

Herstellerquellen am 25. November erneut geprüft: [PostgreSQL 16.16](https://www.postgresql.org/docs/release/16.16/), [Node 22.23.5](https://nodejs.org/en/blog/release/v22.23.5), [Umami-Reports-Advisory](https://github.com/umami-software/umami/security/advisories/GHSA-vhf9-rcmp-v5fc) und [Next.js-Advisories](https://github.com/vercel/next.js/security/advisories). Das Umami-Advisory nennt keinen veröffentlichten Fix; der Verwaltungsschutz ist daher ein wesentlicher Teil dieser Abnahme. Dies ist kein pauschaler Nachweis vollständiger Schwachstellenfreiheit.

Keine offene Blockade für Paket 01. Eine spätere Rückkehr zu einem geeigneten offiziellen Umami-Image benötigt erneut Versions-/Advisory- und Releaseprüfung. Die ungenutzten Validierungsressourcen und gestoppten Prüffix­turen sind erhalten; keine pauschale Bereinigung erfolgt. Pakete 02–09 bleiben separat.
