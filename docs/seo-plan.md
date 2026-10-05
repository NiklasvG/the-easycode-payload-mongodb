# SEO- und KI-Auffindbarkeitsplan für The-EasyCode

Stand: 5. Oktober 2026. `[x]` bedeutet im Repository umgesetzt oder als bestehende Funktion geprüft, nicht bereits veröffentlicht. `[ ]` bedeutet noch offen. Zuständigkeiten: **Code**, **CMS/Pflege**, **Betrieb**.

## Ausgangslage und Grenzen der Analyse

Die Website nutzt Next.js 16.3.8 mit App Router und Payload 3.90.2. Seiten werden aus `pages`, Blogartikel aus `posts` und Referenzen aus `projects` erzeugt. Seiten unterstützen verschachtelte Elternpfade; Projekt-URLs enthalten Kunden- und Projekt-Slug. Der Payload-SEO-Tab war für Seiten und Artikel vorhanden, für Projekte fehlte er.

Gut vorhanden sind serverseitige Ausgabe, statische Generierung mit ISR, Veröffentlichung/Entwürfe, CMS-gesteuerte Cache-Invalidierung, Canonicals, native paginierte Sitemaps, Bildvarianten, lokale Schriftdateien und ein Staging-Indexierungsschutz. Das sind tragfähige Voraussetzungen für SEO und Suchsysteme mit KI.

Konkrete Lücken im Ausgangscode: Der CMS-Titelgenerator fügte `| The-EasyCode` hinzu und die Frontend-Metadaten hängten denselben Zusatz erneut an. Strukturierte Daten und sichtbare Breadcrumbs fehlten. Die interne Suche war indexierbar und in der Sitemap enthalten. Die allgemeine Crawlersperre für `/api/` erfasste auch `/api/media/file/`, wo Payload die Bilder ausliefert. Geschlossene Radix-FAQ-Antworten wurden erst beim Öffnen eingebunden. Metadaten und Sitemap verwendeten unterschiedliche URL-Fallbacks. Das Artikel-Feld `relatedPosts` wurde auf der Detailseite nicht ausgegeben.

Die Analyse basiert auf dem Repository, den installierten Next.js-Guides und den unten verlinkten offiziellen Quellen. Der öffentliche Abruf von `https://the-easycode.eu/`, `robots.txt` und `sitemap.xml` war in dieser Umgebung nicht zuverlässig möglich; der HTTP-Abruf scheiterte an der TLS-Verbindung. Daraus folgt **kein bestätigter TLS-Fehler der Live-Website**. Eine vollständige Bestandsaufnahme aller aktuellen CMS-Texte, Indexierungsdaten, Backlinks und echten Besuchermessungen steht aus. Der bestehende Lighthouse-Bericht in `docs/lighthouse-2026-10-03.md` bezieht sich auf Staging; dessen SEO-Abzug durch `noindex` ist beabsichtigt.

Die verfügbare lokale CMS-Kopie enthält 10 öffentliche Seiten, 5 Projekte und keine Artikel. Nur 4 Seiten haben ein gefülltes SEO-Beschreibungsfeld, 3 ein SEO-Bild. Die fünf Projekte besitzen eine Kurzbeschreibung, aber noch keine gepflegten Projekt-SEO-Felder. Konkrete Pflegepriorität: Startseite mit einem aussagekräftigeren Titel als nur „The-EasyCode“; `/leistungen`, `/freelancer` und `/kontakt` mit individuellen Beschreibungen; SEO-Bilder für die Projektübersicht und alle Referenzen ergänzen. Die Kontaktseite erhält ihre H1 bereits aus dem ContactIntro-Block, nicht aus dem deaktivierten Hero. Diese Befunde beziehen sich auf die lokale Kopie und müssen mit dem aktuellen Live-CMS abgeglichen werden.

**Dringend:** Die gepflegte Startseiten-Beschreibung lautet in der lokalen Kopie noch „An open-source website built with Payload and Next.js.“. Dies ist ein Template-Text und muss im CMS durch eine eigene deutsche Beschreibung des Angebots ersetzt werden. Der Code respektiert ausdrücklich gepflegte SEO-Texte und überschreibt sie nicht ungefragt.

## Priorität 1: technische Basis – direkt umgesetzt

