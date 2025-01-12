import { BaseStrategy } from "./base";
import { UploadStrategyConfig, MediaInfo } from "../../../types";

export class UploadStrategy extends BaseStrategy {
  constructor(private config: UploadStrategyConfig) {
    super();
  }

  async handleMedia(mediaInfo: MediaInfo): Promise<string> {
    // Check if we have previously processed this media
    const existingEntry = this.manifestManager?.getEntry(mediaInfo.blockId);

    // If content hasn't changed, use existing URL
    if (existingEntry && existingEntry.lastEdited === mediaInfo.lastEdited) {
      return existingEntry.transformedPath || existingEntry.originalPath;
    }

    if (mediaInfo.isExternal && this.config.preserveExternalUrls) {
      return mediaInfo.url;
    }

    try {
      // Upload the media using provided handler
      const uploadedUrl = await this.config.uploadHandler(mediaInfo);

      // Transform URL if needed
      const transformedUrl = this.config.transformPath
        ? this.config.transformPath(uploadedUrl)
        : uploadedUrl;

      this.manifestManager?.updateEntry(mediaInfo.blockId, {
        lastEdited: mediaInfo.lastEdited,
        originalPath: uploadedUrl,
        transformedPath: transformedUrl,
        mediaType: mediaInfo.mediaType,
        strategy: "upload",
      });

      return transformedUrl;
    } catch (error) {
      console.error(
        `Failed to upload media for block ${mediaInfo.blockId}:`,
        error,
      );
      return mediaInfo.url; // Fallback to original URL on error
    }
  }

  async finish(processedBlockIds: Set<string>): Promise<void> {
    // Perform cleanup if handler is provided
    if (this.config.cleanupHandler && this.manifestManager) {
      const entries = this.manifestManager.getAllEntries();

      for (const [blockId, entry] of Object.entries(entries)) {
        if (!processedBlockIds.has(blockId)) {
          try {
            await this.config.cleanupHandler(entry);
          } catch (error) {
            console.error(
              `Failed to cleanup media for block ${blockId}:`,
              error,
            );
          }
        }
      }
    }

    // Save the final manifest state
    await super.finish(processedBlockIds);
  }
}
