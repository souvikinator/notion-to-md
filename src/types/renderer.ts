import {
  MediaManifestManager,
  PageReferenceManifestManager,
} from '../utils/index';
import {
  NotionAnnotationType,
  NotionBlock,
  NotionBlocks,
  NotionBlockType,
  NotionDatabasePropertyType,
  NotionPageProperties,
  NotionRichTextAnnotation,
  NotionRichTextItem,
  NotionDatabaseEntryProperties,
  NotionDatabaseEntryProperty,
} from './notion';

/**
 * Helper type to extract the specific NotionBlock type for a given block type string.
 * This leverages the built-in Extract utility type for better type safety.
 *
 * Example: GetBlockByType<'image'> will extract the member of the NotionBlock union
 *          that has { type: 'image' }.
 */
export type GetBlockByType<T extends NotionBlockType> = Extract<
  NotionBlock,
  { type: T }
>;

export type ContextMetadata = Record<string, any>;

export type VariableNames = 'imports' | 'content' | string;
export type VariableCollector = Map<VariableNames, string[]>;
export type VariableResolvers = Map<VariableNames, VariableResolver>;
export interface VariableResolver {
  (variableName: VariableNames, context: RendererContext): Promise<string>;
}

export interface AnnotationContext {
  text: string;
  annotations?: NotionRichTextAnnotation;
  link?: {
    url: string;
  };
  metadata?: ContextMetadata;
  manifest: {
    media?: MediaManifestManager;
    pageRef?: PageReferenceManifestManager;
  };
}

export interface RendererContext {
  pageId: string;
  pageProperties: NotionPageProperties;
  metadata: ContextMetadata;
  block: NotionBlock;
  blockTree: NotionBlocks;
  variableData: VariableCollector;

  manifest: {
    media?: MediaManifestManager;
    pageRef?: PageReferenceManifestManager;
  };

  // Access to all transformers
  transformers: {
    blocks: Record<NotionBlockType, BlockTransformer>;
    annotations: Record<NotionAnnotationType, AnnotationTransformer>;
    properties: Record<NotionDatabasePropertyType, DatabasePropertyTransformer>;
  };

  utils: BaseRendererUtils & {
    [key: string]: any;
  };
}

/**
 * Type-safe RendererContext when the block type is known.
 * This provides a narrowed block type based on the generic parameter.
 *
 * Example: TypedRendererContext<'paragraph'> will have block typed as
 * GetBlockByType<'paragraph'>, giving access to block.paragraph.
 */
export interface TypedRendererContext<T extends NotionBlockType>
  extends Omit<RendererContext, 'block'> {
  block: GetBlockByType<T>;
}

export interface DatabasePropertyContext {
  property: NotionDatabaseEntryProperty; // The specific property being transformed
  properties: NotionDatabaseEntryProperties; // All properties from the database
  block: NotionBlock; // The block that contains the property
  utils: RendererContext['utils']; // Same utils as block transformers
  metadata?: ContextMetadata; // Additional metadata
}

export interface DatabasePropertyTransformer {
  transform: (context: DatabasePropertyContext) => Promise<string>;
}

export interface BlockTransformer {
  transform: (context: RendererContext) => Promise<string>;
  targetVariable?: string;
  imports?: string[];
}

/**
 * Type-safe BlockTransformer for working with specific block types.
 * When used with createBlockTransformer, this automatically provides the correct
 * block type inside the transform function based on the type string.
 *
 * Example: TypedBlockTransformer<'image'> will have transform function with
 * context.block typed as GetBlockByType<'image'>, giving access to block.image.
 */
export interface TypedBlockTransformer<T extends NotionBlockType> {
  transform: (context: TypedRendererContext<T>) => Promise<string>;
  targetVariable?: string;
  imports?: string[];
}

export interface AnnotationTransformer {
  transform: (context: AnnotationContext) => Promise<string>;
}

export interface BaseRendererUtils {
  // Required base utilities
  transformRichText: (
    richText: NotionRichTextItem[],
    metadata?: ContextMetadata,
  ) => Promise<string>;

  processBlock: (
    block: NotionBlock,
    metadata?: ContextMetadata,
  ) => Promise<string>;

  transformDatabaseProperties: (
    properties: NotionDatabaseEntryProperties,
    context: RendererContext,
  ) => Promise<Partial<Record<NotionDatabasePropertyType, string>>>;
}
