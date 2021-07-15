export enum Impl {
  OFFSET = "naive",
  CURSOR = "cursor_offset",
  DATALOADER = "cursor_offset_dataloader",
  CACHE = "cursor_offset_cache",
}

export type TestResults = number[][];
