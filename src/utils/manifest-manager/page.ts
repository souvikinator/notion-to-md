import * as path from 'path';
import { PageManifest, PageReferenceEntry } from '../../types/manifest-manager';
import { BaseManifestManager } from './base';
import {
  PageReferenceError,
  PageReferenceNotFoundError,
  PageReferenceStateError,
  ManifestIOError,
  ManifestNotFoundError,
} from './errors';

const BASE_DIR = 'ref';
const PAGE_REF_FILENAME = 'page_ref.json';

export class PageReferenceManifestManager extends BaseManifestManager {
  private readonly refDir: string;
  private manifest: PageManifest | null = null;

  constructor(customBaseDir?: string) {
    super(customBaseDir);
    this.refDir = BASE_DIR;
  }

  /**
   * Initializes the page reference manager.
   * Sets up directory structure and loads/creates the manifest file.
   *
   * @throws {ManifestIOError} If directory creation or file operations fail
   * @throws {PageReferenceError} If manifest initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      await super.initialize(this.refDir);

      try {
        const manifestFilename = this.getManifestFilename();
        this.manifest = await this.load<PageManifest>(manifestFilename);
      } catch (error) {
        if (error instanceof ManifestNotFoundError) {
          this.manifest = {
            lastUpdated: new Date().toISOString(),
            references: {},
          };
        } else {
          throw error;
        }
      }
    } catch (error) {
      // Reset state if initialization fails
      this.manifest = null;

      if (error instanceof ManifestIOError) {
        throw error;
      }
      throw new PageReferenceError(
        'Failed to initialize page reference manager',
        error as Error,
      );
    }
  }

  /**
   * Updates or creates a page reference entry
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   * @throws {PageReferenceError} If update fails
   */
  public async updateEntry(
    pageId: string,
    input: PageReferenceEntry,
  ): Promise<void> {
    this.ensureInitialized();

    try {
      this.manifest!.references[pageId] = {
        ...input,
      };
      this.manifest!.lastUpdated = new Date().toISOString();
    } catch (error) {
      throw new PageReferenceError(
        `Failed to update reference for page ${pageId}`,
        error as Error,
      );
    }
  }

  /**
   * Retrieves a page reference entry
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   * @throws {PageReferenceNotFoundError} If reference doesn't exist
   */
  public getEntry(pageId: string): PageReferenceEntry {
    this.ensureInitialized();

    const entry = this.manifest!.references[pageId];
    if (!entry) {
      throw new PageReferenceNotFoundError(pageId);
    }

    return entry;
  }

  /**
   * Checks if a reference exists for a page
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   */
  public hasEntry(pageId: string): boolean {
    this.ensureInitialized();
    return pageId in this.manifest!.references;
  }

  /**
   * Removes a page reference entry
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   */
  public removeEntry(pageId: string): void {
    this.ensureInitialized();

    delete this.manifest!.references[pageId];
    this.manifest!.lastUpdated = new Date().toISOString();
  }

  /**
   * Gets all page references
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   */
  public getAllEntries(): Record<string, PageReferenceEntry> {
    this.ensureInitialized();
    return { ...this.manifest!.references };
  }

  /**
   * Saves the current manifest to disk
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   * @throws {ManifestIOError} If save operation fails
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
        'save page reference manifest',
        this.getManifestFilename(),
        error as Error,
      );
    }
  }

  /**
   * Gets the current manifest data (primarily for testing)
   *
   * @throws {PageReferenceStateError} If manager is not initialized
   */
  public getManifest(): PageManifest {
    this.ensureInitialized();
    return this.manifest!;
  }

  private getManifestFilename(): string {
    return path.join(this.refDir, PAGE_REF_FILENAME);
  }

  private ensureInitialized(): void {
    if (!this.manifest) {
      throw new PageReferenceStateError(
        'Manager not initialized. Call initialize first.',
      );
    }
  }
}
