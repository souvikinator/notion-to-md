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
import {
  MediaStrategy,
  MediaProcessingError,
  StrategyInput,
  StrategyOutput,
} from '../../../types/strategy';
import {
  extractReferenceUrl,
  updateReferenceSourceUrl,
} from '../../../utils/media/referenceUtils';

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

  async process(input: StrategyInput): Promise<StrategyOutput> {
    const {
      reference,
      index,
      refId,
      manifestManager,
      lastEditedTime,
      potentialFilename,
    } = input;

    console.debug(
      '[DownloadStrategy] Processing reference ID:',
      refId,
      'type:',
      reference.type,
    );

    // 1. Check manifest for existing entry
    const existingEntry = manifestManager.getEntry(refId);

    // 2. Check if unchanged and local file exists
    if (existingEntry && existingEntry.lastEdited === lastEditedTime) {
      console.debug(
        `[DownloadStrategy] Manifest entry exists and is unchanged for ${refId}`,
      );
      if (existingEntry.mediaInfo.localPath) {
        try {
          await fs.access(existingEntry.mediaInfo.localPath);
          console.debug(
            `[DownloadStrategy] Local file exists: ${existingEntry.mediaInfo.localPath}. Skipping download.`,
          );
          // File exists and is unchanged, apply transform to existing info
          const transformedPath = this.transform(existingEntry.mediaInfo);
          const mediaInfo: MediaInfo = {
            ...existingEntry.mediaInfo,
            transformedPath,
          };

          // Use utility function
          updateReferenceSourceUrl(reference, index, mediaInfo);

          return { mediaInfo: mediaInfo, needsManifestUpdate: false };
        } catch (error) {
          // Error accessing the local file (could be missing, permissions, etc.)
          console.debug(
            `[DownloadStrategy] Failed to access local file path for ${refId} (${existingEntry.mediaInfo.localPath}). Error: ${error instanceof Error ? error.message : error}. Proceeding to download.`,
          );
          // Let execution continue to the download logic below
        }
      } else {
        console.debug(
          `[DownloadStrategy] Manifest entry for ${refId} has no local path, proceeding to download.`,
        );
      }
    } else {
      console.debug(
        `[DownloadStrategy] No matching/unchanged manifest entry for ${refId}, proceeding to download.`,
      );
    }

    // --- Proceed with Download/Processing ---

    // Use utility function
    const url = extractReferenceUrl(reference, index);
    if (!url) {
      console.debug(
        '[DownloadStrategy] No media URL found in reference:',
        refId,
      );
      // Fail silently or throw based on config
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'No media URL found in reference',
          refId,
          'process',
          new Error('URL extraction failed'),
        );
      }
      console.error(
        `[DownloadStrategy] Failed to extract URL for ${refId}, skipping.`,
      );
      return { mediaInfo: null, needsManifestUpdate: false }; // Return null info
    }

    console.debug('[DownloadStrategy] Extracted media URL:', url);

    // Handle external URLs based on config
    if (this.config.preserveExternalUrls && isExternalUrl(url)) {
      console.debug('[DownloadStrategy] Preserving external URL:', url);
      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DIRECT, // Treat as DIRECT if preserved
        originalUrl: url,
        transformedPath: url, // Transform path is same as original
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };

      // Use utility function
      updateReferenceSourceUrl(reference, index, mediaInfo);

      return { mediaInfo: mediaInfo, needsManifestUpdate: false };
    }

    // --- Perform Download ---
    try {
      console.debug(
        `[DownloadStrategy] Attempting download for ${refId} from:`,
        url,
      );
      const localPath = await this.downloadFile(url, potentialFilename);

      console.debug(
        `[DownloadStrategy] File downloaded successfully for ${refId}. Local path:`,
        localPath,
      );

      // Prepare MediaInfo for the downloaded file
      const downloadedMediaInfo: Omit<MediaInfo, 'transformedPath'> = {
        // Omit transform initially
        type: MediaStrategyType.DOWNLOAD,
        originalUrl: url,
        localPath,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };

      // Apply transformation
      const transformedPath = this.transform(downloadedMediaInfo as MediaInfo); // Cast for transform call

      const finalMediaInfo: MediaInfo = {
        ...downloadedMediaInfo,
        transformedPath,
      };

      // Use utility function
      updateReferenceSourceUrl(reference, index, finalMediaInfo);

      console.debug('[DownloadStrategy] Media info created:', finalMediaInfo);
      // Return new info, manifest update IS needed
      return { mediaInfo: finalMediaInfo, needsManifestUpdate: true };
    } catch (error) {
      console.debug(
        `[DownloadStrategy] Error downloading/processing for ${refId}:`,
        error,
      );
      if (!this.config.failForward) {
        // Rethrow original error wrapped in MediaProcessingError
        throw new MediaProcessingError(
          `Failed to download media for ${refId}`,
          refId,
          'process',
          error,
        );
      }
      // Fail forward: Log error and return null mediaInfo
      console.error(
        `[DownloadStrategy] Failed to download media for ${refId}, skipping due to failForward=true. Error: ${error instanceof Error ? error.message : error}`,
      );
      return { mediaInfo: null, needsManifestUpdate: false };
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
}
