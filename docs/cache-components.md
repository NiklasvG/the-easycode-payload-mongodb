# Cache Components und Laufzeitgrenzen

Cache Components ist nach der installierten Next-16.3.8-Dokumentation aktiviert. Frontend, Metadaten, Payload-Admin und Preview haben explizite Suspense-/connection-Grenzen. Verbotene force-dynamic-Konfigurationen wurden entfernt. HTML-Grundgerüst und Ladezustände werden vorgerendert; CMS-Zugriffe starten erst zur Laufzeit. Docker kompiliert ohne Netzwerk und ohne erreichbare MongoDB. Schriftdateien liegen lokal vor.

Öffentliche Queries verwenden overrideAccess:false und veröffentlichte Inhalte. Entwürfe verlangen bei jedem Abruf eine aktuelle Anmeldung. Admin und Preview bleiben requestbezogen; kein öffentlicher Cache enthält private Daten. Der Admin nimmt mit instant=false nicht an der experimentellen Instant-Validierung teil, nachdem die installierte Next-Version dort einen internen Invariant-Fehler auslöste.

Die bestehenden geprüften unstable_cache-Hilfen bleiben erhalten. Der use-cache-Prototyp wurde tatsächlich in Projektdetails erprobt: Im Turbopack-Standalone-Container lieferte er nach Umbenennung trotz revalidateTag(public-cms, {expire:0}) und revalidatePath weiter den ursprünglichen Titel. Der erweiterte Lifecycle-Test deckte das auf. Der Prototyp wurde deshalb aus dem produktiven Pfad entfernt. Projektdetails lesen wieder aktuelle Payload-Daten; Rücknahme, alte Slugs und Draft-Schutz bestehen den Systemtest.

experiments/public-project-cache.ts bleibt ein nicht importiertes Experiment. Eine spätere Migration verlangt zuerst einen reproduzierten/fixierten Invalidierungsfall unter beiden Bundlern; mehr TTL oder schwächere Tests würden den Fehler nicht lösen. Dafür sind keine fachlichen Angaben nötig. Cache Components selbst liefert bereits vorgerenderte Seitenhüllen und Streaming, ohne diesen Daten-Cache zu benötigen.
