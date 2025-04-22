import { UploadStrategyConfig } from '../../../types/configuration';
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
import { isExternalUrl } from '../../../utils/notion';
import {
  extractReferenceUrl,
  updateReferenceSourceUrl,
} from '../../../utils/media/referenceUtils';

export class UploadStrategy implements MediaStrategy {
  constructor(private config: UploadStrategyConfig) {
    console.debug(
      '[UploadStrategy] Initializing with config:',
      JSON.stringify(config),
    );

    if (!this.config.uploadHandler) {
      throw new MediaProcessingError(
        'Configuration Error',
        'constructor',
        'initialization',
        new Error('uploadHandler is required for UploadStrategy'),
      );
    }

    this.config.failForward = config.failForward ?? true;
    console.debug(
      '[UploadStrategy] Initialized successfully. failForward:',
      this.config.failForward,
    );
  }

  async process(input: StrategyInput): Promise<StrategyOutput> {
    const { reference, index, refId, manifestManager, lastEditedTime } = input;

    console.debug(
      '[UploadStrategy] Processing reference ID:',
      refId,
      'type:',
      reference.type,
    );

    const existingEntry = manifestManager.getEntry(refId);

    if (existingEntry && existingEntry.lastEdited === lastEditedTime) {
      console.debug(
        `[UploadStrategy] Manifest entry exists and is unchanged for ${refId}`,
      );
      if (existingEntry.mediaInfo.uploadedUrl) {
        console.debug(
          `[UploadStrategy] Using existing uploaded URL: ${existingEntry.mediaInfo.uploadedUrl}. Skipping upload.`,
        );
        const transformedPath = this.transform(existingEntry.mediaInfo);
        const mediaInfo: MediaInfo = {
          ...existingEntry.mediaInfo,
          transformedPath,
        };

        updateReferenceSourceUrl(reference, index, mediaInfo);

        return { mediaInfo: mediaInfo, needsManifestUpdate: false };
      } else {
        console.debug(
          `[UploadStrategy] Manifest entry for ${refId} has no uploadedUrl, proceeding to upload.`,
        );
      }
    } else {
      console.debug(
        `[UploadStrategy] No matching/unchanged manifest entry for ${refId}, proceeding to upload.`,
      );
    }

    console.debug(
      '[UploadStrategy] Extracting original URL from reference:',
      refId,
    );
    const url = extractReferenceUrl(reference, index);

    if (!url) {
      console.debug('[UploadStrategy] No URL found in reference:', refId);
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'No URL found in reference',
          refId,
          'process',
          new Error('URL extraction failed'),
        );
      }
      console.error(
        `[UploadStrategy] Failed to extract URL for ${refId}, skipping.`,
      );
      return { mediaInfo: null, needsManifestUpdate: false };
    }

    console.debug('[UploadStrategy] Extracted original URL:', url);

    if (this.config.preserveExternalUrls && isExternalUrl(url)) {
      console.debug('[UploadStrategy] Preserving external URL:', url);
      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };

      updateReferenceSourceUrl(reference, index, mediaInfo);

      return { mediaInfo: mediaInfo, needsManifestUpdate: false };
    }

    try {
      console.debug(
        `[UploadStrategy] Calling upload handler for ${refId}, URL:`,
        url,
      );
      const uploadedUrl = await this.config.uploadHandler(url, refId);

      if (!uploadedUrl) {
        console.warn(
          `[UploadStrategy] Upload handler returned invalid/empty URL for ${refId}.`,
        );
        if (!this.config.failForward) {
          throw new MediaProcessingError(
            'Upload handler returned invalid URL',
            refId,
            'process',
            new Error('Upload failed or returned empty URL'),
          );
        }
        return { mediaInfo: null, needsManifestUpdate: false };
      }

      console.debug(
        `[UploadStrategy] Upload successful for ${refId}. Uploaded URL:`,
        uploadedUrl,
      );

      const uploadedMediaInfo: Omit<MediaInfo, 'transformedPath'> = {
        type: MediaStrategyType.UPLOAD,
        originalUrl: url,
        uploadedUrl,
        sourceType: reference.type,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };

      const transformedPath = this.transform(uploadedMediaInfo as MediaInfo);

      const finalMediaInfo: MediaInfo = {
        ...uploadedMediaInfo,
        transformedPath,
      };

      updateReferenceSourceUrl(reference, index, finalMediaInfo);

      console.debug('[UploadStrategy] Media info created:', finalMediaInfo);
      return { mediaInfo: finalMediaInfo, needsManifestUpdate: true };
    } catch (error) {
      console.debug(
        `[UploadStrategy] Error during upload for ${refId}:`,
        error,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          `Failed to upload media for ${refId}`,
          refId,
          'process',
          error,
        );
      }
      console.error(
        `[UploadStrategy] Failed to upload media for ${refId}, skipping due to failForward=true. Error: ${error instanceof Error ? error.message : error}`,
      );
      return { mediaInfo: null, needsManifestUpdate: false };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    if (mediaInfo.type === MediaStrategyType.DIRECT) {
      return mediaInfo.originalUrl;
    }

    if (!mediaInfo.uploadedUrl) {
      const error = new MediaProcessingError(
        'Missing uploaded URL for uploaded file',
        'unknown',
        'transform',
        new Error('Uploaded URL required for transformation'),
      );

      if (!this.config.failForward) {
        throw error;
      }

      console.error(error);
      return mediaInfo.originalUrl;
    }

    try {
      if (this.config.transformPath) {
        return this.config.transformPath(mediaInfo.uploadedUrl);
      }

      return mediaInfo.uploadedUrl;
    } catch (error) {
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
      return mediaInfo.uploadedUrl || mediaInfo.originalUrl;
    }
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    if (
      entry.mediaInfo.type === MediaStrategyType.UPLOAD &&
      this.config.cleanupHandler &&
      entry.mediaInfo.uploadedUrl
    ) {
      try {
        await this.config.cleanupHandler(entry);
      } catch (error) {
        const processingError = new MediaProcessingError(
          'Failed to cleanup uploaded file',
          entry.mediaInfo.uploadedUrl,
          'cleanup',
          error,
        );
        console.error(processingError);
      }
    }
  }
}
