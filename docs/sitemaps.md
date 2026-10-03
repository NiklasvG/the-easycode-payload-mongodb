# Native Sitemaps und Robots

Vorher: next-sitemap erzeugte /sitemap.xml als Index sowie /robots.txt beim Postbuild; /pages-sitemap.xml und /posts-sitemap.xml wurden dynamisch erzeugt. Projekte fehlten; die Suche war fälschlich /search, die Listen auf 1000 Dokumente begrenzt.

Jetzt: natives sitemap.ts liefert unter derselben /sitemap.xml einen vollständigen URL-Satz für Seiten, Posts und Projekte. Der Index wird durch diese Gesamtdatei ersetzt. Die bisherigen Teil-URLs bleiben als XML-Kompatibilitätsrouten erhalten; /projects-sitemap.xml ergänzt Projekte. robots.ts verweist auf die Gesamtdatei. Staging sperrt weiterhin alles, zusätzlich bleibt X-Robots-Tag aus next.config aktiv.

Alle Datenquellen lesen veröffentlichte Dokumente mit overrideAccess:false und draft:false, paginieren und berücksichtigen verschachtelte Seitenpfade beziehungsweise Client-/Projektpfade. Cache-Schlüssel enthalten Quelle und kanonischen Ursprung; public-cms und source-sitemap verbinden sie mit den CMS-Hooks. Die Metadatenrouten sind dynamisch, sodass Docker-Builds weiterhin keine Datenbank benötigen.

Tests prüfen Paginierung, verschachtelte URLs, Projektzuordnung, originabhängige Schlüssel, XML-Escaping und Staging-Robots. next-sitemap und Postbuild-Schritt entfallen.
