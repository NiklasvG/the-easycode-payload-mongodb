# OpenAI-Chat: Betrieb und Datenschutzvorbereitung

Stand: 3. Oktober 2026. Lokale Vorbereitung, nicht deployed und keine rechtliche Freigabe.

## Status

Der Chat wurde von Gemini auf GPT-6 Luna über die OpenAI Responses API vorbereitet.
Es erfolgt kein automatischer Rückfall auf Gemini oder einen globalen OpenAI-Endpunkt.
Der explizite globale Staging-Modus ist unten beschrieben.
Ohne explizite Aktivierung, passende Region-Konfiguration, API-Key und Proxy-IP-Header
antwortet die Route mit 503, ohne CMS-Inhalte abzurufen oder OpenAI aufzurufen.

Betreiberbestätigungen aus diesem Chat:

- Organisation: The-Easycode; API-Konto vorhanden, Abrechnung noch nicht eingerichtet.
- Sales-Anfrage zu EU-Verarbeitung/ZDR beziehungsweise MAM versendet; Antwort ausstehend.
- Sharing: Feedback, Evaluation/Fine-Tuning und Eingaben/Ausgaben deaktiviert.
- API call logging deaktiviert; Nutzungsübersicht eingeschränkt, Logs nur für Owner sichtbar.
- Nur der Betreiber ist Owner, keine offenen Einladungen.
- MFA, SMS und Passkey sind nach Betreiberangabe eingerichtet.

Diese Account-Einstellungen belegen weder EU-Freigabe noch ZDR/MAM oder wirksame
Einbeziehung des DPA. Vertragsunterlagen und Account-Screenshots außerhalb des
öffentlichen Repositorys aufbewahren.

## Technischer Datenfluss

1. Beim Öffnen prüft der Browser mit einer nicht gecachten GET-Anfrage ohne Cookies,
   ob der Chat konfiguriert und aktiviert ist. Ist er deaktiviert, erscheint nur ein
   Verfügbarkeitshinweis mit Kontaktmöglichkeit. Erst danach lädt der Browser den Chat.
   Die Hinweisbestätigung ist versioniert:
   `easycode-ai-chat-disclaimer-confirmed=openai-v1`. Alte Gemini-Bestätigungen gelten nicht.
2. Erst nach Hinweisbestätigung sendet der Browser Nachricht und maximal zwölf jüngste
   Kontextnachrichten (zusammen höchstens 6.000 Zeichen) an `/api/ai-chat`.
3. Der Server prüft Origin, JSON-Format, Honeypot, Hinweisversion und Größenlimits.
   Der Hinweis ist keine Datenschutz-Einwilligung und kein wirksamer Bot-Schutz.
4. Payload liefert maximal zwölf jüngste veröffentlichte Projekte unter anonymen
   Zugriffsrechten. Es werden nur Titel, Kurzbeschreibung, bis zu acht Technologien
   und öffentliche Projekt-URLs übertragen, insgesamt höchstens 6.000 Zeichen.
   Nicht enthalten: interne Kundenfelder, E-Mail-Adressen aus Beziehungen, Uploads,
   Kontaktanfragen, CMS-Authentifizierung, Besucher-IP oder Browser-Header.
5. Native serverseitige HTTPS-Anfrage an `https://eu.api.openai.com/v1/responses`:
   `model=gpt-6-luna`, `store=false`, `stream=true`, `reasoning.effort=none`,
   `text.verbosity=low`, `max_output_tokens=800`. Kein SDK, keine Tools, Files,
   Conversations, Background-Anfragen oder providerseitigen Response-IDs im Verlauf.
6. Nur Text-/Refusal-Deltas sowie Abschluss-/Fehlersignale gelangen zum Browser.
   Provider-Metadaten und rohe Fehlermeldungen werden nicht weitergegeben oder geloggt.
7. Der Browser speichert Gesprächsinhalte nur im React-Arbeitsspeicher, maximal
   Begrüßung plus 40 jüngste Nachrichten. Verlauf löschen entfernt diesen Inhalt.
   Ein Neuladen verwirft ihn ebenfalls. Schließen stoppt die laufende Anfrage,
   behält den Verlauf aber für ein späteres Öffnen im selben Dokument.

