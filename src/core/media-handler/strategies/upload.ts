import { ListBlockChildrenResponseResult } from "notion-to-md/build/types";
import {
  MediaStrategy,
  UploadStrategyConfig,
  MediaInfo,
  MediaInfoType,
  MediaManifestEntry,
} from "../../../types";

export class UploadStrategy implements MediaStrategy {
  constructor(private config: UploadStrategyConfig) {
    if (!config.uploadHandler) {
      throw new Error("uploadHandler is required for UploadStrategy");
    }
  }

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    const url = this.extractMediaUrl(block);
    try {
      // Fail forward: If no URL found, return a DIRECT type
      if (!url) {
        console.warn(`No media URL found in block ${block.id}`);
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: "",
        };
      }

      // If configured to preserve external URLs and URL isn't from Notion
      if (this.config.preserveExternalUrls && !this.isNotionUrl(url)) {
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: url,
        };
      }

      const uploadedUrl = await this.config.uploadHandler(url, block.id);

      // Fail forward: If upload handler returns falsy value
      if (!uploadedUrl) {
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: url,
        };
      }

      return {
        type: MediaInfoType.UPLOAD,
        originalUrl: url,
        uploadedUrl,
      };
    } catch (error) {
      console.error(`Error processing block ${block.id}:`, error);
      return {
        type: MediaInfoType.DIRECT,
        originalUrl: url || "",
      };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    // For direct types, return original URL
    if (mediaInfo.type === MediaInfoType.DIRECT) {
      return mediaInfo.originalUrl;
    }

    // For uploaded files, apply transformation if configured
    if (mediaInfo.uploadedUrl) {
      return this.config.transformPath
        ? this.config.transformPath(mediaInfo.uploadedUrl)
        : mediaInfo.uploadedUrl;
    }

    return mediaInfo.originalUrl;
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    // Only attempt cleanup if:
    // 1. Entry is an uploaded file
    // 2. User provided a cleanup handler
    // 3. We have an uploaded URL
    if (
      entry.mediaInfo.type === MediaInfoType.UPLOAD &&
      this.config.cleanupHandler &&
      entry.mediaInfo.uploadedUrl
    ) {
      try {
        await this.config.cleanupHandler(entry);
      } catch (error) {
        // Log but don't throw - fail forward
        console.error(`Failed to cleanup uploaded file for entry:`, error);
      }
    }
  }

  private extractMediaUrl(
    block: ListBlockChildrenResponseResult,
  ): string | null {
    try {
      // @ts-ignore - we know these properties exist on media blocks
      const mediaBlock = block[block.type];
      if (!mediaBlock) return null;

      return mediaBlock.type === "external"
        ? mediaBlock.external?.url
        : mediaBlock.file?.url;
    } catch (error) {
      console.error(`Failed to extract URL from block ${block.id}:`, error);
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
