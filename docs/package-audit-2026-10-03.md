# Package-Update und Abhängigkeitsprüfung

Stand: 3. Oktober 2026. Versionen wurden direkt gegen die npm-Registry geprüft.

## Ergebnis

Die direkten Abhängigkeiten sind auf den neuesten stabilen, im Projekt kompatiblen Stand gebracht. Payload und alle Payload-Pakete verwenden einheitlich 3.90.2, Next.js und seine ESLint-Konfiguration 16.3.8, React und React DOM 19.3.0, Tailwind 4.3.3, Vitest 5.0.3 und Playwright 1.63.0. Das pnpm-Lockfile wurde aktualisiert.

Vier bewusst dokumentierte Ausnahmen von `latest`:

| Paket | Eingesetzt | Registry `latest` | Grund |
| --- | --- | --- | --- |
| `graphql` | 16.14.2 | 17.0.2 | Payload 3.90.2 verlangt GraphQL `^16.8.1`. |
| `typescript` | 6.0.3 | 7.0.2 | Die aktuellen TypeScript-ESLint-Pakete verlangen `<6.1.0`. |
| `eslint` | 9.39.5 | 10.12.0 | Die von Next verwendeten React-, Import- und Accessibility-Plugins unterstützen laut Peer-Abhängigkeiten ESLint 9. ESLint 9 selbst ist inzwischen als nicht mehr unterstützt markiert; die Plugin-Kompatibilität muss vor einem Wechsel auf 10 erneut geprüft werden. |
| `@types/node` | 24.19.1 | 26.6.4 | Das Projekt und Docker verwenden Node 24. |

## Entfernt oder ersetzt

| Paket | Begründung |
| --- | --- |
| `copyfiles` | Keine Verwendung in Quellcode, Konfiguration oder Scripts. |
| `@types/escape-html`, `@types/scroll-lock` | Die zugehörigen Bibliotheken werden nicht verwendet. |
| direkte `playwright`- und `playwright-core`-Deklarationen | Der Testcode importiert `@playwright/test`, das beide bereits mitbringt. |
| direktes `nodemailer`, `@types/nodemailer` | Das Projekt verwendet den Payload-Mailadapter. Dieser bringt Nodemailer selbst mit; die gepatchte Version 10 enthält eigene Typen. |
| `@eslint/eslintrc` | Die neue Next-Konfiguration unterstützt Flat Config direkt; der Kompatibilitätsadapter entfällt. |
| `autoprefixer` | Der Tailwind-4-PostCSS-Adapter übernimmt diese Verarbeitung. |
| `vite-tsconfig-paths` | Durch Vite 8 mit `resolve.tsconfigPaths: true` ersetzt. |

`@fluejs/noscroll` wurde zu den Laufzeitabhängigkeiten verschoben, weil es die mobile Navigation verwendet. `cross-env`, `dotenv` und `tailwindcss-animate` wurden den Entwicklungs-/Build-Abhängigkeiten zugeordnet. `vite` ist jetzt direkt deklariert, damit Vitest und das React-Plugin denselben kompatiblen Vite-8-Stand verwenden.

GraphQL, React DOM, PostCSS und die Typ-Pakete bleiben erhalten: Sie sind trotz teilweise fehlender direkter Imports für Frameworks, Peer-Abhängigkeiten beziehungsweise Typprüfung nötig. Knip wurde zusätzlich zur manuellen Prüfung von Imports, Konfigurationen und Scripts ausgeführt; nach der Bereinigung meldet es keine ungenutzten oder fehlenden direkten Abhängigkeiten. Die Analyse lief mit Platzhalterwerten, ohne echte Projekt-Zugangsdaten.

## Erforderliche Anpassungen

- `next lint` durch die ESLint-CLI ersetzt; die ESLint-Konfiguration verwendet Nexts native Flat Config.
- Neue React-Compiler-Diagnosen bleiben als Warnungen sichtbar. Die bisherigen Hooks-Prüfungen bleiben aktiv. Das Update ist keine vollständige Bereinigung der bestehenden Lint-Warnungen.
- `revalidateTag` bekommt `{ expire: 0 }`, um die bisherige sofortige Invalidierung in CMS-Hooks beizubehalten.
- Webpack bleibt für Entwicklung und Build explizit ausgewählt, da die vorhandene Next-Konfiguration eine Webpack-Anpassung enthält.
- Tailwind-Styles und Klassen mit dem offiziellen Upgrade-Werkzeug migriert. Safelist und Container-Anpassung wurden für Version 4 übernommen. Fälschlich umbenannte CMS-Auswahlwerte `outline` wurden wiederhergestellt; bestehende Inhalte benötigen deswegen keine Datenmigration.
- Lottie auf die neue API mit `src`, `LottieHandle`, `seek`/`play` und `subscriptions.complete` umgestellt.
- Die in Lucide 1 entfernten GitHub-, Instagram- und LinkedIn-Icons als lokale Komponenten erhalten. Die ursprüngliche ISC-Lizenz liegt unter `docs/licenses/`.
- TypeScript-Aliase ohne das veraltete `baseUrl` konfiguriert, bisherige `src/...`-Imports auf `@/...` umgestellt und Typdeklarationen für CSS-Imports ergänzt.
- Lokale Uploads werden als relative Medienpfade eingebunden. Next 16 erlaubt Cache-Parameter ausdrücklich nur für die Medienpfade; die verwendeten Bildqualitäten 75 und 100 sind konfiguriert.
- Payloads generierte Admin-Importmap und Typen wurden durch Next/Payload aktualisiert. Next 16 erzeugt außerdem die Projektdateien `AGENTS.md` und `CLAUDE.md` automatisch.

