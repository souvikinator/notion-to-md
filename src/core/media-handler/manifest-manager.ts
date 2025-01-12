// manifest-manager.ts
import * as fs from "fs/promises";
import * as path from "path";
import { PageMediaManifest, MediaManifestEntry } from "../../types";

export class ManifestManager {
  private manifest: PageMediaManifest | null = null;
  private readonly MANIFEST_DIR = ".notion-to-md";
  private pageId: string;

  constructor(pageId: string) {
    this.pageId = pageId;
  }

  // Initialize the manifest system, creating necessary directories and loading data
  async initialize(): Promise<void> {
    await this.loadManifest();
  }

  // Load the manifest from disk or create a new one if it doesn't exist
  private async loadManifest(): Promise<void> {
    const manifestPath = this.getManifestPath();
    try {
      // Ensure manifest directory exists
      await fs.mkdir(this.MANIFEST_DIR, { recursive: true });

      // Try to read existing manifest
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      this.manifest = JSON.parse(manifestContent);
    } catch (error) {
      // Create new manifest if none exists
      this.manifest = {
        pageId: this.pageId,
        lastUpdated: new Date().toISOString(),
        entries: {},
      };
    }
  }

  // Save the current manifest state to disk
  async saveManifest(): Promise<void> {
    if (!this.manifest) return;

    const manifestPath = this.getManifestPath();
    this.manifest.lastUpdated = new Date().toISOString();

    // Use pretty printing for better readability
    await fs.writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
  }

  // Get the full path for the manifest file
  private getManifestPath(): string {
    return path.join(this.MANIFEST_DIR, `${this.pageId}.media-manifest.json`);
  }

  // Update or add a new entry to the manifest
  updateEntry(blockId: string, entry: MediaManifestEntry): void {
    if (!this.manifest) return;
    this.manifest.entries[blockId] = entry;
  }

  // Retrieve a specific entry from the manifest
  getEntry(blockId: string): MediaManifestEntry | undefined {
    return this.manifest?.entries[blockId];
  }

  // Get all entries from the manifest
  getAllEntries(): Record<string, MediaManifestEntry> {
    return this.manifest?.entries || {};
  }
}
