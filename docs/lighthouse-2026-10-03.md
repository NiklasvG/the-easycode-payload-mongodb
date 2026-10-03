# Lighthouse-Optimierungen vom 3. Oktober 2026

Ausgangspunkt: Desktop-Bericht für `https://staging.the-easycode.eu/`, 18:24 Uhr Berlin. Performance 100, Accessibility 89, Best Practices 96, SEO 69. Die Hinweise des Berichts wurden als Prüfbefunde behandelt.

## Änderungen

| Befund | Umsetzung |
| --- | --- |
| LCP-Bild ohne hohe Abrufpriorität | `ImageMedia` verwendet für priorisierte Bilder `loading="eager"` und `fetchPriority="high"`. Der Hero bleibt im initialen HTML. |
| Zu große Hero- und Projektbilder | `sizes` entspricht der begrenzten Hero-Höhe sowie den Container-, Spalten- und Innenabständen der Projektkarten. Zusätzliche Bildbreiten 480, 512 und 560 reduzieren den Sprung zur bisherigen 640-/750-Pixel-Variante. |
| Überdimensioniertes Headerlogo und falsches Seitenverhältnis | Statischer Bildimport liefert die echten Abmessungen und versionierte URLs; responsive Größen 170/212 Pixel entsprechen der Darstellung bei 32/40 Pixel Höhe. |
| Überdimensionierte Kundenlogos | Intrinsische CMS-Abmessungen, auf die verfügbare Höhe begrenzte Darstellung und entsprechende `sizes`; kleine Bildvarianten einschließlich 100 Pixel. |
| Ungültige ARIA-Rollen und Rollen auf inkompatiblen Listenelementen | Slider verwenden `div` für Track, Gruppe und Slides. Splide kann dort gültige Gruppenrollen setzen. Die manuelle Pagination bleibt eine native Liste; der aktive Punkt erhält `aria-current`. Slider-Bezeichnungen werden über Splide-Optionen gesetzt, da Splide das HTML-Attribut beim Mount überschreibt. |
| Fehlendes Haupt-Landmark | Ein gemeinsames `<main>` umschließt den Seiteninhalt aller öffentlichen Routen. |
| Unzureichende Kontraste | Karten-Metadaten verwenden `text-muted-foreground`; Text auf der türkisen Akzentfläche ist dunkel. |
| Zusätzlich gefundene Footer-Landmarks | Jede Footer-Navigation besitzt eine Bezeichnung aus ihrer CMS-Sektionsüberschrift. |
| Zusätzlich geprüfte Consent-/Chat-Zustände | Cookie-Einstellungen erhalten ein benanntes Landmark; der Chat-Senden-Button eine zugängliche Beschriftung. |
| Unbenutztes JavaScript | Chat und Markdown-Renderer werden erst beim ersten Öffnen geladen; Chat-Verlauf und Zustand bleiben nach dem Schließen erhalten. |
| DOM-Größe und Slider-Arbeit | Der Zitat-Slider verwendet `slide` mit `rewind` statt geklonter Loop-Slides. Navigation bleibt zyklisch. |
| Nicht compositierte Bildanimationen | Kundenlogos animieren ausdrücklich nur `filter`, statt mit `transition-all` auch Splides Sichtbarkeitswechsel zu animieren. |
| Reduzierte Bewegung | Automatisches Logo-Scrolling wird bei `prefers-reduced-motion` deaktiviert. Fokus pausiert das automatische Scrolling. |
| Hydration mit reduzierter Bewegung | Hero und animierte Überschrift verwenden beim ersten Browserrender denselben Preference-Snapshot wie der Server; danach wird die Browsereinstellung übernommen. Dies behebt den gefundenen React-Hydration-Fehler. Projektkarten sind bereits im initialen HTML sichtbar; Filterwechsel behalten ihre Animationen. |
| CSS-Abhängigkeiten | Doppelte Splide-Core-Stylesheet-Imports entfernt. |
| Sicherheitsheader | COOP `same-origin-allow-popups`, CSP-Grundschutz für `object-src`, `base-uri` und `frame-ancestors`; HSTS mit einem Jahr Laufzeit bei konfiguriertem HTTPS-Ursprung. Keine globale HTTPS-Erzwingung für lokale Entwicklung. |

