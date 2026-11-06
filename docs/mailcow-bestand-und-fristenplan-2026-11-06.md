# Mailcow: lesender Bestand und Vorschlag für Aufbewahrungsregeln

**Spätere Ergänzung:** Die gezielte Inventur des separaten Volumes hat drei
Mailcow-Komponentensicherungen nachgewiesen. Der frühere Suchumfang war noch
nicht vollständig; aktueller [Backup-Volumenbestand](../../docs/reports/2026-11-06-mailcow-backup-volumenbestand.md).

Zentral nachschlagen: [Mailserver-Konfiguration](../../docs/dienste/mailserver-mailcow.md)
und [zentrale Bestandsaufnahme](../../docs/reports/2026-11-06-mailcow-bestand-und-fristenplan.md).
Der folgende Projektbericht bleibt als datierter ursprünglicher Nachweis erhalten.

Stand: 6. November 2026, Erfassung etwa 09:47–09:57 Uhr Europe/Berlin.
Server `78.47.46.159`, Hostname `mail`, Installation `/opt/mailcow-dockerized`.
Git-Versionsbeschreibung: `2026-10-13-g22f60e91`.

**Spätere Aktualisierung am selben Tag:** Auf ausdrücklichen Folgeauftrag wurden
die fünf freigegebenen Aufbewahrungsregeln anschließend eingerichtet. Der folgende
Text hält die vorherige ausschließlich lesende Erfassung fest. Aktueller
Umsetzungsstand: [Aufbewahrungsabnahme](mailcow-aufbewahrung-umsetzung-2026-11-06.md).

## Umfang und Ergebnis

Beauftragt waren ausschließlich lesende Erfassung und Planung. Auf dem Server
wurden keine Konfigurationen geschrieben, Jobs ausgeführt, Dienste neu gestartet,
Sicherungen angelegt oder Daten gelöscht. Mailnachrichten, Anhänge, Betreffzeilen,
Logeinträge mit Nachrichtenbezug und Backup-Inhalte wurden nicht geöffnet.
Gelesen wurden Konfigurationen, Scheduler-Metadaten, Dateigrößen und gezielte
SELECT-/GET-/LLEN-Metadaten. Dieses Dokument ist eine lokale Planungsdatei;
keine Veröffentlichung im CMS und keine Betriebsfreigabe wurden vorgenommen.

**Die wichtigsten offenen Betriebsrisiken sind unbegrenzte Dockerlogs und ein
über diesen Zugang nicht nachgewiesenes vollständiges externes Mailcow-Backup.**
Das Fehlen eines lokalen Backup-Jobs beweist nicht, dass keine Provider- oder
extern angestoßenen Sicherungen existieren.

## Tatsächlich festgestellter Zustand

