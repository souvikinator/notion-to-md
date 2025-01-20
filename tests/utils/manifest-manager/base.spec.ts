import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as fs from "fs/promises";
import * as path from "path";
import { BaseManifestManager } from "../../../src/utils/manifest-manager/base";
import {
  ManifestError,
  ManifestIOError,
  ManifestNotFoundError,
} from "../../../src/utils/manifest-manager/errors";

// Create concrete test implementation
class TestManifestManager extends BaseManifestManager {
  public async testSave<T>(filename: string, data: T): Promise<void> {
    return this.save(filename, data);
  }

  public async testLoad<T>(filename: string): Promise<T> {
    return this.load<T>(filename);
  }
}

jest.mock("fs/promises");

describe("BaseManifestManager", () => {
  let manager: TestManifestManager;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    manager = new TestManifestManager();
  });

  describe("initialization", () => {
    test("creates base directory with default path", async () => {
      await manager.initialize();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining(".notion-to-md"),
        { recursive: true },
      );
    });

    test("creates base directory with custom path", async () => {
      const customPath = "/custom/path";
      const customManager = new TestManifestManager(customPath);

      await customManager.initialize();

      expect(mockFs.mkdir).toHaveBeenCalledWith(customPath, {
        recursive: true,
      });
    });

    test("throws ManifestIOError when directory creation fails", async () => {
      mockFs.mkdir.mockRejectedValue(new Error("Permission denied"));

      await expect(manager.initialize()).rejects.toBeInstanceOf(
        ManifestIOError,
      );
    });
  });

  describe("save operations", () => {
    const testData = { key: "value" };
    const testFilename = "test.json";

    beforeEach(async () => {
      await manager.initialize();
    });

    test("successfully saves valid JSON data", async () => {
      await manager.testSave(testFilename, testData);

      const basePath = path.join(process.cwd(), ".notion-to-md");
      const expectedPath = path.join(basePath, testFilename);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        JSON.stringify(testData, null, 2),
        "utf-8",
      );
    });

    test("throws ManifestError when saving invalid JSON data", async () => {
      const circularData: any = {};
      circularData.self = circularData;

      await expect(
        manager.testSave(testFilename, circularData),
      ).rejects.toBeInstanceOf(ManifestError);
    });

    test("throws ManifestIOError when write operation fails", async () => {
      mockFs.writeFile.mockRejectedValue(new Error("Write failed"));

      await expect(
        manager.testSave(testFilename, testData),
      ).rejects.toBeInstanceOf(ManifestIOError);
    });
  });

  describe("load operations", () => {
    const testData = { key: "value" };
    const testFilename = "test.json";

    beforeEach(async () => {
      await manager.initialize();
    });

    test("successfully loads and parses JSON data", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(testData));

      const result = await manager.testLoad<typeof testData>(testFilename);

      expect(result).toEqual(testData);
    });

    test("throws ManifestNotFoundError for ENOENT error", async () => {
      const error = new Error("File not found");
      (error as NodeJS.ErrnoException).code = "ENOENT";
      mockFs.readFile.mockRejectedValue(error);

      await expect(manager.testLoad(testFilename)).rejects.toBeInstanceOf(
        ManifestNotFoundError,
      );
    });

    test("throws ManifestError when file contains invalid JSON", async () => {
      mockFs.readFile.mockResolvedValue("invalid json content");

      await expect(manager.testLoad(testFilename)).rejects.toBeInstanceOf(
        ManifestError,
      );
    });

    test("throws ManifestIOError when read operation fails", async () => {
      mockFs.readFile.mockRejectedValue(new Error("Read failed"));

      await expect(manager.testLoad(testFilename)).rejects.toBeInstanceOf(
        ManifestIOError,
      );
    });
  });

  describe("path handling", () => {
    const testFilename = "test.json";

    test("combines base directory and filename correctly with default path", async () => {
      await manager.testSave(testFilename, { test: true });

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), ".notion-to-md", testFilename),
        expect.any(String),
        "utf-8",
      );
    });

    test("combines base directory and filename correctly with custom path", async () => {
      const customPath = "/custom/path";
      const customManager = new TestManifestManager(customPath);

      await customManager.testSave(testFilename, { test: true });

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(customPath, testFilename),
        expect.any(String),
        "utf-8",
      );
    });

    test("handles nested paths correctly", async () => {
      const nestedPath = "nested/path/file.json";

      await manager.testSave(nestedPath, { test: true });

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), ".notion-to-md", nestedPath),
        expect.any(String),
        "utf-8",
      );
    });
  });

  describe("JSON validation", () => {
    test("validates JSON serializability", async () => {
      const validData = [
        { string: "test" },
        { number: 123 },
        { boolean: true },
        { null: null },
        { array: [1, 2, 3] },
        { nested: { object: true } },
      ];

      for (const data of validData) {
        await expect(
          manager.testSave("test.json", data),
        ).resolves.not.toThrow();
      }
    });
  });
});
