import fetch from 'node-fetch';
import { TrackedBlockReferenceObject } from '../../../types/fetcher';
import { MediaInfo, MediaStrategyType } from '../../../types/manifest-manager';
import {
  MediaStrategy,
  MediaProcessingError,
  StrategyInput,
  StrategyOutput,
} from '../../../types/strategy';
import {
  DirectStrategyConfig,
  DirectStrategyBufferOptions,
  DirectStrategyBufferReferenceType,
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

// Default reference types to buffer if buffer is enabled as `true`
const DEFAULT_BUFFER_ENABLE_TYPES: DirectStrategyBufferReferenceType[] = [
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
  private readonly bufferEnableFor: DirectStrategyBufferReferenceType[]; // Store enabled types
  private readonly bufferIncludeBlockContentTypes?: NotionMediaBlockType[];

  constructor(private config: DirectStrategyConfig = {}) {
    console.debug('[DirectStrategy] Initializing with config:', config);

    this.failForward = config.failForward ?? true;
    this.bufferEnabled = !!config.buffer;

    // Parse buffer options
    if (this.bufferEnabled && typeof config.buffer === 'object') {
      this.bufferOptions = config.buffer;
      this.bufferEnableFor =
        config.buffer.enableFor ?? DEFAULT_BUFFER_ENABLE_TYPES;
      this.bufferIncludeBlockContentTypes =
        config.buffer.includeBlockContentTypes;
    } else if (this.bufferEnabled) {
      // buffer === true
      this.bufferOptions = {}; // Use empty object if true, no specific options
      this.bufferEnableFor = DEFAULT_BUFFER_ENABLE_TYPES;
      this.bufferIncludeBlockContentTypes = undefined;
    } else {
      // buffer is false or undefined
      this.bufferOptions = null;
      this.bufferEnableFor = [];
      this.bufferIncludeBlockContentTypes = undefined;
    }

    console.debug('[DirectStrategy] Configuration applied:', {
      failForward: this.failForward,
      bufferEnabled: this.bufferEnabled,
      bufferEnableFor: this.bufferEnableFor,
      bufferIncludeBlockContentTypes: this.bufferIncludeBlockContentTypes,
      bufferOptions: this.bufferOptions, // Log the parsed options
    });
  }

  async process(input: StrategyInput): Promise<StrategyOutput> {
    const { reference, index, refId } = input;
    console.debug(
      '[DirectStrategy] Processing reference ID:',
      refId,
      'Type:',
      reference.type,
    );

    try {
      const url = extractReferenceUrl(reference, index);

      if (!url) {
        console.debug('[DirectStrategy] No URL found for reference:', refId);
        return { mediaInfo: null, needsManifestUpdate: false };
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

      // Check if buffering is globally enabled AND enabled for this reference type
      if (
        this.bufferEnabled &&
        this.bufferEnableFor.includes(
          reference.type as DirectStrategyBufferReferenceType,
        )
      ) {
        let skipBufferingForBlockType = false;
        if (reference.type === 'block') {
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
                `[DirectStrategy] Buffering skipped for block ${refId}: Type ${block.type} not in includeBlockContentTypes.`,
              );
              skipBufferingForBlockType = true;
            }
          }
        }

        if (!skipBufferingForBlockType) {
          console.debug(
            `[DirectStrategy] Buffering enabled for type: ${reference.type}`,
          );
          await this.handleBuffering(reference, index, url);
        } else {
          console.debug(
            `[DirectStrategy] Buffering skipped for type: ${reference.type}`,
          );
        }
      } else {
        console.debug(
          `[DirectStrategy] Buffering skipped for type: ${reference.type}`,
        );
      }

      return { mediaInfo: mediaInfo, needsManifestUpdate: false };
    } catch (error) {
      console.debug(
        '[DirectStrategy] Error processing reference:',
        refId,
        error,
      );
      const processingError = new MediaProcessingError(
        'Failed to process media reference',
        refId,
        'process',
        error,
      );

      if (!this.failForward) {
        throw processingError;
      }

      console.error(processingError);
      return { mediaInfo: null, needsManifestUpdate: false };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    // DirectStrategy simply returns the original URL
    return mediaInfo.originalUrl;
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for direct strategy
    console.debug('[DirectStrategy] Cleanup called, no action needed.');
    return Promise.resolve();
  }

  private async handleBuffering(
    reference: TrackedBlockReferenceObject,
    index: number | undefined,
    url: string,
  ): Promise<void> {
    if (!url) return;

    const refType = reference.type as DirectStrategyBufferReferenceType;

    console.debug(
      `[DirectStrategy] Buffering content for reference ${reference.id} (type: ${refType}, index: ${index})`,
    );

    try {
      let buffer: Buffer;
      // Check for custom handler for this specific reference type
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

      // Check buffer size limit
      const maxSize = this.bufferOptions?.maxBufferSize ?? 0;
      if (maxSize > 0 && buffer.length > maxSize) {
        console.warn(
          `[DirectStrategy] Buffer size ${buffer.length} for ${reference.id} exceeds limit ${maxSize}. Buffer not attached.`,
        );
        return;
      }

      // Attach buffer to the appropriate part of the reference object
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
      // Continue without buffering on error if failForward is true
      if (!this.failForward) {
        throw new MediaProcessingError(
          `Failed to buffer media content for ${reference.id}`,
          reference.id,
          'buffer',
          error,
        );
      }
      // Logged error above, process continues without buffer
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
        // Type assertion is safer now after the check
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

      // Attach buffer to the file entry object within the property
      // Note: This adds a non-standard 'buffer' property to the Notion file entry.
      // Consumers (e.g., transformers) need to be aware of this.
      const fileEntry = property.files[fileIndex] as any;
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
