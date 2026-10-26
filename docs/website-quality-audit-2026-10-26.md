# Website-Überarbeitung, 26.10.2026

## Auftrag und erhaltene Grundlagen

Integrierte Arbeit des Hauptagenten mit drei abgegrenzten Unteragenten: Design/Komponenten, Bewegung/Performance sowie Mobile/Barrierefreiheit/Grenzfälle. Anschließend unabhängige Gegenprüfungen. Bestehende unversionierte `.agents/`-Sammlung erhalten. Keine Veröffentlichung, keine produktiven Inhaltsänderungen, keine neuen Abhängigkeiten, keine CMS-Schemaänderungen. Payload-Blöcke, Beziehungen, redaktionelle Texte und bestehende URLs bleiben maßgeblich.

Marke/Zielgruppe: The-EasyCode, freiberufliche Webentwicklung aus Dresden für KMUs und Agenturen. Dunkle Flächen, türkisfarbene Akzente, bestehendes Logo und Inhalte. Zentrale Wege: Leistung verstehen → Referenz ansehen → Kontakt; Freelancer-Kompetenz prüfen; Inhalte suchen; Datenschutz-/Cookieentscheidung treffen. Verbesserungsrichtung: klare Hierarchie, verlässliche Ziele, lesbare Karten, unmittelbare Rückmeldung und zurückhaltende Bewegung.

## Wichtigste Änderungen

| Vorher | Nachher | Zweck |
| --- | --- | --- |
| Mobile Links mit falscher Großschreibung/vereinfachten CMS-Pfaden, Buttons innerhalb Links | Gemeinsamer CMS-Pfadresolver, korrekte verschachtelte Ziele, ein Bedienelement je Aktion | Navigation und Tastaturbedienung |
| Vollbildmenü ohne Escape/Fokusrückkehr | Nativer Dialog, Fokusbegrenzung, Escape, Rücksprung, Scroll-Cleanup bei Navigation/Breakpoint | Vorhersagbare mobile Bedienung |
| Kein Sprunglink, Seite ohne Theme-Script zunächst unsichtbar | Sprunglink, fokussierbarer Hauptinhalt, sichtbares HTML ohne JavaScript | Zugänglichkeit und ausfallsichere Inhalte |
| Mobile Kartenbeschreibungen versteckt, fehlende Beziehungen erzeugen defekte Links | Inhalte sichtbar, semantische Kartentitel, unverlinkter Fallback, lange Inhalte umbrechen | Lesbarkeit und Grenzfälle |
| Projektüberschrift hartcodiert | Überschrift aus dem CMS wieder wirksam | Redaktionelle Kontrolle |
| RichText ignoriert verschachtelte Pfade und wirft bei fehlender Beziehung | Gemeinsame Zielauflösung, lesbarer Textfallback | Interne Verweise und Stabilität |
| 12 Formularspalten mit zu vielen Gaps auf kleinen Geräten | Wirklich einspaltig mobil, CMS-Spalten ab sm | Kein abgeschnittener Formularinhalt |
| Fehler ohne Feldzuordnung, unklare Lade-/Fehlerzustände | ARIA-Verknüpfungen, deutsche Meldungen, Statusfokus, Doppelsendeschutz | Verlässliche Formularbedienung |
| Chat-Streaming scrollt potenziell die Seite, Cookie-Panel passt nicht in kurze Ansichten | Scrollen im Chat, Leseposition erhalten, Escape/Fokus; vollständig scrollbares Cookie-Panel | Mobile Nutzung |
| Verzögerte/teure Deko-Bewegung und Dauerloops | Dekorative Parallax/Zooms entfernt; kontrollierbare Text-/Logobewegung, offscreen/hidden Pause, reduzierte Bewegung | Ruhe und weniger unnötige Arbeit |
| Video-Autoplay ohne Pause, PDFs als Bild gerendert | Native Videosteuerung ohne Autoplay, PDF-Download, Bildfallback ohne Dimensionen | CMS-Medien robust ausgeben |
| Wenige sichtbare Suchtreffer ohne aktive Submit-Aktion; englische 404 | Alle aktuell vorhandenen Suchinhalte, Suchknopf/Ergebnisstatus/Leerzustand, deutsche 404 und Fehlerseiten | Erreichbare Inhalte und Wiederaufnahme |
| Weiß auf Türkis bei Projekt-Demo-CTA | Dunkle Akzent-Vordergrundfarbe | Kontrast |

