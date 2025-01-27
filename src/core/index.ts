import { Client } from "@notionhq/client";
import { BlockFetcher } from "./block-fetcher";
import { Exporter } from "./exporter";
import { MediaHandler } from "./media-handler";
import { DownloadStrategy } from "./media-handler/strategies/download";
import { UploadStrategy } from "./media-handler/strategies/upload";
import { PageRefConfig, PageReferenceHandler } from "./page-ref-handler";
import {
  NotionExporter,
  ProcessorChainNode,
  ChainData,
  ExtendedFetcherOutput,
  MediaStrategy,
  ExporterError,
  DownloadStrategyConfig,
  UploadStrategyConfig,
  MediaStrategyType,
} from "../types";
import {
  MediaManifestManager,
  PageReferenceManifestManager,
} from "../utils/manifest-manager";

/**
 * Configuration interface for NotionConverter that is built up
 * through the builder pattern methods
 */
interface NotionConverterConfig {
  mediaConfig?: {
    type: MediaStrategyType;
    config: DownloadStrategyConfig | UploadStrategyConfig;
  };
  pageRefConfig?: PageRefConfig;
  renderer?: RendererPlugin;
  exporters?: Array<NotionExporter<any>>;
}

/**
 * Main class that orchestrates the conversion process using a chain of processors.
 * Uses builder pattern for configuration and manages the complete pipeline.
 */
export class NotionConverter {
  private config: NotionConverterConfig = {};
  private processorChain?: ProcessorChainNode; // points to head of the processor chain

  constructor(private notionClient: Client) {}

  /**
   * Configures the download strategy for media handling.
   * Files will be downloaded to local filesystem.
   */
  downloadMediaTo(config: DownloadStrategyConfig): this {
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
  withPageReferences(config: PageRefConfig): this {
    this.config.pageRefConfig = config;
    return this;
  }

  /**
   * TODO: Implement renderer plugin
   * Sets the renderer to use for converting blocks to the target format.
   * If not set, default markdown renderer is used.
   */
  // withRenderer(renderer: RendererPlugin): this {
  //   this.config.renderer = renderer;
  //   return this;
  // }

  /**
   * Configures one or more exporters to handle the final output.
   * Exporters receive the complete ChainData for maximum flexibility.
   */
  withExporter(
    exporter: NotionExporter<any> | Array<NotionExporter<any>>,
  ): this {
    this.config.exporters = Array.isArray(exporter) ? exporter : [exporter];
    return this;
  }

  /**
   * Main conversion method that processes a Notion page through the chain.
   */
  async convert(pageId: string): Promise<void> {
    try {
      // Initialize the processor chain if not already done
      if (!this.processorChain) {
        await this.initializeProcessorChain(pageId);
      }

      // Start the processing chain with initial data
      const chainData: ChainData = {
        pageId,
        blockTree: {} as ExtendedFetcherOutput,
        content: "",
      };

      // Process through the chain
      await this.processorChain!.process(chainData);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Initializes and links together all the processors based on configuration.
   * Sets up the complete processing chain in the correct order.
   */
  private async initializeProcessorChain(pageId: string): Promise<void> {
    // Start with BlockFetcher as the head of our chain
    // FIX: discrepancy in config
    let head = new BlockFetcher(pageId, this.notionClient, {
      trackMediaBlocks: !!this.config.mediaConfig,
      trackPageRefBlocks: !!this.config.pageRefConfig,
      fetchPageProperties: true,
    });

    let current: ProcessorChainNode = head;

    // Add MediaHandler if media processing is configured
    if (this.config.mediaConfig) {
      const strategy = this.createMediaStrategy(this.config.mediaConfig);
      const mediaManifestManager = new MediaManifestManager();
      mediaManifestManager.initialize(pageId);

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
      const pageReferenceManifestManager = new PageReferenceManifestManager();
      pageReferenceManifestManager.initialize();

      const pageRefHandler = new PageReferenceHandler(
        pageId,
        this.config.pageRefConfig,
        pageReferenceManifestManager,
      );
      current.next = pageRefHandler;
      current = pageRefHandler;
    }

    // Add renderer node if configured else throw error
    if (!this.config.renderer) {
      throw new Error("Renderer is required for conversion process");
    }
    current.next = this.config.renderer;
    current = this.config.renderer;

    // Add exporter node if exporters are configured
    if (this.config.exporters?.length) {
      const exporterNode = new Exporter(this.config.exporters);
      current.next = exporterNode;
      // No need to update current since exporter is last as of now
    }

    this.processorChain = head;
  }

  /**
   * Creates appropriate media strategy based on configuration
   */
  private createMediaStrategy(
    config: NotionConverterConfig["mediaConfig"],
  ): MediaStrategy {
    if (!config) throw new Error("Media config is required to create strategy");

    return config.type === MediaStrategyType.DOWNLOAD
      ? new DownloadStrategy(config.config as DownloadStrategyConfig)
      : new UploadStrategy(config.config as UploadStrategyConfig);
  }

  /**
   * Handles errors that occur during the conversion process
   */
  private handleError(error: unknown): never {
    if (error instanceof ExporterError) {
      throw error;
    }
    throw new Error(
      "Failed to convert Notion page: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
