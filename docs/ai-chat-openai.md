# OpenAI-Chat: Betrieb und Datenschutzvorbereitung

Stand: 4. Oktober 2026. Globaler Staging-Betrieb laut Betreiber getestet; keine rechtliche Freigabe für den Produktivbetrieb.

## Status

Der Chat wurde von Gemini auf GPT-6 Luna über die OpenAI Responses API umgestellt.
Der Betreiber bestätigt erfolgreiche Antworten auf `staging.the-easycode.eu`
mit `OPENAI_CHAT_REGION=global`. Der produktive Betrieb ist nicht bestätigt.
Es erfolgt kein automatischer Rückfall auf Gemini oder einen globalen OpenAI-Endpunkt.
Der explizite globale Staging-Modus ist unten beschrieben.
Ohne explizite Aktivierung, passende Region-Konfiguration, API-Key und Proxy-IP-Header
antwortet die Route mit 503, ohne CMS-Inhalte abzurufen oder OpenAI aufzurufen.

Betreiberbestätigungen aus diesem Chat:

- Organisation: The-Easycode; API-Konto und API-Key eingerichtet, 10 USD Guthaben aufgeladen.
- Globaler Staging-Chat deployed und Antworten vom Betreiber erfolgreich getestet.
- Personalisierter DPA v.010126 vom 3. Oktober 2026 samt DocuSign-Abschlusszertifikat
  geprüft: Status „Abgeschlossen“, Kundenname und Organisations-ID passen;
  beide Unterschriften sind auf der Vertragsseite sichtbar. Für den Kunden im EWR
  nennt der Vertrag OpenAI Ireland Ltd. Keine eigenständige kryptografische
  Signaturvalidierung durchgeführt. Originale privat aufbewahren.
- Staging-Funktionstests durch Betreiber bestätigt: Antworten, Folgefragen,
  Projekt-/Kontaktlinks, Verlauf löschen, Anfragebegrenzung und Abbruch beim Schließen.
- Kostenkontrolle laut Betreiber: 10 USD Enforced/Hard Limit und automatische
  Aufladung mit maximal 10 USD. Den jeweiligen Limitzeitraum intern dokumentieren.
- Proxy: Traefik, Cloudflare DNS only, kein Host-Port-Mapping der Anwendung;
  `x-real-ip` in den dokumentierten normalen und manipulierten Testanfragen geprüft.
- Sales-Anfrage zu EU-Verarbeitung/ZDR beziehungsweise MAM versendet; Antwort ausstehend.
- Sharing: Feedback, Evaluation/Fine-Tuning und Eingaben/Ausgaben deaktiviert.
- API call logging deaktiviert; Nutzungsübersicht eingeschränkt, Logs nur für Owner sichtbar.
- Nur der Betreiber ist Owner, keine offenen Einladungen.
- MFA, SMS und Passkey sind nach Betreiberangabe eingerichtet.

Die Account-Einstellungen allein belegen weder EU-Freigabe noch ZDR/MAM.
Der DPA-Abschluss ist separat durch die vorgelegten Unterlagen dokumentiert.
Vertragsunterlagen und Account-Screenshots außerhalb des
öffentlichen Repositorys aufbewahren.

## Technischer Datenfluss

1. Beim Öffnen prüft der Browser mit einer nicht gecachten GET-Anfrage ohne Cookies,
   ob der Chat konfiguriert und aktiviert ist. Ist er deaktiviert, erscheint nur ein
   Verfügbarkeitshinweis mit Kontaktmöglichkeit. Erst danach lädt der Browser den Chat.
   Die freiwillige Einwilligung ist versioniert (`openai-consent-v1`) und wird
   mit Zeitpunkt und zufälliger UUID nur im Session Storage des Tabs unter
   `easycode-ai-chat-consent` gehalten. Alte Hinweisbestätigungen gelten nicht.
2. Erst nach aktiver Einwilligung sendet der Browser Nachricht und maximal zwölf jüngste
   Kontextnachrichten (zusammen höchstens 6.000 Zeichen) an `/api/ai-chat`.
