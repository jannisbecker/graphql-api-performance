import autocannon from "autocannon";
import { CURSOR_QUERY, OFFSET_QUERY } from "./request";

let autocannon_instance: autocannon.Instance;

export function startAutocannon(cursorQuery: boolean) {
  console.log("Starting Autocannon");

  autocannon_instance = autocannon(
    {
      url: "http://localhost:3000/graphql",
      connections: 5,
      overallRate: 100,
      forever: true,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        cursorQuery
          ? { query: CURSOR_QUERY, variables: { first: 30 } }
          : { query: OFFSET_QUERY, variables: { limit: 30 } }
      ),
    },
    null as any
  );

  autocannon_instance.on("error", (err) =>
    console.error("Autocannon error: ", err)
  );
}

export function stopAutocannon() {
  if (autocannon_instance) {
    console.log("Stopping Autocannon");
    (autocannon_instance as any).stop();
  }
}
