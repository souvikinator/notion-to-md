import fetch from "node-fetch";
import * as mime from "mime-types";
import * as path from "path";
import * as fs from "fs/promises";
import { BaseStrategy } from "./base";
import { DownloadStrategyConfig, MediaInfo } from "../../../types";

export class DownloadStrategy extends BaseStrategy {
  // Track files that need to be cleaned up
  private filesToCleanup: Set<string> = new Set();

  constructor(private config: DownloadStrategyConfig) {
    super();

    // Validate required configuration
    if (!config.outputPath) {
      throw new Error("Download strategy requires outputPath configuration");
    }

    // Ensure output directory exists
    fs.mkdir(config.outputPath, { recursive: true }).catch((error) => {
      throw new Error(`Failed to create output directory: ${error.message}`);
    });
  }

  async handleMedia(mediaInfo: MediaInfo): Promise<string> {
    const existingEntry = this.manifestManager?.getEntry(mediaInfo.blockId);

    // Handle special cases for external media first
    if (this.shouldPreserveExternalUrl(mediaInfo)) {
      return mediaInfo.url;
    }

    try {
      // Check if content needs updating
      if (existingEntry) {
        const lastEditTime = new Date(mediaInfo.lastEdited);
        const manifestEditTime = new Date(existingEntry.lastEdited);

        if (lastEditTime <= manifestEditTime) {
          // Content is up to date - use existing file
          return existingEntry.transformedPath || existingEntry.originalPath;
        }

        // Content is outdated - mark for cleanup if it's a local file
        if (!existingEntry.originalPath.startsWith("http")) {
          console.log(
            `Marking outdated file for cleanup: ${existingEntry.originalPath}`,
          );
          this.filesToCleanup.add(existingEntry.originalPath);
        }
      }

      // Download and process new content
      const { filePath, transformedPath } = await this.downloadMedia(mediaInfo);

      // Update manifest with new file information
      this.manifestManager?.updateEntry(mediaInfo.blockId, {
        lastEdited: mediaInfo.lastEdited,
        originalPath: filePath,
        transformedPath,
        mediaType: mediaInfo.mediaType,
        strategy: "download",
      });

      return transformedPath;
    } catch (error) {
      console.error(
        `Failed to process media for block ${mediaInfo.blockId}:`,
        error,
      );
      return mediaInfo.url; // Fallback to original URL
    }
  }

  async finish(processedBlockIds: Set<string>): Promise<void> {
    if (!this.manifestManager) return;

    // First, collect all files that need cleanup
    this.gatherFilesForCleanup(processedBlockIds);

    // Then perform the cleanup operations
    await this.performCleanup();

    // Finally, save the manifest state
    await super.finish(processedBlockIds);
  }

  private shouldPreserveExternalUrl(mediaInfo: MediaInfo): boolean {
    if (!mediaInfo.isExternal) return false;

    // Special handling for video platforms
    if (
      mediaInfo.mediaType === "video" &&
      this.isVideoHostingUrl(mediaInfo.url)
    ) {
      return true;
    }

    return !!this.config.preserveExternalUrls;
  }

  private async downloadMedia(
    mediaInfo: MediaInfo,
  ): Promise<{ filePath: string; transformedPath: string }> {
    const response = await fetch(mediaInfo.url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Determine file extension from content type or fallback
    const contentType = response.headers.get("content-type");
    const extension =
      mime.extension(contentType || "") ||
      this.getFallbackExtension(mediaInfo.mediaType);

    const filename = `${mediaInfo.blockId}.${extension}`;
    const filePath = path.join(this.config.outputPath, filename);

    // Save the file
    const buffer = await response.buffer();
    await fs.writeFile(filePath, buffer);

    // Transform the path if configured
    const transformedPath = this.config.transformPath
      ? this.config.transformPath(filePath)
      : path.relative(process.cwd(), filePath);

    return { filePath, transformedPath };
  }

  private async gatherFilesForCleanup(
    processedBlockIds: Set<string>,
  ): Promise<void> {
    const entries = this.manifestManager?.getAllEntries() || {};

    for (const [blockId, entry] of Object.entries(entries)) {
      // Skip external URLs - we only clean up local files
      if (entry.originalPath.startsWith("http")) continue;

      // If block is no longer present in the content, mark for cleanup
      if (!processedBlockIds.has(blockId)) {
        console.log(
          `Marking removed block's file for cleanup: ${entry.originalPath}`,
        );
        this.filesToCleanup.add(entry.originalPath);
      }
    }
  }

  private async performCleanup(): Promise<void> {
    if (this.filesToCleanup.size === 0) return;

    console.log(`Starting cleanup of ${this.filesToCleanup.size} files`);

    // Track failed deletions for reporting
    const failedDeletions: Array<{ path: string; error: Error }> = [];

    // Process each file independently
    const cleanupPromises = Array.from(this.filesToCleanup).map(
      async (filePath) => {
        try {
          // Check if file exists before attempting deletion
          const fileExists = await fs
            .access(filePath)
            .then(() => true)
            .catch(() => false);

          if (!fileExists) {
            console.log(`File already removed or not found: ${filePath}`);
            return;
          }

          await fs.unlink(filePath);
          console.log(`Successfully cleaned up: ${filePath}`);
        } catch (error) {
          console.error(`Failed to clean up file ${filePath}:`, error);
          failedDeletions.push({
            path: filePath,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      },
    );

    // Wait for all cleanup operations to complete
    await Promise.allSettled(cleanupPromises);

    // Log cleanup summary
    if (failedDeletions.length > 0) {
      console.warn(
        `Cleanup completed with ${failedDeletions.length} failures:`,
      );
      failedDeletions.forEach(({ path, error }) => {
        console.warn(`- ${path}: ${error.message}`);
      });
    } else {
      console.log("All files cleaned up successfully");
    }

    this.filesToCleanup.clear();
  }

  private isVideoHostingUrl(url: string): boolean {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  }

  private getFallbackExtension(mediaType: string): string {
    const fallbacks: Record<string, string> = {
      image: "jpg",
      video: "mp4",
      file: "bin",
      pdf: "pdf",
    };
    return fallbacks[mediaType] || "bin";
  }
}
