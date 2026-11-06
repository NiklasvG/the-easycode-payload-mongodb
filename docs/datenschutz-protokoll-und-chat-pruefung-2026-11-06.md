# Easycode: Protokoll- und KI-Chat-Prüfung

Lesender Abgleich vom 6. November 2026. Keine Servereinstellung verändert,
keine Nutzer-/Nachrichteninhalte oder personenbezogenen Logzeilen gelesen,
keine OpenAI-Anfrage ausgelöst und keine CMS-Veröffentlichung vorgenommen.

**Späterer Abschluss am selben Tag:** Die nachstehend offenen Punkte wurden
mit dem [Datenschutzabschluss](datenschutz-abschluss-2026-11-06.md) bearbeitet.
Dieser Bericht bleibt als lesender Vorher-Befund erhalten.

## Tatsächlicher Betrieb

Coolify-Anwendung `rwzukgdnukwmpkgu0fyubgau`, Branch main, Staging-Domain,
Status `running:healthy`. Der laufende Container verwendet das Image
`cxcr.eu/the-easycode.eu/website:d33b0a037e6307af0dcbc9f2de27ec43bb33d87d`.
Die lokale Arbeitskopie enthält zusätzliche, noch nicht deployte Änderungen.

| Bereich | Bestätigter Befund |
| --- | --- |
| Website-Container | Docker json-file, drei Dateien à 10 MB, keine feste Tagesfrist |
| Gemeinsamer Traefik-Proxy | dieselbe Rotation; kein accesslog-Schalter in tatsächlichem Startbefehl oder Compose-Datei, kein Accesslog-Verweis in dynamischer Konfiguration |
| Proxy-Tracing / externe Logsenke | keine entsprechenden Startoptionen, Umgebungsvariablen oder dynamischen Verweise gefunden |
| Easycode-MongoDB | `/cui3iuxrxvwqytlyw9htzsek`, Docker json-file mit drei Dateien à 10 MB, stdout statt separater Logdatei |
| MongoDB-Profiling | für die tatsächlich aus der Anwendungs-URI ermittelte Datenbank Level 0; kein zusätzlicher Profiling-Filter, kein Auditlog konfiguriert |
| MongoDB-Diagnosekennzahlen (FTDC) | aktiviert, Verzeichnis auf 250 MB begrenzt; keine feste Tagesfrist |
| Externe Anwendungs-Fehlerdienste | keine Sentry-/Datadog-/NewRelic-/OTEL-Variablen im laufenden Anwendungscontainer; in geprüftem Quelltext keine entsprechende Integration gefunden |
| Chat-Einwilligung | Marker für versionierte Einwilligung, Session Storage, Widerruf und Server-Nachweise im ausgelieferten Programm gefunden |
| Chat-Region | global, APP_ENV=staging, AI_CHAT_ENABLED=true, OPENAI_EU_APPROVED=false |

Die Datenbankdiagnose wurde zunächst mit Anwendungsrechten versucht; die
Berechtigung reichte für den Profilingstatus nicht. Der anschließende lesende
Einstellungsabruf mit dem bestehenden Datenbank-Administrationszugang bestätigte
die obigen Werte. Es wurden weder Rechte erweitert noch neue Zugänge angelegt.

Profiling-Level 0 bedeutet nicht, dass normale MongoDB-Diagnoselogs niemals
Angaben zu langsamen Operationen enthalten. Der konfigurierte Schwellwert ist
100 ms. Diese Betriebslogs unterliegen der genannten Docker-Rotation.
FTDC ist von den normalen stdout-Protokollen getrennt und wurde anhand der
wirksamen Einstellungen geprüft; dessen Binärinhalte wurden nicht gelesen.

