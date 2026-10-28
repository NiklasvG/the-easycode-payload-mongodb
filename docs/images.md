# Bildauslieferung

`ImageMedia` liefert standardmäßig Qualität 75; 85 und 100 sind gezielte Overrides. `sizes` verwendet gültige CSS-Längen statt Width-Deskriptoren. Hero und Karten haben eigene Größen; Karten laden verzögert, Hero bleibt bevorzugt. Das interne `priority`-Prop verwendet `loading="eager"` und `fetchPriority="high"`, entsprechend der Empfehlung der installierten Next.js-Version. Explizit leere Alt-Texte bleiben erhalten, statt vom CMS-Text überschrieben zu werden.

Fill-Bilder erhalten einen positionierten Picture-Container; der Media-Wrapper füllt den bereits dimensionierten Parent. Abmessungen müssen weiterhin am umgebenden Layout definiert werden. Der ungenutzte große Blur-Placeholder entfällt.

Der Browser-Smoke-Test schlägt bei fehlgeschlagenen Bildrequests fehl. Synthetische Testbilder liegen in `.test-media` außerhalb Playwrights gereinigtem Ergebnisordner. Originale aus dem produktiven Medienarchiv sind lokal nicht verfügbar; ein visueller Qualitätsvergleich an realen Fotos und Screenshots sowie eine belastbare Dateigrößenmessung bleiben erforderlich.

Die wiederholte mobile Messung deckte beim Hero eine Layoutverschiebung durch das zunächst dimensionslose Picture im zentrierten Grid auf. Ein explizit breiter Picture-Container reserviert die Bildfläche. Header und sein Streaming-Platzhalter verwenden abgestimmte responsive Mindesthöhen.

Endgültige Nachprüfung der mobilen Startseite: Median-CLS 0 statt 0,126, drei Läufe mit neuen Serverprozessen. Ein zusätzlich absichtlich verzögertes Hero-Bild verschiebt den folgenden Inhalt um weniger als einen Pixel. Zeiten unter paralleler Buildlast werden nicht als Geschwindigkeitsvergleich ausgegeben.
