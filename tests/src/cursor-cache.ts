type CachedPage = {
  startCursor: string;
  endCursor: string;
};

let cache: Record<number, CachedPage> = {};

export function addPageToCache(pageNum: number, cursors: CachedPage) {
  cache[pageNum] = cursors;
}

export function clearCache() {
  cache = {};
}

export function getCursorsForPage(pageNum: number): CachedPage | undefined {
  return cache[pageNum];
}
