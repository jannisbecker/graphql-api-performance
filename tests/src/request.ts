import {
  CursorQueryParams,
  CursorResponseBody,
  OffsetQueryParams,
  OffsetResponseBody,
} from "./types";

// Build request parameters for newPage using the cursor of the last response
function getRequestParamsFromLastResponse(
  lastResponse: CursorResponseBody,
  oldPage: number,
  newPage: number,
  limit: number
) {}

// Get the applicable cursor of the new page from the cache if possible
// If the new page's cursors arent stored yet, use the old page's cursor and calculate the offset from that page
function getRequestParamsFromCache(
  lastResponse: CursorResponseBody,
  oldPage: number,
  newPage: number,
  limit: number
) {}

// Get the applicable cursor of the new page from the cache if possible
// If the new page's cursors arent stored yet, try to find the closest visited page and calculate the offset from there,
// and only then fall back to the old page's cursor
function getRequestParamsFromCacheUsingAlgorithm(
  lastResponse: CursorResponseBody,
  oldPage: number,
  newPage: number,
  limit: number
) {}

function doOffsetRequest(params: OffsetQueryParams): {
  response: OffsetResponseBody;
  time: number;
} {}

function doCursorRequest(params: CursorQueryParams): {
  response: CursorResponseBody;
  time: number;
} {}
