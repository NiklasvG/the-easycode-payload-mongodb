# Belege und offene Angaben zur Datenschutzerklärung

Stand: 6. November 2026. Ältere Abschnitte bleiben als historische Belege erhalten.

## Abschluss: veröffentlicht und technisch geprüft

Die vorherigen offenen Datenschutz-Prüfpunkte sind am 6. November abgeschlossen.
Maßgeblich sind [die fertige Erklärung](datenschutzerklaerung.md), die
[OpenAI-Bewertung](datenschutz-openai-bewertung-2026-11-06.md) und der
[Veröffentlichungs-/Abnahmebericht](datenschutz-abschluss-2026-11-06.md).
Payload und das geprüfte Staging-Release enthalten die neue Fassung einschließlich
zwölf Ankern und direktem Chat-Datenschutzlink. Alte offene Punkte darunter
beschreiben historische Zwischenstände, keinen erneuten Auskunftsbedarf.

## Nächtliche Mailbackup-Rotation verbindlich eingerichtet

Auf ausdrücklichen Betreiberauftrag täglich 01:30 Europe/Berlin, ein
vollständiger erfolgreicher Stand. Der Vorgänger wird erst nach neuer
vollständiger Prüfung entfernt; bei Fehlern bleibt er erhalten. Zwölf
synthetische Tests, systemd-Prüfung und Preflight bestanden. Erster Nachtlauf
steht bei Einrichtung noch aus. Die offene Mailbackup-Rotationsangabe in
Abschnitt 9 ist durch eine kurze tatsächliche Beschreibung ersetzt.
[Zentraler Beleg](../../docs/reports/2026-11-06-mailcow-naechtliche-sicherung.md). Keine CMS-Veröffentlichung.

## Späterer Abgleich der Website-Protokolle und Chat-Konfiguration

Website, Proxy und Easycode-MongoDB wurden lesend geprüft. Kein zusätzliches
Traefik-Zugriffslog gefunden; alle drei Container rotieren mit drei Dateien
à 10 MB. MongoDB-Profiling ist deaktiviert, technische Diagnosekennzahlen sind
auf 250 MB begrenzt. Der entsprechende offene Platzhalter in Abschnitt 2
ist durch die bestätigten Angaben ersetzt. Die künftige Mailbackup-Rotation
und die beschriebenen Chat-Nachweise bleiben offen.

[Prüfbericht und konkrete Restarbeiten](datenschutz-protokoll-und-chat-pruefung-2026-11-06.md).

## Anschließende freigegebene Oktober-Bereinigung

Nach erfolgreicher Prüfung der neuen Sicherung wurden die Stände vom 8. und
22. Oktober 2026 ausdrücklich freigegeben und entfernt. Es bleibt der neue
Novemberstand. Automatische Rotation und vollständiger Restore-Test bleiben offen.
[Nachweis](../../docs/reports/2026-11-06-mailcow-oktoberbackups-entfernt.md). Die folgenden Abschnitte sind historische Vorstufen.

## Spätere freigegebene Mailbackup-Bereinigung und Neusicherung

Am 6. November wurde ausschließlich der Stand vom 7. Februar 2025 entfernt.
Die beiden Oktoberstände sind unverändert erhalten; hinzu kam eine native
Vollsicherung vom 6. November 2026 einschließlich eigenem Konfigurationsarchiv.
Alle sieben neuen Archive wurden vollständig gelesen, dekomprimiert und mit
SHA-256 erfasst; die MariaDB-Vorbereitung ist bestätigt. Kein vollständiger
Restore-Test und kein wiederkehrender Vollbackup-Zeitplan eingerichtet.
Die künftige automatische Aufbewahrung bleibt offen. Die folgende Inventur
beschreibt den historischen Befund vor diesem freigegebenen Eingriff.

Beleg: [Bereinigung und Neusicherung](../../docs/reports/2026-11-06-mailcow-backup-bereinigung-und-neusicherung.md).

## Spätere gezielte Mailbackup-Inventur am 6. November

