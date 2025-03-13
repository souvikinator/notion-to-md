import {
  UploadStrategyConfig,
  MediaProcessingError,
  MediaInfoType,
  MediaInfo,
  MediaManifestEntry,
} from '../../../src/types';
import { UploadStrategy } from '../../../src/core/media-handler/strategies/upload';

describe('UploadStrategy', () => {
  // Mock functions for config
  const mockUploadHandler = jest.fn();
  const mockCleanupHandler = jest.fn();
  const mockTransformPath = jest.fn();

  // Base configuration used across tests
  const mockConfig: UploadStrategyConfig = {
    uploadHandler: mockUploadHandler,
    cleanupHandler: mockCleanupHandler,
    transformPath: mockTransformPath,
    failForward: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Configuration', () => {
    test('requires uploadHandler', () => {
      expect(() => new UploadStrategy({} as any)).toThrow(MediaProcessingError);

      expect(() => new UploadStrategy({ uploadHandler: null } as any)).toThrow(
        MediaProcessingError,
      );
    });

    test('defaults failForward to true', () => {
      const strategy = new UploadStrategy({
        uploadHandler: mockUploadHandler,
      });
      expect(strategy['config'].failForward).toBe(true);
    });

    test('accepts custom failForward setting', () => {
      const strategy = new UploadStrategy({
        uploadHandler: mockUploadHandler,
        failForward: false,
      });
      expect(strategy['config'].failForward).toBe(false);
    });
  });

  describe('Error Handling Modes', () => {
    test('throws errors in strict mode', async () => {
      const strategy = new UploadStrategy({
        ...mockConfig,
        failForward: false,
      });

      const invalidBlocks = [
        { id: 'block1' }, // Missing type
        { id: 'block2', type: 'unknown' }, // Invalid type
        { id: 'block3', type: 'image', image: {} }, // Invalid structure
      ];

      for (const block of invalidBlocks) {
        await expect(strategy.process(block as any)).rejects.toThrow(
          MediaProcessingError,
        );
      }
    });

    test('throws upload errors in strict mode', async () => {
      const strategy = new UploadStrategy({
        ...mockConfig,
        failForward: false,
      });

      mockUploadHandler.mockRejectedValueOnce(new Error('Upload failed'));

      const block = {
        id: 'block1',
        type: 'image',
        image: {
          type: 'file',
          file: { url: 'https://notion.so/image.png' },
        },
      };

      await expect(strategy.process(block as any)).rejects.toThrow(
        MediaProcessingError,
      );
    });

    test('fails forward in lenient mode', async () => {
      const strategy = new UploadStrategy({
        ...mockConfig,
        failForward: true,
      });

      const testCases = [
        {
          block: { id: 'block1' }, // Missing type
          expectedUrl: '',
        },
        {
          block: {
            id: 'block2',
            type: 'image',
            image: {}, // Invalid structure
          },
          expectedUrl: '',
        },
        {
          block: {
            id: 'block3',
            type: 'image',
            image: {
              type: 'file',
              file: { url: 'https://notion.so/image.png' },
            },
          },
          expectedUrl: 'https://notion.so/image.png',
          mockError: new Error('Upload failed'),
        },
      ];

      for (const testCase of testCases) {
        if (testCase.mockError) {
          mockUploadHandler.mockRejectedValueOnce(testCase.mockError);
        }

        const result = await strategy.process(testCase.block as any);
        expect(result).toEqual({
          type: MediaInfoType.DIRECT,
          originalUrl: testCase.expectedUrl,
          transformedPath: testCase.expectedUrl,
        });
        expect(console.error).toHaveBeenCalledWith(
          expect.any(MediaProcessingError),
        );
      }
    });
  });

  describe('Media Processing', () => {
    test('processes all media block types', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const uploadedUrl = 'https://cdn.example.com/uploaded.png';
      mockUploadHandler.mockResolvedValue(uploadedUrl);

      const blocks = [
        {
          id: 'block1',
          type: 'image',
          image: {
            type: 'file',
            file: { url: 'https://notion.so/image.png' },
          },
        },
        {
          id: 'block2',
          type: 'video',
          video: {
            type: 'file',
            file: { url: 'https://notion.so/video.mp4' },
          },
        },
        {
          id: 'block3',
          type: 'file',
          file: {
            type: 'file',
            file: { url: 'https://notion.so/document.pdf' },
          },
        },
        {
          id: 'block4',
          type: 'pdf',
          pdf: {
            type: 'file',
            file: { url: 'https://notion.so/document.pdf' },
          },
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.UPLOAD);
        expect(result.uploadedUrl).toBe(uploadedUrl);
        expect(mockUploadHandler).toHaveBeenCalledWith(
          // @ts-ignore
          block[block.type].file.url,
          block.id,
        );
      }
    });

    test('handles failed uploads gracefully', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const block = {
        id: 'block1',
        type: 'image',
        image: {
          type: 'file',
          file: { url: 'https://notion.so/image.png' },
        },
      };

      mockUploadHandler.mockResolvedValueOnce(null); // Upload handler returns falsy value

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DIRECT);
      expect(result.originalUrl).toBe('https://notion.so/image.png');
      expect(result.transformedPath).toBe('https://notion.so/image.png');
      expect(console.error).toHaveBeenCalledWith(
        expect.any(MediaProcessingError),
      );
    });
  });

  describe('External URL Preservation', () => {
    test('preserves external URLs when configured', async () => {
      const strategy = new UploadStrategy({
        ...mockConfig,
        preserveExternalUrls: true,
      });

      const externalUrls = [
        'https://example.com/image.png',
        'https://othersite.com/video.mp4',
      ];

      for (const url of externalUrls) {
        const block = {
          id: `block-${url}`,
          type: 'image',
          image: {
            type: 'external',
            external: { url },
          },
        };

        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe(url);
        expect(result.transformedPath).toBe(url);
        expect(mockUploadHandler).not.toHaveBeenCalled();
      }
    });

    test('uploads Notion URLs even with preserveExternalUrls', async () => {
      const strategy = new UploadStrategy({
        ...mockConfig,
        preserveExternalUrls: true,
      });

      const uploadedUrl = 'https://cdn.example.com/uploaded.png';
      mockUploadHandler.mockResolvedValue(uploadedUrl);

      const notionUrls = [
        'https://prod-files.notion-static.com/image.png',
        'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/doc.pdf',
      ];

      for (const url of notionUrls) {
        const block = {
          id: `block-${url}`,
          type: 'image',
          image: {
            type: 'external',
            external: { url },
          },
        };

        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.UPLOAD);
        expect(result.uploadedUrl).toBe(uploadedUrl);
      }
    });
  });

  describe('URL Transformation', () => {
    test('applies custom transformations', () => {
      const strategy = new UploadStrategy(mockConfig);
      const uploadedUrl = 'https://cdn.example.com/image.png';
      const transformedPath = 'https://transformed.com/image.png';

      mockTransformPath.mockReturnValue(transformedPath);

      const mediaInfo: MediaInfo = {
        type: MediaInfoType.UPLOAD,
        originalUrl: 'original.png',
        uploadedUrl,
      };

      const result = strategy.transform(mediaInfo);
      expect(result).toBe(transformedPath);
      expect(mockTransformPath).toHaveBeenCalledWith(uploadedUrl);
    });

    test('handles transformation errors', () => {
      const strategy = new UploadStrategy({
        ...mockConfig,
        transformPath: () => {
          throw new Error('Transform failed');
        },
      });

      const mediaInfo: MediaInfo = {
        type: MediaInfoType.UPLOAD,
        originalUrl: 'original.png',
        uploadedUrl: 'uploaded.png',
      };

      const result = strategy.transform(mediaInfo);
      expect(result).toBe(mediaInfo.originalUrl);
      expect(console.error).toHaveBeenCalledWith(
        expect.any(MediaProcessingError),
      );
    });

    test('returns original URL for DIRECT type', () => {
      const strategy = new UploadStrategy(mockConfig);
      const mediaInfo: MediaInfo = {
        type: MediaInfoType.DIRECT,
        originalUrl: 'https://example.com/image.png',
        transformedPath: 'https://example.com/image.png',
      };

      const result = strategy.transform(mediaInfo);
      expect(result).toBe(mediaInfo.originalUrl);
      expect(mockTransformPath).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('calls cleanup handler for uploaded files', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.UPLOAD,
          originalUrl: 'https://notion.so/image.png',
          uploadedUrl: 'https://cdn.example.com/image.png',
          transformedPath: 'https://cdn.example.com/image.png',
        },
        lastEdited: '2024-01-19',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19',
      };

      await strategy.cleanup(entry);
      expect(mockCleanupHandler).toHaveBeenCalledWith(entry);
    });

    test('handles cleanup errors gracefully', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.UPLOAD,
          originalUrl: 'https://notion.so/image.png',
          uploadedUrl: 'https://cdn.example.com/image.png',
          transformedPath: 'https://cdn.example.com/image.png',
        },
        lastEdited: '2024-01-19',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19',
      };

      mockCleanupHandler.mockRejectedValueOnce(new Error('Cleanup failed'));

      await strategy.cleanup(entry);
      expect(console.error).toHaveBeenCalledWith(
        expect.any(MediaProcessingError),
      );
    });

    test('skips cleanup for DIRECT type', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.DIRECT,
          originalUrl: 'https://example.com/image.png',
          transformedPath: 'https://example.com/image.png',
        },
        lastEdited: '2024-01-19',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19',
      };

      await strategy.cleanup(entry);
      expect(mockCleanupHandler).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty or null URLs', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const blocks = [
        {
          id: 'block1',
          type: 'image',
          image: {
            type: 'external',
            external: { url: '' },
          },
        },
        {
          id: 'block2',
          type: 'image',
          image: {
            type: 'external',
            external: { url: null },
          },
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe('');
        expect(result.transformedPath).toBe('');
      }
    });

    test('handles malformed blocks gracefully', async () => {
      const strategy = new UploadStrategy(mockConfig);
      const blocks = [
        { type: 'image' }, // Missing ID
        { id: 'block1', type: 'image', image: null }, // Null media object
        { id: 'block2', type: 'video', video: undefined }, // Undefined media object
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe('');
        expect(result.transformedPath).toBe('');
      }
    });
  });
});
