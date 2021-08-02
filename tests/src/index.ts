import { exportResults } from "./export";
import { buildBackend, startBackend, stopBackend } from "./process";
import {
  doOffsetRequest,
  doCursorRequest,
  buildOffsetRequestParams,
  buildRequestParamsFromPreviousResponse,
  buildRequestParamsWithCursorCache,
  buildRequestParamsWithCursorCacheAlgorithm,
} from "./request";
import { Impl, TestResults } from "./types";
import range from "lodash.range";
import { addPageToCache, clearCache } from "./cursor-cache";
import { startAutocannon, stopAutocannon } from "./autocannon";

export const TEST_PAGES = [1, 2, 10, 1000, 1001, 5, 1];
export const WARMUP_RUNS = 30;
export const TEST_RUNS = 100;
export const LIMIT = 30;

function logAverages(results: TestResults) {
  console.log("Average runtimes for each page:");
  console.log(
    TEST_PAGES.map(
      (page, i) =>
        results.reduce((acc, run) => acc + run[i], 0) / results.length
    )
  );
}

(async () => {
  buildBackend();

  // console.log("> Test 1: Offset-basiertes Verfahren");
  // {
  //   await startBackend(Impl.OFFSET);
  //   startAutocannon(false);

  //   const results = await runTest(offsetTestRun);

  //   stopAutocannon();
  //   logAverages(results);
  //   exportResults(results, "test1.csv");
  // }

  // console.log("> Test 2: Cursor-basiertes Verfahren");
  // {
  //   await startBackend(Impl.CURSOR);
  //   startAutocannon(true);

  //   const results = await runTest(cursorTestRun);

  //   stopAutocannon();
  //   logAverages(results);
  //   exportResults(results, "test2.csv");
  // }

  // console.log(
  //   "> Test 3: Einfluss des Cursor Cachings im Frontend (Cursor-basiertes Verfahren)"
  // );
  // {
  //   await startBackend(Impl.CURSOR);
  //   startAutocannon(true);

  //   const results = await runTest(cursorCachingTestRun);

  //   stopAutocannon();
  //   logAverages(results);
  //   exportResults(results, "test3.csv");
  // }

  // console.log(
  //   "> Test 4: Einfluss des intelligenten Lookup Algorithmus beim Cursor Caching im Frontend (Cursor-basiertes Verfahren)"
  // );
  // {
  //   await startBackend(Impl.CURSOR);
  //   startAutocannon(true);

  //   const results = await runTest(cursorCachingAlgorithmTestRun);

  //   stopAutocannon();
  //   logAverages(results);
  //   exportResults(results, "test4.csv");
  // }

  console.log(
    "> Test 5: Einfluss einer Dataloader Implementierung zur Lösung des N+1 Problems (Cursor-basiertes Verfahren)"
  );
  {
    await startBackend(Impl.DATALOADER);
    startAutocannon(true);

    const results = await runTest(cursorTestRun);

    stopAutocannon();
    logAverages(results);
    exportResults(results, "test5.csv");
  }

  await stopBackend();
  console.log("Tests abgeschlossen");
})();

// Runs a single test using the given implementation function.
// A single test implementation is first run for WARMUP_RUNS times without recording results,
// and then run for TEST_RUNS times while saving the results of each. These results are then returned.
async function runTest(singleRunImplementation: () => Promise<number[]>) {
  console.log("=> Doing warmup runs");
  for (let run of range(0, WARMUP_RUNS)) {
    await singleRunImplementation();
  }

  console.log("=> Running test");
  const testResults = [];
  for (let run of range(0, TEST_RUNS)) {
    testResults.push(await singleRunImplementation());
  }

  return testResults;
}

/**
 * Test 1: Laufzeiten des Offset-basiertes Verfahren
 */
async function offsetTestRun() {
  const runResults = [];

  for (let page of TEST_PAGES) {
    const params = buildOffsetRequestParams(page, LIMIT);
    const runtime = await doOffsetRequest(params).then((resp) => resp.time);
    runResults.push(runtime);
  }

  return runResults;
}

/**
 * Test 2: Laufzeiten des Cursor-basierten Verfahren
 */
async function cursorTestRun() {
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

/**
 * Test 3: Laufzeiten des Cursor-basierten Verfahren inklusive Cursor Cache
 */
async function cursorCachingTestRun() {
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

/**
 * Test 4: Laufzeiten des Cursor-basierten Verfahren inklusive Cursor Cache und Lookup Algorithmus
 */
async function cursorCachingAlgorithmTestRun() {
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
