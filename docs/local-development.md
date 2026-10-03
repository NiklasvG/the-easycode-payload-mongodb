# Lokale Kopie der Live-Daten

## 1. Lokale MongoDB vorbereiten

Docker Desktop starten, dann im Projektordner:

```sh
pnpm local:db
```

`compose.local.yml` startet MongoDB 8.0 mit einem eigenen Volume und einem
einzelnen Mitglied im Replica Set `rs0`. Der Host-Port ist ausschließlich an
`127.0.0.1:27018` gebunden. Diese lokale Entwicklungsinstanz verwendet keine
Live-Zugangsdaten und keine Authentifizierung.

Status und Stoppen:

```sh
pnpm local:db:status
pnpm local:db:stop
```

Stoppen erhält die Daten im Volume. Das Startskript verändert die `.env` nicht.
Das vorhandene `docker-compose.yml` ist eine separate ältere Konfiguration;
für den Snapshot-Workflow ausschließlich die obigen Befehle verwenden.

## 2. Snapshot bereitstellen (nächster Einrichtungsschritt)

Vorgesehen ist ein Ordner `backups/live/<Zeitstempel>/` mit:

- `database.archive.gz`: gzip-komprimiertes MongoDB-Archiv der Datenbank `easycode`.
- `media.tar.gz`: Inhalt des Live-Medienverzeichnisses inklusive Bildvarianten.
- `manifest.json`: Exportzeit, Quelldatenbank, MongoDB-Version und Prüfsummen.

Der Ordner `backups/` sowie lokale Medien sind bereits von Git ausgeschlossen.
Für einen zusammengehörigen Snapshot während beider Exporte Schreibzugriffe
auf die Website pausieren. Live-Passwörter und die Live-`.env` werden nicht kopiert.

## 3. Import (noch einzurichten)

Der geplante Import erstellt pro Snapshot eine neue lokale Datenbank und ein
neues Medienverzeichnis. Erst nach erfolgreicher Prüfung werden die lokalen
Verbindungswerte zusammen umgestellt. Frühere Daten bleiben für einen Rollback
erhalten. Der Importbefehl ist derzeit noch nicht implementiert.
