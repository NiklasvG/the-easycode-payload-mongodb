# Umami: 180-Tage-Aufbewahrung

Am 5. November 2026 auf Betreiberwunsch eingerichtet und einmal erfolgreich
ausgeführt. Die automatische tägliche Erstausführung ist für 6. November 2026
03:10 UTC vorgesehen (04:10 Uhr Berlin im Winter).

## Fester Umfang

- Coolify-Service `pg71i1kdbqjyhh81knlksgoc`, Umami 3.4.0, PostgreSQL 16.
- Tatsächlicher Server: Coolify-Controller `116.202.31.211`, nicht Appserver.
- Website-ID `7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d`; aktuell in Umami als
  EasyCode Staging mit Domain `staging.the-easycode.eu` geführt.
- Nur Telemetrie dieser Website wird nach 180 Tagen bereinigt. Andere Websites,
  Konten, Websitekonfiguration, redaktionelle Anmerkungen und Backups bleiben erhalten.
- Replay war bei der Abfrage deaktiviert. Die Bereinigung aktiviert keine zusätzlichen Messfunktionen.

## Implementierung und Prüfung

Quellen liegen unter `ops/umami/`. Root-eigene Laufzeitkopien auf dem Controller
unter `/srv/the-easycode-umami-retention`; systemd-Units
`the-easycode-umami-retention.service` und `.timer`.
Der Timer ist aktiviert, täglich 03:10 UTC, mit Nachholung verpasster Läufe.
Das ist ein Hostdienst; ein Website-Redeploy aktualisiert ihn nicht automatisch.

Das SQL läuft in einer einzigen Transaktion, mit Websiteprüfung, Transaktionslock,
Locktimeout und Statementtimeout. Fehler rollen die Änderungen zurück.
Es entfernt abgelaufene Ereignisse, deren Zusatzdaten, alte Sitzungsattribute,
Verknüpfungen und gegebenenfalls Heatmap-/Umsatz-/Replaytelemetrie. Alte Sitzungen
bleiben erhalten, solange aktuelle Telemetrie noch auf sie verweist.
Protokolliert werden nur Website-ID und Löschanzahlen, keine Ereignis-/Besucherwerte.

Das tatsächliche Datenbankschema wurde ohne Datensätze in eine isolierte lokale
PostgreSQL-Instanz übernommen. Synthetische Fälle bestätigten: alte eigene Daten
und Zusatzdaten werden entfernt, aktuelle Ereignisse und benötigte Sitzungen
bleiben erhalten, fremde Website-Daten bleiben unverändert, erneute Ausführung
ist idempotent. Danach echter Erstlauf: `Result=success`, `ExecMainStatus=0`.
Es gab keine abgelaufenen Datensätze; alle Löschzähler waren 0. Zuvor wurden
179 aktuelle Website-Ereignisse festgestellt.

Der erfolgreiche Erstlauf und die aktivierte Planung belegen noch keinen
abgeschlossenen nächtlichen Automatiklauf. Journal und Timer nach dem ersten
Termin kontrollieren. Fehler sind im systemd-Status sichtbar; ein eigener
E-Mail-Alarm für diesen Dienst ist noch nicht als eingerichtet nachgewiesen.

## Live-Wechsel und Änderungen

Die Website-ID bleibt beim Domainwechsel erhalten. Umami-Domainbezeichnung und
die finale Trackingkonfiguration auf `the-easycode.eu` abgleichen. Wird bewusst
eine andere Website-ID angelegt, zuerst Skript und Einwilligungs-/Datenschutztext
gezielt anpassen; keine globale Löschregel auf alle Umami-Websites ausweiten.

Die 180-Tage-Regel gilt für die aktive Statistikdatenbank, nicht rückwirkend als
Löschzusage für bestehende Sicherungskopien. Deren eigene Rotation separat prüfen.
