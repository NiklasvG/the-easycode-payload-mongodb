# Bestätigter Sicherheitsstand vom 25. November 2026

Dieser Stand dokumentiert tatsächlich laufende Versionen und bereits abgeschlossene Maßnahmen. Ein weiterhin alter Versionsstand ist keine Aussage, dass alle Sicherheitsbefunde behoben sind. Unveröffentlichte Kandidaten bleiben auf den Featurebranches. Diese Dokumentationsänderung führt keinen Anwendungsrelease aus.

## Umami

- Produktiver Service pg71i1kdbqjyhh81knlksgoc im Projekt wwfukl2ylvs9rrjqcfbcm03k auf dem AMD64-Controller; Umami 3.4.0, PostgreSQL 16.15. Beide Container gesund.
- Bestehender DB-Backupplan blytmjdpebjx1iucvqpvbqwl und vorhandenes APP_SECRET bleiben erhalten. Keine Produktionsumstellung und noch keine vorgeschaltete Basic Auth.

## Easycode Website

- Website rwzukgdnukwmpkgu0fyubgau produktiv Payload 3.94.2, Next 16.4.6, React 19.3.1, Node 24.22.3; Main-Release eee8beba1e3fb00a07c482628cc1cd02cad1757b, Deployment givouuwdffyg9b6fy8rgjwxs.
- MongoDB cui3iuxrxvwqytlyw9htzsek weiterhin 8.0.34 auf prod-app-01. Ressourcenname the-easycode-mongodb-staging ist irreführend: Umgebung 7 und tatsächliche Nutzung sind PRODUKTION.
- Vorhandener hostbasierter Backupkoordinator sichert DB und Medien konsistent; aktuelles Paar 0475a7fc-c202-4655-b85d-c8f9cdbc8b2b erfolgreich, Writer wiederhergestellt.

Abgenommene Prüfung: Produktionsaudit des Website-Lockstands ohne Befunde; Typ-/Lint-/16 Deploymenttests und vollständige Container-/Integrations-/Browser-CI erfolgreich. Laufzeit und Readiness bestätigt.

## Gemeinsamer Betrieb

Alle vier Coolify-Hosts aktualisiert und neu gestartet, Docker 29.10.1; Controller-/Produktions-/Staging-Traefik 3.7.20. Coolify 4.7.6. Projektmounts, Backupzuständigkeiten und bestehende Releasewege bleiben erhalten. Shopware-/Destille-Staging läuft dauerhaft getrennt von Produktion und bleibt ohne Backups.

Lokaler zentraler Nachweis: [Coolify-Umsetzungsbericht](<E:/Coding/coolify Projekte/docs/reports/2026-11-25-sicherheitsupdates-umsetzung.md>). Ein reiner Dokumentationscommit auf main ändert nicht den zuvor gemessenen Anwendungscode im laufenden Container.

[Bestätigter Status](security-status-2026-11-25.md).
