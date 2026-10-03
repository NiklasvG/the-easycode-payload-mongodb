# TODO: Sinnvolle Projektverbesserungen

Stand: 3. Oktober 2026, nach den lokalen Feature-Commits und Abschlussprüfungen.

Diese Liste dokumentiert Umsetzung und verbleibende Prüfungen. Abgehakte Punkte wurden lokal umgesetzt oder geprüft; offene Punkte sind ausdrücklich noch nicht abgeschlossen. Alle Feature-Commits bleiben lokal, ohne Push. Eine neue Framework-Funktion muss einen konkreten Nutzen nachweisen.

## Prioritäten und Reihenfolge

| Priorität | Bedeutung | Themen |
| --- | --- | --- |
| P1 | Zuerst: Korrektheit und verlässliche Prüfung | Cache-Schlüssel, CMS-Revalidierung, CI und kritische Abläufe |
| P2 | Danach: messbare Performance und Wartbarkeit | Messungen, Bilder, Turbopack, Cache Components, Navigation, Animationen |
| P3 | Optional, bei nachgewiesenem Nutzen | React Compiler, native Sitemaps, zusätzliche Admin-Funktionen |

Empfohlener Ablauf: P1 erledigen und Performance-Ausgangswerte erfassen. Danach Bilder optimieren, Turbopack separat prüfen und erst anschließend das Cache-Modell und die Navigation migrieren. Jeden Schritt einzeln vergleichen und deployen.

## P1 – Korrektheit und Qualitätssicherung

### 1. Cache-Schlüssel vollständig machen

**Ursprüngliche Ausgangslage:** `getCachedGlobal(slug, depth)` verwendet `depth` innerhalb einer Closure, führt es aber nicht in den expliziten Cache-Schlüsseln auf. Unterschiedliche Beziehungstiefen müssen eindeutig unterscheidbar sein.

- [x] In `src/utilities/getGlobals.ts` alle ergebnisrelevanten Parameter in den Cache-Schlüssel aufnehmen, insbesondere `depth`.
- [x] `getDocument.ts`, `getRedirects.ts` und Sitemap-Caches auf dieselbe Fehlerklasse prüfen; bei späterer Lokalisierung auch die Sprache berücksichtigen.
- [x] Sicherstellen, dass öffentliche Caches keine nutzerabhängigen Daten oder Entwürfe enthalten.
- [x] Mit einem Global mit Beziehungen prüfen, dass unterschiedliche `depth`-Werte unterschiedliche, korrekte Ergebnisse liefern.

**Fertig, wenn:** Ein gezielter Regressionstest unterschiedliche Beziehungstiefen zuverlässig unterscheidet und die geprüften Cache-Schlüssel dokumentiert sind.

### 2. Cache-Aktualisierung nach CMS-Änderungen absichern

**Ursprüngliche Ausgangslage:** Die Hooks nutzen bereits `revalidateTag(..., { expire: 0 })`. Diese Anpassung ist erledigt; offen ist die systematische Prüfung aller betroffenen Inhalte und Abhängigkeiten.

- [x] Eine Zuordnung von Datenquelle, Cache-Tag, betroffenen Seiten und auslösendem CMS-Hook erstellen.
- [x] Erstellen, Veröffentlichen, Bearbeiten, Zurückziehen und Löschen für Seiten, Posts und Projekte prüfen.
- [ ] Bei Slug-Änderungen alte und neue URL berücksichtigen; Änderungen an verknüpften Clients und Medien ebenfalls prüfen.
- [ ] Header, Footer, Weiterleitungen und Sitemaps nach Änderungen kontrollieren.
- [x] Sofortige Invalidierung dort erhalten, wo Inhaltskorrektheit entscheidend ist. Hintergrundaktualisierung nur mit bewusst akzeptierter kurzzeitiger Veraltung einsetzen.
- [x] Draft Mode und Live Preview unabhängig vom öffentlichen Cache prüfen.

