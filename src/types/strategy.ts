import { MediaInfo, MediaManifestEntry } from "./manifest-manager";
import { ListBlockChildrenResponseResult } from "./notion";

export interface MediaStrategy {
  /**
   * Process a media block and return information about the processed media
   * @param block The block containing media to process
   * @returns Promise resolving to MediaInfo with processing results
   * @throws MediaProcessingError if processing fails
   */
  process(block: ListBlockChildrenResponseResult): Promise<MediaInfo>;

  /**
   * Transform the processed media path/URL according to configuration
   * @param mediaInfo The media information to transform
   * @returns The transformed path or URL as a string
   */
  transform(mediaInfo: MediaInfo): string;

  /**
   * Clean up media files/resources that are no longer needed
   * @param entry Entry from manifest to be cleaned up
   * @throws MediaProcessingError if cleanup fails
   */
  cleanup(entry: MediaManifestEntry): Promise<void>;
}

// download media strategy
export interface DownloadStrategyConfig {
  outputDir: string;
  transformPath?: (localPath: string) => string;
  preserveExternalUrls?: boolean;
  failForward?: boolean;
}

// upload media strategy
export interface UploadStrategyConfig {
  uploadHandler(url: string, blockId: string): Promise<string>;
  cleanupHandler?(entry: MediaManifestEntry): Promise<void>;
  transformPath?(uploadedUrl: string): string;
  preserveExternalUrls?: boolean;
  failForward?: boolean;
}

// error handling

export class MediaProcessingError extends Error {
  constructor(
    message: string,
    public blockId: string,
    public operation: string,
    public details: unknown,
  ) {
    super(message);
    this.name = "MediaProcessingError";
  }
}
