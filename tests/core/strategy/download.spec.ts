import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";
import mime from "mime-types";
import {
  DownloadStrategyConfig,
  MediaInfo,
  MediaInfoType,
  MediaManifestEntry,
  MediaStrategy,
  ListBlockChildrenResponseResult,
} from "../../../src/types";
import { DownloadStrategy } from "../../../src/core/media-handler/strategies/download";

jest.mock("node-fetch");
jest.mock("fs/promises");
jest.mock("mime-types");

describe("DownloadStrategy", () => {
  const mockConfig = {
    outputDir: "./public/media",
    transformPath: (path: string) => `/media/${path.split("/").pop()}`,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Media URL Extraction", () => {
    test("extracts external URL from media blocks", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const blocks = [
        {
          id: "block1",
          type: "image",
          image: {
            type: "external",
            external: { url: "https://example.com/image.png" },
          },
        },
        {
          id: "block2",
          type: "video",
          video: {
            type: "external",
            external: { url: "https://example.com/video.mp4" },
          },
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        // @ts-ignore
        expect(result.originalUrl).toBe(block[block.type].external.url);
      }
    });

    test("extracts Notion file URL from media blocks", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const blocks = [
        {
          id: "block1",
          type: "image",
          image: {
            type: "file",
            file: { url: "https://notion.so/image.png" },
          },
        },
        {
          id: "block2",
          type: "pdf",
          pdf: {
            type: "file",
            file: { url: "https://notion.so/doc.pdf" },
          },
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        // @ts-ignore
        expect(result.originalUrl).toBe(block[block.type].file.url);
      }
    });

    test("handles malformed media blocks gracefully", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const blocks = [
        {
          id: "block1",
          type: "image",
          image: {}, // Missing type and URL
        },
        {
          id: "block2",
          type: "video",
          video: {
            type: "external",
            // Missing external.url
          },
        },
        {
          id: "block3",
          type: "unsupported",
          // Completely invalid block type
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe("");
      }
    });
  });

  describe("Download and Storage", () => {
    test("successfully downloads and stores media", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "file",
          file: { url: "https://notion.so/image.png" },
        },
      };

      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/png" },
        buffer: () => Promise.resolve(Buffer.from("test")),
      });
      (mime.extension as jest.Mock).mockReturnValue("png");

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DOWNLOAD);
      expect(result.localPath).toBeDefined();
      expect(result.mimeType).toBe("image/png");
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test("falls back to DIRECT on download failure", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "file",
          file: { url: "https://notion.so/image.png" },
        },
      };

      (fetch as unknown as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DIRECT);
      expect(result.originalUrl).toBe("https://notion.so/image.png");
    });

    test("falls back to DIRECT on invalid MIME type", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "file",
          file: { url: "https://notion.so/image.png" },
        },
      };

      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "invalid/type" },
        buffer: () => Promise.resolve(Buffer.from("test")),
      });
      (mime.extension as jest.Mock).mockReturnValue(false);

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DIRECT);
      expect(result.originalUrl).toBe("https://notion.so/image.png");
    });
  });

  describe("External URL Preservation", () => {
    test("preserves external URLs when configured", async () => {
      const strategy = new DownloadStrategy({
        ...mockConfig,
        preserveExternalUrls: true,
      });

      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "external",
          external: { url: "https://example.com/image.png" },
        },
      };

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DIRECT);
      expect(result.originalUrl).toBe("https://example.com/image.png");
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("Path Transformation", () => {
    test("applies custom path transformation", async () => {
      const customTransform = (path: string) =>
        `/custom/${path.split("/").pop()}`;
      const strategy = new DownloadStrategy({
        ...mockConfig,
        transformPath: customTransform,
      });

      const mediaInfo = {
        type: MediaInfoType.DOWNLOAD as const,
        originalUrl: "https://notion.so/image.png",
        localPath: "/local/path/image.png",
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toMatch(/^\/custom\//);
    });

    test("provides default path transformation", async () => {
      const strategy = new DownloadStrategy({
        outputDir: "/output/dir",
      });

      const mediaInfo = {
        type: MediaInfoType.DOWNLOAD as const,
        originalUrl: "https://notion.so/image.png",
        localPath: "/output/dir/image.png",
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toBe("image.png");
    });

    test("returns original URL for DIRECT type", async () => {
      const strategy = new DownloadStrategy(mockConfig);

      const mediaInfo = {
        type: MediaInfoType.DIRECT as const,
        originalUrl: "https://example.com/image.png",
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toBe("https://example.com/image.png");
    });
  });

  describe("Cleanup", () => {
    test("cleans up downloaded files", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entry = {
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          originalUrl: "https://notion.so/image.png",
          localPath: "/output/dir/image.png",
        },
        lastEdited: "2024-01-19",
        createdAt: "2024-01-19",
        updatedAt: "2024-01-19",
      };

      await strategy.cleanup(entry);
      expect(fs.unlink).toHaveBeenCalledWith("/output/dir/image.png");
    });

    test("handles missing files gracefully", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entry = {
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          originalUrl: "https://notion.so/image.png",
          localPath: "/output/dir/image.png",
        },
        lastEdited: "2024-01-19",
        createdAt: "2024-01-19",
        updatedAt: "2024-01-19",
      };

      (fs.unlink as jest.Mock).mockRejectedValueOnce({ code: "ENOENT" });

      await expect(strategy.cleanup(entry)).resolves.not.toThrow();
    });

    test("ignores cleanup for DIRECT type", async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entry = {
        mediaInfo: {
          type: MediaInfoType.DIRECT,
          originalUrl: "https://example.com/image.png",
        },
        lastEdited: "2024-01-19",
        createdAt: "2024-01-19",
        updatedAt: "2024-01-19",
      };

      await strategy.cleanup(entry);
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  describe("Configuration", () => {
    test("requires outputDir", () => {
      expect(() => new DownloadStrategy({} as any)).toThrow();
    });
  });
});
