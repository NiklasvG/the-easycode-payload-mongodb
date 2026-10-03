# Animationen und reduzierte Bewegung

Motion ersetzt AOS und react-just-parallax; die nicht mehr benötigten Pakete sind entfernt. MotionConfig reducedMotion=user berücksichtigt die Systemeinstellung für die gesamte Anwendung. Video-Autoplay, Lottie, Hero und Chat respektieren reduzierte Bewegung; Videos bieten dann Bedienelemente statt erzwungener Bewegung.

Lottie-Renderer und das jeweils gewählte JSON werden erst nahe dem sichtbaren Bereich geladen (200 px Vorlauf). Stabile Platzhalter erhalten die Kartengröße. Der expressionsfähige SVG-Renderer bleibt nötig; ein reiner Light-Renderer ersetzt ihn nicht vollständig.

Browserprüfungen rendern alle 18 vorhandenen Icons auf Mobilgerät und Desktop, prüfen SVG-Pfade, verzögertes Laden eines entfernten Icons und unveränderte Frames bei reduzierter Bewegung. Alle Fälle bestehen. Das reduziert die anfänglich angeforderten Animationen; eine genaue Vorher-/Nachher-Bundleeinsparung mit identischem alten Build ist nicht belegt.

Turbopack-Entwicklung wurde zusätzlich mit Lottie und CSS-Hot-Reload geprüft. Bekannte Next-Abbruchmeldungen bei Navigation werden von fachlichen Fehlern unterschieden; produktives Monitoring braucht weiterhin die tatsächliche Serveranbindung.
