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
