export function encodeCursor(data: any): string {
  return Buffer.from(data.toString(), "ascii").toString("base64");
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("ascii");
}

export function buildConnection(
  items: any[],
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  // Baue Edge Objekte aus den Datensätzen
  const edges = items.map((item) => ({
    node: item,
    cursor: encodeCursor(item.id),
  }));

  // Gebe ein Connection Objekt mit den edges und einer PageInfo zurück
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
