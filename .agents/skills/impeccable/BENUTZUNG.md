# Impeccable im Projekt verwenden

Installiert am 06.11.2026, projektlokal unter `.agents/skills/impeccable`.
Skill-Version: 4.8.0. Engine-Version laut Upstream: 0.1.18.
Quelle: https://github.com/pbakaus/impeccable
Fixierter Commit: c3bb418ee38ee49a6b999b7752c1368f3123a2bd
Lizenz: Apache-2.0, siehe LICENSE in diesem Ordner.
Installation mit dem Codex Skill-Installer; Upstream-Skill unverändert übernommen.
Optionale automatische Hooks und Subagent-Konfigurationen wurden nicht installiert.

## Einstieg in Codex

Die folgenden Eingaben gehören in den Codex-Chat dieses Projekts, nicht ins Terminal.
Der Skill steht ab der nächsten Nachricht zur Verfügung. Falls er in der Auswahl
noch fehlt, Codex neu laden und das Projekt erneut öffnen. Alternativ ausdrücklich
auf `.agents/skills/impeccable/SKILL.md` verweisen.

Einmalig als Grundlage empfohlen:

    $impeccable init

Erfasst Produkt, Zielgruppe und gestalterische Ziele in PRODUCT.md; fragt nach,
wenn Informationen fehlen. Anschließend kann der bestehende visuelle Stil erfasst werden:

    $impeccable document

Dokumentiert das vorhandene Design in DESIGN.md. Das ist eine Bestandsaufnahme,
keine Zustimmung zu allen bisherigen Designentscheidungen. Unerwünschte Muster
wie dekorative Icon-Kacheln ausdrücklich benennen.

## Konkrete Beispiele

Erst analysieren:

    $impeccable critique den Cookie-Banner in src/components/CookieBanner/index.tsx. Prüfe auf generische KI-Designmuster. Zunächst nur bewerten, noch nichts ändern.

Gezielt vereinfachen und umsetzen:

    $impeccable distill den Cookie-Banner. Entferne die dekorative farbige Icon-Kachel und unnötige visuelle Unruhe. Behalte Texte, Einwilligungslogik und Bedienbarkeit bei. Setze die Änderungen um und prüfe Desktop und Mobilansicht.

Zurückhaltender gestalten:

    $impeccable quieter die Startseite. Reduziere überflüssige Effekte und konkurrierende Hervorhebungen. Behalte die Markenidentität bei.

Abschließender Feinschliff:

    $impeccable polish den Cookie-Banner

Technische Oberflächenprüfung:

    $impeccable audit den Cookie-Banner auf Barrierefreiheit und mobile Darstellung

## Die wichtigsten Befehle

| Befehl | Zweck |
| --- | --- |
| critique | Gestalterische Bewertung und priorisierte Vorschläge |
| distill | Überflüssige Elemente und Komplexität entfernen |
| quieter | Auffällige Farben und Effekte zurücknehmen |
| polish | Abstände, Ausrichtung und Details verfeinern |
| typeset | Schriftgrößen und typografische Hierarchie verbessern |
| layout | Abstände und visuelle Struktur verbessern |
| audit | Technische UI-Qualität prüfen |
| adapt | Darstellung für andere Bildschirmgrößen anpassen |

Am besten jeweils eine Komponente oder einen Abschnitt nennen. Dazu beschreiben,
was stört, was erhalten bleiben soll und ob nur eine Bewertung oder eine Umsetzung
gewünscht ist. Konkrete Referenzen und Gegenbeispiele helfen mehr als nur „moderner“.

## Technische Hinweise

Impeccable ist ein Werkzeug für den Agenten und keine Abhängigkeit der Website.
Beim ersten Aufruf kann der mitgelieferte Windows-Starter die festgelegte Engine
von GitHub herunterladen und anhand mitgelieferter Prüfsummen überprüfen.
Der Engine-Download und die Ausführung wurden bei dieser Installation nicht vorweggenommen.
Die Skill-Dateien und relativen Markdown-Verweise wurden auf Vollständigkeit geprüft.

Automatische Designprüfungen nach jeder Änderung sind in dieser Installation nicht aktiv.
Die bestehenden Emil-Skills bleiben separat verfügbar. Für eine klare Aufgabenstellung
am besten Impeccable oder einen bestimmten Emil-Skill ausdrücklich nennen.

Offizielle Anleitung: https://impeccable.style/docs
Codex Skills: https://developers.openai.com/codex/skills
