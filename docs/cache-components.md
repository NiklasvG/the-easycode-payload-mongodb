# CMS-Prerendering und Aktualisierung

Cache Components und Partial Prefetching sind deaktiviert. Das öffentliche Frontend verwendet statische Generierung mit ISR. Der Build liest veröffentlichte Inhalte aus MongoDB und rendert die Startseite sowie die von generateStaticParams ermittelten CMS-, Post- und Projektseiten einschließlich Navigation, Inhaltsblöcken und Footer. Es gibt keine seitenweiten Ladeplatzhalter. MongoDB muss während des Builds erreichbar sein; Docker erhält MONGODB_URI und PAYLOAD_SECRET als BuildKit-Secrets. Schriftdateien liegen lokal vor.

Öffentliche Queries verwenden overrideAccess:false und veröffentlichte Inhalte. Entwürfe verlangen bei jedem Abruf eine aktuelle Anmeldung. Draft Mode umgeht das öffentliche Prerendering; Admin, Preview und Suche bleiben requestbezogen. Neue Slugs werden beim ersten Aufruf ohne Ladehülle gerendert und anschließend gecacht.

Die bestehenden unstable_cache-Hilfen bleiben erhalten. CMS-Hooks invalidieren geänderte und bisherige Pfade sowie das gemeinsame Layout, damit eingebettete Projekte, Beiträge und Seitenlinks ebenfalls aktualisiert werden. Header-/Footer-Änderungen invalidieren zusätzlich alle öffentlichen Seiten. revalidate=3600 im Frontend-Layout ergänzt die ereignisgesteuerte Invalidierung durch eine stündliche ISR-Prüfung bei Seitenaufrufen.

experiments/public-project-cache.ts bleibt ein nicht importiertes Experiment. Der frühere use-cache-Prototyp lieferte unter Turbopack trotz Invalidierung veraltete Projekttitel; eine spätere Migration verlangt zuerst einen reproduzierten und behobenen Invalidierungsfall unter beiden Bundlern.
