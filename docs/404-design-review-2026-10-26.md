# 404 Design Engineering – 26. Oktober 2026

## Umfang und Arbeitsstand

Ein Hauptagent und drei parallele Unteragenten haben Gestaltung/Marke, Routen/CMS und Barrierefreiheit/Mobile/Performance untersucht. Die Umsetzung bleibt auf die öffentliche 404, ihre Styles, einen belegten Header-Reflow-Fehler und Tests begrenzt. Die bereits umfangreichen lokalen Änderungen wurden erhalten. Kein Deployment, keine CMS-Mutation und keine echte Formular- oder Chatnachricht.

Gelesen: geltende AGENTS.md; lokale Skills `emil-design-eng`, `mobile-native`, `animate`, ergänzend `animation-performance`. Relevante Dokumentation und Implementierung der installierten Next-Version 16.3.8: `not-found`-Dateikonvention und Funktion, CSS Modules, Layout/Fehlerhierarchie, SSR-Fehler-Recovery. Keine neue Bibliothek oder experimentelle Routingoption.

## Umsetzung

| Before | After | Why |
| --- | --- | --- |
| Schlichter Textzustand ohne eigenes Markenmotiv | Große klare Überschrift, türkiser Punkt, eigene SVG-404 mit verdutzter Null | Verständlicher Fehlerzustand mit zurückhaltendem Humor und bestehender Markenpalette |
| Startbutton und einzelner Suchlink mit festem linken Abstand | Gemeinsame Aktionsgruppe, mobil gestapelt, ab ausreichend Platz nebeneinander | Umbruch ohne eingerückte Restzeile; mindestens 48px hohe Hauptaktionen |
| Kein direkter Hinweis für defekte Verweise | Kontaktlink „Sag mir Bescheid.“ | Erreichbare Hilfe ohne zusätzliche Navigationsebene |
| Keine eigene Illustration | Dekoratives Inline-SVG mit reserviertem Seitenverhältnis | Keine Bildanfrage, kein Canvas, keine neue Client-Komponente |
| Potenzieller Bedarf für Lottie/Three/GSAP | Einmalige CSS-Bewegung über 1,8s, nur `transform`, danach statisch | Seltene Fehlerseite darf kurz überraschen; keine dauerhafte Rechenlast oder Pause-Steuerung |
| Bewegung unabhängig von Systemeinstellung | Statische Illustration bei `prefers-reduced-motion` | Bewegungspräferenz respektieren |
| Header läuft bei 768px und 200% Root-Schrift über | Bestehende Headerzeile darf umbrechen | Bedienelemente bleiben erreichbar, ohne Schriftvergrößerung zu beschränken |

Markenfarben, Logo, Navigation, Footer, CMS-Schemata, veröffentlichte Inhalte und bestehende Redirect-/Preview-Logik bleiben erhalten. Die 404 war bereits eine statische Entwicklerkomponente ohne eigenes CMS-Schema; daran ändert sich nichts. Bestehende CMS-Editierbarkeit wird erhalten, keine zusätzliche redaktionelle Steuerung der 404 behauptet.

## Projektinventar und Abdeckung

Öffentliche Routentypen: `/` und CMS-Catchall `[...slug]`, `/suche`, `/posts/[slug]`, `/projekte/[clientSlug]/[projectSlug]`. Gemeinsamer Frontend-Rahmen: Header, Footer, Sprunglink und fokussierbarer Hauptinhalt, Cookie-Auswahl, Chat, Analytics und Previewbar. Gesonderte Admin-404 bleibt unverändert.

17 registrierte Layoutblöcke: Archive, Content, CTA, Form, Media, ClientsSlider, ClientQuotes, Services, ProjectsGrid, InfoTwoColumn, ProjectCta, FAQ, Collaboration, TextIconTimeline, SplitLayout, ContactIntro, ContactLinks. Dazu RichText mit Banner/Code/RelatedPosts; HighImpact-, MediumImpact-, LowImpact- und TextAnimation-Hero sowie PostHero und deaktivierter Hero. Inventur im Code; keine Behauptung einer Sichtprüfung sämtlicher denkbarer Blockkombinationen.

Technische Routen: Payload-Admin/REST/GraphQL/Playground, KI-Chat, Preview/Exit-Preview, robots, Hauptsitemap und drei Teilsitemaps, llms. Aktuelle öffentliche CMS-Inhalte werden über die bestehende API-Inventur erfasst; der Browserlauf besucht alle vorhandenen Seiten/Projekte/Beiträge bei 1440px und 320px. Die konkrete Liste und Überschriften stehen im zugehörigen Abdeckungsbeleg. Redaktionelle Schreibabläufe werden nicht ausgeführt.

404-Matrix bei 320px und 1440px:

- `/diese-seite-existiert-nicht-404-review`
- `/leistungen/404-review/unbekannt`
- `/posts/404-review-unbekannt`
- `/projekte/404-review/unbekannt`
- `/projekte/falscher-kunde/enterprise-dashboard-angular-extjs-fuer-bmw`

Geprüft werden HTTP404, noindex, genau eine Hauptüberschrift und ein Hauptinhalt, Linkgrößen, Dokumentüberlauf und JavaScript-Ausnahmen. Zusätzlich: 320/390/768/1920px mit 200% Schrift, Tastatur/Sprunglink, Start-/Suchnavigation, Ende der Animation, Reduced Motion und Layoutstabilität. Bestehende Tests prüfen außerdem mobile Navigation, Suchtreffer/Leerzustand, Projektfilter, Kontaktvalidierung sowie lokal simulierte Fehler-/Erfolgsantworten ohne Nachrichtversand. Technische Read-only-Prüfungen umfassen Sitemaps/robots, Chat-Verfügbarkeit, unberechtigten Previewzugriff und Admin-Loginansicht; GraphQL-Schreibabläufe und authentifizierte Redaktion bleiben ungeprüft.

