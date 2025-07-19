import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { isNotionS3Url } from '../../../utils/notion';
import {
  DownloadStrategyConfig,
  MediaReferenceType,
} from '../../../types/configuration';
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

// Default types for DownloadStrategy if not specified
const DEFAULT_DOWNLOAD_ENABLE_TYPES: MediaReferenceType[] = [
  'block',
  'database_property',
  'page_property',
];

export class DownloadStrategy implements MediaStrategy {
  private readonly enabledTypes: MediaReferenceType[];
  constructor(private config: DownloadStrategyConfig) {
    console.debug('[DownloadStrategy] Initializing with config:', config);
    if (!config.outputDir) {
      throw new MediaProcessingError(
        'Configuration Error',
        'constructor',
        'initialization',
        new Error('outputDir is required for DownloadStrategy'),
      );
    }
    this.config.failForward = config.failForward ?? true;
    this.enabledTypes = config.enableFor ?? DEFAULT_DOWNLOAD_ENABLE_TYPES;
    console.debug('[DownloadStrategy] Initialized successfully:', {
      failForward: this.config.failForward,
      enabledTypes: this.enabledTypes,
    });
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

    const refType = reference.type as MediaReferenceType;
    if (!this.enabledTypes.includes(refType)) {
      console.debug(
        `[DownloadStrategy] Skipping reference ${refId}: Type '${refType}' not enabled.`,
      );
      // Skipped due to config
      return {
        mediaInfo: null,
        needsManifestUpdate: false,
        isProcessed: false,
      };
    }

    console.debug(
      '[DownloadStrategy] Processing reference ID:',
      refId,
      'type:',
      refType,
    );

    const url = extractReferenceUrl(reference, index);
    if (!url) {
      console.error(
        `[DownloadStrategy] Failed to extract URL for ${refId}, skipping.`,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'No media URL found in reference',
          refId,
          'process',
          new Error('URL extraction failed'),
        );
      }
      // Failed forward during URL extraction
      return { mediaInfo: null, needsManifestUpdate: false, isProcessed: true };
    }

    if (this.config.preserveExternalUrls && !isNotionS3Url(url)) {
      console.debug(
        `[DownloadStrategy] Preserving external URL for ${refId}: ${url}`,
      );
      // Skipped due to config. We don't update the source URL, just return.
      return {
        mediaInfo: null,
        needsManifestUpdate: false,
        isProcessed: false,
      };
    }

    const existingEntry = manifestManager.getEntry(refId);
    if (existingEntry && existingEntry.lastEdited === lastEditedTime) {
      if (existingEntry.mediaInfo.localPath) {
        try {
          await fs.access(existingEntry.mediaInfo.localPath);
          console.debug(
            `[DownloadStrategy] Using existing unchanged local file for ${refId}.`,
          );
          const transformedPath = this.transform(existingEntry.mediaInfo);
          const mediaInfo: MediaInfo = {
            ...existingEntry.mediaInfo,
            transformedPath,
          };
          updateReferenceSourceUrl(reference, index, mediaInfo);
          // Processed successfully using cache/local file
          return {
            mediaInfo: mediaInfo,
            needsManifestUpdate: false,
            isProcessed: true,
          };
        } catch (error) {
          // Error accessing the local file (could be missing, permissions, etc.)
          console.debug(
            `[DownloadStrategy] Failed to access local file path for ${refId} (${existingEntry.mediaInfo.localPath}). Error: ${error instanceof Error ? error.message : error}. Proceeding to download.`,
          );
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

    try {
      if (!potentialFilename) {
        throw new Error('Filename generation failed.');
      }
      console.debug(
        `[DownloadStrategy] Attempting download for ${refId} from:`,
        url,
      );
      const localPath = await this.downloadFile(url, potentialFilename);
      console.debug(
        `[DownloadStrategy] File downloaded for ${refId} to:`,
        localPath,
      );

      const downloadedMediaInfo: Omit<MediaInfo, 'transformedPath'> = {
        type: MediaStrategyType.DOWNLOAD,
        originalUrl: url,
        localPath,
        sourceType: refType,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };
      const transformedPath = this.transform(downloadedMediaInfo as MediaInfo);
      const finalMediaInfo: MediaInfo = {
        ...downloadedMediaInfo,
        transformedPath,
      };

      updateReferenceSourceUrl(reference, index, finalMediaInfo);
      // Processed successfully by downloading
      return {
        mediaInfo: finalMediaInfo,
        needsManifestUpdate: true,
        isProcessed: true,
      };
    } catch (error) {
      console.error(
        `[DownloadStrategy] Error downloading/processing for ${refId}:`,
        error,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          `Failed to download media for ${refId}`,
          refId,
          'process',
          error,
        );
      }
      // Failed forward during download/processing
      return { mediaInfo: null, needsManifestUpdate: false, isProcessed: true };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    if (mediaInfo.type === MediaStrategyType.DIRECT) {
      return mediaInfo.originalUrl;
    }
    if (!mediaInfo.localPath) {
      // This case should ideally not happen if process logic is correct, but handle defensively
      console.error(
        `[DownloadStrategy] Transform error: Missing local path for media: ${mediaInfo.originalUrl}`,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'Missing local path for downloaded file',
          mediaInfo.originalUrl,
          'transform',
          new Error('Local path required'),
        );
      }
      return mediaInfo.originalUrl; // Fallback
    }

    try {
      return this.config.transformPath
        ? this.config.transformPath(mediaInfo.localPath)
        : mediaInfo.localPath;
    } catch (error) {
      console.error(
        `[DownloadStrategy] Error during path transformation for ${mediaInfo.localPath}:`,
        error,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'Failed to transform path',
          mediaInfo.localPath,
          'transform',
          error,
        );
      }
      return mediaInfo.originalUrl; // Fallback
    }
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    if (
      entry.mediaInfo.type === MediaStrategyType.DOWNLOAD &&
      entry.mediaInfo.localPath
    ) {
      try {
        console.debug(
          `[DownloadStrategy] Deleting file: ${entry.mediaInfo.localPath}`,
        );
        await fs.unlink(entry.mediaInfo.localPath);
        console.debug('[DownloadStrategy] File deleted successfully');
      } catch (error) {
        // Log error but don't throw, cleanup should be best-effort
        console.error(
          `[DownloadStrategy] Failed to cleanup file ${entry.mediaInfo.localPath}:`,
          error,
        );
      }
    } else {
      console.debug('[DownloadStrategy] Nothing to cleanup for entry');
    }
  }

  private async downloadFile(url: string, filename: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Download failed (${response.status}): ${response.statusText} for URL: ${url}`,
      );
    }

    await fs.mkdir(this.config.outputDir, { recursive: true });
    const localPath = path.join(this.config.outputDir, filename);
    const buffer = await response.buffer();
    await fs.writeFile(localPath, buffer);
    return localPath;
  }
}