## Bestandsaufnahme und Abdeckung

Veröffentlichte lokale CMS-Kopie: zehn Seiten, fünf Projekte, keine Beiträge. Alle zehn CMS-Seiten und fünf Projektseiten werden im Browser auf Desktop und schmalem Mobilviewport geprüft. Zusätzlich Suche mit/ohne Treffer und Sonderzeichen, `/home`-Weiterleitung und unbekannter Pfad/404. Weitere repräsentative Ansichten: 390, 768, 1024 und 1920 Pixel, vergrößerte Schrift. Browseremulation ist kein Gerätetest.

CMS-Seiten: `/`, `/leistungen`, `/leistungen/web-entwicklung`, `/leistungen/dev-ops`, `/projekte`, `/freelancer`, `/kontakt`, `/impressum`, `/datenschutz`, `/credits`.

Projektpfade:

- `/projekte/queo/enterprise-dashboard-angular-extjs-fuer-bmw`
- `/projekte/queo/mes-dashboard-zur-steuerung-von-reparaturprozessen`
- `/projekte/colpari/moderne-unternehmenswebseite-fuer-b2b-kunden`
- `/projekte/destillerie-schneider/moderner-e-commerce-fuer-hochwertige-spirituosen`
- `/projekte/wallner-bau-und-garten/moderne-handwerker-webseite-fuer-wallner-bau--garten`

Codeprüfung aller 17 registrierten Layoutblöcke: Archive, Content, CTA, Form, Media, ClientsSlider, ClientQuotes, Services, ProjectsGrid, InfoTwoColumn, ProjectCta, FAQ, Collaboration, TextIconTimeline, SplitLayout, ContactIntro, ContactLinks. Zusätzlich RichText-Banner/Code/RelatedPosts, vier Heroarten plus PostHero, Header/Footer, Suche, Karten, Medien, Fehlerzustände, Metadaten, Redirects und gemeinsame UI-Primitives. Die vorhandenen Seiten decken nicht jede mögliche CMS-Konfiguration ab; leere/unvollständige Beziehungen, Medien, Textlängen, Formulardaten und Hero-Phrasen sind zusätzlich gezielt getestet.

Technische Routentypen: CMS-Catchall und Projektdetails, Beitragsdetails, Payload-Admin und REST/GraphQL, KI-Chat, Preview/Exit-Preview, robots, Sitemap und drei Teilsitemaps, llms. Admin-Schreibabläufe/Preview mit Editorzugang werden nicht durch produktive Änderungen getestet; Datenbankabhängige Mutationstests bleiben ohne isolierte Seed-Datenbank deaktiviert.

## Skills und Bibliotheksentscheidung

