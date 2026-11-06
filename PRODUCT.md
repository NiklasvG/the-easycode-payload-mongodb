# The-EasyCode

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Vom Betreiber am 06.11.2026 bestätigt:

- Kleine und mittlere Unternehmen, die einen Entwickler oder Freelancer suchen, der sich um ihren Webauftritt kümmert.
- Agenturen, die Unterstützung für ihr Entwicklerteam suchen.

## Product Purpose

Die Website stellt The-EasyCode, Leistungen und Projekte vor und unterstützt potenzielle Kunden bei der Entscheidung für eine Zusammenarbeit. Beide Zielgruppen sollen erkennen können, ob das Angebot zu ihrem Bedarf passt, und eine Anfrage stellen können.

## Positioning

The-EasyCode richtet sich sowohl an KMUs mit Bedarf an Unterstützung für ihren Webauftritt als auch an Agenturen mit Bedarf an zusätzlicher Entwicklungskapazität. Ein darüber hinausgehendes Alleinstellungsmerkmal ist noch nicht ausdrücklich bestätigt; keine Exklusivitäts-, Leistungs- oder Erfolgsgarantien daraus ableiten.

## Operating Context

Bestehende Webplattform mit Next.js, React, Payload CMS und MongoDB. Inhalte, Projekte und Kundendaten werden über das CMS gepflegt. Der bestehende Quelltext sieht das Kontaktformular unter `/kontakt` als primären Anfrageweg vor.

Die lokale Entwicklungsumgebung und ihr Daten-Snapshot sind in `docs/local-development.md` beschrieben. Lokale Arbeit darf keine Änderungen an der Produktionsdatenbank voraussetzen.

## Capabilities and Constraints

Bestand laut Repository, keine neue Leistungszusage:

- CMS-basierte Seiten, Leistungsdarstellung, Projektübersicht und Projektdetailseiten.
- Kontaktformular, Suche und redaktionelle Inhalte.
- Optionaler KI-Assistent für Fragen zu Leistungen, öffentlichen Projekten und Kontaktmöglichkeiten. Er bucht keine Termine und macht keine verbindlichen Angebote.
- Cookie-Einstellungen und gesonderte Einwilligung für den KI-Chat. Gestalterische Überarbeitungen erhalten Einwilligungslogik und Bedienbarkeit.
- Responsive Website; mobile Nutzung bleibt Teil der bestehenden Funktionalität.

Preise, Verfügbarkeit, garantierte Ergebnisse und zusätzliche Leistungen sind durch diese Einrichtung nicht bestätigt.

## Brand Commitments

Vom Betreiber bestätigt:

- Name The-EasyCode erhalten.
- Bestehendes Logo erhalten.
- Persönliche Du-Ansprache erhalten.
- Technische Hinweise des Websitebetreibers, etwa zu Cookies und Nutzungsanalyse, in der Wir-Form formulieren. Die persönliche Vorstellung und Leistungen von Niklas bleiben in der Ich-Form. Einwilligungserklärungen aus Sicht des Besuchers und die Selbstvorstellung des KI-Assistenten behalten ihre jeweilige Sprecherperspektive.
- Generische KI-Dekoration vermeiden. Konkretes Gegenbeispiel des Betreibers ist die dekorative farbige Verpackung des Cookie-Icons. Dies ist eine Vorgabe gegen austauschbare Dekoration, kein pauschales Verbot von Farbe oder Icons.

## Evidence on Hand

- Betreiber- und Leistungsangaben: `src/constants/ai-systemprompt.ts`.
- Vorhandene Logo-Assets: `public/Logo/`, verwendet unter anderem in `src/components/Logo/Logo.tsx`.
- Projekte und Kunden: CMS-Strukturen in `src/collections/Projects/` und `src/collections/Clients/`.
- Bestehende Leistungs- und Inhaltsblöcke: `src/blocks/`.

CMS-Schemas und Testdaten belegen keine tatsächlichen Kunden, Referenzen oder Ergebnisse. Dafür nur verifizierte veröffentlichte Inhalte verwenden; keine Testimonials, Kennzahlen, Auszeichnungen oder Kundenbeziehungen erfinden.

## Product Principles

1. Die Bedürfnisse von KMUs und Agenturen berücksichtigen, ohne beide mit demselben Bedarf gleichzusetzen.
2. Leistungen und Zusammenarbeit verständlich vermitteln und Anfragen ermöglichen.
3. Name, Logo und persönliche Du-Ansprache konsistent erhalten.
4. Informationen und gestalterische Elemente erhalten einen erkennbaren Zweck; austauschbare Dekoration vermeiden.
5. Vorhandene Produktfunktionen, Einwilligungen und belegte Inhalte bei visuellen Verfeinerungen erhalten.
