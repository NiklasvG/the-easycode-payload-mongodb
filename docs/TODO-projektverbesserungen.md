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
- [x] Bei Slug-Änderungen alte und neue URL berücksichtigen; Änderungen an verknüpften Clients und Medien ebenfalls prüfen.
- [x] Header, Footer, Weiterleitungen und Sitemaps nach Änderungen kontrollieren.
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

- [x] Startseite, Projektübersicht und synthetische Projektseite mobil/Desktop je dreimal messen: LCP, CLS, Bytes, TTFB, vollständige Antwortzeit und kontrollierte Interaktionen.
- [ ] Repräsentative echte Bilder und Real-User-INP nach Consent in der tatsächlichen Installation auswerten.
- [x] Frische Browser, neue Serverprozesse und Wiederholungen getrennt messen; reproduzierbaren Docker-Buildvergleich mit erhaltenem Cache bereitstellen.
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
- [x] Zunächst Entwicklung ohne `--webpack` testen: Admin, Live Preview, SCSS/CSS, lokale Icons, Lottie und Hot Reload.
- [x] Anschließend Produktionsbuild und Docker-Image mit Turbopack prüfen.
- [x] Build-Dauer und Speicherbedarf unter gleichen Bedingungen mit Webpack vergleichen; Cache-Erhalt im Build-System berücksichtigen.
- [x] Geprüfte Turbopack-Scripts und Docker-Schalter ergänzen; wegen höherem Speicherbedarf und zwei sporadischen Standalone-Testfehlern Webpack als Standard erhalten.

**Fertig, wenn:** Entwicklung und Docker-Deployment mit Turbopack zuverlässig laufen und der Vergleich einen praktischen Nutzen zeigt.

Quelle: [Next.js – Turbopack-Konfiguration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack).

### 8. Cache Components und `use cache` schrittweise einführen

**Ursprüngliche Ausgangslage:** `cacheComponents` ist nicht aktiviert. Es bestehen explizite `unstable_cache`-Hilfen und dynamische Frontend-Routen für das Deployment ohne Datenbankzugriff beim Build.

- [x] Öffentliche CMS-Daten, nutzerabhängige Daten und Preview-Daten getrennt erfassen; Laufzeitvoraussetzungen der vorhandenen Routen prüfen.
- [x] Payload-Kompatibilität sowie Route-Konfiguration, Draft Mode und Streaming unter dem neuen Modell prüfen.
- [x] Einen begrenzten Prototyp für öffentliche Projektdaten erstellen; Cache-Lebensdauer und Tags ausdrücklich definieren.
- [x] Dynamische Teile mit sinnvollen Suspense-Grenzen versehen und Admin-/Preview-Daten aus gemeinsam genutzten öffentlichen Caches heraushalten.
- [x] Prüfen, ob Prerendering Datenbankzugriff beim Build voraussetzt; die bestehende Docker-Build-Strategie bewusst erhalten oder anpassen.
- [x] Die Revalidierungsprüfungen aus Punkt 2 wiederholen; erst dann weitere Cache-Hilfen migrieren.

**Fertig, wenn:** Öffentliche Seiten sinnvolle Hüllen sofort zeigen, Änderungen korrekt sichtbar werden und Build, Vorschau und Berechtigungen weiterhin funktionieren. Der optionale use-cache-Datencache bleibt nach dem gescheiterten Invalidierungstest deaktiviert.

Quelle: [Next.js – Migration zu Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components).

### 9. Instant Navigations und Partial Prefetching nutzen

**Voraussetzung:** Das neue Cache-Modell aus Punkt 8 funktioniert zuverlässig.

- [x] Projektübersicht → Detailseite als ersten Anwendungsfall wählen.
- [x] `partialPrefetching` zusammen mit Cache Components nach der passenden Versionsdokumentation prüfen.
- [x] Sofort sichtbare Seitenteile und passende Ladezustände definieren; gezielte Suspense-Grenzen setzen.
- [x] Instant Insights beziehungsweise Navigation Inspector verwenden, um blockierende Teile zu erkennen.
- [ ] Netzwerkverkehr und Server-/Datenbanklast durch Prefetching vergleichen; nicht unnötig vollständige Inhalte aller Karten vorladen.
- [x] Mit dem versionskompatiblen `instant()`-Playwright-Helfer prüfen, welche Teile unmittelbar bei einem Seitenwechsel sichtbar sein müssen.

**Fertig, wenn:** Die geprüften Seitenwechsel sofort sinnvolle UI zeigen, ohne übermäßige zusätzliche Requests oder veraltete Inhalte.

Quelle: [Next.js – Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching).

### 10. Animationen vereinheitlichen und Client-Code reduzieren

**Ursprüngliche Ausgangslage:** Der TextAnimation-Hero verwendet AOS und `react-just-parallax`; Motion ist bereits zusätzlich im Projekt vorhanden.

- [x] Scroll- und Viewport-Animationen aus AOS und Parallax mit der vorhandenen Motion-Bibliothek prototypisch nachbauen.
- [x] `prefers-reduced-motion`, Tastaturbedienung, mobile Darstellung und Scroll-Verhalten prüfen.
- [x] Nicht sofort benötigte Animationen bei Bedarf verzögert laden und Client-Grenzen kleiner halten.
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

- [x] Nach Bereinigung der einschlägigen Lint-Warnungen den Compiler in einer separaten Änderung testen.
- [x] Interaktive Komponenten mit React Profiler vor und nach Aktivierung vergleichen.
- [x] Bestehende Memoisierung nur nach Prüfung vereinfachen; nicht pauschal entfernen.

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

## Umsetzungsstand und weitere Optimierungen