Auf `/mnt/HC_Volume_102089935` wurden drei Mailcow-Sicherungsstände vom
7. Februar 2025, 8. Oktober 2026 und 22. Oktober 2026 lesend anhand ihrer
Dateimetadaten nachgewiesen. Jeder Stand enthält Archive für vmail, crypt,
MariaDB, Redis, Rspamd und Postfix sowie `mailcow.conf`. Archive und Secrets
wurden nicht geöffnet; Integrität und Restore sind damit noch nicht bewiesen.
Die vorherige Suche nur in üblichen Backup-Pfaden war zu eng und wird hiermit
hinsichtlich Existenz und Speicherziel ergänzt.

Das separate 80-GiB-Volume ist zu 82 % belegt; rund 13,7 GiB sind frei,
verglichen mit rund 21,3 GiB für den jüngsten Vollstand. Regelmäßiger vollständiger
Zeitplan und automatische Löschregel sind weiterhin nicht nachgewiesen.
Die optionale Skriptfunktion `--delete-days` ist keine eingerichtete Frist.
Die offene Angabe betrifft deshalb insbesondere die verbindliche Rotation,
nicht mehr die bloße Existenz solcher Sicherungsstände.

Zentraler Beleg: [Mailcow-Backup-Volumenbestand](../../docs/reports/2026-11-06-mailcow-backup-volumenbestand.md).
Es wurden keine Backups verändert, neue Läufe gestartet oder alte Stände gelöscht.

## Mailcow-Aufbewahrung am 6. November

Der Betreiber hat die im lesenden Bestand vorgeschlagenen fünf Aufbewahrungsregeln
ausdrücklich zur Umsetzung freigegeben. Eingerichtet sind sieben Tage für
Funktions-/Zustelllogs, 30 Tage für Sicherheits-/Anmeldeereignisse, 14 Tage für
Spam, 30 Tage für Papierkorb und 14 Tage als Quarantäne-Altersgrenze ohne Änderung
der Aktivierung. Die tatsächliche Bereinigung der Loglisten und der vorhandenen
Sonderordner wurde geprüft; beide Hosttimer sind aktiviert. Der erste tägliche
Nachtlauf ist dadurch noch nicht nachgewiesen. Der öffentlich verwendete
Datenschutztext wurde durch diese lokale Änderung nicht aktualisiert.

Details, Belege und technische Laufintervalle stehen in
[mailcow-aufbewahrung-umsetzung-2026-11-06.md](mailcow-aufbewahrung-umsetzung-2026-11-06.md).
Der vorherige lesende Bestand bleibt unter
[mailcow-bestand-und-fristenplan-2026-11-06.md](mailcow-bestand-und-fristenplan-2026-11-06.md)
zeitlich eingeordnet erhalten.

Die vom Systemintegrator bereitgestellte Beschreibung des Mailcow-Backupskripts
erläutert dessen möglichen Umfang bei `backup all`. Sie bestätigt noch keinen
tatsächlichen Lauf, Speicherort, Aufbewahrungszeitraum oder Restore. Die gefundene
interne SOGo-Nutzerdatensicherung ist davon getrennt und kein nachgewiesenes
Backup der E-Mail-Postfächer. Der Betreiber prüft Mailbackups separat; entsprechende
Platzhalter bleiben offen. Ebenso bleiben die im Entwurf markierten weiteren
Website-/OpenAI-Nachweise vor einer Gesamtveröffentlichung zu klären.

## Fortschritt der Livegang-Vorbereitung am 5. November

- Der Betreiber bestätigt für Kontaktinhalte eine zweckbezogene Speicherung bis
  zum Abschluss der Bearbeitung. Der Entwurf beschreibt Abschluss, fehlenden
  weiteren Bedarf und gesetzliche beziehungsweise rechtliche Ausnahmen.
  Dies bestätigt keine technische Rotation von Mailserver-Logs oder Mailbackups.
- Die 180-Tage-Bereinigung der eigenen Umami-Website wurde eingerichtet und
  einmal erfolgreich ausgeführt; Details und Grenzen in `umami-retention.md`.
- Konsistente Website-DB-/Medien-Sicherung mit zwei lokalen und vierzehn S3-
  Ständen eingerichtet, Erstlauf und isolierter S3-Restore bestanden.
  S3 liegt in Nürnberg; die frühere pauschale Standortangabe Falkenstein ist
  für dieses Ziel falsch. Anzahlrotation ist keine feste Tagesfrist.