## Konkrete Framework-Grenze: ohne JavaScript

Bei fehlenden dynamischen Inhalten erzeugt Next 16.3.8 hier einen HTTP404 mit leerem HTML-Body (`html#__next_error__`) und stellt die 404 erst über die im Browser ausgeführten Flight-Daten her. Ohne JavaScript bleibt die Seite deshalb leer. Dieser tatsächlich reproduzierte Fehler liegt im bestehenden SSR-Recoverypfad, nicht in der neuen Illustration.

Die installierte Implementierung `node_modules/next/dist/server/app-render/app-render.js`, insbesondere `getErrorRSCPayload()`, erzeugt ausdrücklich einen leeren Fehlerbody. Zusätzliche lokale `not-found`-Grenzen mit/ohne Layout haben das Verhalten im Entwicklungsserver nicht behoben; diese Diagnose-Dateien wurden wieder entfernt. Eine normale direkte Rückgabe der 404 verlöre HTTP404; `dynamicParams=false` würde künftig neu veröffentlichte CMS-Seiten bis zum nächsten Build sperren. Beide Änderungen wurden deshalb verworfen.

Der Test `known Next SSR limitation: 404 recovery without JavaScript` bleibt **ausdrücklich als erwarteter Fehlschlag** erhalten. Er prüft zuerst den echten HTTP404 und kennzeichnet erst danach die fehlende No-JS-Darstellung. Ein unerwartetes Bestehen macht eine spätere Framework-Korrektur sichtbar. Dieser Test ist kein Nachweis funktionierender No-JS-404. Eine Routing-Umgehung mit Ressourcenprüfung vor dem Rendern oder eine geeignete Framework-Korrektur bleibt separate technische Arbeit.

## Prüfverfahren und Grenzen

Start mit bestehender lokaler Snapshot-MongoDB (127.0.0.1:27018, Mailtransport JSON). Bestehender Entwicklungsserver auf Port3000 wird erhalten. Isolierter Build mit `NEXT_BUILD_DIR=.next/404-review`, Prüfung auf Port3002. `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test:int`, vollständige Playwright-Sammlung gegen die Produktionsversion. Die bestehenden Startwarnungen zum Standalone-Modus betreffen das Prüfverfahren; Deploymentkonfiguration wurde nicht verändert.

Die erste Komponentenprüfung scheiterte an nicht zugänglichen temporären Testdateien; erneute Ausführung mit passenden lokalen Prozessrechten erfolgreich. Ein Diagnose-Layout hinterließ eine automatisch erzeugte Typdatei; nur diese veraltete Datei wurde entfernt, danach erneut gebaut. Die erste Browserprüfung fand den Headerüberlauf und den beschriebenen No-JS-Fehler; zwei SVG-Testselektoren wurden auf die Illustration eingegrenzt, weil auch Buttonicons SVGs sind.

Finaler Stand:

- Produktionsbuild erfolgreich, 29 generierte Seiten, finale Compiler-Ausgabe ohne Warnung; vollständiger ESLint und Typprüfung erfolgreich.
- Integration: 135 bestanden, vier wegen fehlender isolierter Datenbank-/Mailpit-Umgebung übersprungen. Nach der Headeränderung zusätzlich acht betroffene Navigations-/Komponentenprüfungen bestanden.
- Vollständige Browsersammlung: 47 Tests, davon 31 regulär erfolgreich, ein ausdrücklich erwarteter No-JS-Fehlschlag und 15 bewusst übersprungen. Playwright fasst die 31 Erfolge plus erwarteten Fehlschlag als „32 passed“ zusammen; das ist ausdrücklich kein Nachweis einer funktionierenden JavaScript-freien 404. Keine unerwarteten Fehler im letzten Lauf.
- Aktuelle API-Inventur: zehn CMS-Seiten, fünf Projekte, keine Beiträge. 34 Route-/Viewport-Kombinationen bei 1440/320px einschließlich Suche und leerer Suche; alle HTTP200, je eine Hauptüberschrift, kein horizontaler Dokumentüberlauf und keine JavaScript-Ausnahmen. Siehe [vollständige Pfade und Überschriften](measurements/404-site-coverage-2026-10-26.json).
- Zusätzlich zehn 404-Route-/Viewport-Kombinationen mit echtem HTTP404 sowie gesonderte Reflow-, Tastatur- und Bewegungstests. Alle regulären neuen 404-Prüfungen erfolgreich. Visuell kontrolliert: bestehende und neue Fehlerseite im interaktiven Browser sowie finale Produktionsscreenshots bei 1440px und 320px.
- Lokales 404-Labor bei 390/1440px: CLS jeweils0, beobachteter LCP268/160ms und TTFB2,7/9,5ms. Ressourcenübertragung ca390/27kB; der zweite Lauf profitiert vom Browsercache. Diese Werte zeigen keine vergleichende Beschleunigung. Siehe [Messdaten](measurements/404-lab-2026-10-26.json).

Screenshots des letzten Laufs liegen unter dem ignorierten `test-results/not-found.e2e-all-missing--af721-e-404-on-mobile-and-desktop-chromium/` sowie dem Reflow-Testordner. Vom isolierten Build ergänzte Typkonfiguration wurde auf den vorgefundenen Entwicklungsstand zurückgesetzt. Keine Diagnose-Routen verbleiben im Quellcode.

Laborwerte sind lokale ungedrosselte Chromium-Beobachtungen, keine Live-Core-Web-Vitals und kein Lighthouse-Score. Kein physisches Smartphone, Safari-/Firefox-Lauf oder echter Screenreadertest. Mobile Layouts sind browseremuliert.
