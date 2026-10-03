# Prüfpunkte zum Datenschutzerklärungsentwurf

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
 Belege und Fundstellen für die verbleibenden Angaben
stehen in [datenschutz-offene-angaben.md](datenschutz-offene-angaben.md).

Der Entwurf beschreibt den vorbereiteten `staging`-Stand auf Hetzner mit Umami.
Er wurde nicht in Payload veröffentlicht. Solange die Hauptdomain auf der alten
Infrastruktur läuft, darf deren Erklärung nicht einfach durch diese Fassung
ersetzt werden. Marketing wurde lokal entfernt, diese Änderung ist noch nicht
committed oder deployed.

## Durch Unterlagen bestätigt

- Zusätzlich durch Betreiberangabe bestätigt: selbst betriebener Mailserver
  `mail.ec-host.de` bei Hetzner in Falkenstein; die Website verwendet ihn als
  `SMTP_HOST` mit Absender `no-reply@the-easycode.eu`. Das Kontaktpostfach
  `info@the-easycode.eu` liegt ebenfalls dort; eingesetzte Software ist mailcow.
- Laut Betreiber bestehen für das Kontaktpostfach keine zusätzlichen
  Weiterleitungen. Die Routing-Übersicht zeigt keine senderabhängigen Transporte;
  die Domain verwendet „Keine Auswahl / Erben“. Der Betreiber bestätigt zusätzlich,
  dass kein globales SMTP-Relay eingerichtet ist.
- Die Quarantäne ist laut Screenshot deaktiviert und enthält keine Einträge.
  Die mailcow-Logansicht nennt `LOG_LINES=10000` je Anwendung und zusätzliches
  Logging in den Docker-Daemon. Die Eintragsgrenze ist keine Frist in Tagen.
- Laut Betreiber sind Backups eingerichtet und liegen bei Hetzner in Falkenstein.
  Gesichert werden Coolify, Datenbanken, Maildaten, Volumes und Images.
  Aufbewahrung und Löschregeln sind noch offen.
- Die Coolify-Docker-Ausgabe bestätigt `json-file` mit drei Dateien à 10 MB
  je aufgeführtem Container. Das belegt Größenrotation, keine Tagesfrist.
- Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland,
  ist Vertragspartner im personalisierten AV-Vertrag vom 3. Oktober 2026
  (`dpa-2026-10-03.pdf`, Version 1.2 vom 16. Februar 2026).
- Der AV-Vertrag enthält in Anlage 1 alle fünf ausgewählten Standard-Datenarten
  sowie die vollständigen Zusatztexte zu Nutzungs-/Analysedaten, Warenkorb,
  Sitzungen, Authentifizierung und den betroffenen Personengruppen.
- Für gewählte EU-Serverstandorte sichert Anlage 3 die Verarbeitung der Serverdaten
  innerhalb der EU zu; Support erfolgt ebenfalls innerhalb der EU. Diese Zusage
  betrifft Hetzner und bestätigt keine EU-only-Verarbeitung durch Google.
- Der Screenshot zeigt Falkenstein für alle aufgeführten Server. Der Betreiber
  bestätigt, dass Website, MongoDB und Umami auf dem Coolify-Server in Falkenstein
  laufen. Backup-Umfang und Aufbewahrung sind separat zu prüfen.
- Der Betreiber bestätigt, dass `#cookie-settings` im Payload-Footer hinterlegt
  und auf jeder Seite sichtbar ist.
- Die TOMs und der TÜV-Bericht belegen Maßnahmen von Hetzner. Der Auditbericht
  vom 19. Februar 2026 nennt keine festgestellten Abweichungen im geprüften Umfang.
  Er bestätigt keine Prüfung unserer Anwendungen oder Serverkonfiguration.
- Das Admin-Authentifizierungs-Cookie hat nach der lokalen Payload-Konfiguration
  zwei Stunden Gültigkeit ab Ausstellung bzw. Erneuerung; produktiv abgleichen.

## Vor Veröffentlichung klären

- Geltungsbereich und tatsächlicher Deployment-Stand der betreffenden Domain.
- Zusätzliche Proxy-/Serverlogs außerhalb der bestätigten Docker-Rotation und
  die Löschregeln auf dem separaten Mailserver prüfen.
