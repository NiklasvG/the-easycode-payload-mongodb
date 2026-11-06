# Easycode: Datenschutz abgeschlossen und auf Staging veröffentlicht

Stand: 6. November 2026. Betreiberauftrag: alle offenen Datenschutzpunkte
abschließen, Texte in Payload veröffentlichen und feste Abschnittsanker setzen.

## Veröffentlichtes Ergebnis

- [Datenschutzseite](https://staging.the-easycode.eu/datenschutz)
- [Direkter KI-Chat-Abschnitt](https://staging.the-easycode.eu/datenschutz#ki-chat)
- Payload-Seite 69bfce5358682a3790aa26e5, veröffentlicht am 6. November 2026,
  aktualisiert 21:11:07 UTC (22:11:07 deutscher Zeit).
- Git-Commit 9e880f9e3aef183b511e71bf3e499df7b5ef7dd1 auf main; Build-ID 3271e4a1-f6fb-43aa-a766-5eedea54cf7e.
- Image-Digest sha256:fe55935614cc9480440574164ce2ed88b53fea15ea7d756d12d86e0afe2032c9, gegen den einzelnen laufenden gesunden
  Websitecontainer geprüft.
- [GitHub-Quality-/Release-Lauf](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/42294395542)
  vollständig erfolgreich: checks, container, Quality gate und request.

Die neue Fassung ersetzt die alten Vercel-/Sentry-/Google-Analytics-/Ads-/Gemini-
Angaben durch den geprüften Hetzner-/Payload-/Umami-/OpenAI-Betrieb. Die Mailregeln
und die neue nächtliche Erfolgsrotation sind knapp beschrieben. Technische
Belege, Pfade und Prüfsummen bleiben in interner Betriebsdokumentation.
Die Hauptdomain und DNS wurden nicht umgeschaltet.

## Einwilligung und Nachweise

openai-consent-v3 mit ausdrücklichem Hinweis auf globale Verarbeitung,
Anbieter-Missbrauchsprotokolle, Freiwilligkeit, Widerruf und direktem Datenschutzlink.
Vorherige Session-Bestätigungen sind für diese Fassung nicht gültig.

Die private MongoDB-Sammlung ai_chat_consent_receipts ist nicht als Payload-
REST-Collection registriert. Minimale Metadaten statt Inhalte/IP; eindeutiger
Index für ID/Version und TTL-Index nach expiresAt. Ablauf 90 Tage nach letzter
Nutzung. Ein bestätigter Schreibvorgang muss vor dem Provideraufruf vorliegen.
Die 90 Tage sind die dokumentierte begrenzte Betriebsentscheidung, keine
allgemeingültige gesetzliche Pflichtfrist. Der Hash des versionierten
Hinweistexts und die Datenschutzversion ermöglichen die Zuordnung.

## Abnahme

- 50 gezielte lokale Tests für Chat, Einwilligung, Speicherung und Abschnittsanker
  bestanden; Typprüfung und gezielte ESLint-Prüfung erfolgreich.
- Echter Test mit künstlichen Daten an isolierter lokaler MongoDB: Speichern,
  eindeutiger Nachweis, 90-Tage-Ablauf und automatische TTL-Löschung eines bereits
  abgelaufenen Testeintrags beobachtet. Testdaten entfernt.
- GitHub-Integrationstests und verpflichtende Container-/Browserprüfungen bestanden.
- Öffentliche Staging-Prüfung bei 1440 und 390 Pixel Breite: alle zwölf eindeutigen
  Anker vorhanden, #ki-chat im sichtbaren Bereich mit 144 Pixel Kopfabstand,
  kein horizontaler Überlauf. Screenshots nach geschlossenem Banner geprüft.
- Kein Chat-POST vor Zustimmung. Genau eine synthetische Anfrage nach Zustimmung,
  HTTP 200 und abgeschlossene Antwort. Widerruf entfernt die Session-Bestätigung
  und zeigt erneut die Einwilligungsentscheidung. Keine Analyseanfrage ohne Zustimmung.
- Private Nachweisroute antwortet anonym 404. Echter Testeintrag auf Staging
  ausschließlich anhand der eigenen zufälligen Test-ID gelesen: nur zulässige
  Metadaten, 90 Tage und beide Indizes bestätigt. Testeintrag gezielt entfernt.
- Frühere CMS-Fassungen privat auf dem Host unter
  /srv/easycode-privacy-evidence/20261106 gesichert. Veröffentlichung erfolgte
  über Payload Local API mit CMS-Validierung und Versionierung. Für die CLI-
  Ausführung wurde nur der Next-Revalidierungshook per vorhandenem Kontextflag
  ausgesetzt; der anschließende bestätigte Release erneuerte den Seiten-Cache.

## Stand und Grenzen

Die zuvor markierten redaktionellen und technischen Datenschutz-Prüfpunkte
sind durch Fassung, Betriebsregeln und Nachweise ersetzt. Ältere Notizen sind
als historische Vorstufen zu lesen. Das ist keine pauschale Garantie über
sämtliche künftigen Betriebsänderungen oder Anbieterentscheidungen. Bei Wechsel
von Region, Modell, Empfängern, Zweck oder Speicherwegen erneut abgleichen.
Die vertraglichen Grundlagen und verbleibenden globalen Risiken stehen in der
internen OpenAI-Bewertung; keine ausschließliche EU-Verarbeitung oder ZDR zugesagt.

Der erste zukünftige Mailcow-Nachtlauf und ein vollständiger Mailcow-Restore-Test
bleiben technische Betriebsprüfungen. Sie sind nicht als bereits bestanden
behauptet. Die nächtliche Rotation ist aktiviert und ihre Fehlerfälle sind geprüft.
Unabhängige laufende Änderungen an Gestaltung und Chat-Themenregeln wurden
nicht in diesen Datenschutz-Commit übernommen.