| Skill | Einsatz / Ergebnis |
| --- | --- |
| emil-design-eng | Hierarchie, Typografie, Karten, Footer, Rückmeldung; Vorher-/Nachher-Reviews |
| apple-design | Klarheit, unmittelbare Reaktion, Fokus und zurückhaltende Gestaltung innerhalb der Marke |
| mobile-native | Viewports, Safe Areas, Touch, Tastatur, Scrollen und Schriftvergrößerung |
| break-ui | Demo/Worst/Empty/One an echtem FormBlock; lange Labels/E-Mail, 4000 Zeichen, CJK/Emoji, 25/75%-Spalten; fehlende Beziehungen und Medien |
| improve-animations | Read-only Audit und konkrete Pläne vor separater Umsetzung |
| find-animation-opportunities | Pause-/Statusfeedback gewählt; dekorative Reveals, Orbit/Parallax und Hoververgrößerung verworfen |
| animation-vocabulary | Crossfade, Marquee, Parallax und Reduced Motion präzise zugeordnet |
| animate | Ausgewählte 200/250ms-Übergänge und steuerbare Bewegung nach Analyse umgesetzt |
| animation-performance | Offscreen-/Tab-Pausen, weniger Paintfilter/Layouts, kein seitenweises Streaming-Scrollen |
| review-animations | Strenger abschließender Codecheck und unabhängige Gegenprüfung |
| pick-ui-library | Vorhandene Radix-Primitives, Motion, Splide, clsx/cva beibehalten. Base UI als allgemeine Alternative bewertet, kein Wechsel gerechtfertigt. Nativer Dialog deckt mobile Navigation ohne neue Bibliothek ab. |
| prototype | Drei isolierte Navigationsrichtungen: Klar (geordnete Liste), Editorial (große nummerierte Typografie), Seitenpanel (kompakte Karten). Alle im Browser verglichen. Nach ausdrücklicher Auswahlvollmacht „Klar“ integriert; temporäre Oberfläche entfernt. |
| ask-sonner | Anwendungsvoraussetzung geprüft: kein Sonner im Projekt und kein fachlicher Bedarf für Toasts. Bestehende Inline-Rückmeldungen verbessert, keine Toastbibliothek eingeführt. |
| animate-expo / write-swift | Entfallen: kein Expo-, React-Native- oder Swift-Code im Projekt. |

Relevante Next-Dokumentation aus der installierten Version 16.3.8 gelesen: Layouts/Pages, Accessibility, Link, Image, Error/Global Error und Viewport; Unteragenten zusätzlich Server-/Client-Grenzen. Die neue `retry`-Schnittstelle wird gemäß lokaler Dokumentation verwendet. Kein pauschaler Neuaufbau.

## Prüfprotokoll

- Lokaler Start mit der vorhandenen Snapshot-MongoDB; Mailtransport `json`. Keine echten Formnachrichten oder Chat-Provideranfragen versendet.
- Formularharness: alle vier Datensätze bei 320 und 1440 Pixeln; jeweils Formular-scrollWidth gleich clientWidth. Nach Header-/Logokorrektur auch 320 Pixel mit 200% Root-Schrift ohne Dokumentüberlauf. Requests an form-submissions blockiert. Screenshots unter ignoriertem `test-results/`; Harness danach vollständig entfernt.
- Navigation-Prototyp: alle drei Richtungen mobil im Browser verglichen; Markenpassung, Zielverständlichkeit und Platzbedarf bewertet. Gewählte Richtung ohne Dekoanimation integriert.
- Unabhängige Gegenprüfungen haben zusätzlich RichText-Pfade, Hero-Überschriftenname, Video/PDF, Projektkontrast und fehlende Bildmaße gefunden und abgesichert.
- Früher Entwicklungstest während Änderungen: sieben bestehende Browserchecks bestanden; drei neue Checks zeigten einen zwischenzeitlichen HTTP500 sowie Fokusprüfungen. Folgedurchlauf erfolgt mit stabilem Produktionsbuild; Fokusbegrenzung ergänzt, Sprunglink-Test von vorherigem Navigationsfokus unabhängig gemacht.
- Erste Buildprüfung scheiterte an veralteten automatisch generierten Prototyp-Typen. Ausschließlich generierte `.next/dev/types` bereinigt. Erneuter Build erfolgreich (29 erzeugte Seiten). Vollständiger ESLint erfolgreich. Integration: 135 bestanden, vier bewusst übersprungen.

### Finaler stabiler Gesamtdurchlauf

