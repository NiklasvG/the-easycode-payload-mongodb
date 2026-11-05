# Abnahme der Livegang-Vorbereitung

Stand: 5. November 2026. Die Hauptdomain zeigt weiterhin auf den bisherigen Server.
Die technische Vorbereitung ersetzt nicht die noch offene Veröffentlichung einer
zum tatsächlichen Betrieb passenden Datenschutzerklärung.

## Nachgewiesener erster Release über den neuen Ablauf

- Main-Workflow: [42075269196, Attempt 2](https://github.com/NiklasvG/the-easycode-payload-mongodb/actions/runs/42075269196).
- Commit: `1e370e53cb071117067b9260055710a1db18df03`.
- Coolify-Deployment: `aa5e4gebxhqoueoizovgta97`, Zielserver 1, Builder 2.
- Gebaute und ausgelieferte Build-ID: `1eb4df01-f2e5-4607-8f18-e33da0539f03`.
- Registry-Digest: `sha256:396658d25733915d29fb7dc8f1fc534796e28a9a0e6cb796dbfd5c1f128dff08`.
- Eindeutiges Registry-Tag und tatsächliches Laufzeitimage haben denselben Digest.
- 152 Integrationstests, 25 Browser-Kerntests, Typprüfung, Lint und Pflichtcheck bestanden.
- Produktions-Abhängigkeiten: kein kritischer, hoher oder mittlerer Auditbefund;
  ein niedriger transitiver deepmerge-Befund ohne gemeldete korrigierte Version bleibt.

Auf der ausgelieferten Staging-Version: 15 Sitemap-Seiten HTTP 200, unbekannte Seite
404, anonyme Benutzer-/Formularübermittlungs-API 403. Das ist eine HTTP-Abnahme,
keine vollständige manuelle Prüfung aller Inhalte und Bildschirmgrößen.

Der echte globale KI-Chat wurde in einem isolierten Browser geprüft: ohne
Zustimmung keine Chat-Anfrage, nach Zustimmung zwei erfolgreiche Antworten
einschließlich Folgefrage, nach Widerruf Zustimmung entfernt und Eingabe gesperrt.
Ohne Analytics-Zustimmung wurde keine Verbindung zum Analytics-Dienst aufgebaut.
SMTP-TLS-Verbindung und Anmeldung vom Appserver bestanden; keine Testmail versandt.

## Betrieb

Der Release-Dienst läuft unter `https://easycode-release.ec-host.de`. Der eigene
Coolify-Zugang ist auf das Easycode-Projekt begrenzt. Unauthentifizierter Auftrag
401, PR-Freigabeversuch 403 und fremder Projektzugriff 404 wurden geprüft.
`read:sensitive` wurde ausdrücklich vom Betreiber genehmigt und für Buildlogs
ergänzt. Der Zugang kann innerhalb dieses Projekts auch Secrets lesen; Ablauf
3. Februar 2027, 16:57:33 UTC. Rotation rechtzeitig einplanen.

Die bisherige direkte CI-Deploymentvariable ist deaktiviert. Der neue
Koordinatorweg ist aktiviert, Coolify-Push-Autodeploy bleibt aus. Der Zielname
`production-website` bezeichnet aktuell weiterhin dieselbe Anwendung unter
`staging.the-easycode.eu` mit `APP_ENV=staging`.

Konsistenter DB-/Medien-/Releasezustands-Backup-Erstlauf und isolierter S3-Restore
bestanden; Details in [backup-workflow.md](backup-workflow.md). Täglicher Timer
02:15 UTC aktiviert, native Teilkalender deaktiviert. Die kurze Schreibpause kann
die Website während der Sicherung vorübergehend unerreichbar machen.

Umami-Bereinigung nach 180 Tagen eingerichtet und manuell erfolgreich ausgeführt;
Timer 03:10 UTC aktiviert. Eigenständige Statistikdatenbank-Sicherung täglich
02:45 UTC, zwei lokale und vierzehn S3-Stände, letzter geprüfter Upload erfolgreich.
Ein erster abgeschlossener nächtlicher Lauf der neu eingerichteten Hosttimer und
ein externer Website-Ausfallalarm sind noch nicht als nachgewiesen dokumentiert.

## Vor dem Hauptdomain-Wechsel noch erforderlich

1. Mailcow-Protokolle und Postfach-Sicherungsrotation tatsächlich feststellen.
   „Bis zur abschließenden Bearbeitung“ ist ein Kriterium für Kontaktinhalte,
   bestätigt aber keine Rotation technischer Logs und Backups. Für den Mailserver
   liegt im vorhandenen SSH-Zugang kein verifizierter Hostschlüssel vor; deshalb
   wurde dort keine Konfiguration verändert oder ein neuer Schlüssel ungeprüft akzeptiert.
2. Offene Angaben des Datenschutzentwurfs abschließen und die tatsächliche
   CMS-Seite aktualisieren. Sie beschreibt derzeit noch den früheren Betrieb.
   Markdown-Änderungen veröffentlichen diese Seite nicht. Globalen OpenAI-Betrieb,
   Umami und die bestätigten Speicherregeln berücksichtigen.
3. Produktionskonfiguration, Hauptdomain und www-Ziel an genau dieser Anwendung
   einrichten; über die eigene temporäre Domain vorab prüfen. Dabei auch echte
   Produktionsintegrationen, Canonical, robots.txt und SSL abnehmen.
4. Erst danach DNS-A/AAAA und www kontrolliert umstellen und öffentlich prüfen.
   Beim lesenden Vorabcheck zeigt die Hauptdomain auf `91.107.217.105`; der
   Appserver ist `128.140.114.30`. Die Cloudflare-Zone ist mit vorhandenem Zugang
   erreichbar, es wurden keine DNS-Einträge der Hauptdomain verändert.
5. Alten Server und Originaldaten bis zur bestätigten Ablösung erhalten.
   Image-Rollback am Digest von einer Datenbank-Rücksicherung unterscheiden.

Weiterleitungsbefund des Altservers: www verliert auf Unterseiten Pfad und
Parameter. Beim Wechsel explizit Pfad-/Parametererhalt testen und auch vorhandene
AAAA-Einträge berücksichtigen. Keine globale Proxykonfiguration dafür ändern.
