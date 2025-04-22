import { MediaInfo, MediaManifestEntry } from './manifest-manager';
import { TrackedBlockReferenceObject } from './fetcher';
import { MediaManifestManager } from '../utils/manifest-manager/media';

/**
 * Input data provided to a media strategy's process method.
 */
export interface StrategyInput {
  reference: TrackedBlockReferenceObject;
  index?: number; // Index for multi-file properties
  refId: string; // Unique ID for manifest tracking
  manifestManager: MediaManifestManager; // Access to manifest data
  lastEditedTime: string; // Last edited time of the source block/property
  potentialFilename: string; // Pre-generated filename hint (e.g., for download)
}

/**
 * Output structure returned by a media strategy's process method.
 */
export interface StrategyOutput {
  /** Media information result. Null if processing was skipped or failed silently. */
  mediaInfo: MediaInfo | null;
  /** Indicates if the media manifest needs to be updated for this entry. */
  needsManifestUpdate: boolean;
}

export interface MediaStrategy {
  /**
   * Process media based on the provided input, deciding whether to act based on manifest state and strategy logic.
   * @param input Input data containing reference, manifest access, IDs, etc.
   * @returns Promise resolving to StrategyOutput containing the result and manifest update requirement.
   * @throws MediaProcessingError if processing fails and failForward is not enabled.
   */
  process(input: StrategyInput): Promise<StrategyOutput>;

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
