import { jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { PageReferenceManifestManager } from "../../../src/utils/manifest-manager/page";
import {
  ManifestIOError,
  ManifestNotFoundError,
  PageReferenceError,
  PageReferenceNotFoundError,
  PageReferenceStateError,
} from "../../../src/utils/manifest-manager/errors";

describe("PageReferenceManifestManager", () => {
  let manager: PageReferenceManifestManager;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-reference-test-"));
    manager = new PageReferenceManifestManager(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("initialization", () => {
    test("creates directory and manifest with correct structure", async () => {
      // Initialize manager - this should create directory and default manifest
      await manager.initialize();

      // Verify directory creation
      const dirExists = await fs
        .access(path.join(tempDir, "ref"))
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);

      // Force a save to ensure manifest file exists
      await manager.save();

      const manifestPath = path.join(tempDir, "ref", "page_ref.json");
      const content = await fs.readFile(manifestPath, "utf8");
      const manifest = JSON.parse(content);

      expect(manifest).toEqual({
        lastUpdated: expect.any(String),
        references: {},
      });
    });

    test("loads existing manifest correctly", async () => {
      // Create and populate a manifest
      await manager.initialize();
      await manager.updateEntry("page-123", {
        notionUrl: "https://notion.so/page",
        siteUrl: "https://site.com/page",
        lastUpdated: new Date().toISOString(),
      });
      await manager.save();

      // Create new manager and initialize
      const newManager = new PageReferenceManifestManager(tempDir);
      await newManager.initialize();

      const entry = newManager.getEntry("page-123");
      expect(entry.notionUrl).toBe("https://notion.so/page");
      expect(entry.siteUrl).toBe("https://site.com/page");
    });

    test("throws ManifestIOError when directory creation fails", async () => {
      // Mock fs.mkdir to fail
      const error = new Error("Permission denied");
      jest.spyOn(fs, "mkdir").mockRejectedValueOnce(error);

      await expect(manager.initialize()).rejects.toBeInstanceOf(
        ManifestIOError,
      );
    });

    test("preserves error cause when initialization fails", async () => {
      const originalError = new Error("Permission denied");
      jest.spyOn(fs, "mkdir").mockRejectedValueOnce(originalError);

      try {
        await manager.initialize();
      } catch (error) {
        expect(error).toBeInstanceOf(ManifestIOError);
        expect((error as ManifestIOError).cause).toBe(originalError);
      }
    });
  });

  describe("entry management", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test("creates new entry with correct structure", async () => {
      const entry = {
        notionUrl: "https://notion.so/page-123",
        siteUrl: "https://site.com/page-123",
        lastUpdated: new Date().toISOString(),
      };

      await manager.updateEntry("page-123", entry);
      const savedEntry = manager.getEntry("page-123");

      expect(savedEntry).toEqual(entry);
    });

    test("updates existing entry", async () => {
      const pageId = "page-123";
      const originalEntry = {
        notionUrl: "https://notion.so/old",
        siteUrl: "https://site.com/old",
        lastUpdated: new Date().toISOString(),
      };

      await manager.updateEntry(pageId, originalEntry);

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedEntry = {
        ...originalEntry,
        siteUrl: "https://site.com/new",
        lastUpdated: new Date().toISOString(),
      };

      await manager.updateEntry(pageId, updatedEntry);
      const savedEntry = manager.getEntry(pageId);

      expect(savedEntry.siteUrl).toBe("https://site.com/new");
      expect(savedEntry.lastUpdated).not.toBe(originalEntry.lastUpdated);
    });

    test("throws PageReferenceNotFoundError for non-existent entry", () => {
      expect(() => manager.getEntry("non-existent")).toThrow(
        PageReferenceNotFoundError,
      );
    });

    test("correctly checks entry existence", async () => {
      const entry = {
        notionUrl: "https://notion.so/page",
        siteUrl: "https://site.com/page",
        lastUpdated: new Date().toISOString(),
      };

      await manager.updateEntry("page-123", entry);

      expect(manager.hasEntry("page-123")).toBe(true);
      expect(manager.hasEntry("non-existent")).toBe(false);
    });

    test("removes entry correctly", async () => {
      const pageId = "page-123";
      const entry = {
        notionUrl: "https://notion.so/page",
        siteUrl: "https://site.com/page",
        lastUpdated: new Date().toISOString(),
      };

      await manager.updateEntry(pageId, entry);
      manager.removeEntry(pageId);

      expect(manager.hasEntry(pageId)).toBe(false);
      expect(() => manager.getEntry(pageId)).toThrow(
        PageReferenceNotFoundError,
      );
    });
  });

  describe("bulk operations", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test("returns all entries correctly", async () => {
      const entries = {
        "page-1": {
          notionUrl: "https://notion.so/page-1",
          siteUrl: "https://site.com/page-1",
          lastUpdated: new Date().toISOString(),
        },
        "page-2": {
          notionUrl: "https://notion.so/page-2",
          siteUrl: "https://site.com/page-2",
          lastUpdated: new Date().toISOString(),
        },
      };

      await Promise.all(
        Object.entries(entries).map(([id, entry]) =>
          manager.updateEntry(id, entry),
        ),
      );

      const allEntries = manager.getAllEntries();
      expect(allEntries).toEqual(entries);
    });
  });

  describe("state validation", () => {
    test("throws PageReferenceStateError when accessing before initialization", () => {
      expect(() => manager.getEntry("any")).toThrow(PageReferenceStateError);
    });

    test("throws PageReferenceStateError when updating before initialization", async () => {
      const entry = {
        notionUrl: "https://notion.so/page",
        siteUrl: "https://site.com/page",
        lastUpdated: new Date().toISOString(),
      };

      await expect(manager.updateEntry("any", entry)).rejects.toBeInstanceOf(
        PageReferenceStateError,
      );
    });

    test("throws PageReferenceStateError when removing before initialization", () => {
      expect(() => manager.removeEntry("any")).toThrow(PageReferenceStateError);
    });

    test("throws PageReferenceStateError when saving before initialization", async () => {
      await expect(manager.save()).rejects.toBeInstanceOf(
        PageReferenceStateError,
      );
    });
  });

  describe("save operations", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test("saves manifest with correct structure", async () => {
      const entry = {
        notionUrl: "https://notion.so/page",
        siteUrl: "https://site.com/page",
        lastUpdated: new Date().toISOString(),
      };

      await manager.updateEntry("page-123", entry);
      await manager.save();

      const manifestPath = path.join(tempDir, "ref", "page_ref.json");
      const content = await fs.readFile(manifestPath, "utf8");
      const manifest = JSON.parse(content);

      expect(manifest).toEqual({
        lastUpdated: expect.any(String),
        references: {
          "page-123": entry,
        },
      });
    });

    test("throws ManifestIOError when save fails", async () => {
      jest
        .spyOn(fs, "writeFile")
        .mockRejectedValueOnce(new Error("Write failed"));
      await expect(manager.save()).rejects.toBeInstanceOf(ManifestIOError);
    });
  });
});
