import { makeExecutableSchema } from "@graphql-tools/schema";
import gql from "graphql-tag";
import { Product } from "../model/Product";
import { getCategoriesForProduct, getProducts } from "./data";

const typeDefs = gql`
  type Product {
    id: Int!
    name: String!
    brand: String!
    price: Float!
    image_url: String!
    categories: [Category!]
  }

  type Category {
    id: Int!
    name: String!
  }

  type Query {
    products(offset: Int, limit: Int): [Product!]!
  }
`;

const resolvers = {
  Query: {
    products(obj: any, { offset, limit }: any) {
      offset = offset ?? 0;
      limit = limit ?? 10;

      return getProducts(offset, limit);
    },
  },
  Product: {
    categories(parent: Product) {
      return getCategoriesForProduct(parent.id);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
