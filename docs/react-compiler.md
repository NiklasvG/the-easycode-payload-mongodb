# React Compiler: gemessen und zurückgestellt

Der Compiler wurde nach der Lint-Bereinigung mit babel-plugin-react-compiler 1.0.0 gegen die echte MasonryGrid-Komponente erprobt. pnpm evaluate:compiler erzeugt eine virtuelle kompilierte Variante und vergleicht sieben abwechselnd angeordnete Paare mit React Profiler. Pro Variante: 60 echte ServiceCards, 15 Filter-Updates und Prüfung der angezeigten Kartenanzahl. Motion wird für diese React-Messung durch neutrale DOM-Wrapper ersetzt.

Ein erster Lauf ergab Median-Summen von 277,65 ms ohne und 272,16 ms mit Compiler. Die Wiederholung ergab 706,87 ms ohne und 772,79 ms mit Compiler; die Einzelmessungen streuten stark (Baseline 131–1291 ms, Compiler 290–1378 ms). Beide Varianten hatten 15 Update-Commits. Ergebnis: kein belastbar nachgewiesener Vorteil, daher bleibt reactCompiler deaktiviert. Bestehende Memoisierung wurde nicht pauschal entfernt.

Das reproduzierbare Experiment und JSON-Ausgabe unter test-results/compiler-profile.json bleiben verfügbar. Vor einer Aktivierung sind stabilere Messbedingungen und ein Browserprofil mit repräsentativen Interaktionen notwendig. Hierfür werden keine weiteren Angaben benötigt; eine Aktivierung ohne Nutzen widerspräche dem ursprünglichen TODO-Kriterium.
