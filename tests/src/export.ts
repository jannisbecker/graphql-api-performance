import { writeFileSync } from "fs";
import stringify from "csv-stringify/lib/sync";
import { TEST_PAGES } from ".";
import { TestResults } from "./types";

export function exportResults(results: TestResults, file: string) {
  const csv = stringify(results, {
    header: true,
    columns: TEST_PAGES.map(String),
  });

  writeFileSync(file, csv);
}