| Bereich | Befund | Bedeutung / Grenze des Nachweises |
| --- | --- | --- |
| Dockerlogs aller 18 Mailcow-Container | `json-file`, Logoptionen leer; auch keine passenden Default-Logoptionen in `daemon.json` | Keine konfigurierte Größenrotation oder feste Altersfrist. Zusammen rund 294 MiB; die Container bestehen seit 22. Oktober. Alter einzelner Einträge wurde nicht durch Lesen der Logs ermittelt. |
| Mailcow-Oberflächenlogs in Redis | `LOG_LINES=9999`; minütlicher Job `trim_logs.sh` mit `LTRIM … 0 9999` | Wegen inklusiver Indizes bis zu 10.000 Einträge nach Bereinigung; zwischen Läufen etwas mehr. Bestätigte Listenlängen etwa 10.000–10.014. Mengenbegrenzung, keine Frist in Tagen; betrifft nicht die Dockerlogs. |
| Rspamd-Verlauf | `nrows=1000`, Kompression aktiv, `subject_privacy=false`, kein explizites `expire` im wirksamen Modul | Bis zu 1.000 Verlaufseinträge; keine nachgewiesene Altersgrenze. Betreffschutz ist nicht aktiviert. Keine Verlaufseinträge wurden gelesen. |
| Host-syslog und Auth-Protokolle | `logrotate`: wöchentlich, vier Archive, Kompression | Vier Wochenarchive plus laufende Datei; ungefähr vier bis fünf Wochen bei funktionierendem Wochenlauf, kein exaktes 30-Tage-Limit. Vorhandene Archivdateien wurden nur anhand Größe und Änderungszeit geprüft. |
| Host-Journal | Rund 3,9 GiB; keine explizite Aufbewahrungsfrist in der effektiven journald-Konfiguration | Keine konfigurierte Tagesfrist nachgewiesen. Enthaltene Ereignisse wurden nicht gelesen. |
| Postfix-Zustellwarteschlange | `maximal_queue_lifetime=5d`, `bounce_queue_lifetime=1d` | Technische Wiederholungs-/Ablauffristen für Zustellung, keine Aufbewahrungsfrist regulärer Postfachnachrichten. |
| Postfächer / Papierkorb / Spam | Wirksame Dovecot-Autoexpunge-Werte `0`; keine positive globale Ordner-Alterslöschung nachgewiesen | Keine automatische Löschung nach einer bestimmten Anzahl Tagen in den geprüften globalen Einstellungen. Individuelle Sieve-Regeln und externe Mailprogramme wurden nicht untersucht. |
| Gelöschte vollständige Maildirs | `MAILDIR_GC_TIME=7200`; tatsächliches Skript verwendet `find … -cmin +7200`; Job alle 30 Minuten | Fünf Tage nach maßgeblicher Verzeichnis-Statusänderung, anschließend nächster Lauf. Betrifft den `_garbage`-Bereich gelöschter Mailverzeichnisse, nicht jede einzeln gelöschte Nachricht. Bereich aktuell leer. |
| Quarantäne | Tabelle leer; `Q_MAX_AGE=365`; kein positiver `Q_RETENTION_SIZE`-Wert gespeichert | Kein aktuell gespeicherter Quarantänebestand. Der 365-Tage-Wert sollte vor einer künftigen Nutzung ausdrücklich bewertet werden; allein daraus folgt kein Nachweis aktiver Quarantäne-Speicherung. |
| SOGo-Sitzungen | `SOGO_EXPIRE_SESSION=480`; minütlicher Ablaufjob | Acht Stunden als konfigurierter Sitzungsablaufparameter. Kein Nachweis einer Löschfrist für E-Mails. |
| Interne SOGo-Wiederherstellung | Täglich 00:00 Uhr Europe/Berlin, `sogo-tool backup /sogo_backup ALL`; 29 Dateien, zusammen rund 288 KiB; zuletzt 6. November gegen 00:00 Uhr aktualisiert | Interne SOGo-Nutzerdatensicherung auf demselben Server. Kein vollständiger Mailcow-/Mailbestand-Backupnachweis und keine nachgewiesene Generationen-/Altersrotation. Inhalte wurden nicht geöffnet. |
| Vollständige Mailcow-Sicherungen | `/opt/backup` leer, liegt auf Root-Dateisystem; kein passender Job in geprüften Host-Crontabs, Cron-Verzeichnissen, systemd-Timern oder Mailcow-Ofelia-Jobs | Kein lokaler vollständiger Backup-Ablauf nachgewiesen. Keine Borg-/Restic-/Rclone-/Duplicity-Programme oder entsprechenden üblichen Konfigurationsverzeichnisse gefunden. Externe Pull-Jobs und Provider-Sicherungen bleiben offen. |

Die Routing-Konfiguration der geprüften Postfix-/Dovecot-/SOGo-Container bestätigt
die parallele Ausgabe nach stdout und in Redis. Deshalb genügt es nicht, nur
die Logansicht im Mailcow-Adminbereich zu begrenzen.

### Kapazität

- `/var/vmail`: rund **21,4 GiB** laut aggregierter Verzeichnisgröße; keine Mailinhalte gelesen.
- Root-Dateisystem: rund **74,8 GiB**, davon **33,3 GiB verfügbar**, Auslastung 54 %.
- Zwei zusätzliche unkomprimierte Kopien des jetzigen Mailbestands benötigen
  bereits rund 42,8 GiB, noch ohne Datenbank, sonstige Bestandteile und Reserve.
- Zwei lokale Vollstände dürfen deshalb nicht ungeprüft auf dieser Root-Platte
  eingerichtet werden. Die spätere Kompression ist kein verlässlicher Kapazitätsnachweis.

## Vorgeschlagene Regeln – noch nicht eingestellt

Die folgenden Fristen sind ein betrieblicher Vorschlag anhand der Zwecke,
keine pauschal gesetzlich vorgeschriebenen Mailserver-Fristen. Regeln für diesen
Server betreffen gegebenenfalls weitere dort betriebene Domains und Benutzer.