- Die Umami-Datenbank hat einen eigenen täglichen 02:45-UTC-Plan mit zwei lokalen
  und vierzehn S3-Ständen ohne zusätzliche Alters-/Größenlimits; die Ausführung
  vom 5. November mit erfolgreichem S3-Upload wurde bestätigt.
- Mailcow-Protokolle und Postfach-Sicherungsrotation sind noch nicht vollständig
  bestätigt; der vorhandene Betreiber-SSH-Zugang erreicht den Mailserver nicht.
  Der Entwurf enthält dafür offene Prüfpunkte und
  ist noch nicht zur Veröffentlichung freigegeben. Die bestehende CMS-Seite
  wird durch Änderungen an dieser Markdown-Datei nicht aktualisiert.

## Aktualisierung: aktiver globaler OpenAI-Staging-Test

Die bisherigen Gemini-Angaben unten sind historische Prüfergebnisse zum vorherigen
Code und kein Nachweis für den neuen Betrieb. Abschnitt 7 des Website-Entwurfs
wurde auf OpenAI umgestellt. Der globale Chat ist nach Betreiberbestätigung auf
Staging aktiviert und erfolgreich getestet. Neue Prüfpunkte,
Account-Bestätigungen, Datenfluss, VVT- und Interessenabwägungsentwurf stehen in
[ai-chat-openai.md](ai-chat-openai.md).

API-Key und Abrechnung (10 USD Guthaben) sind eingerichtet. Traefik mit
Cloudflare DNS only, nicht veröffentlichtem Anwendungsport und `x-real-ip`
wurde in den dokumentierten Testfällen geprüft. Die temporäre Diagnose ist entfernt.
Personalisierter OpenAI-DPA v.010126 vom 3. Oktober 2026 mit passendem Kundennamen
und Organisations-ID sowie DocuSign-Abschlusszertifikat (Status „Abgeschlossen“)
geprüft. Vertragsseite zeigt beide Unterschriften, Vertragspartner für EWR-Kunden
ist OpenAI Ireland Ltd. Originale privat archivieren, nicht im Repository.
Keine eigenständige kryptografische Signaturvalidierung. EU/ZDR-/MAM-Anfrage
läuft, wird für den aktuellen globalen Test aber nicht als Freigabe behauptet.
Anbieteranschrift und dokumentierte Standardfristen (Missbrauchsprotokolle bis
30 Tage mit Ausnahmen, verschlüsselte Cache-Zwischenzustände bis 24 Stunden)
sind anhand offizieller OpenAI-Quellen ergänzt. Der Betreiber hat am 4. Oktober
2026 die Einwilligung für Nutzer-Chat-Inhalte gewählt; aktive Zustimmung,
Session-Bestätigung (maximal 24 Stunden) und Widerruf sind im Code vorbereitet.
Nachweis nur mit Version, Zeitpunkt und zufälliger ID in rotierenden Anwendungslogs;
keine Chat-Inhalte oder IP in diesen Nachweiseinträgen. Bereitstellung, manueller
Test und abschließende Bewertung des Nachweiskonzepts bleiben offen. Ebenso
eigene Infrastruktur-Speicherfristen und die konkrete Bewertung von Empfängern,
Zielländern und Transfergarantien für den endgültigen Betrieb. Sharing und API-Logging sind
nach Betreiberbestätigung deaktiviert; MFA/Passkey und alleiniger Owner-Zugriff
sind bestätigt. Staging-Deployment ist bestätigt, eine rechtliche oder produktive
Freigabe daraus nicht ableiten. Die Markdown-Änderungen veröffentlichen nichts im CMS.

