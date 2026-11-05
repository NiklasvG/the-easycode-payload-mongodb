# Koordinatoren: Ressourcen und Alternative als Deployment-Skript

Prüfung: 5. November 2026, 20:40 Uhr Europe/Berlin. Ausschließlich lesende Server-/API-Prüfungen; keine Releases, Backups, Neustarts oder Konfigurationsänderungen ausgelöst.

## Ergebnis

Ein Staging-System erfordert keinen ständig laufenden Release-Webdienst. Die Koordinationsaufgaben müssen erhalten bleiben, ihre Ausführung kann jedoch als bedarfsweise gestartetes, zustandsbehaftetes Skript erfolgen. Easycode und Barrierescouts sind die einfachsten Kandidaten. Shopware nutzt bereits dieses Skriptmodell in einem schlafenden Operationscontainer. Die Destille benötigt zusätzlich eine dauerhafte Annahme und Speicherung von CMS-Inhaltsereignissen oder einen entsprechend zuverlässigen Ersatz.

## Tatsächlicher Verbrauch

Auf prod-app-01 wurden fünf cgroup-v2-Messungen über 40,01 Sekunden gelesen. RAM entspricht memory.current abzüglich inactive_file, analog zur Docker-CLI unter Linux. CPU ist die Änderung von usage_usec pro Echtzeit; 100 % entspricht einem vollständig beanspruchten CPU-Kern. Die Messung umfasst Unterprozesse, insbesondere Healthchecks. Es wurden keine Lasttests ausgelöst. Anschließend waren bei allen sieben Node-Steuerungsdiensten sämtliche Ziele ohne aktive oder wartende Releases.

| Dienst | RAM-Spanne während Messung | Mittlere CPU, Anteil eines Kerns | Gespeichertes RAM-/CPU-Limit |
| --- | ---: | ---: | --- |
| Easycode | 19,0–19,1 MiB | 1,17 % | 192 MiB / 0,5 Kern |
| Shopware Operations | 8,2 MiB | 0,00 % | 128 MiB / 0,25 Kern |
| Barrierescouts | 26,0–37,2 MiB | 2,86 % | 128 MiB / 0,25 Kern |
| Broda | 25,7–29,7 MiB | 2,89 % | 128 MiB / 0,25 Kern |
| HNO-Herzog | 38,0–39,2 MiB | 2,90 % | 128 MiB / 0,25 Kern |
| Vokalensemble | 25,2–28,8 MiB | 3,01 % | 128 MiB / 0,25 Kern |
| Biomecard | 46,4–57,4 MiB | 3,14 % | 128 MiB / 0,25 Kern |
| Destille | 56,6 MiB | 3,01 % | kein explizites Containerlimit |

Gleichzeitiger Gesamtverbrauch: 245,1–259,9 MiB, Mittel 251,4 MiB; CPU zusammen 18,98 % eines Kerns = 0,190 Kerne = rund 4,75 % der gesamten Vierkernkapazität. Server-RAM 7,56 GiB, verfügbar zum Messzeitpunkt 3,22 GiB. Die 960 MiB Summe vorhandener Limits sind keine reservierte oder tatsächlich belegte RAM-Menge; Destille ist darin mangels Limit nicht begrenzt enthalten.

Die seit Containerstart kumulierte CPU-Nutzung ergibt bei den sechs älteren Node-Diensten ebenfalls rund 2,98–3,10 % eines Kerns, bei Easycode 1,10 % und Shopware 0,46 %. Diese Mittelwerte enthalten reguläre bisherige Aufgaben und alle zwischenzeitlichen Lasten; sie sind kein isolierter Release-Benchmark. Für Shopware lief nach der 40-Sekunden-Messung der reguläre RAM-Job erfolgreich in rund sieben Sekunden; der aktuelle Nullwert bedeutet deshalb nicht dauerhaft null CPU.

