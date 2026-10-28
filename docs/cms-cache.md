# Öffentliche CMS-Caches

| Quelle | Schlüssel | Tags | Zugriff |
| --- | --- | --- | --- |
| Global | globals, slug, depth | public-cms, global_slug | overrideAccess:false, draft:false |
| Dokument | documents, collection, slug, depth | public-cms, collection_slug | nur pages/posts/projects; overrideAccess:false, draft:false |
| Redirects | redirects, depth | public-cms, redirects | overrideAccess:false |
| Sitemap | Quelle, kanonischer Ursprung | Quelle-sitemap, public-cms | published, draft:false, overrideAccess:false |

Keine Helper akzeptieren Nutzer oder Request-Kontext. Preview liest außerhalb dieser Caches direkt mit Draft Mode. Lokalisierung ist derzeit nicht aktiviert; bei Einführung muss locale Bestandteil aller Schlüssel werden.

Der Regressionstest simuliert den Cache nach expliziten Schlüsseln und prüft Beziehungstiefen und Query-Zugriff. Er ersetzt keine Prüfung des persistenten Next-Caches im laufenden Server.

## Invalidierungsmatrix

| Änderung | Hook | Tags / Seiten |
| --- | --- | --- |
| Seiten erstellen/veröffentlichen/bearbeiten/zurückziehen/löschen | revalidatePage / revalidateDelete | public-cms, pages-sitemap; aktuelle und vorher veröffentlichte URL |
| Posts: dieselben Aktionen | revalidatePost / revalidateDelete | public-cms, posts-sitemap; aktuelle und vorher veröffentlichte URL |
| Projekte: dieselben Aktionen, Client-Wechsel | revalidateProject / revalidateDelete | public-cms, projects-sitemap; alte/neue Detail-URL, /projekte |
| Client / Media ändern oder löschen | revalidateRelatedContent | public-cms; gesamtes Frontend-Layout einschließlich verknüpfter Globals |
| Weiterleitung ändern/löschen | revalidateRedirects | redirects |
| Header / Footer speichern | jeweiliger Global-Hook | global_header / global_footer |

Alle Tags werden sofort mit `{expire:0}` invalidiert. `context.disableRevalidate` unterdrückt die Hooks beim isolierten Import. Beziehungsänderungen invalidieren bewusst konservativ das gesamte Layout, weil Medien in beliebigen Blocks liegen können. Eine gezielte Abhängigkeitsauflösung ist eine spätere Optimierung.

Hook-Tests decken URL-Wechsel, Zurückziehen, Löschen, Erstellen ohne previousDoc und Beziehungsmutationen ab. Die echte Kombination CMS-Mutation → HTTP-Abruf mit Nexts persistentem Cache und Live Preview bleibt zusätzlich als Systemtest erforderlich.