Die alte Beschreibung einer nicht bereinigten Chat-IP-Map gilt für den neuen
Chat nicht: Er verwendet pseudonymisierte IP-Zähler mit Ablauf und regelmäßigem
Sweep. Für den Staging-Website-Container und `coolify-proxy` ist per
`docker inspect` jeweils Docker-Logging `json-file` mit `max-file=3` und
`max-size=10m` bestätigt. Das ist Größenrotation, keine feste Frist in Tagen.
Die Abfrage der Proxy-Startargumente ergab keinen `accesslog`-Eintrag; auch die
bereitgestellte Compose-Konfiguration aktiviert kein Access-Logging. Eine
zusätzliche statische Traefik-Konfigurationsdatei und die tatsächlichen Inhalte
der Anwendungs-/Fehlerprotokolle wurden damit nicht geprüft. Weitere Speicherwege
und deren Löschregeln bleiben zu klären.

## Bisheriger Prüfstand

Arbeitsnotizen, nicht zur Veröffentlichung als Datenschutzerklärung.

## Ergänzte Angaben

- **E-Mail-Versand:** Laut Betreiberangabe vom 3. Oktober 2026 verwendet die Website `SMTP_HOST=mail.ec-host.de` und die Absenderadresse `no-reply@the-easycode.eu`. Der Mailserver wird selbst auf einem Hetzner-Cloud-Server in Falkenstein, Deutschland, betrieben. Abschnitt 6 beschreibt jetzt diesen bestätigten Versandweg. Die Absenderadresse ersetzt nicht die Kontaktadresse `info@the-easycode.eu`. Zusätzlich bestätigt: `info@the-easycode.eu` ist ein Postfach auf diesem Mailserver; eingesetzte Software ist mailcow (laut Systemansicht Version 2025-01a). Laut Betreiber bestehen für das Kontaktpostfach keine zusätzlichen Weiterleitungen. Die Screenshots zeigen keine senderabhängigen Transporte und für die Domain „Keine Auswahl / Erben“. Laut ergänzender Betreiberbestätigung ist auch kein globales SMTP-Relay eingerichtet; der Relay-Prüfpunkt ist erledigt. Die Versionsangabe wird nur intern dokumentiert.
- **Hosting-Anbieter und AV-Vertrag:** Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland. Der personalisierte AV-Vertrag `dpa-2026-10-03.pdf` nennt Niklas von Grzymala als Auftraggeber und Hetzner als Auftragnehmer; Vertragsdatum 3. Oktober 2026, Version 1.2 vom 16. Februar 2026. Der bisherige AVV-Platzhalter in Abschnitt 2 ist damit ersetzt. Der frühere Domain-Robot-Vertrag wird dafür nicht mehr als Nachweis benötigt.
- **Verarbeitungsregion für Hetzner:** Anlage 3 des personalisierten AV-Vertrags sichert für gewählte EU-Serverstandorte die Verarbeitung der Serverdaten ausschließlich innerhalb der EU zu. Supportleistungen erfolgen ebenfalls innerhalb der EU. § 3 regelt eine etwaige Verlagerung in Drittländer einschließlich vorheriger Zustimmung und der Voraussetzungen nach Art. 44 ff. DSGVO. Die Zusicherung in Abschnitt 2 ist auf Hetzner beschränkt; Google und zusätzliche externe Dienste sind gesondert zu prüfen.
- **Serverstandort:** Falkenstein, Deutschland. Alle fünf Server im Screenshot vom 3. Oktober 2026 stehen dort. Der Betreiber bestätigt zusätzlich, dass Website, MongoDB und Umami auf dem Coolify-Server in Falkenstein laufen. Backup-Ziele und deren Standorte sind davon getrennt noch zu klären.
- **Admin-Authentifizierungs-Cookie:** zwei Stunden ab Ausstellung bzw. Erneuerung. `src/collections/Users/index.ts` verwendet `auth: true` ohne eigene Laufzeit; die installierte Payload-Version setzt in `node_modules/payload/dist/collections/config/defaults.js` `tokenExpiration: 7200`. `node_modules/payload/dist/auth/cookies.js` verwendet diesen Wert für die Cookie-Gültigkeit. Nach dem Deployment im Browser unter Entwicklertools → Application/Speicher → Cookies Ablauf und Erneuerung prüfen.

- **Cookie-Einstellungen:** Laut Betreiber ist `#cookie-settings` im Payload-Footer hinterlegt und wird auf jeder Seite angezeigt. Der entsprechende Platzhalter im Entwurf wurde entfernt. Ein Funktionstest von Öffnen, Ändern und Widerruf bleibt Teil der Prüfung vor Veröffentlichung.

