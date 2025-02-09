import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  PageProperties,
  ListBlockChildrenResponseResult,
  ListBlockChildrenResponseResults,
  BlockType,
} from './notion';

export type ContextMetadata = Map<string, any>;

export type VariableCollector = Map<string, string[]>;
export type VariableResolvers = Map<string, VariableResolver>;
export interface VariableResolver {
  (variableName: string, context: RendererContext): Promise<string>;
}

export type RichTextAnnotation = RichTextItemResponse['annotations'];

interface AnnotationContext {
  text: string;
  annotations: RichTextAnnotation;
  metadata?: ContextMetadata;
}

export interface RendererContext {
  pageId: string;
  pageProperties: PageProperties;
  metadata: ContextMetadata;
  block: ListBlockChildrenResponseResult;
  blockTree: ListBlockChildrenResponseResults;
  variableData: VariableCollector;

  // Access to all transformers
  transformers: {
    blocks: Record<BlockType, BlockTransformer>;
    annotations: Record<string, AnnotationTransformer>;
  };

  utils: {
    // Helper functions
    processRichText: (
      richText: RichTextItemResponse[],
      metadata?: ContextMetadata,
    ) => Promise<string>;

    processChildren: (
      blocks: ListBlockChildrenResponseResults,
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
