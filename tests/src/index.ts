import { exportResults } from "./export";
import { buildBackend, startBackend } from "./process";
import {
  doOffsetRequest,
  doCursorRequest,
  buildOffsetRequestParams,
  buildRequestParamsFromPreviousResponse,
  buildRequestParamsWithCursorCache,
  buildRequestParamsWithCursorCacheAlgorithm,
} from "./request";
import { CursorQueryParams, Impl, TestResults } from "./types";
import range from "lodash.range";
import { addPageToCache, clearCache } from "./cursor-cache";

export const TEST_PAGES = [1, 2, 10, 1000, 1001, 5, 1];
export const TEST_RUNS = 100;
export const LIMIT = 30;

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

    const results = await testOffsetImplementation();
    logAverages(results);
    exportResults(results, "test1.csv");
  }

  console.log("> Test 2: Cursor-basiertes Verfahren");
  {
    await startBackend(Impl.CURSOR);

    const results = await testCursorImplementation();
    logAverages(results);
    exportResults(results, "test2.csv");
  }

  console.log(
    "> Test 3: Einfluss des Cursor Cachings im Frontend (Cursor-basiertes Verfahren)"
  );
  {
    await startBackend(Impl.CURSOR);

    const results = await testCursorCaching();
    logAverages(results);
    exportResults(results, "test3.csv");
  }

  console.log(
    "> Test 4: Einfluss des intelligenten Lookup Algorithmus beim Cursor Caching im Frontend (Cursor-basiertes Verfahren)"
  );
  {
    await startBackend(Impl.CURSOR);

    const results = await testCursorCachingWithAlgorithm();
    logAverages(results);
    exportResults(results, "test4.csv");
  }
})();

/**
 * Test 1: Laufzeiten des Offset-basiertes Verfahren
 */
async function testOffsetImplementation(): Promise<TestResults> {
  async function doTestRun() {
    const runResults = [];

    for (let page of TEST_PAGES) {
      const params = buildOffsetRequestParams(page, LIMIT);
      const runtime = await doOffsetRequest(params).then((resp) => resp.time);
      runResults.push(runtime);
    }

    return runResults;
  }

  console.log("=> Doing warmup run");
  await doTestRun();

  console.log("=> Running test");
  const testResults = [];
  for (let run of range(0, TEST_RUNS)) {
    testResults.push(await doTestRun());
  }

  return testResults;
}

/**
 * Test 2: Laufzeiten des Cursor-basierten Verfahren
 */
async function testCursorImplementation(): Promise<TestResults> {
  async function doTestRun() {
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

    return runResults;
  }

  console.log("=> Doing warmup run");
  await doTestRun();

  console.log("=> Running test");
  const testResults = [];
  for (let run of range(0, TEST_RUNS)) {
    testResults.push(await doTestRun());
  }

  return testResults;
}

/**
 * Test 3: Laufzeiten des Cursor-basierten Verfahren inklusive Cursor Cache
 */
async function testCursorCaching(): Promise<TestResults> {
  async function doTestRun() {
    const runResults = [];

    let previousPage;
    let previousResponse;

    for (let page of TEST_PAGES) {
      let params;

      if (!previousResponse || !previousPage) {
        params = { first: LIMIT };
      } else {
        // build params while using the cursor cache
        params = buildRequestParamsWithCursorCache(
          previousResponse,
          previousPage,
          page,
          LIMIT
        );
      }

      const req = await doCursorRequest(params);

      // add newly requested to cache
      addPageToCache(
        page,
        req.response.data.products.pageInfo.startCursor,
        req.response.data.products.pageInfo.endCursor
      );

      runResults.push(req.time);

      previousPage = page;
      previousResponse = req.response;
    }

    // clear cache after every run
    clearCache();

    return runResults;
  }

  console.log("=> Doing warmup run");
  await doTestRun();

  console.log("=> Running test");
  const testResults = [];
  for (let run of range(0, TEST_RUNS)) {
    testResults.push(await doTestRun());
  }

  return testResults;
}

/**
 * Test 4: Laufzeiten des Cursor-basierten Verfahren inklusive Cursor Cache und Lookup Algorithmus
 */
async function testCursorCachingWithAlgorithm(): Promise<TestResults> {
  async function doTestRun() {
    const runResults = [];

    let previousPage;
    let previousResponse;

    for (let page of TEST_PAGES) {
      let params;

      if (!previousResponse || !previousPage) {
        params = { first: LIMIT };
      } else {
        // build params while using the cursor cache + the lookup algorithm
        params = buildRequestParamsWithCursorCacheAlgorithm(
          previousResponse,
          previousPage,
          page,
          LIMIT
        );
      }

      const req = await doCursorRequest(params);

      // add newly requested to cache
      addPageToCache(
        page,
        req.response.data.products.pageInfo.startCursor,
        req.response.data.products.pageInfo.endCursor
      );

      runResults.push(req.time);

      previousPage = page;
      previousResponse = req.response;
    }

    // clear cache after every run
    clearCache();

    return runResults;
  }

  console.log("=> Doing warmup run");
  await doTestRun();

  console.log("=> Running test");
  const testResults = [];
  for (let run of range(0, TEST_RUNS)) {
    testResults.push(await doTestRun());
  }

  return testResults;
}
