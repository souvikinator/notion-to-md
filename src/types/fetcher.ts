import { NotionBlocks, NotionComments, NotionPageProperties } from './notion';

export interface FetcherOutput {
  properties: NotionPageProperties;
  blocks: NotionBlocks;
  comments: NotionComments;
}

export type ExtendedFetcherOutput = FetcherOutput & TrackedBlocks;

// Optional tracked blocks interface
export interface TrackedBlocks {
  mediaBlocks?: NotionBlocks;
  pageRefBlocks?: NotionBlocks;
}
