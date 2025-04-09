import { UploadStrategyConfig } from '../../../types/configuration';
import {
  MediaInfo,
  MediaStrategyType,
  MediaManifestEntry,
} from '../../../types/manifest-manager';
import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../../types/notion';
import { TrackedBlockReferenceObject } from '../../../types/fetcher';
import { MediaStrategy, MediaProcessingError } from '../../../types/strategy';
import { isExternalUrl } from '../../../utils/notion';

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

  async process(
    reference: TrackedBlockReferenceObject,
    index?: number,
  ): Promise<MediaInfo> {
    const id = reference.id;
    console.debug('[UploadStrategy] Processing reference:', id);

    console.debug('[UploadStrategy] Extracting URL from reference');
    let url: string | null = null;

    // Extract URL based on reference type
    switch (reference.type) {
      case 'block':
        url = this.extractBlockUrl(reference.ref as NotionBlock);
        break;
      case 'database_property':
        url = this.extractDatabasePropertyUrl(
          reference.ref as NotionDatabaseEntryProperty,
          index || 0,
        );
        break;
      case 'page_property':
        url = this.extractPagePropertyUrl(reference.ref as NotionPageProperty);
        break;
    }

    if (!url) {
      console.debug('[UploadStrategy] No URL found in reference');
      const error = new MediaProcessingError(
        'No URL found in reference',
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

    console.debug('[UploadStrategy] Extracted URL:', url);

    // Handle external URLs preservation
    if (this.config.preserveExternalUrls && isExternalUrl(url)) {
      console.debug('[UploadStrategy] Preserving external URL');
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedPath: url,
        sourceType: reference.type,
      };
    }

    try {
      // Attempt upload
      const uploadedUrl = await this.config.uploadHandler(url, id);

      // Handle failed upload (handler returns falsy value)
      if (!uploadedUrl) {
        const error = new MediaProcessingError(
          'Upload handler returned invalid URL',
          id,
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
          sourceType: reference.type,
        };
      }

      // Create media info with uploaded URL
      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.UPLOAD,
        originalUrl: url,
        uploadedUrl,
        transformedPath: this.transform({
          type: MediaStrategyType.UPLOAD,
          originalUrl: url,
          uploadedUrl,
        }),
        sourceType: reference.type,
      };

      return mediaInfo;
    } catch (error) {
      const processingError = new MediaProcessingError(
        'Failed to upload media',
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
      };
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

  private extractBlockUrl(block: NotionBlock): string | null {
    try {
      if (!block || !('type' in block)) {
        return null;
      }

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
      // Using optional chaining and typecasting to handle potential undefined
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
