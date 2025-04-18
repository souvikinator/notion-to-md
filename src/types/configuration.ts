import { BaseRendererPlugin } from '../core/renderer';
import { MediaManifestEntry, MediaStrategyType } from './manifest-manager';
import { NotionExporter } from './module';
import { NotionDatabaseQueryMapping } from './notion';
import { MediaStrategy } from './strategy';

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
  uploadHandler(url: string, blockId: string): Promise<string>;
  cleanupHandler?(entry: MediaManifestEntry): Promise<void>;
  transformPath?(uploadedUrl: string): string;
  preserveExternalUrls?: boolean;
  failForward?: boolean;
}

export type DirectStrategyBufferSupportedBlockType =
  | 'pdf'
  | 'file'
  | 'image'
  | 'video';

// direct media strategy
export interface BufferOptions {
  // Block types to buffer (if omitted, all media blocks are buffered)
  includeBlocks?: DirectStrategyBufferSupportedBlockType[];
  // Maximum buffer size in bytes (0 for no limit)
  maxBufferSize?: number;
  // Custom fetching logic
  blockHandlers?: Record<
    DirectStrategyBufferSupportedBlockType,
    (block: any, url: string) => Promise<Buffer>
  >;
}

export interface DirectStrategyConfig {
  // Enable and configure buffer functionality
  buffer?: boolean | BufferOptions;
  // Continue processing on errors, default is true
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
