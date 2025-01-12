import {
  MediaHandlerConfig,
  MediaType,
  MediaInfo,
  FetcherOutput,
  ListBlockChildrenResponseResults,
  ListBlockChildrenResponseResult,
  MediaStrategy,
} from "../../types";

export class MediaHandler {
  private mediaTypes: MediaType[];
  private processedBlockIds: Set<string>;
  private pageId: string;
  private strategy: MediaStrategy;

  constructor(config: MediaHandlerConfig) {
    this.pageId = config.pageId;
    this.strategy = config.strategy;
    this.mediaTypes = config.mediaTypes ?? ["image", "video", "file", "pdf"];
    this.processedBlockIds = new Set();
  }

  // Main entry point for processing content
  async processContent(fetcherOutput: FetcherOutput): Promise<void> {
    await this.strategy.initialize(this.pageId);

    // Process all blocks recursively
    await this.processBlocks(fetcherOutput.blocks);

    // Finish processing and perform cleanup
    await this.strategy.finish(this.processedBlockIds);
  }

  private async processBlocks(
    blocks: ListBlockChildrenResponseResults,
  ): Promise<void> {
    for (const block of blocks) {
      if (this.isMediaBlock(block)) {
        // Track processed blocks for cleanup purposes
        this.processedBlockIds.add(block.id);

        const mediaInfo = this.extractMediaInfo(block);
        const processedUrl = await this.strategy.handleMedia(mediaInfo);

        this.updateBlockUrl(block, processedUrl);
      }

      // @ts-ignore
      if (block.has_children && block.children) {
        await this.processBlocks(block.children);
      }
    }
  }

  private isMediaBlock(block: ListBlockChildrenResponseResult): boolean {
    // @ts-ignore
    return this.mediaTypes.includes(block.type as MediaType);
  }

  private extractMediaInfo(block: ListBlockChildrenResponseResult): MediaInfo {
    // @ts-ignore
    const blockContent = block[block.type as MediaType];
    const fileInfo =
      blockContent?.type === "external"
        ? blockContent.external
        : blockContent.file;

    return {
      blockId: block.id,
      // @ts-ignore
      lastEdited: block.last_edited_time,
      // @ts-ignore
      mediaType: block.type as MediaType,
      url: fileInfo.url,
      filename: block.id,
      isExternal: blockContent?.type === "external",
    };
  }

  private updateBlockUrl(
    block: ListBlockChildrenResponseResult,
    url: string,
  ): void {
    // @ts-ignore
    const mediaType = block.type as MediaType;
    // @ts-ignore
    const blockContent = block[mediaType];

    if (blockContent.type === "external") {
      blockContent.external.url = url;
    } else {
      blockContent.file.url = url;
    }
  }
}
