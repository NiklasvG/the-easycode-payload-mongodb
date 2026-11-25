# Sicherheitsstand und Kandidaten vom 25. November 2026

Die folgende Trennung ersetzt ältere Zwischenstände dieser Sicherheitsnotiz.

## Umami produktiv

- Produktiver Service pg71i1kdbqjyhh81knlksgoc im Projekt wwfukl2ylvs9rrjqcfbcm03k auf dem AMD64-Controller; Umami 3.4.0, PostgreSQL 16.15. Beide Container gesund.
- Bestehender DB-Backupplan blytmjdpebjx1iucvqpvbqwl und vorhandenes APP_SECRET bleiben erhalten. Keine Produktionsumstellung und noch keine vorgeschaltete Basic Auth.

## Noch nicht veröffentlicht

- Fertiges gepatchtes AMD64-Image nativ über den bestehenden Coolify-Service veröffentlichen; kein erneuter Emulationsbuild.
- PostgreSQL auf getestetes 16.16-Image patchen; Dashboard und Verwaltungsrouten mit Basic Auth über HTTPS absichern. Öffentlich nur tatsächlich benötigte Trackingpfade und Methoden freigeben, inklusive notwendiger Preflights; Rate-Limit und kein direkter Containerzugriff.
- Tracking unverändert nachweisen; bestehende URLs, APP_SECRET, DB, Credentials und Backups erhalten. Basic-Authorization darf Umamis eigene Anmeldung und API-Authentifizierung nicht beschädigen.

## Bereits geprüft

- CI-Run 45655679090 erfolgreich, Codebasis ac6735c9d5129b0f7ab653eef06f3b97d9594a35. Image cxcr.eu/the-easycode.eu/umami-security-amd64@sha256:e4c3c9fd224cf0b358c33312449833370981c0cc042aeed1705b3dc298110274.
- Isolierter S3-Restore unter PostgreSQL 16.16, Umami-Migration 26 auf 27 vollständig; 26 Geschäftstabellen mit unveränderten Zeilenzahlen, Heartbeat/Login 200, tatsächliche Versionen Next 16.4.5 und Node 22.23.5. Testcontainer gestoppt.

## Easycode Website produktiv

- Website rwzukgdnukwmpkgu0fyubgau produktiv Payload 3.94.2, Next 16.4.6, React 19.3.1, Node 24.22.3; Main-Release eee8beba1e3fb00a07c482628cc1cd02cad1757b, Deployment givouuwdffyg9b6fy8rgjwxs.
- MongoDB cui3iuxrxvwqytlyw9htzsek weiterhin 8.0.34 auf prod-app-01. Ressourcenname the-easycode-mongodb-staging ist irreführend: Umgebung 7 und tatsächliche Nutzung sind PRODUKTION.
- Vorhandener hostbasierter Backupkoordinator sichert DB und Medien konsistent; aktuelles Paar 0475a7fc-c202-4655-b85d-c8f9cdbc8b2b erfolgreich, Writer wiederhergestellt.

## Noch nicht veröffentlicht

- MongoDB 8.0.34 auf getesteten Patchkandidaten 8.0.38 aktualisieren. Vorher S3-Readback und isolierten Restore-/Upgradevergleich durchführen, unmittelbar vor Livewechsel frisch konsistent sichern.
- Keine erneute Website-Modernisierung oder Umami-Änderung in Paket 07; Umami gehört exklusiv Paket 01.

## Bereits geprüft

- Produktionsaudit des Website-Lockstands ohne Befunde; Typ-/Lint-/16 Deploymenttests und vollständige Container-/Integrations-/Browser-CI erfolgreich. Laufzeit und Readiness bestätigt.
- MongoDB-8.0.38-Herstellerimage ARM64 bereits gezogen und Versionslauf erfolgreich; echte Datenrestore-/Upgradeprobe noch offen.

[Alle Arbeitsstände, Belege und Übergabehinweise](security-handoff-2026-11-25.md). Kandidaten sind keine bereits produktiven Änderungen.
