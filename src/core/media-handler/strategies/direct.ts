import fetch from 'node-fetch';
import { TrackedBlockReferenceObject } from '../../../types/fetcher';
import {
  MediaInfo,
  MediaStrategyType,
  MediaManifestEntry,
} from '../../../types/manifest-manager';
import {
  MediaStrategy,
  MediaProcessingError,
  StrategyInput,
  StrategyOutput,
} from '../../../types/strategy';
import {
  DirectStrategyConfig,
  DirectStrategyBufferOptions,
  MediaReferenceType,
  CustomBufferHandler,
  NotionMediaBlockType,
} from '../../../types/configuration';
import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../../types/notion';
import {
  extractReferenceUrl,
  updateReferenceSourceUrl,
} from '../../../utils/media/referenceUtils';

// Default reference types to buffer if buffer is enabled as true
const DEFAULT_BUFFER_ENABLE_TYPES: MediaReferenceType[] = [
  'block',
  'database_property',
];

/**
 * DirectStrategy handles media references by maintaining the original URLs
 * and optionally buffering the media content in memory.
 */
export class DirectStrategy implements MediaStrategy {
  private readonly failForward: boolean;
  private readonly bufferEnabled: boolean;
  private readonly bufferOptions: DirectStrategyBufferOptions | null;
  private readonly bufferEnableFor: MediaReferenceType[];
  private readonly bufferIncludeBlockContentTypes?: NotionMediaBlockType[];

  constructor(private config: DirectStrategyConfig = {}) {
    console.debug('[DirectStrategy] Initializing with config:', config);

    this.failForward = config.failForward ?? true;
    this.bufferEnabled = !!config.buffer;

    if (this.bufferEnabled && typeof config.buffer === 'object') {
      this.bufferOptions = config.buffer;
      this.bufferEnableFor =
        config.buffer.enableFor ?? DEFAULT_BUFFER_ENABLE_TYPES;
      this.bufferIncludeBlockContentTypes =
        config.buffer.includeBlockContentTypes;
    } else if (this.bufferEnabled) {
      this.bufferOptions = {};
      this.bufferEnableFor = DEFAULT_BUFFER_ENABLE_TYPES;
      this.bufferIncludeBlockContentTypes = undefined;
    } else {
      this.bufferOptions = null;
      this.bufferEnableFor = [];
      this.bufferIncludeBlockContentTypes = undefined;
    }

    console.debug('[DirectStrategy] Configuration applied:', {
      failForward: this.failForward,
      bufferEnabled: this.bufferEnabled,
      bufferEnableFor: this.bufferEnableFor,
      bufferIncludeBlockContentTypes: this.bufferIncludeBlockContentTypes,
      bufferOptions: this.bufferOptions,
    });
  }

  async process(input: StrategyInput): Promise<StrategyOutput> {
    const { reference, index, refId } = input;

    const refType = reference.type as MediaReferenceType;
    if (!this.bufferEnableFor.includes(refType)) {
      console.debug(
        `[DirectStrategy] Skipping reference ${refId}: Type '${refType}' not enabled for buffering/processing in configuration.`,
      );
      // Skipped due to config, return isProcessed: false
      return {
        mediaInfo: null,
        needsManifestUpdate: false,
        isProcessed: false,
      };
    }

    let skipDueToBlockContentType = false;
    if (this.bufferEnabled && refType === 'block') {
      const block = reference.ref as NotionBlock;
      if (
        this.bufferIncludeBlockContentTypes &&
        'type' in block &&
        block.type
      ) {
        if (
          !this.bufferIncludeBlockContentTypes.includes(
            block.type as NotionMediaBlockType,
          )
        ) {
          console.debug(
            `[DirectStrategy] Skipping buffering for block ${refId}: Type ${block.type} not in includeBlockContentTypes.`,
          );
          // Mark for potential skip, but URL is still processed
          skipDueToBlockContentType = true;
        }
      }
    }

    console.debug(
      '[DirectStrategy] Processing reference ID:',
      refId,
      'Type:',
      refType,
    );

    try {
      const url = extractReferenceUrl(reference, index);
      if (!url) {
        console.debug('[DirectStrategy] No URL found for reference:', refId);
        // No URL found is treated as a processing issue, not a config skip
        return {
          mediaInfo: null,
          needsManifestUpdate: false,
          isProcessed: true,
        };
      }

      console.debug('[DirectStrategy] Extracted URL:', url);

      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };
      updateReferenceSourceUrl(reference, index, mediaInfo);

      if (this.bufferEnabled && !skipDueToBlockContentType) {
        console.debug(
          `[DirectStrategy] Attempting buffering for type: ${refType}`,
        );
        await this.handleBuffering(reference, index, url);
      } else if (skipDueToBlockContentType) {
        // Buffering skipped due to block content type filter (logged above)
      } else {
        console.debug(
          `[DirectStrategy] Buffering not enabled for type: ${refType}`,
        );
      }

      // Processed successfully (URL handled, buffering attempted/skipped as configured)
      return {
        mediaInfo: mediaInfo,
        needsManifestUpdate: false,
        isProcessed: true,
      };
    } catch (error) {
      console.error(
        `[DirectStrategy] Error processing reference ${refId}:`,
        error,
      );
      // Attempted processing but failed, potentially fail-forward
      if (!this.failForward) {
        throw new MediaProcessingError(
          `Failed to process media reference ${refId}`,
          refId,
          'process',
          error,
        );
      }
      // Failed forward: log error, return null mediaInfo, but mark as processed
      return {
        mediaInfo: null,
        needsManifestUpdate: false,
        isProcessed: true,
      };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    return mediaInfo.originalUrl;
  }

