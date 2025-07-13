import {
  UploadStrategyConfig,
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
import { isNotionS3Url } from '../../../utils/notion';
import {
  extractReferenceUrl,
  updateReferenceSourceUrl,
} from '../../../utils/media/referenceUtils';

const DEFAULT_UPLOAD_ENABLE_TYPES: MediaReferenceType[] = [
  'block',
  'database_property',
  'page_property',
];

export class UploadStrategy implements MediaStrategy {
  private readonly enabledTypes: MediaReferenceType[];
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
    this.enabledTypes = config.enableFor ?? DEFAULT_UPLOAD_ENABLE_TYPES;

    console.debug('[UploadStrategy] Initialized successfully:', {
      failForward: this.config.failForward,
      enabledTypes: this.enabledTypes,
    });
  }

  async process(input: StrategyInput): Promise<StrategyOutput> {
    const { reference, index, refId, manifestManager, lastEditedTime } = input;

    const refType = reference.type as MediaReferenceType;
    if (!this.enabledTypes.includes(refType)) {
      console.debug(
        `[UploadStrategy] Skipping reference ${refId}: Type '${refType}' not enabled.`,
      );
      return {
        mediaInfo: null,
        needsManifestUpdate: false,
        isProcessed: false,
      };
    }

    console.debug(
      '[UploadStrategy] Processing reference ID:',
      refId,
      'type:',
      refType,
    );

    const url = extractReferenceUrl(reference, index);
    if (!url) {
      console.error(
        `[UploadStrategy] Failed to extract URL for ${refId}, skipping.`,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'No media URL found in reference',
          refId,
          'process',
          new Error('URL extraction failed'),
        );
      }
      return { mediaInfo: null, needsManifestUpdate: false, isProcessed: true };
    }

    if (this.config.preserveExternalUrls && !isNotionS3Url(url)) {
      console.debug(
        `[UploadStrategy] Preserving external URL for ${refId}: ${url}`,
      );
      return {
        mediaInfo: null,
        needsManifestUpdate: false,
        isProcessed: false,
      };
    }

    const existingEntry = manifestManager.getEntry(refId);
    if (existingEntry && existingEntry.lastEdited === lastEditedTime) {
      if (existingEntry.mediaInfo.uploadedUrl) {
        console.debug(
          `[UploadStrategy] Using existing unchanged uploaded URL for ${refId}.`,
        );
        const transformedPath = this.transform(existingEntry.mediaInfo);
        const mediaInfo: MediaInfo = {
          ...existingEntry.mediaInfo,
          transformedPath,
        };
        updateReferenceSourceUrl(reference, index, mediaInfo);
        return {
          mediaInfo: mediaInfo,
          needsManifestUpdate: false,
          isProcessed: true,
        };
      } else {
        console.debug(
          `[UploadStrategy] Manifest entry for ${refId} exists but lacks uploadedUrl, proceeding to upload.`,
        );
      }
    } else {
      console.debug(
        `[UploadStrategy] No matching/unchanged manifest entry for ${refId}, proceeding to upload.`,
      );
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
        return {
          mediaInfo: null,
          needsManifestUpdate: false,
          isProcessed: true,
        };
      }

      console.debug(
        `[UploadStrategy] Upload successful for ${refId}. Uploaded URL:`,
        uploadedUrl,
      );
      const uploadedMediaInfo: Omit<MediaInfo, 'transformedPath'> = {
        type: MediaStrategyType.UPLOAD,
        originalUrl: url,
        uploadedUrl,
        sourceType: refType,
        propertyName: reference.propertyName,
        propertyIndex: index,
      };
      const transformedPath = this.transform(uploadedMediaInfo as MediaInfo);
      const finalMediaInfo: MediaInfo = {
        ...uploadedMediaInfo,
        transformedPath,
      };

      updateReferenceSourceUrl(reference, index, finalMediaInfo);
      return {
        mediaInfo: finalMediaInfo,
        needsManifestUpdate: true,
        isProcessed: true,
      };
    } catch (error) {
      console.error(
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
      return { mediaInfo: null, needsManifestUpdate: false, isProcessed: true };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    if (mediaInfo.type === MediaStrategyType.DIRECT) {
      return mediaInfo.originalUrl;
    }
    if (!mediaInfo.uploadedUrl) {
      console.error(
        `[UploadStrategy] Transform error: Missing uploadedUrl for media: ${mediaInfo.originalUrl}`,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'Missing uploaded URL for uploaded file',
          mediaInfo.originalUrl,
          'transform',
          new Error('uploadedUrl required'),
        );
      }
      return mediaInfo.originalUrl; // Fallback
    }

    try {
      // Apply transformPath function if provided, otherwise return the uploadedUrl directly
      return this.config.transformPath
        ? this.config.transformPath(mediaInfo.uploadedUrl)
        : mediaInfo.uploadedUrl;
    } catch (error) {
      console.error(
        `[UploadStrategy] Error during path transformation for ${mediaInfo.uploadedUrl}:`,
        error,
      );
      if (!this.config.failForward) {
        throw new MediaProcessingError(
          'Failed to transform path',
          mediaInfo.uploadedUrl || 'unknown',
          'transform',
          error,
        ); // Use unknown as fallback for error context id
      }
      return mediaInfo.uploadedUrl || mediaInfo.originalUrl; // Fallback to uploaded or original
    }
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    if (
      entry.mediaInfo.type === MediaStrategyType.UPLOAD &&
      this.config.cleanupHandler &&
      entry.mediaInfo.uploadedUrl
    ) {
      try {
        console.debug(
          `[UploadStrategy] Calling cleanup handler for: ${entry.mediaInfo.uploadedUrl}`,
        );
        await this.config.cleanupHandler(entry);
        console.debug(
          `[UploadStrategy] Cleanup handler completed for: ${entry.mediaInfo.uploadedUrl}`,
        );
      } catch (error) {
        // Log error but don't throw
        console.error(
          `[UploadStrategy] Failed to cleanup uploaded file ${entry.mediaInfo.uploadedUrl}:`,
          error,
        );
      }
    }
  }
}
