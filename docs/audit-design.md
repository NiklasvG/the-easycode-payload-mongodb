# Design und Komponenten – Prüfung und Umsetzung

Geprüfter Bereich: Service-/Projektkarten, Beitragskarten, Projektfilter, Services- und ProjectsGrid-Blöcke, FAQ, Kontaktintro/-links und Footer. Grundlagen: `emil-design-eng`, `apple-design`, geltende AGENTS.md sowie die lokal installierte Next.js-Dokumentation zu Link und Accessibility.

## Befunde und umgesetzte Entscheidungen

| Vorher | Nachher | Warum |
| --- | --- | --- |
| ProjectsGrid ersetzte die CMS-Überschrift durch einen festen Text. | Die tatsächlich gepflegte Überschrift wird ausgegeben; die bisherige Akzentphrase bleibt erhalten, soweit sie darin vorkommt. | CMS-Editierbarkeit und fachliche Inhalte gelten auch im Frontend. |
| Fehlende/unaufgelöste Kundenbeziehungen erzeugten falsche Projektpfade. | Gemeinsamer `getProjectPath` bestimmt gültige Links; unvollständige Karten behalten ihren Inhalt ohne defektes Ziel. | Keine Navigation zu IDs, `undefined` oder nicht existierenden Detailseiten. |
| Karten mit Icons versteckten Beschreibungen und Tags auf kleinen Bildschirmen. | Alle fachlichen Karteninhalte bleiben auf Mobilgeräten vorhanden, mit vertikaler Gliederung. | Die mobile Nutzung darf wesentliche Inhalte nicht verlieren. |
| Kartentitel waren Absätze und konnten bei leerem Linklabel verschwinden. | H3-Überschriften, sinnvolle Label-Fallbacks und ein stets sichtbarer Linkpfeil. | Bessere Dokumentgliederung, Tastaturorientierung und Erkennbarkeit. |
| Bildhinweise wurden im Bild abgeschnitten und waren nicht mit ihrem Auslöser verknüpft. | Portal am Viewport, `aria-describedby`, Fokus-/Touch-Bedienung und Escape. | Zugängliche Hinweise bei schmalen Karten und per Tastatur. |
| Beitragskarten verwendeten zusätzliche Maus-JavaScript-Handler und konnten `/undefined/undefined` erzeugen. | Native, flächige Links bei gültigem Slug; fehlende Medien und Ziele bleiben ohne englische Platzhalter. | Verlässliche Linkbedienung einschließlich Browser-Kontextmenü. |
| Services-/Projekt-CTAs enthielten einen Button in einem Link. | Ein CMSLink mit passender Buttondarstellung. | Ein interaktives Ziel und sauberer Tastaturfokus. |
| Projektfilter animierten ganze Kartenlisten einschließlich ihrer Anordnung. | Sofortige Filterung, 44px-Ziele, beschriftete Gruppe und Statusansage. | Häufige Filteraktionen bleiben direkt und ohne Bewegungsbarriere. |
| Starre sechs Footer-Spalten machten Kontaktdaten schmal; Sociallinks waren nur mit `title` beschriftet. | Flexible Spalten, umbrechende E-Mail-Adressen, sichtbare Fokus-Rückmeldung, größere Ziele und zugängliche Sociallink-Namen. | Robuste Darstellung bei langen Inhalten und Zoom. |
| Kontaktintro schob Inhalte 700ms ins Bild; FAQ-Pfeile animierten jede Tastaturbetätigung. | Direkte Darstellung und unmittelbare Statusänderung. | Keine unnötige Verzögerung oder Bewegung in Kontakt-/FAQ-Nutzerwegen. |

## Verifikation

- Alle neun zugewiesenen Quelldateien wurden im Code geprüft und mit ESLint ohne Meldungen geprüft.
- Fünf gezielte Integrationstests in `tests/int/design-components.int.spec.ts` bestanden: Linklabel/Fallback, Bildhinweis/Fokus/Escape, fehlender Beitragsslug, Filter/Status/Fallback nach Inhaltsänderung und CMS-Überschrift/fehlende Kundenbeziehung.
- Es wurden keine CMS-Schemata, Inhalte, Datenbankeinträge oder Abhängigkeiten verändert.
- Browser-, Viewport-, Zoom- und Gesamt-Build-Prüfung erfolgen zentral durch den Hauptagenten. Die hier aufgeführten Integrationstests verwenden JSDOM und beanspruchen keine visuelle Layout- oder echte Gerätetestabdeckung.

## Abgrenzung

Globale Farben, Typografie, Fokus-/Hover-Regeln, Headernavigation, Formulare und Motion-Infrastruktur werden von den zuständigen anderen Agenten geprüft. `service-card--linked` kennzeichnet tatsächlich verlinkte Servicekarten für die zentrale Hover-Regel. Die vorhandene dunkle Marke mit türkisfarbenem Akzent bleibt erhalten; dekorative Effekte wurden nicht ergänzt.

## Unabhängige Gegenprüfung und zusätzliche Abdeckung

Read-only-Codeprüfung der Änderungen anderer Agenten: Header/Navigation einschließlich nativem Dialog, CMSLink/Resolver, Button, Frontend-Layout, globale Fokus-/Viewport-/Hover-/Reduced-Motion-Regeln, TextAnimation-Hero, AnimatedText/RotatingText, Logo-/Zitat-/Timeline-Slider, LottiePlayer, FormBlock, Chat und Cookie-Einstellungen. Keine sichere neue Funktionsregression in diesen Änderungen festgestellt. Browserprüfung verbleibt zentral.

Zusätzlich im Code geprüft: Content, Banner, ArchiveBlock, CollectionArchive, MediaBlock, SplitLayout einschließlich erlaubter verschachtelter Blöcke, InfoTwoColumn, ProjectCta, CallToAction, RelatedPosts, Codeblock, CollaborationBlock, PostHero, Projekt-/Postdetailrouten, globale Fehlerseite und 404.

| Vorher | Nachher | Warum |
| --- | --- | --- |
| RichText-Links ignorierten die vollständigen Breadcrumb-Pfade verschachtelter CMS-Seiten; unaufgelöste Beziehungen warfen einen Fehler. | Nach Scope-Abgleich ebenfalls behoben: gemeinsamer CMS-Resolver für Pages/Posts/Home, formatierter Text ohne Link bei fehlenden oder unaufgelösten Beziehungen. | Verhindert fehlerhafte Inhaltslinks und Seitenabstürze in allen RichText-Verbrauchern. |

Drei zusätzliche Tests in `tests/int/richtext-links.int.spec.ts` bestanden: verschachtelte Seiten/Home/Posts, fehlende/null/unaufgelöste Beziehungen mit erhaltenem formatiertem Text und externe Links mit unveränderten sicheren New-Tab-Attributen. ESLint für RichText und die neue Testdatei ebenfalls ohne Meldung.

An den Hauptagenten gemeldet: unveränderte Projekt-Detailroute mit Weiß auf türkisfarbenem Demo-CTA (Kontrast zentral messen) und langen Bild-Hoverzooms ohne Hover-Gate. Keine weiteren Änderungen außerhalb der abgesprochenen Dateien vorgenommen.
