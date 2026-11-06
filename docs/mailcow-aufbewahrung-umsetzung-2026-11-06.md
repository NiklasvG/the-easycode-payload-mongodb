# Mailcow: umgesetzte Aufbewahrungsregeln

**Spätere Ergänzung:** Drei Mailcow-Komponentensicherungen auf separatem Volume
sind inzwischen lesend nachgewiesen. Der vorherige Suchumfang war noch nicht
vollständig; aktueller [Backup-Volumenbestand](../../docs/reports/2026-11-06-mailcow-backup-volumenbestand.md).

Zentral nachschlagen: [Mailserver-Konfiguration](../../docs/dienste/mailserver-mailcow.md)
und [zentraler Umsetzungsbericht](../../docs/reports/2026-11-06-mailcow-aufbewahrung-umsetzung.md).
Die gemeinsame Dokumentation ist der Einstieg für spätere Betriebsänderungen;
dieser Projektbericht hält die Abnahme vom 6. November fest.

Stand: 6. November 2026. Server `78.47.46.159`, Installation
`/opt/mailcow-dockerized`, Zeitzone der Mailcow-Dienste Europe/Berlin.

Der Betreiber hat nach der lesenden Bestandsaufnahme die folgenden fünf Regeln
ausdrücklich zur Umsetzung freigegeben. Backup-Prüfung und Backup-Einrichtung
bleiben davon getrennt. Es wurde kein Mailbackup angelegt, geöffnet oder gelöscht.

## Eingerichtet und geprüft

| Bereich | Regel | Tatsächliche Umsetzung |
| --- | --- | --- |
| Zustell-/Funktionsprotokolle | 7 Tage | Mailcow-Container schreiben in das native Journal statt in unbegrenzt wachsende Docker-JSON-Dateien. Journal-Maximalalter sieben Tage, Dateirotation höchstens stündlich; Host-Textlogs täglich mit passender Rotation. Redis-Loglisten und Rspamd-Verlauf werden zusätzlich nach tatsächlichem Ereigniszeitpunkt bereinigt. |
| Sicherheits-/Anmeldeprotokolle | 30 Tage | Erkannte Sicherheitsereignisse werden in eine root-geschützte aktive 30-Tage-Ablage übernommen. Die Aufbewahrung gilt auch für Redis-Sicherheitsloglisten und für die geprüften nativen Login-Historien. Geschlossene Host-Textarchive erhalten zusätzlich eine unabhängig von neuer Logaktivität ausgeführte Altersbereinigung. |
| Spam | 14 Tage | Native Dovecot-`autoexpunge`-Regeln für 15 vorhandene lokalisierte Spam-Aliasdefinitionen; täglicher zusätzlicher Lauf für tatsächlich vorhandene Ordner und deren Unterordner. |
| Papierkorb | 30 Tage | Native Dovecot-`autoexpunge`-Regeln für 29 vorhandene lokalisierte Papierkorb-Aliasdefinitionen; täglicher zusätzlicher Lauf. Regulärer Posteingang, Gesendet und Archive außerhalb dieser Sonderordner sind ausgenommen. |
| Quarantäne, falls genutzt | 14 Tage | Redis-Parameter `Q_MAX_AGE` von 365 auf 14 gesetzt. Der Aktivierungs-/Mengenparameter wurde nicht geändert; sein gespeicherter Wert ist weiterhin nicht gesetzt. Quarantäne wurde dadurch nicht aktiviert. Der vorhandene native tägliche Job verwendet die Frist bei einer Nutzung. |

Die Zeitgrenzen gelten bis zum nächsten erfolgreichen Bereinigungs-/Rotationslauf.
Native Journalrotation arbeitet dateiweise; dadurch ist dies keine sekundengenaue
Einzellöschgarantie. Mengenlimits können Daten früher entfernen. Fristen für
Spam und Papierkorb beziehen sich auf den Speicherzeitpunkt im jeweiligen Ordner.

### Zeitpläne

- `mailcow-retention.timer`: aktiviert; fünf Minuten nach dem letzten abgeschlossenen
  Lauf, nach einem Serverstart erstmals nach drei Minuten.
- `mailcow-folder-retention.timer`: aktiviert; täglich **03:40 Uhr Europe/Berlin**,
  verpasste Ausführung nachholen. Nächster Tagestermin bei der Abnahme:
  **7. November 2026, 03:40 Uhr deutscher Zeit**.
