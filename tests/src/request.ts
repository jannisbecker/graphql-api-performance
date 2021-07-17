import {
  CursorQueryParams,
  CursorResponseBody,
  OffsetQueryParams,
  OffsetResponseBody,
} from "./types";

import fetch from "node-fetch";

export function getOffsetRequestParams(
  newPage: number,
  limit: number
): OffsetQueryParams {
  return {
    offset: newPage > 1 ? (newPage - 1) * limit : undefined,
    limit,
  };
}

// Build request parameters for newPage using the cursor of the last response
export function getRequestParamsFromLastResponse(
  lastResponse: CursorResponseBody,
  oldPage: number,
  newPage: number,
  limit: number
): CursorQueryParams {
  if (newPage > oldPage) {
    return {
      first: limit,
      after: lastResponse.data.products.pageInfo.endCursor,
      offset:
        newPage - oldPage > 1 ? (newPage - oldPage - 1) * limit : undefined,
    };
  } else if (newPage < oldPage) {
    return {
      last: limit,
      before: lastResponse.data.products.pageInfo.startCursor,
      offset:
        oldPage - newPage > 1 ? (oldPage - newPage - 1) * limit : undefined,
    };
  } else throw Error("Can't build query params for the same page as before.");
}

// // Get the applicable cursor of the new page from the cache if possible
// // If the new page's cursors arent stored yet, use the old page's cursor and calculate the offset from that page
// export function getRequestParamsFromCache(
//   lastResponse: CursorResponseBody,
//   oldPage: number,
//   newPage: number,
//   limit: number
// ): CursorQueryParams {}

// // Get the applicable cursor of the new page from the cache if possible
// // If the new page's cursors arent stored yet, try to find the closest visited page and calculate the offset from there,
// // and only then fall back to the old page's cursor
// export function getRequestParamsFromCacheUsingAlgorithm(
//   lastResponse: CursorResponseBody,
//   oldPage: number,
//   newPage: number,
//   limit: number
// ): CursorQueryParams {}

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
