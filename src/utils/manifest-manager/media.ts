import * as path from "path";
import {
  MediaManifest,
  MediaManifestInput,
  MediaManifestEntry,
} from "../../types";
import { BaseManifestManager } from "./base";
import {
  MediaManifestError,
  MediaEntryNotFoundError,
  MediaManifestStateError,
  ManifestNotFoundError,
  ManifestIOError,
} from "./errors";

const BASE_DIR = "media";

export class MediaManifestManager extends BaseManifestManager {
  private readonly mediaDir: string;
  private manifest: MediaManifest | null = null;
  private currentPageId: string | null = null;

  constructor(customBaseDir?: string) {
    super(customBaseDir);
    this.mediaDir = BASE_DIR;
  }

  /**
   * Initializes the media manifest manager for a specific page.
   * This sets up the required directory structure and loads/creates
   * the manifest file for the given page.
   *
   * @param pageId The Notion page ID to initialize the manager for
   * @throws {ManifestIOError} If directory creation or file operations fail
   */
  public async initialize(pageId: string): Promise<void> {
    try {
      await super.initialize(this.mediaDir);

      this.currentPageId = pageId;

      try {
        const manifestFilename = this.getManifestFilename();
        this.manifest = await this.load<MediaManifest>(manifestFilename);
      } catch (error) {
        if (error instanceof ManifestNotFoundError) {
          this.manifest = {
            pageId,
            lastUpdated: new Date().toISOString(),
            mediaEntries: {},
          };
        } else {
          throw error;
        }
      }
    } catch (error) {
      // Reset state if initialization fails
      this.manifest = null;
      this.currentPageId = null;

      if (error instanceof ManifestIOError) {
        throw error;
      }
      throw new ManifestIOError(
        "initialize media manifest manager",
        this.mediaDir,
        error as Error,
      );
    }
  }

  /**
   * Updates or creates a media entry for a block
   * @throws {MediaManifestStateError} If manager is not initialized
   * @throws {ManifestIOError} If saving fails
   */
  public async updateEntry(
    blockId: string,
    input: MediaManifestInput,
  ): Promise<void> {
    this.ensureInitialized();

    const now = new Date().toISOString();
    const existing = this.manifest!.mediaEntries[blockId];

    try {
      this.manifest!.mediaEntries[blockId] = {
        ...input,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      this.manifest!.lastUpdated = now;
    } catch (error) {
      throw new MediaManifestError(
        `Failed to update entry for block ${blockId}`,
        error as Error,
      );
    }
  }

  /**
   * Retrieves a media entry for a block
   * @throws {MediaManifestStateError} If manager is not initialized
   * @throws {MediaEntryNotFoundError} If entry doesn't exist
   */
  public getEntry(blockId: string): MediaManifestEntry {
    this.ensureInitialized();

    const entry = this.manifest!.mediaEntries[blockId];
    if (!entry) {
      throw new MediaEntryNotFoundError(blockId);
    }

    return entry;
  }

  /**
   * Removes a media entry for a block
   * @throws {MediaManifestStateError} If manager is not initialized
   */
  public removeEntry(blockId: string): void {
    this.ensureInitialized();

    delete this.manifest!.mediaEntries[blockId];
    this.manifest!.lastUpdated = new Date().toISOString();
  }

  /**
   * Saves the current manifest to disk
   * @throws {MediaManifestStateError} If manager is not initialized
   * @throws {ManifestIOError} If saving fails
   */
  public async save(): Promise<void> {
    this.ensureInitialized();

    try {
      await super.save(this.getManifestFilename(), this.manifest);
    } catch (error) {
      if (error instanceof ManifestIOError) {
        throw error;
      }
      throw new ManifestIOError(
        "save media manifest",
        this.getManifestFilename(),
        error as Error,
      );
    }
  }

  /**
   * Gets the current manifest data (primarily for testing)
   * @throws {MediaManifestStateError} If manager is not initialized
   */
  public getManifest(): MediaManifest {
    this.ensureInitialized();
    return this.manifest!;
  }

  /**
   * Gets the manifest filename for the current page
   * @throws {MediaManifestStateError} If no page ID is set
   */
  private getManifestFilename(): string {
    if (!this.currentPageId) {
      throw new MediaManifestStateError(
        "No page ID set. Call initialize first.",
      );
    }
    return path.join(this.mediaDir, `${this.currentPageId}_media.json`);
  }

  /**
   * Ensures the manager is properly initialized
   * @throws {MediaManifestStateError} If manager is not initialized
   */
  private ensureInitialized(): void {
    if (!this.manifest || !this.currentPageId) {
      throw new MediaManifestStateError(
        "Manager not initialized. Call initialize first.",
      );
    }
  }
}