- Beide manuellen Erstläufe wurden erfolgreich abgeschlossen (`Result=success`,
  `ExecMainStatus=0`). Anschließend wurde auch ein regulär vom Logtimer gestarteter
  Lauf beobachtet und erfolgreich abgeschlossen. Der erste spätere tägliche
  Nachtlauf der Ordnerbereinigung ist damit noch nicht nachgewiesen.
- Native Dovecot-Autoexpunge und der vorhandene tägliche Quarantäne-Job ergänzen
  die Hosttimer; sie ersetzen nicht deren Fehlerkontrolle.

## Konkrete Abnahmen

1. **Unveränderte Anwendungsversionen:** Alle 18 Mailcow-Container laufen mit
   denselben zuvor erfassten Images, derselben Zuordnung und dem neuen
   `journald`-Logtreiber. Keine Volumes entfernt, keine Installation neu angelegt,
   kein Versionsupgrade vorgenommen. Abschließend keine `unhealthy`-Komponente.
2. **Dienstverfügbarkeit:** SMTP-Anschlüsse 25, 465 und 587 sowie IMAP 993 antworten
   mit korrekter Protokollbegrüßung. Für SMTP 465 und IMAP 993 wurden Zertifikat
   und Hostname `mail.ec-host.de` erfolgreich geprüft; HTTPS-Oberfläche HTTP 200.
   Es wurde keine Testmail versandt. Dies belegt Erreichbarkeit/TLS und keinen
   vollständigen Versand-/Empfangstest mit einer echten Nachricht.
3. **Alterslogik:** Neun synthetische Tests bestanden, unter anderem getrennte
   7-/30-Tage-Grenzen, variable Docker-Zeitformate, Jahreswechsel, inaktive
   geschlossene Textlogs und die speicherbegrenzte Bereinigung großer nativer
   Login-Historien. Die tatsächliche Redis-Brücke wurde separat an einem eigenen
   synthetischen Schlüssel auf Nebenläufigkeit und TTL-Erhalt geprüft.
4. **Echte Logbereinigung:** Nach erfolgreichem Lauf wurden 45.407 vorhandene
   Redis-/Rspamd-Verlaufseinträge erneut ausschließlich anhand ihrer Zeitmetadaten
   geprüft: **kein verbliebener abgelaufener Eintrag** zum Prüfzeitpunkt. Neue
   Einträge und mengenbedingt bereits entfernte Einträge können diese Anzahl
   später verändern. Ein erfolgreicher Lauf entfernte außerdem 106.422
   abgelaufene native Login-Historieneinträge; keine individuellen Anmeldungen
   wurden im Beleg ausgegeben.
   Die spätere Abschlussstichprobe um 11:22 Uhr deutscher Zeit sah zwei inzwischen
   neu abgelaufene Redis-Einträge nach dem letzten erfolgreichen automatischen
   Lauf um 11:21 Uhr. Diese liegen im vorgesehenen Fünf-Minuten-Bereinigungsfenster;
   es wird keine kontinuierliche sekundengenaue Löschung behauptet.
5. **Sonderordner:** Der gezielte Lauf über **84 tatsächlich vorhandene** Spam-/
   Papierkorb-Ordner beziehungsweise Unterordner war erfolgreich. Die 44 globalen
   Aliasdefinitionen sind nicht mit 44 tatsächlich bestehenden Ordnern gleichzusetzen.
   Der Beleg hält keine Benutzernamen, Nachrichten oder individuellen Löschlisten fest.
6. **Altbestand:** Benötigte ältere Sicherheits-/Funktionslogs wurden in die
   altersbegrenzte geschützte Ablage übernommen. 1.443.392 alte Docker-Logzeilen
   wurden dabei verarbeitet; Verarbeitung bedeutet nicht dauerhafte Aufbewahrung
   aller Zeilen. Es bleiben keine unbereinigten Zwischenkopien in
   `migration-pending` zurück.

Privater Gesamtbeleg auf dem Mailserver:
`/var/lib/mailcow-retention/verification-20261106.json`.
Quellen und Betriebsbeschreibung im Repository:
[ops/mailcow-retention](../ops/mailcow-retention/README.md).

