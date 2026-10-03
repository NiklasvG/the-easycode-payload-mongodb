# Cache Components: Migrationsprüfung

Prüfbasis ist die installierte Next-16.3.8-Dokumentation (`migrating-to-cache-components.md`), nicht ältere API-Konventionen. `withPayload` erkennt Cache Components und setzt `PAYLOAD_CACHE_COMPONENTS_ENABLED`.

Das aktuelle Frontend verwendet `dynamic='force-dynamic'` für den Build ohne MongoDB. Cache Components verbietet diese Segment-Konfiguration. Globales Einschalten ist daher eine Migration der Layouts, Metadaten, Draft-Mode-Zugriffe und dynamischen Parameter, keine isolierte Cache-Helper-Änderung. `instant=false` behebt weder diese Konfiguration noch synchrone IO beim Prerendering.

Öffentliche Queries: overrideAccess:false, draft:false, nur veröffentlichte Inhalte. Preview: requestbezogener Draft Mode und Authentifizierung, keine gemeinsamen Cache-Schlüssel. Admin ist ebenfalls requestbezogen. Der vorhandene Cache bleibt ein separat unterstützter Layer.

Der begrenzte Prototyp in `experiments/public-project-cache.ts` zeigt einen öffentlichen, parametrierten Payload-Cache mit expliziter Lebensdauer und Tags. Er wird absichtlich nicht in die laufenden Routen importiert: dafür sind zuerst Suspense-/connection-Grenzen und ein Build ohne erreichbare MongoDB zu prüfen. Danach CMS-Mutation → Serverabruf sowie Preview/Berechtigungen als Systemtests wiederholen. Erst nach nachgewiesenem Nutzen aktivieren; die Produktionskonfiguration bleibt bis dahin beim geprüften Cache-Modell.
