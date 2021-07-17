export enum Impl {
  OFFSET = "offset",
  CURSOR = "cursor-offset",
  DATALOADER = "cursor-offset_dataloader",
  CACHE = "cursor-offset_cache",
}

export type TestResults = number[][];

export type OffsetResponseBody = {
  data: {
    products: Array<{
      id: number;
      name: string;
      categories: Array<{
        id: number;
        name: string;
      }>;
    }>;
  };
};

export type CursorResponseBody = {
  data: {
    products: {
      edges: Array<{
        node: {
          id: number;
          name: string;
          categories: Array<{
            id: number;
            name: string;
          }>;
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
      };
    };
  };
};

export type OffsetQueryParams = {
  offset?: number;
  limit?: number;
};

export type CursorQueryParams = {
  after?: string;
  first?: number;
  before?: string;
  last?: number;
  offset?: number;
};
