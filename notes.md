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

- Es muss auf jeden Fall eine Datenstruktur in der Datenbank verwendet werden, die das N+1 Problem aufzeigt, und mit der sich das Problem gut beschreiben lässt.
  Theoretisch sollten alle Arten von Relationen das Problem hervorrufen.
  Man könnte meinen, dass man die Queries ja auch so schreiben kann, dass Relationen innerhalb eines einzelnen Queries abgefragt werden.
  Da GraphQL jedoch festlegt, dass Resolver pro Field definiert werden (da GraphQL Anfragen sonst nicht so flexibel, sprich mit beliebigen angefragten Feldern gestaltet werden könnten),
  kann ein Resolver eines Elternobjekts nicht die Felder des Kindobjekts mit auflösen - und dadurch analog kein einzelner Query für sowohl Eltern- als auch Kindobjekt gestellt werden.
  In den meisten Fällen besitzt das Elternobjekt in der Datenbank entweder (1) eine ID die es selbst eindeutig identifiziert, oder (2) eine ID die eine Relation mit einer anderen Tabelle kennzeichnet.
  Es sei eine GraphQL Anfrage gestellt worden, welche eine Liste von Elternobjekten mitsamt Informationen zu jedem zugehörigen Kindobjekt abrufen soll.
  In einem ersten Query wird die Liste der Elternobjekte aufgelöst. In den dadurch von der Datenbank gestellten Daten liegt der Primary Key (1) und/oder der Foreign Key (2) entsprechend vor.
  Da wir nun eine Liste der IDs haben, für welche die Kindobjekte **aller** abgerufenen Elternobjekte identifiziert werden können, kann nun, anstelle eines Queries zu jedem einzelnen Kindobjekt (N+1 Problem),
  stattdessen ein Query generiert werden, der **alle** Kindobjekt Datensätze zurückgibt, die für die GraphQL Antwort benötigt werden.
  Nun muss in einem letzten Schritt nur noch die Zuordnung der zurückgegebenen Kindobjekte zu den jeweiligen Elternobjekten geschehen.

# 22.5.2021

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

# 24.5.2021

- Einige Anpassungen für das Datenhandling:

  - Auf Datenstruktur und HighRes Images vom 2018er Datensatz geupdatet
  - ID "0" wurde immer als noch nicht vorhanden gehandhabt, gefixt
  - SQL zum erstellen der Tabellen hinzugefügt

- Aufgabe für Morgen: Gliederung genauer formulieren, mit Einbeziehung der geforderten Inhalte (https://www.scribbr.de/anfang-abschlussarbeit/bachelorarbeit-schreiben/)

# 28.5.2021

- Gliederung überarbeitet und fertig detailliert beschrieben :>

- Idee verworfen, mit Docker das Projekt aufzusetzen - unnötiger Mehraufwand, lenkt von eigentlicher Implementierung ab
  -> Stattdessen lieber Postgres Datenbank und Redis Cache einzeln installieren und höchstens per env konfigugierbar machen

- Ich sollte direkt anfangen zu schreiben, da die Struktur und die Themen pro Kapitel nun klar sind. Formatierung ist erstmal weniger relevant. Ansonsten geht mir aber die Zeit aus.

- Typeorm sollte eigentlich alles können, was ich für meine Tests brauche, und notfalls können Queries manuell gebaut werden.

- Ich habe die Scripts nochmal in einen eigenen Ordner verschoben und aufgeräumt.

# 3.6.2021

- Evtl eine gute Idee, einen Testcase über mehrere Seiten laufen zu lassen, z.B. Seite 1 -> 2 -> 5 -> 2 -> 1000
  Damit sind kleine Sprünge abgedeckt, große Sprünge, Sprünge zu hohen Seitenzahlen und Sprünge zu bereits besuchten Seiten

- Diesen Case kann man nun mit
  -> min,max,avg auswerten
  -> naiv, pagination optimization
  -> verschiedene limitgrößen auswerten

- N+1 kann man entweder mitdemselben Testcase testen oder einen eigenen entwickeln
  Es ergibt aber glaube ich Sinn, das in eines zu fassen, weil ich einen Testcase für Nutzernahes Verhalten analysieren will
- naiv, mit dataloader, mit dataloader und redis cache
- verschiedene Limitgrößen auch hier?

das heißt (noch nicht sicher..)

-> Analyse Testcase mit min,max,avg Zeit über Seitenverlauf
-> avg von Naiv, Pagination Optimization, N+1 Optimization Dataloader, (N+1 Cache), N+1 Dataloader+Cache und beidem

# 10.6.2021

- Frontend entfernt, brauch ich für Tests wahrscheinlich nicht
- GraphQL API mit graphql.js und express-graphql gebaut
- Unterstützt mehrere Konfigurationen für die Implementierung unterschiedlicher Tests,
  durch Verwendung von variablem require, welches das graphql schema, resolver und database queries aus unterschiedlichen Unterordnern lädt, je nach --impl Parameter

# 19.6.2021

- Implementierung der cursor-basierten Pagination
  -> deutlich flexibler beim Queryen, da man in beide Richtungen paginieren kann.
  -> extrem schnell auch bei großen Datensätzen, großen "offsets"
  -> komplizierter zu implementieren
  -> unterstützt natürlich standardmäßig keine Seitenzahlen, es sei aber das Ziel, das zu ermöglichen

# 7.7.2021

- Weitere Überlegungen zu Testing der Pagination

  - Es werden mehrere Implementierungen benötigt um die Performance zu testen:
    -> naive Implementierung über offsets
    -> cursor + offset Implementierung
    -> cursor + offset Implementierung + Caching der Cursor im Frontend (im Test implementiert)
    -> cursor + offset Implementierung + Caching + intelligente Abfrage des Caches (im Test implementiert)

  - Eventuell sollte die Abfolge von Seiten noch leicht angepasst werden, um die Auswirkungen des letzten Testfalls zu sehen
