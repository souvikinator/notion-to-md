import {
  MediaStrategy,
  MediaInfo,
  MediaInfoType,
  MediaManifestEntry,
  DownloadStrategyConfig,
  ListBlockChildrenResponseResult,
} from "../../../types";
import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";
import mime from "mime-types";

export class DownloadStrategy implements MediaStrategy {
  constructor(private config: DownloadStrategyConfig) {
    if (!config.outputDir) {
      throw new Error("outputDir is required for DownloadStrategy");
    }
  }

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    const url = this.extractMediaUrl(block);
    try {
      // Fail forward: If no URL found, return a DIRECT type with empty URL
      // Ideally it should not happen because we are always sending media blocks
      // but just in case
      if (!url) {
        console.warn(`No media URL found in block ${block.id}`);
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: "",
        };
      }

      // Check if we should preserve external URLs
      if (this.config.preserveExternalUrls && this.isExternalUrl(url)) {
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: url,
        };
      }

      // Download and save the file

      const { localPath, mimeType } = await this.downloadFile(url, block.id);
      return {
        type: MediaInfoType.DOWNLOAD,
        originalUrl: url,
        localPath,
        mimeType,
      };
    } catch (error) {
      // If anything fails, return a direct type with original URL
      console.error(`Failed to process media block ${block.id}:`, error);
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

    // For downloaded files, apply transformation if configured
    if (mediaInfo.localPath) {
      if (this.config.transformPath) {
        return this.config.transformPath(mediaInfo.localPath);
      }
      // Default transformation: return relative path from output directory
      return path.relative(this.config.outputDir, mediaInfo.localPath);
    }

    return mediaInfo.originalUrl;
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    // Only cleanup downloaded files
    if (
      entry.mediaInfo.type === MediaInfoType.DOWNLOAD &&
      entry.mediaInfo.localPath
    ) {
      try {
        await fs.unlink(entry.mediaInfo.localPath);
      } catch (error) {
        // Ignore if file doesn't exist, but log other errors
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error(
            `Failed to cleanup file ${entry.mediaInfo.localPath}:`,
            error,
          );
        }
      }
    }
  }

  private async downloadFile(
    url: string,
    blockId: string,
  ): Promise<{ localPath: string; mimeType: string }> {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Get content type and determine file extension
    const contentType = response.headers.get("content-type") || "";
    const mimeType = contentType.split(";")[0].trim();
    const extension = mime.extension(mimeType);

    if (!extension) {
      throw new Error(
        `Could not determine file extension for mime type: ${mimeType}`,
      );
    }

    // Ensure output directory exists
    await fs.mkdir(this.config.outputDir, { recursive: true });

    // Create file path and save file
    const filename = `${blockId}.${extension}`;
    const localPath = path.join(this.config.outputDir, filename);

    const buffer = await response.buffer();
    await fs.writeFile(localPath, buffer);

    return { localPath, mimeType };
  }

  private extractMediaUrl(
    block: ListBlockChildrenResponseResult,
  ): string | null {
    // @ts-ignore
    if (!["image", "video", "file", "pdf"].includes(block.type)) {
      return null;
    }

    // @ts-ignore
    const mediaBlock = block[block.type];
    return mediaBlock.type === "external"
      ? mediaBlock.external?.url
      : mediaBlock.file?.url;
  }

  private isExternalUrl(url: string): boolean {
    return !(
      url.startsWith("https://prod-files.notion-static.com/") ||
      url.startsWith(
        "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/",
      )
    );
  }
}
