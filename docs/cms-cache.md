# Öffentliche CMS-Caches

| Quelle | Schlüssel | Tags | Zugriff |
| --- | --- | --- | --- |
| Global | globals, slug, depth | public-cms, global_slug | overrideAccess:false, draft:false |
| Dokument | documents, collection, slug, depth | public-cms, collection_slug | nur pages/posts/projects; overrideAccess:false, draft:false |
| Redirects | redirects, depth | public-cms, redirects | overrideAccess:false |
| Sitemap | Quelle, kanonischer Ursprung | Quelle-sitemap, public-cms | published, draft:false, overrideAccess:false |

Keine Helper akzeptieren Nutzer oder Request-Kontext. Preview liest außerhalb dieser Caches direkt mit Draft Mode. Lokalisierung ist derzeit nicht aktiviert; bei Einführung muss locale Bestandteil aller Schlüssel werden.

Der Regressionstest simuliert den Cache nach expliziten Schlüsseln und prüft Beziehungstiefen und Query-Zugriff. Er ersetzt keine Prüfung des persistenten Next-Caches im laufenden Server.
