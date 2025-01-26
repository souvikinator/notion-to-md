import {
  ListBlockChildrenResponseResult,
  MediaStrategy,
  MediaInfo,
} from "../../types";
import { MediaHandlerError } from "../errors";
import { MediaManifestManager } from "../../utils/manifest-manager/media";

export interface MediaHandlerConfig {
  strategy: MediaStrategy;
  failForward?: boolean;
}

export class MediaHandler {
  private readonly strategy: MediaStrategy;
  private readonly failForward: boolean;
  private processedBlockIds: Set<string> = new Set();
  private manifestManager: MediaManifestManager;

  constructor(
    pageId: string,
    private config: MediaHandlerConfig,
    manifestManager: MediaManifestManager,
  ) {
    if (!this.config.strategy) {
      throw new MediaHandlerError("Media strategy is required");
    }

    this.strategy = this.config.strategy;
    this.failForward = this.config.failForward ?? true;
    this.manifestManager = manifestManager;
  }

  /**
   * Process all media blocks
   */
  async processBlocks(
    mediaBlocks: ListBlockChildrenResponseResult[],
  ): Promise<void> {
    if (!this.manifestManager) {
      throw new MediaHandlerError("Manifest manager not initialized");
    }

    // Reset tracking state
    this.processedBlockIds.clear();

    await Promise.all(
      mediaBlocks.map((block) => this.processMediaBlock(block)),
    );

    await this.cleanupRemovedBlocks();

    await (this.manifestManager as MediaManifestManager).save();
  }

  private async processMediaBlock(
    block: ListBlockChildrenResponseResult,
  ): Promise<void> {
    let existingEntry = this.manifestManager.getEntry(block.id);

    // @ts-ignore - If block hasn't changed, just mark as processed and return
    if (existingEntry && existingEntry.lastEdited === block.last_edited_time) {
      this.processedBlockIds.add(block.id);
      return;
    }

    try {
      // Cleanup old media if content changed (but block is same)
      if (existingEntry) {
        await this.strategy.cleanup(existingEntry);
      }

      const mediaInfo = await this.strategy.process(block);

      this.updateBlockMedia(block, mediaInfo);

      await this.manifestManager.updateEntry(block.id, {
        mediaInfo,
        // @ts-ignore
        lastEdited: block.last_edited_time,
      });

      this.processedBlockIds.add(block.id);
    } catch (error) {
      if (!this.failForward) {
        throw error;
      }
      console.error(error);
    }
  }

  private async cleanupRemovedBlocks(): Promise<void> {
    const manifestData = this.manifestManager.getManifest();

    // Find entries for blocks that no longer exist and clean them up
    for (const [blockId, entry] of Object.entries(manifestData.mediaEntries)) {
      if (!this.processedBlockIds.has(blockId)) {
        try {
          await this.strategy.cleanup(entry);
          this.manifestManager.removeEntry(blockId);
        } catch (error) {
          // Cleanup errors are always logged but don't stop processing
          console.warn(error);
        }
      }
    }
  }

  /**
   * Update block with processed media information
   */
  private updateBlockMedia(
    block: ListBlockChildrenResponseResult,
    mediaInfo: MediaInfo,
  ): void {
    if (!("type" in block)) return;

    const blockType = block.type as string;
    if (!["image", "video", "file", "pdf"].includes(blockType)) return;

    // @ts-ignore
    if (block[blockType].type === "external") {
      // @ts-ignore
      block[blockType].external.url = mediaInfo.transformedUrl;
    } else {
      // @ts-ignore
      block[blockType].file.url = mediaInfo.transformedUrl;
    }
  }
}
