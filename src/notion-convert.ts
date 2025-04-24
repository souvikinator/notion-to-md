import type { Client } from '@notionhq/client';
import { BlockFetcher } from './core/block-fetcher';
import { Exporter } from './core/exporter';
import { MediaHandler } from './core/media-handler';
import { DirectStrategy } from './core/media-handler/strategies/direct';
import { DownloadStrategy } from './core/media-handler/strategies/download';
import { UploadStrategy } from './core/media-handler/strategies/upload';
import { PageRefConfig, PageReferenceHandler } from './core/page-ref-handler';

import {
  MediaManifestManager,
  PageReferenceManifestManager,
} from './utils/manifest-manager';
import { BaseRendererPlugin } from './core/renderer';
import { MDXRenderer } from './plugins/renderer';
import { normalizeUUID } from './utils/notion/index';
import { MediaStrategyType } from './types/manifest-manager';
import {
  ProcessorChainNode,
  NotionExporter,
  ChainData,
  ConvertResult,
} from './types/module';
import { ExtendedFetcherOutput } from './types/fetcher';
import { MediaStrategy } from './types/strategy';
import {
  NotionConverterConfig,
  BlockFetcherConfig,
  NotionDatabaseConfig,
  DownloadStrategyConfig,
  UploadStrategyConfig,
  DirectStrategyConfig,
} from './types/configuration';

/**
 * Main class that orchestrates the conversion process using a chain of processors.
 * Uses builder pattern for configuration and manages the complete pipeline.
 */
export class NotionConverter {
  private config: NotionConverterConfig = {};
  private processorChain?: ProcessorChainNode; // points to head of the processor chain

  constructor(private notionClient: Client) {
    console.debug('[NotionConverter] Initializing with default configuration');
    this.config.blockFetcherConfig = {
      fetchPageProperties: true,
      fetchComments: false,
      maxRequestsPerSecond: 3, // Notion's default rate limit
      batchSize: 3,
      trackMediaBlocks: false,
      trackPageRefBlocks: false,
      databaseConfig: {
        fetchDatabases: true,
        // database queries are optional
      },
    };
    console.debug(
      '[NotionConverter] Default block fetcher config:',
      this.config.blockFetcherConfig,
    );
  }

  /**
   * Configures the block fetcher behavior.
   * Controls how blocks are fetched from Notion and what additional data is tracked.
   */
  configureFetcher(config: Partial<BlockFetcherConfig>): this {
    console.debug('[NotionConverter] Configuring block fetcher with:', config);
    this.config.blockFetcherConfig = {
      ...this.config.blockFetcherConfig,
      ...config,
    };
    console.debug(
      '[NotionConverter] Updated block fetcher config:',
      this.config.blockFetcherConfig,
    );
    return this;
  }

  /**
   * Configures database filtering and sorting options
   *
   * This method allows specifying which records to retrieve from Notion databases
   * encountered during the conversion process. Databases can be filtered and sorted
   * using the same syntax as the Notion API.
   *
   * @param databaseConfig A mapping of database IDs to their filter/sort options
   * @returns The NotionConverter instance for chaining
   *
   * @example
   * ```
   * const n2m = new NotionConverter(notionClient)
   *   .configureDatabase({
   *     'database-id-123': {
   *       filters: {
   *         property: 'Status',
   *         select: { equals: 'Published' }
   *       },
   *       sorts: [
   *         { property: 'PublishDate', direction: 'descending' }
   *       ]
   *     }
   *   });
   * ```
   */
  configureDatabase(databaseConfig: NotionDatabaseConfig): this {
    if (!this.config.blockFetcherConfig) {
      this.config.blockFetcherConfig = {};
    }

    // normalize the provided database id (UUID) from user to hyphenated UUID
    // to ensure proper equality checks
    if (databaseConfig.databaseQueries) {
      databaseConfig.databaseQueries = Object.fromEntries(
        Object.entries(databaseConfig.databaseQueries).map(
          ([databaseId, value]) => [normalizeUUID(databaseId), value],
        ),
      );
    }

    // Set the database configuration
    this.config.blockFetcherConfig.databaseConfig = {
      ...this.config.blockFetcherConfig.databaseConfig,
      ...databaseConfig,
    };

    console.debug(
      '[NotionConverter] Updated fetcher config with database options:',
      this.config.blockFetcherConfig,
    );

    return this;
  }

