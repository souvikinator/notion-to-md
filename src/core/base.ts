import { ManifestManager } from "../utils/manifest-manager";

export abstract class BaseModule {
  protected manifestManager: ManifestManager | null = null;

  setManifestManager(manager: ManifestManager): void {
    this.manifestManager = manager;
  }

  protected getManifest(): ManifestManager {
    if (!this.manifestManager) {
      throw new Error("ManifestManager not initialized");
    }
    return this.manifestManager;
  }
}
