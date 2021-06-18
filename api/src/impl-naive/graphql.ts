import { buildSchema } from "graphql";
import { getProducts } from "./data";

const schema = buildSchema(`
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
    products(offset: Int!, limit:  Int!): [Product!]!
  }
`);

const resolvers = {
  products: (args: { offset: number; limit: number }) =>
    getProducts(args.offset, args.limit),
};

export { schema, resolvers };
