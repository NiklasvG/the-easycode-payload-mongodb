# Lokale Kopie der Live-Daten

## 1. Lokale Entwicklung starten und stoppen

Docker Desktop starten, dann im Projektordner:

```sh
pnpm dev:local
```

Der Befehl startet zuerst MongoDB, wartet auf das betriebsbereite Replica Set
und startet anschließend die Website unter `http://localhost:3000`.
Docker Desktop muss vorher laufen. Der vorhandene Snapshot bleibt erhalten;
beim Start wird kein neues Backup importiert.

`compose.local.yml` startet MongoDB 8.0 mit einem eigenen Volume und einem
einzelnen Mitglied im Replica Set `rs0`. Der Host-Port ist ausschließlich an
`127.0.0.1:27018` gebunden. Diese lokale Entwicklungsinstanz verwendet keine
Live-Zugangsdaten und keine Authentifizierung.

Zum Stoppen zuerst die Website im Terminal mit Strg+C beenden, anschließend
auch die Datenbank stoppen:

```sh
pnpm local:db:status
pnpm local:db:stop
```

Stoppen erhält die Daten im Volume. Das Startskript verändert die `.env` nicht.
Mit `pnpm local:db` lässt sich bei Bedarf nur die Datenbank starten.
Das vorhandene `docker-compose.yml` ist eine separate ältere Konfiguration;
für den Snapshot-Workflow ausschließlich die obigen Befehle verwenden.

## 2. Live-Stand erneut lokal aktualisieren

1. Während der beiden Backups keine Inhalte oder Medien in Live ändern.
2. In Coolify ein neues MongoDB-Backup und ein neues Backup des unter
   `/app/media` eingebundenen Volumes erstellen und beide herunterladen.
3. Genau diese beiden Dateien in `backups/incoming/` ablegen. Frühere Dateien
   vorher aus diesem Eingangsordner verschieben. Coolify-Dateinamen beibehalten.
4. Den laufenden lokalen Dev-Server mit Strg+C beenden und ausführen:

```sh
pnpm local:refresh
pnpm dev:local
```

`local:refresh` übernimmt beide Archive in einen neuen Snapshot-Ordner, erzeugt
ein Manifest mit SHA-256-Prüfsummen und startet den Import. Die bestätigte
Quelldatenbank ist `easycode_import`, die Versionsreihe ist MongoDB 8.0.
Falls sich diese Live-Konfiguration ändert, muss sie vor dem nächsten Import
auch im Refresh-Skript angepasst werden.

Die Archive in `backups/incoming/` bleiben erhalten. Der Import benötigt keine
Live-Zugangsdaten, keine öffentliche MongoDB und keine SSH-Verbindung.

## 3. Snapshot-Format und Import

Die lokale `.env` wird vom Import eingerichtet und benötigt nach erfolgreichem
Import keine manuellen Änderungen. Für diesen Entwicklungsablauf müssen auf
dem Server keine Umgebungsvariablen geändert werden: dort bleiben die interne
Live-Verbindung, `/app/media`, die öffentliche Website-URL und die SMTP-Werte.
`EMAIL_TRANSPORT` bleibt auf dem Server ungesetzt oder leer, damit SMTP aktiv ist.

Vorgesehen ist ein Ordner `backups/live/<Zeitstempel>/` mit:

- `database.archive.gz`: gzip-komprimiertes MongoDB-Archiv; Coolify kann auch
  bei der Dateiendung `.tar.gz` ein MongoDB-Archiv statt eines Tar-Archivs liefern.
- `media.tar.gz`: Inhalt des Live-Medienverzeichnisses inklusive Bildvarianten.
- `manifest.json`: Exportzeit, Quelldatenbank, MongoDB-Version und Prüfsummen.

Der Ordner `backups/` sowie lokale Medien sind bereits von Git ausgeschlossen.
Für einen zusammengehörigen Snapshot während beider Exporte Schreibzugriffe
auf die Website pausieren. Live-Passwörter und die Live-`.env` werden nicht kopiert.

Ein bereits vorbereiteter Snapshot kann direkt importiert werden:

```sh
pnpm local:import --from ./backups/live/2026-10-03_115807
```

Der Import prüft Manifest und Archive, erstellt eine neue lokale Datenbank sowie
ein neues Medienverzeichnis und prüft alle referenzierten Originale und
Bildvarianten. Erst dann werden `MONGODB_URI` und `PAYLOAD_UPLOAD_DIR` gemeinsam
in der lokalen `.env` umgestellt. URLs werden auf localhost gesetzt, Analytics
deaktiviert und `EMAIL_TRANSPORT=json` verhindert SMTP-Verbindungen und Versand.
Das lokale `PAYLOAD_SECRET` und sonstige Einstellungen bleiben erhalten.

Vor dem Umschalten wird die bisherige `.env` im Snapshot-Ordner gesichert; der
Dateiname steht im Manifest unter `rollbackEnv`. Frühere Datenbanken und
Medienordner bleiben erhalten. Für einen Rollback den Dev-Server stoppen, die
gewünschte gesicherte `.env` ins Projekt zurückkopieren und den Server neu
starten. Die gesicherten Umgebungsdateien liegen wie die Archive außerhalb von Git.

Dateien wie `.env.local` oder exportierte Shell-Variablen können `.env`
übersteuern. Der Import bricht bei solchen konkurrierenden Konfigurationen ab.

## Stand der ersten Einrichtung (3. Oktober 2026)

Das Backup `mongo-dump-all-1791021487.tar.gz` liegt mit Prüfsumme unter
`backups/live/2026-10-03_115807/`. Es enthält zwei Anwendungsdatenbanken:

| Quelle | Lokale Kopie | Datensätze | Seiten | Medien |
| --- | --- | ---: | ---: | ---: |
| `easycode` | `easycode_dev_20261003_115807` | 3 | 0 | 1 |
| `easycode_import` | `easycode_dev_import_20261003_115807` | 494 | 10 | 35 |

Beide Kopien wurden separat und ohne Überschreiben bestehender Daten importiert.
Systemdatenbanken und deren MongoDB-Zugangsdaten wurden nicht importiert.
Der Datenbankname aus der `MONGODB_URI` der Live-Website wurde bestätigt:
Die Anwendung verwendet `easycode_import`. Die vorgesehene lokale Datenbank ist
`easycode_dev_import_20261003_115807`. Der Wert „Initial database“ der
Coolify-Datenbank reicht zur Bestimmung der Anwendungsdatenbank nicht aus.
Die Mediendateien wurden aus dem Volume-Backup `1791021990` importiert.
Die aktive Kopie enthält 494 Datensätze und 35 Medieneinträge. Alle 197
referenzierten Original- und Variantendateien sind vorhanden. Die lokalen
Verbindungswerte wurden gemeinsam auf den geprüften Snapshot umgestellt;
die jeweils aktiven Zielpfade stehen in dessen Manifest. Startseite und
Medien-API sowie sechs Original-/Variantenabrufe wurden über localhost geprüft.
