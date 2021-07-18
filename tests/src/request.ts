import {
  CursorQueryParams,
  CursorResponseBody,
  OffsetQueryParams,
  OffsetResponseBody,
} from "./types";

import fetch from "node-fetch";
import { findNearestCursorsInCache, getPageFromCache } from "./cursor-cache";

export async function doOffsetRequest(params: OffsetQueryParams): Promise<{
  response: OffsetResponseBody;
  time: number;
}> {
  return fetch("http://localhost:3000/graphql", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query offsetPagination($limit: Int, $offset: Int) {
        products(limit: $limit, offset: $offset) {
          id
          name
          categories {
            id
            name
          }
        }
      }`,
      variables: params,
    }),
  }).then(async (resp) => {
    const time = Number(resp.headers.get("X-Response-Time"));
    if (!time) throw Error("Couldnt get response time measurement!");

    return {
      response: await resp.json(),
      time,
    };
  });
}

export async function doCursorRequest(params: CursorQueryParams): Promise<{
  response: CursorResponseBody;
  time: number;
}> {
  return fetch("http://localhost:3000/graphql", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query cursorPaginationWithOffsets($after: String, $first: Int, $before: String, $last: Int, $offset: Int) {
        products(after: $after, first: $first, before: $before, last: $last, offset: $offset) {
          edges {
            node {
              id
              name
              categories {
                id
                name
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }`,
      variables: params,
    }),
  }).then(async (resp) => {
    const time = Number(resp.headers.get("X-Response-Time"));
    if (!time) throw Error("Couldnt get response time measurement!");

    return {
      response: await resp.json(),
      time,
    };
  });
}

// Calculate query parameters for offset-based pagination using the page number to reach and the limit (entries per page)
export function buildOffsetRequestParams(
  newPage: number,
  limit: number
): OffsetQueryParams {
  return {
    offset: newPage > 1 ? (newPage - 1) * limit : undefined,
    limit,
  };
}

// Calculate query parameters for the cursor-based pagination naively using the cursors from the previous response
export function buildRequestParamsFromPreviousResponse(
  currentPageResponse: CursorResponseBody,
  currentPage: number,
  targetPage: number,
  limit: number
) {
  return buildRequestParams(
    currentPageResponse.data.products.pageInfo.startCursor,
    currentPageResponse.data.products.pageInfo.endCursor,
    currentPage,
    targetPage,
    limit
  );
}

// Caculate query parameters for the cursor-based pagination using an implementation of a cursor cache.
// After every query, the cursors in the response will be added to that cache, so this function
// will look up if there's already a cached cursor to reach the targetPage, and build query params using it
export function buildRequestParamsWithCursorCache(
  currentPageResponse: CursorResponseBody,
  currentPage: number,
  targetPage: number,
  limit: number
) {
  const beforeTargetCache = getPageFromCache(targetPage - 1);
  const afterTargetCache = getPageFromCache(targetPage + 1);

  // If the page before the target has cached cursors, use them to build the query
  if (beforeTargetCache) {
    return buildRequestParams(
      beforeTargetCache.startCursor,
      beforeTargetCache.endCursor,
      targetPage - 1,
      targetPage,
      limit
    );
    // Check the page after the target as well
  } else if (afterTargetCache) {
    return buildRequestParams(
      afterTargetCache.startCursor,
      afterTargetCache.endCursor,
      targetPage + 1,
      targetPage,
      limit
    );
    // Otherwise, use the cursors from the previous request and build the query from there
  } else {
    return buildRequestParamsFromPreviousResponse(
      currentPageResponse,
      currentPage,
      targetPage,
      limit
    );
  }
}

// Caculate query parameters for the cursor-based pagination also using an implementation of a cursor cache.
// Unlike the above implementation, this uses an algorithm to not only check the adjacent pages in the cache,
// but instead tries to find the overall nearest cached page and uses its cursors to build a query with a minimal offset value
export function buildRequestParamsWithCursorCacheAlgorithm(
  currentPageResponse: CursorResponseBody,
  currentPage: number,
  targetPage: number,
  limit: number
) {
  const results = findNearestCursorsInCache(currentPage, targetPage);

  // If the nearest cursor search has found an entry, use that information to build the query
  if (results) {
    let [nearestPage, nearestPageCursors] = results;

    return buildRequestParams(
      nearestPageCursors.startCursor,
      nearestPageCursors.endCursor,
      nearestPage,
      targetPage,
      limit
    );

    // Otherwise, use the cursors from the previous request and build the query from there
  } else {
    return buildRequestParamsFromPreviousResponse(
      currentPageResponse,
      currentPage,
      targetPage,
      limit
    );
  }
}

// Helper function to build request params for the given page (sourcePage) and its cursors, as well as the page to reach (targetPage) and the limit.
// It will take care of the search direction and calculation of the relative offset
function buildRequestParams(
  sourcePageStartCursor: string,
  sourcePageEndCursor: string,
  sourcePage: number,
  targetPage: number,
  limit: number
) {
  if (targetPage > sourcePage) {
    return {
      first: limit,
      after: sourcePageEndCursor,
      offset:
        targetPage - sourcePage > 1
          ? (targetPage - sourcePage - 1) * limit
          : undefined,
    };
  } else if (targetPage < sourcePage) {
    return {
      last: limit,
      before: sourcePageStartCursor,
      offset:
        sourcePage - targetPage > 1
          ? (sourcePage - targetPage - 1) * limit
          : undefined,
    };
  } else throw Error("Can't build query params for the same page as before.");
}
