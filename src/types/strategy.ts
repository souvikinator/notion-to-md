import { MediaInfo, MediaManifestEntry } from './manifest-manager';
import { NotionBlock } from './notion';

export interface MediaStrategy {
  /**
   * Process a media block and return information about the processed media
   * @param block The block containing media to process
   * @returns Promise resolving to MediaInfo with processing results
   * @throws MediaProcessingError if processing fails
   */
  process(block: NotionBlock): Promise<MediaInfo>;

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

// error handling

export class MediaProcessingError extends Error {
  constructor(
    message: string,
    public blockId: string,
    public operation: string,
    public details: unknown,
  ) {
    super(message);
    this.name = 'MediaProcessingError';
  }
}
