# Inhalts-, Link- und SEO-Prüfung auf Staging

Stand: 5. November 2026. Geprüft wurde https://staging.the-easycode.eu. Dies ist eine Bestandsaufnahme mit Vorschlägen; an den CMS-Inhalten wurde während dieser Prüfung nichts geändert.

## Umfang und Ergebnis

- 10 veröffentlichte Seiten, 5 Projektberichte und die Suchseite: alle 16 HTTP 200.
- 26 unterschiedliche HTTP-Linkziele im ausgelieferten HTML: 16 interne, 10 externe. Alle internen Ziele HTTP 200, ohne Weiterleitung auf einen anderen Pfad.
- 9 externe Ziele HTTP 200 nach eventuellen Weiterleitungen. Das LinkedIn-Unternehmensprofil verweigert den automatischen Abruf mit 403; seine Existenz ist dadurch weder bestätigt noch widerlegt.
- 28 unterschiedliche Bild-URLs im geprüften Hauptinhalt: alle HTTP 200. Keine fehlenden alt-Attribute; das colpari-Vorschaubild besitzt einen leeren Alttext.
- Jede geprüfte Seite hat genau eine H1. Animierte Überschriften besitzen einen vollständigen aria-label; ihre wechselnden Begriffe wurden bei der Bewertung berücksichtigt.
- Sitemap erreichbar. Unbekannte Kontroll-URL liefert korrekt 404.
- Staging bleibt absichtlich noindex. Diese Prüfung bestätigt keine Indexierung, Suchpositionen oder Darstellung aus einem Social-Media-Cache.

Grundlage: veröffentlichte Payload-Daten, initiales HTML und lesende HTTP-GET-Anfragen. Die Prüfung umfasst keine Formularübermittlung, keinen Mailversand und keinen Nachweis von Telefonnummern-/Postfacherreichbarkeit. Linkziele mit HTTP 200 wurden zusätzlich auf offensichtliche inhaltliche Zuordnung geprüft; dies ersetzt keine vollständige Prüfung fremder Websites. Interaktive Cookie-Einstellungen wurden anhand ihrer Implementierung eingeordnet, nicht als Formularaktion ausgeführt.

## Prioritäten

### 1. Sachlich veraltete Datenschutzangaben abgleichen

