import * as fs from "fs/promises";
import * as path from "path";
import {
  ManifestError,
  ManifestIOError,
  ManifestNotFoundError,
} from "./errors";

const BASE_DIR = ".notion-to-md";

/**
 * Abstract base class for manifest management.
 * Provides common functionality for directory handling and file operations.
 */
export abstract class BaseManifestManager {
  protected readonly baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.join(process.cwd(), BASE_DIR);
  }

  protected async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new ManifestIOError("create directory", dir, error as Error);
    }
  }

  public async initialize(dir?: string): Promise<void> {
    const manifestDir = path.join(this.baseDir, dir || "");
    await this.ensureDirectory(manifestDir);
  }

  /**
   * Generic method to save any valid JSON data to a manifest file
   * @param filename The name of the manifest file
   * @param data The data to save (must be JSON-serializable)
   */
  protected async save<T>(filename: string, data: T): Promise<void> {
    const manifestPath = this.getManifestPath(filename);

    try {
      if (!this.validateJson(data)) {
        throw new ManifestError("Invalid JSON data structure");
      }

      await fs.writeFile(manifestPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      if (error instanceof ManifestError) {
        throw error;
      }
      throw new ManifestIOError("save", manifestPath, error as Error);
    }
  }

  /**
   * Generic method to load data from a manifest file
   * @param filename The name of the manifest file to load
   * @returns The parsed data with the specified type
   */
  protected async load<T>(filename: string): Promise<T> {
    const manifestPath = this.getManifestPath(filename);

    try {
      const content = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(content) as T;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "ENOENT") {
        throw new ManifestNotFoundError(manifestPath);
      }
      throw new ManifestIOError("read", manifestPath, error as Error);
    }
  }

  private validateJson(data: unknown): boolean {
    try {
      JSON.stringify(data);
      return true;
    } catch {
      return false;
    }
  }

  private getManifestPath(pathToFile: string): string {
    return path.join(this.baseDir, pathToFile);
  }
}