| Datenart | Vorschlag | Begründung und notwendige Umsetzung |
| --- | --- | --- |
| Zustell-, IMAP-, Webmail- und Webzugriffs-Diagnose | **7 Tage**, danach nächster täglicher Bereinigungslauf | Für kurzfristige Zustellungs-/Funktionsfehler. Alle Kopien erfassen: Docker, Redis, gegebenenfalls Dateilog. Für konkrete Sicherheitsfälle erforderliche Belege separat zweckgebunden sichern und nach Fallabschluss erneut prüfen. |
| SSH-/Admin-Anmeldung und sicherheitsrelevante Hostereignisse | **30 Tage**, danach tägliche Bereinigung | Längerer Zeitraum für die Erkennung und Untersuchung von Zugriffsproblemen; auf diese Kategorie begrenzen. Nicht sämtliche Maildiagnose pauschal 30 Tage speichern. |
| Rspamd-Verlauf | **7 Tage als Ziel**, zusätzlich maximal **1.000 Ereignisse**; Betreffschutz aktivieren oder Betreff aus Verlauf entfernen | Die Altersgrenze muss technisch zusätzlich nachgewiesen werden. Ein Redis-Key-TTL für inaktive Schlüssel ist keine garantierte Alterslöschung einzelner Einträge in einer weiter beschriebenen Liste. |
| Spam-/Junk-Ordner | **14 Tage** | Zeitfenster zur Korrektur falsch erkannter Nachrichten. Erst nach Information der betroffenen Postfachnutzer; individuelle Anforderungen prüfen. |
| Papierkorb | **30 Tage** | Wiederherstellung versehentlich gelöschter Nachrichten. Auf die tatsächlich als Papierkorb markierten Ordner begrenzen; Posteingang, Gesendet und Archive nicht pauschal erfassen. |
| Quarantäne | Ohne fachlichen Bedarf nicht aktivieren; bei Nutzung **14 Tage** statt 365 | Zusammen mit Größen-/Mengenlimit, Benachrichtigung und Abrufprozess planen. Leerer Bestand bedeutet nicht, dass eine spätere Aktivierung automatisch passende Fristen hätte. |
| Gelöschte vollständige Maildirs | **5 Tage beibehalten**, sofern der Betreiber dieses Wiederherstellungsfenster benötigt | Bereits vorhandenes Verfahren; als eigene Restaufbewahrung dokumentieren. Zusätzliche Backup-Kopien separat berücksichtigen. |
| Kontaktanfragen im Postfach und in Payload | Nach abschließender Bearbeitung und Wegfall des weiteren Bedarfs löschen; **monatliche Prüfung** offener/abgeschlossener Fälle | Die Monatsprüfung ist ein Arbeitsablauf, keine pauschale Frist für alle geschäftlichen Dokumente. Erforderliche Vertrags-/Nachweisdokumente nach ihrem jeweiligen Zweck und ihren gesetzlichen Pflichten gesondert behandeln. |
| Vollständige Wiederherstellungssicherungen | Täglich; **2 lokale und 14 externe erfolgreiche Stände** als Ausgangspunkt | Für den aktuellen Speicherbedarf separate Ablage oder geprüftes inkrementelles Verfahren nötig. 14 Stände sind nur bei täglichem Erfolg ungefähr 14 Tage. Falls eine feste Höchstdauer zugesagt werden soll, zusätzlich Altersgrenze und Verhalten bei Backup-Ausfall entscheiden. |
| Interne SOGo-Kopien | Als kurzfristige Hilfskopie behandeln; verwaiste Kopien gelöschter Konten spätestens nach **14 Tagen** bereinigen | Erst Eigentümerzuordnung und tatsächliches Überschreib-/Löschverhalten prüfen. Kein Ersatz für externe Sicherung und Restoretest. |

### Technische Grenzen der Fristvorschläge

1. **Größenrotation ist keine Alterslöschung.** Als erste Schutzmaßnahme wäre eine
   Mailcow-spezifische Docker-Größenbegrenzung sinnvoll, beispielsweise drei Dateien
   zu je 10 MiB pro Container. Das verhindert ungebremstes Wachstum, erfüllt allein
   aber keine Zusage „Löschung nach sieben Tagen“. Eine ergänzende altersgesteuerte
   Protokollablage muss einschließlich Redis, Docker-Zweitkopien und Journal geplant werden.
2. Docker schreibt bestehende Container bei einer neuen Default-Konfiguration
   nicht automatisch um. Dafür ist später ein kontrollierter, Mailcow-spezifischer
   Containerwechsel mit Prüfung des Mailflusses nötig. Kein globaler Docker-Neustart
   und keine direkte Manipulation aktiver Docker-JSON-Dateien als Abkürzung.