3. Der Server prüft Origin, JSON-Format, Honeypot, aktuelle Einwilligungsversion,
   aktive Bestätigung, UUID-Format, Alter (höchstens 24 Stunden) und Größenlimits.
   Vor CMS-/Providerzugriff protokolliert er ausschließlich die bereinigte
   Einwilligungsbestätigung (Version, Zeitpunkt, ID, accepted=true). Zusätzliche
   Client-Felder werden nicht übernommen. Chat-Inhalte und IP sind nicht Teil
   dieses Eintrags; die Bestätigung wird nicht an OpenAI weitergegeben.
   Die Erklärung ist eine Client-Angabe, kein Identitätsnachweis, kryptografisch
   signierter Klickbeleg oder Bot-Schutz. Nachweise liegen in den rotierenden
   Anwendungslogs (drei Dateien à 10 MB); keine feste Nachweisdauer garantiert.
   Für öffentliche Aktivierung Nachweiskonzept und angemessene Aufbewahrung
   abschließend bewerten, ohne unbegrenzt Besucherkennungen zu archivieren.
4. Payload liefert maximal zwölf jüngste veröffentlichte Projekte unter anonymen
   Zugriffsrechten. Es werden nur Titel, Kurzbeschreibung, bis zu acht Technologien
   und öffentliche Projekt-URLs übertragen, insgesamt höchstens 6.000 Zeichen.
   Nicht enthalten: interne Kundenfelder, E-Mail-Adressen aus Beziehungen, Uploads,
   Kontaktanfragen, CMS-Authentifizierung, Besucher-IP oder Browser-Header.
5. Native serverseitige HTTPS-Anfrage auf Staging aktuell an
   `https://api.openai.com/v1/responses`. Bei explizit freigegebener EU-Konfiguration
   stattdessen `https://eu.api.openai.com/v1/responses`:
   `model=gpt-6-luna`, `store=false`, `stream=true`, `reasoning.effort=none`,
   `text.verbosity=low`, `max_output_tokens=800`. Kein SDK, keine Tools, Files,
   Conversations, Background-Anfragen oder providerseitigen Response-IDs im Verlauf.
6. Nur Text-/Refusal-Deltas sowie Abschluss-/Fehlersignale gelangen zum Browser.
   Provider-Metadaten und rohe Fehlermeldungen werden nicht weitergegeben oder geloggt.
7. Der Browser speichert Gesprächsinhalte nur im React-Arbeitsspeicher, maximal
   Begrüßung plus 40 jüngste Nachrichten. Verlauf löschen entfernt diesen Inhalt.
   Ein Neuladen verwirft ihn ebenfalls. Schließen stoppt die laufende Anfrage,
   behält den Verlauf aber für ein späteres Öffnen im selben Dokument.
   Einwilligung widerrufen löscht Verlauf, Eingabe und Session-Bestätigung,
   bricht laufende Anfragen ab und verhindert neue bis zur erneuten Einwilligung.
   Ein Timer beendet die Einwilligung nach 24 Stunden; zusätzlich prüfen Client
   und Server das Alter beim Senden. Hintergrund-Timer können verzögert laufen.
   Ablauf wird beim nächsten Laden erkannt. Browser-Tabs können Session Storage
   bei Duplizierung oder Wiederherstellung übernehmen; die 24-Stunden-Prüfung bleibt.

`store=false` verhindert nicht sämtliche OpenAI-Verarbeitung oder Speicherwege.
Abuse Monitoring und Prompt-Caching sind gesondert anhand der freigegebenen
Account-Konfiguration zu dokumentieren. Auch veröffentlichte Projektdaten können
personenbezogen sein; ihre zulässige Verwendung als LLM-Kontext prüfen.

## Schutzmaßnahmen und Grenzen

### Anbieterregeln für den aktuellen Standardbetrieb

Am 3. Oktober 2026 anhand der offiziellen Quellen abgeglichen:

- OpenAI Ireland Ltd.: 1st Floor, The Liffey Trust Centre, 117–126 Sheriff Street
  Upper, Dublin 1, D01 YC43, Irland; Services Agreement, Abschnitt 16.5.
- Keine ZDR-/MAM-Freigabe dokumentiert. Standard-Missbrauchsprotokolle bis zu
  30 Tage, mit gesetzlich erforderlichen oder zum Schutz vor Schäden angemessen
  notwendigen Verlängerungen. Die Dashboard-Logging-Einstellung hebt das nicht auf.
- Prompt-Caching kann verschlüsselte GPU-Zwischenzustände bis zu 24 Stunden
  behalten. Für GPT-5.6 und neuere Modelle steuert die Cache-TTL eine Mindestdauer,
  nicht diese maximale Aufbewahrung. Keine eigene Cache-TTL wird gesetzt.
