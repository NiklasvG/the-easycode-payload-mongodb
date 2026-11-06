# Mailcow-Aufbewahrung

Zentraler Betriebseinstieg:
[Mailserver-Konfiguration](../../../docs/dienste/mailserver-mailcow.md).
Ein geprüfter Referenzstand dieser Quellen liegt zusätzlich unter
[docs/operations/mailcow](../../../docs/operations/mailcow/README.md).
Spätere Betriebsänderungen dort und mit dem tatsächlichen Hoststand abgleichen.

Projektgebundene Betriebsquellen für den separat betriebenen Mailserver
`78.47.46.159`, Installation `/opt/mailcow-dockerized`. Diese Dateien werden
**nicht** durch ein Website-Deployment installiert oder ausgeführt.

Der Auftrag umfasst Zustell-/Funktionslogs sieben Tage, Sicherheits-/Anmeldelogs
30 Tage, spezielle Spamordner 14 Tage, spezielle Papierkörbe 30 Tage und einen
Quarantäne-Alterswert von 14 Tagen ohne Aktivierung der Quarantäne.
Mailbackups werden durch dieses Verfahren weder angelegt noch verändert.

## Hostinstallation

- Root-eigene Quellen: `/srv/mailcow-retention`, Verzeichnis 0700, Dateien 0600.
- Privater Betriebszustand und Prozesslock: `/var/lib/mailcow-retention`.
- Nach Datum getrennte aktive Logablage:
  `/var/log/mailcow-security-retained/{delivery,security}`, root 0700/0600.
  Dies ist keine dauerhafte Beweis- oder Backupablage; die Altersbereinigung
  gilt auch dort.
- `folders.json` wird aus den bereits vorhandenen `special_use = \Junk`- und
  `\Trash`-Ordnerdefinitionen von `doveconf -n` erzeugt. Die geprüfte Installation
  hatte 44 lokalisierte Aliasdefinitionen. Posteingang, Gesendet und gewöhnliche
  Archive gehören nicht in diese Datei.
- Prozesszustand, Zugangsdaten, Mailnamen und Protokolle nicht in Git übernehmen.
  Redis-Zugang bleibt im vorgesehenen PHP-Container; die Brücke liest ausschließlich
  die benötigte Variable innerhalb dieses Containers und gibt sie nicht aus.

## Verfahren

`retention.py run` übernimmt neue Sicherheitsereignisse aus dem Systemjournal
anhand eines gespeicherten Cursors, bereinigt die festgelegten Redis-Loglisten
und den Rspamd-Verlauf anhand der tatsächlichen Ereigniszeit, entfernt abgelaufene
Einträge in der privaten Logablage und in den verifizierten nativen
Login-Historien (`wtmp`, `btmp`, `lastlog`). Es rotiert das Journal höchstens einmal
pro Stunde und verwirft geschlossene Journaldateien nach sieben Tagen.

Die Trennung von Sicherheits- und Funktionslogs erfolgt anhand der Syslog-
Facilities, bestimmter Mailcow-Logschlüssel und der in `security()` dokumentierten
Merkmale. Änderungen an Logformaten oder neue Logschlüssel müssen gezielt geprüft
werden. Bei nicht auswertbarem Zeitformat bricht die Verarbeitung sichtbar ab;
sie nimmt keine beliebige Löschung als Ersatz vor.

`redis.php` ersetzt eine Liste atomar nur um die zuvor als abgelaufen ermittelten
Datensätze. Inzwischen hinzugekommene Einträge und bestehende Schlüssel-TTLs
bleiben erhalten. Es werden weder Nachrichtentexte noch Logtexte ausgegeben;
der Betriebsbeleg enthält nur Anzahlen. Rspamd-Zstandard wird mit der bereits
installierten Bibliothek gelesen; ein TTL auf dem aktiven Verlaufsschlüssel
wird nicht als Alterslöschung einzelner Verlaufseinträge ausgegeben.

`retention.py folders` ermittelt zunächst die vorhandenen Ordner über eine
strukturierte Dovecot-Metadatenabfrage. Es verwendet dann
`doveadm expunge -u <Postfach> mailbox <Ordner> savedbefore <Frist>d`
ausschließlich für tatsächlich vorhandene festgelegte Sonderordner und deren
Unterordner. Nicht vorhandene Sprachvarianten werden nicht aufgerufen. Die Frist
bezieht sich auf den Speicherzeitpunkt im jeweiligen Ordner. Das ist keine
pauschale Löschregel für das Alter aller empfangenen E-Mails. Zusätzlich werden
native `autoexpunge`-Werte in Dovecots `data/conf/dovecot/extra.conf` gesetzt.

