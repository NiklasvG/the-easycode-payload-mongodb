# TODO: Sinnvolle Projektverbesserungen

Stand: 3. Oktober 2026, nach dem Package-Update und dem erfolgreichen Deployment-Build.

Diese Liste ist ein Arbeitsplan. Die aufgeführten Verbesserungen sind noch nicht umgesetzt. Vor jeder Umsetzung den aktuellen Projektstand prüfen. Eine neue Framework-Funktion soll ein konkretes Problem lösen oder einen messbaren Vorteil bringen.

## Prioritäten und Reihenfolge

| Priorität | Bedeutung | Themen |
| --- | --- | --- |
| P1 | Zuerst: Korrektheit und verlässliche Prüfung | Cache-Schlüssel, CMS-Revalidierung, CI und kritische Abläufe |
| P2 | Danach: messbare Performance und Wartbarkeit | Messungen, Bilder, Turbopack, Cache Components, Navigation, Animationen |
| P3 | Optional, bei nachgewiesenem Nutzen | React Compiler, native Sitemaps, zusätzliche Admin-Funktionen |

Empfohlener Ablauf: P1 erledigen und Performance-Ausgangswerte erfassen. Danach Bilder optimieren, Turbopack separat prüfen und erst anschließend das Cache-Modell und die Navigation migrieren. Jeden Schritt einzeln vergleichen und deployen.

## P1 – Korrektheit und Qualitätssicherung

### 1. Cache-Schlüssel vollständig machen

**Ausgangslage:** `getCachedGlobal(slug, depth)` verwendet `depth` innerhalb einer Closure, führt es aber nicht in den expliziten Cache-Schlüsseln auf. Unterschiedliche Beziehungstiefen müssen eindeutig unterscheidbar sein.

- [ ] In `src/utilities/getGlobals.ts` alle ergebnisrelevanten Parameter in den Cache-Schlüssel aufnehmen, insbesondere `depth`.
- [ ] `getDocument.ts`, `getRedirects.ts` und Sitemap-Caches auf dieselbe Fehlerklasse prüfen; bei späterer Lokalisierung auch die Sprache berücksichtigen.
- [ ] Sicherstellen, dass öffentliche Caches keine nutzerabhängigen Daten oder Entwürfe enthalten.
- [ ] Mit einem Global mit Beziehungen prüfen, dass unterschiedliche `depth`-Werte unterschiedliche, korrekte Ergebnisse liefern.

**Fertig, wenn:** Ein gezielter Regressionstest unterschiedliche Beziehungstiefen zuverlässig unterscheidet und die geprüften Cache-Schlüssel dokumentiert sind.

### 2. Cache-Aktualisierung nach CMS-Änderungen absichern

**Ausgangslage:** Die Hooks nutzen bereits `revalidateTag(..., { expire: 0 })`. Diese Anpassung ist erledigt; offen ist die systematische Prüfung aller betroffenen Inhalte und Abhängigkeiten.

- [ ] Eine Zuordnung von Datenquelle, Cache-Tag, betroffenen Seiten und auslösendem CMS-Hook erstellen.
- [ ] Erstellen, Veröffentlichen, Bearbeiten, Zurückziehen und Löschen für Seiten, Posts und Projekte prüfen.
- [ ] Bei Slug-Änderungen alte und neue URL berücksichtigen; Änderungen an verknüpften Clients und Medien ebenfalls prüfen.
- [ ] Header, Footer, Weiterleitungen und Sitemaps nach Änderungen kontrollieren.
- [ ] Sofortige Invalidierung dort erhalten, wo Inhaltskorrektheit entscheidend ist. Hintergrundaktualisierung nur mit bewusst akzeptierter kurzzeitiger Veraltung einsetzen.
- [ ] Draft Mode und Live Preview unabhängig vom öffentlichen Cache prüfen.

**Fertig, wenn:** Automatisierte Prüfungen nach einer CMS-Änderung beim nächsten relevanten Serverabruf aktuelle Inhalte erhalten und öffentliche Besucher keine Entwürfe sehen.

Quelle: [Next.js – revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).

### 3. Automatische Prüfungen vor dem Deployment einrichten

