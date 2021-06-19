import { makeExecutableSchema } from "@graphql-tools/schema";
import gql from "graphql-tag";
import { Product } from "../model/Product";
import { getCategoriesForProduct, getProductsPaginated } from "./data";
import { buildConnection, decodeCursor } from "./cursor";

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
    ): ProductConnection
  }
`;

type ProductConnectionInput = {
  first: number;
  after: string;
  last: number;
  before: string;
};

const resolvers = {
  Query: {
    async products(
      obj: any,
      { first, after, last, before }: ProductConnectionInput
    ) {
      // Don't allow searching in both directions,
      // however giving before and after cursors is permitted but has no effect
      if (first && last) throw Error("Can't specify limit in both directions");

      // Limit the results to either of the given parameters, or default to 10 results per page
      const limit = first ?? last ?? 10;

      // If 'last' is given, we want to search starting from the end of the list or from before the given cursor
      const searchReverse = !!last;

      // Get and decode the cursor, if given
      const cursor = after
        ? decodeCursor(after)
        : before
        ? decodeCursor(before)
        : null;

      // Get the paginated results as well as the total count of entries.
      // Query one more entry than necessary to see if there's a next/previous page
      const [results, totalCount] = await getProductsPaginated(
        searchReverse,
        cursor,
        limit + 1
      );

      let hasNextPage = false,
        hasPreviousPage = false;

      // If results contains one more entry than we want, it means there's a next/previous page.
      // We also need to remove that element from the results again
      if (results.length > limit) {
        if (searchReverse) {
          hasPreviousPage = true;
        } else {
          hasNextPage = true;
        }

        results.pop();
      }

      // Construct a graphql connection object and return it
      return buildConnection(results, totalCount, hasPreviousPage, hasNextPage);
    },
  },
  Product: {
    categories(product: Product) {
      return getCategoriesForProduct(product.id);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
