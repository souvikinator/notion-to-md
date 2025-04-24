import { MediaHandlerError } from '../errors';
import { MediaManifestManager } from '../../utils/manifest-manager/media';
import { ProcessorChainNode, ChainData } from '../../types/module';
import {
  MediaStrategy,
  StrategyInput,
  StrategyOutput,
} from '../../types/strategy';
import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../types/notion';
import { TrackedBlockReferenceObject } from '../../types/fetcher';
import { generateFilename } from '../../utils/media/filename';

export interface MediaHandlerConfig {
  strategy: MediaStrategy;
  failForward?: boolean;
}

export class MediaHandler implements ProcessorChainNode {
  next?: ProcessorChainNode;
  private readonly strategy: MediaStrategy;
  private readonly failForward: boolean;
  private processedReferences: Set<string> = new Set();
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

    if (data.blockTree.mediaBlockReferences?.length) {
      console.debug(
        '[MediaHandler] Found media references to process:',
        data.blockTree.mediaBlockReferences.length,
      );
      await this.processMediaReferences(data.blockTree.mediaBlockReferences);
    } else {
      console.debug('[MediaHandler] No media references to process');
    }

    console.debug(
      '[MediaHandler] Processing complete, forwarding to next processor',
    );

    if (!data.manifests) {
      data.manifests = {};
    }

    data.manifests.media = this.manifestManager;

