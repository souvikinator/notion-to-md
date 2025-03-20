import {
  MediaManifestManager,
  PageReferenceManifestManager,
} from '../utils/index';
import {
  NotionAnnotationType,
  NotionBlock,
  NotionBlocks,
  NotionBlockType,
  NotionPageProperties,
  NotionRichTextAnnotation,
  NotionRichTextItem,
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
  };

  utils: {
    // Helper functions
    processRichText: (
      richText: NotionRichTextItem[],
      metadata?: ContextMetadata,
    ) => Promise<string>;

    processBlock: (
      block: NotionBlock,
      metadata?: ContextMetadata,
    ) => Promise<string>;
  };
}

export interface BlockTransformer {
  transform: (context: RendererContext) => Promise<string>;
  targetVariable?: string;
  imports?: string[];
}

export interface AnnotationTransformer {
  transform: (context: AnnotationContext) => Promise<string>;
}