Historische cgroup-Speicherspitzen liegen zwischen 39 und 77 MiB bei den Node-Diensten, Shopware rund 54 MiB. Diese Werte enthalten anders als die Tabellen-RAM-Werte auch belasteten Dateicache und sind nicht als direkt vergleichbare Arbeitsspeicher-Spitzen auszugeben. Spitzen einzelner aktiver Releases und deren CPU-Aufwand sind ohne getrennte historische Messreihen nicht belastbar bestimmbar. Anwendungsbuilds, Browserprüfungen, Datenbankdumps und Uploads laufen weitgehend außerhalb dieser Container und bleiben auch nach einem Skriptumbau bestehen. Stromverbrauch in Watt lässt sich aus den Messwerten nicht bestimmen.

## Auffälliger Grundverbrauch

Sechs Node-Dienste haben tatsächlich einen 5-Sekunden-Healthcheck mit `node /app/health.cjs`; Easycode verwendet 15 Sekunden. Sie starten damit zusammen rund 76 Node-Healthcheckprozesse pro Minute. Der im Image dokumentierte 15-Sekunden-Standard wird bei den älteren Diensten durch die tatsächliche Containerkonfiguration auf 5 Sekunden überschrieben. Der Hauptprozess prüft außerdem alle fünf Sekunden seine Warteschlange.

Die wiederholten Node-Starts sind eine plausible wesentliche Ursache des CPU-Grundverbrauchs; es wurde kein kontrollierter Vorher-/Nachher-Versuch durchgeführt. Ein längeres Intervall, etwa 30–60 Sekunden, wäre eine kleine separat zu prüfende Optimierung mit verzögerter Fehlererkennung. Die genaue Ersparnis ist derzeit nicht gemessen. Keine Limits oder Healthchecks wurden geändert.

## Pro und Kontra der aktuellen Umsetzung

Vorteile:

- Projekteigene Ziele, Zustände und Zugänge begrenzen Verwechslungen und gemeinsame Fehlerfolgen.
- Zustände überleben Runnerabbruch und Dienstneustart; unklare Coolify-Aufträge lassen sich abgleichen.
- Code-Releases, CMS-Ereignisse und Backup-Pausen laufen über eine gemeinsame Steuerung.
- Backend-/Frontend-Abhängigkeiten sowie zuletzt erfolgreich veröffentlichter Code sind abbildbar.
- GitHub benötigt beim HTTP-Anforderungsmodell keinen Coolify-Betriebszugang.

Nachteile:

- Acht getrennte Images/Container, mehrere API-Domains, Zertifikate, Tokens und Zustände sind zu warten.
- Ähnlicher Code liegt in mehreren Projekten; die tatsächlich laufenden Varianten unterscheiden sich. Nicht pauschal behaupten, alle hätten Easycodes aktuelle Attempt-/HEAD-/Digest-Prüfungen.
- Bei Easycode ist ein überlappendes Dienstupdate wegen des Prozesslocks absichtlich gesperrt; das benötigt einen kontrollierten Dienstwechsel.
- Eigene erreichbare HTTP-Endpunkte schaffen zusätzliche zu schützende Angriffsfläche. Authentifizierung beseitigt nicht die Updatepflicht.
- Grundverbrauch fällt auch ohne Releases an. Ein Dienstausfall blockiert neue Veröffentlichungen und gegebenenfalls die daran gekoppelte Backuppause.
- Die Dienste und interne Monitore laufen auf demselben Appserver; ein vollständiger Serverausfall wird dadurch nicht unabhängig erkannt.

## Realisierbare Alternative

Für Easycode ist ein serverseitiges Deployment-Skript sehr gut geeignet. Empfohlener Ablauf:

