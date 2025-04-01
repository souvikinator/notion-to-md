import {
  NotionBlock,
  NotionBlocks,
  NotionComments,
  NotionDatabaseEntryProperty,
  NotionPageProperties,
} from './notion';

export interface FetcherOutput {
  properties: NotionPageProperties;
  blocks: NotionBlocks;
  comments: NotionComments;
}

export interface TrackedBlockReferenceObject {
  type: 'block' | 'property';
  parentId: string; // Database/page ID for properties, parent block ID for blocks
  id: string; // Block ID or property ID
  propertyName?: string; // Only for properties - name of the property
  ref: NotionBlock | NotionDatabaseEntryProperty; // Direct reference to the original object
}

export interface TrackedBlocks {
  mediaBlockReferences?: TrackedBlockReferenceObject[];
  pageRefBlockReferences?: TrackedBlockReferenceObject[];
}

export interface ExtendedFetcherOutput extends FetcherOutput, TrackedBlocks {}
