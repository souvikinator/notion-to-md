import { ManifestManager } from "../manifest-manager";
import { MediaStrategy, MediaInfo } from "../../../types";

export abstract class BaseStrategy implements MediaStrategy {
  protected manifestManager: ManifestManager | null = null;

  // Initialize the strategy with a specific page ID
  async initialize(pageId: string): Promise<void> {
    this.manifestManager = new ManifestManager(pageId);
    await this.manifestManager.initialize();
  }

  // Abstract method that each strategy must implement
  abstract handleMedia(mediaInfo: MediaInfo): Promise<string>;

  // Default finish implementation that saves the manifest
  async finish(processedBlockIds: Set<string>): Promise<void> {
    if (this.manifestManager) {
      await this.manifestManager.saveManifest();
    }
  }
}