3. Bei Redis müssen die vorhandenen Zeitstempel und Logformate für eine
   altersabhängige Bereinigung zuerst mit synthetischen Testdaten geprüft werden.
   `LTRIM` oder ein TTL auf dem ständig aktualisierten Listenschlüssel reicht dafür nicht.
4. Löschung in aktiven Datenbeständen entfernt vorhandene Backup-Kopien nicht
   sofort. Deren Rotation und eine erneute Anwendung von Löschungen nach einem
   Restore müssen dokumentiert sein. Backups sind kein dauerhaftes Mailarchiv.

## Reihenfolge eines späteren Umsetzungsauftrags

1. **Backup-Nachweis schließen:** Provider-Backups/Snapshots und externe Pull-Jobs
   im jeweiligen Konto prüfen; bestehende Sicherungen weder ersetzen noch löschen.
   Ziel, Standort, Verschlüsselung, Schlüsselzugriff, Generationen und tatsächlichen
   Umfang klären. Danach lokale Kapazität beziehungsweise separate Backup-Ablage wählen.
2. **Ersten Restorepunkt und isolierten Restore planen:** Mailbestand, Datenbank,
   Mailverschlüsselungsschlüssel und notwendige Konfiguration gemeinsam sichern;
   das offizielle Mailcow-Verfahren versionsgerecht prüfen. Wiederherstellung ohne
   produktiven SMTP-Versand und ohne Aktivierung von Benutzerzugriffen testen.
3. **Logkonzept umsetzen:** Mengenlimit als unmittelbarer Speicherschutz, danach
   die gewählten Zeitgrenzen für alle relevanten Speicherwege nachweisen. Host-
   und Mailcow-Regeln getrennt behandeln; gemeinsame Dienste nicht beiläufig ändern.
4. **Postfachregeln abstimmen:** Spam/Papierkorb und interne Restkopien erst nach
   Festlegung des Geltungsbereichs ändern. Keine automatische Komplettlöschung
   des Kontaktpostfachs und keine globale Löschregel für alle Postfächer.
5. **Abnahme und Überwachung:** Alter und Anzahl von Einträgen mit synthetischen
   Beispielen prüfen; Backup-Erfolg, letzter Restoretest und Jobfehler überwachen.
   Alarmempfänger und Verhalten bei Ausfall festlegen.
6. **Dokumentation veröffentlichen:** Erst die tatsächlich eingerichteten Regeln
   in Löschkonzept und Datenschutzerklärung übernehmen. Der heutige Befund allein
   rechtfertigt noch keine neue Zusage fester Löschfristen.

## Noch offen

- Tatsächliche Provider-Backups/Snapshots oder Sicherungen durch einen externen
  Rechner sind allein über die gelesenen Serverkonfigurationen nicht nachgewiesen.
- Es wurde kein Restore ausgeführt und kein Backup-Archiv geöffnet.
- Individuelle Mailclient-/Sieve-Regeln, geschäftliche Archivierungspflichten und
  die Anforderungen anderer auf diesem Server betriebener Postfächer wurden nicht erhoben.
- Dass ein Scheduler-Job eingerichtet ist, beweist nicht allein seinen dauerhaft
  erfolgreichen Lauf; heute wurden keine Jobs manuell ausgelöst.

## Quellen zur Einordnung

- [Mailcow: Logging](https://docs.mailcow.email/post_installation/firststeps-logging/) – parallele Logwege und Rotation separat behandeln.
- [Docker: Logging konfigurieren](https://docs.docker.com/engine/logging/configure/) – Default ohne Rotation; neue Regeln wirken nicht rückwirkend auf vorhandene Container.
- [Mailcow: Backup](https://docs.mailcow.email/backup/) – Komponenten und optionaler `--delete-days`-Parameter; Dokumentationsbeispiele beweisen keine vorhandene Einrichtung.
- [Mailcow: versehentlich gelöschte Daten](https://docs.mailcow.email/backup_restore/b_n_r-accidental_deletion/) – interne Wiederherstellung von SOGo-Daten separat von einer vollständigen Sicherung betrachten.
- [Rspamd: Redis-Verlauf](https://docs.rspamd.com/modules/history_redis/) – Mengenlimit, Betreffschutz und Ablauf inaktiver Schlüssel unterscheiden.
- [Sächsische Datenschutzaufsicht: Speicherbegrenzung](https://www.datenschutz.sachsen.de/grundsaetze-der-datenverarbeitung-4049.html) – am Verarbeitungszweck orientieren; daraus folgt keine allgemeine siebentägige Mailserverfrist.
