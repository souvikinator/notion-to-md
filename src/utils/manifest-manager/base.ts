import fs from "fs/promises";
import path from "path";

const BASE_MANIFEST_DIRECTORY = ".notion-to-md";

// Custom error types for better error handling
export class ManifestError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "ManifestError";
  }
}

export abstract class BaseManifestManager {
  private initialized: boolean = false;

  /**
   * Creates a new manifest manager instance
   * @param baseDir - The base directory for storing manifest files
   */
  constructor(protected readonly baseDir: string = BASE_MANIFEST_DIRECTORY) {}

  /**
   * Initialize the manifest system. Must be called before any other operations.
   * Derived classes should override this to add their specific initialization logic.
   */
  abstract initialize(): Promise<void>;

  /**
   * Save the current manifest state.
   * Derived classes must implement this to define what gets saved.
   */
  abstract save(): Promise<void>;

  /**
   * Ensures all required directories exist
   * @throws ManifestError if directory creation fails
   */
  protected async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      this.initialized = true;
    } catch (error) {
      if (error instanceof Error) {
        if ((error as NodeJS.ErrnoException).code === "EACCES") {
          throw new ManifestError(
            `Permission denied creating directory: ${this.baseDir}`,
            error,
          );
        }
        if ((error as NodeJS.ErrnoException).code === "EINVAL") {
          throw new ManifestError(
            `Invalid directory path: ${this.baseDir}`,
            error,
          );
        }
      }
      throw new ManifestError(
        "Failed to create manifest directory",
        error as Error,
      );
    }
  }

  /**
   * Gets the full path for a manifest file
   * @param id - The identifier for the manifest file
   * @returns The full path to the manifest file
   */
  protected getManifestPath(id: string): string {
    // Sanitize the ID to prevent directory traversal
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, "_");
    return path.join(this.baseDir, `${sanitizedId}.json`);
  }

  /**
   * Loads a manifest file from disk
   * @param manifestPath - Path to the manifest file
   * @returns The parsed manifest data
   * @throws ManifestError if the file cannot be read or parsed
   */
  protected async loadManifest<T>(manifestPath: string): Promise<T> {
    this.checkInitialized();

    try {
      const data = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(data) as T;
    } catch (error) {
      if (error instanceof Error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new ManifestError(
            `Manifest file not found: ${manifestPath}`,
            error,
          );
        }
        if (error instanceof SyntaxError) {
          throw new ManifestError(
            `Invalid manifest file format: ${manifestPath}`,
            error,
          );
        }
      }
      throw new ManifestError("Failed to load manifest file", error as Error);
    }
  }

  /**
   * Saves data to a manifest file
   * @param manifestPath - Path where the manifest should be saved
   * @param data - Data to save in the manifest
   * @throws ManifestError if the file cannot be written
   */
  protected async saveManifest<T>(
    manifestPath: string,
    data: T,
  ): Promise<void> {
    this.checkInitialized();

    try {
      // Convert data to JSON with pretty printing for readability
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(manifestPath, jsonData, "utf-8");
    } catch (error) {
      if (error instanceof Error) {
        if ((error as NodeJS.ErrnoException).code === "EACCES") {
          throw new ManifestError(
            `Permission denied writing manifest: ${manifestPath}`,
            error,
          );
        }
      }
      throw new ManifestError("Failed to save manifest file", error as Error);
    }
  }

  /**
   * Validates that the manifest manager has been initialized
   * @throws ManifestError if not initialized
   */
  protected checkInitialized(): void {
    if (!this.initialized) {
      throw new ManifestError(
        "ManifestManager not initialized. Call initialize() first.",
      );
    }
  }

  /**
   * Checks if a manifest file exists
   * @param manifestPath - Path to the manifest file
   * @returns True if the manifest exists, false otherwise
   */
  protected async manifestExists(manifestPath: string): Promise<boolean> {
    try {
      await fs.access(manifestPath);
      return true;
    } catch {
      return false;
    }
  }
}
