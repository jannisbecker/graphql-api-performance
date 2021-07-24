import { makeExecutableSchema } from "@graphql-tools/schema";
import gql from "graphql-tag";
import { Product } from "../model/Product";
import { getProductsPaginated } from "./data";
import { buildConnection, decodeCursor } from "./cursor";
import { categoryLoader } from "./data-dataloader";

const typeDefs = gql`
  type Product {
    id: Int!
    name: String!
    brand: String!
    price: Float!
    image_url: String!
    categories: [Category!]
  }

  type ProductConnection {
    totalCount: Int!
    edges: [ProductEdge!]!
    pageInfo: PageInfo
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean
    hasNextPage: Boolean
  }

  type Category {
    id: Int!
    name: String!
  }

  type Query {
    products(
      first: Int
      before: String
      last: Int
      after: String
      # Zusätzlicher Offset Parameter zur Verwendung relativer Offsets
      offset: Int
    ): ProductConnection!
  }
`;

const resolvers = {
  Query: {
    async products(obj: any, { first, after, last, before, offset }: any) {
      // Verhindere das gleichzeitige Verwenden von 'first' und 'last' Parametern
      if (first && last) throw Error("Can't specify limit in both directions");

      // Das Limit ergibt sich aus 'first' oder 'last', oder einem Standardwert von 10
      const limit = first ?? last ?? 10;

      // Invertiere die Suchrichtung, wenn 'last' gegeben ist
      const searchReverse = !!last;

      // Dekodiere den Cursor, falls angegeben
      const cursor = after
        ? decodeCursor(after)
        : before
        ? decodeCursor(before)
        : null;

      // Hole die Datensätze aus der Datenbank, jedoch einen Eintrag mehr als benötigt
      const results = await getProductsPaginated(
        searchReverse,
        cursor,
        offset,
        limit + 1
      );

      let hasNextPage = false,
        hasPreviousPage = false;

      // Falls die Ergebnisse tatsächlich limit + 1 Ergebnisse enthalten,
      // so existiert eine weitere Seite
      if (results.length > limit) {
        // Entferne das überschüssige Element, je nach Suchrichtung am Anfang oder Ende der Liste
        if (searchReverse) {
          hasPreviousPage = true;
          results.shift();
        } else {
          hasNextPage = true;
          results.pop();
        }
      }

      // Baue das Connection Objekt aus den Ergebnissen und gebe es zurück
      return buildConnection(results, hasPreviousPage, hasNextPage);
    },
  },
  Product: {
    categories(product: Product) {
      return categoryLoader.load(product.id);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