## Grenzen und bewusst beibehaltenes Verhalten

- **SEO:** Staging bleibt durch `X-Robots-Tag` und `robots.txt` von der Indexierung ausgeschlossen. Produktion besitzt diese Sperre bereits nicht. Der SEO-Abzug auf Staging ist daher erwartbar.
- **Forced reflow:** Splide muss beim Initialisieren und beim responsiven Layout Größen messen. Die Bibliothek wird weiterhin für Dragging und Slider-Steuerung benötigt. Aus dem PDF ohne Quellzuordnung lässt sich kein zusätzlicher konkreter Anwendungscode-Verursacher nachweisen; eine vollständige Entfernung der Layoutmessungen wird nicht behauptet.
- **Legacy JavaScript:** Der Bericht nennt Next.js-Browserpolyfills. Die installierte Next.js-Version unterstützt moderne Browser bereits standardmäßig. Framework-Polyfills werden nicht durch undokumentierte Webpack-Aliase entfernt.
- **Render-blocking CSS / Request-Ketten:** Der Bericht nennt keine messbare Render-Verzögerung (0 ms). Notwendige Layout-Styles werden weiterhin vor dem ersten Render geladen, um Flackern und Layoutverschiebungen zu vermeiden. Keine zusätzliche externe Preconnect-Adresse wird benötigt.
- **Strikte CSP / Trusted Types:** Der ergänzte CSP-Grundschutz ist keine vollständige XSS-Policy. Eine Nonce-Policy würde laut installierter Next.js-Dokumentation dynamisches Rendering erfordern und die bestehende statische Generierung/ISR verändern. Trusted Types benötigt eine Kompatibilitätsprüfung von Next.js, Payload, Animationen und Analytics; die Durchsetzung wird nicht ungeprüft aktiviert. Referenz: [Next.js CSP-Guide](../node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md), [MDN COOP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy), [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).
- **Identische Links:** CMS-Linkbeschriftungen können sich bei gleichem Ziel unterscheiden. Sie werden nicht automatisch durch URLs ersetzt; die redaktionellen Beschriftungen und ihr Kontext bleiben erhalten.
- **Browserkompatibilität / manuelle Accessibility-Prüfungen:** Die Feature-Liste ist kein Fehlerbefund. Tastaturführung und Inhalte müssen weiterhin manuell geprüft werden; automatische Audits decken nicht jede Barriere ab.

## Prüfung

TypeScript, ESLint, bestehende Integrationstests, Produktionsbuild und Browserprüfungen für die reale lokale Inhaltskopie. Neue Browserregressionen prüfen Hauptbereich, Slider-Rollen, Logo-Seitenverhältnis, LCP-Attribute, Öffnen/Schließen des verzögert geladenen Chats sowie Zitat-Pagination. Die vorhandenen Tests prüfen Desktop/Mobil und vollständigen Inhalt ohne JavaScript.

Eine lokale axe-Prüfung der Startseite überprüft zusätzlich Kontraste und ARIA. Die Ergebnisse ersetzen keine neue Lighthouse-Auswertung des veröffentlichten Stands. Ein neuer Score wird erst nach Deployment und erneuter Messung angegeben.

Abschlussergebnis: Produktionsbuild, TypeScript und ESLint erfolgreich; 56 Integrationstests bestanden (4 bestehende Tests übersprungen), 4 Produktions-Browserchecks bestanden. Bei 1440 und 390 Pixel Breite keine axe-Verstöße in den Zuständen mit Cookie-Einstellungen, mit geschlossenem und mit geöffnetem Chat; keine Browserfehler. Chat-Chunk vor dem Öffnen nicht angefordert, nach dem Öffnen geladen. Logo-Scrolling bei reduzierter Bewegung gestoppt. [Maschinenlesbare Prüfergebnisse](measurements/lighthouse-code-verification-2026-10-03.json).
