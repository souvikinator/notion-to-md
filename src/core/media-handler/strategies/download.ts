import * as fs from "fs/promises";
import * as path from "path";
import fetch from "node-fetch";
import mime from "mime-types";
import { MediaStrategy } from "./base";
import {
  ListBlockChildrenResponseResult,
  MediaInfo,
  MediaInfoType,
  MediaManifestEntry,
  MediaProcessingError,
} from "../../../types";

export interface DownloadConfig {
  outputPath: string;
  transformPath?: (localPath: string) => string;
  preserveExternalUrls?: boolean;
}

export class DownloadStrategy implements MediaStrategy {
  constructor(private config: DownloadConfig) {
    if (!config.outputPath) {
      throw new Error("outputPath is required for DownloadStrategy");
    }
  }

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    try {
      // Get the media URL from the block based on its type
      const url = this.extractMediaUrl(block);

      // If configured to preserve external URLs and URL isn't from Notion
      if (this.config.preserveExternalUrls) {
        return {
          type: MediaInfoType.DIRECT,
          originalUrl: url,
          transformedUrl: url,
        };
      }

      // Download the file and get its path
      const { localPath, mimeType } = await this.downloadFile(url, block.id);

      return {
        type: MediaInfoType.DOWNLOAD,
        originalUrl: url,
        localPath,
        mimeType,
        transformedUrl: this.transform({
          type: MediaInfoType.DOWNLOAD,
          originalUrl: url,
          localPath,
          mimeType,
        }),
      };
    } catch (error) {
      throw new MediaProcessingError(
        "Failed to process media",
        block.id,
        "process",
        error,
      );
    }
  }

  transform(mediaInfo: MediaInfo): string {
    // If user provided a transform function, use it
    if (this.config.transformPath) {
      return this.config.transformPath(mediaInfo.localPath!);
    }
    // Default transformation: return the relative path from output directory
    return path.relative(this.config.outputPath, mediaInfo.localPath!);
  }

  async cleanup(entry: MediaManifestEntry): Promise<void> {
    // Only cleanup downloaded files (not preserved external URLs)
    if (
      entry.mediaInfo.type === MediaInfoType.DOWNLOAD &&
      entry.mediaInfo.localPath
    ) {
      try {
        await fs.unlink(entry.mediaInfo.localPath);
      } catch (error) {
        // If file doesn't exist, that's okay - otherwise throw
        // TODO: do not throw, if debug mode is on show it
        // if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        //   throw new MediaProcessingError(
        //     "Failed to cleanup file",
        //     entry.blockId,
        //     "cleanup",
        //     error,
        //   );
        // }
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

  private async downloadFile(
    url: string,
    blockId: string,
  ): Promise<{ localPath: string; mimeType: string }> {
    try {
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

      // Create output directory if it doesn't exist
      await fs.mkdir(this.config.outputPath, { recursive: true });

      // Generate unique filename using block ID and correct extension
      const filename = `${blockId}.${extension}`;
      const localPath = path.join(this.config.outputPath, filename);

      // Save the file
      const buffer = await response.buffer();
      await fs.writeFile(localPath, buffer);

      return { localPath, mimeType };
    } catch (error) {
      throw new MediaProcessingError(
        "Failed to download file",
        blockId,
        "downloadFile",
        error,
      );
    }
  }
}
