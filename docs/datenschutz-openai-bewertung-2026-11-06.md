# OpenAI-Chat: Datenfluss, Übermittlungen und Einwilligungsnachweise

Stand: 6. November 2026. Betriebliche Datenschutzbewertung für den begrenzten
Website-Assistenten, keine Zusicherung einer ausschließlich europäischen oder
vollständig speicherfreien Verarbeitung.

## Geprüfte Grundlagen und Geltungsbereich

- Personalisierter OpenAI-DPA v.010126 vom 3. Oktober samt Abschlusszertifikat
  bereits in dieser Sitzung geprüft; Kundenzuordnung und OpenAI Ireland Ltd.
  sind dokumentiert. Originale bleiben privat, keine erneute Unterzeichnung abgeleitet.
- Aktueller öffentlicher DPA v.010126, Abschnitt 4.1: EWR-Daten werden durch
  OpenAI Ireland unter dem DPA verarbeitet; Weiterübermittlungen außerhalb EWR/
  Schweiz werden vertraglich auf SCCs oder einen Angemessenheitsbeschluss gestützt.
- Unterauftragnehmerliste, Stand 14. Oktober 2026, am 6. November geöffnet:
  globale API-Infrastruktur und Sicherheitsprüfung sind vom gesonderten, nur
  auf Kundenwahl erfolgenden Support sowie ChatGPT-Connectors zu unterscheiden.
- Die technische Konfiguration nutzt api.openai.com/v1/responses, GPT-6 Luna,
  store=false und keine Tools, Files, Conversations oder Hintergrundverarbeitung.
  EU/ZDR/MAM sind für diesen Betrieb nicht als Freigabe oder Zusicherung verwendet.

## Empfänger und Orte

Vertraglicher Auftragsverarbeiter ist OpenAI Ireland. Relevante Kategorien
sind API-Infrastruktur/CDN, OpenAI-Verbundunternehmen und gegebenenfalls
Sicherheitsprüfung markierter Inhalte. Die Anbieterquelle nennt unter anderem
Cloudflare und globale Cloud-Infrastruktur; API-Verarbeitung ist auch in den
USA möglich. Der globale Endpunkt belegt keinen einzelnen Ausführungsstaat
für jede Anfrage. Die vollständige aktuelle Empfängerliste bleibt deshalb
verlinkt; nicht sämtliche gelisteten Dienste werden für jede Anfrage behauptet.
Die API-Sicherheitsprüfung kann laut Anbieter bei markierten Inhalten weitere
Prüfdienstleister einbeziehen. Supportzugriff ist laut Liste von einer aktiven
Weitergabe im Supportfall abhängig; dafür werden keine Besucher-Chats eingereicht.

Für konkrete Weiterübermittlungen verpflichtet DPA 4.1 OpenAI Ireland zu SCCs
oder Angemessenheit. Es wird weder pauschal eine DPF-Zertifizierung aller
Empfänger noch Art. 49 als allgemeiner Ersatz behauptet. Auch Einwilligung
hebt die Anforderungen an solche Übermittlungen nicht auf.

## Datenbegrenzung und Bewertung

Der Zweck ist freiwillige Orientierung zu Leistungen und öffentlichen Projekten.
Kein automatisiertes Entscheiden über Personen, keine Kontakt-/CRM-Auswertung,
keine privaten Datenquellen oder Dateiwerkzeuge. Input und Verlauf sind begrenzt;
Besucher-IP und Bestätigungs-ID werden nicht an OpenAI weitergegeben.
Freitext kann trotz Warnung personenbezogene oder sensible Angaben enthalten;
Warntexte und Zweckbegrenzung sind keine verlässliche Anonymisierung.

Der Anbieter muss Inhalte für die Antwort und gegebenenfalls Sicherheitsprüfung
im Klartext verarbeiten können. TLS und Verschlüsselung ruhender Daten schließen
Anbieterzugriff oder rechtlich erzwungene Zugriffe nicht aus. US-/andere globale
Verarbeitung ist daher ein verbleibendes Risiko, das nicht mit einer behaupteten
Ende-zu-Ende-Verschlüsselung verdeckt wird. Vertrag, veröffentlichte Anbieterregeln,
Beschränkung auf den beschriebenen Zweck und Datenumfang, freiwillige Nutzung
mit gleichwertigem Kontaktweg sowie kurze lokale Verarbeitung bilden die
hier dokumentierten Maßnahmen. Der Dienst ist für sensible, vertrauliche oder
fremde personenbezogene Daten nicht vorgesehen. Erweiterungen um solche Zwecke
oder Datenquellen erfordern eine erneute Bewertung vor ihrer Aktivierung.