  /**
   * Configures the direct strategy for media handling.
   * Can optionally buffer media content in memory.
   */
  useDirectStrategy(config?: DirectStrategyConfig): this {
    console.debug(
      '[NotionConverter] Configuring direct media strategy with:',
      config || {},
    );
    this.config.mediaConfig = {
      type: MediaStrategyType.DIRECT,
      config: config || {},
    };

    // If buffering is enabled, make sure we track media blocks
    if (config?.buffer && !this.config.blockFetcherConfig) {
      this.config.blockFetcherConfig = {};
    }

    if (config?.buffer && this.config.blockFetcherConfig) {
      this.config.blockFetcherConfig.trackMediaBlocks = true;
    }

    return this;
  }

  /**
   * Configures the download strategy for media handling.
   * Files will be downloaded to local filesystem.
   */
  downloadMediaTo(config: DownloadStrategyConfig): this {
    console.debug(
      '[NotionConverter] Configuring download media strategy with:',
      config,
    );
    this.config.mediaConfig = {
      type: MediaStrategyType.DOWNLOAD,
      config,
    };
    return this;
  }

  /**
   * Configures the upload strategy for media handling.
   * Files will be uploaded to external storage.
   */
  uploadMediaUsing(config: UploadStrategyConfig): this {
    console.debug(
      '[NotionConverter] Configuring upload media strategy with:',
      config,
    );
    this.config.mediaConfig = {
      type: MediaStrategyType.UPLOAD,
      config,
    };
    return this;
  }

  /**
   * Configures page reference handling for transforming Notion URLs
   * into public-facing URLs.
   */
  withPageReferences(config?: PageRefConfig): this {
    console.debug(
      '[NotionConverter] Configuring page reference handling with:',
      config || {},
    );
    this.config.pageRefConfig = config || {};
    return this;
  }

  /**
   * Sets the renderer to use for converting blocks to the target format.
   * If not set, default markdown renderer is used.
   */
  withRenderer(renderer: BaseRendererPlugin): this {
    this.config.renderer = renderer;
    return this;
  }

  /**
   * Configures one or more exporters to handle the final output.
   * Exporters receive the complete ChainData for maximum flexibility.
   */
  withExporter(exporter: NotionExporter | Array<NotionExporter>): this {
    console.debug('[NotionConverter] Configuring exporters');
    this.config.exporters = Array.isArray(exporter) ? exporter : [exporter];
    console.debug(
      '[NotionConverter] Number of configured exporters:',
      this.config.exporters.length,
    );
    return this;
  }

  /**
   * Main conversion method that processes a Notion page through the chain.
   */
  async convert(pageId: string): Promise<ConvertResult> {
    // Making sure that we are consistent with the UUID from the user input
    pageId = normalizeUUID(pageId);
    console.debug('[NotionConverter] Starting conversion for page:', pageId);

    try {
      // Initialize the processor chain if not already done
      if (!this.processorChain) {
        console.debug('[NotionConverter] Initializing processor chain');
        await this.initializeProcessorChain(pageId);
      }

      // Start the processing chain with initial data
      console.debug('[NotionConverter] Creating initial chain data');
      const chainData: ChainData = {
        pageId,
        blockTree: {} as ExtendedFetcherOutput,
        content: '',
        manifests: {},
      };

      // Process through the chain
      console.debug('[NotionConverter] Beginning chain processing');
      const result = await this.processorChain!.process(chainData);
      console.debug(
        '[NotionConverter] Chain processing completed successfully',
      );

      // Return the structured result
      return {
        content: result.content,
        blockTree: result.blockTree,
      };
    } catch (error) {
      console.debug('[NotionConverter] Error during conversion:', error);
      this.handleError(error);
    }
  }

