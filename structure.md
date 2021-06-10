Titelblatt
Leerseite
(evtl Abstract)
Inhaltsverzeichnis

Abbildungsverzeichnis
Tabellenverzeichnis
Abkürzungsverzeichnis / Glossar

- Einleitung
  -> Beginn
  -> Relevanz des Themas
  -> bisheriger Forschungsstand
  -> Forschungsfrage
  -> Methodik / Vorgehensweise
  -> Aufbau der Arbeit

// Hauptteil

- GraphQL Einführung (t.b.d)
  -> Was ist GraphQL, wo wird es verwendet?
  -> Vor/Nachteile von GraphQL über REST oder Falcor
  -> Wie sind Queries strukturiert, wie werden sie verarbeitet?

- Pagination in GraphQL APIs

  - Einführung (Theoretischer Teil)
    -> Pagination Definition
    -> übliche Implementierungsansätze für Pagination
    -> Vor und Nachteile verschiedener Ansätze

  - Ideen / Ansätze zur Optimierung (Lösungsansatz)
    -> Idee zur Kombination der Vorteile verschiedener Ansätze
    -> Idee zur Vorausberechnung mehrerer Cursor für potentiell angefragte Seiten
    -> Idee zum Caching bereits berechneter Cursor
    -> Idee zur Nutzung relativer Offsets zum aktuellen Cursor und nicht absoluter Offsets

  - Implementierung des Ansatzes (Praktischer Teil)
    -> Vorgehen
    -> Codebeispiele der Kernaspekte
    -> Probleme bei Implementierung

- N+1 Problem in GraphQL APIs

  - Einführung (Theoretischer Teil)
    -> N+1 Problem Definition und Gründe für das Auftreten (z.B. Feld-weise Verarbeitung des Queries)
    -> Vorstellung aktueller Kenntnisse

  - Lösungsansatz
    -> Batching von Queries (aka Dataloader)
    -> Caching über mehrere Requests hinweg, da Caching einzelner Requests nicht sinnvoll ist (keine doppelten Datensätze in Pagination Queries)

  - Implementierung des Ansatzes (Praktischer Teil)
    -> Vorgehen
    -> Codebeispiele der Kernaspekte
    -> Probleme bei Implementierung

- Teststrategie

  - Aufstellen einer Testmethodik
    -> Quantitative Tests der API u. Datenbankabfrage
    -> Testen der min, max, avg. Laufzeit pro Anfrage, avg gerundet über z.B. 100 Durchläufe pro Test
    -> Testen der Auswirkung verschiedener Ansätze auf die Laufzeit (keine Optimierung, Optimierung d. Pagination, Optimierung N+1 Problem, beide Optimierungen)
    -> Testen der Auswirkung verschiedener Antwortgrößen (Anzahl Elemente pro Seite) auf die Laufzeit bei verschiedenen Ansätzen
    -> Visualisierung mittels Line und Barcharts:
    -> z.B. Barchart Laufzeit min, max, avg pro Optimierungsansatz
    -> Line+Pointchart Korrelation zw. Antwortzeit, Antwortgröße (x,y) und Optimierungsansatz (Linien)

  - Implementierung der Tests (Praktischer Teil)
    -> Vorgehen
    -> evtl. Codebeispiel
    -> Problemstellungen

  - Ausführung der Tests (falls es da irgendwas zu schreiben gibt)

- Ergebnis

  - Vorstellung der Testergebnisse
    -> Darlegung der Testergebnisse jedes Tests
    -> Präsentation mittels Visualisierungen und Charts

  - Analyse / Erkenntnisse
    -> Was bedeuten die Testergebnisse im Hinblick auf die Forschungsfrage?
    -> Haben sich bisherige Kenntnisse bestätigt, wurden sie um neue Ergebnisse erweitert?

- Fazit
  -> Wurde die Forschungsfrage beantwortet?
  -> War die verwendete Methodik zielführend?
  -> Was kann der Leser aus den Ergebnissen für Schlüsse mitnehmen?
  Wie kann er bessere GraphQL APIs Implementieren?
  -> Schlusswort

Quellenverzeichnis
Anhänge
Eidesstattliche Erklärung
