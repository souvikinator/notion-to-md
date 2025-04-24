// Export types in structured groups to make them easier to import selectively

// Notion API types
export type {
  NotionAnnotationType,
  NotionBlock,
  NotionBlockType,
  NotionBlocks,
  NotionComment,
  NotionComments,
  NotionDatabaseId,
  NotionDatabaseEntry,
  NotionDatabaseEntryProperties,
  NotionDatabaseEntryProperty,
  NotionPageProperties,
  NotionPageProperty,
  NotionPagePropertyType,
  NotionRichTextAnnotation,
  NotionRichTextItem,
  NotionDatabaseQueryMapping,
  NotionDatabaseQueryOptions,
  NotionExtendedChildDatabaseObject,
  NotionDatabaseSchemaProperty,
  NotionDatabaseSchemaProperties,
  NotionDatabaseSchema,
  NotionDatabasePropertyType,
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
export type {
  ChainData,
  ProcessorChainNode,
  NotionExporter,
  ConvertResult,
} from './module';

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
  NotionDatabaseConfig,
} from './configuration';

export type {
  ExtendedFetcherOutput,
  FetcherOutput,
  TrackedBlocks,
} from './fetcher';