## Sicherheit

Der erste während des Updates erfasste `pnpm audit` meldete 199 Befunde, darunter fünf kritische. Nach Updates und gezielten Overrides bleibt ein hoher Befund:

`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`: Stack-Erschöpfung bei tief verschachtelten Glob-Mustern. Der Audit nennt keine gepatchte Version (`<0.0.0`). Der Pfad gehört zum Entwicklungswerkzeug ESLint; das beseitigt den Befund nicht, grenzt aber seine Verwendung ein.

Gezielte Overrides beheben veraltete indirekte Abhängigkeiten:

- `dompurify@3.2.7 → 3.4.16` im Monaco-Editor des Payload-Admins.
- `payload > undici → 7.30.0`.
- `@payloadcms/email-nodemailer > nodemailer → 10.0.13`. Der Adapter wurde zusätzlich mit lokalem JSON-Transport geprüft; es wurde dabei keine E-Mail versandt. Die SMTP-Konfiguration wurde an die geänderten Typen angepasst. Ein echter Versand wurde nicht geprüft.

Overrides bei zukünftigen Payload-Updates erneut prüfen und entfernen, sobald die Upstream-Abhängigkeiten dieselben Korrekturen enthalten. Installationsskripte für `@google/genai` und `protobufjs` bleiben gemäß der bestehenden eingeschränkten pnpm-Build-Script-Policy deaktiviert.

## Sinnvolle Alternativen

| Bereich | Einschätzung |
| --- | --- |
| `aos` und `react-just-parallax` | Beide sind im TextAnimation-Hero genutzt. Die bereits verwendete Motion-Bibliothek bietet Scroll- und Viewport-Animationen. Eine gezielte Umstellung könnte beide Packages und `@types/aos` einsparen. Dafür müssen Animation und Scroll-Verhalten auf Desktop und Mobil bewusst nachgebaut werden. |
| `framer-motion` | Der Hersteller dokumentiert `motion` mit Imports aus `motion/react` als heutigen Einstieg. Der Wechsel allein bedeutet keine nachgewiesene Größen- oder Performanceverbesserung. Die bestehende Bibliothek wurde auf 14.0.0 aktualisiert. |
| `next-sitemap` | Next bietet native `sitemap.ts`- und `robots.ts`-Routen. Das Paket ist hier tatsächlich für die Sitemap-Erzeugung und zwei dynamische XML-Routen genutzt. Ein Wechsel sollte Sitemap-URLs, Index, Caching und Staging-Robots gemeinsam erhalten. |
| `lottie-react` | Version 3 bietet `LottieSvg` und `LottieLight` als kleinere Renderer. `LottieSvg` ist ein Kandidat für die vorhandenen SVG-Animationen; `LottieLight` erst nach Prüfung, ob die JSON-Dateien Expressions benötigen. |
| Splide, Radix, React Hook Form, Payload-Plugins | Alle haben konkrete Verwendungen. Es gibt aus der Abhängigkeitsprüfung keinen begründeten Vorteil für einen pauschalen Ersatz. |