Keine zusätzliche zeitliche Journal-Aufbewahrung ist auf dem Website-Host
explizit konfiguriert. Daraus wird keine feste Tagesfrist für Host- oder
Administrationsereignisse abgeleitet. Solche Ereignisse sind nicht automatisch
zusätzliche Protokolle sämtlicher Websitebesucher. Die Prüfung betrifft
Website, Proxy und zugeordnete Datenbank; sie ist kein Zugriff auf fremde
Projekte oder Nachweis über sämtliche internen Provider-Systeme.

## Mailbackup-Empfehlung, noch nicht eingerichtet

Für diesen Mailserver wird täglich eine Sicherung empfohlen, mit zwei
vollständigen erfolgreichen Ständen lokal und vierzehn täglichen Ständen
an einem getrennten Sicherungsziel. Vierzehn erfolgreiche Tagesstände entsprechen
bei störungsfreiem täglichen Lauf ungefähr zwei Wochen, nicht einer garantierten
maximalen Aufbewahrung in Tagen. Bei Fehlern soll der letzte brauchbare Stand
nicht blind gelöscht werden; Fehleralarm und Sonderfallbehandlung gehören zum Plan.

Die Empfehlung ist eine Betriebsentscheidung für dieses Projekt und keine
gesetzlich vorgeschriebene Einheitsfrist. Eine jährliche Sicherung allein ließe
bis zu ein Jahr neuer Mails ohne aktuellen Rückweg. Mit etwa 21,06 GiB je
Vollstand passen vierzehn Vollstände nicht auf das vorhandene 80-GiB-Volume.
Für längere Historie sind externe Kapazität oder ein geeignetes inkrementelles
Verfahren erforderlich. Die gewählte Rotation muss anschließend zutreffend in
Abschnitt 9 beschrieben werden; bislang bleibt nur der Novemberstand erhalten.

## Verbleibende KI-Chat-Arbeiten

Bereits belegt sind der abgeschlossene personalisierte OpenAI-DPA, ein technisch
erfolgreicher globaler Provider-Test, store=false und die im Betrieb gefundenen
Einwilligungsfunktionen. Der globale Betrieb ist ausdrücklich gewünscht; eine
EU-/ZDR-Zusage wird nicht vorausgesetzt oder behauptet.

Noch abzuschließen sind:

1. Den vorhandenen DPA und die für den gewählten globalen Dienst anwendbaren
   Unterauftragnehmer/Verarbeitungsländer/Transfermechanismen zusammenführen
   und die eigene Bewertung der Drittlandübermittlung dokumentieren. Kein
   pauschaler Schluss, ein weiterer Vertrag müsse zwingend neu abgeschlossen werden.
2. Einwilligungsnachweise verlässlich und zweckbezogen aufbewahren. Aktuell
   liegen Version, Zeitpunkt und zufällige ID nur in den größenrotierten
   Anwendungslogs. Eine garantierte Nachweisdauer fehlt. Eine geeignete
   Lösung hält minimale Nachweise getrennt von Betriebslogs und archiviert den
   tatsächlich gezeigten Einwilligungstext je Version. Frist und Löschregel
   sind begründet festzulegen; weder pauschal 30 Tage noch unbegrenzte Speicherung
   werden allein aus Art. 7 DSGVO abgeleitet.
3. Nach dem endgültigen Deployment Einwilligung, Ablehnung, Widerruf und das
   Ausbleiben von OpenAI-Übertragungen vor Zustimmung mit synthetischen Daten
   prüfen und die passende Datenschutzerklärung tatsächlich in Payload veröffentlichen.

Der Blick in den ausgelieferten Code ersetzt keinen vollständigen aktuellen
Browser-Netzwerktest. Vorhandene frühere Tests bleiben als datierte Nachweise
bestehen. Kein neuer API-Schlüssel oder erneuter DPA-Upload wird allein aufgrund
dieser Prüfung vom Betreiber verlangt.

Quellen: [OpenAI-Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data),
[EDSA-Leitlinien Einwilligung, Abschnitt 5.1](https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_202005_consent_en.pdf),
[BACS Datensicherung](https://www.bacs.admin.ch/de/datensicherung).