**Ausgangslage:** Das Projekt hat Prüf-Scripts, aber aktuell keine `.github/workflows`-Pipeline. Next.js 16 führt ESLint nicht automatisch als Teil des Builds aus.

- [ ] Eine CI-Pipeline mit Node 24, der deklarierten pnpm-Version und Installation über `--frozen-lockfile` einrichten.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test:int` und Produktionsbuild ausführen.
- [ ] Für Datenbanktests eine isolierte MongoDB mit der benötigten Replica-Set-Konfiguration verwenden; keine Produktionsdaten oder Produktionszugänge einsetzen.
- [ ] Playwright gegen einen Produktionsbuild mit reproduzierbaren Testinhalten ausführen.
- [ ] Docker-Build und Start des resultierenden Images mit Testkonfiguration prüfen; fehlgeschlagene Prüfungen vor einem produktiven Deployment sichtbar machen.

**Fertig, wenn:** Ein Pull Request nachvollziehbare Prüfergebnisse liefert und ein reproduzierbarer Fehler im Build, in der Typprüfung oder in kritischen Tests erkannt wird.

### 4. Kritische Payload- und Frontend-Abläufe testen

**Ausgangslage:** Der vorhandene Frontend-E2E-Test prüft hauptsächlich die Startseite, Cookie-Ablehnung und unbehandelte JavaScript-Fehler. Screenshots allein sind keine automatischen visuellen Vergleichstests.

- [ ] Projektübersicht → Projektseite, Suche, mobile Navigation und Weiterleitungen abdecken.
- [ ] Consent-Ablehnung, Zustimmung und spätere Änderung prüfen; Analytics darf vor Zustimmung keine Daten übertragen.
- [ ] Admin-Login, Bearbeiten, Veröffentlichen und Live Preview mit einem Testnutzer prüfen.
- [ ] Upload, Ersetzung und Abruf von Medien testen; SVG/XML-Verhalten und Größenlimits nach Payload 3.90 bewusst festlegen.
- [ ] Formular und SMTP-Versand gegen einen Mail-Testdienst prüfen; Gemini-Anfragen separat mit kontrollierten Testfällen prüfen.
- [ ] Für Upload- und CMS-Tests isolierte Daten und zuverlässige Bereinigung verwenden.

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

**Ausgangslage:** `ImageMedia` verwendet pauschal `quality={100}` und berechnet einen allgemeinen `sizes`-Wert. Bei der bisherigen Browserprüfung wurde außerdem ein `fill`-Bild mit statisch positioniertem Parent gemeldet.

- [ ] `sizes` anhand der tatsächlichen Darstellung von Hero-, Karten- und Detailbildern festlegen.
- [ ] Für `fill` korrekt positionierte Container mit stabilen Abmessungen sicherstellen.
- [ ] Qualität 75 oder 85 mit 100 visuell und hinsichtlich Dateigröße vergleichen; neue Werte gegebenenfalls in `images.qualities` erlauben.
- [ ] Nur das tatsächlich wichtigste sichtbare Bild bevorzugt laden; übrige Bilder verzögert laden.
- [ ] Alt-Texte für informative Bilder pflegen und dekorative Bilder bewusst mit leerem Alt-Text behandeln.
- [ ] Originale und Payload-Bildvarianten in der Testumgebung bereitstellen, damit visuelle Prüfungen aussagekräftig sind.

**Fertig, wenn:** Bilder auf Mobilgeräten weniger Daten übertragen, das Layout stabil bleibt und keine relevanten Next-Image-Warnungen auftreten.

Quelle: [Next.js – Image](https://nextjs.org/docs/app/api-reference/components/image).

### 7. Turbopack für Entwicklung und Build prüfen

**Ausgangslage:** `dev` und `build` verwenden `--webpack`; `next.config.js` setzt eine eigene `webpack.resolve.extensionAlias`-Konfiguration.

- [ ] Zweck der Extension-Aliase und Anforderungen von `withPayload` prüfen; benötigte Auflösung anhand der installierten Next-Dokumentation übertragen oder überflüssige Sonderkonfiguration entfernen.
- [ ] Zunächst Entwicklung ohne `--webpack` testen: Admin, Live Preview, SCSS/CSS, lokale Icons, Lottie und Hot Reload.
- [ ] Anschließend Produktionsbuild und Docker-Image mit Turbopack prüfen.
- [ ] Build-Dauer und Speicherbedarf unter gleichen Bedingungen mit Webpack vergleichen; Cache-Erhalt im Build-System berücksichtigen.
- [ ] Die Scripts erst umstellen, wenn die benötigten Abläufe funktionieren; Webpack als dokumentierten Rückweg erhalten.

**Fertig, wenn:** Entwicklung und Docker-Deployment mit Turbopack zuverlässig laufen und der Vergleich einen praktischen Nutzen zeigt.

Quelle: [Next.js – Turbopack-Konfiguration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack).

### 8. Cache Components und `use cache` schrittweise einführen

**Ausgangslage:** `cacheComponents` ist nicht aktiviert. Es bestehen explizite `unstable_cache`-Hilfen und dynamische Frontend-Routen für das Deployment ohne Datenbankzugriff beim Build.

- [ ] Öffentliche CMS-Daten, nutzerabhängige Daten und Preview-Daten getrennt erfassen; Laufzeitvoraussetzungen der vorhandenen Routen prüfen.
- [ ] Payload-Kompatibilität sowie Route-Konfiguration, Draft Mode und Streaming unter dem neuen Modell prüfen.
- [ ] Einen begrenzten Prototyp für öffentliche Projektdaten erstellen; Cache-Lebensdauer und Tags ausdrücklich definieren.
- [ ] Dynamische Teile mit sinnvollen Suspense-Grenzen versehen und Admin-/Preview-Daten aus gemeinsam genutzten öffentlichen Caches heraushalten.
- [ ] Prüfen, ob Prerendering Datenbankzugriff beim Build voraussetzt; die bestehende Docker-Build-Strategie bewusst erhalten oder anpassen.
- [ ] Die Revalidierungsprüfungen aus Punkt 2 wiederholen; erst dann weitere Cache-Hilfen migrieren.

**Fertig, wenn:** Öffentliche Seiten messbar profitieren, Änderungen korrekt sichtbar werden und Build, Vorschau und Berechtigungen weiterhin funktionieren.

Quelle: [Next.js – Migration zu Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components).

### 9. Instant Navigations und Partial Prefetching nutzen

**Voraussetzung:** Das neue Cache-Modell aus Punkt 8 funktioniert zuverlässig.

- [ ] Projektübersicht → Detailseite als ersten Anwendungsfall wählen.
- [ ] `partialPrefetching` zusammen mit Cache Components nach der passenden Versionsdokumentation prüfen.
- [ ] Sofort sichtbare Seitenteile und passende Ladezustände definieren; gezielte Suspense-Grenzen setzen.
- [ ] Instant Insights beziehungsweise Navigation Inspector verwenden, um blockierende Teile zu erkennen.
- [ ] Netzwerkverkehr und Server-/Datenbanklast durch Prefetching vergleichen; nicht unnötig vollständige Inhalte aller Karten vorladen.
- [ ] Mit dem versionskompatiblen `instant()`-Playwright-Helfer prüfen, welche Teile unmittelbar bei einem Seitenwechsel sichtbar sein müssen.

**Fertig, wenn:** Die geprüften Seitenwechsel sofort sinnvolle UI zeigen, ohne übermäßige zusätzliche Requests oder veraltete Inhalte.

Quelle: [Next.js – Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching).

### 10. Animationen vereinheitlichen und Client-Code reduzieren

**Ausgangslage:** Der TextAnimation-Hero verwendet AOS und `react-just-parallax`; Motion ist bereits zusätzlich im Projekt vorhanden.

- [ ] Scroll- und Viewport-Animationen aus AOS und Parallax mit der vorhandenen Motion-Bibliothek prototypisch nachbauen.
- [ ] `prefers-reduced-motion`, Tastaturbedienung, mobile Darstellung und Scroll-Verhalten prüfen.
- [ ] Nicht sofort benötigte Animationen bei Bedarf verzögert laden und Client-Grenzen kleiner halten.
- [ ] AOS, Parallax und zugehörige Typ-Pakete erst entfernen, wenn alle Verwendungen ersetzt sind.
- [ ] Bei Lottie prüfen, ob ein kleinerer Renderer die vorhandenen JSON-Animationen vollständig unterstützt.

**Fertig, wenn:** Das gewünschte Verhalten erhalten bleibt, reduzierte Bewegung respektiert wird und Bundle-Messungen die Einsparung bestätigen.

Hintergrund: [Package-Audit und geprüfte Alternativen](package-audit-2026-10-03.md).

### 11. Lint-Warnungen und Dependency-Ausnahmen abbauen

- [ ] Die im Package-Audit dokumentierten Lint-Warnungen nach Auswirkungen priorisieren; fehleranfällige Effects, State-Updates und Ref-Nutzung zuerst bearbeiten.
- [ ] Vorübergehend abgeschwächte React-Compiler-Regeln nach der Bereinigung wieder verschärfen.
- [ ] Den offenen `braces`-Audit-Befund erneut prüfen, sobald upstream eine Korrektur verfügbar ist.
- [ ] DOMPurify-, Undici- und Nodemailer-Overrides bei Payload-Updates erneut bewerten und entfernen, sobald die regulären Abhängigkeiten die benötigten Korrekturen enthalten.
- [ ] ESLint 10 und neuere TypeScript-/GraphQL-Versionen erst nach Prüfung der tatsächlichen Peer-Kompatibilität übernehmen.
- [ ] Node-Version, Docker-Basis und Node-Typen weiterhin abgestimmt halten; eine Runtime-Migration separat testen.

**Fertig, wenn:** Bekannte Ausnahmen nachvollziehbar reduziert werden und Änderungen an Werkzeugen keine unterdrückten Kompatibilitätsprobleme verursachen.

## P3 – Optionale Weiterentwicklung

### 12. React Compiler gezielt evaluieren

- [ ] Nach Bereinigung der einschlägigen Lint-Warnungen den Compiler in einer separaten Änderung testen.
- [ ] Interaktive Komponenten mit React Profiler vor und nach Aktivierung vergleichen.
- [ ] Bestehende Memoisierung nur nach Prüfung vereinfachen; nicht pauschal entfernen.

**Fertig, wenn:** Relevante Komponenten messbar profitieren und Interaktion sowie Tests unverändert funktionieren. Ohne nachweisbaren Nutzen zurückstellen.

Quelle: [Next.js 16 – React Compiler](https://nextjs.org/blog/next-16).

### 13. Native Sitemaps statt `next-sitemap` prüfen

- [ ] Alle derzeitigen Sitemap-URLs, den Index, dynamische XML-Routen und das Robots-Verhalten inventarisieren.
- [ ] Mit nativen `sitemap.ts`-/`robots.ts`-Routen dieselben öffentlichen URLs und Staging-Sperren abbilden.
- [ ] Cache-Aktualisierung, kanonische URLs und Ausschluss von Entwürfen prüfen.
- [ ] Das Paket und den Postbuild-Schritt nur entfernen, wenn der Ersatz vollständig ist und die Wartung vereinfacht.

**Fertig, wenn:** Suchmaschinen dieselben vorgesehenen Inhalte erhalten und Staging weiterhin nicht indexiert werden soll.

### 14. Payload-Admin für die Redaktion verbessern

- [ ] Live Preview bei Bedarf über `livePreview.openByDefault` standardmäßig öffnen.
- [ ] Für wichtige Collections prüfen, ob `disableBulkDelete` versehentliches Massenlöschen verhindern sollte.
- [ ] Eigene Projektübersichten nur bei einem konkreten Redaktionsbedarf ergänzen.
- [ ] Datei-Anhänge im Form Builder nur bei fachlichem Bedarf einführen; dabei Berechtigungen, erlaubte Typen, Größe und Aufbewahrung festlegen.

**Fertig, wenn:** Die ausgewählten Änderungen konkrete redaktionelle Abläufe vereinfachen und mit den vorgesehenen Nutzerrechten geprüft sind.

Quellen: [Payload 3.84](https://github.com/payloadcms/payload/releases/tag/v3.84.0), [Payload 3.86](https://github.com/payloadcms/payload/releases/tag/v3.86.0).
