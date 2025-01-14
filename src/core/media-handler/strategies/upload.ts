import { MediaStrategy } from "./base";
import {
  ListBlockChildrenResponseResult,
  MediaInfo,
  MediaInfoType,
  MediaProcessingError,
  MediaManifestEntry,
} from "../../../types";

export interface UploadConfig {
  uploadHandler: (url: string, blockId: string) => Promise<string>;
  transformPath?: (uploadedUrl: string) => string;
  cleanupHandler?: (entry: MediaManifestEntry) => Promise<void>;
  preserveExternalUrls?: boolean;
}

export class UploadStrategy implements MediaStrategy {
  constructor(private config: UploadConfig) {
    if (!config.uploadHandler) {
      throw new Error("uploadHandler is required for UploadStrategy");
    }
  }

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    try {
      // Extract the media URL from the block
      const originalUrl = this.extractMediaUrl(block);

      // If configured to preserve external URLs
      if (this.config.preserveExternalUrls) {
        return {
          type: MediaInfoType.DIRECT,
          originalUrl,
          transformedUrl: originalUrl,
        };
      }

      // Upload the file using the provided handler
      const uploadedUrl = await this.config.uploadHandler(
        originalUrl,
        block.id,
      );

      // Create media info with upload details
      const mediaInfo: MediaInfo = {
        type: MediaInfoType.UPLOAD,
        originalUrl,
        uploadedUrl,
        transformedUrl: this.transform({
          type: MediaInfoType.UPLOAD,
          originalUrl,
          uploadedUrl,
        }),
      };

      return mediaInfo;
    } catch (error) {
      throw new MediaProcessingError(
        "Failed to upload media",
        block.id,
        "process",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  transform(mediaInfo: MediaInfo): string {
    // If user provided a transform function, use it
    if (this.config.transformPath && mediaInfo.uploadedUrl) {
      return this.config.transformPath(mediaInfo.uploadedUrl);
    }
    // Default transformation: return the uploaded URL as-is
    return mediaInfo.uploadedUrl || mediaInfo.originalUrl;
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    // Only attempt cleanup if:
    // 1. Entry is an uploaded file (not preserved external URL)
    // 2. User provided a cleanup handler
    if (
      entry.mediaInfo.type === MediaInfoType.UPLOAD &&
      this.config.cleanupHandler &&
      entry.mediaInfo.uploadedUrl
    ) {
      try {
        await this.config.cleanupHandler(entry);
      } catch (error) {
        throw new MediaProcessingError(
          "Failed to cleanup uploaded file",
          entry.blockId,
          "cleanup",
          error,
        );
      }
    }
  }

  private extractMediaUrl(block: ListBlockChildrenResponseResult): string {
    // Handle different block types
    // @ts-ignore
    switch (block.type) {
      case "image":
        // @ts-ignore
        return block.image.type === "external"
          ? // @ts-ignore
            block.image.external.url
          : // @ts-ignore
            block.image.file.url;
      case "video":
        // @ts-ignore
        return block.video.type === "external"
          ? // @ts-ignore
            block.video.external.url
          : // @ts-ignore
            block.video.file.url;
      case "file":
        // @ts-ignore
        return block.file.type === "external"
          ? // @ts-ignore
            block.file.external.url
          : // @ts-ignore
            block.file.file.url;
      case "pdf":
        // @ts-ignore
        return block.pdf.type === "external"
          ? // @ts-ignore
            block.pdf.external.url
          : // @ts-ignore
            block.pdf.file.url;
      default:
        return "";
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