- **Build:** erfolgreich, 29 statische Seiten erzeugt; finale Compiler-Ausgabe ohne Warnung. **Typprüfung und vollständiger ESLint:** erfolgreich. **Integration:** 135 bestanden, vier bewusst übersprungen; nach letzter Such-/Typografieänderung zusätzlich sechs betroffene Assertions erfolgreich.
- **Gesamte Browser-Testsammlung:** 23 bestanden, 15 bewusst übersprungen (isolierter CMS-Seed, Mutationstests/Mailpit und expliziter Dev-HMR-Test fehlen im reinen Snapshot-Prüflauf). Keine übersprungenen Tests als bestanden gewertet.
- Ergänzende Prüfung der rückwärts gerichteten Shift+Tab-Schleife im Menü bestanden. Finale Formatprüfung aller bearbeiteten, manuell gepflegten Dateien und `git diff --check` erfolgreich; `next-env.d.ts` bleibt die von Next automatisch erzeugte Buildfassung und ist vom manuellen Formatcheck ausgenommen. Keine Test-/Prototypdatei unter der produktiven Routenstruktur verblieben.
- **34 Route-/Viewport-Kombinationen:** zehn CMS-Seiten, fünf Projekte und Suche/Leerzustand bei 1440 und 320 Pixeln. Alle HTTP200, genau eine Hauptüberschrift, keine verschachtelten interaktiven Elemente, kein horizontaler Dokumentüberlauf, keine JavaScript-Ausnahmen.
- Weitere repräsentative Prüfläufe bei 390/768/1024/1920 Pixeln; 320px mit 200% Schrift auf Start, Kontakt, Suche und Projekten ohne Überlauf. Suchfeld und Suchknopf sind auf schmalen Ansichten gestapelt; Hero-Typografie begrenzt übergroße Zeilenumbrüche.
- Mobile Navigation: Tab/Shift+Tab, Escape/Fokusrückkehr, Navigation, Scrollfreigabe und Wechsel zum Desktop-Breakpoint bestanden. Projektfilter einschließlich Kontrast und Wiederherstellung aller Karten bestanden. Chat-Verfügbarkeit/Einwilligungsoberfläche und Fallback mit lokalen Antworten geprüft; kein Providerkontakt.
- Kontaktformular im Browser: ungültige E-Mail wird lokal abgefangen, Testantwort503 behält alle Daten und fokussiert Fehler, erfolgreiche Wiederholung mit Testantwort200 zeigt Bestätigung. Requests vollständig im Browser beantwortet; keine Nachricht und keine Formularübermittlung in der Datenbank.
- Cookie-Einstellungen auf kurzem Mobilviewport mit großer Schrift erreichbar und scrollbar, Auswahl/Fokusrückkehr erfolgreich. SSR-/No-JavaScript-Tests für Start, FAQ und Projektinhalte bestanden. Mediengrößen bei mehreren Pixeldichten und Reduced-Motion-Verhalten bestanden.
- Öffentliche robots/Sitemap/Teilsitemaps/KI-Verfügbarkeitsroute geprüft; llms ist in dieser Staging-Konfiguration korrekt404. Preview ohne Berechtigung abgewiesen; Admin-Login dargestellt, keine Anmeldung/Änderung vorgenommen.
- Visuelle Gegenprüfung im Browser: Startseite, mobile Navigation, Kontakt, Leistungsseite und Projektdetail auf Desktop/Mobil; Karten/Footer/FAQ und weitere Seitentypen über gemeinsame Komponenten, vorhandene Seiten und Grenzfallfixtures geprüft. Eine vollständige manuelle Sichtprüfung jeder möglichen CMS-Blockkombination wird nicht behauptet.
- Ein alter `.next`-Daten-Cache enthielt Globals einer früheren Testdatenbank. Aktuelle MongoDB-Daten unverändert; vollständig frischer Build beseitigte die Abweichung. Neuer Browser-Regressionstest vergleicht gebaute Header-/Footer-Inhalte ausdrücklich mit den aktuellen öffentlichen CMS-Globals.
- Splide setzt zur Laufzeit `group` auf Slides. Die ursprünglich erwogene Listenstruktur erzeugte dadurch unzulässige li-Rollen; finale Slider verwenden neutrale Container und behalten zugänglich benannte Carousel-Gruppen. Gesamter Semantiktest grün.

