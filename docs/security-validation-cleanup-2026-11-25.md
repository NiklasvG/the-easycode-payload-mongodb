# Umami: Bereinigung und Wiederaufnahme der Sicherheitsprüfung

Stand **25. November 2026**, nach vollständiger produktiver [Umami-Abnahme](umami-security-acceptance-2026-11-25.md). Die Prüfressourcen werden im normalen Betrieb nicht benötigt und sind nach folgender Prüfung entfernt.

| Entfernte Ressource | UUID |
| --- | --- |
| Umgebung `security-validation`, Projekt `wwfukl2ylvs9rrjqcfbcm03k` | `uhrakmpucgoqt018i9is19oa` |
| Historischer ARM64-/Emulations-Buildversuch | `r2ne1vn6h8evpioakmw4swjb` |
| Historische AMD64-Artefaktdefinition | `n8akga2bloiqgock50lgewzf` |

Die Produktionsumgebung `ol1reysv5g2ou4s8z7mxnarh` bleibt bestehen. Umami-Service `pg71i1kdbqjyhh81knlksgoc` läuft gesund auf dem AMD64-Controller mit Umami 3.5.0 / Next 16.4.5 / Node 22.23.5 / PostgreSQL 16.16 und vorgeschaltetem Verwaltungsgateway. Die Website und das offene MongoDB-Paket sind unverändert; die gelöschte Umgebung enthielt keine Ressource dieses offenen Pakets.

## Prüfung vor Entfernung

Alle betroffenen Anwendungen waren gestoppt, ohne Domain oder Hostports, ohne persistente/file Mounts, ohne Backupplan und ohne laufenden Deploymentauftrag. Die tatsächlichen Containerreferenzen auf Staging, Controller und Builder waren bereits leer. Acht historische Deploymentdatensätze und secretfreie Wiederaufnahmeprofile wurden lokal als Nachweis gesichert.

Die nativen Löschaufträge entfernten ausschließlich die vier Prüfdefinitionen samt zugehöriger Konfiguration. `delete_volumes=false`, `delete_connected_networks=false` und `docker_cleanup=false`; danach wurden die zwei nachweislich leeren Umgebungen entfernt. Keine Registryimages, Backups, Volumes oder Restorearchive gelöscht. Alle sieben Produktionscontainer danach gesund; Produktionskonfiguration, Umami-Compose und bestehende Backuppläne unverändert. Kein Deployment oder Neustart zur Dokumentation.

## Aufbewahrung und spätere Prüfung

Die private Registry bleibt die dauerhafte Quelle der abgenommenen Images. Kurzlebige GitHub-Artefakte ersetzen sie nicht. Insbesondere das von Umami produktiv verwendete Image im Namensraum `umami-security-amd64` darf nicht wegen des historischen Prüfnamens gelöscht werden.

Gestoppte private Restoreprüfcontainer, Dumps und Konfigurations-/Schlüsselzugriffe auf den Servern bleiben zugriffsbeschränkt erhalten. Ihre Entfernung ist nicht Teil dieser Coolify-Bereinigung. Lokale Nachweise in der zentralen Ablage: `.verification-config/completed-validation-cleanup-20261125/` mit `acceptance.json`, `recreation-profiles.json`, `backup-and-deployment-references.json` und `environments-removed.json`. Keine dieser Dateien enthält Geheimniswerte oder Nutzdatenarchive.

Vor einem späteren Update Versionen/Advisories erneut prüfen, frische konsistente Sicherungen anlegen und Wiederherstellung/Dateninvarianten erneut abnehmen. Bei Bedarf im richtigen Projekt eine neue, domainlose `security-validation`-Umgebung mit neuen UUIDs anlegen; Auto-/Previewdeployments deaktiviert lassen. Historische UUIDs sind keine weiterhin existierenden Ziele. Alte Einmalhelfer und ihre Guards nicht blind wiederverwenden. Testkopien verwenden eigene DBs/Dateien und ein internes Netz; externe Mail-, Zahlungs- und Produktionswebhooks blockieren. Notwendige eingeschränkte Lesetokens nur temporär privat als Buildsecret verwenden.

Offene Projekte behalten ihre eigenen Prüfumgebungen, bis ihr Paket tatsächlich abgenommen und die Ressourcenzuordnung geprüft ist. Dokumentation allein ersetzt weder eine neue Freigabe noch tatsächliche Readiness.

## Umami erneut isoliert prüfen

Gepflegte Quellen: [Build-/Gatewayanleitung](../ops/umami-security/README.md), [gepinntes Quellmanifest](../ops/umami-security/source.json), [Dockerfile](../ops/umami-security/Dockerfile), [Gateway](../ops/umami-security/gateway.mjs), [Gatewaytests](../ops/umami-security/gateway.test.mjs), [nativer AMD64-Workflow](../.github/workflows/umami-security.yml). Die alten Coolify-Builddefinitionen mit einem Dummy-Gitrepository und `HEAD` sind kein Wiederaufbauweg.

Auf einem nativen AMD64-GitHub-Runner bauen und Architektur, tatsächliche Node-/Nextversionen sowie Gatewaytests nachweisen. Das geprüfte Artefakt ohne Neubau in die bestehende Registry übernehmen und dessen unveränderlichen Digest abgleichen. Keine erneute Emulation auf dem ARM64-Builder; die entfernten QEMU-Hilfen werden dafür nicht benötigt.

Die produktive Referenz bleibt `cxcr.eu/the-easycode.eu/umami-security-amd64@sha256:e4c3c9fd224cf0b358c33312449833370981c0cc042aeed1705b3dc298110274`. Das vorhandene Gateway verwendet dasselbe Image; dessen Quellhash ist im Abnahmebericht dokumentiert. Für die Wiederherstellungsprobe PostgreSQL in einem internen Netz mit eigenen Zugangsdaten und frisch rückgelesenem Dump verwenden, Geschäftsdatenhashes und Migrationen vergleichen. Gateway-/Umami-Anmeldung, Bearerweitergabe, öffentliche Trackingpfade und tatsächlich gespeichertes Testereignis nur auf der isolierten Kopie prüfen.

Produktionspromotion erfolgt über den vorhandenen nativen Coolify-Service. Bestehende DB, Credentials, App-/Signierschlüssel, Domain, Zugriffsschutz, Tracking und Backupplan erhalten. Die Gateway-Zugangswerte liegen ausschließlich privat; ihre bekannten Speicherorte stehen im Abnahmebericht. Der Umami-Reports-Upstreambefund bleibt durch Verwaltungsschutz begrenzt und ist bei jedem späteren Update neu zu bewerten. Keine synthetischen Trackingereignisse in Produktion.
