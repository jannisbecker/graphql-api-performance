export const CURSOR_FIELD = "id";

export function encodeCursor(data: string): string {
  return Buffer.from(data.toString()).toString("base64");
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString();
}

export function buildConnection(
  items: any[],
  totalCount: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  const edges = items.map((item) => ({
    node: item,
    cursor: encodeCursor(item[CURSOR_FIELD]),
  }));

  return {
    totalCount,
    edges,
    pageInfo: {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasPreviousPage,
      hasNextPage,
    },
  };
}
