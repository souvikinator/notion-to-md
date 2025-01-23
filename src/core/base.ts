import {
  MediaManifestManager,
  PageReferenceManifestManager,
} from "../utils/manifest-manager";
import { ManifestNotInitializedError } from "./errors";

type ManifestManagerType = MediaManifestManager | PageReferenceManifestManager;

/**
 * Base module providing manifest management functionality.
 * Extended by core components like MediaHandler, BlockFetcher etc.
 */
export abstract class BaseModule {
  /**
   * Protected manifest manager accessible by derived classes
   */
  protected manifestManager: ManifestManagerType | null = null;

  /**
   * Module type for error reporting
   */
  constructor(protected readonly moduleType: string) {}

  /**
   * Sets the manifest manager for the module
   */
  setManifestManager(manager: ManifestManagerType): this {
    this.manifestManager = manager;
    return this;
  }

  /**
   * Protected getter for manifest with validation
   */
  protected getManifest(): ManifestManagerType {
    if (!this.manifestManager) {
      throw new ManifestNotInitializedError(this.moduleType);
    }
    return this.manifestManager;
  }
}
