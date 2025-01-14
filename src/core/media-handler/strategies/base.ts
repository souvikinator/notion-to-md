import {
  ListBlockChildrenResponseResult,
  MediaInfo,
  MediaManifestEntry,
} from "../../../types";

export interface MediaStrategy {
  /**
   * Process a media block and return information about the processed media
   * @param block The block containing media to process
   * @returns Promise resolving to MediaInfo with processing results
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
   * @param entries Array of manifest entries for cleanup
   */
  cleanup(entries: MediaManifestEntry): Promise<void>;
}