  // Use the parameter, e.g., in a debug log, to satisfy the linter
  async cleanup(entry: MediaManifestEntry): Promise<void> {
    console.debug(
      `[DirectStrategy] Cleanup called for entry (no action needed): ${entry?.mediaInfo?.originalUrl}`,
    );
    return Promise.resolve();
  }

  private async handleBuffering(
    reference: TrackedBlockReferenceObject,
    index: number | undefined,
    url: string,
  ): Promise<void> {
    if (!url) return;

    const refType = reference.type as MediaReferenceType;

    console.debug(
      `[DirectStrategy] Buffering content for reference ${reference.id} (type: ${refType}, index: ${index})`,
    );

    try {
      let buffer: Buffer;
      const customHandler: CustomBufferHandler | undefined =
        this.bufferOptions?.handlers?.[refType];

      if (customHandler) {
        console.debug(
          `[DirectStrategy] Using custom buffer handler for type: ${refType}`,
        );
        buffer = await customHandler(reference, index, url);
      } else {
        console.debug(
          `[DirectStrategy] Using default fetch handler for URL: ${url}`,
        );
        buffer = await this.defaultFetchHandler(url);
      }

      const maxSize = this.bufferOptions?.maxBufferSize ?? 0;
      if (maxSize > 0 && buffer.length > maxSize) {
        console.warn(
          `[DirectStrategy] Buffer size ${buffer.length} for ${reference.id} exceeds limit ${maxSize}. Buffer not attached.`,
        );
        return;
      }

      if (refType === 'block') {
        this.attachBufferToBlock(reference, buffer);
      } else if (
        refType === 'database_property' ||
        refType === 'page_property'
      ) {
        this.attachBufferToProperty(reference, index, buffer);
      }
    } catch (error) {
      console.error(
        `[DirectStrategy] Error during buffering for ${reference.id}:`,
        error,
      );
      if (!this.failForward) {
        throw new MediaProcessingError(
          `Failed to buffer media content for ${reference.id}`,
          reference.id,
          'buffer',
          error,
        );
      }
    }
  }

  private async defaultFetchHandler(url: string): Promise<Buffer> {
    console.debug('[DirectStrategy] Using default fetch handler for:', url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private attachBufferToBlock(
    reference: TrackedBlockReferenceObject,
    buffer: Buffer,
  ): void {
    try {
      const block = reference.ref as NotionBlock;
      // Check if the block type is one that supports the buffer property in our NotionBlock type definition
      if (
        'type' in block &&
        ['image', 'video', 'file', 'pdf'].includes(block.type)
      ) {
        (
          block as Extract<
            NotionBlock,
            { type: 'image' | 'video' | 'file' | 'pdf' }
          >
        ).buffer = buffer;
        console.debug(
          `[DirectStrategy] Attached ${buffer.length} byte buffer to block: ${reference.id}`,
        );
      } else {
        console.warn(
          `[DirectStrategy] Cannot attach buffer: Block type ${'type' in block ? block.type : 'unknown'} does not support buffer property.`,
        );
      }
    } catch (error) {
      console.error(
        `[DirectStrategy] Failed to attach buffer to block ${reference.id}`,
        error,
      );
    }
  }

  /** Attaches the buffer to the specific file entry within a property reference */
  private attachBufferToProperty(
    reference: TrackedBlockReferenceObject,
    index: number | undefined,
    buffer: Buffer,
  ): void {
    try {
      const property = reference.ref as
        | NotionDatabaseEntryProperty
        | NotionPageProperty;
      if (property.type !== 'files' || !property.files) {
        console.warn(
          `[DirectStrategy] Cannot attach buffer: Property ${reference.propertyName} is not a files type or has no files.`,
        );
        return;
      }

      const fileIndex = index ?? 0;
      if (!property.files[fileIndex]) {
        console.warn(
          `[DirectStrategy] Cannot attach buffer: Invalid file index ${fileIndex} for property ${reference.propertyName}.`,
        );
        return;
      }

      // Note: This adds a non-standard 'buffer' property to the Notion file entry.
      // Consumers (e.g., transformers) need to be aware of this.
      const fileEntry = property.files[fileIndex] as any; // Use any for simplicity
      fileEntry.buffer = buffer;

      console.debug(
        `[DirectStrategy] Attached ${buffer.length} byte buffer to property ${reference.propertyName}, index ${fileIndex}`,
      );
    } catch (error) {
      console.error(
        `[DirectStrategy] Failed to attach buffer to property ${reference.propertyName} index ${index}`,
        error,
      );
    }
  }
}
