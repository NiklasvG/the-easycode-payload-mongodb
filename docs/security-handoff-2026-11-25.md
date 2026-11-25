# Sicherheitsübergabe Umami

Stand 25. November 2026. [Verbindlicher Betriebsrahmen](<E:/Coding/coolify Projekte/docs/operations/security-handoff-2026-11-25/CONTEXT.md>) · [Arbeitspakete und Prompts](<E:/Coding/coolify Projekte/docs/operations/security-handoff-2026-11-25/README.md>)

## Bestätigter Livezustand

- Produktiver Service pg71i1kdbqjyhh81knlksgoc im Projekt wwfukl2ylvs9rrjqcfbcm03k auf dem AMD64-Controller; Umami 3.4.0, PostgreSQL 16.15. Beide Container gesund.
- Bestehender DB-Backupplan blytmjdpebjx1iucvqpvbqwl und vorhandenes APP_SECRET bleiben erhalten. Keine Produktionsumstellung und noch keine vorgeschaltete Basic Auth.

## Noch umzusetzen

- Fertiges gepatchtes AMD64-Image nativ über den bestehenden Coolify-Service veröffentlichen; kein erneuter Emulationsbuild.
- PostgreSQL auf getestetes 16.16-Image patchen; Dashboard und Verwaltungsrouten mit Basic Auth über HTTPS absichern. Öffentlich nur tatsächlich benötigte Trackingpfade und Methoden freigeben, inklusive notwendiger Preflights; Rate-Limit und kein direkter Containerzugriff.
- Tracking unverändert nachweisen; bestehende URLs, APP_SECRET, DB, Credentials und Backups erhalten. Basic-Authorization darf Umamis eigene Anmeldung und API-Authentifizierung nicht beschädigen.

## Bereits bestandene Prüfungen

- CI-Run 45655679090 erfolgreich, Codebasis ac6735c9d5129b0f7ab653eef06f3b97d9594a35. Image cxcr.eu/the-easycode.eu/umami-security-amd64@sha256:e4c3c9fd224cf0b358c33312449833370981c0cc042aeed1705b3dc298110274.
- Isolierter S3-Restore unter PostgreSQL 16.16, Umami-Migration 26 auf 27 vollständig; 26 Geschäftstabellen mit unveränderten Zeilenzahlen, Heartbeat/Login 200, tatsächliche Versionen Next 16.4.5 und Node 22.23.5. Testcontainer gestoppt.

## Besondere Hinweise

- Bevorzugter Weg ist jetzt fertiges gepatchtes Image plus Zugriffsschutz. Offizielles latest wurde als Umami 3.5.0 / Next 16.4.2 / Node 22.23.4 geprüft und behebt die konkreten Befunde nicht vollständig; master ist sogar 3.0.0 / Next 15.5.3 / Node 22.21.1.
- Beide emulierten AMD64-Builds sind abgebrochen; temporäres QEMU-Paket und nur der selbst angelegte x86-64-Handler wurden entfernt. Builder war nicht voll.
- Private Registry enthält das geprüfte Image dauerhaft; GitHub-Artefakt nur drei Tage, nicht darauf als einzige Kopie verlassen. Nach Herstellerkorrektur Rückkehr zum geeigneten offiziellen Image bewerten.
- Native Validierungsressourcen r2ne1vn6h8evpioakmw4swjb (ARM64, ungenutzt) und n8akga2bloiqgock50lgewzf (AMD64). ARM64-Image niemals auf Controller promoten.
- API erwartet docker_compose_raw als Base64; Service-PATCH mit instant_deploy statt /start auf bereits laufendem Service. Vor jedem mutierenden Aufruf Helfer und tatsächliche Ressource prüfen.

## Arbeitskopien und Quellen

- [easycode](<C:/Users/nikla/.codex/worktrees/easycode-security/the-easycode-mongodb>); Featurebranch `codex/umami-security`, vor Dokumentationsübergabe Code-HEAD `f156d85382ab46fd9454bbbe1d2575aa5d542c3b`. Original-Remote: `https://github.com/NiklasvG/the-easycode-payload-mongodb.git`.

## Vorhandene Belege

