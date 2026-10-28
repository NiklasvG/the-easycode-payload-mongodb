# Codequalität und Dependency-Ausnahmen

ESLint: 0 Fehler und 0 Warnungen. Formulare, Suchresultate, Projektformatierung und dynamische Blocks verwenden passende Payload-/Plugin-Typen. Kontrollierte Union-Grenzen haben begründete ts-expect-error-Ausnahmen. Fehleranfällige Effects, Render-Mutationen, Ref-Nutzung und State-Kopien wurden bereinigt; Compiler-Korrektheitsregeln bleiben als Fehler aktiviert.

Die Suche übernimmt bestehende URL-Parameter, kodiert Sonderzeichen mit URLSearchParams, respektiert externe Query-Änderungen und begrenzt Eingaben. Formularfelder werden nur für unterstützte Typen gerendert; Textarea, Checkbox, Pflichtfelder und serverseitige Prüfung sind konsistent. Projektlabel und Datumsdarstellung sind zentral, UTC-basiert und tolerieren ungültige Daten.

Integrationstests verwenden für reine Hilfen die Node-Umgebung und maximal zwei Worker, damit parallele Browser-/Docker-Prüfungen den Datenbankstart nicht überlasten. Alle 58 Integrationstests bestehen.

Der zuvor dokumentierte hohe braces-Auditbefund hat weiterhin keinen freigegebenen Upstream-Fix. Overrides für DOMPurify, Undici und Nodemailer bleiben begründet; keine ungeprüften Peer-Upgrades. GraphQL 16, TypeScript 6, ESLint 9 und Node-24-Typen bleiben mit dem vorhandenen Stack abgestimmt. Der React Compiler wurde gemessen, ohne belastbaren Vorteil, und bleibt deaktiviert.
