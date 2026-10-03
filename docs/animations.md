# Animationen

TextAnimationHero verwendet für Scroll-Offset und Viewport-Fade die vorhandene Motion-Bibliothek. AOS und react-just-parallax haben keine weiteren Verwendungen und werden inklusive @types/aos entfernt. Bei prefers-reduced-motion entfallen Parallax, Fade und der automatische Phrasenwechsel; AnimatedText zeigt statischen Text.

LottieSvg ersetzt den vollständigen Renderer. Die installierte Paketimplementierung bestätigt: SVG-Renderer unterstützt weiterhin Expressions. Viele vorhandene JSONs enthalten Expressions; LottieLight wäre daher ungeeignet. Play-Zustand wird über Refs geführt, ohne unnötige Renderzyklen; reduzierte Bewegung unterdrückt neue Wiedergabe und pausiert laufende Animationen.

Noch zu prüfen: alle 18 Animationen visuell, Scroll-Offset auf realen CMS-Seiten, Tastaturbedienung und kontrollierter Bundlevergleich. Dependency-Entfernung allein belegt keine konkrete übertragene Byte-Einsparung. Für Offscreen-Animationen ist bedarfsgesteuertes Laden der JSONs eine weitere Optimierung.