Herstellerdokumentation: [Next 16](https://nextjs.org/docs/app/guides/upgrading/version-16), [Cache-Revalidierung](https://nextjs.org/docs/app/api-reference/functions/revalidateTag), [Tailwind-Migration](https://tailwindcss.com/docs/upgrade-guide), [Vite-Alias-Auflösung](https://v8.vite.dev/config/shared-options#resolve-tsconfigpaths), [Motion-Migration](https://motion.dev/docs/react-upgrade-guide), [Next-Sitemaps](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

## Validierung

- `pnpm typecheck`: bestanden.
- `pnpm lint`: bestanden, keine Fehler; 59 Warnungen aus bestehenden Komponenten und den neuen Compiler-Diagnosen.
- `pnpm test:int`: drei Testdateien mit neun erfolgreichen Tests, einschließlich Datenbankzugriff, Analytics-Consent und Medien-URLs.
- `pnpm test:e2e`: Startseite in Chromium erfolgreich geprüft, ohne unbehandelte JavaScript-Fehler; Desktop- und Mobil-Screenshots unter `test-results/` visuell geprüft.
- `pnpm install --frozen-lockfile --ignore-scripts`: bestanden; Manifest und Lockfile sind konsistent.
- `pnpm build` einschließlich `postbuild`/Sitemap-Erzeugung: bestanden.
- Payload-Mailadapter mit Nodemailer 10 über JSON-Transport: bestanden, ohne Versand.
- Knip: keine weiteren ungenutzten oder fehlenden direkten Abhängigkeiten.
- `pnpm audit`: ein hoher, noch ungepatchter Befund im Lint-Werkzeug; keine kritischen Befunde.

Einige in der vorhandenen CMS-Datenbank referenzierte Upload-Dateien fehlen lokal. Der Browser-Test kann dadurch Layout und JavaScript prüfen, aber keine vollständige visuelle Bildprüfung garantieren. Next meldet außerdem bei einem vorhandenen `fill`-Bild einen statisch positionierten Parent; die allgemeine Medienkomponente wurde in diesem Update nicht umgebaut. Echter SMTP-Versand, eine produktive Gemini-Anfrage und eine Deployment-Prüfung gehören nicht zu den ausgeführten Tests.

## Aktualisierte Versionen

| Paket | Vorher | Jetzt |
| --- | --- | --- |
| `@google/genai` | ^1.46.0 | ^2.27.0 |
| `@payloadcms/admin-bar` | 3.80.0 | 3.90.2 |
| `@payloadcms/db-mongodb` | 3.80.0 | 3.90.2 |
| `@payloadcms/email-nodemailer` | 3.80.0 | 3.90.2 |
| `@payloadcms/live-preview-react` | 3.80.0 | 3.90.2 |
| `@payloadcms/next` | 3.80.0 | 3.90.2 |
| `@payloadcms/plugin-form-builder` | 3.80.0 | 3.90.2 |
| `@payloadcms/plugin-nested-docs` | 3.80.0 | 3.90.2 |
| `@payloadcms/plugin-redirects` | 3.80.0 | 3.90.2 |
| `@payloadcms/plugin-search` | 3.80.0 | 3.90.2 |
| `@payloadcms/plugin-seo` | 3.80.0 | 3.90.2 |
| `@payloadcms/richtext-lexical` | 3.80.0 | 3.90.2 |
| `@payloadcms/ui` | 3.80.0 | 3.90.2 |
| `@radix-ui/react-accordion` | ^1.2.12 | ^1.2.20 |
| `@radix-ui/react-checkbox` | ^1.3.3 | ^1.3.11 |
| `@radix-ui/react-label` | ^2.1.8 | ^2.1.15 |
| `@radix-ui/react-select` | ^2.2.6 | ^2.3.7 |
| `@radix-ui/react-slot` | ^1.2.4 | ^1.3.3 |
| `dotenv` | 17.3.1 | 18.0.5 |
| `framer-motion` | ^12.38.0 | ^14.0.0 |
| `graphql` | ^16.13.1 | ^16.14.2 |
| `lottie-react` | ^2.4.1 | ^3.1.2 |
| `lucide-react` | ^0.577.0 | ^1.51.0 |
| `next` | ^15.4.11 | ^16.3.8 |
| `payload` | 3.80.0 | 3.90.2 |
| `react` | 19.2.4 | 19.3.0 |
| `react-dom` | 19.2.4 | 19.3.0 |
| `react-hook-form` | 7.45.4 | 7.89.0 |
| `sharp` | 0.34.5 | 0.35.5 |
| `tailwind-merge` | ^3.5.0 | ^3.7.0 |
| `@playwright/test` | 1.56.1 | 1.63.0 |
| `@tailwindcss/typography` | ^0.5.19 | ^0.5.20 |
| `@testing-library/react` | 16.3.0 | 16.3.3 |
| `@types/aos` | ^3.0.7 | ^3.0.8 |
| `@types/node` | 22.5.4 | 24.19.1 |
| `@types/react` | 19.1.8 | 19.3.0 |
| `@types/react-dom` | 19.1.6 | 19.3.0 |
| `@vitejs/plugin-react` | 4.5.2 | 6.1.1 |
| `eslint` | ^9.39.1 | ^9.39.5 |
| `eslint-config-next` | 15.4.7 | 16.3.8 |
| `jsdom` | 26.1.0 | 30.1.1 |
| `postcss` | ^8.5.6 | ^8.5.28 |
| `prettier` | ^3.7.4 | ^3.9.9 |
| `tailwindcss` | ^3.4.18 | ^4.3.3 |
| `typescript` | 5.7.3 | 6.0.3 |
| `vitest` | 3.2.3 | 5.0.3 |
