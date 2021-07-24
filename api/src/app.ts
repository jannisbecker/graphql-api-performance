import express from "express";
import { graphqlHTTP } from "express-graphql";
import { createConnection } from "typeorm";

// Add response-time middleware to measure response timings
import responseTime from "response-time";

const index = process.argv.indexOf("--impl");
const implementation =
  (index > -1 && process.argv.length >= index && process.argv[index + 1]) ||
  "offset";

console.log(`Starting with implementation '${implementation}'`);

createConnection().then(() => {
  const { schema } = require(`./impl-${implementation}/graphql`);

  express()
    .use(responseTime({ suffix: false }))
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
