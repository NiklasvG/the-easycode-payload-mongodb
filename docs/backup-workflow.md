# Konsistente Easycode-Sicherungen

## Bisheriger Nachweis und vorbereitete Ablösung

Am 5. November 2026 sind MongoDB und Medien mit erfolgreichen lokalen/S3-
Ausführungen bestätigt. Die bisherigen unabhängigen Kalender (02:15 und 02:30 UTC)
stellen bei laufenden CMS-Schreibzugriffen noch keinen gemeinsamen Restorepunkt dar.

Die projektgebundene Ablösung liegt unter `ops/backup/`. Sie baut auf dem
verwendeten Coolify-4.6-Verfahren der gemeinsamen Betriebsablage auf, ist hier
jedoch ausschließlich auf die integrierte Easycode-Website angepasst. Die
Installation und ihr tatsächlicher Erstlauf sind getrennt von den fünf
bestandenen Offline-Fehlertests nachzuweisen.

## Feste Zuordnung

| Bestandteil | UUID |
| --- | --- |
| Projekt | `wwfukl2ylvs9rrjqcfbcm03k` |
| Appserver | `ymz0a1hyeqyxjxzeyertbhpy` |
| Website | `rwzukgdnukwmpkgu0fyubgau` |
| DB-Unterplan | `yalqgutj3zvfvdjoymsjirhv` |
| Medien-Unterplan | `ztcmdo9mufusjyywkdqzty6a` |
| Releasekoordinator | `87bn9vgwdcdelqo8tnsmlgef` |
| Koordinatorzustand-Unterplan | `54iegz3fcx3xd9ik8kc55i4w` |

Der neue Zustands-Unterplan ist deaktiviert angelegt, mit 2 lokalen und 14
S3-Ständen ohne zusätzliche Alters-/Größenlimits. Vorhandene DB-/Medien-Retention
wird durch den Koordinator nicht verändert. Die native Kalenderabschaltung der
alten Unterpläne erfolgt erst im Rahmen der kontrollierten Ablösung.

## Ablauf

1. Ein Prozesslock und der gespeicherte Abschlusszustand verhindern parallele
   oder blinde Wiederholungen. Ein unklarer vorheriger Auftrag verlangt einen Operator.
2. Vor jeder Veränderung die Backup-Mount-UUID auf dem Appserver prüfen:
   `3e8d94be-3910-4b03-8017-e2b02742ff6f`. Fehlender/falscher Mount bricht ab.
3. Neue Easycode-Releases mit dem eigenen Betriebsschlüssel pausieren und
   einen bereits aktiven Release abwarten. Fremde Projekte bleiben unberührt.
4. Genau einen Website-Schreiber anhand des Coolify-Labels ermitteln; einen
   bereits vom Operator pausierten Container unverändert lassen und abbrechen.
5. Den Website-Container kurz pausieren und native DB-, Medien- und
   Koordinatorzustands-Sicherungen nacheinander ausführen. Echte Ausführungs-IDs,
   Status, Größe und erfolgreiche S3-Replikation zusammen erfassen.
6. Website und zuvor offene Releases auch bei Fehlern kontrolliert freigeben.
   Ein Fehler wird sichtbar protokolliert; ein unklarer Dispatch wird nicht wiederholt.

Der Datensatz hält außerdem die Laufzeit-Image-ID fest. Diese ist nicht mit dem
Registry-Manifest-Digest gleichzusetzen. Für einen Release den vom Koordinator
erfassten Registry-Digest und den tatsächlichen laufenden Imagebezug ergänzen.

## Betrieb und Wiederherstellung

Vorgesehener Host ist der Coolify-Controller. Skript und feste Konfiguration
liegen unter `/srv/the-easycode-backups`, privater Zustand unter
`/var/lib/the-easycode-backups`. Das Skript ruft ausschließlich fest zugeordnete
Coolify-Modelle und Operationen auf; es ist kein allgemeiner Remote-Command-Endpunkt.
Kein Zugangsschlüssel wird in das Skript oder in Sicherungsbelege kopiert.

Der vorgesehene tägliche Timer ist 02:15 UTC (03:15 Uhr Berlin im Winter), mit
Nachholung. Die nativen Teilpläne bleiben nach erfolgter Ablösung deaktiviert;
deren Abschaltung ist dann kein Fehler und soll nicht einzeln zurückgenommen werden.

Vor Produktivfreigabe ein tatsächlich zusammengehöriges S3-Paar isoliert
wiederherstellen: passende MongoDB-Version, dokumentierte Namespace-Auswahl,
unveränderte IDs/Beziehungen und SHA-256-Vergleich aller Mediendateien. Keine
Produktivports, SMTP-Zugänge oder KI-Aufrufe in der Restoreinstanz aktivieren.
Ein erfolgreiches S3-Uploadfeld allein belegt keinen Restore.