- [x] **Code:** Titel normalisieren: der Marken-Suffix erscheint einmal. Individuelle SEO-Titel bleiben nutzbar.
- [x] **Code:** Canonicals, Open Graph, JSON-LD, Sitemap und KI-Verzeichnis verwenden denselben konfigurierten Ursprung aus `NEXT_PUBLIC_SERVER_URL`.
- [x] **Code:** Individuelle Beschreibungen bevorzugen; bei leeren SEO-Feldern sichtbaren Hero-Text, Projekt-Kurzbeschreibung oder Artikeltext als begrenzten Fallback verwenden. Das ersetzt keine redaktionell gute Beschreibung.
- [x] **Code:** Social-Metadaten pro Seite einschließlich Twitter-Karte, deutscher Open-Graph-Locale und Bild-Alttext. Bildauswahl: SEO-Bild → Hero-Bild → Projekt-Listenbild → Seiten-Hero → bestehendes Standardbild.
- [x] **Code:** SEO-Tab für Projekte mit Titel, Beschreibung, Bild, Vorschau und Indexierungseinstellung ergänzen. Generierte Payload-Typen aktualisieren; bestehende Inhalte benötigen keine Pflichtfeld-Nachpflege.
- [x] **Code:** `meta.noIndex` für Seiten, Artikel und Projekte ergänzen; ausgeschlossene Inhalte bleiben öffentlich erreichbar, werden aber aus Sitemap und `llms.txt` entfernt.
- [x] **Code:** Interne Suche auf `noindex, follow` setzen und aus der Sitemap entfernen. Crawling der Suche bleibt erlaubt, damit Suchmaschinen das `noindex` lesen können.
- [x] **Code:** Drafts, Vorschauen und Staging mit `noindex` versehen. Den vorhandenen Staging-Header und die vollständige Staging-Crawlersperre erhalten.
- [x] **Code:** Payload-Mediendateien ausdrücklich zum Crawling freigeben. CMS-/API-/Preview-Bereiche bleiben in `robots.txt` gesperrt. Zugriffsschutz erfolgt weiterhin durch Payload, nicht durch `robots.txt`.
- [x] **Code:** Alternative Seitenpfade dauerhaft auf den CMS-Pfad umleiten, einschließlich `/home` → `/`.
- [x] **Code:** FAQ-Antworten vollständig ins initiale HTML aufnehmen und über native `details`/`summary` auch ohne JavaScript zugänglich machen. Mehrere Antworten können gleichzeitig geöffnet sein.
- [x] **Code:** Gepflegte verwandte Artikel als interne Links ausgeben. Artikel zeigen Veröffentlichungs- und Änderungsdatum.

## Priorität 1: strukturierte Daten – direkt umgesetzt

