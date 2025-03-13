import {
  MediaStrategy,
  MediaInfo,
  MediaStrategyType,
  MediaManifestEntry,
  MediaProcessingError,
  DownloadStrategyConfig,
  ListBlockChildrenResponseResult,
} from '../../../types';
import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import mime from 'mime/lite';
import { isExternalUrl } from '../../../utils/url';

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

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    console.debug('[DownloadStrategy] Processing block:', block.id);
    console.debug(
      '[DownloadStrategy] Extracting media URL from block:',
      block.id,
    );
    const url = this.extractMediaUrl(block);
    if (!url) {
      console.debug(
        '[DownloadStrategy] No media URL found in block:',
        block.id,
      );
      const error = new MediaProcessingError(
        'No media URL found in block',
        block.id,
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
      };
    }

    try {
      console.debug('[DownloadStrategy] Downloading file from:', url);
      const { localPath, mimeType } = await this.downloadFile(url, block.id);
      console.debug(
        '[DownloadStrategy] File downloaded successfully. Local path:',
        localPath,
        'MIME type:',
        mimeType,
      );

      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DOWNLOAD,
        originalUrl: url,
        localPath,
        mimeType,
        transformedPath: this.transform({
          type: MediaStrategyType.DOWNLOAD,
          originalUrl: url,
          localPath,
          mimeType,
        }),
      };

      console.debug('[DownloadStrategy] Media info created:', mediaInfo);
      return mediaInfo;
    } catch (error) {
      console.debug('[DownloadStrategy] Error processing block:', error);
      const processingError = new MediaProcessingError(
        'Failed to download media',
        block.id,
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
      let transformedPath: string;
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
      // @ts-ignore
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
      console.debug(
        '[DownloadStrategy] Nothing to cleanup for entry:',
        // @ts-ignore
        entry.blockId,
      );
    }
  }

  private async downloadFile(
    url: string,
    blockId: string,
  ): Promise<{ localPath: string; mimeType: string }> {
    const response = await fetch(url);
    if (!response.ok) {
      console.debug(
        '[DownloadStrategy] Download failed with status:',
        response.status,
      );
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Get the content type and clean it up
    const contentType = response.headers.get('content-type') || '';
    const mimeType = contentType.split(';')[0].trim();
    console.debug('[DownloadStrategy] Detected MIME type:', mimeType);

    // Try to determine extension using multiple methods
    let extension = this.determineFileExtension(mimeType);
    console.debug('[DownloadStrategy] Determined extension:', extension);

    await fs.mkdir(this.config.outputDir, { recursive: true });
    console.debug(
      '[DownloadStrategy] Created output directory:',
      this.config.outputDir,
    );

    const filename = `${blockId}.${extension}`;
    const localPath = path.join(this.config.outputDir, filename);
    console.debug('[DownloadStrategy] Generated local path:', localPath);

    const buffer = await response.buffer();
    await fs.writeFile(localPath, buffer);
    console.debug('[DownloadStrategy] File written successfully');

    return { localPath, mimeType };
  }

  private extractMediaUrl(
    block: ListBlockChildrenResponseResult,
  ): string | null {
    try {
      if (!block || !('type' in block)) {
        console.debug('[DownloadStrategy] Invalid block structure');
        return null;
      }

      // @ts-ignore
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
      console.debug('[DownloadStrategy] Error extracting media URL:', error);
      return null;
    }
  }

  /**
   * Determines file extension using multiple fallback methods:
   * 1. Standard MIME package detection
   * 2. Extraction from application/[ext] format
   * 3. Default .bin fallback
   */
  private determineFileExtension(mimeType: string): string {
    // First try: Use standard mime package detection
    const standardExtension = mime.getExtension(mimeType);
    if (standardExtension) {
      console.debug(
        '[DownloadStrategy] Found extension via mime package:',
        standardExtension,
      );
      return standardExtension;
    }

    // Second try: Extract from application/[extension] format
    if (mimeType.startsWith('application/')) {
      const parts = mimeType.split('/');
      if (parts.length === 2) {
        // Clean up the extension by removing any parameters
        // e.g., application/x-custom+xml -> x-custom
        const rawExt = parts[1].split('+')[0];

        // Remove x- prefix if present (common in MIME types)
        const cleanExt = rawExt.replace(/^x-/, '');

        // Only use if the extension looks valid (contains valid characters)
        if (/^[a-zA-Z0-9-]+$/.test(cleanExt)) {
          console.debug(
            '[DownloadStrategy] Extracted extension from MIME type:',
            cleanExt,
          );
          return cleanExt;
        }
      }
    }

    // Fallback: Use .bin for unknown types
    console.debug('[DownloadStrategy] Using fallback .bin extension');
    return 'bin';
  }
}