1. GitHub führt die bestehenden Pflichtprüfungen aus und übergibt ausschließlich feste Zielkennung und Run-ID an einen eingeschränkten Auslöser.
2. Ein root-eigenes, geprüft versioniertes Skript verifiziert Repository, Workflow, aktuellen Attempt, erfolgreiche Pflichtjobs und freigegebene SHA/Branch erneut. Kein beliebiger Befehl und kein frisch ausgeführter PR-Code mit Live-Secrets.
3. Ein gemeinsames projektspezifisches Hostlock wird von Release und Backup auf demselben Ausführungshost verwendet. Ein GitHub-concurrency-Schlüssel allein schützt nicht vor dem separat laufenden Host-Backuptimer.
4. Vor dem Coolify-Aufruf werden Build-ID und Zustand atomar gespeichert; nach dem Aufruf Deployment-ID festhalten. Bei unbekannter Antwort oder Timeout vorhandenen Auftrag abgleichen, nicht blind erneut bauen.
5. Coolify baut wie bisher auf build-new und verteilt über die Registry. SHA, Build-ID, Bereitschaft, Digest und benötigte Integrationen bleiben Pflicht.
6. Ein einmaliger Hostdienst führt den Auftrag unabhängig vom GitHub-Runner zu Ende. Fehlgeschlagene/unvollständige Zustände blockieren sichere Folgeaktionen bis zum Abgleich. Recovery benötigt einen expliziten Wiederaufnahmepfad; ein Prozessende allein genügt nicht.
7. Backupdienst auf dasselbe Lock/Zustandsmodell anpassen. Erst nach erfolgreicher Abnahme HTTP-Aufrufer, Backupabhängigkeiten und bisherige Releasezustands-Sicherung ablösen; danach den alten Dienst und unbenutzte Tokens/DNS-Einträge geordnet entfernen.

Damit entfallen dauerhafter Release-Webprozess und dessen eigene Domain. Private Steuerungswege benötigen weiterhin abgesicherten Zugang, etwa eingeschränktes SSH mit festem Wrapper; es ist keine automatische Sicherheitsverbesserung, stattdessen einen allgemeinen SSH-Schlüssel in GitHub zu hinterlegen. Ein direkt im GitHub-Job laufendes langes API-Skript ist möglich, aber ohne serverseitigen Zustand und Wiederaufnahme weniger ausfallsicher.

## Projekte mit tatsächlichem Staging

Die aktuelle Coolify-Projektinventur zeigt getrennte production-/staging-Umgebungen für Destillerie Schneider und Historische Beschlaege. Easycode besitzt technisch nur die Umgebung production, obwohl seine Website noch den Staging-Hostnamen trägt. Die übrigen hier gemessenen Produktionsprojekte haben keinen zusätzlichen eigenen Staging-Koordinator.

### Shopware / Historische Beschlaege

Der laufende Operationscontainer hat als Hauptprozess lediglich `sleep infinity`. Coolify startet Python-Skripte bei Bedarf. Er hat keinen eigenen öffentlichen Release-Webserver. Skript `coordinator.py` übernimmt schon heute Release, Backup, Audit, Staging-Abschaltung und Produktionsfreigabe mit einem gemeinsamen Dateilock. Zusätzlich laufen RAM-/Speichermonitor und Backupaudit im selben Container.

Der Container könnte durch Hostskripte und Timer ersetzt werden. Das spart im gemessenen Leerlauf aber nur rund 8 MiB und nahezu keine CPU. Die Sicherheitslogik für Wartung, Worker/Scheduler, Migrationen, gemeinsame Backups, geprüfte SHA und kontrollierten Staging-Start/-Stop muss erhalten bleiben. Einfache Coolify-Deployaufrufe ersetzen sie nicht. Die ausdrücklich deaktivierten Staging-Backups bleiben auch bei einem Umbau deaktiviert.

Bewertung: Koordinationslogik behalten, vorhandenes Skriptmodell nicht allein aus Ressourcengründen umbauen. Container ist eine Ausführungs-/Abhängigkeitskapsel und kein notwendig dauerhafter Steuerungsprozess.

### Destille

