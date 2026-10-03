# Bildauslieferung

`ImageMedia` liefert standardmäßig Qualität 75; 85 und 100 sind gezielte Overrides. `sizes` verwendet gültige CSS-Längen statt Width-Deskriptoren. Hero und Karten haben eigene Größen; Karten laden verzögert, Hero bleibt bevorzugt. Nexts veraltetes priority-Prop wird intern auf preload abgebildet. Explizit leere Alt-Texte bleiben erhalten, statt vom CMS-Text überschrieben zu werden.

Fill-Bilder erhalten einen positionierten Picture-Container; der Media-Wrapper füllt den bereits dimensionierten Parent. Abmessungen müssen weiterhin am umgebenden Layout definiert werden. Der ungenutzte große Blur-Placeholder entfällt.

Der Browser-Smoke-Test schlägt bei fehlgeschlagenen Bildrequests fehl. Synthetische Testbilder liegen in `.test-media` außerhalb Playwrights gereinigtem Ergebnisordner. Originale aus dem produktiven Medienarchiv sind lokal nicht verfügbar; ein visueller Qualitätsvergleich an realen Fotos und Screenshots sowie eine belastbare Dateigrößenmessung bleiben erforderlich.
