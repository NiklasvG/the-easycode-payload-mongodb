# Mailcow: nächtliche Vollsicherung mit einem erfolgreichen Stand

Geprüfter Stand: 6. November 2026. Diese Quellen dokumentieren den ausdrücklich
beauftragten Sicherungsweg des Mailservers 78.47.46.159, keine allgemeinen
Coolify-Vorgaben für andere Projekte.

## Betrieb

- Programm: `/srv/mailcow-nightly-backup`, root 0700, Quelldateien 0600.
- Zustand: `/var/lib/mailcow-nightly-backup`, root 0700/0600.
- Timer: `mailcow-nightly-backup.timer`, täglich **01:30 Europe/Berlin**.
- Verpasste Läufe werden beim nächsten Start des Timers nachgeholt (Persistent).
- Ziel: `/mnt/HC_Volume_102089935`, UUID `c5c96171-ec71-4608-a981-9e913f47d8e2`.
- Ein erfolgreicher Vollstand bleibt erhalten. Während Erstellung und Prüfung
  bestehen vorübergehend der alte und der neue Stand nebeneinander.
- Native Mailcow-Sicherung `backup all`, zwei Kompressionsthreads, kein
  `--delete-days`, kein Stoppen der Mailcow-Dienste.
- Zusätzliches Konfigurationsarchiv mit Mailcow-Overrides, SSL-Dateien und den
  eigenen Retention-/Backup-Helfern einschließlich systemd-Einheiten.
- UMask 0077, Nice 10, CPUQuota 200 %, MemoryMax 1 GiB und sechs Stunden Zeitlimit
  gelten nur für diesen Sicherungsdienst.

## Erfolgsprüfung und Rotation

Vor jedem Lauf werden Mount/UUID, freier Platz, der gültige bisherige Stand
und andere native Backup-Prozesse kontrolliert. Ein unbekannter oder
unvollständiger weiterer Stand stoppt den Ablauf zur manuellen Prüfung;
er wird nicht automatisch gelöscht. Für den neuen Lauf wird mindestens
125 Prozent der Größe des alten Stands plus 1 GiB freier Speicher verlangt.

Der native Lauf muss Exitcode 0 und zwei erfolgreiche MariaDB-Abschlussmarker
liefern. Bekannte Archiv-/Plattenfehler verhindern die Rotation. Alle sieben
Archive werden vollständig dekomprimiert, als Tar gelesen, mit SHA-256 erfasst
und auf erwartete Komponenten geprüft. MariaDB muss `backup_type = log-applied`
bestätigen; die separat kopierte mailcow.conf muss mit der Quelle übereinstimmen.
Das ist weiterhin kein vollständiger Wiederherstellungstest.

Erst danach werden Prüfmanifest und neuer gültiger Zeiger dauerhaft geschrieben.
Der vorherige, exakt erfasste Stand wird anschließend Datei für Datei entfernt.
Falsche Pfade, Symlinks, unerwartete Dateien oder Änderungen blockieren das
Löschen. Ein unterbrochener Löschvorgang kann beim nächsten Lauf nur anhand
des gespeicherten Plans fortgesetzt werden, wenn der neue gültige Stand
weiter unverändert vorliegt. Währenddessen wird kein weiterer Vollstand gestartet.

Bei einem fehlgeschlagenen Backup oder einer fehlgeschlagenen Prüfung bleibt
sein Vorgänger erhalten. Ein unvollständiger neuer Stand erfordert eine
Operatorprüfung, bevor automatisch erneut gesichert wird. Verbleibt nach
Timeout/Abbruch der native Hilfscontainer, muss auch dieser vor dem nächsten
Lauf abgeglichen werden. Nicht blind den Sicherungsbefehl erneut ausführen.

## Diagnose

```sh
systemctl list-timers --all mailcow-nightly-backup.timer
systemctl show mailcow-nightly-backup.service --property=Result,ExecMainStatus,ActiveState
python3 /srv/mailcow-nightly-backup/nightly.py preflight
```

`current.json` enthält den gültigen Zeiger und gegebenenfalls einen ausstehenden
Löschplan. `last-run.json` enthält Phasen, Zähler und Prüfresultate.
Das jeweilige Backupverzeichnis enthält `verification.json`.
Es werden keine rohen nativen Dateilisten oder Zugangsdaten als Joblog abgelegt;
die native Ausgabe wird nur auf feste Erfolgs-/Fehlermarker ausgewertet.
Keine automatische E-Mail-Fehlerbenachrichtigung eingerichtet. Ein Erfolg dieses
Dienstes belegt keinen externen Upload oder vollständigen Restore.

## Abnahme und Grenzen

Zwölf synthetische Tests mit temporären Archiven bestanden auf dem Mailserver:
Erfolgsrotation, native Fehler, defekte Archive/Prüfsummen, nicht vorbereitete
Datenbank, fehlender Mount, unbekannter Teilstand, unterbrochene Löschung,
unerwartete Dateien, veränderter Nachfolger, Selbstlöschung und Pfad-/Symlinkschutz.
Die echten Programme für zstd, Tar-Prüfung und den atomaren Zustandswechsel
wurden dabei verwendet; die Testdateien lagen ausschließlich im temporären
Testverzeichnis. Bestehende Maildaten und echte Sicherungen blieben unberührt.

Die Erstinstallation hat den zuvor geprüften Novemberstand übernommen,
Preflight und systemd-Prüfung bestanden. Der Timer ist aktiviert. Nächster
Lauf bei Abnahme: **7. November 2026, 01:30 Europe/Berlin**. Ein erster
produktiver Nachtlauf und dessen Rotation wurden am Abend des 6. November
noch nicht beobachtet. Die heutigen früheren Einmalsicherungen sind kein
Nachweis dieses zukünftigen Timerlaufs.

Die vorhandene interne SOGo-Nutzerdatensicherung bleibt unabhängig davon
unverändert. Keine externe Kopie eingerichtet. Es bleibt bewusst nur ein
vollständiger erfolgreicher Mailcow-Stand statt einer mehrtägigen Historie.
