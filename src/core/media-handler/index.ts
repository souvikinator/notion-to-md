import { MediaHandlerError } from '../errors';
import { MediaManifestManager } from '../../utils/manifest-manager/media';
import { MediaInfo } from '../../types/manifest-manager';
import { ProcessorChainNode, ChainData } from '../../types/module';
import { MediaStrategy } from '../../types/strategy';
import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../types/notion';
import { TrackedBlockReferenceObject } from '../../types/fetcher';
import * as fs from 'fs/promises';

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

    if (data.blockTree.mediaBlockReferences) {
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

    data.manifests.media = this.manifestManager; // enable access to media manifest data

    return this.next ? this.next.process(data) : data;
  }

  /**
   * Process all media references
   */
  async processMediaReferences(
    mediaRefs: TrackedBlockReferenceObject[],
  ): Promise<void> {
    console.debug(
      '[MediaHandler] Starting batch processing of media references',
    );

    if (!this.manifestManager) {
      console.debug(
        '[MediaHandler] Process failed: Manifest manager not initialized',
      );
      throw new MediaHandlerError('Manifest manager not initialized');
    }

    // Reset tracking state for references
    this.processedReferences.clear();
    console.debug('[MediaHandler] Reset processed references tracking');

    console.debug('[MediaHandler] Processing media references in parallel');

    // Process all references
    for (const ref of mediaRefs) {
      await this.processMediaReference(ref);
    }

    console.debug('[MediaHandler] Starting cleanup of removed references');
    await this.cleanupRemovedReferences();

    console.debug('[MediaHandler] Saving manifest');
    await (this.manifestManager as MediaManifestManager).save();
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
        await this.processSingleReference(ref);
        break;
      }

      case 'database_property': {
        // Process each file in the database property
        const dbProperty = ref.ref as NotionDatabaseEntryProperty;
        if (
          dbProperty.type === 'files' &&
          dbProperty.files &&
          dbProperty.files.length > 0
        ) {
          for (let i = 0; i < dbProperty.files.length; i++) {
            await this.processSingleReference(ref, i);
          }
        }
        break;
      }

      case 'page_property': {
        // Process the page property (typically a single file)
        await this.processSingleReference(ref);
        break;
      }
    }
  }

  private async processSingleReference(
    ref: TrackedBlockReferenceObject,
    index?: number,
  ): Promise<void> {
    // Generate a reference ID for manifest tracking
    const refId = this.getCompositeReferenceId(ref, index);
    console.debug('[MediaHandler] Processing single reference:', refId);

    // Check for existing entry
    const existingEntry = this.manifestManager.getEntry(refId);
    const lastEditedTime = this.getLastEditedTime(ref);

    // Check if entry exists, is unchanged, and file exists
    if (existingEntry && existingEntry.lastEdited === lastEditedTime) {
      // Check if the file still exists
      if (existingEntry.mediaInfo.localPath) {
        try {
          await fs.access(existingEntry.mediaInfo.localPath);

          // File exists and is unchanged, just apply transform
          console.debug(
            '[MediaHandler] Reference unchanged and file exists, applying transform:',
            refId,
          );
          const transformedPath = this.strategy.transform(
            existingEntry.mediaInfo,
          );

          // Update URLs in source
          this.updateReferenceMedia(
            ref,
            {
              ...existingEntry.mediaInfo,
              transformedPath,
            },
            index,
          );

          this.processedReferences.add(refId);
          return;
        } catch (error: unknown) {
          console.error(error);
          // File doesn't exist, continue to processing
          console.debug(
            '[MediaHandler] Local file missing, reprocessing:',
            refId,
          );
        }
      }
    }

    // Process reference with the strategy
    try {
      console.debug('[MediaHandler] Processing media for reference:', refId);
      const mediaInfo = await this.strategy.process(ref, index);

      console.debug('[MediaHandler] Updating reference media:', refId);
      this.updateReferenceMedia(ref, mediaInfo, index);

      if (mediaInfo.type !== 'DIRECT') {
        console.debug(
          '[MediaHandler] Updating manifest entry for reference:',
          refId,
        );
        await this.manifestManager.updateEntry(refId, {
          mediaInfo,
          lastEdited: lastEditedTime,
        });
      }

      this.processedReferences.add(refId);
      console.debug('[MediaHandler] Reference processing complete:', refId);
    } catch (error) {
      console.debug('[MediaHandler] Error processing reference:', refId, error);
      if (!this.failForward) {
        throw error;
      }
      console.error(error);
    }
  }

  /**
   * Update media in the reference source
   */
  private updateReferenceMedia(
    ref: TrackedBlockReferenceObject,
    mediaInfo: MediaInfo,
    index?: number,
  ): void {
    switch (ref.type) {
      case 'block':
        this.updateBlockMedia(ref.ref as NotionBlock, mediaInfo);
        break;

      case 'database_property':
        this.updatePropertyMedia(
          ref.ref as NotionDatabaseEntryProperty,
          mediaInfo,
          index || 0,
        );
        break;

      case 'page_property':
        this.updatePropertyMedia(ref.ref as NotionPageProperty, mediaInfo, 0);
        break;
    }
  }

  private updatePropertyMedia(
    property: NotionDatabaseEntryProperty | NotionPageProperty,
    mediaInfo: MediaInfo,
    index: number,
  ): void {
    if (
      property.type !== 'files' ||
      !property.files ||
      !property.files[index]
    ) {
      console.debug(
        '[MediaHandler] Invalid property or missing file at index:',
        index,
      );
      return;
    }

    const fileEntry = property.files[index];
    console.debug(
      '[MediaHandler] Updating property media URL, type:',
      fileEntry.type,
    );

    if (fileEntry.type === 'external') {
      fileEntry.external.url =
        mediaInfo.transformedPath || mediaInfo.originalUrl;
    } else if (fileEntry.type === 'file') {
      fileEntry.file.url = mediaInfo.transformedPath || mediaInfo.originalUrl;
    }

    console.debug(
      '[MediaHandler] Updated property media URL to:',
      mediaInfo.transformedPath,
    );
  }

  /**
   * Update block with processed media information
   */
  private updateBlockMedia(block: NotionBlock, mediaInfo: MediaInfo): void {
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
    block[blockType][urlType].url = mediaInfo.transformedPath;
    console.debug(
      '[MediaHandler] Updated block media URL to:',
      mediaInfo.transformedPath,
    );
  }

  private async cleanupRemovedReferences(): Promise<void> {
    console.debug('[MediaHandler] Starting cleanup of removed references');
    const manifestData = this.manifestManager.getManifest();

    // Find entries for references that no longer exist and clean them up
    for (const [refId, entry] of Object.entries(manifestData.mediaEntries)) {
      if (!this.processedReferences.has(refId)) {
        console.debug('[MediaHandler] Cleaning up removed reference:', refId);
        try {
          await this.strategy.cleanup(entry);
          this.manifestManager.removeEntry(refId);
          console.debug(
            '[MediaHandler] Successfully cleaned up reference:',
            refId,
          );
        } catch (error) {
          // Cleanup errors are always logged but don't stop processing
          console.debug(
            '[MediaHandler] Error during cleanup for reference:',
            refId,
            error,
          );
          console.warn(error);
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
        // For DB properties, include index to track each file separately
        return `${ref.parentId}_${ref.propertyName || 'unnamed'}_${index || 0}`;

      case 'page_property':
        // For page properties, don't need index (typically one file)
        return `${ref.parentId}_${ref.propertyName || 'unnamed'}`;

      default:
        return `unknown_${ref.id}`;
    }
  }

  // Get last edited time from the reference
  private getLastEditedTime(ref: TrackedBlockReferenceObject): string {
    if (ref.type === 'block') {
      return (ref.ref as NotionBlock).last_edited_time;
    }

    // For properties, just use the current time
    return new Date().toISOString();
  }
}
