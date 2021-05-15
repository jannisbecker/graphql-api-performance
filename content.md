1 Glossar
 
  2 Einleitung
 
    2.1 Motivation                                // Relevanz von GraphQL APIs heute, Relevanz von Performance, Performance in Pagination und APIs mit N+1 Queries, Forschungsfrage
 
    2.2 Methodik und Lösungsansatz                // Einführung zu Pagination und N+1 als zwei Probleme von APIs, Lösungsidee durch optimierte Implementierung
 
 
  3 Pagination in GraphQL APIs
 
    3.1 Ansätze und Anwendungsgebiete             // Index-basierte Pagination, Cursor-basierte Pagination, Vor/Nachteile
 
    3.2 Optimierungsansatz                        // Lösungsvorschlag in der Theorie erklärt
 
    3.3 Implementierung                           // Implementierung der Lösung, Vorgehen, Probleme bei der Implementierung
 
 
  4 N+1 Problem in GraphQL APIs
 
    4.1 Query Verarbeitung und Datenbeschaffung   // Theorie der Abarbeitung von Queries in GraphQL
 
    4.2 N+1 Problematik                           // Erläuterung des N+1 Problems, und wo es auftritt
 
    4.3 Lösungsansatz                             // Lösungsvorschlag durch Query Batching
 
    4.4 Implementierung                           // Implementierung der Lösung, auch hier Vorgehen und Problematik
 
 
  5 Teststrategie
 
    5.1 Aufstellen einer Testmethode              // Erklärung des Vorgehens zum Testen der Implementierten Ansätze, Tests auch im Vergleich zum naiven Ansatz
 
    5.2 Implementierung der Tests                 // Vorgehen der Implementierung der Tests
 
    5.3 Ausführung                                // Vorbereitung und Ausführen der Teststrategie
 
 
  6 Ergebnisse / Messungen                        // Vorstellung der Testergebnisse in allen Testszenarien, Analyse der Ergebnisse
 
 
  7 Fazit                                         // Wurde die Forschungsfrage beantwortet? Welche Tipps kann der Leser
                                                  // zum Aufsetzen von GraphQL APIs mitnehmen? Was für Erkenntnisse wurden gewonnen? Schlusswort
