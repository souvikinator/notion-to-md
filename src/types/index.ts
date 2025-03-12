// Export types in structured groups to make them easier to import selectively

// Notion API types
export type {
  BlockType,
  AnnotationType,
  BlockAttributes,
  FetcherOutput,
  TrackedBlocks,
  ExtendedFetcherOutput,
  ListBlockChildrenResponseResults,
  ListBlockChildrenResponseResult,
  CommentResponseResults,
  CommentResponseResult,
  PageProperties,
  PageObjectProperties,
  RichTextItem,
  RichTextAnnotation,
} from './notion';

// Manifest manager types
export type {
  MediaManifest,
  MediaManifestInput,
  MediaManifestEntry,
  MediaInfo,
  PageManifest,
  PageReferenceEntry,
} from './manifest-manager';

export { MediaStrategyType, PageReferenceEntryType } from './manifest-manager';

// Strategy types
export type { MediaStrategy } from './strategy';

export { MediaProcessingError } from './strategy';

// Module types
export type { ChainData, ProcessorChainNode, NotionExporter } from './module';

export { ExporterError } from './module';

// Renderer types
export type {
  ContextMetadata,
  VariableNames,
  VariableCollector,
  VariableResolvers,
  VariableResolver,
  RendererContext,
  BlockTransformer,
  AnnotationTransformer,
} from './renderer';

export type {
  DownloadStrategyConfig,
  UploadStrategyConfig,
  BlockFetcherConfig,
  MediaHandlerConfig,
  NotionConverterConfig,
  PageRefConfig,
} from './configuration';