  /**
   * Initializes and links together all the processors based on configuration.
   * Sets up the complete processing chain in the correct order.
   */
  private async initializeProcessorChain(pageId: string): Promise<void> {
    console.debug(
      '[NotionConverter] Initializing processor chain for page:',
      pageId,
    );

    // Start with BlockFetcher as the head of our chain
    this.config.blockFetcherConfig = {
      ...this.config.blockFetcherConfig,
      trackMediaBlocks: this.config.mediaConfig
        ? true
        : this.config.blockFetcherConfig?.trackMediaBlocks,
      trackPageRefBlocks: this.config.pageRefConfig
        ? true
        : this.config.blockFetcherConfig?.trackPageRefBlocks,
    };
    console.debug(
      '[NotionConverter] Creating BlockFetcher with config \n',
      this.config.blockFetcherConfig,
    );

    const head = new BlockFetcher(
      pageId,
      this.notionClient,
      this.config.blockFetcherConfig,
    );
    let current: ProcessorChainNode = head;

    // Add MediaHandler if media processing is configured
    if (this.config.mediaConfig) {
      console.debug('[NotionConverter] Adding MediaHandler to chain');
      const strategy = this.createMediaStrategy(this.config.mediaConfig);
      const mediaManifestManager = new MediaManifestManager();
      await mediaManifestManager.initialize(pageId);

      const mediaHandler = new MediaHandler(
        pageId,
        { strategy },
        mediaManifestManager,
      );
      current.next = mediaHandler;
      current = mediaHandler;
    }

    // Add PageReferenceHandler if configured
    if (this.config.pageRefConfig) {
      console.debug('[NotionConverter] Adding PageReferenceHandler to chain');
      const pageReferenceManifestManager = new PageReferenceManifestManager();
      await pageReferenceManifestManager.initialize();

      const pageRefHandler = new PageReferenceHandler(
        pageId,
        this.config.pageRefConfig,
        pageReferenceManifestManager,
      );
      current.next = pageRefHandler;
      current = pageRefHandler;
    }

    // Add renderer node if configured else fallback to default
    if (!this.config.renderer) {
      console.debug('[NotionConverter] Using default markdown renderer');
      this.config.renderer = new MDXRenderer(); // without frontmatter
    }

    console.debug('[NotionConverter] Adding renderer to chain');
    current.next = this.config.renderer;
    current = this.config.renderer;

    // Add exporter node only if exporters are configured
    if (this.config.exporters?.length) {
      console.debug('[NotionConverter] Adding Exporter to chain');
      const exporterNode = new Exporter(this.config.exporters);
      current.next = exporterNode;
      // No need to update current since exporter is last as of now
    } else {
      console.debug(
        '[NotionConverter] No exporters configured, skipping Exporter node',
      );
    }

    this.processorChain = head;
    console.debug('[NotionConverter] Processor chain initialization complete');
  }

  /**
   * Creates appropriate media strategy based on configuration
   */
  private createMediaStrategy(
    config: NotionConverterConfig['mediaConfig'],
  ): MediaStrategy {
    console.debug(
      '[NotionConverter] Creating media strategy of type:',
      config?.type,
    );
    if (!config) throw new Error('Media config is required to create strategy');

    switch (config.type) {
      case MediaStrategyType.DOWNLOAD:
        return new DownloadStrategy(config.config as DownloadStrategyConfig);
      case MediaStrategyType.UPLOAD:
        return new UploadStrategy(config.config as UploadStrategyConfig);
      case MediaStrategyType.DIRECT:
      default:
        return new DirectStrategy(config.config as DirectStrategyConfig);
    }
  }

  /**
   * Handles errors that occur during the conversion process
   */
  private handleError(error: unknown): never {
    console.debug('[NotionConverter] Handling error:', error);
    throw error;
  }
}
