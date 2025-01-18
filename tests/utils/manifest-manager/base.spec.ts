import { jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { BaseManifestManager } from "../../../src/utils/manifest-manager/base";

// First, create our concrete test implementation
class TestManifestManager extends BaseManifestManager {
  // Implement required abstract methods
  async initialize(): Promise<void> {
    await this.ensureDirectories();
  }

  async save(): Promise<void> {
    const testData = { test: "data" };
    await this.saveManifest(this.getManifestPath("test"), testData);
  }
}

describe("BaseManifestManager", () => {
  let testManager: TestManifestManager;
  let tempDir: string;

  // Set up before each test
  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "manifest-test-"));
    testManager = new TestManifestManager(tempDir);
  });

  // Clean up after each test
  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("Directory Handling", () => {
    test("creates base directory if it does not exist", async () => {
      // Given a non-existent directory
      const testDir = path.join(tempDir, "new-dir");
      const manager = new TestManifestManager(testDir);

      // When initializing
      await manager.initialize();

      // Then directory should be created
      const stats = await fs.stat(testDir);
      expect(stats.isDirectory()).toBe(true);
    });

    test("uses existing base directory if it already exists", async () => {
      // Given an existing directory
      const existingDir = path.join(tempDir, "existing-dir");
      await fs.mkdir(existingDir);

      // When creating manager with existing directory
      const manager = new TestManifestManager(existingDir);
      await manager.initialize();

      // Then it should use the existing directory
      const stats = await fs.stat(existingDir);
      expect(stats.isDirectory()).toBe(true);

      // And no error should be thrown
      await expect(manager.initialize()).resolves.not.toThrow();
    });

    test("allows custom base directory through constructor", async () => {
      // Given a custom directory path
      const customDir = path.join(tempDir, "custom-dir");

      // When creating manager with custom path
      const manager = new TestManifestManager(customDir);
      await manager.initialize();

      // Then it should use the custom directory
      const stats = await fs.stat(customDir);
      expect(stats.isDirectory()).toBe(true);
    });

    test("throws error if base directory path is invalid", async () => {
      // Given an invalid directory path (using characters not allowed in file paths)
      const invalidPath = path.join(tempDir, "invalid\0dir");
      const manager = new TestManifestManager(invalidPath);

      // When initializing
      // Then it should throw an error
      await expect(manager.initialize()).rejects.toThrow();
    });
  });

  describe("File Operations", () => {
    beforeEach(async () => {
      await testManager.initialize();
    });

    test("generates correct manifest file paths", () => {
      const testId = "test-manifest";
      const manifestPath = testManager["getManifestPath"](testId);
      expect(manifestPath).toBe(path.join(tempDir, `${testId}.json`));
    });

    test("creates new manifest file if none exists", async () => {
      const testId = "test";
      await testManager.save();
      const manifestPath = testManager["getManifestPath"](testId);
      const stats = await fs.stat(manifestPath);
      expect(stats.isFile()).toBe(true);
    });

    test("loads existing manifest file correctly", async () => {
      const testData = { test: "data" };
      const manifestPath = testManager["getManifestPath"]("test");
      await fs.writeFile(manifestPath, JSON.stringify(testData));

      // When loading manifest
      const loadedData = await testManager["loadManifest"](manifestPath);

      // Then data should match
      expect(loadedData).toEqual(testData);
    });
  });

  describe("Error Handling", () => {
    test("handles permission issues when creating directory", async () => {
      // Mock fs.mkdir to simulate permission error
      jest
        .spyOn(fs, "mkdir")
        .mockRejectedValueOnce(new Error("EACCES: permission denied"));

      // When initializing
      // Then it should throw an error
      await expect(testManager.initialize()).rejects.toThrow();
    });

    test("handles corrupt JSON in manifest file", async () => {
      // Given a manifest file with invalid JSON
      const manifestPath = testManager["getManifestPath"]("test");
      await fs.writeFile(manifestPath, "invalid json");

      // When loading manifest
      // Then it should throw an error
      await expect(testManager["loadManifest"](manifestPath)).rejects.toThrow();
    });
  });
});
