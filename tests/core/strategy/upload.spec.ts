import { MediaInfoType, MediaManifestEntry } from "../../../src/types";
import { UploadStrategy } from "../../../src/core/media-handler/strategies/upload";

describe("UploadStrategy", () => {
  const mockUploadHandler = jest.fn();
  const mockCleanupHandler = jest.fn();

  const mockConfig = {
    uploadHandler: mockUploadHandler,
    cleanupHandler: mockCleanupHandler,
    transformPath: (url: string) =>
      `https://cdn.example.com/${url.split("/").pop()}`,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Configuration", () => {
    test("requires uploadHandler in configuration", () => {
      expect(() => new UploadStrategy({} as any)).toThrow();
    });

    test("accepts optional config parameters", () => {
      expect(
        () =>
          new UploadStrategy({
            uploadHandler: mockUploadHandler,
          }),
      ).not.toThrow();
    });
  });

  describe("Media URL Extraction", () => {
    test("extracts external URLs from different media blocks", async () => {
      const strategy = new UploadStrategy(mockConfig);
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

      mockUploadHandler.mockImplementation(
        (url) => `https://cdn.example.com/${url.split("/").pop()}`,
      );

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        // @ts-ignore
        expect(result.originalUrl).toBe(block[block.type].external.url);
        expect(result.type).toBe(MediaInfoType.UPLOAD);
      }
    });

    test("extracts Notion URLs from different media blocks", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const blocks = [
        {
          id: "block1",
          type: "image",
          image: {
            type: "file",
            file: { url: "https://prod-files.notion-static.com/image.png" },
          },
        },
        {
          id: "block2",
          type: "pdf",
          pdf: {
            type: "file",
            file: { url: "https://prod-files.notion-static.com/doc.pdf" },
          },
        },
      ];

      mockUploadHandler.mockImplementation(
        (url) => `https://cdn.example.com/${url.split("/").pop()}`,
      );

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        // @ts-ignore
        expect(result.originalUrl).toBe(block[block.type].file.url);
        expect(result.type).toBe(MediaInfoType.UPLOAD);
      }
    });

    test("handles malformed media blocks gracefully", async () => {
      const strategy = new UploadStrategy(mockConfig);
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
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe("");
      }
    });
  });

  describe("Upload Functionality", () => {
    test("successfully uploads media and returns upload info", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "file",
          file: { url: "https://prod-files.notion-static.com/image.png" },
        },
      };

      const uploadedUrl = "https://cdn.example.com/image.png";
      mockUploadHandler.mockResolvedValueOnce(uploadedUrl);

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.UPLOAD);
      expect(result.uploadedUrl).toBe(uploadedUrl);
      expect(mockUploadHandler).toHaveBeenCalled();
    });

    test("falls back to DIRECT on upload failure", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "file",
          file: { url: "https://prod-files.notion-static.com/image.png" },
        },
      };

      mockUploadHandler.mockRejectedValueOnce(new Error("Upload failed"));

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DIRECT);
      expect(result.originalUrl).toBe(block.image.file.url);
    });

    test("falls back to DIRECT when upload handler returns falsy value", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const block = {
        id: "block1",
        type: "image",
        image: {
          type: "file",
          file: { url: "https://prod-files.notion-static.com/image.png" },
        },
      };

      mockUploadHandler.mockResolvedValueOnce("");

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DIRECT);
      expect(result.originalUrl).toBe(block.image.file.url);
    });
  });

  describe("URL Preservation", () => {
    test("preserves external URLs when configured", async () => {
      const strategy = new UploadStrategy({
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
      expect(result.originalUrl).toBe(block.image.external.url);
      expect(mockUploadHandler).not.toHaveBeenCalled();
    });
  });

  describe("URL Transformation", () => {
    test("applies custom path transformation", async () => {
      const strategy = new UploadStrategy(mockConfig);

      const mediaInfo = {
        type: MediaInfoType.UPLOAD as const,
        originalUrl: "https://notion.so/image.png",
        uploadedUrl: "https://storage.example.com/image.png",
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toMatch(/^https:\/\/cdn\.example\.com\//);
    });

    test("returns uploaded URL when no transformation configured", async () => {
      const strategy = new UploadStrategy({
        uploadHandler: mockUploadHandler,
      });

      const mediaInfo = {
        type: MediaInfoType.UPLOAD as const,
        originalUrl: "https://notion.so/image.png",
        uploadedUrl: "https://storage.example.com/image.png",
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toBe(mediaInfo.uploadedUrl);
    });

    test("returns original URL for DIRECT type", async () => {
      const strategy = new UploadStrategy(mockConfig);

      const mediaInfo = {
        type: MediaInfoType.DIRECT as const,
        originalUrl: "https://example.com/image.png",
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toBe(mediaInfo.originalUrl);
    });
  });

  describe("Cleanup", () => {
    test("calls cleanup handler for uploaded files", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.UPLOAD,
          originalUrl: "https://notion.so/image.png",
          uploadedUrl: "https://storage.example.com/image.png",
        },
        lastEdited: "2024-01-19",
        createdAt: "2024-01-19",
        updatedAt: "2024-01-19",
      };

      await strategy.cleanup(entry);
      expect(mockCleanupHandler).toHaveBeenCalledWith(entry);
    });

    test("handles cleanup handler errors gracefully", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.UPLOAD,
          originalUrl: "https://notion.so/image.png",
          uploadedUrl: "https://storage.example.com/image.png",
        },
        lastEdited: "2024-01-19",
        createdAt: "2024-01-19",
        updatedAt: "2024-01-19",
      };

      mockCleanupHandler.mockRejectedValueOnce(new Error("Cleanup failed"));

      await expect(strategy.cleanup(entry)).resolves.not.toThrow();
    });

    test("skips cleanup for DIRECT type", async () => {
      const strategy = new UploadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.DIRECT,
          originalUrl: "https://example.com/image.png",
        },
        lastEdited: "2024-01-19",
        createdAt: "2024-01-19",
        updatedAt: "2024-01-19",
      };

      await strategy.cleanup(entry);
      expect(mockCleanupHandler).not.toHaveBeenCalled();
    });
  });
});
