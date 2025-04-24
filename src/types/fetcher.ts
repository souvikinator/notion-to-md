import {
  NotionBlock,
  NotionBlocks,
  NotionComments,
  NotionDatabaseEntryProperty,
  NotionPageProperties,
  NotionPageProperty,
} from './notion';

export interface FetcherOutput {
  properties: NotionPageProperties;
  blocks: NotionBlocks;
  comments: NotionComments;
}

export interface TrackedBlockReferenceObject {
  type: 'block' | 'database_property' | 'page_property';
  parentId: string; // Database/page ID for properties, parent block ID for blocks
  id: string; // Block ID or property ID
  propertyName?: string; // For properties - name of the property
  ref: NotionBlock | NotionDatabaseEntryProperty | NotionPageProperty; // Direct reference
}

export interface TrackedBlocks {
  mediaBlockReferences?: TrackedBlockReferenceObject[];
  pageRefBlockReferences?: TrackedBlockReferenceObject[];
}

export interface ExtendedFetcherOutput extends FetcherOutput, TrackedBlocks {}
