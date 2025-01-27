import {
  MediaStrategy,
  MediaInfo,
  MediaStrategyType,
  MediaManifestEntry,
  MediaProcessingError,
  DownloadStrategyConfig,
  ListBlockChildrenResponseResult,
} from "../../../types";
import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";
import mime from "mime-types";

export class DownloadStrategy implements MediaStrategy {
  constructor(private config: DownloadStrategyConfig) {
    // Constructor validation always throws since it's a configuration error
    if (!config.outputDir) {
      throw new MediaProcessingError(
        "Configuration Error",
        "constructor",
        "initialization",
        new Error("outputDir is required for DownloadStrategy"),
      );
    }

    // Set default for failForward if not provided
    this.config.failForward = config.failForward ?? true;
  }

  async process(block: ListBlockChildrenResponseResult): Promise<MediaInfo> {
    const url = this.extractMediaUrl(block);

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
        type: MediaStrategyType.DIRECT,
        originalUrl: "",
        transformedUrl: "",
      };
    }

    // Handle external URLs - this is always allowed regardless of failForward
    if (this.config.preserveExternalUrls && this.isExternalUrl(url)) {
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedUrl: url,
      };
    }

    try {
      const { localPath, mimeType } = await this.downloadFile(url, block.id);

      const mediaInfo: MediaInfo = {
        type: MediaStrategyType.DOWNLOAD,
        originalUrl: url,
        localPath,
        mimeType,
        transformedUrl: this.transform({
          type: MediaStrategyType.DOWNLOAD,
          originalUrl: url,
          localPath,
          mimeType,
        }),
      };

      return mediaInfo;
    } catch (error) {
      const processingError = new MediaProcessingError(
        "Failed to download media",
        block.id,
        "process",
        error,
      );

      if (!this.config.failForward) {
        throw processingError;
      }

      console.error(processingError);
      return {
        type: MediaStrategyType.DIRECT,
        originalUrl: url,
        transformedUrl: url,
      };
    }
  }

  transform(mediaInfo: MediaInfo): string {
    if (mediaInfo.type === MediaStrategyType.DIRECT) {
      return mediaInfo.originalUrl;
    }

    if (!mediaInfo.localPath) {
      const error = new MediaProcessingError(
        "Missing local path for downloaded file",
        "unknown",
        "transform",
        new Error("Local path required for transformation"),
      );

      if (!this.config.failForward) {
        throw error;
      }

      console.error(error);
      return mediaInfo.originalUrl;
    }

    try {
      if (this.config.transformPath) {
        return this.config.transformPath(mediaInfo.localPath);
      }

      return path.relative(this.config.outputDir, mediaInfo.localPath);
    } catch (error) {
      const processingError = new MediaProcessingError(
        "Failed to transform path",
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
    // This prevents cleanup errors from breaking the entire process
    if (
      entry.mediaInfo.type === MediaStrategyType.DOWNLOAD &&
      entry.mediaInfo.localPath
    ) {
      try {
        await fs.unlink(entry.mediaInfo.localPath);
      } catch (error) {
        const processingError = new MediaProcessingError(
          "Failed to cleanup file",
          entry.mediaInfo.localPath,
          "cleanup",
          error,
        );
        console.error(processingError);
      }
    }
  }

  private async downloadFile(
    url: string,
    blockId: string,
  ): Promise<{ localPath: string; mimeType: string }> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const mimeType = contentType.split(";")[0].trim();
    const extension = mime.extension(mimeType);

    if (!extension) {
      throw new Error(
        `Could not determine file extension for mime type: ${mimeType}`,
      );
    }

    await fs.mkdir(this.config.outputDir, { recursive: true });

    const filename = `${blockId}.${extension}`;
    const localPath = path.join(this.config.outputDir, filename);

    const buffer = await response.buffer();
    await fs.writeFile(localPath, buffer);

    return { localPath, mimeType };
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

  private isExternalUrl(url: string): boolean {
    return !(
      url.startsWith("https://prod-files.notion-static.com/") ||
      url.startsWith(
        "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/",
      )
    );
  }
}
