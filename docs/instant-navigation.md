# Vollständige erste Seitenanzeige

Veröffentlichte CMS-, Post- und Projektseiten werden beim Build vollständig vorgerendert. Cache Components, Partial Prefetching und die seitenweiten Suspense-Ladeplatzhalter sind entfernt. Navigation erhält den fertigen Inhalt statt einer Ladehülle. Neue Seiten und Suchergebnisse werden serverseitig ohne Ladeplatzhalter gerendert.

tests/e2e/server-rendering.e2e.spec.ts ersetzt die bisherigen Instant-Tests, die ausdrücklich eine sichtbare Ladeanzeige verlangten. Die neuen Browserfälle deaktivieren JavaScript: Navigation, Hero, CMS-Blöcke und Footer müssen bereits auf der Startseite sichtbar sein. Ein verlinktes Projekt muss ebenfalls vollständig sichtbar sein. Hydration und HTML-Austauschskripte können fehlende Inhalte damit nicht nachträglich einblenden.

Die Browserfälle laufen gegen den Produktionsserver und das Standalone-Image; eine interne Next-Test-API ist nicht mehr erforderlich. Clientseitige Navigation, Veröffentlichung und Vorschau werden weiterhin von den Visitor- und CMS-Suiten geprüft.

Ein vollständiger Vergleich von Builddauer, Netzwerk- und Datenbanklast bei langen realen Projektlisten bleibt eine weitere Messaufgabe.
