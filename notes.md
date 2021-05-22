# 1.3.2021

- Gedanken über Beschaffung des Datensatzes und Struktur der Datenbank

  - Datensatz von https://nijianmo.github.io/amazon/index.html (Referenz!)
  - Skript schreiben, um eines der Metadatensätze in Postgres Datenbank einzupflegen
  - Datenbank auf Postgres Basis mit einfacher Produkt Tabelle. Komplexere E-Commerce Struktur für Untersuchung nicht relevant, die Menge der Datensätze ist wichtiger.

- Gedanken über Struktur im Projekt

  - Frontend Projekt für einfache React-basierte Shopseite mit Pagination
  - API Projekt für API und verschiedene API Szenarien (naiv, pagination optimiert, dataloading optimiert, beides, etc), wahrscheinlich mit graphql-js server, da dieser barebone ist und alle Szenarien sich gut implementieren lassen. Apollo Server ist dagegen von sich aus bereits optimiert und opinionated.
  - Tests Projekt für automatisierte Benchmarks der API und Datenbank. (evtl Tests über Frontend, falls nötig, machbar?)
  - Verwaltung der Subprojekte über Node.js 15 Workspaces

- Gedanken über API Projekt und Abhängigkeiten

  - Typescript, Sequelize ORM, Sequelize-Typescript

