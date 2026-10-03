# Lint- und Dependency-Ausnahmen

Die vier zuvor abgeschwächten Compiler-Korrektheitsregeln (set-state-in-effect, immutability, refs, static-components) sind wieder Fehler. Render-Mutationen in Block-Listen, State-Kopien in Header und Filtern, verschachtelte Card-Refs und dynamische Icon-Komponenten wurden bereinigt. Consent und Theme verwenden externe Stores mit stabilen Snapshots. Consent-UI-Regressionen prüfen Zustimmung, Widerruf und blockierte Storage-Schreibzugriffe.

Nach Bereinigung: ESLint 0 Fehler, 32 verbleibende Warnungen (überwiegend any-Typen in Form-/Such-/Chat-Code); vorher 59 Warnungen im Package-Audit. Weitere Typbereinigung bleibt separat offen.

Erneuter pnpm audit am 3. Oktober 2026: 1 hoher braces-Befund, keine kritischen/mittleren/niedrigen Befunde; patched_versions weiterhin <0.0.0. Ohne Upstream-Fix keine pauschale Versionserzwingung.

Payload 3.90.2 deklariert undici 7.29.0 und der Mailadapter Nodemailer ^9.1.1. Die bestehenden Overrides bleiben deshalb erhalten. DOMPurify im Monaco-Abhängigkeitspfad ebenfalls erst mit einem geprüften Upstream-Update entfernen. GraphQL 16, TypeScript 6.0, ESLint 9 und Node-24-Typen bleiben entsprechend den vorhandenen Peer-/Runtime-Anforderungen bestehen.