- `store=false` betrifft den abrufbaren Response-Zustand. Keine Behauptung einer
  vollständig speicherfreien Verarbeitung oder ausgeschlossener menschlicher Einsicht.
- Der DPA enthält in Abschnitt 4.1 die Transfermechanismen für EWR-Daten.
  Konkrete Unterauftragnehmer, Zielländer und die erforderliche eigene Bewertung
  sind für den tatsächlichen globalen Betrieb gesondert zu dokumentieren.

Quellen: [Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data),
[Prompt-Caching](https://developers.openai.com/api/docs/guides/prompt-caching),
[Services Agreement](https://openai.com/policies/services-agreement/).

### Anwendungsgrenzen

- Eingabe höchstens 1.000 Zeichen; Request maximal 16 KiB, auch ohne Content-Length.
- Pro IP fünf Anfragen pro Minute, insgesamt 30 pro Minute und 300 pro
  24-Stunden-Budgetfenster; höchstens vier parallele Anfragen pro Anwendungsprozess.
  Die festen Fenster beginnen mit der ersten Anfrage nach ihrem Ablauf; unmittelbar
  an einer Fenstergrenze sind entsprechend mehr Anfragen innerhalb kurzer Zeit möglich.
  Auch abgewiesene Inhaltsvalidierungen nach Aufnahme in das Budget zählen.
- IP nur aus `PUBLIC_TRUSTED_CLIENT_IP_HEADER`, nie beliebiges X-Forwarded-For.
  Fehlt ein gültiger Wert, wird die Anfrage abgewiesen.
- IP-Identifier werden mit HMAC-SHA256 und einem zufälligen Prozessschlüssel gebildet.
  Keine Roh-IP in dieser Map. Pseudonymisierung ist keine Anonymisierung.
- IP-Zähler verfallen nach 60 Sekunden; Sweep alle 15 Sekunden entfernt sie auch
  ohne Folgeanfrage. Bei normal laufendem Event Loop spätestens nach rund 75 Sekunden;
  unter Last kann der Timer später laufen. Prozessende verwirft Map und Schlüssel.
- 45 Sekunden serverseitiges Zeitbudget einschließlich Body-Lesen und CMS-Wartezeit;
  Abort/Verbindungsabbruch beendet die lokale Verbindung zu OpenAI. Dies garantiert
  keinen sofortigen Abbruch dortiger Berechnung oder Abrechnung. Keine automatischen API-Retries.
- Ausgabe zusätzlich maximal 6.000 Zeichen. Fehlender Abschluss, Incomplete, Fehler
  oder Timeout wird als unterbrochene Antwort markiert, nicht als erfolgreiche Antwort.
- Fehlgeschlagene/abgebrochene Gesprächspaare werden nicht erneut als Kontext gesendet.
- Der Browser bietet Abbruch beim Schließen, Verlauf löschen, Retry-After-Warteanzeige und sichere
  Markdown-Darstellung ohne Modellbilder oder beliebige externe Links.
- Origin und Honeypot sind kein Schutz gegen direkte HTTP-Clients. Prompt-Regeln sind
  keine beweisbare Injection-Abwehr; die fehlenden Tools und privaten Daten begrenzen
  mögliche Folgen. Keine zuverlässige Erkennung aller sensiblen Freitexte behaupten.
- Prozessbudgets werden bei Neustart zurückgesetzt und bei mehreren Replikas vervielfacht.
  Kein finanzieller Hard Cap: unabhängige OpenAI-Spend-Limits und gemeinsame Proxy-/Edge-
  Limits konfigurieren. Keine DDoS-Abwehr allein durch Anwendungscode.
- Server-/Proxy-/APM-Konfiguration darf keine Request-/Response-Bodies mitschreiben.
  Diese externen Einstellungen werden durch lokale Codeprüfung nicht bestätigt.

## Aktivierung nach Freigabe

### Globaler Staging-Test ohne EU-Freigabe

Auf Betreiberwunsch kann der reguläre Website-Chat auf Staging über den globalen
OpenAI-Endpunkt getestet werden. Nur zur Laufzeit setzen:

```dotenv
APP_ENV=staging
OPENAI_CHAT_REGION=global
AI_CHAT_ENABLED=true
OPENAI_EU_APPROVED=false
OPENAI_API_KEY=YOUR_PROJECT_KEY
PUBLIC_TRUSTED_CLIENT_IP_HEADER=x-real-ip
```

`NEXT_PUBLIC_SERVER_URL` muss weiterhin die Stage-URL sein (Build und Runtime).
Dieser Modus verwendet `https://api.openai.com/v1/responses` und benötigt keine
EU-Freigabe. Er überträgt den normalen Systemprompt, öffentlichen Projektkontext
und eingegebenen Gesprächsverlauf; alle Größen-, Rate- und Speicherbegrenzungen
gelten weiter. Die globale Verarbeitung ist keine EU-Verarbeitungszusage.
Staging ist über eine Domain ebenfalls öffentlich erreichbar, solange kein
Zugangsschutz vorgeschaltet ist. Für Tests keine vertraulichen Inhalte eingeben.
In Produktion wird `global` abgewiesen. Nach der EU-Freigabe ausdrücklich
`OPENAI_CHAT_REGION=eu` und `OPENAI_EU_APPROVED=true` setzen. Es gibt keinen Fallback.

### Abgeschlossene Proxy-Prüfung

Am 3. Oktober 2026 wurden nach Betreiberangabe auf Staging eine normale Anfrage
und eine Anfrage mit gefälschten IP-Headern vom Server-Terminal aus geprüft.
Beide lieferten eine gültige IP über `x-real-ip`; die Testadresse wurde nicht
übernommen. Docker veröffentlichte den Anwendungsport 3000 nicht am Host.
Dies bestätigt die getesteten Fälle, keine beliebige Proxy-Konfiguration.
Die temporäre Diagnoseroute und ihre Variablen wurden anschließend aus dem Code
entfernt. Nach Änderungen am Proxy oder Zugriffsweg erneut prüfen.

### Freigabe und Live-Test

1. Sales-Antwort, wirksam einbezogenes DPA, Vertragspartner, Unterauftragnehmer,
   Übermittlungsgarantien und Retention-Zusatz intern sichern und prüfen.
2. Für GPT-6 Luna/Responses freigegebenes EU-Projekt und API-Key anlegen. Sharing
   und Logging erneut für das endgültige Projekt prüfen. ZDR/MAM und Caching sowie
   Ausnahmen aus dem tatsächlich vereinbarten Vertrag übernehmen.
3. Abrechnung einrichten, niedriges Kostenbudget mit Alarmen und nach Möglichkeit
   Hard Spend Limit konfigurieren. Warnschwellen sind keine automatischen Stopps.
4. Proxy muss den gewählten einzelnen IP-Header verbindlich überschreiben und direkte
   Zugriffe auf den Anwendungsport verhindern. Mit gefälschten Headers testen, dass
   der Wert am Backend immer vom Proxy stammt. Nicht blind `x-real-ip` eintragen.
5. In Coolify nur zur Laufzeit setzen:

   ```dotenv
   OPENAI_API_KEY=YOUR_PROJECT_KEY
   PUBLIC_TRUSTED_CLIENT_IP_HEADER=YOUR_VERIFIED_SINGLE_IP_HEADER
   OPENAI_EU_APPROVED=true
   AI_CHAT_ENABLED=true
   ```

   In `.env.example` bleiben beide Schalter false. Keine NEXT_PUBLIC-API-Schlüssel,
   keine Build-Schlüssel. Vor Freigabe beide Schalter false lassen.
6. Auf Staging ausschließlich synthetische Fragen testen: Erfolg, Folgefrage,
   fachfremde Frage, fehlende Fakten, Injection-Versuch, Abbruch beim Schließen, Löschen, 429,
   Anbieterfehler und Ausfall. Kosten, Faktentreue und Latenz messen. Keine Aussage
   über Modellqualität aus Mocktests ableiten. Freigabekriterien: keine erfundenen
   Preise/Verfügbarkeiten; Links korrekt; Datenschutzgrenzen verständlich.
7. Tatsächliche Speicherwege inklusive Logs, Caches und Backups prüfen.
   Datenschutzerklärung, Einwilligung und Nachweiskonzept vor öffentlicher Aktivierung
   fertigstellen. EU-Zusagen nur im belegten Umfang verwenden.

## Verzeichnis der Verarbeitungstätigkeiten: Entwurf

- Verantwortlicher: Niklas von Grzymala – The-EasyCode, Kontakt wie Datenschutzerklärung.
- Zweck: freiwillige Auskunft zu Leistungen, beruflichen Referenzen und Kontaktwegen.
- Betroffene: Websitebesucher; gegebenenfalls Personen in öffentlichen Portfolio-Inhalten.
- Daten: Nachricht, begrenzter Verlauf, generierte Antwort, Projektkontext;
  separat pseudonymisierte IP-Zähler und technische Verbindungsdaten.
- Empfänger: eigene Hetzner-Infrastruktur; OpenAI-Vertragsgesellschaft und deren
  vertraglich festgelegte Unterauftragnehmer nach Bestätigung.
- Rechtsgrundlage für Nutzer-Chat-Inhalte: aktive Einwilligung, Art. 6 Abs. 1 lit. a
  DSGVO, Betreiberentscheidung vom 4. Oktober 2026. Technische Bereitstellung und
  Missbrauchsschutz getrennt nach Art. 6 Abs. 1 lit. f; erforderlicher Nachweis
  nach Art. 6 Abs. 1 lit. c in Verbindung mit Art. 7 Abs. 1. Öffentliche
  Portfolio-Personendaten und unbeabsichtigte Fremd-/Art.-9-Daten separat bewerten.
- Drittlandverarbeitung und Löschregeln: personalisierter DPA liegt vor;
  aktueller Test verwendet den globalen Endpunkt. Anbieter-Speicherwege wie oben,
  eigene IP-Zähler und Browserverlauf wie oben, Infrastruktur-Logs wie Hosting-Konzept.
  Konkrete Empfänger-/Länderbewertung und Übermittlungsgarantien bleiben offen.
- Maßnahmen: Zugangsschutz, Schlüssel nur serverseitig, Verschlüsselung bei Übertragung,
  Begrenzungen, Trennung von privaten CMS-Daten, minimierter Kontext, keine Inhaltslogs.

## Rechtsgrundlage: Einwilligung gewählt; bisherige Interessenabwägung dokumentiert

### Fallbezogene Bewertung vom 4. Oktober 2026

Der getestete Chat beantwortet frei formulierte Fragen und Folgefragen über
öffentliche Leistungen und Referenzen und verlinkt passende Projekte. Das ist
ein konkreter Nutzen für Besucher und für die Darstellung des eigenen Angebots.
Die gleichen Ausgangsinformationen sind jedoch über Website-Navigation und
Kontaktformular verfügbar. Die bisherigen Funktionstests belegen den Nutzen,
aber noch nicht die Erforderlichkeit einer externen LLM-Verarbeitung unter
Art. 6 Abs. 1 lit. f DSGVO. Insbesondere sind weniger eingriffsintensive
Alternativen (z. B. Suche oder FAQ) anhand dieses Zwecks zu bewerten.

Für die Abwägung sprechen der enge Informationszweck, begrenzte Eingaben und
Verläufe, keine Uploads, keine eigenen dauerhaften Inhaltsprotokolle und die
Kontaktalternative. Dagegen stehen mögliche Angaben über Dritte oder sensible
Daten im Freitext, globale Anbieter-Verarbeitung, die beschriebenen
Anbieter-Speicherwege und potenziell falsche Aussagen. Ein Warnhinweis verhindert
solche Eingaben nicht zuverlässig. ZDR/MAM und EU-Verarbeitung sind noch nicht
bestätigt und dürfen nicht als bestehende Schutzmaßnahmen gewichtet werden.

**Vorläufiges Ergebnis:** Eine tragfähige abschließende Interessenabwägung ist
damit noch nicht belegt. Empfehlung für die optionale Inhaltsverarbeitung:
eine informierte, aktive und freiwillige Einwilligung nach Art. 6 Abs. 1 lit. a
DSGVO, mit einfacher Widerrufsmöglichkeit, technisch und textlich vorbereiten.
Der Betreiber hat diese Variante am 4. Oktober 2026 gewählt. Sie ist im Code
vorbereitet; Bereitstellung und manueller Staging-Test stehen noch aus. Missbrauchsschutz und technische Bereitstellung gesondert
beurteilen. Die Einwilligung des Chat-Nutzers deckt keine beliebigen Daten
Dritter oder Art.-9-Daten ab und ersetzt keine Drittland-Transferprüfung.
Öffentliche Portfolio-Inhalte ebenfalls gesondert bewerten.

Bei Umsetzung: Anbieter, Zweck, Datenumfang und Anbieter-Speicherung vor der
Einwilligung nennen; keine vorangekreuzte Auswahl; Ablehnung ohne Nachteile für
die übrige Website; Nachweis und Version der Einwilligung datensparsam festlegen;
Widerruf für künftige Anfragen ermöglichen und lokale Chat-Inhalte löschen.
Ein Widerruf macht bereits erfolgte Verarbeitung nicht rückwirkend unrechtmäßig
und garantiert keine sofortige Löschung beim Anbieter. Bestehende
Hinweisbestätigungen dürfen nicht als Einwilligungen weiterverwendet werden.

Quellen: [EDSA-Stellungnahme 28/2024, insbesondere Erforderlichkeit und Abwägung](https://www.edpb.europa.eu/system/files/2024-12/edpb_opinion_202428_ai-models_en.pdf),
[DSGVO Art. 6 und 7](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu).
Diese Bewertung ist ein Arbeitsstand und keine rechtliche Freigabe des Betriebs.

### Bisheriger Prüfrahmen

Interesse: Besuchern niedrigschwellig Orientierung zum eigenen Angebot ermöglichen.
Geeignetheit: textbasierte Auskünfte aus einem abgegrenzten öffentlichen Wissensbestand.
Erforderlichkeit: Prüfen, welchen konkreten Mehrwert der Chat gegenüber Navigation,
FAQ und Kontaktformular bietet. Freiwilligkeit allein belegt keine Erforderlichkeit
und keine überwiegenden Interessen.

Betroffeneninteressen: Freitext kann sensible Angaben oder Daten Dritter enthalten;
externe Verarbeitung, Retention, mögliche menschliche Einsicht, unzutreffende Aussagen
und Drittlandzugriffe sind zu berücksichtigen. Die Veröffentlichung von Projektdaten
macht sie nicht automatisch frei für jede Weiterverarbeitung.

Milderung: Information vor Absenden, begrenzter Zweck, Kontaktalternative, keine Uploads,
kein Profiling, keine Entscheidungen, kurze eigene Speicherwege, Datenminimierung,
ZDR/MAM nach Freigabe. Hinweisbestätigung ist keine Einwilligung. Werden diese
Voraussetzungen nicht erreicht, Rechtsgrundlage/Architektur erneut bewerten.

DSFA-Vorprüfung: kein geplanter Einsatz für Bewertung von Personen, sensible Daten,
Profiling oder automatisierte Entscheidungen. Noch kein abschließendes DSFA-Ergebnis:
Umfang, Zielgruppen, Art.-9-Daten und Kriterien der zuständigen Aufsicht prüfen.
Bei Zweckänderung oder hohem Risiko DSFA vor Beginn. Prozess für Auskunft, Löschung,
Widerspruch und Sicherheitsvorfälle auch bei OpenAI festlegen. Unvermeidbare sensitive
Eingaben nicht als durch einen Warnhinweis rechtlich gelöst behandeln.

## Quellen

- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [OpenAI-Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data)
- [Responses-Streaming](https://developers.openai.com/api/docs/guides/streaming-responses)
- [OpenAI-DPA](https://openai.com/policies/data-processing-addendum/)
- [OpenAI-Spend-Limits](https://developers.openai.com/api/docs/guides/spend-limits)
- [DSK: KI und Datenschutz](https://www.datenschutzkonferenz-online.de/media/oh/20240506_DSK_Orientierungshilfe_KI_und_Datenschutz.pdf)
- [DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu)
- [KI-Verordnung, Transparenz nach Art. 50](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50)

## Archiv der Einwilligung: openai-consent-v1 (4. Oktober 2026)

Der maßgebliche Wortlaut steht im Einwilligungsbereich von
`src/components/Chat/AIChat.tsx`, versioniert zusammen mit
`CHAT_CONSENT_VERSION` in `src/utilities/chatProtocol.ts`. Er benennt Verantwortlichen,
OpenAI Ireland, Zweck, Nachricht und Verlauf, globalen Betrieb, Anbieter-Speicherung,
Freiwilligkeit, Kontaktalternative, Widerruf, Nachweisdaten und Eingabegrenzen.
Aktive Schaltfläche: „Einwilligen und Chat nutzen“; Ablehnung: „Ohne KI-Chat fortfahren“.
Keine vorangekreuzte Checkbox, keine Umdeutung alter Bestätigungen. Änderungen
an Zweck, Anbieter, Region oder wesentlichen Speicherregeln erfordern eine
Bewertung und gegebenenfalls neue Version und erneute Einwilligung.
Die Bereitstellung dieses Wortlauts muss vor Livebetrieb mit der veröffentlichten
Datenschutzerklärung übereinstimmen. Einwilligung ersetzt weder DPA noch gültige
Drittlandgarantien oder die gesonderte Bewertung von Portfolio-/Fremddaten.
