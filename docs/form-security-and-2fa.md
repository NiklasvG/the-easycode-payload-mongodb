# Formularschutz und Prüfung von 2FA

Stand: 5. Oktober 2026. Keine Änderung am produktiven Login oder Deployment.

## Honeypot

Der FormBlock enthält ein außerhalb des sichtbaren Bereichs platziertes Textfeld
`website`. Es ist aus der Tab-Reihenfolge und dem Accessibility-Baum genommen;
Autocomplete ist deaktiviert. Der tatsächliche DOM-Wert wird separat von den
redaktionellen Formularfeldern an `/api/form-submissions` geschickt.

`validateFormSubmission` lehnt einen ausgefüllten oder falsch typisierten Wert
mit der allgemeinen Validierungsfehlermeldung ab, bevor das Formular gelesen,
eine Einsendung gespeichert oder eine E-Mail ausgelöst wird. Ein leerer Wert wird
nicht gespeichert und taucht nicht in E-Mails auf. Ein reguläres CMS-Formularfeld
namens `website` bleibt möglich: Es liegt separat in `submissionData`.

Bestehende API-Clients ohne Honeypot bleiben kompatibel. Ein gezielter Bot kann
den Honeypot weglassen; die vorhandenen Anfragebegrenzungen und die Validierung
bleiben deshalb erforderlich. Produktive Mailzustellung wurde nicht getestet.

## 2FA: Community-Plugins derzeit nicht eingebaut

Die Prüfung der Dokumentation und relevanten Quelldateien ist keine vollständige
Sicherheitsprüfung. Folgende konkrete Befunde verhindern eine Installation:

- [`@plutotcool/payload-plugin-two-factor`](https://github.com/plutotcool/payload-plugin-two-factor):
  Die dokumentierte Middleware schützt `/admin/:path*`. Eine Sperre der
  Payload-API bis zum abgeschlossenen zweiten Faktor ist dort nicht beschrieben.
  Für diese Website reicht eine Absicherung allein der Admin-Navigation nicht.
- [`@arthur.eudeline/payload-plugin-mfa` 0.1.2](https://github.com/arthur-eudeline/payload-plugins/tree/main/packages/payload-plugin-mfa):
  Das Plugin prüft in `src/hooks.ts` im `beforeLogin`-Hook vor der JWT-Ausgabe.
  Allerdings liefert `decryptOrNull` in `src/state.ts` bei einem
  Entschlüsselungsfehler `null`. `createMfaBeforeLoginHook` lässt den Login bei
  `!state.enabled || !state.secret` passieren. Damit entfällt ein aktivierter
  zweiter Faktor bei einem beschädigten oder nicht mehr entschlüsselbaren
  Geheimnis. Der Code kommentiert dieses Verhalten ausdrücklich. Ein
  aktiviertes Konto muss in diesem Fall den Login verweigern.

Payload 3.90.2 ruft `beforeLogin` auch beim Passwort-Reset auf. Bei einer späteren
Integration muss daher der Reset-Ablauf einschließlich Code-Eingabe geprüft
werden, damit eingeschriebene Benutzer nicht im nativen Reset-Formular hängen.

Vor einem Einbau erforderlich: Ablehnung bei nicht entschlüsselbarem aktivem
Geheimnis, Tests für REST-/GraphQL-Login und Passwort-Reset, Wiederverwendung und
parallele Nutzung von TOTP-/Backup-Codes, Sperren nach Fehlversuchen sowie
Absicherung der MFA-Felder gegen API-Manipulation. Bestehende Sitzungen bei
Aktivierung und die privilegierte Wiederherstellung müssen berücksichtigt werden.

Die dokumentierte MongoDB-Replica-Set-Konfiguration unterstützt Transaktionen.
Es wurden keine Benutzer umgestellt, keine neuen Geheimnisse angelegt und kein
Community-Authentifizierungspaket installiert.

## Prüfung der Änderungen

Gezielte Tests prüfen leere, ausgefüllte und falsch typisierte Honeypot-Werte,
die Trennung von einem regulären Website-Feld sowie bestehende Login- und
Anfragebegrenzungen. Der vorhandene Formular-E2E-Test wurde um eine abgewiesene
Bot-Einsendung ergänzt; seine Ausführung benötigt isoliertes MongoDB und Mailpit
und wurde hier nicht durchgeführt. Die projektweite Typprüfung meldet Fehler
in vorhandenen Abhängigkeitstypen und weiteren Projektdateien.