- Arbeit heute:
  - Projekt aufsetzen
  - Datenbank aufsetzen
  - Skript zur Datenkonvertierung in SQL schreiben
    - Datensatz JSON sehr groß. Wie also performant in Javascript einlesen und in Datenbank importieren?
      - stream-json package um Daten in Stream einzulesen
      - stream-json verworfen, da zu mächtig. führt tokenizing etc aus. Benötige einfach nur eine Library um LDJSON (line delimited json) zu parsen. Wechsele zu ndjson.js (https://github.com/ndjson/ndjson.js)
    - Datensatz enthält oftmals html in Preis, oder keinen Preis, oder keine Bild URL. Dies wird herausgefiltert

# 13.5.2021

- Gedanken dazu, wie die API mehrere Testfälle abdecken kann.

  - Das Frontend wird immer dasselbe sein, aber die API muss je nach Test case mehrere Implementierungen von Resolvern haben.
  - evtl mit Flags beim Starten einstellen, welche optimierungen geladen werden sollen (z.B. --with-pagination, --with-nplusone), und dann mit conditional imports die jew. Dateien verwenden

- Ideen dazu wie und welche Tests gemacht werden sollen:

  - für jeweils: Naiv, Pagination Optimiert, N+1 Optimiert, beides optimiert

    - Test wie lange eine Anfrage an die API

      - der ersten Seite dauert
      - der nächsten Seite (über cursor, sonst offset) dauert
      - der 5ten Seite (über cursor, sonst offset) dauert
      - der 100sten (offset) Seite dauert
        jeweils minimum, maximum, durchschnitt gerundet von 100 Durchläufen

    - evtl Stresstest mit 100 Verbindungen zum Vergleich

    - evtl anonyme Nutzerumfrage, welche Seite sich am besten "anfühlt".

|                 | Naiv |     |     | Pagn |     |     | N+1 |     |     | Both |     |     |
| --------------- | ---- | --- | --- | ---- | --- | --- | --- | --- | --- | ---- | --- | --- |
| Testcase:       | min  | max | avg | min  | max | avg | min | max | avg | min  | max | avg |
| Load first page |      |     |     |      |     |     |     |     |     |      |     |     |
| Load next page  |      |     |     |      |     |     |     |     |     |      |     |     |
| Load 5th page   |      |     |     |      |     |     |     |     |     |      |     |     |
| Load 100th page |      |     |     |      |     |     |     |     |     |      |     |     |

- Gedanken zu den einzelnen Optimierungsansätzen:

  - Pagination Optimierung

    Lösung finden, die die Vorteile von Cursor Pagination mit denen von Offsets vereint

    - Cursorbasiert > Offset, kann aber schlecht zu bestimmten Seiten springen
    - Idee: Bei next/prev Cursor Request Cursorbasiert arbeiten, sonst page/offset basiert (Im Frontend cursor den jew. Seiten zuordnen und wenn ein Cursor existiert, den verwenden)
    - Idee: Bei cursor Request die nächsten 5 vorherigen/nächsten Seiten ebenfalls mit cursorn ausstatten

  - N+1 Optimierung
    - Dataloader Implementierung um N+1 zu lösen.

  Aufgabe morgen: Cursorbased Pagination erarbeiten, Vor und Nachteile herausfinden.

# 15.5.2021

- Pagination in GraphQL

  - Zwei Ansätze gängig: Offset-basierte Pagination and Cursor-basierte Pagination

  - Offset-basierte Pagination:

    - Naiver Ansatz, der die anzuzeigenden Daten mit den Parametern _offset_ und _limit_ eingrenzt. _offset_ beschreibt dabei den Index des ersten Eintrags in der Datenbank, welcher zurückgegeben werden soll und _limit_ begrenzt die Anzahl der zurückgegebenen Einträge von diesem Punkt aus.
    - Dieser Ansatz ist einfach zu implementieren und eignet sich für Paginierungen welche explizite Seitenzahlen erfordern, da die im Folgenden beschriebene Cursor-basierte Paginierung keine direktes Mapping von Seitenzahlen zu bestimmten Stellen im Datensatz zulässt. Dagegen können _offset_ und _limit_ bei diesem Ansatz eindeutig aus jeder Seitenzahl mittels der Formel _offset_ = _seitenzahl_ \* _limit_ bestimmt werden. Da das Limit die Anzahl der Einträge pro Seite beschreibt, kann dieses frei, je nach Anwendungsbedarf vom Entwickler oder User festgelegt werden.
    - Dieser Ansatz bietet den Nachteil, dass die Anfrage von Daten mittels _offset_ und _limit_ in der Datenbank sehr langsam sein kann, da das Offset von der Datenbank abgezählt werden muss, und somit die Abfrage eine Komplexität von mindestens O(n) besitzt. Im Gegensatz zur ID oder anderen Feldern der Datentabelle kann ein Offset nicht indiziert werden, wodurch die Performance verbessert werden würde.

  - Cursor-basierte Pagination:

    - Bei diesem Ansatz besitzt jeder zurückgegebene Datensatz einen sogenannten _cursor_, welcher i.d.R. der ID oder einem anderen eindeutigen Feld des Datensatze entspricht.
    - Die Paginierung erfolgt nun, anstelle des Offsets, durch die Angabe des _cursors_ des letzten Elements der vorherigen Seite. Da das Finden eines Eintrags mit einer bestimmten ID (vorausgesetzt das Feld ist indiziert) i.d.R. eine Komplexität von O(1) aufweist, führt dieser Ansatz zu deutlichen Performance Verbesserungen.
    - Leider bietet der Cursor-basierte Ansatz von sich aus keine Möglichkeit, mit Seitenzahlen zu arbeiten. Dazu müsste jede Seitenzahl in einen _cursor_ übersetzt werden können,
      und diese müssen im Vorhinein, durch O(n) komplexes Abzählen des Offsets, bestimmt werden.

  - Es sei die Idee, für N vorherige bzw nächste Seiten die Cursor zur berechnen und zurückzugeben. Hier muss nur vom aktuell angefragten Cursor aus gerechnet werden, wodurch das zu zählende Offset nicht zu hoch ausfällt (N \* limit).
  - Die berechneten Cursor können außerdem für den Nutzer gecached werden (bzw clientseitig auf Seitenzahlen gemapped werden, dann müssen diese nicht neu berechnet werden)

  - Eine andere Idee ist, da der Client den Cursor der aktuellen Seitenzahl kennt, dass er diesen immer mitgibt, und das offset von diesem Eintrag zu der Seite, die er aufrufen möchte. Mittels _cursor_ von z.B. Seite 5, wenn der Client nun die Seite 8 anfragt, kann er dies auch über ein _cursor_ für Seite 5, plus ein _offset_ von 3 \* _limit_ erreichen.
    Dadurch minimiert sich die Komplexität des Abzählens des Offsets auf 1. die Anzahl der Einträge, die der Nutzer relativ zur aktuellen Seite springt, oder 2. auf O(1), wenn er die Seite bereits besucht hat.
  - Cursor-basierte Pagination wird oftmals da eingesetzt, wo Seitenzahlen keine Rolle spielen, z.B. bei der Abfrage von Kommentaren, Nachrichten oder Posts eines sozialen Netzwerks. In diesen Szenarien ist es dagegen wichtig, dass ein Laden der folgenden Einträge keine bereits angezeigten Einträge doppelt anzeigt, oder Einträge überspringt,
    was bei einem offset Mechanismus geschehen kann, wenn das errechnete Offset durch Hinzufügen eines neuen Eintrags in der Datentabelle invalidiert wird.
    Auch bei üblichen Anwendungsfällen der Offset-basierten Paginierung kann das natürlich von Vorteil sein, wenn Einträge von Seite N bei Aufruf der Seite N+1 nicht erneut angezeigt werden. Zudem ist die Cursor-basierte Pagination deutlich performanter, was ich in dieser Arbeit aufzeigen möchte.
    Das Ziel sei es also, einen Ansatz zu erarbeiten der es ermöglicht, die Cursor-basierte Pagination in eine Anwendung zu integrieren, welche Seitenzahlen erfordert,
    um die bestmögliche Performance und Fehlertoleranz für diesen Anwendungsfall zu erhalten.

# 20.5.2021

- Literatur "Evaluating execution strategies of GraphQL queries":

  - Es wird eine komplexere Datenstruktur und ein GraphQL Schema benötigt, welches N+1 Probleme zulässt (Tiefe >= 2). u.U. wird daher die Verwendung einer komplexeren Datenquelle nötig, oder einige Metadaten eines einzelnen
    Produktes, z.B. die Kategorie, könnte ein eigenes Schema Objekt darstellen und in der Datenbank in einer eigenen Tabelle gespeichert werden. Ich vermute, dass dies auch das realistischere Szenario darstellt.

  - Tests sollten mit unterschiedlichen _limit_ Werten durchgeführt werden, um die Korrelation zwischen den implementierten Optimierungen und der Anzahl der in der API Anfrage zurückgegebenen Datensätze herauszustellen.
    Sollte die Korrelation in jedem Test linear mit dem _limit_ Wert erfolgen, so gibt es keinen Zusammenhang, bzw. keine der Optimierungen hat einen positiven Einfluss auf die Peformance bei unterschiedlichen Antwortgrößen.
  - In der Ergebnisanalyse könnten die Ergebnisse dann folgendermaßen dargestellt werden:

    - Optimierungskategorie:

      - Ohne Optimierung, Naiver Ansatz
      - Paginierungs Optimierung
      - N+1 Optimierung
      - Beide Optimierungen

    - Barchart Antwortzeit nach Optimierungsansatz: Optimierungsstrategie auf X-Achse, Zeit (avg, min, max) auf Y-Achse

    - Linechart Korrelation zwischen Antwortzeit und Antwortgröße (Elemente pro Seite, _limit_): _limit_ Wert auf X-Achse, Zeit avg auf Y-Achse, Linie pro Optimierungskategorie

  - Implementierung N+1 Optimierung

    - Ich denke, ich muss keinen Vergleich mehr zwischen verschiedenen Ansätzen ziehen, da diese Referenz bereits den Vorteil von batched+cached Strategien herausgestellt hat.
      Für die Pagination ist ein Cachen innerhalb eines einzelnen Requests nicht von Vorteil, da dieselben Datensätze nicht mehrfach abgerufen werden.
      Caching könnte aber über mehrere Queries hinweg von Vorteil sein, da einerseits ein Nutzer auf bereits besuchte Seiten zurückspringen, zweitens eine Sortierung wählen könnte,
      die ein bereits gesehenes Produkt ebenfalls enthält, und drittens mehrere Nutzer gleichzeitig eine Schnittmenge von Produkten anschauen könnte. Insbesondere im letzten Fall sei Caching
      vermutlich von großem Vorteil, und könnte untersucht werden.

    - Ich sollte also einen batching Ansatz (aka Dataloader) implementieren, durch einen globalen Cache (z.B. Redis?) unterstützt, sofern möglich.

Arbeit für Morgen: Datenstruktur in Datenbank überlegen, schauen, was das Dataset noch an Infos hergibt, und notfalls ein anderes suchen.

# 21.5.2021

- Überlegungen zur Datenstruktur: Ich werde eine Many-To-Many Relation zwischen Produkten und Kategorien erstellen, damit ich durch diese Assoziation das N+1 Problem aufzeigen kann.
- Leider gestaltete sich die Implementierung im Daten Import Skript als schwierig:

  - Jedes Produkt hat ein String Array von Kategorien. Diese sind natürlich nicht einzigartig für jedes Produkt, sondern sehr häufig haben viele Produkte dieselbe Kategorie gemein.
    In der Datenbank müssen die Kategorien jedoch einzeln vorhanden sein. D.h. ich kann nicht einfach bei jedem Produkt für jede Kategorie im Array einen Eintrag in der Datenbank erstellen,
    sondern ich muss bei jedem Produkt zu jeder Kategorie überprüfen, ob diese bereits in der Datenbank vorhanden ist, und sie sonst erstellen.
    Das führte zu N*(2*M) Queries (N: Anzahl der Produkte ~500.000, M: durchschn. Anzahl der Kategorien pro Produkt: ~4), und der Overhead durch das ORM sei auch nicht zu vernachlässigen.
    Die Geschwindigkeit des Imports nicht das Problem, sondern daraus folgende Timeout oder Verbindungsfehler der Datenbank.
    Hier ist die Idee, die Queries entweder durch Batching oder Caching zu reduzieren. Ich entschied mich als erste Maßnahme zum Caching.

  - Durch das Caching der bereits erstellten Kategorie Einträge wurden jegliche Select Queries für die Kategorien verhindert.
    Das Skript konnte nun lokal in einer Map (Key: Kategorie Name, Value: ORM Entity der Kategorie) nachschauen, ob die Kategorie schon erstellt wurde anstelle mittels Query in der Datenbank zu suchen,
    und musste nur einen Insert ausführen, wenn die Kategorie noch nicht in der Map vorhanden war.
    Dadurch habe ich maximal N*M Queries, wenn jede Kategorie in jedem Produkt eindeutig wäre.
    Da sich die Kategorien jedes Produkts aber mit zahllosen anderen Produkten überschneidet, beschränkt sich die Anzahl der Queries auf N+P, wobei P: Gesamtzahl der unterschiedlichen Kategorien,
    und N+P ist deutlich kleiner als N*M

  - Als neueste Erkenntnis habe ich gesehen, dass man mit externen Tools wie z.B. Datagrip Daten in die Datenbank mittels CSV o.Ä. Dateien durchführen kann.
    Sofern ich es also schaffe, mit dem Skript die Daten so aufzubereiten dass
    1. Ich eine CSV Datei für jede zu erstellende Tabelle erhalte, und
    2. Die CSV Dateien bereits die assozierten IDs / Foreign Keys enthalten
       kann ich die Daten sehr effizient importieren. Gleichzeitig muss ich die Daten nicht jedes Mal erneut aufbereiten, wenn die Datenbank z.B. gelöscht werden muss,
       sondern kann einfach die CSV Dateien erneut einlesen.
