import { exportResults } from "./export";
import { buildBackend, startBackend } from "./process";
import {
  doOffsetRequest,
  doCursorRequest,
  getOffsetRequestParams,
  getRequestParamsFromLastResponse,
} from "./request";
import { CursorQueryParams, Impl, TestResults } from "./types";
import range from "lodash.range";

export const TEST_PAGES = [1, 2, 10, 1000, 1001, 5, 1];
export const TEST_RUNS = 100;
export const LIMIT = 100;

function logAverages(results: TestResults) {
  console.log(
    TEST_PAGES.map(
      (page, i) =>
        results.reduce((acc, run) => acc + run[i], 0) / results.length
    )
  );
}

(async () => {
  buildBackend();

  console.log("> Test 1: Offset-basiertes Verfahren");
  {
    await startBackend(Impl.OFFSET);
    await doOffsetRequest({ limit: 10 }); // warmup

    const results = await testOffsetRuntimes();
    logAverages(results);
    exportResults(results, "test1.csv");
  }

  console.log("> Test 2: Cursor-basiertes Verfahren");
  {
    await startBackend(Impl.CURSOR);
    await doCursorRequest({ first: 10 }); // warmup

    const results = await testCursorRuntimes();
    logAverages(results);
    exportResults(results, "test2.csv");
  }
})();

/**
 * Test 1: Laufzeiten des Offset-basiertes Verfahren
 */
async function testOffsetRuntimes(): Promise<TestResults> {
  const testResults = [];

  for (let run of range(0, TEST_RUNS)) {
    const runResults = [];

    for (let page of TEST_PAGES) {
      const params = getOffsetRequestParams(page, LIMIT);
      const runtime = await doOffsetRequest(params).then((resp) => resp.time);
      runResults.push(runtime);
    }

    testResults.push(runResults);
  }

  return testResults;
}

/**
 * Test 2: Laufzeiten des Cursor-basierten Verfahren
 */
async function testCursorRuntimes(): Promise<TestResults> {
  const testResults = [];

  for (let run of range(0, TEST_RUNS)) {
    const runResults = [];

    let lastPage;
    let lastResponse;
    for (let page of TEST_PAGES) {
      let params;

      if (!lastResponse || !lastPage) {
        params = { first: LIMIT };
      } else {
        params = getRequestParamsFromLastResponse(
          lastResponse,
          lastPage,
          page,
          LIMIT
        );
      }

      const req = await doCursorRequest(params);
      runResults.push(req.time);

      lastPage = page;
      lastResponse = req.response;
    }

    testResults.push(runResults);
  }

  return testResults;
}