`store=false` verhindert nicht sämtliche OpenAI-Verarbeitung oder Speicherwege.
Abuse Monitoring und Prompt-Caching sind gesondert anhand der freigegebenen
Account-Konfiguration zu dokumentieren. Auch veröffentlichte Projektdaten können
personenbezogen sein; ihre zulässige Verwendung als LLM-Kontext prüfen.

## Schutzmaßnahmen und Grenzen

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
- Der Browser bietet Stoppen, Verlauf löschen, Retry-After-Warteanzeige und sichere
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

### Temporärer Proxy-Test auf Staging

`GET /api/ai-chat/proxy-check` ist standardmäßig deaktiviert (404). Nur bei
`APP_ENV=staging`, einem separaten `CHAT_PROXY_DIAGNOSTIC_TOKEN` mit mindestens
32 Zeichen und `CHAT_PROXY_DIAGNOSTIC_UNTIL` als zukünftiger ISO-Zeitpunkt innerhalb
der nächsten Stunde ist die Diagnose erreichbar. Authentifizierung erfolgt über
`X-Proxy-Diagnostic-Token`. Keine OpenAI-/CMS-Aufrufe, keine IP-Inhaltslogs, keine
Ausgabe der Roh-IP. Rückgabe: konfigurierter Header, gültige IP vorhanden und ob
eine der Testadressen `192.0.2.123` / `2001:db8::123` übernommen wurde.

Zunächst normal, danach mit gefälschten `X-Real-IP`, `X-Forwarded-For` und
`CF-Connecting-IP` testen. Erwartet: `validClientIp=true`,
`testAddressAccepted=false`. Das prüft diese Testfälle, keine beliebige
Proxy-/Middleware-Konfiguration. Host-Portfreigaben und weitere Zugriffswege
separat prüfen. Danach beide Diagnosevariablen entfernen und neu deployen.
Keine Diagnose-Header in Proxy-/APM-Logs erfassen. Flags für den Chat bleiben false.

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
   fachfremde Frage, fehlende Fakten, Injection-Versuch, Stoppen, Löschen, 429,
   Anbieterfehler und Ausfall. Kosten, Faktentreue und Latenz messen. Keine Aussage
   über Modellqualität aus Mocktests ableiten. Freigabekriterien: keine erfundenen
   Preise/Verfügbarkeiten; Links korrekt; Datenschutzgrenzen verständlich.
7. Tatsächliche Speicherwege inklusive Logs, Caches und Backups prüfen.
   Datenschutzerklärung, Hinweis und Rechtsgrundlage vor öffentlicher Aktivierung
   fertigstellen. EU-Zusagen nur im belegten Umfang verwenden.

## Verzeichnis der Verarbeitungstätigkeiten: Entwurf

- Verantwortlicher: Niklas von Grzymala – The-EasyCode, Kontakt wie Datenschutzerklärung.
- Zweck: freiwillige Auskunft zu Leistungen, beruflichen Referenzen und Kontaktwegen.
- Betroffene: Websitebesucher; gegebenenfalls Personen in öffentlichen Portfolio-Inhalten.
- Daten: Nachricht, begrenzter Verlauf, generierte Antwort, Projektkontext;
  separat pseudonymisierte IP-Zähler und technische Verbindungsdaten.
- Empfänger: eigene Hetzner-Infrastruktur; OpenAI-Vertragsgesellschaft und deren
  vertraglich festgelegte Unterauftragnehmer nach Bestätigung.
- Rechtsgrundlage: für allgemeine Auskünfte Art. 6 Abs. 1 lit. f DSGVO als zu prüfender
  Ansatz; Art. 6 Abs. 1 lit. b nur bei nachgewiesener Erforderlichkeit zur konkreten
  vorvertraglichen Anfrage. Kein pauschaler Wechsel der Rechtsgrundlage durch Thema.
- Drittlandverarbeitung und Löschregeln: Account-/Vertragsnachweise ausstehend;
  eigene IP-Zähler und Browserverlauf wie oben, Infrastruktur-Logs wie Hosting-Konzept.
- Maßnahmen: Zugangsschutz, Schlüssel nur serverseitig, Verschlüsselung bei Übertragung,
  Begrenzungen, Trennung von privaten CMS-Daten, minimierter Kontext, keine Inhaltslogs.

## Interessenabwägung: Arbeitsentwurf, Betreiberentscheidung ausstehend

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