Die dokumentierten Standardwege sind Missbrauchsprotokolle grundsätzlich bis
30 Tage mit den Anbieter-Ausnahmen und verschlüsselte Cache-Zwischenzustände
bis 24 Stunden. store=false beseitigt diese Wege nicht. Eine ausschließliche
EU-Verarbeitung wurde mit dem verwendeten Schlüssel nicht nachgewiesen und
ist nicht Grundlage der veröffentlichten Erklärung.

Diese Bewertung dokumentiert die vorhandene Vertragskette und begrenzte
Verwendung. Sie behauptet keine abschließende Einzelfallprüfung jeder weltweit
anwendbaren Rechtsordnung. Bei Änderung des DPA, der Unterauftragnehmer, des
Modells, der Region oder des Verarbeitungszwecks ist sie erneut abzugleichen.
Konkrete Zweifel an wirksamen Garantien sind vor weiterer Nutzung zu klären;
eine pauschale risikofreie Übermittlung wird nicht zugesagt.

## Einwilligungsnachweise

Neue Fassung openai-consent-v3: aktive Zustimmung, Hinweis auf globale Verarbeitung
und grundsätzlich 30-tägige Missbrauchsprotokolle, direkter Datenschutzlink,
24-Stunden-Gültigkeit und jederzeitiger Widerruf. Frühere Session-Bestätigungen
werden wegen der Versionsänderung nicht als neue Zustimmung übernommen.

Die nicht als Payload-Collection registrierte MongoDB-Sammlung
ai_chat_consent_receipts erhält nur zufällige ID, Version, Client-Bestätigung,
serverseitige Erfassungs-/Nutzungszeitpunkte, Hash des gezeigten Hinweistexts
und Datenschutzversionsdatum. Keine Chats oder IP. Der eindeutige Index
consent_identity verhindert mehrere Dokumente für dieselbe ID/Version; der
TTL-Index consent_expiry löscht nach expiresAt automatisch auch ohne weitere
Website-Anfrage. expiresAt liegt 90 Tage nach der letzten Verwendung.

Begründung der Betriebsfrist: datensparsamer, zeitlich begrenzter Nachweis für
Rückfragen und Überprüfung der rechtmäßigen Weitergabe über die reguläre
Anbieter-Speicherfrist hinaus; keine Besucherprofile und keine unbegrenzte
Beweissammlung. Die 90 Tage sind keine gesetzliche Pauschalfrist. Bei konkreten
rechtlichen Erfordernissen wäre eine gesonderte, zweckgebundene Fallakte zu
begründen. Sie wird durch diese Implementierung nicht automatisch angelegt.

Die API speichert mit bestätigtem Datenbankschreibvorgang vor dem Provideraufruf;
bei Index- oder Schreibfehler wird nicht an OpenAI gesendet. MongoDB entfernt
abgelaufene Dokumente im Hintergrund, üblicherweise im nächsten Minutenlauf,
unter Last gegebenenfalls später. Website-Sicherungen können bis zu ihrer
Anzahlrotation ältere Dokumente enthalten; beim Restore sind TTL-Indizes und
Ablaufbereinigung vor Freigabe zu kontrollieren.

Die Bestätigung ist eine geprüfte Client-Erklärung und kein Identitätsnachweis
oder kryptografisch signierter Klickbeleg. Der serverseitige Empfangszeitpunkt
wird zusätzlich zum Client-Zeitpunkt gespeichert. Widersprüchliche Erklärungen
mit derselben ID/Version erzeugen keinen neuen gültigen Datensatz.

## Quellen

- [Geltender DPA, insbesondere 4.1](https://openai.com/policies/data-processing-addendum/)
- [Unterauftragnehmer, Stand 14.10.2026](https://openai.com/policies/sub-processor-list/)
- [OpenAI-Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data)
- [EDSA-Einwilligungsleitlinien, Abschnitt 5.1](https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_202005_consent_en.pdf)
- [MongoDB 8: TTL-Verhalten](https://www.mongodb.com/docs/v8.0/core/index-ttl/)
