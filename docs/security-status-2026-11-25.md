# Bestätigter Sicherheitsstand vom 25. November 2026

Dieser Stand dokumentiert tatsächlich laufende Versionen und bereits abgeschlossene Maßnahmen. Ein weiterhin alter Versionsstand ist keine Aussage, dass alle Sicherheitsbefunde behoben sind. Unveröffentlichte Kandidaten bleiben auf den Featurebranches. Diese Dokumentationsänderung führt keinen Anwendungsrelease aus.

## Umami

- Produktiver Service pg71i1kdbqjyhh81knlksgoc im Projekt wwfukl2ylvs9rrjqcfbcm03k auf dem AMD64-Controller: Umami 3.5.0, Next 16.4.5, Node 22.23.5 und PostgreSQL 16.16; App, DB und Gateway gesund.
- Verwaltung über HTTPS mit Basic Auth und signierter Sitzung geschützt; öffentlich nur GET/HEAD /script.js und POST/OPTIONS /api/send. Umamis eigene Anmeldung und Bearer-API erhalten.
- Bestehender DB-Backupplan blytmjdpebjx1iucvqpvbqwl, APP_SECRET, DB-Zugang und Volume erhalten. Frischer nativer Backup mit S3-Hashabgleich und isoliertem Restore-/Migrationstest über 26 Geschäftstabellen erfolgreich.
- [Vollständige Liveabnahme mit PR-/CI-/Digest- und Zugriffsbelegen](umami-security-acceptance-2026-11-25.md).

- Die ungenutzten Coolify-Prüfdefinitionen und ihre leere Umgebung sind nach Abnahme entfernt. [Bereinigung und spätere Validierung](security-validation-cleanup-2026-11-25.md); Produktion und Backuppläne unverändert.

## Easycode Website

- Website rwzukgdnukwmpkgu0fyubgau produktiv Payload 3.94.2, Next 16.4.6, React 19.3.1, Node 24.22.3; Main-Release eee8beba1e3fb00a07c482628cc1cd02cad1757b, Deployment givouuwdffyg9b6fy8rgjwxs.
- MongoDB `cui3iuxrxvwqytlyw9htzsek` läuft produktiv auf prod-app-01 mit **8.0.38**. ARM64-Image `mongo:8.0.38@sha256:479e85ced54ffb8a40dade1dcde2da2a9ae858515b9415e9cc54bfb8f0575d01`. FCV 8.0 und Replica Set `rs0` bestätigt. Ressourcenname the-easycode-mongodb-staging ist irreführend: Umgebung 7 und tatsächliche Nutzung sind PRODUKTION.
- Vor dem Patch sicherte der Backupkoordinator DB und Medien konsistent im Paar `8182f405-5ea4-4bcf-8661-caf301038dd8`. Beide S3-Kopien stimmten im SHA-256-Abgleich mit den lokalen Archiven überein. Ein früheres Paar wurde isoliert wiederhergestellt und von 8.0.34 auf 8.0.38 aktualisiert. Collections, Indizes, TTL, Authentifizierung und die 39 Medienreferenzen wurden geprüft. Nach dem Livewechsel waren Website und DB gesund. Der HTTP-Readiness-Endpunkt bestätigte den Payload-Datenbankzugriff.

Abgenommene Prüfung: Produktionsaudit des Website-Lockstands ohne Befunde; Typ-/Lint-/16 Deploymenttests und vollständige Container-/Integrations-/Browser-CI erfolgreich. Laufzeit und Readiness bestätigt.

## Gemeinsamer Betrieb

Alle vier Coolify-Hosts aktualisiert und neu gestartet, Docker 29.10.1; Controller-/Produktions-/Staging-Traefik 3.7.20. Coolify 4.7.6. Projektmounts, Backupzuständigkeiten und bestehende Releasewege bleiben erhalten. Shopware-/Destille-Staging läuft dauerhaft getrennt von Produktion und bleibt ohne Backups.

Lokaler zentraler Nachweis: [Coolify-Umsetzungsbericht](<E:/Coding/coolify Projekte/docs/reports/2026-11-25-sicherheitsupdates-umsetzung.md>). Ein reiner Dokumentationscommit auf main ändert nicht den zuvor gemessenen Anwendungscode im laufenden Container.