- [umami-amd64-built-image.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/umami-amd64-built-image.json>)
- [umami-application-restore.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/umami-application-restore.json>)
- [umami-database-restore.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/umami-database-restore.json>)
- [umami-backup.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/umami-backup.json>)
- [qemu-amd64-reverted.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/qemu-amd64-reverted.json>)

## Zuständiger neuer Chat

- [Umami absichern und PostgreSQL patchen](<E:/Coding/coolify Projekte/docs/operations/security-handoff-2026-11-25/prompts/01-umami.md>)

# Sicherheitsübergabe Easycode Website

Stand 25. November 2026. [Verbindlicher Betriebsrahmen](<E:/Coding/coolify Projekte/docs/operations/security-handoff-2026-11-25/CONTEXT.md>) · [Arbeitspakete und Prompts](<E:/Coding/coolify Projekte/docs/operations/security-handoff-2026-11-25/README.md>)

## Bestätigter Livezustand

- Website rwzukgdnukwmpkgu0fyubgau produktiv Payload 3.94.2, Next 16.4.6, React 19.3.1, Node 24.22.3; Main-Release eee8beba1e3fb00a07c482628cc1cd02cad1757b, Deployment givouuwdffyg9b6fy8rgjwxs.
- MongoDB cui3iuxrxvwqytlyw9htzsek weiterhin 8.0.34 auf prod-app-01. Ressourcenname the-easycode-mongodb-staging ist irreführend: Umgebung 7 und tatsächliche Nutzung sind PRODUKTION.
- Vorhandener hostbasierter Backupkoordinator sichert DB und Medien konsistent; aktuelles Paar 0475a7fc-c202-4655-b85d-c8f9cdbc8b2b erfolgreich, Writer wiederhergestellt.

## Noch umzusetzen

- MongoDB 8.0.34 auf getesteten Patchkandidaten 8.0.38 aktualisieren. Vorher S3-Readback und isolierten Restore-/Upgradevergleich durchführen, unmittelbar vor Livewechsel frisch konsistent sichern.
- Keine erneute Website-Modernisierung oder Umami-Änderung in Paket 07; Umami gehört exklusiv Paket 01.

## Bereits bestandene Prüfungen

- Produktionsaudit des Website-Lockstands ohne Befunde; Typ-/Lint-/16 Deploymenttests und vollständige Container-/Integrations-/Browser-CI erfolgreich. Laufzeit und Readiness bestätigt.
- MongoDB-8.0.38-Herstellerimage ARM64 bereits gezogen und Versionslauf erfolgreich; echte Datenrestore-/Upgradeprobe noch offen.

## Besondere Hinweise

- Backupplan yalqgutj3zvfvdjoymsjirhv ist absichtlich zeitlich deaktiviert und wird vom Koordinator aufgerufen, databases_to_backup null bedeutet alle DBs. Nicht als fehlenden Backup missverstehen.
- Controllerunit the-easycode-backup.service, Hostquelle /srv/the-easycode-backups/production-backup-pair.py; aktuellen Hostcode nicht durch ältere Repoquelle ersetzen.
- Mongo-Dumpformat anhand tatsächlichen Archivs bestimmen (native Jobs können gzip-Archive in .tar.gz benennen); nicht blind tar-extrahieren. FCV/Auth/Indexes/TTL/Collections und Anwendungszugriff prüfen.

## Arbeitskopien und Quellen

- [easycode](<C:/Users/nikla/.codex/worktrees/easycode-security/the-easycode-mongodb>); Featurebranch `codex/umami-security`, vor Dokumentationsübergabe Code-HEAD `f156d85382ab46fd9454bbbe1d2575aa5d542c3b`. Original-Remote: `https://github.com/NiklasvG/the-easycode-payload-mongodb.git`.

## Vorhandene Belege

- [easycode-mongo-backup-receipt.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/easycode-mongo-backup-receipt.json>)
- [mongodb-candidate.json](<E:/Coding/coolify Projekte/.verification-config/security-rollout-20261125/mongodb-candidate.json>)

## Zuständiger neuer Chat

- [Easycode MongoDB und Shopware MariaDB patchen](<E:/Coding/coolify Projekte/docs/operations/security-handoff-2026-11-25/prompts/07-datenbankpatches.md>)
