export const CURSOR_FIELD = "id";

export function encodeCursor(data: string): string {
  return Buffer.from(data, "ascii").toString("base64");
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("ascii");
}

export function buildConnection(
  items: any[],
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  const edges = items.map((item) => ({
    node: item,
    cursor: encodeCursor(item[CURSOR_FIELD]),
  }));
  return {
    edges,
    pageInfo: {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasPreviousPage,
      hasNextPage,
    },
  };
}