## Mailcow-Screenshots vom 3. Oktober 2026

- Routing: keine senderabhängigen Transporte angelegt; die Domain erbt ihre Transporteinstellungen. Die Oberfläche weist ausdrücklich darauf hin, dass diese Einträge nicht dem globalen Postfix-Parameter `relayhost` entsprechen.
- Aliasse: die Übersicht enthält auch einen Alias zu einer anderen Domain. Das beweist keine Weiterleitung des Kontaktpostfachs `info@the-easycode.eu`; laut Betreiber bestehen dafür keine zusätzlichen Weiterleitungen. Der Speicherort des anderen Alias-Ziels ist aus der Domain allein nicht bestimmbar.
- Protokolle: die Oberfläche nennt maximal 10.000 Einträge je Anwendung (`LOG_LINES`). Sie weist auf zusätzliche Docker-Protokolle hin. Sichtbare Postfix-Logs enthalten IP-Adressen, Absender-/Empfängerangaben, Zeitpunkte und Zustell-/Ablehnungsinformationen. Für diese Daten sind die wirksamen Regeln aller Speicherwege zu prüfen, einschließlich statischer Logs und Rspamd-Protokolle. Die UI-Kategorie „Externe Logs“ belegt für sich keinen externen Dienstleister.
- Quarantäne: deaktiviert; Tabelle ohne Einträge. Daraus folgt keine Löschregel für Spamordner, Postfächer oder Backups.

## Einordnung der neuen Unterlagen