58 Integrationstests und 17 Produktions-Browserfälle sind geprüft; ESLint meldet 0 Fehler und 0 Warnungen. Webpack-Produktionsbuild erfolgreich. Turbopack-Entwicklung: Admin, alle Lottie-Icons und CSS-Hot-Reload ohne Seitenneuladung geprüft. Docker kompiliert ohne Netzwerk und ohne Datenbank. Einzelheiten und Grenzen stehen in den verlinkten Prüfberichten. Alle Commits bleiben lokal; kein Push oder Deployment.

| Bereich | Ergebnis |
| --- | --- |
| Sicherheit | Authentifizierte CMS-Schreibzugriffe, Globals/Plugins/Jobs geschützt, öffentliche Erstregistrierung gesperrt, Login-/Reset-Budgets und Sperre, private Form-Maildaten verborgen. Anonyme Manipulation per REST/GraphQL getestet. [Endpunkte](endpoint-security.md). |
| Öffentliche Formulare und KI | Strenge Feld-/Body-/Origin-Prüfung, begrenzte History und Rate-Limit-Speicher, Provider-Timeout, Backpressure/Abbruch, vollständige Streaming-Texte. Öffentliche Einsendungen sind ausdrücklich beabsichtigt. |
| CMS-Korrektheit | Client-Änderungen aktualisieren den Suchindex; Nested Pages, Header/Footer, Redirects, Medien und Projekt-Lifecycle werden als Systemtests geprüft. Draft-Cookies nach Logout geben keinen Zugriff. |
| Navigation | Cache Components, explizite Laufzeitgrenzen und Partial Prefetching aktiviert. Zwei instant()-Tests bestätigen sofortige Lade-UI. [Cache](cache-components.md), [Navigation](instant-navigation.md). |
| Komponenten | Formular-/Block-/Suchtypen bereinigt, gemeinsame Projektformatierung, korrekte Video-URLs, deutsche Sprache/konsistente SEO-URLs, fehlende Inhalte mit Noindex. Suche bewahrt Query-Parameter und kodiert Sonderzeichen. |
| Ressourcen | Mobile Hero-Layoutverschiebung von CLS 0,126 auf 0 in der Nachprüfung reduziert; verzögerte Bildantwort als Regression geprüft. Lizenzkonforme lokale Fonts; Mono ohne erzwungenes Preload. Lottie lädt nur gewählte sichtbare Icons. Alle 18 Icons mobil/Desktop und reduzierte Bewegung geprüft. [Animationen](animations.md). |
| Werkzeuge | Reproduzierbare Compiler- und Buildexperimente, kalte/warme Performance-Messung, ressourcenschonende Integrationstests, Produktions- und Standalone-Browserprüfung in CI. [Tests](testing.md), [Performance](performance.md). |

### Bewusst nicht aktiviert

- **React Compiler:** Profilervergleich durchgeführt, kein belastbarer Nutzen; gemäß ursprünglichem Fertig-Kriterium zurückgestellt. [Messungen](react-compiler.md).
- **Zusätzlicher use-cache-Datencache:** Der integrierte Versuch scheiterte im Turbopack-Standalone-Image am Slug-Invalidierungstest und wurde aus Projektdetails entfernt. Bestehende öffentliche Caches und aktuelle Payload-Abfragen bleiben. Cache Components/Streaming funktionieren unabhängig davon. [Befund](cache-components.md).

### Offen: mit deinen Angaben oder Zugängen

- **Echte Bilder:** Originale samt Payload-Varianten für einen aussagekräftigen Qualitätsvergleich 75/85/100 und eine repräsentative Bild-Performance-Prüfung.
- **Betrieb:** Zugriff auf tatsächliches Coolify/Umami/Monitoring sowie zusammengehörige MongoDB- und Medienbackups für Alarmtest und isolierte Wiederherstellung. Lokale Testdaten ersetzen diese Nachweise nicht.
- **Redaktionsbedarf:** Anforderungen für eigenes Admin-Dashboard oder Datei-Anhänge einschließlich Typen, Größe, Zugriff und Aufbewahrung. Ohne Bedarf keine zusätzlichen Funktionen.
- **Deployment:** Verifizierte Proxy-IP-/Body-Limits und instanzübergreifende Drosselung an der tatsächlichen Infrastruktur. Die Anwendung vertraut standardmäßig keinem frei gesetzten X-Forwarded-For-Header.
- **CI auf GitHub:** Workflow/Branch-Prüfungen nach einem ausdrücklich freigegebenen Push tatsächlich ausführen. Aktuell kein Push.

### Weitere technische Experimente und bekannte Grenzen

- [ ] Turbopack-Preview-/Sitemap-Sporadik isolieren; erst nach wiederholt erfolgreichen Tests und verifiziertem Speicherbudget als Deployment-Standard freigeben.
- [ ] Den reproduzierten use-cache-Invalidierungsfehler mit der installierten Next-/Payload-Kombination isolieren; erst nach bestandenem Standalone-Lifecycle-Test integrieren. Aktuell kein Sicherheits- oder Korrektheitskompromiss zugunsten dieses optionalen Caches.
- [ ] Netzwerk-/Datenbanklast bei langen Projektlisten und gezieltem Prefetch vergleichen; vorhandene Karten laden nicht pauschal vollständige dynamische Details vor.
- [ ] Animationstransfer mit einem identischen alten Build vergleichen; das verzögerte Laden ist geprüft, eine genaue pauschale Byte-Ersparnis nicht belegt.
- [ ] Abbruchfehler unter Parallel-Last gegenüber normalen Browserabbrüchen getrennt untersuchen; lokale kontrollierte Abbrüche sind getestet.
- [ ] Dependency-Ausnahmen nach einem geeigneten Upstream-Fix erneut prüfen; den weiterhin ungepatchten braces-Befund nicht durch ungeprüfte Versionserzwingung verschieben.
