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
    products(offset: Int!, limit: Int!): [Product!]!
  }
`;

const resolvers = {
  Query: {
    products(obj: any, args: any) {
      return getProducts(args.offset, args.limit);
    },
  },
  Product: {
    categories(product: Product) {
      return getCategoriesForProduct(product.id);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
