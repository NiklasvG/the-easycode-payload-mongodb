# Instant Navigation: Voraussetzungen und Umsetzungskandidat

Die installierte Next-16.3.8-Dokumentation verlangt Cache Components für `partialPrefetching`. Diese Migration ist noch nicht für Build ohne Datenbank, Admin und Preview validiert (siehe cache-components.md). Deshalb bleibt das Flag deaktiviert.

Erster Ablauf: /projekte → /projekte/[clientSlug]/[projectSlug]. Ein gemeinsamer Ladezustand ist in der Projektroute vorhanden; er enthält eine sichtbare Statusmeldung und stabile Platzhalter. Er verbessert Feedback auch im bestehenden Modell, garantiert aber keine Instant Navigation.

Nach Cache-Components-Adoption: öffentliche Projektdaten unter use cache, requestbezogene Vorschau außerhalb davon; Suspense für dynamische Details. Default-Link-Prefetch nutzen, keine pauschalen vollständigen Prefetches für sämtliche Karten. Production-Baseline mit Nexts versionspassendem instant()-Helfer, Navigation Inspector und Request-/DB-Zählung erfassen. Erst nach erfolgreichen Revalidierungstests partialPrefetching aktivieren und dieselben UI-/Lastprüfungen wiederholen.
