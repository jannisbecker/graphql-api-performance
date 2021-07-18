import { writeFileSync } from "fs";
import stringify from "csv-stringify/lib/sync";
import { TEST_PAGES } from ".";
import { TestResults } from "./types";

export function exportResults(results: TestResults, file: string) {
  const csv = stringify(results, {
    header: true,
    columns: TEST_PAGES.map((p) => `Page ${p}`),
    delimiter: ";",
    cast: {
      number: (value) => value.toLocaleString("de"),
    },
  });

  writeFileSync(file, csv);
}
