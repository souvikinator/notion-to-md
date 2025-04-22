import { BaseRendererPlugin } from '../core/renderer';
import { MediaManifestEntry, MediaStrategyType } from './manifest-manager';
import { NotionExporter } from './module';
import { NotionDatabaseQueryMapping } from './notion';
import { MediaStrategy } from './strategy';
import { TrackedBlockReferenceObject } from './fetcher';

export interface NotionDatabaseConfig {
  fetchDatabases?: boolean;
  databaseQueries?: NotionDatabaseQueryMapping;
}

export interface PageRefConfig {
  UrlPropertyNameNotion?: string;
  baseUrl?: string;
  transformUrl?: (url: string) => string;
}

export interface BlockFetcherConfig {
  fetchPageProperties?: boolean;
  fetchComments?: boolean;
  maxRequestsPerSecond?: number;
  batchSize?: number;
  trackMediaBlocks?: boolean;
  trackPageRefBlocks?: boolean;
  databaseConfig?: NotionDatabaseConfig;
}

export interface MediaHandlerConfig {
  strategy: MediaStrategy;
  failForward?: boolean;
}

// download media strategy
export interface DownloadStrategyConfig {
  outputDir: string;
  transformPath?: (localPath: string) => string;
  preserveExternalUrls?: boolean;
  failForward?: boolean;
}

// upload media strategy
export interface UploadStrategyConfig {
  uploadHandler(url: string, contextId: string): Promise<string>;
  cleanupHandler?(entry: MediaManifestEntry): Promise<void>;
  transformPath?(uploadedUrl: string): string;
  preserveExternalUrls?: boolean;
  failForward?: boolean;
}

/** Supported Notion reference types for DirectStrategy buffering */
export type DirectStrategyBufferReferenceType =
  | 'block'
  | 'database_property'
  | 'page_property';

/** Supported Notion media block content types */
export type NotionMediaBlockType = 'image' | 'video' | 'pdf' | 'file';

/** Custom handler function type for DirectStrategy buffering */
export type CustomBufferHandler = (
  /** The full reference object (block or property) being processed. */
  reference: TrackedBlockReferenceObject,
  /** The index of the file within a property (undefined for blocks). */
  index: number | undefined,
  /** The original URL of the media file. */
  url: string,
) => Promise<Buffer>;

/**
 * Configuration options specifically for buffering in DirectStrategy.
 */
export interface DirectStrategyBufferOptions {
  /**
   * Array specifying which reference types to enable buffering for.
   * If `buffer` is set to `true` in `DirectStrategyConfig` and this is omitted,
   * it defaults to `['block', 'database_property']`.
   * To enable for page properties as well, use `['block', 'database_property', 'page_property']`.
   * Provide an empty array `[]` to disable buffering even if `buffer` is `true`.
   * @default ['block', 'database_property']
   */
  enableFor?: DirectStrategyBufferReferenceType[];
  /**
   * **Only applies if 'block' is included in `enableFor`**.
   * Array specifying which specific Notion media block content types should be buffered.
   * If omitted, all supported media block types ('image', 'video', 'pdf', 'file')
   * encountered within enabled 'block' references will be buffered.
   * Example: `['image', 'pdf']` to only buffer images and PDFs found in blocks.
   */
  includeBlockContentTypes?: NotionMediaBlockType[];
  /**
   * Maximum buffer size in bytes for each media file.
   * If a file exceeds this size, buffering will be skipped for that file.
   * Set to `0` or `undefined` for no limit.
   * @default 0
   */
  maxBufferSize?: number;
  /**
   * Optional custom fetching logic per reference type.
   * Allows providing specific functions to fetch and return a Buffer for
   * 'block', 'database_property', or 'page_property' references.
   * If a handler is provided for a type, it overrides the default fetch behavior for that type.
   */
  handlers?: Partial<
    Record<DirectStrategyBufferReferenceType, CustomBufferHandler>
  >;
}

// direct media strategy
/**
 * Configuration for the Direct Media Strategy.
 */
export interface DirectStrategyConfig {
  /**
   * Enable and configure media content buffering.
   * Buffering fetches media content and attaches it as a `Buffer` to the Notion block
   * or property file entry object during conversion.
   *
   * - `true`: Enables buffering with default options (buffers 'block' and 'database_property' types).
   * - `false` or `undefined`: Disables buffering (default).
   * - `object`: Enables buffering with specific options defined in `DirectStrategyBufferOptions`,
   *   allowing fine-grained control over which reference types are buffered, size limits,
   *   and custom fetching logic.
   *
   * @default false
   */
  buffer?: boolean | DirectStrategyBufferOptions;
  /**
   * Continue processing other media references if an error occurs during the processing of one.
   * If `false`, the first error encountered will stop the entire media processing step.
   * @default true
   */
  failForward?: boolean;
}

/**
 * Configuration interface for NotionConverter that is built up
 * through the builder pattern methods
 */
export interface NotionConverterConfig {
  mediaConfig?: {
    type: MediaStrategyType;
    config:
      | DownloadStrategyConfig
      | UploadStrategyConfig
      | DirectStrategyConfig;
  };
  pageRefConfig?: PageRefConfig;
  renderer?: BaseRendererPlugin;
  exporters?: Array<NotionExporter>;
  blockFetcherConfig?: BlockFetcherConfig;
}
