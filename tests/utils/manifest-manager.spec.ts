// manifest-manager.spec.ts
import {
  ManifestManager,
  MediaInfoType,
} from "../../src/utils/manifest-manager";
import * as fs from "fs/promises";
import * as path from "path";

// Mock fs promises
jest.mock("fs/promises");

describe("ManifestManager", () => {
  let manifestManager: ManifestManager;
  const TEST_PAGE_ID = "test-page-123";

  beforeEach(() => {
    manifestManager = new ManifestManager(TEST_PAGE_ID);
    // Reset mocks
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("creates manifest directory if it does not exist", async () => {
      await manifestManager.initialize();
      expect(fs.mkdir).toHaveBeenCalledWith(".notion-to-md", {
        recursive: true,
      });
    });

    test("loads existing manifest if available", async () => {
      const mockManifest = {
        pageId: TEST_PAGE_ID,
        lastUpdated: "2024-01-01",
        mediaEntries: {},
        pageReferences: {},
      };

      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockManifest),
      );

      await manifestManager.initialize();

      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(".notion-to-md", `${TEST_PAGE_ID}.manifest.json`),
        "utf-8",
      );
    });

    test("creates new manifest if none exists", async () => {
      (fs.readFile as jest.Mock).mockRejectedValueOnce(
        new Error("File not found"),
      );

      await manifestManager.initialize();

      // Should still create directory
      expect(fs.mkdir).toHaveBeenCalled();

      // No error should be thrown
      await expect(manifestManager.initialize()).resolves.not.toThrow();
    });
  });

  describe("media entries", () => {
    beforeEach(async () => {
      await manifestManager.initialize();
    });

    test("updates media entry", () => {
      const entry = {
        lastEdited: "2024-01-01",
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          localPath: "/path/to/file.jpg",
        },
      };

      manifestManager.updateMediaEntry("block-123", entry);

      expect(manifestManager.getMediaEntry("block-123")).toEqual(entry);
    });

    test("returns undefined for non-existent media entry", () => {
      expect(manifestManager.getMediaEntry("non-existent")).toBeUndefined();
    });
  });

  describe("page references", () => {
    beforeEach(async () => {
      await manifestManager.initialize();
    });

    test("updates page reference", () => {
      const entry = {
        notionUrl: "https://notion.so/page-123",
        siteUrl: "/docs/getting-started",
        lastUpdated: "2024-01-01",
      };

      manifestManager.updatePageReference("page-123", entry);

      expect(manifestManager.getPageReference("page-123")).toEqual(entry);
    });

    test("returns undefined for non-existent page reference", () => {
      expect(manifestManager.getPageReference("non-existent")).toBeUndefined();
    });
  });

  describe("saving manifest", () => {
    test("saves current manifest state to file", async () => {
      await manifestManager.initialize();

      // Add some entries
      manifestManager.updateMediaEntry("block-123", {
        lastEdited: "2024-01-01",
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          localPath: "/path/to/file.jpg",
        },
      });

      manifestManager.updatePageReference("page-123", {
        notionUrl: "https://notion.so/page-123",
        siteUrl: "/docs/getting-started",
        lastUpdated: "2024-01-01",
      });

      await manifestManager.saveManifest();

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(".notion-to-md", `${TEST_PAGE_ID}.manifest.json`),
        expect.any(String), // We'll verify it's valid JSON
      );

      // Verify the written content is valid JSON with expected structure
      const writtenContent = JSON.parse(
        (fs.writeFile as jest.Mock).mock.calls[0][1],
      );

      expect(writtenContent).toHaveProperty("pageId", TEST_PAGE_ID);
      expect(writtenContent).toHaveProperty("lastUpdated");
      expect(writtenContent).toHaveProperty("mediaEntries");
      expect(writtenContent).toHaveProperty("pageReferences");
    });
  });
});