[/datenschutz](https://staging.the-easycode.eu/datenschutz) beschreibt Vercel-Hosting, Sentry, Google Analytics, Google Ads und Gemini Free Tier. Der aktuelle Projektstand verwendet einen anderen Hostingweg, Umami und eine OpenAI-Chat-Anbindung. Welche Dienste tatsächlich aktiv sind, muss anhand der Betriebs- und Kontoeinstellungen bestätigt werden. Den Text anschließend passend zum tatsächlichen Betrieb pflegen; Dienste oder Rechtsgrundlagen nicht allein für SEO umformulieren. Hier wurde keine rechtliche Vollständigkeitsprüfung vorgenommen.

### 2. Konkrete Sprachfehler und Doppelungen korrigieren

| Fundstelle | Aktuell | Vorschlag |
| --- | --- | --- |
| Startseite und Leistungen, DevOps-Leistungskarte | „Optimierung Ihre Entwicklungs- und Betriebsabläufe …“ | „Ich optimiere deine Entwicklungs- und Betriebsabläufe mit automatisierten Deployments, zuverlässigem Hosting und Monitoring.“ |
| Web-Entwicklung, Karte Brand Webseite | „Integration eines modernen Headless CM“ | „Integration eines modernen Headless CMS“ |
| DevOps, Abschnitt „Warum DevOps mit EasyCode?“ | „Gute DevOps bedeutet nicht nur …“ steht unmittelbar zweimal im Inhalt | Einmal behalten; grammatisch besser „Bei DevOps geht es um mehr als das Einrichten von Servern.“ |
| Luchs-Destille, Herausforderung | „Zudem sollte die Pflege von Produkten, Varianten, Veranstaltungen und Blog-Inhalten deutlich effizienter.“ | „Zudem sollte die Pflege von Produkten, Varianten, Veranstaltungen und Blog-Inhalten deutlich effizienter werden.“ |
| Startseite, Leistungsseiten, Projektübersichten | „Der Erfolg deiner Projekte treibt uns an“, „unsere Leistungen“, daneben „ich“ | Anbieterperspektive einheitlich als „ich/meine“ formulieren, sofern tatsächlich als einzelner Freelancer angeboten. Originale Kundenstimmen unverändert lassen. |
| Startseite, Leistungen und Freelancer | Mischung aus „Ihr“, „Ihre“, „du“, „dein“, „euch“ | Für eigene Marketingtexte eine durchgängige Ansprache wählen. Die vorhandenen meisten Fließtexte sprechen für „du“; Agenturteams dürfen gezielt „ihr/euch“ erhalten. |
| Projektbereich und Karten | „Websites. E-Commerce. individuelle Lösungen“, „B2B Kunden“, „Stornierungspdfs“ | „Websites, E-Commerce und individuelle Software“, „B2B-Kunden“, „Stornierungs-PDFs“ |

### 3. Verlinkung zwischen Leistungen und Referenzen ausbauen

Die Navigation ist korrekt, aber sie ersetzt nicht die thematische Verlinkung im Inhalt. Alle fünf Projektberichte verlinken im Hauptinhalt zur Übersicht und zur Kontaktseite, jedoch nicht zur passenden Leistungsseite. DevOps und Freelancer haben im Hauptinhalt jeweils nur einen Kontaktlink.

Konkrete Ergänzungen:

- BMW und Jungheinrich: im Lösungsabschnitt „Individuelle Webanwendungen entwickeln lassen“ → `/leistungen/web-entwicklung`.
- colpari: „Websites mit Headless CMS“ → `/leistungen/web-entwicklung`.
- Wallner: „Unternehmenswebsite entwickeln lassen“ → `/leistungen/web-entwicklung`.
- Luchs-Destille: „Individuelle E-Commerce-Entwicklung“ → `/leistungen/web-entwicklung`; ein Link zu `/leistungen/dev-ops` nur im passenden Abschnitt über Betreuung und Deployment.
- Freelancer: im Absatz über Schwerpunkte auf Web-Entwicklung verlinken; bei Referenzen auf `/projekte`.
- Web-Entwicklung: aus der Hosting-FAQ direkt zu `/leistungen/dev-ops` verlinken.
- DevOps: passende Web-Entwicklung als ergänzende Leistung verlinken. Nur eine Referenz nennen, die die konkrete Infrastrukturarbeit tatsächlich dokumentiert.
- Gemeinsamer Kontaktbutton „Let's talk about it“ → „Projekt besprechen“ oder „Webprojekt anfragen“. Ziel `/kontakt` ist bereits korrekt.

Es braucht dafür keine neuen Seiten und keine neuen Slugs. Beschreibende Linktexte und inhaltlich passende Verknüpfungen entsprechen [Googles Link-Empfehlungen](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).

### 4. Ergebnisse belastbar und konkret darstellen

Beim Luchs-Projekt stehen „+90 % schnellere Ladezeiten“, „-90 % Ladezeiten reduziert“ und „3× schnellere Pflege“. Im ausgelieferten Text fehlen Messmethode, Vergleichsbasis und Messzeitpunkt. Die beiden Ladezeitaussagen sind zudem unterschiedlich formuliert. Nur belegbare Ergebnisse nennen; beispielsweise „Ladezeit von X auf Y Sekunden reduziert, gemessen mit … am …“, wenn diese Daten vorliegen. Ohne Beleg eine sachliche Funktionsbeschreibung verwenden. Auch „verbesserte Conversion“ und „niedrigere Absprungraten“ benötigen eine Grundlage.

Beim colpari-Projekt ist „100 % Eigenständige Content-Pflege“ weniger präzise als „Landingpages, Blog und Wissensdatenbank kann das Team im CMS selbst pflegen“, sofern dieser Umfang bestätigt ist. Den bisherigen Leistungsumfang nicht durch unbestätigte Zahlen ergänzen.

## SEO-Vorschläge pro Seite

Die Meta-Titel und Beschreibungen sind bereits individuell gepflegt. Das größte verbleibende Potenzial liegt in sichtbaren Überschriften, konkretem Nutzen und belegter Erfahrung. Vorschläge sind redaktionelle Entwürfe, keine Rankingzusage.

| Seite | Befund | Konkreter Vorschlag |
| --- | --- | --- |
| [Startseite](https://staging.the-easycode.eu/) | Passender Dresden-Bezug, aber sehr langer Einstieg und wechselnde Bezeichnungen „Fullstackler/DevOpsler“. | Stabile Kernaussage „Webentwickler aus Dresden für Unternehmen und Agenturen“. Einstieg in 2–3 Sätze teilen: „Ich entwickle individuelle Websites, Online-Shops und Webanwendungen. Von Konzeption und CMS-Anbindung bis zum Launch begleite ich dein Projekt persönlich. Agenturen unterstütze ich als Fullstack-Freelancer in bestehenden Teams.“ |
| [Leistungen](https://staging.the-easycode.eu/leistungen) | Die erste feste H1-Benennung ist „Websites für KMUs & Agenturen“, obwohl die Seite auch Software und DevOps anbietet. H2 „Zielgerichtet. Maßgeschneidert. Flexibel.“ benennt kein Thema. | H1 „Webentwicklung und DevOps für Unternehmen und Agenturen“. H2 „Meine Leistungen: Websites, Webanwendungen und DevOps“. In jeder Karte Zielgruppe, Ergebnis und Umfang nennen. |
| [Web-Entwicklung](https://staging.the-easycode.eu/leistungen/web-entwicklung) | Umfangreiche, hilfreiche FAQs; H1 „Web-Entwicklung, die funktioniert.“ und mehrere Abschnitte bleiben allgemein. | H1 „Individuelle Websites und Webanwendungen entwickeln lassen“. H2 „Websites, Kundenportale und Online-Shops“. Karte „Brand Webseite“ klarer „Unternehmenswebsites“. Konkrete Projektbeispiele und Hosting-Querverweis ergänzen. |
| [DevOps](https://staging.the-easycode.eu/leistungen/dev-ops) | H1 „DevOps, die skaliert.“ ist unspezifisch; der Satz über gute DevOps ist doppelt. Viele allgemeine Versprechen. | H1 „DevOps-Freelancer für Hosting, Docker und CI/CD“. Konkrete Leistungen und Übergabe nennen: Deployment-Pipeline, Backup-/Restore-Konzept, Monitoring und Dokumentation, soweit tatsächlich angeboten. Reaktionszeiten und Betreuungsumfang nur nach Bestätigung ergänzen. |
| [Freelancer](https://staging.the-easycode.eu/freelancer) | Guter Ablauf und Lebenslauf, aber Eigenname und Schwerpunkte könnten früher erscheinen. | H1 „Niklas von Grzymala – Fullstack-Freelancer aus Dresden“. Direkt darunter Next.js, Payload CMS und die Zusammenarbeit mit Unternehmen/Agenturen einordnen. Links zu Leistungen und Referenzen ergänzen. „TU Dresden – Medieninformatik (B.Sc.), 2017–2019“ auf eindeutige Darstellung von Studium/Abschluss prüfen; keinen Abschluss unterstellen. |
| [Projekte](https://staging.the-easycode.eu/projekte) | Erste H1-Benennung „Markenauftritte mit messbarem Mehrwert“ verdeckt, dass dies das Portfolio ist. | Stabile H1 „Referenzen: Websites, E-Commerce und Webanwendungen“. Projekteinleitungen um jeweils eine konkrete eigene Leistung und ein belegtes Ergebnis ergänzen. „Messbar“ nur benutzen, wenn Messungen verfügbar sind. |
| [Kontakt](https://staging.the-easycode.eu/kontakt) | Form und Links passen. H1 „Lass uns etwas Großartiges schaffen.“ beschreibt die Handlung wenig konkret. | H1 „Dein Webprojekt besprechen“. Im Einstieg um Ziel, gewünschten Umfang und Zeitrahmen bitten. Eine Antwortzeit nur angeben, wenn sie zuverlässig eingehalten wird. |
| [Credits](https://staging.the-easycode.eu/credits) | Inhalt passend, kein Bedarf für zusätzliche SEO-Fülltexte. Freepik-Link führt zu einer anderen Domain weiter. | H1 optional „Bildnachweise und verwendete Ressourcen“. Tatsächliche Urheber-/Lizenznachweise erhalten und Attribution-Ziel prüfen. |
| [Datenschutz](https://staging.the-easycode.eu/datenschutz) | H1 und Grundstruktur sind klar; technische Dienstangaben passen teilweise nicht mehr zum Projektstand. | Sachlicher Betriebsabgleich hat Vorrang. Keine Werbebegriffe oder Keyword-Erweiterungen im Rechtstext. |
| [Impressum](https://staging.the-easycode.eu/impressum) | Erreichbar, eindeutige H1, Anbieter und Kontakt vorhanden. | Kein zusätzlicher SEO-Text erforderlich. Telefonnummer international als `tel:+491732338293` statt `tel:01732338293` hinterlegen; derzeit kein defekter HTTP-Link, aber international eindeutiger. |
| [Jungheinrich/MES](https://staging.the-easycode.eu/projekte/queo/mes-dashboard-zur-steuerung-von-reparaturprozessen) | Ausführliche technische Beschreibung; mehrere Absätze wiederholen Übersicht/Transparenz/Skalierbarkeit. | H1 „React-MES-Dashboard für Jungheinrich“. Auftrag über queo und eigene Frontend-Rolle früh klarstellen. Einen konkreten Ablauf oder eine tatsächlich gelöste Integrationsaufgabe erläutern. Vertrauliche Details nicht ergänzen. |
| [Wallner](https://staging.the-easycode.eu/projekte/wallner-bau-und-garten/moderne-handwerker-webseite-fuer-wallner-bau--garten) | Inhalt und Leistung stimmen überein. Aussagen zu lokaler Sichtbarkeit sind breit, eine Live-Website ist im Hauptinhalt nicht verlinkt. | H1 „Unternehmenswebsite für Wallner Bau & Garten“. Präzise erklären, welche regionalen Leistungsseiten und Referenzbereiche umgesetzt wurden. Falls weiterhin passend und freigegeben, echte Website als Link ergänzen; die Adresse nicht erraten. |
| [colpari](https://staging.the-easycode.eu/projekte/colpari/moderne-unternehmenswebseite-fuer-b2b-kunden) | H1 nennt Kunden und Technik nicht; Inhalte zu CMS, Wissen und Onboarding sind gut. | H1 „B2B-Website für colpari mit Gatsby und Strapi“. Wiederholungen zur Skalierbarkeit kürzen. Rollenanteil, Content-Modell und konkreten Onboarding-Ablauf stärker herausstellen. |
| [BMW](https://staging.the-easycode.eu/projekte/queo/enterprise-dashboard-angular-extjs-fuer-bmw) | H1 ist konkret. Herausforderung, Ziel und Ergebnis bleiben deutlich generischer als bei den anderen Berichten. | Eigenen Angular-/ExtJS-Anteil und Auftrag über queo klar benennen. Soweit freigegeben, konkreten Datenpflege-Ablauf, Schnittstellenarbeit und bearbeitete UI-Funktionen beschreiben. „Prozesszeit erheblich reduziert“ nur bei nachweisbarer Grundlage stehen lassen. |
| [Luchs-Destille](https://staging.the-easycode.eu/projekte/destillerie-schneider/moderner-e-commerce-fuer-hochwertige-spirituosen) | Gute Details zu Checkout, Rechnungen und CMS. H1 „Moderner E-Commerce für hochwertige Spirituosen“ nennt die Referenz nicht. Messbehauptungen unbelegt. | H1 „Headless-Onlineshop für die Luchs-Destille“. Gatsby/Strapi, PayPal und Rechnungsautomatisierung konkret herausstellen. Zahlen belegen oder durch nachvollziehbare Funktionsvorteile ersetzen; unvollständigen Satz korrigieren. |
| [Suche](https://staging.the-easycode.eu/suche) | Verlinkt auf die vorhandenen Inhalte und bleibt noindex. | Kein SEO-Landingpage-Ausbau nötig. Suchergebnisse übernehmen bereits die individuell gepflegten Beschreibungen. |

## Linkauffälligkeiten im Detail

### Im sichtbaren HTML

| Fundstelle | Ziel | Ergebnis | Bewertung |
| --- | --- | --- | --- |
| Alle Seiten, Navigation/Footer | interne Seiten und Projekte | Alle 16 unterschiedlichen Ziele 200 | Kein defekter interner Link gefunden. |
| Alle Seiten, Footer | `https://www.linkedin.com/company/the-easycode/` | 403 beim automatischen Abruf | Im angemeldeten Browser auf Existenz und richtige Unternehmensseite prüfen; nicht als bestätigten 404 behandeln. |
| Kontakt/Footer | persönliches LinkedIn-Profil | 200 nach Entfernen des abschließenden Slash | Unauffällige Normalisierung. |
| Credits | `http://www.freepik.com/` | 200 nach Weiterleitung zu `https://www.magnific.com/` | Kein technischer Ausfall; Attribution-Ziel und Markenbezug prüfen. Nur auf ein verifiziertes passendes HTTPS-Ziel ändern. |
| Datenschutz | Gemini-API-Bedingungen | 200 nach Weiterleitung zu `https://aistudio.google.com/docs/terms` | Erreichbar, aber Dienstbezug zum aktuellen Betrieb fraglich. |
| colpari-Projekt | `https://colpari.cx/` | 200 | Live-Website erreichbar. |
| Luchs-Projekt | `https://luchs-destille.de/de/` | 200 | Shop erreichbar. |
| Credits | `https://lordicon.com/` | 200 | Unauffällig. |
| Social-Links | Instagram und GitHub | 200 | Erreichbar; kein vollständiger Account-/Eigentumsnachweis. |
| Datenschutz | Google-Datenschutzerklärung | 200 | Erreichbar; Relevanz zusammen mit eingesetzten Diensten prüfen. |

Der Footer-Link `#cookie-settings` hat kein statisches Zielelement. Das ist in diesem Projekt kein bestätigter kaputter Sprunglink: `CMSLink` fängt ihn ab und öffnet über `show-cookie-banner` die Cookie-Einstellungen. Ohne JavaScript steht diese Aktion nicht zur Verfügung. Der Skiplink `#main-content` besitzt auf allen Seiten ein Ziel.

### Nur noch im CMS gespeichert, aktuell nicht ausgegeben

In der Startseite befinden sich im alten Hero-Rich-Text noch englische Template-Texte zum Payload-Dashboard und GitHub sowie die Buttons „All posts“ → `/posts` und „Contact“ → `/contact`. Beide Ziele liefern aktuell 404. Der aktive TextAnimation-Hero gibt diese alten Felder nicht aus; deshalb sind es keine derzeit anklickbaren defekten Besucherlinks. Die ungenutzten Felder bereinigen, bevor der Hero-Typ später gewechselt wird. Kontakt muss auf `/kontakt` zeigen; eine Artikelübersicht sollte nur verlinkt werden, wenn eine solche Seite existiert.

## Weitere Qualitätsdetails

- Das colpari-Vorschaubild hat auf Startseite, Projektübersicht, Web-Entwicklung und Suche leeren Alttext. Ist es dekorativ neben dem vollständig benannten Projektlink, ist das zulässig. Soll es die Referenz inhaltlich beschreiben, einen kurzen passenden Alttext pflegen. Nicht pauschal jeden leeren Alttext mit Keywords füllen.
- Der Lebenslauf erscheint im HTML zweimal für mobile und Desktopdarstellung. Die Implementierung blendet die jeweils andere Variante über CSS aus. Das ist keine bestätigte sichtbare Textdoppelung; davon zu unterscheiden ist der tatsächlich doppelt gepflegte DevOps-Satz.
- Die Projektübersicht verwendet H3 für Karten direkt nach der H1. Eine passende H2 „Ausgewählte Kundenprojekte“ würde die Hierarchie klarer machen. Das ist eine semantische Verbesserung, kein belegter Rankingfehler.
- „For Developers“ kann für die überwiegend deutsche Seite „Technische Umsetzung“ heißen; „Lead Fullstackler“ lässt sich als „Fullstack-Entwicklung und UX/UI“ verständlicher formulieren.
- Preisrahmen 2.000–4.000 Euro und Zeitrahmen 2–6 Wochen/1–3 Monate sind nützliche Entscheidungshilfen, müssen aber dem tatsächlichen Angebot entsprechen. Ob Design, Inhalte, Umsatzsteuer und Integrationen enthalten sind, bei Bedarf präzisieren. Keine neuen Preisversprechen ohne Bestätigung.
- Bei seit 2023 „laufenden“ Projekten zwischen initialem Relaunch und laufender Wartung unterscheiden. Kundenstimmen in ihrer Originalfassung belassen.

## Empfohlene Reihenfolge

1. Datenschutz-Dienstangaben sachlich abgleichen; doppelte und fehlerhafte eigene Texte korrigieren.
2. Startseiten-Einstieg und H1/H2 der Leistungs-/Portfolioseiten präzisieren, Ansprache vereinheitlichen.
3. Kontextlinks zwischen Referenzen, Leistungen und Kontakt ergänzen.
4. Projektberichte um echte eigene Beiträge und überprüfbare Ergebnisse schärfen; unbelegte Zahlen streichen oder belegen.
5. Ungenutzte Template-Felder bereinigen und die zwei externen Linkauffälligkeiten manuell verifizieren.

Diese Empfehlungen orientieren sich an [Google: hilfreiche Inhalte](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google: Linktexte und crawlbare Links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) und [Google: SEO-Grundlagen](https://developers.google.com/search/docs/fundamentals/seo-starter-guide). Zusätzliche Keywords, längere Texte oder neue Ortsseiten allein garantieren keine Verbesserung. Neue Inhalte sollten echte Fragen beantworten und belegbare Erfahrung zeigen.
