# Turbopack: geprüft und optional verfügbar

Next 16.3.8/Payload 3.90.2: Produktionsbuild, Docker-Standalone sowie Entwicklung mit Admin-Login, allen 18 Lottie-Icons und CSS-Hot-Reload wurden geprüft. Der Hot-Reload-Test verändert CSS zweimal und prüft, dass Suchwert und DOM-Markierung erhalten bleiben. Der frühere Sass-Import der Admin-Leiste wurde durch benötigtes lokales CSS ersetzt. withPayload ergänzt die erforderliche Turbopack-Konfiguration; die Webpack-extensionAlias-Konfiguration benötigt keine pauschale Übertragung.

Kontrollierter Vergleich am 3. Oktober 2026: identisches Docker-build-input-Abbild, je drei sequenzielle Linux-Container ohne Netzwerk. Eigener Cache-Volume pro Bundler; erster Lauf leer, danach erhalten. Keine parallelen Compiler während dieser Messung. docker stats liefert alle zwei Sekunden Container-Speicherwerte, keine exakte Prozess-RSS-Spitze. OS-/Abhängigkeitscaches bleiben warm.

| Bundler | Lauf | Buildcache | Dauer s | maximal beobachtet GiB |
| --- | --- | --- | --- | --- |
| webpack | 1 | leer | 168.9 | 3.41 |
| webpack | 2 | erhalten | 169.8 | 3.31 |
| webpack | 3 | erhalten | 162.4 | 3.30 |
| turbopack | 1 | leer | 88.5 | 5.42 |
| turbopack | 2 | erhalten | 42.9 | 3.75 |
| turbopack | 3 | erhalten | 33.9 | 4.13 |

Turbopack baut deutlich schneller, braucht insbesondere beim ersten Lauf mehr Speicher. Ohne verifiziertes Speicherbudget des Deployment-Builders bleiben pnpm dev und pnpm build bei Webpack. pnpm dev:turbopack und pnpm build:turbopack stehen als geprüfte Optionen bereit. Docker: --build-arg NEXT_BUNDLER=turbopack; Rückweg --build-arg NEXT_BUNDLER=webpack. Ungültige Werte werden abgelehnt.

Reproduzieren: docker build --target build-input -t easycode-build-input .; danach node scripts/compare-builds.mjs. BUILD_BENCH_RUNS (2–10) und BUILD_BENCH_IMAGE sind optional. Das Script entfernt ausschließlich seine eigenen Container und Cache-Volumes. Ergebnisse/Logs liegen unter test-results. Ein schneller Image-Cache-Hit ist kein erneuter Compilerlauf.
