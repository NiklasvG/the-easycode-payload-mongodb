# Turbopack-Prüfung

Next 16.3.8 und Payload 3.90.2 wurden lokal mit `pnpm exec next build --turbopack` geprüft. Erster Lauf: Fehler im Import `~@payloadcms/ui/scss` der Admin-Leiste (vars-Stylesheet nicht auflösbar). Die Komponente benötigte daraus nur small-break = 768px. Lokales CSS ersetzt den kompletten Sass-Import.

Zweiter Lauf: erfolgreicher Produktionsbuild, Kompilierung 7,5 s, gesamte gemessene Wandzeit 26,06 s. Der vorherige Webpack-Build kompilierte in 39,2 s; das ist wegen unterschiedlicher Cachezustände kein kontrollierter Benchmark. Kein belastbarer Peak-Memory-Vergleich vorhanden.

Die eigene Webpack-extensionAlias-Konfiguration stammt aus dem Template und löst explizite .js-Imports auf TypeScript-Dateien. Die installierte Turbopack-Dokumentation bietet resolveExtensions und resolveAlias, keine identische extensionAlias-Option. Der erfolgreiche Build benötigt keine zusätzliche pauschale Alias-Übertragung; withPayload ergänzt seine eigene Turbopack-Konfiguration und deaktiviert problematischen Server Fast Refresh.

Entwicklung separat starten: `pnpm exec next dev --turbopack`. Admin-Login, Bearbeiten/Live Preview, CSS, Icons, Lottie und Hot Reload überprüfen. Docker mit Turbopack sowie kontrollierte kalte/warme Zeit- und Speichermessungen stehen noch aus. Bis dahin bleiben `pnpm dev` und `pnpm build` explizit Webpack; damit ist der Rückweg sofort verfügbar.