**Fertig, wenn:** Automatisierte Prüfungen nach einer CMS-Änderung beim nächsten relevanten Serverabruf aktuelle Inhalte erhalten und öffentliche Besucher keine Entwürfe sehen.

Quelle: [Next.js – revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).

### 3. Automatische Prüfungen vor dem Deployment einrichten

**Ursprüngliche Ausgangslage:** Das Projekt hat Prüf-Scripts, aber aktuell keine `.github/workflows`-Pipeline. Next.js 16 führt ESLint nicht automatisch als Teil des Builds aus.

- [x] Eine CI-Pipeline mit Node 24, der deklarierten pnpm-Version und Installation über `--frozen-lockfile` einrichten.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test:int` und Produktionsbuild ausführen.
- [x] Für Datenbanktests eine isolierte MongoDB mit der benötigten Replica-Set-Konfiguration verwenden; keine Produktionsdaten oder Produktionszugänge einsetzen.
- [x] Playwright gegen einen Produktionsbuild mit reproduzierbaren Testinhalten ausführen.
- [x] Docker-Build und Start des resultierenden Images mit Testkonfiguration prüfen; fehlgeschlagene Prüfungen vor einem produktiven Deployment sichtbar machen.

**Fertig, wenn:** Ein Pull Request nachvollziehbare Prüfergebnisse liefert und ein reproduzierbarer Fehler im Build, in der Typprüfung oder in kritischen Tests erkannt wird.

### 4. Kritische Payload- und Frontend-Abläufe testen

**Ursprüngliche Ausgangslage:** Der vorhandene Frontend-E2E-Test prüft hauptsächlich die Startseite, Cookie-Ablehnung und unbehandelte JavaScript-Fehler. Screenshots allein sind keine automatischen visuellen Vergleichstests.

- [x] Projektübersicht → Projektseite, Suche, mobile Navigation und Weiterleitungen abdecken.
- [x] Consent-Ablehnung, Zustimmung und spätere Änderung prüfen; Analytics darf vor Zustimmung keine Daten übertragen.
- [x] Admin-Login, Bearbeiten, Veröffentlichen und Live Preview mit einem Testnutzer prüfen.
- [x] Upload, Ersetzung und Abruf von Medien testen; SVG/XML-Verhalten und Größenlimits nach Payload 3.90 bewusst festlegen.
- [x] Formular und SMTP-Versand gegen einen Mail-Testdienst prüfen; Gemini-Anfragen separat mit kontrollierten Testfällen prüfen.
- [x] Für Upload- und CMS-Tests isolierte Daten und zuverlässige Bereinigung verwenden.

**Fertig, wenn:** Die wichtigsten Besucher- und Redaktionsabläufe reproduzierbar geprüft werden und externe Dienste keine echten Kundenaktionen auslösen.

Quelle: [Payload 3.90 – geänderte Sicherheitsregeln](https://github.com/payloadcms/payload/releases/tag/v3.90.0).

## P2 – Performance und Wartbarkeit

### 5. Performance messen und Betriebsprüfung vervollständigen

- [ ] Startseite, Projektübersicht und eine bildreiche Projektseite mobil und am Desktop messen; LCP, INP, CLS, übertragene Daten und Serverantwortzeit festhalten.
- [ ] Kalte und warme Abrufe sowie kalte und wiederholte Builds getrennt vergleichen; mehrere Läufe unter gleichen Bedingungen durchführen.
- [ ] Bestehende Umami-Anbindung anhand von `umami-coolify.md` überprüfen und Performance-Erfassung mit der Consent-Logik abstimmen.
- [ ] Verfügbarkeit und Fehlererkennung anhand von `monitoring-coolify.md` einrichten oder vorhandene Einrichtung verifizieren.
- [ ] MongoDB- und Medien-Backups gemeinsam in einer isolierten Umgebung wiederherstellen; Datenbank-Backups enthalten keine Upload-Dateien.

**Fertig, wenn:** Ausgangswerte und ein wiederholbarer Messablauf vorliegen sowie Wiederherstellung und Ausfallerkennung überprüft sind.

Bestehende Anleitungen: [Monitoring](monitoring-coolify.md), [Umami](umami-coolify.md), [Deployment](deployment-coolify.md).

### 6. Bildauslieferung verbessern

**Ursprüngliche Ausgangslage:** `ImageMedia` verwendet pauschal `quality={100}` und berechnet einen allgemeinen `sizes`-Wert. Bei der bisherigen Browserprüfung wurde außerdem ein `fill`-Bild mit statisch positioniertem Parent gemeldet.

- [x] `sizes` anhand der tatsächlichen Darstellung von Hero-, Karten- und Detailbildern festlegen.
- [x] Für `fill` korrekt positionierte Container mit stabilen Abmessungen sicherstellen.
- [ ] Qualität 75 oder 85 mit 100 visuell und hinsichtlich Dateigröße vergleichen; neue Werte gegebenenfalls in `images.qualities` erlauben.
- [x] Nur das tatsächlich wichtigste sichtbare Bild bevorzugt laden; übrige Bilder verzögert laden.
- [x] Alt-Texte für informative Bilder pflegen und dekorative Bilder bewusst mit leerem Alt-Text behandeln.
- [ ] Originale und Payload-Bildvarianten in der Testumgebung bereitstellen, damit visuelle Prüfungen aussagekräftig sind.

**Fertig, wenn:** Bilder auf Mobilgeräten weniger Daten übertragen, das Layout stabil bleibt und keine relevanten Next-Image-Warnungen auftreten.

Quelle: [Next.js – Image](https://nextjs.org/docs/app/api-reference/components/image).

### 7. Turbopack für Entwicklung und Build prüfen

**Ursprüngliche Ausgangslage:** `dev` und `build` verwenden `--webpack`; `next.config.js` setzt eine eigene `webpack.resolve.extensionAlias`-Konfiguration.

- [x] Zweck der Extension-Aliase und Anforderungen von `withPayload` prüfen; benötigte Auflösung anhand der installierten Next-Dokumentation übertragen oder überflüssige Sonderkonfiguration entfernen.
- [ ] Zunächst Entwicklung ohne `--webpack` testen: Admin, Live Preview, SCSS/CSS, lokale Icons, Lottie und Hot Reload.
- [ ] Anschließend Produktionsbuild und Docker-Image mit Turbopack prüfen.
- [ ] Build-Dauer und Speicherbedarf unter gleichen Bedingungen mit Webpack vergleichen; Cache-Erhalt im Build-System berücksichtigen.
- [ ] Die Scripts erst umstellen, wenn die benötigten Abläufe funktionieren; Webpack als dokumentierten Rückweg erhalten.

**Fertig, wenn:** Entwicklung und Docker-Deployment mit Turbopack zuverlässig laufen und der Vergleich einen praktischen Nutzen zeigt.

Quelle: [Next.js – Turbopack-Konfiguration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack).

### 8. Cache Components und `use cache` schrittweise einführen

**Ursprüngliche Ausgangslage:** `cacheComponents` ist nicht aktiviert. Es bestehen explizite `unstable_cache`-Hilfen und dynamische Frontend-Routen für das Deployment ohne Datenbankzugriff beim Build.

- [x] Öffentliche CMS-Daten, nutzerabhängige Daten und Preview-Daten getrennt erfassen; Laufzeitvoraussetzungen der vorhandenen Routen prüfen.
- [ ] Payload-Kompatibilität sowie Route-Konfiguration, Draft Mode und Streaming unter dem neuen Modell prüfen.
- [x] Einen begrenzten Prototyp für öffentliche Projektdaten erstellen; Cache-Lebensdauer und Tags ausdrücklich definieren.
- [ ] Dynamische Teile mit sinnvollen Suspense-Grenzen versehen und Admin-/Preview-Daten aus gemeinsam genutzten öffentlichen Caches heraushalten.
- [ ] Prüfen, ob Prerendering Datenbankzugriff beim Build voraussetzt; die bestehende Docker-Build-Strategie bewusst erhalten oder anpassen.
- [ ] Die Revalidierungsprüfungen aus Punkt 2 wiederholen; erst dann weitere Cache-Hilfen migrieren.

**Fertig, wenn:** Öffentliche Seiten messbar profitieren, Änderungen korrekt sichtbar werden und Build, Vorschau und Berechtigungen weiterhin funktionieren.

Quelle: [Next.js – Migration zu Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components).

### 9. Instant Navigations und Partial Prefetching nutzen

**Voraussetzung:** Das neue Cache-Modell aus Punkt 8 funktioniert zuverlässig.

- [x] Projektübersicht → Detailseite als ersten Anwendungsfall wählen.
- [ ] `partialPrefetching` zusammen mit Cache Components nach der passenden Versionsdokumentation prüfen.
- [ ] Sofort sichtbare Seitenteile und passende Ladezustände definieren; gezielte Suspense-Grenzen setzen.
- [ ] Instant Insights beziehungsweise Navigation Inspector verwenden, um blockierende Teile zu erkennen.
- [ ] Netzwerkverkehr und Server-/Datenbanklast durch Prefetching vergleichen; nicht unnötig vollständige Inhalte aller Karten vorladen.
- [ ] Mit dem versionskompatiblen `instant()`-Playwright-Helfer prüfen, welche Teile unmittelbar bei einem Seitenwechsel sichtbar sein müssen.

**Fertig, wenn:** Die geprüften Seitenwechsel sofort sinnvolle UI zeigen, ohne übermäßige zusätzliche Requests oder veraltete Inhalte.

Quelle: [Next.js – Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching).

### 10. Animationen vereinheitlichen und Client-Code reduzieren

**Ursprüngliche Ausgangslage:** Der TextAnimation-Hero verwendet AOS und `react-just-parallax`; Motion ist bereits zusätzlich im Projekt vorhanden.

- [x] Scroll- und Viewport-Animationen aus AOS und Parallax mit der vorhandenen Motion-Bibliothek prototypisch nachbauen.
- [ ] `prefers-reduced-motion`, Tastaturbedienung, mobile Darstellung und Scroll-Verhalten prüfen.
- [ ] Nicht sofort benötigte Animationen bei Bedarf verzögert laden und Client-Grenzen kleiner halten.
- [x] AOS, Parallax und zugehörige Typ-Pakete erst entfernen, wenn alle Verwendungen ersetzt sind.
- [x] Bei Lottie prüfen, ob ein kleinerer Renderer die vorhandenen JSON-Animationen vollständig unterstützt.

**Fertig, wenn:** Das gewünschte Verhalten erhalten bleibt, reduzierte Bewegung respektiert wird und Bundle-Messungen die Einsparung bestätigen.

Hintergrund: [Package-Audit und geprüfte Alternativen](package-audit-2026-10-03.md).

### 11. Lint-Warnungen und Dependency-Ausnahmen abbauen

- [x] Die im Package-Audit dokumentierten Lint-Warnungen nach Auswirkungen priorisieren; fehleranfällige Effects, State-Updates und Ref-Nutzung zuerst bearbeiten.
- [x] Vorübergehend abgeschwächte React-Compiler-Regeln nach der Bereinigung wieder verschärfen.
- [x] Den offenen `braces`-Audit-Befund erneut prüfen, sobald upstream eine Korrektur verfügbar ist.
- [x] DOMPurify-, Undici- und Nodemailer-Overrides bei Payload-Updates erneut bewerten und entfernen, sobald die regulären Abhängigkeiten die benötigten Korrekturen enthalten.
- [x] ESLint 10 und neuere TypeScript-/GraphQL-Versionen erst nach Prüfung der tatsächlichen Peer-Kompatibilität übernehmen.
- [x] Node-Version, Docker-Basis und Node-Typen weiterhin abgestimmt halten; eine Runtime-Migration separat testen.

**Fertig, wenn:** Bekannte Ausnahmen nachvollziehbar reduziert werden und Änderungen an Werkzeugen keine unterdrückten Kompatibilitätsprobleme verursachen.

## P3 – Optionale Weiterentwicklung

### 12. React Compiler gezielt evaluieren

- [ ] Nach Bereinigung der einschlägigen Lint-Warnungen den Compiler in einer separaten Änderung testen.
- [ ] Interaktive Komponenten mit React Profiler vor und nach Aktivierung vergleichen.
- [ ] Bestehende Memoisierung nur nach Prüfung vereinfachen; nicht pauschal entfernen.

**Fertig, wenn:** Relevante Komponenten messbar profitieren und Interaktion sowie Tests unverändert funktionieren. Ohne nachweisbaren Nutzen zurückstellen.

Quelle: [Next.js 16 – React Compiler](https://nextjs.org/blog/next-16).

### 13. Native Sitemaps statt `next-sitemap` prüfen

- [x] Alle derzeitigen Sitemap-URLs, den Index, dynamische XML-Routen und das Robots-Verhalten inventarisieren.
- [x] Mit nativen `sitemap.ts`-/`robots.ts`-Routen dieselben öffentlichen URLs und Staging-Sperren abbilden.
- [x] Cache-Aktualisierung, kanonische URLs und Ausschluss von Entwürfen prüfen.
- [x] Das Paket und den Postbuild-Schritt nur entfernen, wenn der Ersatz vollständig ist und die Wartung vereinfacht.

**Fertig, wenn:** Suchmaschinen dieselben vorgesehenen Inhalte erhalten und Staging weiterhin nicht indexiert werden soll.

### 14. Payload-Admin für die Redaktion verbessern

- [x] Live Preview bei Bedarf über `livePreview.openByDefault` standardmäßig öffnen.
- [x] Für wichtige Collections prüfen, ob `disableBulkDelete` versehentliches Massenlöschen verhindern sollte.
- [ ] Eigene Projektübersichten nur bei einem konkreten Redaktionsbedarf ergänzen.
- [ ] Datei-Anhänge im Form Builder nur bei fachlichem Bedarf einführen; dabei Berechtigungen, erlaubte Typen, Größe und Aufbewahrung festlegen.

**Fertig, wenn:** Die ausgewählten Änderungen konkrete redaktionelle Abläufe vereinfachen und mit den vorgesehenen Nutzerrechten geprüft sind.

Quellen: [Payload 3.84](https://github.com/payloadcms/payload/releases/tag/v3.84.0), [Payload 3.86](https://github.com/payloadcms/payload/releases/tag/v3.86.0).

## Umsetzungsstand nach den lokalen Feature-Commits

Validierung: Typprüfung erfolgreich; ESLint ohne Fehler und mit 29 Warnungen; 37 Integrationstests einschließlich isolierter MongoDB und SMTP bestanden; neun Browserfälle bestanden, der ergänzte Admin-UI-Veröffentlichungsschritt zusätzlich gezielt geprüft. Produktionsbuild und Docker-Build ohne erreichbare Datenbank erfolgreich; finaler Container lieferte Startseite, Projekt-Sitemap und Staging-Robots-Regeln korrekt aus. Die Testcontainer wurden anschließend entfernt. Kein Push und kein Deployment ausgeführt.

| Punkt | Ergebnis und verbleibender Nachweis |
| --- | --- |
| 1 | Vollständige öffentliche Cache-Schlüssel einschließlich Tiefe und Sitemap-Ursprung; Regressionstests. [Cache-Matrix](cms-cache.md). |
| 2 | Alte/neue Slugs, globale öffentliche Tags und Beziehungsinvalidierung umgesetzt. Seiten-, Post- und Projekt-Lifecycle mit Produktionsserver; authentifizierter Draft Mode und Live-Preview-Iframe geprüft. Header-/Footer-/Redirect-Änderungen und Medien-/Client-Mutationen als vollständige HTTP-Systemtests ergänzen. |
| 3 | Workflow mit isolierter MongoDB, Mailpit, Seed, Produktions-E2E und Docker-Smoke-Test vorhanden. Docker-Build ohne erreichbare MongoDB und lokaler Containerstart geprüft. GitHub-Ausführung und verpflichtende Branch-Prüfungen erst nach einem ausdrücklich angeforderten Push verifizierbar. [CI](ci.md). |
| 4 | Besucherflüsse, Consent, Admin-Login, Vorschau, Upload/Ersetzung, Formular bis Mailpit und kontrolliertes Gemini-Streaming getestet. Bearbeiten des Hero-Titels und Veröffentlichen zusätzlich direkt in der Admin-Oberfläche geprüft; weitere Feldtypen können die Abdeckung ergänzen. [Testabdeckung](testing.md). |
| 5 | Wiederholbare LCP-/CLS-/TTFB-/Byte-Messung mit synthetischen Daten vorhanden. Repräsentatives INP, kalte Server-/Build-Vergleiche, externes Monitoring und Wiederherstellung echter Backups noch offen. Dafür werden Coolify-/Monitoring-Zugang und zusammengehörige DB-/Medienbackups benötigt. [Messungen](performance.md). |
| 6 | Responsive Größen, Qualität 75 als Standard, optional 85/100, stabile Fill-Container, dekorative Alt-Texte und Lazy Loading umgesetzt. Qualitätsvergleich mit echten Originalen und Varianten noch offen; synthetische Bilder belegen keine visuelle Gleichwertigkeit. [Bilder](images.md). |
| 7 | Sass-Import der Admin-Leiste durch CSS ersetzt, Turbopack-Produktionsbuild erfolgreich. Scripts bleiben Webpack bis Admin-/HMR-/Docker-Prüfung unter Turbopack und kontrollierter Zeit-/Speichervergleich abgeschlossen sind. [Turbopack](turbopack.md). |
| 8 | Öffentliche/Preview-Daten getrennt dokumentiert und begrenzter use-cache-Prototyp erstellt. Nicht in produktive Routen integriert: Migration von force-dynamic, Suspense, Metadaten und Build ohne DB steht aus. [Cache Components](cache-components.md). |
| 9 | Projekt-Ladezustand umgesetzt. Partial Prefetching, Inspector, Request-/DB-Vergleich und instant()-Prüfung bleiben von Punkt 8 abhängig und sind noch nicht aktiviert. [Navigation](instant-navigation.md). |
| 10 | Motion ersetzt AOS/Parallax; Pakete entfernt. Reduzierte Bewegung berücksichtigt; expressionsfähiger SVG-Lottie-Renderer. Alle Animationen visuell und mit kontrolliertem Bundlevergleich noch prüfen. [Animationen](animations.md). |
| 11 | Fehleranfällige Effects/Refs bereinigt und Compiler-Regeln wieder als Fehler aktiviert. Lint: 0 Fehler, 29 verbleibende Warnungen. Audit-Ausnahmen erneut geprüft; kein ungeprüftes Peer-Upgrade. [Codequalität](code-quality.md). |
| 12 | Gemäß ursprünglichem Nutzenkriterium zurückgestellt: belastbarer Profilervergleich mit repräsentativen Daten fehlt. Compiler ist nicht aktiviert. [Entscheidung](react-compiler.md). |
| 13 | Native Sitemap-/Robots-Routen, veröffentlichte Inhalte, Pagination, Nested-URLs, Projekt-URLs und kompatible XML-Endpunkte; next-sitemap entfernt. Fehlende Post-Detailroute ergänzt. [Sitemaps](sitemaps.md). |
| 14 | Live Preview automatisch geöffnet; Bulk Delete für fünf wichtige Collections gesperrt. Eigenes Dashboard und Formularanhänge ohne konkreten Redaktionsbedarf zurückgestellt. [Admin](admin-improvements.md). |

## Weitere Optimierungen aus der anschließenden Codeprüfung

Diese neuen Punkte sind Folgeaufgaben, keine bereits umgesetzten Features.

- [ ] **P1 – Job-Authentifizierung:** In `src/payload.config.ts` muss ein nichtleerer `CRON_SECRET` Voraussetzung für den Bearer-Vergleich sein. Aktuell passt bei fehlender Konfiguration der wörtliche Header `Bearer undefined`. Fehlerfall mit Test absichern.
- [ ] **P1 – Suchindex nach Client-Änderung:** `src/search/beforeSync.ts` speichert Beziehungsdaten denormalisiert. Client-Slug-/Namensänderungen müssen auch die zugehörigen Projekt-Suchdokumente aktualisieren; Tag-Invalidierung allein aktualisiert den gespeicherten Index nicht.
- [ ] **P1 – Nested-Pages-Invalidierung:** Seiten-Hooks bauen Pfade aus dem letzten Slug. Vollständige Breadcrumb-URLs und Änderungen am Elternpfad samt Kindseiten gezielt revalidieren und als HTTP-Test prüfen.
- [ ] **P1 – KI-Ressourcenbegrenzung:** Die prozesslokale Rate-Limit-Map in `src/app/api/ai-chat/route.ts` benötigt Bereinigung, verbindliche Proxy-IP-Vertrauensregeln, Request-Byte-Limit und Provider-Abbruch bei getrenntem Client. Skalierung über mehrere Instanzen berücksichtigen.
- [ ] **P2 – Videoauslieferung:** `src/components/Media/VideoMedia/index.tsx` verwendet `/media/${filename}` statt der konfigurierten Payload-URL. Ressourcen-URL mit `getMediaUrl` nutzen, wirkungslosen Event-Listener entfernen und Autoplay bei reduzierter Bewegung prüfen.
- [ ] **P2 – Sprach- und SEO-Metadaten:** Deutsches Frontend verwendet noch `lang="en"`. Sprache berichtigen; kanonische URLs und OpenGraph-Pfade in `generateMeta.ts` und SEO-Plugin auch für Nested Pages, Posts und Projekte vereinheitlichen.
- [ ] **P2 – Gemeinsame Projektformatierung:** Projekt-Typen und Datumsdarstellung in Grid, Suche und Detailseite zentralisieren; ungültige Datumswerte abfangen.
- [ ] **P2 – Animationen nach Bedarf:** Offscreen-Lottie-JSONs und den Renderer erst bei Sichtbarkeit laden. Vorher/nachher übertragene JS-Bytes und alle Expressions visuell prüfen.
- [ ] **P2 – Verbleibende Typwarnungen:** Die 29 Lint-Warnungen vor allem an Formularfeldern, Plugins und dynamischen Block-Komponenten durch passende Payload-Typen ersetzen; Fehlerpfade statt rein mechanischer Tests prüfen.
- [ ] **P2 – Reproduzierbare Schrift-Builds:** Google-Fonts-Buildabrufe auf lokal versionierte, lizenzkonforme Schriftdateien umstellen und Offline-Docker-Build prüfen.
- [ ] **P2 – Streaming-Abbrüche:** Browsernavigation kann Next-Meldungen „destination stream closed early“ auslösen. Abbruchpfade unter Last prüfen; erwartete Client-Abbrüche von Serverfehlern in Monitoring unterscheiden.
