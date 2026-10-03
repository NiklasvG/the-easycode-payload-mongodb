# Belege und offene Angaben zur Datenschutzerklärung

Stand: 3. Oktober 2026.

## Aktualisierung: geplanter Wechsel auf OpenAI

Die bisherigen Gemini-Angaben unten sind historische Prüfergebnisse zum vorherigen
Code und kein Nachweis für den neuen Betrieb. Abschnitt 7 des Website-Entwurfs
wurde auf den noch deaktivierten OpenAI-Betrieb umgestellt. Neue Prüfpunkte,
Account-Bestätigungen, Datenfluss, VVT- und Interessenabwägungsentwurf stehen in
[ai-chat-openai.md](ai-chat-openai.md).

Sales-Freigabe für EU/ZDR oder MAM, DPA, Retention-Zusatz, endgültiges API-Projekt,
Abrechnung und Proxy-IP-Konfiguration stehen aus. Sharing und API-Logging sind
nach Betreiberbestätigung deaktiviert; MFA/Passkey und alleiniger Owner-Zugriff
sind bestätigt. Keine rechtliche Freigabe oder erfolgtes Deployment behaupten.

Die alte Beschreibung einer nicht bereinigten Chat-IP-Map gilt für den neuen
Chat nicht: Er verwendet pseudonymisierte IP-Zähler mit Ablauf und regelmäßigem
Sweep. Separate Protokolle und deren Löschregeln bleiben zu klären.

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
| Abschnitt 7: Google-Vertragsgesellschaft | Google AI Studio: zum verwendeten API-Key gehörendes Projekt ermitteln; Google Cloud Console: zugehöriges Abrechnungskonto, Vertrags-/Rechnungsunterlagen; [Gemini-Bedingungen](https://ai.google.dev/gemini-api/terms) | Die für genau dieses Projekt geltende Gesellschaft und Anschrift bestätigen. Der Code verwendet die Gemini API über `GEMINI_API_KEY`; daraus folgt keine Vertragsgesellschaft. |
| Abschnitt 7: Löschfrist der IP-/Anfragezähler | `src/app/api/ai-chat/route.ts` und tatsächlich bereitgestellte Version | Aktuell: fünf Anfragen je Minutenfenster, aber kein automatisches Entfernen abgelaufener Map-Einträge. Ohne weitere Anfrage bleibt der Eintrag bis zum Ende des Anwendungsprozesses erhalten. Eine Minute ist deshalb keine Löschfrist. Eine Bereinigung implementieren und testen, dann die wirksame Frist eintragen. |
| Abschnitt 7: Google-Datenverarbeitung, Speicherfristen und Drittlandgarantien | Für das API-Projekt geltende [Gemini-Bedingungen](https://ai.google.dev/gemini-api/terms), verlinktes Data Processing Addendum und Missbrauchsüberwachungs-Dokumentation; Billing-Status des Projekts | Aktives Billing, anwendbare Datenverarbeitungsvereinbarung, Übermittlungsgarantien und konkrete Speicherfristen prüfen. Die aktuellen Bedingungen verlangen Paid Services für API-Anwendungen, die Nutzern im EWR bereitgestellt werden; die API gilt bei einem Projekt mit aktivem Abrechnungskonto als Paid Service. Bedingungen zur Datennutzung enthalten zusätzlich eine EWR-Sonderregel. Nicht pauschal aus „kostenlos“ auf Training schließen und keine Frist aus Regeln für andere Funktionen wie Search Grounding übernehmen. |
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
