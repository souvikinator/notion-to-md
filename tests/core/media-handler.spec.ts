import { MediaHandler } from "../../src/core/media-handler";
import { DirectStrategy } from "../../src/core/media-handler/strategies/direct";
import { DownloadStrategy } from "../../src/core/media-handler/strategies/download";
import { UploadStrategy } from "../../src/core/media-handler/strategies/upload";
import * as fs from "fs/promises";
import * as path from "path";

// Mock fetch for testing
jest.mock("node-fetch", () =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      buffer: () => Buffer.from("test-content"),
      headers: new Map([["content-type", "image/jpeg"]]),
    }),
  ),
);

describe("Media Handler System", () => {
  // Test constants and fixtures
  const TEST_PAGE_ID = "test-page-123";
  const TEST_OUTPUT_DIR = path.join(".notion-to-md", "test-output");
  const TEST_MANIFEST_DIR = ".notion-to-md";

  // Sample test blocks
  const createTestBlock = (
    id: string,
    type: string,
    url: string,
    isExternal = false,
  ) => ({
    id,
    type,
    last_edited_time: new Date().toISOString(),
    has_children: false,
    [type]: {
      type: isExternal ? "external" : "file",
      [isExternal ? "external" : "file"]: {
        url,
      },
    },
  });

  // Clean up test directories before each test
  beforeEach(async () => {
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
      await fs.rm(TEST_MANIFEST_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors if directories don't exist
    }
  });

  describe("DirectStrategy Tests", () => {
    test("should preserve external URLs when configured", async () => {
      const directStrategy = new DirectStrategy({
        preserveExternalUrls: true,
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: directStrategy,
        mediaTypes: ["image"],
      });

      const testBlocks = [
        createTestBlock(
          "block1",
          "image",
          "https://external.com/image.jpg",
          true,
        ),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: testBlocks,
        properties: {},
        comments: [],
      });

      // @ts-ignore
      expect(testBlocks[0].image.external.url).toBe(
        "https://external.com/image.jpg",
      );
    });

    test("should track media in manifest", async () => {
      const directStrategy = new DirectStrategy({});
      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: directStrategy,
      });

      const testBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: testBlocks,
        properties: {},
        comments: [],
      });

      // Verify manifest was created and contains the entry
      const manifestContent = await fs.readFile(
        path.join(TEST_MANIFEST_DIR, `${TEST_PAGE_ID}.media-manifest.json`),
        "utf-8",
      );
      const manifest = JSON.parse(manifestContent);

      expect(manifest.entries.block1).toBeTruthy();
      expect(manifest.entries.block1.strategy).toBe("direct");
    });
  });

  describe("DownloadStrategy Tests", () => {
    test("should download and store media files", async () => {
      const downloadStrategy = new DownloadStrategy({
        outputPath: TEST_OUTPUT_DIR,
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: downloadStrategy,
      });

      const testBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: testBlocks,
        properties: {},
        comments: [],
      });

      // Verify file was downloaded
      const files = await fs.readdir(TEST_OUTPUT_DIR);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/block1\.(jpg|jpeg)/);
    });

    test("should clean up orphaned files", async () => {
      const downloadStrategy = new DownloadStrategy({
        outputPath: TEST_OUTPUT_DIR,
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: downloadStrategy,
      });

      // First process with two blocks
      const initialBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
        createTestBlock("block2", "image", "https://notion.so/image2.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: initialBlocks,
        properties: {},
        comments: [],
      });

      // Then process with only one block
      const updatedBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: updatedBlocks,
        properties: {},
        comments: [],
      });

      // Verify only one file remains
      const files = await fs.readdir(TEST_OUTPUT_DIR);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/block1\.(jpg|jpeg)/);
    });

    test("should handle outdated content", async () => {
      const downloadStrategy = new DownloadStrategy({
        outputPath: TEST_OUTPUT_DIR,
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: downloadStrategy,
      });

      // Process initial content
      const block = createTestBlock(
        "block1",
        "image",
        "https://notion.so/image1.jpg",
      );
      await handler.processContent({
        // @ts-ignore
        blocks: [block],
        properties: {},
        comments: [],
      });

      // Update the block's last_edited_time
      const updatedBlock = {
        ...block,
        last_edited_time: new Date(Date.now() + 1000).toISOString(),
      };

      // Process updated content
      await handler.processContent({
        // @ts-ignore
        blocks: [updatedBlock],
        properties: {},
        comments: [],
      });

      // Verify only one file exists (old one was replaced)
      const files = await fs.readdir(TEST_OUTPUT_DIR);
      expect(files).toHaveLength(1);
    });
  });

  describe("UploadStrategy Tests", () => {
    test("should upload media and track in manifest", async () => {
      const uploadedUrls = new Set<string>();
      const uploadStrategy = new UploadStrategy({
        uploadHandler: async (mediaInfo) => {
          const uploadedUrl = `https://cdn.example.com/${mediaInfo.blockId}`;
          uploadedUrls.add(uploadedUrl);
          return uploadedUrl;
        },
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: uploadStrategy,
      });

      const testBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: testBlocks,
        properties: {},
        comments: [],
      });

      // Verify URL was uploaded and updated
      expect(uploadedUrls.has("https://cdn.example.com/block1")).toBe(true);
      // @ts-ignore
      expect(testBlocks[0].image.file.url).toBe(
        "https://cdn.example.com/block1",
      );
    });

    test("should clean up removed media", async () => {
      const uploadedUrls = new Set<string>();
      const deletedUrls = new Set<string>();

      const uploadStrategy = new UploadStrategy({
        uploadHandler: async (mediaInfo) => {
          const uploadedUrl = `https://cdn.example.com/${mediaInfo.blockId}`;
          uploadedUrls.add(uploadedUrl);
          return uploadedUrl;
        },
        cleanupHandler: async (mediaInfo) => {
          deletedUrls.add(mediaInfo.originalPath);
        },
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: uploadStrategy,
      });

      // First process with two blocks
      const initialBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
        createTestBlock("block2", "image", "https://notion.so/image2.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: initialBlocks,
        properties: {},
        comments: [],
      });

      // Then process with only one block
      const updatedBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      await handler.processContent({
        // @ts-ignore
        blocks: updatedBlocks,
        properties: {},
        comments: [],
      });

      // Verify cleanup was called for removed block
      expect(deletedUrls.has("https://cdn.example.com/block2")).toBe(true);
    });
  });

  describe("Error Handling Tests", () => {
    test("should handle download failures gracefully", async () => {
      // Mock fetch to simulate failure
      const fetch = require("node-fetch");
      fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Download failed")),
      );

      const downloadStrategy = new DownloadStrategy({
        outputPath: TEST_OUTPUT_DIR,
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: downloadStrategy,
      });

      const testBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      // Should not throw
      await expect(
        handler.processContent({
          // @ts-ignore
          blocks: testBlocks,
          properties: {},
          comments: [],
        }),
      ).resolves.not.toThrow();

      // Should fall back to original URL
      // @ts-ignore
      expect(testBlocks[0].image.file.url).toBe("https://notion.so/image1.jpg");
    });

    test("should handle cleanup failures gracefully", async () => {
      const downloadStrategy = new DownloadStrategy({
        outputPath: TEST_OUTPUT_DIR,
      });

      const handler = new MediaHandler({
        pageId: TEST_PAGE_ID,
        strategy: downloadStrategy,
      });

      // Create an unreadable file
      const filePath = path.join(TEST_OUTPUT_DIR, "block1.jpg");
      await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
      await fs.writeFile(filePath, "test");
      await fs.chmod(filePath, 0o000);

      const testBlocks = [
        createTestBlock("block1", "image", "https://notion.so/image1.jpg"),
      ];

      // Should not throw during cleanup
      await expect(
        handler.processContent({
          // @ts-ignore
          blocks: testBlocks,
          properties: {},
          comments: [],
        }),
      ).resolves.not.toThrow();
    });
  });
});