Ein Dienst verwaltet tatsächlich vier Ziele: Backend/Frontend jeweils für main und staging. Er wartet auf das zugehörige veröffentlichte Backend und serialisiert derzeit projektweit alle vier Ziele. CMS-Inhaltsereignisse werden 30 Sekunden gebündelt und als vorgemerkter Build gespeichert; Inhaltsbuilds verwenden den zuletzt veröffentlichten Code. Ein Backend-Release kann den Frontend-Inhaltsbuild auslösen.

Alle Aufgaben können durch Skripte und eine zuverlässige, persistente Ereignisannahme ersetzt werden. Ein nur bei Git-Push gestartetes Deployment-Skript reicht jedoch nicht: Änderungen im CMS müssen das statische Gatsby-Frontend weiterhin neu bauen, dürfen bei Neustarts nicht verloren gehen und müssen zur richtigen Umgebung gehören. Ein zentraler Workflow über zwei Repositorys braucht zudem ein gemeinsames Lock oder eine gemeinsame Queue; getrennte Repository-concurrency-Gruppen koordinieren sich nicht automatisch.

Bewertung: Technisch entbehrlicher Dauerprozess, aber höherer Umbauaufwand und begrenzter Ressourcengewinn. Zuerst Healthcheck-Grundverbrauch optimieren. Ein Wegfall ohne Ersatz der Content-Ereignisannahme wäre ein Funktionsverlust.

## Weitere Produktionssysteme

Barrierescouts hat nur ein statisches Produktionsfrontend und ist neben Easycode der einfachste Kandidat für einen bedarfsweisen Releasejob. Broda, HNO-Herzog, Vokalensemble und Biomecard haben trotz nur einer Umgebung getrennte CMS-/Frontend-Repositories, Inhaltsbuilds und Reihenfolgenabhängigkeiten. Dort gilt dieselbe Anforderung an zuverlässige Inhaltsereignisse wie bei der Destille; die Zahl der Umgebungen ist nicht das entscheidende Kriterium.

## Bewertung

Keine dringende Kapazitätsnot durch die Koordinatoren allein. Die realistische Ersparnis liegt beim Grundverbrauch der jeweiligen Container; Builder-, Datenbank- und Sicherungslast verschwinden nicht. Sinnvolle Reihenfolge: Healthchecks prüfen, Easycode als überschaubaren Skriptpiloten umstellen, danach gegebenenfalls Barrierescouts, komplexere CMS-Systeme anhand der Pilotdaten entscheiden. Shopware ist bereits weitgehend ein bedarfsweiser Skriptbetrieb.

## Konkrete Architekturentscheidung je Projekt

Entscheidung auf Betreiberanfrage, 5. November 2026. Dies ist eine fachliche
Empfehlung auf Basis des geprüften Bestands, keine bereits ausgeführte Umstellung.
Maßstab: benötigte Ereignisverarbeitung, Wiederaufnahme nach Fehlern, begrenzte
Berechtigungen, Wartbarkeit, Migrationsrisiko und gemessener Ressourcengewinn.
Ein Staging-Branch allein begründet keinen dauerhaft laufenden Dienst.

