import express from "express";
import { graphqlHTTP } from "express-graphql";

const implParamIndex = process.argv.indexOf("--impl");
const implementation =
  implParamIndex > -1 ? process.argv[implParamIndex + 1] : "naive";

const { schema, resolvers } = require(`./impl-${implementation}/graphql`);

express()
  .use(
    "/",
    graphqlHTTP({
      schema: schema,
      rootValue: resolvers,
      graphiql: true,
    })
  )
  .listen(3000);

console.log("Running graphql api on http://localhost:3000/");
