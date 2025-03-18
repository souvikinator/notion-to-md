import { BaseRendererPlugin } from '../core/renderer';
import { MediaManifestEntry, MediaStrategyType } from './manifest-manager';
import { NotionExporter } from './module';
import { MediaStrategy } from './strategy';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

type DatabaseId = string;

export interface DatabaseQueryOptions {
  filter?: QueryDatabaseParameters['filter'];
  sorts?: QueryDatabaseParameters['sorts'];
}

export type DatabaseQueryMapping = Record<DatabaseId, DatabaseQueryOptions>;

export interface NotionDatabaseConfig {
  fetchDatabases?: boolean;
  databaseQueries?: DatabaseQueryMapping;
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

/**
 * Configuration interface for NotionConverter that is built up
 * through the builder pattern methods
 */
export interface NotionConverterConfig {
  mediaConfig?: {
    type: MediaStrategyType;
    config: DownloadStrategyConfig | UploadStrategyConfig;
  };
  pageRefConfig?: PageRefConfig;
  renderer?: BaseRendererPlugin;
  exporters?: Array<NotionExporter<any>>;
  blockFetcherConfig?: BlockFetcherConfig;
}