| Projekt | Entscheidung | Begründung und Ziel |
| --- | --- | --- |
| Easycode | Ablösen | Ein Repository, eine integrierte Anwendung, kein separater statischer CMS-Inhaltsbuild. Bedarfsweises serverseitiges Releaseskript mit gemeinsamem Backuplock, persistentem Zustand und unveränderten Abnahmeprüfungen genügt. Eigener Release-Webdienst und Domain können danach entfallen. |
| Barrierescouts | Ablösen | Ein statisches Produktionsfrontend ohne gekoppelte Backend-Releasekette. Dasselbe geprüfte Skriptmuster wie Easycode verwenden; bestehende Content-Auslöser vor Abschaltung erfassen und gegebenenfalls auf den eingeschränkten Jobauslöser umstellen. |
| Broda | Behalten | Strapi-/Gatsby-Verbund mit redaktionellen Inhaltsbuilds. Bündelung, dauerhafte Ereignisannahme, zuletzt veröffentlichte Frontend-SHA und Backend-Abhängigkeit haben echten Nutzen. Ein gleichwertiger Skriptersatz benötigt zusätzlich eine Ereigniswarteschlange. |
| HNO-Herzog | Behalten | CMS-Änderungen müssen ohne Codepush auf der statischen Website erscheinen. Der bestehende kleine Dienst übernimmt diese dauerhafte Annahme und Backend-/Frontend-Koordination bereits. Ein eigener Umbau lohnt gegenüber dem geringen Grundverbrauch nicht. |
| Vokalensemble | Behalten | Getrennte CMS-/Frontend-Repositories mit Inhaltsbuilds und gemeinsamer Backup-Abstimmung. Gleiche benötigte Ereignisfunktionen wie HNO-Herzog; niedrige technische Dringlichkeit zur Ablösung. |
| Biomecard | Behalten | Strukturierte Karten-/Medieninhalte erfordern verlässliche Inhaltsbuilds und passende Backend-/Frontend-Reihenfolge. Ein reiner Git-Releasejob würde laufende Inhaltsveröffentlichungen nicht ersetzen. |
| Destille | Behalten | Vier Ziele über Produktion/Staging, getrennte Repositories und CMS-Ereignisse. Höchster Nutzen der vorhandenen Warteschlange und Abhängigkeitssteuerung; höhere Umbau- und Fehlerrisiken als der Ressourcengewinn rechtfertigt. |
| Shopware / Historische Beschlaege | Behalten | Bereits bedarfsweise gestartete Skripte in einem schlafenden Operationscontainer; zusätzlich Migration, Wartung, Worker/Scheduler, Backups, Audit und Monitoring. Rund 8 MiB Leerlauf-RAM rechtfertigen keinen Infrastrukturwechsel. |

Behalten bedeutet Architektur und Zuständigkeit beibehalten, nicht den aktuellen
Code unverändert dauerhaft einfrieren. Bei den sechs verbleibenden Diensten
Healthcheckhäufigkeit und konsistente Sicherheitsprüfungen gezielt verbessern;
gemeinsamen Code versioniert pflegen, Laufzeit-Zugänge und Zustände pro Projekt
getrennt halten. Kein zentraler Dienst mit Sammelzugang zu allen Projekten allein
zur Einsparung weniger Container einführen.

Empfohlene Reihenfolge: vorhandene Healthchecks separat optimieren; das
bedarfsweise Skriptmodell zuerst an Easycode abnehmen, danach für Barrierescouts
wiederverwenden. Der Umbau ist kein zusätzlicher Blocker für Easycodes Livegang.
Erst nach bewiesener Funktionsgleichheit und angepasster Backupkoordination den
jeweiligen alten Dienst abschalten und unbenutzte Zugänge/DNS-Einträge entfernen.
Keine gleichzeitigen konkurrierenden Veröffentlichungswege betreiben.

Der gemessene Wegfall beider Dienste entspräche nur etwa 45–56 MiB Grund-RAM und
0,040 CPU-Kernen, also rund 1 % der Vierkernkapazität. Ein Skriptersatz benötigt
während seiner Ausführung weiterhin Ressourcen. Die Entscheidung zur Ablösung
beruht daher auf geringerer dauerhafter Betriebskomplexität, nicht auf einem
akuten Kapazitätsproblem. Für die anderen sechs Projekte ist ein ausreichender
Nettonutzen eines vollständigen Umbaus derzeit nicht belegt.

Quellen: aktuelle Coolify-API, tatsächliche Containerkonfiguration, cgroup-Messung, laufender Koordinatorcode und gemeinsame Betriebsunterlagen. Messdaten und bereinigte Inventur liegen lokal in der ignorierten `.quality-release/`-Ablage; keine Secrets oder Mail-/Kundendaten ausgegeben.

Externe Grundlagen: [Docker-Speichermessung](https://docs.docker.com/reference/cli/docker/container/stats/), [GitHub-concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency). GitHub-concurrency ist repositorybezogen und ersetzt keine Abstimmung mit separat laufenden Backupdiensten.
