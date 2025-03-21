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
