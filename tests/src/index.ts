import { exportResults } from "./export";
import { buildBackend, startBackend } from "./process";
import {
  doOffsetRequest,
  doCursorRequest,
  buildOffsetRequestParams,
  buildRequestParamsFromPreviousResponse,
  buildRequestParamsWithCursorCache,
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

    const results = await testOffsetImplementation();
    logAverages(results);
    exportResults(results, "test1.csv");
  }

  console.log("> Test 2: Cursor-basiertes Verfahren");
  {
    await startBackend(Impl.CURSOR);
    await doCursorRequest({ first: 10 }); // warmup

    const results = await testCursorImplementation();
    logAverages(results);
    exportResults(results, "test2.csv");
  }

  console.log(
    "> Test 3: Einfluss des Cursor Cachings im Frontend (Cursor-basiertes Verfahren)"
  );
  {
    await startBackend(Impl.CURSOR);
    await doCursorRequest({ first: 10 }); // warmup

    const results = await testCursorCaching();
    logAverages(results);
    exportResults(results, "test3.csv");
  }
})();

/**
 * Test 1: Laufzeiten des Offset-basiertes Verfahren
 */
async function testOffsetImplementation(): Promise<TestResults> {
  const testResults = [];

  for (let run of range(0, TEST_RUNS)) {
    const runResults = [];

    for (let page of TEST_PAGES) {
      const params = buildOffsetRequestParams(page, LIMIT);
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
async function testCursorImplementation(): Promise<TestResults> {
  const testResults = [];

  for (let run of range(0, TEST_RUNS)) {
    const runResults = [];

    let previousPage;
    let previousResponse;

    for (let page of TEST_PAGES) {
      let params;

      if (!previousResponse || !previousPage) {
        params = { first: LIMIT };
      } else {
        params = buildRequestParamsFromPreviousResponse(
          previousResponse,
          previousPage,
          page,
          LIMIT
        );
      }

      const req = await doCursorRequest(params);
      runResults.push(req.time);

      previousPage = page;
      previousResponse = req.response;
    }

    testResults.push(runResults);
  }

  return testResults;
}

/**
 * Test 3: Laufzeiten des Cursor-basierten Verfahren inklusive Cursor Cache
 */
async function testCursorCaching(): Promise<TestResults> {
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
        params = buildRequestParamsWithCursorCache(
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
