import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { isExternalUrl } from '../../../utils/notion';
import { DownloadStrategyConfig } from '../../../types/configuration';
import {
  MediaInfo,
  MediaStrategyType,
  MediaManifestEntry,
} from '../../../types/manifest-manager';
import { MediaStrategy, MediaProcessingError } from '../../../types/strategy';
import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../../types/notion';
import { TrackedBlockReferenceObject } from '../../../types/fetcher';
import { generateFilename } from '../../../utils/media';

export class DownloadStrategy implements MediaStrategy {
  constructor(private config: DownloadStrategyConfig) {
    console.debug('[DownloadStrategy] Initializing with config:', config);
    // Constructor validation always throws since it's a configuration error
    if (!config.outputDir) {
      console.debug(
        '[DownloadStrategy] Initialization failed: missing outputDir',
      );
      throw new MediaProcessingError(
        'Configuration Error',
        'constructor',
        'initialization',
        new Error('outputDir is required for DownloadStrategy'),
      );
    }

    // Set default for failForward if not provided
    this.config.failForward = config.failForward ?? true;
    console.debug(
      '[DownloadStrategy] Initialized successfully. failForward:',
      this.config.failForward,
    );
  }

  async process(
    reference: TrackedBlockReferenceObject,
    index?: number,
  ): Promise<MediaInfo> {
    const id = reference.id;
    console.debug(
      '[DownloadStrategy] Processing reference:',
      id,
      'type:',
      reference.type,
    );

    console.debug(
      '[DownloadStrategy] Extracting media URL from reference:',
      id,
    );
    const url = this.extractReferenceUrl(reference, index);
    if (!url) {
      console.debug('[DownloadStrategy] No media URL found in reference:', id);
      const error = new MediaProcessingError(
        'No media URL found in reference',
        id,
        'process',
        new Error('URL extraction failed'),
      );

      if (!this.config.failForward) {
        throw error;
      }

      console.error(error);
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: '',
        transformedPath: '',
        sourceType: reference.type,
      };
    }

    console.debug('[DownloadStrategy] Extracted media URL:', url);

