# Redaktion im Payload-Admin

Live Preview öffnet sich initial automatisch; die spätere gespeicherte Nutzerwahl hat nach Payloads API Vorrang. Massenlöschen ist für Pages, Posts, Projekte, Clients und Medien auf Collection-Ebene deaktiviert. Das schützt auch den Bulk-API-Aufruf; Einzel-Löschungen mit bestehenden Rechten bleiben möglich.

Ein zusätzliches Dashboard und Form-Dateianhänge haben im Projekt keinen dokumentierten fachlichen Bedarf und bleiben entsprechend dem optionalen TODO zurückgestellt. Für Attachments wären vorher erlaubte Typen, Größen, Nutzerzugriff und Aufbewahrung festzulegen.

Die vorhandenen Rechte wurden nicht durch neue Rollen erweitert. Clients erfordern inzwischen ebenso wie andere CMS-Inhalte Authentifizierung für Schreibzugriffe. DB-Lifecycle-Tests prüfen anonymes Ablehnen und authentifiziertes Erstellen. Preview-Browserabläufe mit gespeicherten Nutzerpräferenzen bleiben als redaktioneller Systemtest erforderlich.
