# SEO-Bestandsaufnahme Staging, 5. November 2026

Geprüft: https://staging.the-easycode.eu, öffentliche Payload-REST-API und initiales HTML mit Twitterbot-User-Agent. Stand vor der CMS-Nachpflege und vor Veröffentlichung dieser Codeänderungen.

10 veröffentlichte Seiten, 5 Projekte, keine Artikel. Alle 16 geprüften URLs einschließlich Suche liefern HTTP 200. Alle 11 unterschiedlichen Vorschaubilder liefern bei GET HTTP 200. HEAD-Anfragen an Payload-Mediendateien liefern hier 404 und eignen sich nicht zur Verfügbarkeitsprüfung.

Staging ist per HTML noindex und HTTP-Header noindex, nofollow ausgeschlossen. Die 15 Inhaltsseiten haben einen passenden Staging-Canonical; die interne Suche hat keinen Canonical. Open Graph und Twitter verwenden bei allen geprüften Seiten dasselbe Bild.

## Auffälligkeiten

- Home enthält eine englische Payload-Template-Beschreibung und ein ausdrücklich gepflegtes Template-Bild. Der neue Code respektiert dieses SEO-Bild bis zur CMS-Nachpflege.
- Nur 4 von 10 Seiten besitzen eine individuelle SEO-Beschreibung; nur 3 besitzen ein ausdrückliches SEO-Bild.
- Kontakt liefert keine Meta-Beschreibung. Credits, Datenschutz und Impressum verwenden sehr kurze Beschreibungen aus dem Seiteninhalt.
- Alle 5 Projekte haben leere SEO-Felder; Titel und Beschreibungen stammen aus ihren Inhaltsfeldern.
- Die neue Bildregel lautet: ausdrückliches Payload-SEO-Bild, sonst /favicon.png. Inhalts-/Hero-Bilder bleiben für sichtbare Inhalte und deren strukturierte Daten erhalten.
- Die folgende redaktionelle Nachpflege in Staging ist erst nach authentifiziertem Zugriff möglich: favicon.png als SEO-Bild bei allen 15 Inhalten sowie individuelle Titel und Beschreibungen.

## Aktuell ausgelieferte Werte

### [/](https://staging.the-easycode.eu/)