**Performance-Labor, lokaler ungedrosselter Chromium:** Start, Projekte und ein Projektdetail bei390/1440px; sechs Läufe. CLS jeweils0; beobachteter LCP56–136ms, TTFB2,3–4,7ms. Reihenfolge und Browsercache beeinflussen Transfer-/Ladezeiten. Dies sind lokale Laborwerte, keine Live-Core-Web-Vitals, kein Lighthouse-Score und kein Vorher-/Nachher-Geschwindigkeitsnachweis. Der funktionale Test namens `lighthouse.e2e.spec.ts` wird ausdrücklich nicht als Lighthouse-Messung ausgegeben.

Maschinenlesbare Belege: [Abdeckung](measurements/website-coverage-2026-10-26.json), [Laborwerte](measurements/website-lab-2026-10-26.json). Repräsentative Screenshots des letzten Browserlaufs liegen im ignorierten `test-results/`.

## Grenzen

Kein physisches Smartphone, Safari-/Firefox-Lauf oder echter Screenreaderlauf; Chromium-Desktop und Viewportemulation sowie Code-/Semantikprüfung. Keine veröffentlichten Beiträge oder Videoinhalte in der lokalen Kopie; diese Renderingpfade werden mit isolierten Komponententests geprüft. Keine erfundenen Untertitel/Transkripte; redaktionelle Videoalternativen müssen bei künftigem Videoeinsatz geprüft werden. Mehrere Testimonials sind im Snapshot nicht vorhanden (ein Zitat); redundante Navigation entfällt bei einem Eintrag. Keine Live-Performance-/Felddaten oder belastbare Vorher-/Nachher-Geschwindigkeitsmessung. Keine Veröffentlichung und kein Deployment.

Vorbestehende Startkonfiguration: `pnpm start` bedient die lokale Prüfung, Next weist dabei auf den konfigurierten Standalone-Modus hin. Der vorhandene Deploymentweg ist hiervon getrennt; keine Änderung am Hosting und kein Deployment vorgenommen.

Detailnotizen: [Design](audit-design.md), [Mobile](audit-mobile.md), [Motion](audit-motion.md).

## Nachtrag: Gestaltungsfeedback zur Navigation und Akzentflächen

Nach Vergleich der vier vom Nutzer gelieferten Alt-/Neu-Screenshots angepasst:

| Bisheriger Auditstand | Nach Nutzerfeedback | Begründung |
| --- | --- | --- |
| Dauerhaft ausgeschriebener Pausenknopf | Zwischenstand: sichtbarer 44px Pause-/Play-Knopf; Beschriftung nur bei Fokus oder Maus-Hover | Durch das nachfolgende, präzisierte Nutzerfeedback ersetzt; endgültiges Verhalten siehe unten. |
| Zentrierte, kleinere Desktoplinks | Wieder direkt neben dem Logo, bis19,2px Schrift; Suche mit20px Seitenpadding | Bevorzugte Markendarstellung des Nutzers |
| Mobil: CTA/Socials am unteren Viewportrand, voller Button, kleine16px Schließen-Grafik | Unterer Bereich direkt nach der Linkliste, türkiser Einstieg, kompakter Kontaktbutton und freie weiße Social-Icons; Schließen24px | Kombination des bevorzugten neuen oberen und alten unteren Menübereichs |
| Dunkle Icons/Texte auf hellem Türkis | Weiße dekorative Pfeile auf Markenakzent; weiße Beschriftung auf vorhandenem dunkleren Akzent `#008085` | Weiß auf dem hellen Markenakzent `#00adb2` hat nur2,76:1; der dunklere Textbutton-Hintergrund erreicht4,74:1. Kein globales Abdunkeln der Markenfarbe. |

Geprüft: tatsächliche Desktopmaße bei1920px, mobiles Menü bei420px, Tastaturbeschriftung sichtbar/verborgen, reduzierte Bewegung, rechnerischer und im Browser gemessener Weiß-Türkis-Kontrast4,744:1 am Kontaktformular. Build, Typprüfung, vollständiger ESLint und25 betroffene Integrationstests erfolgreich. Erneuter vollständiger Browserlauf23 bestanden/15 bewusst übersprungen, einschließlich34 Route-/Viewport-Kombinationen und200%-Schrift. Keine Nachricht versendet, keine Veröffentlichung.

