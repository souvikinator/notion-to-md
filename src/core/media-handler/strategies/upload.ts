import { ListBlockChildrenResponseResult } from "notion-to-md/build/types";
import {
  MediaStrategy,
  UploadStrategyConfig,
  MediaInfo,
  MediaInfoType,
  MediaManifestEntry,
  MediaProcessingError,
} from "../../../types";

export class UploadStrategy implements MediaStrategy {
  constructor(private config: UploadStrategyConfig) {
    // Constructor validation always throws as it's a configuration error
    if (!config.uploadHandler) {
      throw new MediaProcessingError(
        "Configuration Error",
        "constructor",
        "initialization",
        new Error("uploadHandler is required for UploadStrategy"),
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
        "No media URL found in block",
        block.id,
        "process",
        new Error("URL extraction failed"),
      );

      if (!this.config.failForward) {
        throw error;
      }

      console.error(error);
      return {
        type: MediaInfoType.DIRECT,
        originalUrl: "",
        transformedUrl: "",
      };
    }

    // Handle external URLs preservation
    if (this.config.preserveExternalUrls && !this.isNotionUrl(url)) {
      return {
        type: MediaInfoType.DIRECT,
        originalUrl: url,
        transformedUrl: url,
      };
    }

    try {
      // Attempt upload
      const uploadedUrl = await this.config.uploadHandler(url, block.id);

      // Handle failed upload (handler returns falsy value)
      if (!uploadedUrl) {
        const error = new MediaProcessingError(
          "Upload handler returned invalid URL",
          block.id,
          "process",
          new Error("Upload failed"),
        );

        if (!this.config.failForward) {
          throw error;
        }

        console.error(error);
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: url,
          transformedUrl: url,
        };
      }

      // Successful upload
      const mediaInfo: MediaInfo = {
        type: MediaInfoType.UPLOAD,
        originalUrl: url,
        uploadedUrl,
        transformedUrl: this.transform({
          type: MediaInfoType.UPLOAD,
          originalUrl: url,
          uploadedUrl,
        }),
      };

      return mediaInfo;
    } catch (error) {
      const processingError = new MediaProcessingError(
        "Failed to upload media",
        block.id,
        "process",
        error,
      );

      if (!this.config.failForward) {
        throw processingError;
      }

      console.error(processingError);
      return {
        type: MediaInfoType.DIRECT,
        originalUrl: url,
        transformedUrl: url,
      };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    // For direct types, always return original URL
    if (mediaInfo.type === MediaInfoType.DIRECT) {
      return mediaInfo.originalUrl;
    }

    // Validate uploaded URL
    if (!mediaInfo.uploadedUrl) {
      const error = new MediaProcessingError(
        "Missing uploaded URL",
        "unknown",
        "transform",
        new Error("Uploaded URL required for transformation"),
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
        "Failed to transform URL",
        "unknown",
        "transform",
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
      entry.mediaInfo.type === MediaInfoType.UPLOAD &&
      this.config.cleanupHandler &&
      entry.mediaInfo.uploadedUrl
    ) {
      try {
        await this.config.cleanupHandler(entry);
      } catch (error) {
        const processingError = new MediaProcessingError(
          "Failed to cleanup uploaded file",
          entry.mediaInfo.originalUrl,
          "cleanup",
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
      if (!block || !("type" in block)) {
        return null;
      }

      // @ts-ignore
      if (!["image", "video", "file", "pdf"].includes(block.type)) {
        return null;
      }

      // @ts-ignore
      const mediaBlock = block[block.type];

      if (!mediaBlock) {
        return null;
      }

      return mediaBlock.type === "external"
        ? mediaBlock.external?.url
        : mediaBlock.file?.url;
    } catch {
      return null;
    }
  }

  private isNotionUrl(url: string): boolean {
    return (
      url.startsWith("https://prod-files.notion-static.com/") ||
      url.startsWith(
        "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/",
      )
    );
  }
}
