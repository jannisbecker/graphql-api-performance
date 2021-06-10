import { buildSchema } from "graphql";

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
    hello: String!
  }
`);

const resolvers = {
  hello: () => "world",
};

export { schema, resolvers };
