import express from "express";
import { graphqlHTTP } from "express-graphql";
import { createConnection } from "typeorm";

const implParamIndex = process.argv.indexOf("--impl");
const implementation =
  implParamIndex > -1 ? process.argv[implParamIndex + 1] : "naive";

console.log(`Starting with implementation '${implementation}'`);

createConnection().then(() => {
  const { schema } = require(`./impl-${implementation}/graphql`);

  express()
    .use(
      "/",
      graphqlHTTP({
        schema,
        graphiql: true,
      })
    )
    .listen(3000);

  console.log("Running graphql api on http://localhost:3000/");
});
