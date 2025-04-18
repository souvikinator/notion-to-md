import fetch from 'node-fetch';
import { TrackedBlockReferenceObject } from '../../../types/fetcher';
import { MediaInfo, MediaStrategyType } from '../../../types/manifest-manager';
import { MediaStrategy, MediaProcessingError } from '../../../types/strategy';
import {
  DirectStrategyConfig,
  BufferOptions,
  DirectStrategyBufferSupportedBlockType,
} from '../../../types/configuration';

/**
 * DirectStrategy handles media references by maintaining the original URLs
 * and optionally buffering the media content in memory.
 */
export class DirectStrategy implements MediaStrategy {
  private readonly failForward: boolean;
  private readonly bufferEnabled: boolean;
  private readonly bufferOptions: BufferOptions | null;

  constructor(private config: DirectStrategyConfig = {}) {
    console.debug('[DirectStrategy] Initializing with config:', config);

    this.failForward = config.failForward ?? true;
    this.bufferEnabled = !!config.buffer;

    // Set buffer options if enabled
    if (this.bufferEnabled && typeof config.buffer === 'object') {
      this.bufferOptions = config.buffer;
    } else {
      this.bufferOptions = null;
    }

    console.debug('[DirectStrategy] Configuration applied:', {
      failForward: this.failForward,
      bufferEnabled: this.bufferEnabled,
      bufferOptions: this.bufferOptions,
    });
  }

  async process(
    reference: TrackedBlockReferenceObject,
    index?: number,
  ): Promise<MediaInfo> {
    const id = reference.id;
    console.debug('[DirectStrategy] Processing reference:', id);

    try {
      // Extract URL from the reference
      const url = this.extractUrl(reference, index);

      if (!url) {
        console.debug('[DirectStrategy] No URL found in reference:', id);
        return {
          type: MediaStrategyType.DIRECT,
          originalUrl: '',
          transformedPath: '',
          sourceType: reference.type,
        };
      }

      console.debug('[DirectStrategy] Extracted URL:', url);

      // Create basic media info
      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
        sourceType: reference.type,
      };

      // Handle buffering if enabled
      if (this.bufferEnabled) {
        await this.handleBuffering(reference, url);
      }

      return mediaInfo;
    } catch (error) {
      console.debug('[DirectStrategy] Error processing reference:', error);
      const processingError = new MediaProcessingError(
        'Failed to process media reference',
        id,
        'process',
        error,
      );

      if (!this.failForward) {
        throw processingError;
      }

      console.error(processingError);
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: '',
        transformedPath: '',
        sourceType: reference.type,
      };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    // DirectStrategy simply returns the original URL
    return mediaInfo.originalUrl;
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for direct strategy
    return Promise.resolve();
  }

  private extractUrl(
    reference: TrackedBlockReferenceObject,
    index?: number,
  ): string | null {
    try {
      switch (reference.type) {
        case 'block': {
          const block = reference.ref as any;
          if (!('type' in block) || !block.type) return null;

          if (!['image', 'video', 'file', 'pdf'].includes(block.type)) {
            return null;
          }

          const mediaBlock = block[block.type];
          if (!mediaBlock) return null;

          return mediaBlock.type === 'external'
            ? mediaBlock.external?.url
            : mediaBlock.file?.url;
        }
        case 'database_property':
        case 'page_property': {
          const property = reference.ref as any;
          if (property.type !== 'files' || !property.files) return null;

          const fileIdx = index || 0;
          if (!property.files[fileIdx]) return null;

          const fileEntry = property.files[fileIdx];
          return fileEntry.type === 'external'
            ? fileEntry.external?.url
            : fileEntry.file?.url;
        }
        default:
          return null;
      }
    } catch (error) {
      console.debug('[DirectStrategy] Error extracting URL:', error);
      return null;
    }
  }

  private async handleBuffering(
    reference: TrackedBlockReferenceObject,
    url: string,
  ): Promise<void> {
    if (!url) return;

    try {
      const blockType = this.getBlockType(reference);

      // Check if this block type should be buffered
      if (!this.shouldBufferBlockType(blockType)) {
        console.debug(
          `[DirectStrategy] Skipping buffering for block type: ${blockType}`,
        );
        return;
      }

      console.debug(
        `[DirectStrategy] Buffering content for ${blockType} block`,
      );

      // Use custom handler if available, otherwise use default
      let buffer: Buffer;
      if (
        this.bufferOptions?.blockHandlers &&
        blockType &&
        this.bufferOptions.blockHandlers[
          blockType as DirectStrategyBufferSupportedBlockType
        ]
      ) {
        const handler =
          this.bufferOptions.blockHandlers[
            blockType as DirectStrategyBufferSupportedBlockType
          ];
        buffer = await handler(reference.ref, url);
      } else {
        buffer = await this.defaultFetchHandler(url);
      }

      // Check buffer size limit if configured
      const maxSize = this.bufferOptions?.maxBufferSize || 0;
      if (maxSize > 0 && buffer.length > maxSize) {
        console.debug(
          `[DirectStrategy] Buffer size ${buffer.length} exceeds limit ${maxSize}`,
        );
        return;
      }

      // Attach buffer to the block
      this.attachBufferToBlock(reference, buffer);
    } catch (error) {
      console.debug('[DirectStrategy] Error during buffering:', error);
      // Continue without buffering on error when failForward is true
      if (!this.failForward) {
        throw new MediaProcessingError(
          'Failed to buffer media content',
          reference.id,
          'buffer',
          error,
        );
      }
    }
  }

  private getBlockType(reference: TrackedBlockReferenceObject): string | null {
    if (reference.type === 'block') {
      const block = reference.ref as any;
      return block.type;
    }
    return null;
  }

  private shouldBufferBlockType(blockType: string | null): boolean {
    if (!blockType) return false;

    // If no specific includeBlocks, buffer all supported types
    if (!this.bufferOptions?.includeBlocks) {
      return ['pdf', 'file', 'image', 'video'].includes(blockType);
    }

    // Otherwise, only buffer specified types
    return this.bufferOptions.includeBlocks.includes(
      blockType as DirectStrategyBufferSupportedBlockType,
    );
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
    // Attach buffer directly to the block
    (reference.ref as any).buffer = buffer;
    console.debug(
      `[DirectStrategy] Attached ${buffer.length} byte buffer to block: ${reference.id}`,
    );
  }
}