| Unterlage | Beleg und Grenzen |
| --- | --- |
| `dpa-2026-10-03.pdf` | Personalisierter AV-Vertrag, 27 Seiten. Parteien auf Seite 1, Vertragsversion auf Seite 2, Hetzner-Unterschrift und Datum auf Seite 12, ausgefüllte Anlage 1 auf Seite 13, Subunternehmer und EU-Zusicherung auf Seite 27. Die elektronische Zustimmung im Kundenaccount erfordert laut [Hetzner](https://docs.hetzner.com/de/general/company-and-policy/data-protection-at-hetzner/) keine handschriftliche Unterschrift des Kunden. |
| `DPA_de.pdf` | Allgemeines, nicht personalisiertes Vertragsmuster, 32 PDF-Seiten; Vertragstext Version 1.1 vom 10. Februar 2025. Für die Angaben zum abgeschlossenen Vertrag ist die personalisierte Version 1.2 maßgeblich. |
| `TOM.pdf` | Anlage 2, Version 1.2 vom 16. Februar 2026, 15 Seiten. Belegt die von Hetzner beschriebenen Maßnahmen. Für Cloud-Server bleibt die Verwaltung, Wartung und Sicherheit des virtuellen Servers beim Auftraggeber; auch Verschlüsselung gespeicherter Daten und Cloud-Backups wird nicht als bereits von uns umgesetzt bestätigt. |
| `dpa-tuev-audit-de.pdf` | TÜV Rheinland i-sec, Bericht Nr. 63017991-01, Version 1.0, 19. Februar 2026, 22 Seiten. Prüfumfang: Hetzner-Rechenzentren Helsinki/Tuusula, Nürnberg und Falkenstein; keine Abweichungen im geprüften Umfang festgestellt. Stichprobenprüfung der Hetzner-Maßnahmen, keine Prüfung unserer Anwendungen oder produktiven Servereinstellungen. |

Anlage 1 enthält alle fünf Standard-Datenarten sowie die vollständigen Zusatztexte
für Nutzungs-/Analysedaten, Warenkorb-/Sitzungsdaten und Authentifizierungsdaten.
Als Betroffene sind Kunden und Interessenten, Website-/Shopbesucher, registrierte
Shopnutzer, abweichende Lieferungsempfänger, Kontaktformular-/KI-Chat-Nutzer,
Administrationsbenutzer und Betroffene von betreuten Unternehmen aufgeführt.
Die im Screenshot abgeschnittenen Texte sind im PDF vollständig vorhanden.

Die personenbezogene Vertragsfassung und der als vertraulich gekennzeichnete
Auditbericht bleiben interne Nachweise; sie wurden nicht in das Website-Repository
kopiert oder als öffentliche Downloads eingebunden. Der Website-Entwurf beschreibt
weiterhin die EasyCode-Website. Die separaten Gatsby-/Strapi- und Shopware-Shops
benötigen jeweils Hinweise passend zu Betreiber, Funktionen und Dienstleistern.

## Zusätzliche Betreiberangaben und Diagnose

- Docker-Ausgabe vom Coolify-Host: alle aufgeführten Container, einschließlich Proxy, Umami und PostgreSQL, verwenden `json-file` mit `max-file=3` und `max-size=10m`. Das belegt größenabhängige Rotation der Docker-Ausgabe, keine Altersgrenze und keine Regel für getrennte Dateien oder den Mailserver.
- Umami wurde laut Betreiber am 3. Oktober 2026 eingerichtet. Die fehlgeschlagenen Cron-/systemctl-Befehle liefen im Anwendungscontainer (`/app`), nicht auf dem Host. Daraus folgt kein Nachweis über Host-Jobs oder eine Umami-Löschung.
- Der Betreiber bestätigt Sicherungen von Coolify, Datenbanken, Maildaten, Volumes und Images bei Hetzner in Falkenstein. Offen bleibt die Aufbewahrung/Löschung aller Sicherungskopien.
- Die Einrichtung einer automatischen Umami-Bereinigung ist autorisiert. Vor Umsetzung müssen installierte Version, Datenbankschema und die gewünschte zweckbezogene Aufbewahrung feststehen. Es gibt keine pauschal gesetzlich vorgeschriebene Umami-Frist. Die Frist darf erst nach erfolgreicher Einrichtung als bestehende Löschregel beschrieben werden.

## Noch zu klären

Der E-Mail-Anbieter und Versandweg sind geklärt. Offen bleiben beim Mailbetrieb
die Löschregeln für Logs, Warteschlangen und Backups; diese sind in das
Aufbewahrungskonzept einzubeziehen.

| Stelle im Entwurf | Wo du die Angabe findest | Was du feststellen musst |
| --- | --- | --- |
| Abschnitt 2: technische Protokolle | Coolify: zugehöriger Server und Proxy-Konfiguration; auf dem Server Docker-Logging-Konfiguration, gegebenenfalls `logrotate` und `journald`; Logs der Website und Datenbanken | Welche Zugriffs-/Fehlerprotokolle tatsächlich entstehen, ob IP-Adressen enthalten sind und wann sie gelöscht werden. Eine Größenbegrenzung durch Logrotation ist keine feste Frist in Tagen. Hetzner-Fristen für Managed Webhosting lassen sich nicht auf selbst verwaltete Cloud-Server übertragen. |
| Abschnitt 5: Umami-Aufbewahrung | Coolify → Umami/PostgreSQL-Service; konfigurierte geplante Jobs, Datenbank-Wartung und gegebenenfalls externe Cronjobs | Tatsächliches Lösch-/Aggregationsverfahren und Frist. Die Installationsanleitung `docs/umami-coolify.md` belegt keine eingerichtete automatische Datenlöschung. Falls kein Verfahren existiert, eine Frist festlegen und technisch umsetzen, bevor sie im Text zugesagt wird. |
| Abschnitt 7: OpenAI-Vertragsgesellschaft | Personalisierter DPA v.010126 vom 3. Oktober 2026 und DocuSign-Abschlusszertifikat, privat archiviert; Services Agreement Abschnitt 16.5 | Vertragsabschluss, Organisationszuordnung und Anschrift von OpenAI Ireland Ltd. dokumentiert. Keine EU-/ZDR-Freigabe aus dem DPA ableiten. |
| Abschnitt 7: IP-/Anfragezähler | `src/utilities/chatLimits.ts` und tatsächlich bereitgestellte Version | Minutenfenster, HMAC-Identifier und regelmäßige Bereinigung sind implementiert und getestet. Abgelaufene Einträge werden alle 15 Sekunden entfernt, bei normal laufendem Event Loop spätestens nach etwa 75 Sekunden; verzögerte Ausführung ist möglich. Separate Infrastruktur-Logs unabhängig prüfen. |
| Abschnitt 7: OpenAI-Verarbeitung, Speicherfristen und Drittlandgarantien | API-Projekt, anwendbarer DPA und [OpenAI-Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data) | Aktuell globaler Staging-Endpunkt, Abrechnung eingerichtet. Vertragsgarantien, Missbrauchsprotokolle, Caching, menschliche Einsicht und Ausnahmen dokumentieren. `store=false` ist keine ZDR-Zusage. EU-Verarbeitung nur nach gesonderter bestätigter Konfiguration behaupten. |
| Abschnitt 9: Backups | Hetzner Console → betreffender Server → Backups; zusätzlich Snapshots; Coolify → Datenbank-Backups und Speicherziele; eigene Cronjobs/Backup-Skripte und gegebenenfalls Storage Box oder S3-Anbieter | Laut Betreiber sind Backups eingerichtet und liegen bei Hetzner in Falkenstein. Der Umfang (Coolify, Datenbanken, Maildaten, Volumes und Images) ist bestätigt. Noch Sicherungsrhythmus, Aufbewahrung/Rotation und Löschung dokumentieren. Anbieter und Standort sind durch Betreiberangabe bestätigt. Snapshots und Datenbank-Backups können andere Aufbewahrungsregeln als Server-Backups haben. |

Die technischen Ergänzungen beruhen auf dem lokalen Projektstand. Vor Veröffentlichung
die tatsächlich bereitgestellte Version und die produktiven Einstellungen abgleichen.
Die übrigen Platzhalter bleiben im Entwurf sichtbar, bis die Angaben belegt sind.
Die neuen Vertragsunterlagen bestimmen keine konkreten Löschfristen für unsere
Proxy-/Anwendungslogs, Umami-Daten oder Backups. § 11 des AV-Vertrags regelt
Rückgabe/Löschung nach Auftragsende auf Verlangen und Ausnahmen für bestimmte
Nachweisdokumentationen; daraus folgt keine laufende Aufbewahrungsfrist der Website.

## Umgang mit dem überarbeiteten Entwurf

Der öffentliche Text beschränkt sich auf die tatsächlichen Verarbeitungsvorgänge.
Technische Diagnosen und Implementierungsaufträge stehen in diesen internen
Notizen. Es werden keine ungeprüften Standardfristen oder bereits aktiven
Löschverfahren behauptet. Nach Art. 13 Abs. 2 lit. a DSGVO sind die tatsächliche
Speicherdauer oder, wenn diese nicht angegeben werden kann, konkrete Kriterien
für ihre Festlegung zu beschreiben. Ein bloß unbekannter Konfigurationswert
rechtfertigt keine erfundene Frist und keine allgemeine Ersatzfloskel.

Die wenigen verbleibenden Textlücken betreffen zusätzliche personenbezogene
Logs/Mailprotokolle, Umami-Aufbewahrung, Backup-Löschung sowie den konkreten
Google-Vertragspartner und die anwendbaren Übermittlungsgarantien. Eine exakte
Tageszahl ist nicht für jeden Bereich erforderlich; eine zutreffende konkrete
Löschregel genügt, soweit sie die Verarbeitung verständlich beschreibt.

Die aktuelle Chat-IP-Speicherung ist im Entwurf ohne Platzhalter beschrieben.
Das beseitigt nicht den technischen Handlungsbedarf für eine zweckgerechte
Bereinigung. Die zuvor autorisierte automatische Umami-Löschung wurde noch
nicht eingerichtet. Google nennt für die Missbrauchsüberwachung 55 Tage;
diese Quellenangabe ersetzt weder die Prüfung des API-Projekts noch eine
vollständige rechtliche Bewertung des Chats.

Quellen: [Art. 13 DSGVO](https://amtliche-handbuecher.bundesfinanzministerium.de/ao/2024/Datenschutz-Grundverordnung/inhalt.html),
[Gemini-Bedingungen](https://ai.google.dev/gemini-api/terms),
[Google-Missbrauchsüberwachung](https://ai.google.dev/gemini-api/docs/usage-policies).