    return this.next ? this.next.process(data) : data;
  }

  /**
   * Process all media references concurrently.
   */
  async processMediaReferences(
    mediaRefs: TrackedBlockReferenceObject[],
  ): Promise<void> {
    console.debug(
      '[MediaHandler] Starting concurrent batch processing of media references',
    );

    if (!this.manifestManager) {
      console.debug(
        '[MediaHandler] Process failed: Manifest manager not initialized',
      );
      throw new MediaHandlerError('Manifest manager not initialized');
    }

    this.processedReferences.clear();
    console.debug('[MediaHandler] Reset processed references tracking');

    console.debug(
      `[MediaHandler] Processing ${mediaRefs.length} media references concurrently`,
    );

    const processingPromises = mediaRefs.map(async (ref) => {
      try {
        await this.processMediaReference(ref);
      } catch (error) {
        // Handle errors from individual reference processing based on failForward
        console.debug(
          `[MediaHandler] Error processing reference ${ref.id} during concurrent execution:`,
          error,
        );
        if (!this.failForward) {
          // Log critical error if not failing forward (though Promise.allSettled proceeds)
          console.error(
            `[MediaHandler] Critical error processing reference ${ref.id}. Processing stopped for this item. Error: ${error instanceof Error ? error.message : error}`,
          );
          // NOTE: We don't re-throw here to allow Promise.allSettled to complete fully.
        }
        // If failing forward, log the error and continue with others.
        console.error(
          `[MediaHandler] Failed to process reference ${ref.id}, but continuing due to failForward=true: ${error instanceof Error ? error.message : error}`,
        );
      }
    });

    await Promise.allSettled(processingPromises);
    console.debug('[MediaHandler] All concurrent processing settled.');

    console.debug('[MediaHandler] Starting cleanup of removed references');
    await this.cleanupRemovedReferences();

    console.debug('[MediaHandler] Saving manifest');
    await this.manifestManager.save();
    console.debug('[MediaHandler] Batch processing complete');
  }

  private async processMediaReference(
    ref: TrackedBlockReferenceObject,
  ): Promise<void> {
    console.debug(
      '[MediaHandler] Processing media reference:',
      ref.id,
      'type:',
      ref.type,
    );

    // Different handling based on reference type
    switch (ref.type) {
      case 'block': {
        await this.processReferenceItem(ref);
        break;
      }

      case 'database_property':
      case 'page_property': {
        const property = ref.ref as
          | NotionDatabaseEntryProperty
          | NotionPageProperty;
        if (property.type === 'files' && property.files?.length > 0) {
          console.debug(
            `[MediaHandler] Processing ${property.files.length} file(s) in property: ${ref.propertyName}`,
          );
          const fileProcessingPromises = property.files.map((_file, i) =>
            this.processReferenceItem(ref, i),
          );
          await Promise.allSettled(fileProcessingPromises);
        } else {
          console.debug(
            `[MediaHandler] Skipping non-file or empty file property: ${ref.propertyName}`,
          );
        }
        break;
      }

      default:
        console.warn(
          `[MediaHandler] Encountered unknown reference type: ${ref.type}`,
        );
        break;
    }
  }

  /**
   * Processes a single identifiable media item, either a block or a file within a property.
   * Delegates the core logic and decision-making to the configured strategy.
   */
  private async processReferenceItem(
    ref: TrackedBlockReferenceObject,
    index?: number,
  ): Promise<void> {
    const refId = this.getCompositeReferenceId(ref, index);
    console.debug('[MediaHandler] Processing item reference ID:', refId);

    const potentialFilename = generateFilename(ref, index);
    const lastEditedTime = this.getLastEditedTime(ref);

    const strategyInput: StrategyInput = {
      reference: ref,
      index,
      refId,
      manifestManager: this.manifestManager,
      lastEditedTime,
      potentialFilename,
    };

    console.debug('[MediaHandler] Calling strategy process for:', refId);
    const strategyOutput: StrategyOutput =
      await this.strategy.process(strategyInput);

    console.debug(
      '[MediaHandler] Strategy process completed for:',
      refId,
      'Output:',
      strategyOutput,
    );

    // Update manifest based on strategy output (unchanged)
    if (strategyOutput.needsManifestUpdate && strategyOutput.mediaInfo) {
      console.debug('[MediaHandler] Updating manifest entry for:', refId);
      await this.manifestManager.updateEntry(refId, {
        mediaInfo: strategyOutput.mediaInfo,
        lastEdited: lastEditedTime,
      });
    } else {
      console.debug(
        '[MediaHandler] Manifest update not required by strategy for:',
        refId,
      );
    }

    // Add to set only if strategy did not skip due to configuration.
    if (strategyOutput.isProcessed) {
      this.processedReferences.add(refId);
      console.debug('[MediaHandler] Marked as processed (for cleanup):', refId);
    } else {
      console.debug(
        '[MediaHandler] Marked as NOT processed (due to config skip):',
        refId,
      );
    }
  }

  private async cleanupRemovedReferences(): Promise<void> {
    console.debug('[MediaHandler] Starting cleanup of removed references');
    const manifestData = this.manifestManager.getManifest();
    if (!manifestData?.mediaEntries) {
      console.debug('[MediaHandler] No manifest entries found for cleanup.');
      return;
    }

    if (typeof this.strategy.cleanup !== 'function') {
      console.debug(
        '[MediaHandler] Current strategy does not implement cleanup method. Skipping cleanup phase.',
      );
      return;
    }

    for (const [refId, entry] of Object.entries(manifestData.mediaEntries)) {
      if (!this.processedReferences.has(refId)) {
        console.debug('[MediaHandler] Cleaning up removed reference:', refId);
        try {
          await this.strategy.cleanup(entry);
          this.manifestManager.removeEntry(refId);
          console.debug(
            '[MediaHandler] Successfully cleaned up and removed manifest entry for:',
            refId,
          );
        } catch (error) {
          console.debug(
            '[MediaHandler] Error during cleanup for reference:',
            refId,
            error,
          );
          console.warn(
            `[MediaHandler] Failed to cleanup media for reference ${refId}. Manifest entry retained. Error: ${error instanceof Error ? error.message : error}`,
          );
        }
      }
    }
    console.debug('[MediaHandler] References cleanup complete');
  }

  // Helper to generate consistent composite ID for references
  private getCompositeReferenceId(
    ref: TrackedBlockReferenceObject,
    index?: number,
  ): string {
    switch (ref.type) {
      case 'block':
        return ref.id;

      case 'database_property':
      case 'page_property': {
        const propIndex = index ?? 0;
        const propName = ref.propertyName || 'unknown_prop';
        const parentId = ref.parentId || ref.id;
        return `${parentId}_${propName}_${propIndex}`;
      }

      default: {
        console.warn(
          `[MediaHandler] Generating fallback composite ID for unknown type: ${ref.type}`,
        );
        const unknownIndex = index ?? 0;
        return `unknown_${ref.id}_${unknownIndex}`;
      }
    }
  }

  // Get last edited time from the reference source
  private getLastEditedTime(ref: TrackedBlockReferenceObject): string {
    if (ref.type === 'block' && 'last_edited_time' in ref.ref) {
      return (ref.ref as NotionBlock).last_edited_time;
    }

    if ('last_edited_time' in ref.ref) {
      // @ts-ignore
      return ref.ref.last_edited_time;
    }

    console.warn(
      `[MediaHandler] Could not determine last_edited_time for ref ${ref.id}. Falling back to current time.`,
    );
    return new Date().toISOString();
  }
}
