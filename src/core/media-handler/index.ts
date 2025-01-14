import {
  ListBlockChildrenResponseResults,
  ListBlockChildrenResponseResult,
  MediaProcessingError,
  MediaManifestEntry,
} from "../../types";
import { BaseModule } from "../base-module";
import { MediaStrategy } from "./strategies/base";

export class MediaHandler extends BaseModule {
  private processedBlockIds: Set<string> = new Set();
  private entriesToCleanup: MediaManifestEntry[] = [];

  constructor(private strategy: MediaStrategy) {
    super();
  }

  /**
   * Process all media blocks in the provided block tree
   * Updates blocks in place with processed media information
   */
  async processBlocks(blocks: ListBlockChildrenResponseResults): Promise<void> {
    try {
      // Clear processed blocks tracking
      this.processedBlockIds.clear();

      // Process all blocks recursively
      await this.processBlockArray(blocks);

      // Handle cleanup after processing
      await this.handleCleanup();
    } catch (error) {
      throw new MediaProcessingError(
        "Failed to process media blocks",
        "root",
        "processBlocks",
        error,
      );
    }
  }

  /**
   * Recursively process an array of blocks
   */
  private async processBlockArray(
    blocks: ListBlockChildrenResponseResults,
  ): Promise<void> {
    for (const block of blocks) {
      if (this.hasMedia(block)) {
        await this.processMediaBlock(block);
      }

      // Recursively process children if they exist
      if ("children" in block && Array.isArray(block.children)) {
        await this.processBlockArray(block.children);
      }
    }
  }

  /**
   * Process a single media block using the configured strategy
   */
  private async processMediaBlock(
    block: ListBlockChildrenResponseResult,
  ): Promise<void> {
    const existingEntry = this.getManifest().getMediaEntry(block.id);

    try {
      // If the block exists but has been updated, we need to clear the old content of block
      if (
        existingEntry &&
        // @ts-ignore
        existingEntry.lastEdited !== block.last_edited_time
      ) {
        // Clean up the old media before processing new content
        // won't be removed from manifest as block can simply be updated
        await this.strategy.cleanup(existingEntry);
      }

      const mediaInfo = await this.strategy.process(block);

      this.getManifest().updateMediaEntry(block.id, {
        blockId: block.id,
        // @ts-ignore
        lastEdited: block.last_edited_time,
        mediaInfo,
      });

      this.processedBlockIds.add(block.id);
    } catch (error) {
      throw new MediaProcessingError(
        "Failed to process media block",
        block.id,
        "processMediaBlock",
        error,
      );
    }
  }

  private hasMedia(block: ListBlockChildrenResponseResult): boolean {
    // @ts-ignore
    return ["image", "video", "file", "pdf"].includes(block.type);
  }

  /**
   * Handle cleanup of unused media files/resources
   */
  private async handleCleanup(): Promise<void> {
    const manifest = this.getManifest();
    const allEntries = manifest.getAllMediaEntries();

    // Find entries that are there in new blocks but not in the manifest
    for (const [blockId, entry] of Object.entries(allEntries)) {
      if (!this.processedBlockIds.has(blockId)) {
        this.entriesToCleanup.push(entry);
      }
    }

    try {
      // Let strategy handle the cleanup
      const cleanupPromise = this.entriesToCleanup.map(async (entry) => {
        manifest.removeMediaEntry(entry.blockId);
        return this.strategy.cleanup(entry);
      });

      await Promise.all(cleanupPromise);
    } catch (error) {
      throw new MediaProcessingError(
        "Failed to cleanup media files",
        "cleanup",
        "handleCleanup",
        error,
      );
    }
  }
}
