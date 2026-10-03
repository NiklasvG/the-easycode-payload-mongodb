# Partial Prefetching und Instant Navigation

partialPrefetching und Cache Components sind aktiviert. Projekt-, Post-, CMS- und Suchseiten besitzen explizite Suspense-Grenzen mit passenden Ladezuständen. Navigation lädt die vorgerenderte Hülle; CMS-Inhalt folgt zur Laufzeit. Karten erhalten kein pauschales prefetch=true für vollständige dynamische Inhalte.

Das zur installierten Next-Version passende @next/playwright 16.3.8 prüft mit instant() sowohl direkten Projekteinstieg als auch Übersicht → Detail. Während dynamische Inhalte zurückgehalten werden, muss „Projekt wird geladen“ sichtbar sein; nach Freigabe erscheint der echte Titel. Beide Produktionsfälle bestehen. Der Test hat zuvor fehlende innere Suspense-Grenzen sichtbar gemacht.

NEXT_INSTANT_TEST=true exponiert Nexts interne Test-API ausschließlich für isolierte Testbuilds. Docker-Produktion setzt diese Variable nicht. Deshalb werden die zwei Instant-Testfälle dort übersprungen, alle übrigen Browserfälle laufen auch gegen das Standalone-Image. Admin ist von der experimentellen Instant-Validierung ausgenommen; Login und Veröffentlichung werden regulär geprüft.

Ein vollständiger Vergleich von Netzwerk- und Datenbanklast bei langen realen Projektlisten bleibt eine weitere Messaufgabe. Die aktuellen Tests belegen die sofortige Lade-UI und korrekte Inhalte, keine pauschale Einsparung bei jedem Prefetch.
