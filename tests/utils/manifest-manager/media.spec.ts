import { jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { MediaManifestManager } from "../../../src/utils/manifest-manager/media";
import {
  MediaManifestEntry,
  MediaManifestInput,
} from "../../../src/types/media";

describe("MediaManifestManager", () => {
  let manager: MediaManifestManager;
  let tempDir: string;

  // Before each test, create a temporary directory and initialize the manager
  beforeEach(async () => {
    const pageId = "page-123";
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-manifest-test-"));
    manager = new MediaManifestManager(tempDir);
    await manager.initialize();
    await manager.initializeForPage(pageId);
  });

  // Clean up after each test
  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("Media Entry Management", () => {
    test("creates new media entry with required fields", async () => {
      const blockId = "block-123";
      const input: MediaManifestInput = {
        mediaInfo: {
          type: "download",
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/image.jpg",
          mimeType: "image/jpeg",
        },
        lastEdited: new Date().toISOString(),
      };

      await manager.updateMediaEntry(blockId, input);

      const savedEntry = manager.getMediaEntry(blockId);

      expect(savedEntry).toBeDefined();
      expect(savedEntry?.mediaInfo).toEqual(input.mediaInfo);
      expect(savedEntry?.lastEdited).toBe(input.lastEdited);
      expect(savedEntry?.createdAt).toBeDefined();
      expect(savedEntry?.updatedAt).toBeDefined();
    });

    test("updates existing entry while preserving creation timestamp", async () => {
      const blockId = "block-123";
      const originalInput: MediaManifestInput = {
        mediaInfo: {
          type: "download",
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/image.jpg",
          mimeType: "image/jpeg",
        },
        lastEdited: "2024-01-01T00:00:00.000Z",
      };

      await manager.updateMediaEntry(blockId, originalInput);
      const firstSave = manager.getMediaEntry(blockId);

      const updatedEntry: MediaManifestInput = {
        ...originalInput,
        mediaInfo: {
          ...originalInput.mediaInfo,
          localPath: "/path/to/new-image.jpg",
        },
        lastEdited: "2024-01-02T00:00:00.000Z",
      };

      await new Promise((resolve) => setTimeout(resolve, 100));
      await manager.updateMediaEntry(blockId, updatedEntry);

      const savedEntry = manager.getMediaEntry(blockId);
      expect(savedEntry).toBeDefined();
      expect(savedEntry?.mediaInfo).toEqual(updatedEntry.mediaInfo);
      expect(savedEntry?.createdAt).toBe(firstSave?.createdAt);
      expect(savedEntry?.updatedAt).not.toBe(firstSave?.updatedAt);
    });

    test("removes specified entries from manifest", async () => {
      // Given existing entries
      const blockId1 = "block-123";
      const blockId2 = "block-456";
      const entry: MediaManifestInput = {
        mediaInfo: {
          type: "download",
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/image.jpg",
          mimeType: "image/jpeg",
        },
        lastEdited: new Date().toISOString(),
      };

      await manager.updateMediaEntry(blockId1, entry);
      await manager.updateMediaEntry(blockId2, entry);

      // When removing one entry
      await manager.removeMediaEntry(blockId1);

      // Then verify the removal
      const removedEntry = manager.getMediaEntry(blockId1);
      const remainingEntry = manager.getMediaEntry(blockId2);

      expect(removedEntry).toBeUndefined();
      expect(remainingEntry).toBeDefined();
    });

    test("handles missing entries gracefully", async () => {
      const entry = manager.getMediaEntry("non-existent");

      expect(entry).toBeUndefined();
    });

    test("maintains lastUpdated timestamp on modifications", async () => {
      const blockId = "block-123";
      const entry: MediaManifestInput = {
        mediaInfo: {
          type: "download",
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/image.jpg",
          mimeType: "image/jpeg",
        },
        lastEdited: new Date().toISOString(),
      };

      await manager.updateMediaEntry(blockId, entry);
      const firstSave = manager.getMediaEntry(blockId);

      // Wait a bit to ensure timestamps will be different
      await new Promise((resolve) => setTimeout(resolve, 100));

      // When updating the entry
      await manager.updateMediaEntry(blockId, {
        ...entry,
        lastEdited: new Date().toISOString(),
      });

      // Then verify the timestamp was updated
      const updatedEntry = manager.getMediaEntry(blockId);
      expect(updatedEntry?.updatedAt).not.toBe(firstSave?.updatedAt);
    });
  });

  describe("Manifest File Operations", () => {
    test("creates new page manifest with correct structure", async () => {
      // Given a new page ID
      const pageId = "page-123";
      await manager.initializeForPage(pageId);

      // When checking the manifest file
      const manifestPath = path.join(tempDir, `${pageId}.json`);
      const manifestExists = await fs
        .access(manifestPath)
        .then(() => true)
        .catch(() => false);

      // Then verify the file exists and has correct structure
      expect(manifestExists).toBe(true);

      const content = await fs.readFile(manifestPath, "utf8");
      const manifest = JSON.parse(content);

      expect(manifest).toEqual({
        pageId,
        lastUpdated: expect.any(String),
        mediaEntries: {},
      });
    });

    test("maintains separate manifests for different pages", async () => {
      // Given two different pages
      const pageId1 = "page-123";
      const pageId2 = "page-456";
      const entry: MediaManifestInput = {
        mediaInfo: {
          type: "download",
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/image.jpg",
          mimeType: "image/jpeg",
        },
        lastEdited: new Date().toISOString(),
      };

      // When adding entries to different pages
      await manager.initializeForPage(pageId1);
      await manager.updateMediaEntry("block-1", entry);

      await manager.initializeForPage(pageId2);
      await manager.updateMediaEntry("block-2", entry);

      // Then verify entries are separate
      await manager.initializeForPage(pageId1);
      const entry1 = manager.getMediaEntry("block-1");
      const noEntry2InPage1 = manager.getMediaEntry("block-2");

      await manager.initializeForPage(pageId2);
      const entry2 = manager.getMediaEntry("block-2");
      const noEntry1InPage2 = manager.getMediaEntry("block-1");

      expect(entry1).toBeDefined();
      expect(entry2).toBeDefined();
      expect(noEntry2InPage1).toBeUndefined();
      expect(noEntry1InPage2).toBeUndefined();
    });

    test("loads existing page manifest correctly", async () => {
      // Given an existing manifest with content
      const pageId = "page-123";
      const blockId = "block-123";
      const entry: MediaManifestInput = {
        mediaInfo: {
          type: "download",
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/image.jpg",
          mimeType: "image/jpeg",
        },
        lastEdited: new Date().toISOString(),
      };

      // When creating and then reloading the manifest
      await manager.initializeForPage(pageId);
      await manager.updateMediaEntry(blockId, entry);

      // Create a new manager instance to force reload
      const newManager = new MediaManifestManager(tempDir);
      await newManager.initialize();
      await newManager.initializeForPage(pageId);

      // Then verify the content is preserved
      const loadedEntry = newManager.getMediaEntry(blockId);
      expect(loadedEntry?.mediaInfo).toEqual(entry.mediaInfo);
    });
  });
});