### Korrigierte Probleme beim Erstlauf

- Unterschiedlich lange Sekundenbruchteile alter Docker-Zeitstempel wurden für
  die auf dem Server verwendete Python-Version normalisiert; vorhandene Altlogs
  blieben bis zur erfolgreichen Nachverarbeitung erhalten.
- Die große native `btmp.1`-Datei führte zunächst zur Beendigung durch das eigene
  Speicherlimit. Die Bereinigung wurde auf kleine, gesperrte Datenblöcke umgestellt,
  synthetisch geprüft und bei unverändertem 256-MiB-Limit erfolgreich wiederholt.
- Nicht in jedem Postfach vorhandene Sprachvarianten führten beim ersten
  allgemeinen Dovecot-Aufruf zu Fehlern. Der Helfer ermittelt nun zuerst die
  tatsächlichen Ordner und bearbeitet nur passende Sonderordner des jeweiligen
  Postfachs. Globale fehlende Ordnernamen werden nicht blind ignoriert.

## Auswirkungen und Betrieb

Die Umstellung benötigte eine kontrollierte Neuerstellung der Mailcow-Container.
Dadurch waren kurze Unterbrechungen einzelner Dienste möglich. Bestehende
Postfachdaten und Warteschlangen blieben in ihren vorhandenen Volumes; die
gewollte Alterslöschung betrifft ausschließlich die genannten Ordner und Logs.
Bereits gelöschte Daten kommen durch Zurücksetzen einer Konfiguration nicht zurück.

Die zusätzliche Sicherheitsablage ist root-geschützt (Verzeichnisse 0700,
Dateien 0600) und wird selbst nach Alter bereinigt. Sie ist keine neue unbegrenzte
Backup-Ablage. Die Sicherheitsklassifikation nutzt die in `security()` dokumentierten
Syslog-Facilities, Logschlüssel und Merkmale; neue Logformate müssen beim Betrieb
geprüft werden. Unbekannte Zeitformate führen zu einem sichtbaren Abbruch statt
einer beliebigen Datenlöschung.

Der Zustand der Timer und die jeweiligen systemd-Fehler sind zu überwachen.
Eine neue E-Mail-Benachrichtigung für diese Helfer wurde nicht eingerichtet.
Website-Deployments aktualisieren diese Hostdienste nicht automatisch.

## Datenschutzerklärung und weiterhin offene Backup-Frage

Die tatsächlichen Mailserver-Fristen sind in Abschnitt 6 des lokalen
[Datenschutzentwurfs](datenschutzerklaerung-entwurf.md) ergänzt. Die CMS-Seite wurde
dadurch nicht veröffentlicht oder geändert. Die Fristen allein schließen die
gesamte Datenschutzerklärung noch nicht ab: tatsächliche Mailbackup-Aufbewahrung,
die im Entwurf markierten weiteren Website-/OpenAI-Angaben und die Übereinstimmung
mit dem veröffentlichten Betrieb bleiben vor einer Gesamtfreigabe zu klären.

Die vom Systemintegrator übersandte Beschreibung erklärt den möglichen Umfang
von `backup all`, bestätigt jedoch keinen tatsächlich ausgeführten Job und keinen
separaten Backup-Mount. Bei der vorherigen lesenden Erfassung war `/opt/backup`
leer und lag auf dem Root-Dateisystem; externe Provider-/Pull-Sicherungen wurden
damit nicht ausgeschlossen. Die gefundene interne tägliche SOGo-Sicherung ist
kein nachgewiesenes Backup der E-Mail-Postfächer. Die ursprüngliche Gleichsetzung
„SOGo sichert die Mails“ wäre deshalb falsch.

Der Betreiber prüft Backup-Läufe, Ziel, Umfang, Standort und Rotation separat.
Vorhandene Sicherungen und deren Regeln wurden mit diesem Auftrag nicht verändert.

Fachliche Einordnung: [Informationspflichten](https://www.datenschutz.sachsen.de/informationspflichten.html)
und [Speicherbegrenzung](https://www.datenschutz.sachsen.de/grundsaetze-der-datenverarbeitung-4049.html)
der sächsischen Datenschutzaufsicht. Die gewählten Fristen sind die festgelegte
Betriebsregel und keine pauschale gesetzliche Frist für sämtliche E-Mail-Daten.
