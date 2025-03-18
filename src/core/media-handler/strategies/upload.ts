import { UploadStrategyConfig } from '../../../types/configuration';
import {
  MediaInfo,
  MediaStrategyType,
  MediaManifestEntry,
} from '../../../types/manifest-manager';
import { ListBlockChildrenResponseResult } from '../../../types/notion';
import { MediaStrategy, MediaProcessingError } from '../../../types/strategy';
import { isExternalUrl } from '../../../utils/notion';

export class UploadStrategy implements MediaStrategy {
  constructor(private config: UploadStrategyConfig) {
    // Constructor validation always throws as it's a configuration error
    if (!config.uploadHandler) {
      throw new MediaProcessingError(
        'Configuration Error',
        'constructor',
        'initialization',
        new Error('uploadHandler is required for UploadStrategy'),
      );
    }

    // Set default for failForward if not provided
    this.config.failForward = config.failForward ?? true;
  }

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    const url = this.extractMediaUrl(block);

    // Handle missing URL
    if (!url) {
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

    // Handle external URLs preservation
    if (this.config.preserveExternalUrls && isExternalUrl(url)) {
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
      };
    }

    try {
      // Attempt upload
      const uploadedUrl = await this.config.uploadHandler(url, block.id);

      // Handle failed upload (handler returns falsy value)
      if (!uploadedUrl) {
        const error = new MediaProcessingError(
          'Upload handler returned invalid URL',
          block.id,
          'process',
          new Error('Upload failed'),
        );

        if (!this.config.failForward) {
          throw error;
        }

        console.error(error);
        return {
          type: MediaStrategyType.DIRECT,
          originalUrl: url,
          transformedPath: url,
        };
      }

      // Successful upload
      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.UPLOAD,
        originalUrl: url,
        uploadedUrl,
        transformedPath: this.transform({
          type: MediaStrategyType.UPLOAD,
          originalUrl: url,
          uploadedUrl,
        }),
      };

      return mediaInfo;
    } catch (error) {
      const processingError = new MediaProcessingError(
        'Failed to upload media',
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
    // For direct types, always return original URL
    if (mediaInfo.type === MediaStrategyType.DIRECT) {
      return mediaInfo.originalUrl;
    }

    // Validate uploaded URL
    if (!mediaInfo.uploadedUrl) {
      const error = new MediaProcessingError(
        'Missing uploaded URL',
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
      // Apply custom transformation if configured
      if (this.config.transformPath) {
        return this.config.transformPath(mediaInfo.uploadedUrl);
      }

      return mediaInfo.uploadedUrl;
    } catch (error) {
      const processingError = new MediaProcessingError(
        'Failed to transform URL',
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
    // Cleanup always fails forward regardless of config
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
          entry.mediaInfo.originalUrl,
          'cleanup',
          error,
        );
        console.error(processingError);
      }
    }
  }

  private extractMediaUrl(
    block: ListBlockChildrenResponseResult,
  ): string | null {
    try {
      if (!block || !('type' in block)) {
        return null;
      }

      // @ts-ignore
      if (!['image', 'video', 'file', 'pdf'].includes(block.type)) {
        return null;
      }

      // @ts-ignore
      const mediaBlock = block[block.type];

      if (!mediaBlock) {
        return null;
      }

      return mediaBlock.type === 'external'
        ? mediaBlock.external?.url
        : mediaBlock.file?.url;
    } catch {
      return null;
    }
  }
}