- Titel: The-EasyCode
- Beschreibung: An open-source website built with Payload and Next.js.
- Vorschaubild: [image-hero1-1200x630.webp](https://staging.the-easycode.eu/api/media/file/image-hero1-1200x630.webp)

### [/suche](https://staging.the-easycode.eu/suche)

- Titel: Suche | The-EasyCode
- Beschreibung: Ihr Freelancer für Webentwicklung aus Dresden!
- Vorschaubild: [website-template-OG.webp](https://staging.the-easycode.eu/website-template-OG.webp)

### [/credits](https://staging.the-easycode.eu/credits)

- Titel: Credits | The-EasyCode
- Beschreibung: Credits
- Vorschaubild: [website-template-OG.webp](https://staging.the-easycode.eu/website-template-OG.webp)

### [/datenschutz](https://staging.the-easycode.eu/datenschutz)

- Titel: Datenschutz | The-EasyCode
- Beschreibung: Datenschutzerklärung
- Vorschaubild: [website-template-OG.webp](https://staging.the-easycode.eu/website-template-OG.webp)

### [/impressum](https://staging.the-easycode.eu/impressum)

- Titel: Impressum | The-EasyCode
- Beschreibung: Impressum
- Vorschaubild: [website-template-OG.webp](https://staging.the-easycode.eu/website-template-OG.webp)

### [/leistungen/dev-ops](https://staging.the-easycode.eu/leistungen/dev-ops)

- Titel: DevOps Freelancer | Hosting, CI/CD, Cloud & Automatisierung | The-EasyCode
- Beschreibung: DevOps Lösungen für stabile Systeme: Hosting, CI/CD Pipelines, Cloud-Infrastruktur, Backups und Automatisierung. Sicher, skalierbar und effizient.
- Vorschaubild: [Mail_EasyCode-1200x630.png](https://staging.the-easycode.eu/api/media/file/Mail_EasyCode-1200x630.png)

### [/freelancer](https://staging.the-easycode.eu/freelancer)

- Titel: Freelancer | The-EasyCode
- Beschreibung: Als Fullstack-Entwickler unterstütze ich Unternehmen und Agenturen bei der technischen Umsetzung digitaler Projekte. Pragmatisch, zuverlässig und mit Fokus…
- Vorschaubild: [website-template-OG.webp](https://staging.the-easycode.eu/website-template-OG.webp)

### [/leistungen/web-entwicklung](https://staging.the-easycode.eu/leistungen/web-entwicklung)

- Titel: Webentwicklung Freelancer | Websites & Softwarelösungen | The-EasyCode
- Beschreibung: Full-Stack Webentwicklung für Startups & Unternehmen: Performante Websites, Webapps und individuelle Softwarelösungen. Modern & skalierbar umgesetzt.
- Vorschaubild: [Wallner_EasyCode-1200x630.png](https://staging.the-easycode.eu/api/media/file/Wallner_EasyCode-1200x630.png)

### [/projekte](https://staging.the-easycode.eu/projekte)

- Titel: Kundenprojekte | Webseiten, E-Commerce & Individualsoftware | The-EasyCode
- Beschreibung: Referenzen für moderne Webentwicklung aus Dresden: Webseiten, E-Commerce, Dashboards & individuelle Softwarelösungen.
- Vorschaubild: [EasySplit-1200x630.png](https://staging.the-easycode.eu/api/media/file/EasySplit-1200x630.png)

### [/leistungen](https://staging.the-easycode.eu/leistungen)

- Titel: Leistungen | The-EasyCode
- Beschreibung: Als freiberuflicher Webentwickler aus Dresden realisiere ich maßgeschneiderte Websites für Unternehmen jeder Größe, entwickle skalierbare…
- Vorschaubild: [Destillerie_EasyCode-1200x630.png](https://staging.the-easycode.eu/api/media/file/Destillerie_EasyCode-1200x630.png)

### [/kontakt](https://staging.the-easycode.eu/kontakt)

- Titel: Kontakt | The-EasyCode
- Beschreibung: FEHLT
- Vorschaubild: [website-template-OG.webp](https://staging.the-easycode.eu/website-template-OG.webp)

### [/projekte/queo/mes-dashboard-zur-steuerung-von-reparaturprozessen](https://staging.the-easycode.eu/projekte/queo/mes-dashboard-zur-steuerung-von-reparaturprozessen)

- Titel: MES-Dashboard zur Steuerung von Reparaturprozessen | The-EasyCode
- Beschreibung: Entwicklung eines internen MES-Dashboards für Jungheinrich zur Steuerung und Nachverfolgung von Reparaturprozessen bei Gebrauchtgeräten inklusive…
- Vorschaubild: [dashboard-chakraUI-dummy-optimized-1200x630.png](https://staging.the-easycode.eu/api/media/file/dashboard-chakraUI-dummy-optimized-1200x630.png)

### [/projekte/wallner-bau-und-garten/moderne-handwerker-webseite-fuer-wallner-bau--garten](https://staging.the-easycode.eu/projekte/wallner-bau-und-garten/moderne-handwerker-webseite-fuer-wallner-bau--garten)

- Titel: Moderne Handwerker-Webseite für Wallner Bau & Garten | The-EasyCode
- Beschreibung: Entwicklung einer modernen Unternehmenswebseite für Wallner Bau & Garten zur professionellen Präsentation von Bau-, Renovierungs- und Gartenbauleistungen…
- Vorschaubild: [Mockup-2-screens-optimized-1200x630.png](https://staging.the-easycode.eu/api/media/file/Mockup-2-screens-optimized-1200x630.png)

### [/projekte/colpari/moderne-unternehmenswebseite-fuer-b2b-kunden](https://staging.the-easycode.eu/projekte/colpari/moderne-unternehmenswebseite-fuer-b2b-kunden)

- Titel: Moderne Unternehmenswebseite für B2B Kunden | The-EasyCode
- Beschreibung: Moderne B2B-Unternehmenswebseite für colpari. Eine skalierbare Customer-Service-Plattform mit CMS, Wissensdatenbank, Blog und optimiertem Lead-Onboarding.
- Vorschaubild: [colpari_mockup_optimized-1200x630.png](https://staging.the-easycode.eu/api/media/file/colpari_mockup_optimized-1200x630.png)

### [/projekte/queo/enterprise-dashboard-angular-extjs-fuer-bmw](https://staging.the-easycode.eu/projekte/queo/enterprise-dashboard-angular-extjs-fuer-bmw)

- Titel: Enterprise Dashboard: Angular & ExtJS für BMW | The-EasyCode
- Beschreibung: Entwicklung eines zentralen Dashboards zur Verwaltung und Pflege komplexer Fahrzeuginformationen innerhalb einer BMW Business-Anwendung.
- Vorschaubild: [Dashboard-dummy-optimized-1200x630.png](https://staging.the-easycode.eu/api/media/file/Dashboard-dummy-optimized-1200x630.png)

### [/projekte/destillerie-schneider/moderner-e-commerce-fuer-hochwertige-spirituosen](https://staging.the-easycode.eu/projekte/destillerie-schneider/moderner-e-commerce-fuer-hochwertige-spirituosen)

- Titel: Moderner E-Commerce für hochwertige Spirituosen | The-EasyCode
- Beschreibung: Eine moderne, schnelle und markenstarke E-Commerce-Plattform für die Destillerie Schneider. Entwickelt mit GatsbyJS und Strapi, inklusive automatischer…
- Vorschaubild: [Laptop_Mockup_Luchs-Destille-1200x630.jpg](https://staging.the-easycode.eu/api/media/file/Laptop_Mockup_Luchs-Destille-1200x630.jpg)

## API-Zugang für die Nachpflege

Die Users-Collection aktiviert `auth.useAPIKey: true`. Nach dem Deployment im Staging-Admin den Benutzer öffnen und einen API-Schlüssel generieren. Den einmal angezeigten Schlüssel ausschließlich in der lokalen, von Git ausgeschlossenen `.env` unter `STAGING_PAYLOAD_API_KEY=` eintragen. Der Schlüssel besitzt die Rechte des Benutzers. Nach Abschluss im Admin widerrufen. Headerformat: `Authorization: users API-Key <key>`.
