import { exportResults } from "./export";
import { buildBackend, startBackend } from "./process";
import { Impl, TestResults } from "./types";

export const TEST_PAGES = [1, 2, 10, 1000, 1001, 5, 1];
export const TEST_RUNS = 10;

buildBackend();
startBackend(Impl.CURSOR);

const results: TestResults = [
  [0.5, 12.2, 23.25, 16.2523, 53, 42, 69],
  [22, 12.2, 23.25, 16, 53, 42, 24],
];

exportResults(results, "bruh.csv");

// sample test implementation