Grundlagen: [W3C Pause/Stop/Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide), [Textkontrast](https://www.w3.org/TR/WCAG22/#contrast-minimum), [dekorative/inhaltliche Icons](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Nachtrag: Aktive Navigation, Textwechsel, Footer und Breadcrumbs

Die weiteren Alt-/Neu-Vergleiche und die präzisierte Vorgabe wurden integriert:

| Vorher | Nachher | Warum |
| --- | --- | --- |
| Türkise aktive Desktoplinks; fehlende Hover-Kontur | Helle aktive Pill mit dunkler Schrift und ursprünglicherem Padding; weiße Hover-Kontur mit 250ms Übergang | Gewünschte Markendarstellung und weichere direkte Rückmeldung |
| Pause-/Play-Symbol dauerhaft sichtbar | Gesamter Schalter im Normalzustand unsichtbar, sichtbar bei Hover der Überschrift oder Tastaturfokus; Touch blendet ihn durch Antippen der Überschrift ein | Präzisierter Nutzerwunsch, weiterhin bedienbar per Tastatur und Touch |
| Einfacher Textwechsel | Wieder sequenzielles Gleiten/Faden: 20px, je 400ms Aus-/Eintritt, bestehende Motion-Bibliothek, starke Ease-out-Kurve; 3s Wechselintervall | Frühere Bewegungswirkung wiederhergestellt; reine Transform-/Opacity-Animation |
| Unterlängen am Textausschnitt angeschnitten | Zusätzlicher Ausschnittraum von 0,2em oben/unten, ohne Verschieben der reservierten Layoutfläche | „Kundenprojekte“ inklusive j/p vollständig sichtbar |
| Kontaktbereich im Desktop-Footer in zweiter Zeile | Logo/About über zwei Rasterspalten, drei Linkgruppen und Kontakt rechts in einer Reihe | Desktop-Komposition der Vorlage wiederhergestellt |
| Sichtbare Breadcrumbs auf normalen CMS-Seiten | Nur noch in Projektdetails, direkt unter „Alle Projekte“, dezente Chevron-Trenner und umbruchfähiger aktueller Titel | Ruhigere normale Seiten, kontextbezogene Orientierung im Projekt |

CMS-Felder, URLs und strukturierte Breadcrumb-Daten bleiben erhalten. Keine neue Abhängigkeit. Die bereits angewendeten Skills `animate`, `animation-performance` und `review-animations` wurden für diese Nachbesserung erneut herangezogen. Motion-Review: **Approve** für den geprüften Code; 400ms je Phase entsprechen bewusst dem früheren Marketing-Textwechsel (rund 800ms insgesamt). Reduzierte Bewegung bleibt statisch, Hover ist auf feine Zeiger beschränkt. Keine behauptete FPS-/Echtgerätemessung.

Finale Prüfungen nach diesen Änderungen:

- Produktionsbuild erfolgreich, 29 generierte Seiten; vollständiger ESLint, Typprüfung und `git diff --check` erfolgreich.
- Integration: 135 bestanden, vier übersprungen. Gesamte Browsersammlung im Produktionsbuild: **27 bestanden, 15 übersprungen**; unveränderte Grenzen bei isolierter CMS-Testdatenbank, Mailpit und Dev-HMR.
- Vier neue Browser-Regressionstests prüfen tatsächliche Zwischenwerte von Transform/Opacity, Pause/Fokus/Touch, Ausschnittraum für Unterlängen, aktive/Hover-Navigation, einzeiligen Footer bei 1280/1920px und Breadcrumb-Position bei 320/1440px.
- Erneut sämtliche 34 Route-/Viewport-Kombinationen sowie repräsentative responsive Ansichten, 200%-Schrift, Tastaturnavigation, Reduced Motion, Suche und lokal beantwortete Formularzustände erfolgreich geprüft.
- Visuell abgenommen: „Kundenprojekte“ mit vollständigen Unterlängen, Desktop-Hover/aktiv, Desktop-Footer, Projekt-Breadcrumbs auf Desktop und bei 390px. Browseremulation, kein physisches Gerät. Zusätzliche unabhängige Code-Gegenprüfung ohne sichere Funktionsregression.
- Keine produktiven Daten geändert, keine Nachricht versendet, kein Deployment. Lokale Build-Version unter `http://localhost:3000/` verfügbar.

### Letzte Vorgabe: Breadcrumbs vollständig ausblenden

Auf ausdrücklichen Nutzerwunsch auch die sichtbaren Breadcrumbs der Projektdetails entfernt. Damit zeigt keine Seite mehr eine Breadcrumb-Navigation. „Alle Projekte“ bleibt als Rückweg erhalten; der Abstand zum Projektinhalt wurde angepasst. Die bestehenden Browserprüfungen erwarten nun auch bei Projektdetails keine Breadcrumbs. CMS-Pfadlogik und strukturierte Metadaten bleiben erhalten.

### Hinweis bei deaktiviertem KI-Chat

Die bisherige einfache Textfläche wurde als Karte im bestehenden dunklen Design mit türkisem Icon, Überschrift „Direkter Kontakt“, lesbarem Textabstand und E-Mail-Link gestaltet. Der Textknopf „Schließen“ wurde durch einen überlappenden runden X-Knopf oben rechts mit 44px Bedienfläche ersetzt. Erneuter Klick auf das Chat-Icon und Escape schließen den Hinweis ebenfalls; der Fokus kehrt zum Chat-Icon zurück. `aria-expanded` und `aria-controls` geben den Zustand wieder. Vorhandene Bibliotheken und die bestehenden Design-Skills verwendet; keine neuen Abhängigkeiten oder externe Anfragen an einen KI-Anbieter.

Nach beiden Nachbesserungen: Produktionsbuild inklusive Typprüfung erfolgreich, betroffene Dateien ohne Lintfehler, elf Chat-Komponententests bestanden. Elf betroffene Browserprüfungen bestanden, darunter Breadcrumb-Abwesenheit, SEO ohne JavaScript, erneutes Launcher-Klicken, X und Escape mit Fokusrückkehr. Hinweis zusätzlich bei 1440/390/320px geprüft und visuell bei 390px abgenommen; X jeweils 44px, Karte ohne horizontalen Überlauf. Keine echten Geräte oder externen Nachrichten.

### Letzte Vorgabe: Textwechsel-Schalter vollständig entfernen

Auf ausdrücklichen Nutzerwunsch den gesamten Start-/Stopp-Button einschließlich Status, Icons, Hover-/Fokus-/Touch-Handlern und zugehörigen Styles entfernt. Die vorherige bedarfsabhängige Anzeige entfällt vollständig. Automatischer gleitender Textwechsel und statische Darstellung bei reduzierter Bewegung bleiben erhalten. Betroffene Regressionstests entsprechend angepasst.

### Freelancer-Bild: lokale Medienreferenz repariert

Die veröffentlichte Seite im lokalen Snapshot verwies auf den nicht mehr vorhandenen Medieneintrag `693b05ca71dffe0bc3bfc6f1` (API404). Die neueste gespeicherte Seitenversion `693b0826eda4a44ade40f336` verweist bereits auf den vorhandenen Nachfolger `693b083aeda4a44ade40f347`, Datei `Niklas_Computer-1.png`. Ausschließlich `pages.hero.media` der lokalen Freelancer-Seite auf diese belegte Zuordnung korrigiert; keine produktiven Daten, Versionsdokumente oder übrigen Inhalte verändert. Vorherwert und Änderung unter `test-results/local-repairs/freelancer-media.json` gesichert.

Browserprüfung: Hero-Bild bei1440/390/320px sichtbar und vollständig geladen (naturalWidth jeweils größer0), korrekte quadratische Anzeige mit384/358/288px. Die Seiteninventur prüft künftig zusätzlich, dass gesetzte Hero-Medienreferenzen zu einem CMS-Dokument aufgelöst werden. Für andere Datenbanken ist die Medienzuordnung im jeweiligen CMS zu berichtigen; die lokale Datenkorrektur ist kein Bestandteil eines Code-Deployments.