## Ergänzende native Konfiguration

- Mailcow-spezifischer `docker-compose.override.yml`: nur Logging-Treiber
  `journald`, Tag `mailcow/{{.Name}}`, nicht blockierender Modus mit 4-MiB-Puffer.
  Images, Ports, Volumes und sonstige Servicekonfiguration bleiben unverändert.
- `/etc/systemd/journald.conf.d/60-mailcow-retention.conf`:
  `MaxRetentionSec=7day`, `MaxFileSec=1h`, `SystemMaxUse=1G`, `RuntimeMaxUse=128M`.
  Mengenlimits können Logs früher entfernen. Journaldateien sind die Einheit
  der nativen Altersrotation; keine sekundengenaue Einzellöschung behaupten.
- Bestehende Host-Textlogs: täglich, sechs Archive für Funktionslogs bzw.
  29 Archive für Auth-/Firewall-Logs; Altersgrenzen sieben bzw. 30 Tage.
  Bei täglicher Rotation zählt auch die aktive Datei zum Aufbewahrungsfenster.
  Native Login-Historien werden zusätzlich nach tatsächlichem Datensatzalter
  in kleinen Datenblöcken bereinigt. Das Layout wurde gegen `utmpdump` der
  x86_64-Installation geprüft. Geschlossene Textarchive werden auch dann nach
  Alter entfernt, wenn die entsprechende aktive Datei keine neuen Einträge erhält.
- Redis `Q_MAX_AGE=14`; `Q_RETENTION_SIZE` bleibt unverändert. Der vorhandene
  native tägliche Quarantänejob führt die Alterslöschung aus.

## Zeitpläne und Prüfung

- `mailcow-retention.timer`: fünf Minuten nach dem vorangegangenen Lauf,
  nach Neustart erstmals nach drei Minuten. `OnUnitInactiveSec` vermeidet
  Überlappung; ein gemeinsamer Prozesslock schützt zusätzlich.
- `mailcow-folder-retention.timer`: täglich 03:40 Uhr Europe/Berlin,
  verpassten Lauf nachholen. Native Autoexpunge kann zusätzlich früher greifen.
- Prüfen: systemd `Result`, `ExecMainStatus`, aktivierte Timer und nächsten Termin,
  `retention.py dry-run`, effektive Dovecot-Fristen, Quarantänewert sowie die
  laufenden Container-Loggingtreiber. Ein erster erfolgreicher manueller Lauf
  belegt noch keinen späteren nächtlichen Lauf.
- Tests: `python3 -m unittest discover -s ops/mailcow-retention -p 'test_*.py'`.
  Zusätzlich wurde die echte Redis-Brücke mit einem eigenen synthetischen
  Kurzzeit-Schlüssel auf Nebenläufigkeit und TTL-Erhalt geprüft; ein isolierter
  Testcontainer bestätigte Journal-Anbindung und `docker logs`.

## Wartung und Rückweg

Vor einer Änderung Timer pausieren und laufende Ausführungen abwarten.
Vorhandene eigene Host-Konfigurationskopien liegen root-geschützt unter
`/srv/mailcow-retention/rollback`; sie enthalten keine Mailbackups.
Logtreiberwechsel erfordern eine kontrollierte Neuerstellung der betroffenen
Container mit **denselben Images und Volumes**, kein globaler Docker-Neustart.
Bei der ersten Umstellung wurden benötigte alte Logeinträge altersgebunden
übernommen. Bei Formatproblemen bleibt ein eindeutig erfasster Zwischenstand zur
Nachverarbeitung statt eines blinden zweiten Durchlaufs.

Gelöschte Spam-/Papierkorb-Nachrichten oder bereits abgelaufene Logs lassen sich
durch Zurücksetzen einer Konfiguration nicht wiederherstellen. Eine Rücksicherung
von Mailbeständen ist ein eigener Auftrag. Provider-Backups, externe Sicherungen
und deren Aufbewahrung bleiben separat zu klären.

Die Fristen gelten im Normalbetrieb bis zum nächsten erfolgreichen
Bereinigungslauf. Native Journal-/Dateirotation kann die Löschung zusätzlich bis
zum nächsten Rotationslauf verzögern. In Datenschutzhinweisen diese praktische
Umsetzung beschreiben und nicht mit einer sekundengenauen Garantie gleichsetzen.
