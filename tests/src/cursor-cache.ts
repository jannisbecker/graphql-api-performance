type CachedCursors = {
  startCursor: string;
  endCursor: string;
};

let cache: Record<number, CachedCursors> = {};

export function addPageToCache(
  page: number,
  startCursor: string,
  endCursor: string
) {
  cache[page] = { startCursor, endCursor };
}

export function clearCache() {
  cache = {};
}

export function getPageFromCache(pageNum: number): CachedCursors | undefined {
  return cache[pageNum];
}

export function findNearestCursorsInCache(
  currentPage: number,
  targetPage: number
): [number, CachedCursors] | undefined {
  // find the cached page nearest to the targetPage that is not the targetPage itself
  let nearest = currentPage;
  (Object.keys(cache) as unknown as number[]).forEach((page) => {
    const newDistance = Math.abs(targetPage - page);

    if (newDistance < Math.abs(nearest - page) && newDistance !== 0) {
      nearest = page;
    }
  });

  // If we found any closer than the current page we're on, return the entry of it, otherwise undefined
  if (nearest !== currentPage) {
    return [nearest, cache[nearest]];
  }
}