    // Handle external URLs - this is always allowed regardless of failForward
    if (this.config.preserveExternalUrls && isExternalUrl(url)) {
      console.debug('[DownloadStrategy] Preserving external URL:', url);
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex:
          reference.type === 'database_property' ? index : undefined,
      };
    }

    try {
      console.debug('[DownloadStrategy] Downloading file from:', url);

      // Generate filename based on reference type
      const filename = generateFilename(reference, index);

      const localPath = await this.downloadFile(url, filename);

      console.debug(
        '[DownloadStrategy] File downloaded successfully. Local path:',
        localPath,
      );

      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DOWNLOAD,
        originalUrl: url,
        localPath,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex:
          reference.type === 'database_property' ? index : undefined,
        transformedPath: this.transform({
          type: MediaStrategyType.DOWNLOAD,
          originalUrl: url,
          localPath,
          sourceType: reference.type,
        }),
      };

      console.debug('[DownloadStrategy] Media info created:', mediaInfo);
      return mediaInfo;
    } catch (error) {
      console.debug('[DownloadStrategy] Error processing reference:', error);
      const processingError = new MediaProcessingError(
        'Failed to download media',
        id,
        'process',
        error,
      );

      if (!this.config.failForward) {
        throw processingError;
      }

      console.error(processingError);
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex:
          reference.type === 'database_property' ? index : undefined,
      };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    if (mediaInfo.type === MediaStrategyType.DIRECT) {
      console.debug(
        '[DownloadStrategy] Direct media type, returning original URL',
      );
      return mediaInfo.originalUrl;
    }

    if (!mediaInfo.localPath) {
      console.debug('[DownloadStrategy] Missing local path in media info');
      const error = new MediaProcessingError(
        'Missing local path for downloaded file',
        'unknown',
        'transform',
        new Error('Local path required for transformation'),
      );

      if (!this.config.failForward) {
        throw error;
      }

      console.error(error);
      return mediaInfo.originalUrl;
    }

    try {
      if (this.config.transformPath) {
        console.debug('[DownloadStrategy] Applying custom path transformation');
        return this.config.transformPath(mediaInfo.localPath);
      }

      console.debug('[DownloadStrategy] Using default path');
      return mediaInfo.localPath;
    } catch (error) {
      console.debug(
        '[DownloadStrategy] Error during path transformation:',
        error,
      );
      const processingError = new MediaProcessingError(
        'Failed to transform path',
        'unknown',
        'transform',
        error,
      );

      if (!this.config.failForward) {
        throw processingError;
      }

      console.error(processingError);
      return mediaInfo.originalUrl;
    }
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    console.debug(
      '[DownloadStrategy] Starting cleanup for media at: ',
      entry.mediaInfo.localPath,
    );
    // Cleanup always fails forward regardless of config
    // This prevents cleanup errors from breaking the entire process
    if (
      entry.mediaInfo.type === MediaStrategyType.DOWNLOAD &&
      entry.mediaInfo.localPath
    ) {
      try {
        console.debug(
          '[DownloadStrategy] Deleting file:',
          entry.mediaInfo.localPath,
        );
        await fs.unlink(entry.mediaInfo.localPath);
        console.debug('[DownloadStrategy] File deleted successfully');
      } catch (error) {
        console.debug('[DownloadStrategy] Error during cleanup:', error);
        const processingError = new MediaProcessingError(
          'Failed to cleanup file',
          entry.mediaInfo.localPath,
          'cleanup',
          error,
        );
        console.error(processingError);
      }
    } else {
      console.debug('[DownloadStrategy] Nothing to cleanup for entry');
    }
  }

  private async downloadFile(url: string, filename: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      console.debug(
        '[DownloadStrategy] Download failed with status:',
        response.status,
      );
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    await fs.mkdir(this.config.outputDir, { recursive: true });
    console.debug(
      '[DownloadStrategy] Created output directory:',
      this.config.outputDir,
    );

    const localPath = path.join(this.config.outputDir, filename);
    console.debug('[DownloadStrategy] Generated local path:', localPath);

    const buffer = await response.buffer();
    await fs.writeFile(localPath, buffer);
    console.debug('[DownloadStrategy] File written successfully');

    return localPath;
  }

  private extractReferenceUrl(
    reference: TrackedBlockReferenceObject,
    index: number = 0,
  ): string | null {
    try {
      switch (reference.type) {
        case 'block':
          return this.extractBlockUrl(reference.ref as NotionBlock);

        case 'database_property':
          return this.extractDatabasePropertyUrl(
            reference.ref as NotionDatabaseEntryProperty,
            index,
          );

        case 'page_property':
          return this.extractPagePropertyUrl(
            reference.ref as NotionPageProperty,
          );

        default:
          return null;
      }
    } catch (error) {
      console.debug(
        '[DownloadStrategy] Error extracting reference URL:',
        error,
      );
      return null;
    }
  }

  private extractBlockUrl(block: NotionBlock): string | null {
    try {
      if (!block || !('type' in block)) {
        console.debug('[DownloadStrategy] Invalid block structure');
        return null;
      }

      if (!['image', 'video', 'file', 'pdf'].includes(block.type)) {
        console.debug('[DownloadStrategy] Unsupported block type:', block.type);
        return null;
      }

      // @ts-ignore
      const mediaBlock = block[block.type];

      if (!mediaBlock) {
        console.debug('[DownloadStrategy] No media block found');
        return null;
      }

      const url =
        mediaBlock.type === 'external'
          ? mediaBlock.external?.url
          : mediaBlock.file?.url;

      return url;
    } catch (error) {
      console.debug('[DownloadStrategy] Error extracting block URL:', error);
      return null;
    }
  }

  private extractDatabasePropertyUrl(
    property: NotionDatabaseEntryProperty,
    index: number,
  ): string | null {
    if (
      property.type !== 'files' ||
      !property.files ||
      !property.files[index]
    ) {
      return null;
    }

    const fileEntry = property.files[index];
    if (fileEntry.type === 'external') {
      return fileEntry.external?.url || null;
    } else {
      // Using optional chaining to handle potential undefined
      return (fileEntry as any).file?.url || null;
    }
  }

  private extractPagePropertyUrl(property: NotionPageProperty): string | null {
    if (property.type !== 'files' || !property.files || !property.files[0]) {
      return null;
    }

    const fileEntry = property.files[0];
    if (fileEntry.type === 'external') {
      return fileEntry.external?.url || null;
    } else {
      // Using optional chaining and typecasting to handle potential undefined
      return (fileEntry as any).file?.url || null;
    }
  }
}
