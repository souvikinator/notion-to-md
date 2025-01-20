import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as fs from "fs/promises";
import * as path from "path";
import {
  MediaInfo,
  MediaManifestInput,
  MediaManifest,
  MediaInfoType,
} from "../../../src/types";
import { MediaManifestManager } from "../../../src/utils/manifest-manager/media";
import {
  ManifestIOError,
  ManifestNotFoundError,
  MediaManifestError,
  MediaEntryNotFoundError,
  MediaManifestStateError,
} from "../../../src/utils/manifest-manager/errors";

jest.mock("fs/promises");

describe("MediaManifestManager", () => {
  let manager: MediaManifestManager;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const baseDir = path.join(process.cwd(), ".notion-to-md");
  const mediaDir = "media";

  // Common test data
  const pageId = "test-page-123";
  const blockId = "test-block-456";
  const testMediaInfo: MediaInfo = {
    type: MediaInfoType.DOWNLOAD,
    originalUrl: "https://example.com/image.jpg",
    localPath: "/path/to/image.jpg",
  };
  const testInput: MediaManifestInput = {
    mediaInfo: testMediaInfo,
    lastEdited: "2024-01-19T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.resetAllMocks();
    manager = new MediaManifestManager();
    mockFs.mkdir.mockResolvedValue(undefined);
  });

  describe("initialization", () => {
    test("successfully initializes with new manifest", async () => {
      // Mock file not found for manifest load
      const error = new Error("File not found");
      (error as NodeJS.ErrnoException).code = "ENOENT";
      mockFs.readFile.mockRejectedValueOnce(error);

      await manager.initialize(pageId);
      const manifest = manager.getManifest();

      // Verify directory creation
      expect(mockFs.mkdir).toHaveBeenCalledWith(path.join(baseDir, mediaDir), {
        recursive: true,
      });

      // Verify manifest structure
      expect(manifest).toEqual({
        pageId,
        lastUpdated: expect.any(String),
        mediaEntries: {},
      });
    });

    test("successfully loads existing manifest", async () => {
      const existingManifest: MediaManifest = {
        pageId,
        lastUpdated: "2024-01-19T00:00:00.000Z",
        mediaEntries: {
          [blockId]: {
            mediaInfo: testMediaInfo,
            lastEdited: testInput.lastEdited,
            createdAt: "2024-01-19T00:00:00.000Z",
            updatedAt: "2024-01-19T00:00:00.000Z",
          },
        },
      };
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingManifest));

      await manager.initialize(pageId);
      const manifest = manager.getManifest();

      expect(manifest).toEqual(existingManifest);
    });

    test("throws ManifestIOError when directory creation fails", async () => {
      const originalError = new Error("Permission denied");
      mockFs.mkdir.mockRejectedValue(originalError);

      try {
        await manager.initialize(pageId);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ManifestIOError);
        expect((error as ManifestIOError).cause).toBe(originalError);
      }
    });

    test("throws ManifestIOError for unexpected manifest load failures", async () => {
      mockFs.readFile.mockRejectedValue(new Error("Unexpected error"));

      await expect(manager.initialize(pageId)).rejects.toBeInstanceOf(
        ManifestIOError,
      );
    });

    test("resets state when initialization fails", async () => {
      mockFs.mkdir.mockRejectedValue(new Error("Failed"));

      try {
        await manager.initialize(pageId);
      } catch (error) {
        expect(() => manager.getManifest()).toThrow(MediaManifestStateError);
      }
    });
  });

  describe("entry management", () => {
    beforeEach(async () => {
      jest.useFakeTimers();

      const error = new Error("File not found");
      (error as NodeJS.ErrnoException).code = "ENOENT";
      mockFs.readFile.mockRejectedValueOnce(error);
      await manager.initialize(pageId);
    });

    afterEach(() => {
      // Clean up timer mocks
      jest.useRealTimers();
    });

    test("creates new media entry with timestamps", async () => {
      await manager.updateEntry(blockId, testInput);
      const entry = manager.getEntry(blockId);

      expect(entry).toEqual({
        ...testInput,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    test("updates existing entry preserving createdAt", async () => {
      await manager.updateEntry(blockId, testInput);
      const originalEntry = manager.getEntry(blockId);

      jest.advanceTimersByTime(1000);

      const updatedInput = {
        ...testInput,
        mediaInfo: { ...testInput.mediaInfo, localPath: "/updated/path.jpg" },
      };
      await manager.updateEntry(blockId, updatedInput);
      const updatedEntry = manager.getEntry(blockId);

      expect(updatedEntry.createdAt).toBe(originalEntry.createdAt);
      expect(updatedEntry.updatedAt).not.toBe(originalEntry.updatedAt);
      expect(updatedEntry.mediaInfo.localPath).toBe("/updated/path.jpg");
    });

    test("throws MediaEntryNotFoundError for non-existent entry", () => {
      expect(() => manager.getEntry("non-existent")).toThrow(
        MediaEntryNotFoundError,
      );
    });

    test("removes entry and updates lastUpdated", () => {
      manager.updateEntry(blockId, testInput);
      const beforeRemove = manager.getManifest().lastUpdated;

      jest.advanceTimersByTime(1000);
      manager.removeEntry(blockId);

      const manifest = manager.getManifest();
      expect(manifest.mediaEntries[blockId]).toBeUndefined();
      expect(manifest.lastUpdated).not.toBe(beforeRemove);
    });
  });

  describe("save operations", () => {
    beforeEach(async () => {
      const error = new Error("File not found");
      (error as NodeJS.ErrnoException).code = "ENOENT";
      mockFs.readFile.mockRejectedValueOnce(error);
      await manager.initialize(pageId);
    });

    test("saves manifest with correct path and content", async () => {
      await manager.updateEntry(blockId, testInput);
      await manager.save();

      const expectedPath = path.join(baseDir, mediaDir, `${pageId}_media.json`);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        expect.any(String),
        "utf-8",
      );

      const savedContent = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(savedContent).toEqual({
        pageId,
        lastUpdated: expect.any(String),
        mediaEntries: {
          [blockId]: {
            mediaInfo: testMediaInfo,
            lastEdited: testInput.lastEdited,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
      });
    });

    test("throws ManifestIOError when save fails", async () => {
      const originalError = new Error("Write failed");
      mockFs.writeFile.mockRejectedValue(originalError);

      try {
        await manager.save();
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ManifestIOError);
        expect((error as ManifestIOError).cause).toBe(originalError);
      }
    });
  });
});
