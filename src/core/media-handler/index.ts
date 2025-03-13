import {
  ListBlockChildrenResponseResult,
  MediaStrategy,
  MediaInfo,
  ProcessorChainNode,
  ChainData,
} from '../../types';
import { MediaHandlerError } from '../errors';
import { MediaManifestManager } from '../../utils/manifest-manager/media';

export interface MediaHandlerConfig {
  strategy: MediaStrategy;
  failForward?: boolean;
}

export class MediaHandler implements ProcessorChainNode {
  next?: ProcessorChainNode;
  private readonly strategy: MediaStrategy;
  private readonly failForward: boolean;
  private processedBlockIds: Set<string> = new Set();
  private manifestManager: MediaManifestManager;

  constructor(
    pageId: string,
    private config: MediaHandlerConfig,
    manifestManager: MediaManifestManager,
  ) {
    console.debug('[MediaHandler] Initializing for page:', pageId);
    console.debug('[MediaHandler] Configuration:', config);

    if (!this.config.strategy) {
      console.debug(
        '[MediaHandler] Initialization failed: No strategy provided',
      );
      throw new MediaHandlerError('Media strategy is required');
    }

    this.strategy = this.config.strategy;
    this.failForward = this.config.failForward ?? true;
    this.manifestManager = manifestManager;

    console.debug(
      '[MediaHandler] Initialized successfully. failForward:',
      this.failForward,
    );
  }

  async process(data: ChainData): Promise<ChainData> {
    console.debug('[MediaHandler] Starting processing chain');

    if (data.blockTree.mediaBlocks) {
      console.debug(
        '[MediaHandler] Found media blocks to process:',
        data.blockTree.mediaBlocks.length,
      );
      await this.processBlocks(data.blockTree.mediaBlocks);
    } else {
      console.debug('[MediaHandler] No media blocks to process');
    }

    console.debug(
      '[MediaHandler] Processing complete, forwarding to next processor',
    );

    if (!data.manifests) {
      data.manifests = {};
    }

    data.manifests.media = this.manifestManager; // enable access to media manifest data

    return this.next ? this.next.process(data) : data;
  }

  /**
   * Process all media blocks
   */
  async processBlocks(
    mediaBlocks: ListBlockChildrenResponseResult[],
  ): Promise<void> {
    console.debug('[MediaHandler] Starting batch processing of media blocks');

    if (!this.manifestManager) {
      console.debug(
        '[MediaHandler] Process failed: Manifest manager not initialized',
      );
      throw new MediaHandlerError('Manifest manager not initialized');
    }

    // Reset tracking state
    this.processedBlockIds.clear();
    console.debug('[MediaHandler] Reset processed blocks tracking');

    console.debug('[MediaHandler] Processing media blocks in parallel');
    await Promise.all(
      mediaBlocks.map((block) => this.processMediaBlock(block)),
    );

    console.debug('[MediaHandler] Starting cleanup of removed blocks');
    await this.cleanupRemovedBlocks();

    console.debug('[MediaHandler] Saving manifest');
    await (this.manifestManager as MediaManifestManager).save();
    console.debug('[MediaHandler] Batch processing complete');
  }

  private async processMediaBlock(
    block: ListBlockChildrenResponseResult,
  ): Promise<void> {
    console.debug('[MediaHandler] Processing media block:', block.id);
    let existingEntry = this.manifestManager.getEntry(block.id);

    // @ts-ignore - If block hasn't changed, just mark as processed and return
    if (existingEntry && existingEntry.lastEdited === block.last_edited_time) {
      console.debug(
        '[MediaHandler] Block unchanged, skipping processing:',
        block.id,
      );
      this.processedBlockIds.add(block.id);
      return;
    }

    try {
      // Cleanup old media if content changed (but block is same)
      if (existingEntry) {
        console.debug(
          '[MediaHandler] Cleaning up existing media for block:',
          block.id,
        );
        await this.strategy.cleanup(existingEntry);
      }

      console.debug('[MediaHandler] Processing media for block:', block.id);
      const mediaInfo = await this.strategy.process(block);

      console.debug(
        '[MediaHandler] Updating block media information:',
        block.id,
      );
      this.updateBlockMedia(block, mediaInfo);

      console.debug(
        '[MediaHandler] Updating manifest entry for block:',
        block.id,
      );

      if (mediaInfo.type !== 'DIRECT') {
        await this.manifestManager.updateEntry(block.id, {
          mediaInfo,
          // @ts-ignore
          lastEdited: block.last_edited_time,
        });
      }

      this.processedBlockIds.add(block.id);
      console.debug('[MediaHandler] Block processing complete:', block.id);
    } catch (error) {
      console.debug('[MediaHandler] Error processing block:', block.id, error);
      if (!this.failForward) {
        throw error;
      }
      console.error(error);
    }
  }

  private async cleanupRemovedBlocks(): Promise<void> {
    console.debug('[MediaHandler] Starting cleanup of removed blocks');
    const manifestData = this.manifestManager.getManifest();

    // Find entries for blocks that no longer exist and clean them up
    for (const [blockId, entry] of Object.entries(manifestData.mediaEntries)) {
      if (!this.processedBlockIds.has(blockId)) {
        console.debug('[MediaHandler] Cleaning up removed block:', blockId);
        try {
          await this.strategy.cleanup(entry);
          this.manifestManager.removeEntry(blockId);
          console.debug(
            '[MediaHandler] Successfully cleaned up block:',
            blockId,
          );
        } catch (error) {
          // Cleanup errors are always logged but don't stop processing
          console.debug(
            '[MediaHandler] Error during cleanup for block:',
            blockId,
            error,
          );
          console.warn(error);
        }
      }
    }
    console.debug('[MediaHandler] Cleanup complete');
  }

  /**
   * Update block with processed media information
   */
  private updateBlockMedia(
    block: ListBlockChildrenResponseResult,
    mediaInfo: MediaInfo,
  ): void {
    console.debug(
      '[MediaHandler] Updating media information for block:',
      block.id,
    );

    if (!('type' in block)) {
      console.debug('[MediaHandler] Invalid block structure, skipping update');
      return;
    }

    const blockType = block.type as string;
    if (!['image', 'video', 'file', 'pdf'].includes(blockType)) {
      console.debug('[MediaHandler] Unsupported block type:', blockType);
      return;
    }

    // @ts-ignore
    const urlType = block[blockType].type;
    console.debug(
      '[MediaHandler] Updating URL for block type:',
      blockType,
      'URL type:',
      urlType,
    );

    // @ts-ignore
    block[blockType][urlType].url = mediaInfo.transformedUrl;
    console.debug(
      '[MediaHandler] Updated block media URL to:',
      mediaInfo.transformedUrl,
    );
  }
}