- [x] **Code:** JSON-LD serverseitig ausgeben und `<` sicher serialisieren, damit CMS-Texte kein Script-Element beenden können.
- [x] **Code:** `WebSite` und eine minimale `Organization` für die Marke verknüpfen. Keine ungeprüften Adressen, Telefonnummern oder Social-Profile ergänzen.
- [x] **Code:** `WebPage` für öffentliche Inhalte; kanonische URL, Titel, verfügbare Beschreibung, Sprache und echtes Inhaltsbild verknüpfen.
- [x] **Code:** `BlogPosting` für Artikel mit gepflegten öffentlichen Autorennamen, Veröffentlichung, Aktualisierung und Verweis auf die Seite.
- [x] **Code:** `CreativeWork` für Projektberichte. Ein Projektbericht ist kein verkäufliches Produkt; deshalb keine erfundenen `Product`-, Preis- oder Bewertungsdaten.
- [x] **Code:** `BreadcrumbList` und dazu passende sichtbare Breadcrumb-Navigation. Für Projekte: Startseite → Projekte → Projekt. Keine nicht existierende Kunden-Unterseite verlinken.
- [ ] **CMS/Pflege:** Unternehmensname, Inhaber, Standort, Kontakt und verifizierte Profile konsistent auf Über-mich-/Kontakt-/Impressumsseite pflegen. Erst dann Person-/Unternehmensschema um bestätigte Angaben erweitern.
- [ ] **CMS/Pflege:** Bei jedem Artikel einen echten Autor, korrektes Veröffentlichungsdatum und ein passendes Hero-/SEO-Bild pflegen. Ohne diese Inhalte kann Code keine vollständigen Artikeldaten erzeugen.
- [ ] **Betrieb:** Nach Veröffentlichung Startseite, verschachtelte Leistungsseite, Artikel und Projekt im [Schema Markup Validator](https://validator.schema.org/) sowie für unterstützte Typen im [Rich Results Test](https://search.google.com/test/rich-results) prüfen.

Strukturierte Daten müssen den sichtbaren Inhalt beschreiben. Sie garantieren keine Rich Results und keinen Rankinggewinn. FAQ-Rich-Results werden laut Googles aktuellem Änderungsprotokoll seit Mai 2026 nicht mehr angezeigt; deshalb wird hier kein FAQ-Schema als Sichtbarkeitsversprechen ergänzt. Siehe [Google: strukturierte Daten](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) und [Änderungsprotokoll](https://developers.google.com/search/updates).

## Priorität 1: Inhalte und Pflege – deine Checkliste

### Für jede wichtige Seite

- [ ] **CMS/Pflege:** Eine konkrete Suchabsicht festlegen: Welche Leistung sucht welcher Kunde? Beispiel: „Webentwicklung Dresden“ für eine passende Einstiegsseite, „Payload CMS Entwicklung“ für eine eigenständige fachliche Leistungsseite. Keine nahezu identischen Ortsseiten anlegen.
- [ ] **CMS/Pflege:** Eindeutigen SEO-Titel schreiben, z. B. `Payload CMS Entwicklung | The-EasyCode`. Thema/Nutzen zuerst; ungefähr 50–60 Zeichen als Orientierung, nicht als technische Pflicht.
- [ ] **CMS/Pflege:** Eine einzigartige Beschreibung formulieren: Leistung, Zielgruppe, belegbarer Vorteil und nächster Schritt. Ungefähr 140–160 Zeichen als Orientierung. Suchmaschinen können trotzdem einen anderen Text anzeigen.
- [ ] **CMS/Pflege:** Eine klare Hauptüberschrift verwenden und Inhaltsabschnitte sinnvoll als H2/H3 gliedern. In Rich Text keine zusätzlichen H1 für Unterabschnitte wählen.
- [ ] **CMS/Pflege:** Leistung, Ablauf, Zielgruppe, Voraussetzungen, Grenzen und Kontaktweg konkret beschreiben. Wichtige Fakten in sichtbaren Text setzen, nicht ausschließlich in Bilder, Slider oder Chat-Antworten.
- [ ] **CMS/Pflege:** Aussagekräftige interne Links zwischen Leistung, passenden Referenzen, Fachartikeln und Kontakt setzen. Beschriftungen wie „Payload-CMS-Projekt ansehen“ sind verständlicher als „Mehr“.
- [ ] **CMS/Pflege:** Aussagekräftige Alttexte direkt am Media-Dokument pflegen; dekorative Bilder dürfen leeren Alttext haben. Keine Keyword-Listen als Alttext verwenden.
- [ ] **CMS/Pflege:** Passendes SEO-Bild auswählen, möglichst mit gutem Ausschnitt für 1200 × 630. Bestehende generische Template-Grafik durch ein echtes Markenbild im CMS ersetzen.
- [ ] **CMS/Pflege:** Bei URL-Änderungen Weiterleitung vom alten zum neuen Pfad pflegen und interne Links aktualisieren. Für Projekt-Slug-Wechsel ist eine zusätzliche Weiterleitungslösung nötig; die vorhandene Payload-Redirect-Verknüpfung unterstützt derzeit Seiten und Artikel.
- [ ] **CMS/Pflege:** `noIndex` nur bewusst für Inhalte ohne Suchwert nutzen. Niemals als Schutz für vertrauliche Inhalte verstehen. Wichtige Leistungsseiten bleiben indexierbar.

### Für jede Projekt-Referenz

- [ ] **CMS/Pflege:** Ausgangslage, eigene Rolle, Lösung und Resultat vollständig beschreiben; technische Angaben und Branchenkontext konkret machen.
- [ ] **CMS/Pflege:** Kennzahlen nur mit nachvollziehbarer Messung nennen, z. B. Messdatum, Werkzeug und Vergleichsbasis bei Ladezeitverbesserungen.
- [ ] **CMS/Pflege:** Kundenfreigabe für Namen, Bilder, Zitate und Ergebnisse sicherstellen; keine vertraulichen Projektdetails veröffentlichen.
- [ ] **CMS/Pflege:** Kurzbeschreibung und neuen SEO-Tab pflegen. Projektbericht von der entsprechenden Leistung aus verlinken.

### Für Fachartikel und Vertrauen

- [ ] **CMS/Pflege:** Eigene Erfahrungen, konkrete Lösungswege, Beispiele und belegbare Aussagen veröffentlichen; generische KI-Massentexte vermeiden.
- [ ] **CMS/Pflege:** Quellen, Autor und fachlichen Hintergrund nennen; veraltete Artikel inhaltlich aktualisieren. Zeitstempel nicht bloß für scheinbare Aktualität ändern.
- [ ] **CMS/Pflege:** `relatedPosts` mit tatsächlich weiterführenden Artikeln füllen.
- [ ] **CMS/Pflege:** Konsistente Identität und Kontaktdaten pflegen; verifizierte externe Profile und echte Empfehlungen aufbauen. Falls fachlich und organisatorisch passend: Google-Unternehmensprofil mit korrekter Standort-/Einzugsgebietsangabe pflegen.

## Priorität 2: Informationen für KI-Suche und Agenten

- [x] **Code:** Öffentliche Inhalte bleiben als HTML ohne Login lesbar. FAQ-Texte benötigen keine JavaScript-Ausführung; strukturierte Daten ergänzen die maschinenlesbare Bedeutung.
- [x] **Code:** `/llms.txt` als automatisch erzeugtes Markdown-Verzeichnis ergänzen: Titel, vorhandene Kurzbeschreibungen und kanonische Links für veröffentlichte, indexierbare Seiten, Artikel und Projekte. Kunden-Kontaktfelder, Entwürfe und verwaiste Projekte werden nicht exportiert. Bestehende `public-cms`-Hooks invalidieren den Cache; zusätzlich gilt eine Stunde Revalidierung.
- [x] **Code:** Staging liefert kein KI-Verzeichnis. Die Verzeichnisdatei selbst erhält `X-Robots-Tag: noindex`; die verlinkten HTML-Seiten sind die maßgeblichen Quellen.
- [ ] **Betrieb:** OpenAI-Suchzugriff auch am Reverse Proxy/WAF prüfen. Die allgemeine Produktionsregel erlaubt öffentlichen Inhalt auch für `OAI-SearchBot`; eine unnötige separate Bot-Regel wurde nicht hinzugefügt.
- [ ] **Betrieb/Inhaber:** Modelltraining gesondert entscheiden: `OAI-SearchBot` dient ChatGPT-Suche, `GPTBot` möglichem Modelltraining. Suchzugriff kann erlaubt bleiben, während `GPTBot` gesperrt wird. Diese Entscheidung ist bisher nicht automatisch verändert worden.
- [ ] **CMS/Pflege:** Fragen mit klaren, zitierbaren Antworten beantworten: Wer bietet was an, für wen, wo, mit welchen Erfahrungen und unter welchen Bedingungen? Begriffe, Entitäten und Daten konsistent verwenden.
- [ ] **CMS/Pflege:** Den erzeugten KI-Index nach neuen Veröffentlichungen auf Verständlichkeit prüfen. Individuelle SEO-Beschreibungen verbessern auch dieses Verzeichnis.

`llms.txt` ist eine ergänzende Konvention, keine Voraussetzung für Indexierung. Google erklärt ausdrücklich, dass die Datei die Sichtbarkeit und Rankings nicht verbessert oder verschlechtert. Eine Nutzung durch OpenAI ist durch die geprüfte Crawler-Dokumentation nicht zugesichert. Für Google-KI-Suche gelten weiterhin die üblichen SEO-Grundlagen; ein spezielles KI-Schema ist nicht nötig. Siehe [Google: KI-Optimierung](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [OpenAI: Crawler](https://developers.openai.com/api/docs/bots) und [llms.txt-Konvention](https://llmstxt.org/).

Ein öffentliches MCP-/CMS-API-Angebot ist für die Auffindbarkeit einer Portfolio-/Dienstleistungswebsite derzeit nicht erforderlich. Wenn später Agenten konkrete Funktionen benötigen, zuerst Anwendungsfall, erlaubte Daten und Zugriffskonzept festlegen. Die vorhandene Payload-API nicht allein für SEO zusätzlich öffnen. Der Website-Chatbot ersetzt keinen crawlbaren Inhalt.

## Priorität 2: Betrieb, Veröffentlichung und Messung

- [ ] **Betrieb:** Änderungen veröffentlichen und `NEXT_PUBLIC_SERVER_URL` auf den endgültigen HTTPS-Ursprung setzen. `APP_ENV=staging` ausschließlich für Staging verwenden.
- [ ] **Betrieb:** HTTPS, Zertifikatskette, www/non-www und HTTP→HTTPS direkt am öffentlichen Deployment prüfen; alle Varianten auf einen Ursprung umleiten. Keine Redirect-Ketten erzeugen.
- [ ] **Betrieb:** Google Search Console und Bing Webmaster Tools verifizieren; `/sitemap.xml` einreichen. Canonicals und Indexierbarkeit repräsentativer URLs in der URL-Prüfung kontrollieren.
- [ ] **Betrieb:** In Produktion `/robots.txt`, `/sitemap.xml`, `/llms.txt`, Bild-URLs und `X-Robots-Tag` prüfen. Normale Inhalte müssen 200 liefern, fehlende Inhalte 404; Staging bleibt ausgeschlossen.
- [ ] **Betrieb:** Lighthouse mobil/Desktop nach Deployment erneut ausführen. Core Web Vitals mit echten Nutzerdaten verfolgen: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 am 75. Perzentil. Vorhandene Bild-/Font-/Chat-Optimierungen beibehalten; weitere Performance-Eingriffe anhand neuer Messungen priorisieren.
- [ ] **Betrieb:** Nach 4–8 Wochen Impressionen, Klicks, Suchanfragen, indexierte Seiten und qualifizierte Anfragen vergleichen. ChatGPT-/Suchmaschinen-Referrals nur im Rahmen der vorhandenen Analytics-/Consent-Konfiguration auswerten.
- [ ] **CMS/Pflege:** Monatlich Links, veraltete Inhalte, Bild-Alttexte und SEO-Felder prüfen; quartalsweise Leistungen und Referenzen ergänzen.

## Prüfung dieses Code-Stands

- [x] Payload-Typen neu generiert.
- [x] Neue isolierte Tests für Canonicals, Titel, Metadaten, JSON-LD-Sicherheit, Indexierung, Sitemap-Filter und KI-Verzeichnis ergänzt.
- [x] TypeScript und vollständiges ESLint erfolgreich. Generierte lokale `.quality-*`-Buildverzeichnisse werden jetzt wie `.next` vom Lint ausgeschlossen.
- [x] Vollständige Integrationstests: 96 bestanden, 4 vorhandene Datenbank-/Mailpit-Tests ohne gesonderte Testfreigabe übersprungen.
- [x] Finaler Produktionsbuild mit vorhandener lokaler CMS-Kopie erfolgreich. Öffentliche Seiten und Projekte werden weiterhin statisch generiert und per ISR aktualisiert; `/llms.txt` ist dynamisch mit CMS-Datencache.
- [x] Acht unterschiedliche Browserfälle mit deaktiviertem JavaScript gegen den Produktionsserver bestanden: Startseiten-Metadaten/JSON-LD, vollständige und bedienbare FAQs beider Leistungsseiten, Projekt-Breadcrumbs/Schema einschließlich mobiler Darstellung, Suche/Sitemap/KI-Verzeichnis, `/home`-Weiterleitung, einzelne Kontakt-H1 und vollständige erste Anzeige von Startseite/Projekt. Staging-Verzeichnis-Sperre zusätzlich isoliert geprüft. Für Artikel sind Metadaten und Schema isoliert getestet; die lokale Kopie enthält keine Artikel für eine Browserprüfung.
- [ ] Live-Validierung nach Deployment durchführen; Ranking oder Lighthouse-Score sind vorab nicht zugesichert.

## Quellen und weiterführende Projektunterlagen

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Next.js: JSON-LD](https://nextjs.org/docs/app/guides/json-ld); für die Implementierung zusätzlich die installierten Guides unter `node_modules/next/dist/docs/` gelesen.
- Vorhandene Projektunterlagen: [Sitemaps](sitemaps.md), [Performance](performance.md), [Lighthouse](lighthouse-2026-10-03.md), [CMS-Cache](cms-cache.md), [Deployment](deployment-coolify.md).
