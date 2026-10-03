# Prüfpunkte zum Datenschutzerklärungsentwurf

Der Entwurf beschreibt den vorbereiteten `staging`-Stand auf Hetzner mit Umami.
Er wurde nicht in Payload veröffentlicht. Solange die Hauptdomain auf der alten
Infrastruktur läuft, darf deren Erklärung nicht einfach durch diese Fassung
ersetzt werden. Marketing wurde lokal entfernt, diese Änderung ist noch nicht
committed oder deployed.

## Vor Veröffentlichung klären

- Geltungsbereich und tatsächlicher Deployment-Stand der betreffenden Domain.
- Hetzner-Vertragsgesellschaft, Serverstandort und tatsächlich abgeschlossener
  AVV; kein Vertragsabschluss wurde aus dem Code abgeleitet.
- Tatsächlich erfasste und gespeicherte Proxy-/Serverlogs und deren Löschung.
- Umami-Aufbewahrung: Self-hosted Umami löscht laut FAQ standardmäßig nicht
  automatisch nach 14 Monaten. Gewünschte Frist technisch implementieren und
  erst dann im Text behaupten. Auch die Aufbewahrung in Backups berücksichtigen.
- E-Mail-/SMTP-Anbieter und gegebenenfalls dessen AVV, Speicherorte und Garantien
  für Drittlandübermittlungen. Zugangsdaten müssen dafür nicht offengelegt werden.
- Gemini-Vertragsgesellschaft, aktives Billing, einschlägiger Datenschutzvertrag,
  Speicherfristen und konkrete Garantien für Verarbeitung außerhalb des EWR.
- Cookie-Einstellungen-Link im CMS-Footer als Custom URL `#cookie-settings`
  hinterlegen und testen. Der Code unterstützt ihn; seine Existenz in den
  Live-CMS-Daten ist nicht bestätigt.
- Laufzeit des Payload-Authentifizierungs-Cookies und verwendete Backups.

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
