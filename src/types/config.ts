import type {
  CommentResponseResults,
  ListBlockChildrenResponseResults,
  PageObjectProperties,
} from "./notion";

export interface BlockFetcherConfig {
  includeChildPageContent?: boolean;
  fetchPageProperties?: boolean;
  fetchComments?: boolean;
  maxRequestsPerSecond?: number;
  batchSize?: number;
}

export interface FetcherOutput {
  properties: PageObjectProperties;
  comments: CommentResponseResults;
  blocks: ListBlockChildrenResponseResults;
}