- Umami-Aufbewahrung: Self-hosted Umami löscht laut FAQ standardmäßig nicht
  automatisch nach 14 Monaten. Gewünschte Frist technisch implementieren und
  erst dann im Text behaupten. Auch die Aufbewahrung in Backups berücksichtigen.
- Mailserver-Logs, Warteschlangen und Backups beim Löschkonzept berücksichtigen.
- Gemini-Vertragsgesellschaft, aktives Billing, einschlägiger Datenschutzvertrag,
  Speicherfristen und konkrete Garantien für Verarbeitung außerhalb des EWR.
- Funktion des bestätigten Cookie-Einstellungen-Links testen: Banner erneut
  öffnen, Auswahl ändern und Analyse widerrufen.
- Cookie-Laufzeit von zwei Stunden am Deployment bestätigen; verwendete
  Backups, Speicherorte, Aufbewahrung und Löschung dokumentieren.
- Eigene Schutzmaßnahmen für Cloud-Server prüfen und dokumentieren:
  Updates, Zugriffsrechte, Daten-/Backup-Verschlüsselung und Wiederherstellung.
  Die Hetzner-TOMs belegen deren Umsetzung auf unseren Systemen nicht.

## Geltungsbereich der Website und der Shops

Der Hosting-AVV erfasst in Anlage 1 auch Shopdaten und die betroffenen Personen
von Unternehmen, für die Hosting oder technischer Betrieb übernommen wird.
Der Website-Entwurf beschreibt weiterhin die EasyCode-Website mit Payload,
Umami und KI-Chat. Die getrennten Gatsby-/Strapi- und Shopware-Shops benötigen
Datenschutzhinweise für ihre jeweiligen Verarbeitungsvorgänge, Anbieter und
verantwortlichen Betreiber. Aus ihrer gemeinsamen Infrastruktur folgt keine
Verarbeitung von Shopbestellungen auf der EasyCode-Website.

## Gemini: bisheriger Text muss korrigiert werden

Für EWR-API-Clients verlangen Googles Bedingungen Paid Services, bei der API also
ein Projekt mit aktivem Billing. Die EWR-Sonderregel zur Datennutzung widerspricht
zudem einer pauschalen „Free Tier = Training“-Aussage. Projektkonfiguration und
Verträge prüfen; eine Textänderung löst kein Konfigurationsproblem.

Der Chat-Hinweis „Verstanden“ ist im bestehenden Code keine gesonderte,
informierte Datenschutz-Einwilligung. Der Entwurf bezeichnet ihn entsprechend
als Hinweisbestätigung. Die angesetzte Interessenabwägung für den konkreten
Chatbetrieb muss dokumentiert und rechtlich geprüft werden.

## Technisch festgestellte Details

- Umami lädt nur nach Analyse-Zustimmung; kein Marketing-Pixel gefunden.
- Analyse-Query-Strings und Fragmente ausgeschlossen; Do Not Track aktiviert.
- Kein unabhängiger minimaler Seitenzähler ohne Zustimmung implementiert.
- Google Analytics und Sentry sind im aktuellen Projekt nicht eingebunden.
- Schriftarten werden durch `next/font/google` beim Build eingebunden.
- Chatverläufe sind React-State; keine vorgesehene CMS-Speicherung.
- Der Chat begrenzt Anfragen über eine IP-basierte In-Memory-Map. Das Zeitfenster
  beträgt eine Minute, aber alte Map-Einträge werden nicht durch einen Timer
  gelöscht. Daher keine Löschung „nach einer Minute“ versprechen. Unveränderte
  Einträge können bis zum Neustart des Anwendungsprozesses bestehen bleiben.
- Consent- und Theme-Auswahl sowie Chat-Hinweisbestätigung liegen im Local Storage.
  Der geöffnete Chat wird im Session Storage vermerkt. Consent hat keinen
  automatischen Ablaufzeitpunkt.

## Quellen

- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu)
- [Hetzner-Impressum](https://www.hetzner.com/legal/legal-notice/)
- [Umami-FAQ: Speicherdauer](https://docs.umami.is/docs/faq)
- [Umami: erfasste Daten](https://docs.umami.is/docs/metric-definitions)
- [Gemini-API-Bedingungen](https://ai.google.dev/gemini-api/terms)
- [Sächsische Aufsicht: Beschwerden](https://www.datenschutz.sachsen.de/beschwerde-einreichen.html)

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
