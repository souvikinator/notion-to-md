import { BaseManifestManager, ManifestError } from "./base";
import path from "path";
import {
  MediaManifest,
  MediaManifestInput,
  MediaInfo,
  MediaManifestEntry,
} from "../../types";

export class MediaManifestManager extends BaseManifestManager {
  private currentManifest: MediaManifest | null = null;
  private currentPageId: string | null = null;

  constructor(baseDir: string = ".manifests/media") {
    super(baseDir);
  }

  /**
   * Initialize the media manifest system.
   * Creates the base directory structure if it doesn't exist.
   */
  async initialize(): Promise<void> {
    await this.ensureDirectories();
  }

  /**
   * Set up manifest handling for a specific page.
   * Creates a new manifest if none exists, or loads existing one.
   *
   * @param pageId - The Notion page ID
   * @throws ManifestError if initialization fails
   */
  async initializeForPage(pageId: string): Promise<void> {
    if (!pageId) {
      throw new ManifestError("Page ID is required");
    }

    try {
      const manifestPath = this.getManifestPath(pageId);
      let manifest: MediaManifest;

      if (await this.manifestExists(manifestPath)) {
        manifest = await this.loadManifest<MediaManifest>(manifestPath);

        if (!this.isValidManifest(manifest)) {
          throw new ManifestError(
            `Invalid manifest structure for page ${pageId}`,
          );
        }
      } else {
        manifest = this.createNewManifest(pageId);
        await this.saveManifest(manifestPath, manifest);
      }

      this.currentManifest = manifest;
      this.currentPageId = pageId;
    } catch (error) {
      throw new ManifestError(
        `Failed to initialize manifest for page ${pageId}`,
        error as Error,
      );
    }
  }

  /**
   * Update or create a media entry for a specific block.
   * Manages internal timestamps (createdAt, updatedAt) automatically.
   *
   * @param blockId - The Notion block ID
   * @param entry - The media entry data
   */
  async updateMediaEntry(
    blockId: string,
    entry: MediaManifestInput,
  ): Promise<void> {
    this.ensurePageInitialized();

    const now = new Date().toISOString();
    const existingEntry = this.currentManifest!.mediaEntries[blockId];

    // Create or update entry while managing timestamps
    this.currentManifest!.mediaEntries[blockId] = {
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };

    // Update manifest's last updated timestamp
    this.currentManifest!.lastUpdated = now;
    await this.save();
  }

  /**
   * Retrieve a media entry by block ID.
   *
   * @param blockId - The Notion block ID
   * @returns The media entry if found, undefined otherwise
   */
  getMediaEntry(blockId: string): MediaManifestEntry | undefined {
    this.ensurePageInitialized();
    return this.currentManifest!.mediaEntries[blockId];
  }

  /**
   * Remove a media entry from the manifest.
   * Does nothing if the entry doesn't exist.
   *
   * @param blockId - The Notion block ID to remove
   */
  async removeMediaEntry(blockId: string): Promise<void> {
    this.ensurePageInitialized();

    if (blockId in this.currentManifest!.mediaEntries) {
      delete this.currentManifest!.mediaEntries[blockId];
      this.currentManifest!.lastUpdated = new Date().toISOString();
      await this.save();
    }
  }

  /**
   * Persist the current manifest state to disk.
   * @throws ManifestError if saving fails
   */
  async save(): Promise<void> {
    this.ensurePageInitialized();
    const manifestPath = this.getManifestPath(this.currentPageId!);
    await this.saveManifest(manifestPath, this.currentManifest);
  }

  /**
   * Create a new empty manifest for a page
   */
  private createNewManifest(pageId: string): MediaManifest {
    return {
      pageId,
      lastUpdated: new Date().toISOString(),
      mediaEntries: {},
    };
  }

  /**
   * Validate the structure of a loaded manifest
   */
  private isValidManifest(manifest: unknown): manifest is MediaManifest {
    const typedManifest = manifest as MediaManifest;

    return Boolean(
      typedManifest &&
        typeof typedManifest.pageId === "string" &&
        typeof typedManifest.lastUpdated === "string" &&
        typeof typedManifest.mediaEntries === "object" &&
        // Validate entries recursively if they exist
        Object.values(typedManifest.mediaEntries).every((entry) =>
          this.isValidMediaEntry(entry),
        ),
    );
  }

  /**
   * Validate the structure of a media entry
   */
  private isValidMediaEntry(entry: unknown): entry is MediaManifestEntry {
    const typedEntry = entry as MediaManifestEntry;

    return Boolean(
      typedEntry &&
        typeof typedEntry.lastEdited === "string" &&
        typeof typedEntry.createdAt === "string" &&
        typeof typedEntry.updatedAt === "string" &&
        this.isValidMediaInfo(typedEntry.mediaInfo),
    );
  }

  /**
   * Validate the structure of media info
   */
  private isValidMediaInfo(info: unknown): info is MediaInfo {
    const typedInfo = info as MediaInfo;

    return Boolean(
      typedInfo &&
        ["download", "upload", "external"].includes(typedInfo.type) &&
        typeof typedInfo.originalUrl === "string",
    );
  }

  /**
   * Ensure a page has been initialized before performing operations
   * @throws ManifestError if no page is initialized
   */
  private ensurePageInitialized(): void {
    if (!this.currentManifest || !this.currentPageId) {
      throw new ManifestError(
        "No page initialized. Call initializeForPage() first.",
      );
    }
  }

  /**
   * Get manifest path for a specific page
   */
  protected override getManifestPath(pageId: string): string {
    // Sanitize the ID and ensure it's within our media directory
    const sanitizedId = pageId.replace(/[^a-zA-Z0-9-]/g, "_");
    return path.join(this.baseDir, `${sanitizedId}.json`);
  }
}
