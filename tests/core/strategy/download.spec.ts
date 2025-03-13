import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import mime from 'mime-types';
import {
  DownloadStrategyConfig,
  MediaInfo,
  MediaInfoType,
  MediaManifestEntry,
  MediaProcessingError,
} from '../../../src/types';
import { DownloadStrategy } from '../../../src/core/media-handler/strategies/download';

jest.mock('node-fetch');
jest.mock('fs/promises');
jest.mock('mime-types');

describe('DownloadStrategy', () => {
  // Base configuration used across tests
  const mockConfig: DownloadStrategyConfig = {
    outputDir: './public/media',
    transformPath: (path: string) => `/media/${path.split('/').pop()}`,
    failForward: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Configuration Tests
  describe('Configuration', () => {
    test('requires outputDir', () => {
      expect(() => new DownloadStrategy({} as any)).toThrow(
        MediaProcessingError,
      );
      expect(() => new DownloadStrategy({ outputDir: '' } as any)).toThrow(
        MediaProcessingError,
      );
    });

    test('defaults failForward to true when not provided', () => {
      const strategy = new DownloadStrategy({
        outputDir: './media',
      });
      expect(strategy['config'].failForward).toBe(true);
    });

    test('accepts custom failForward setting', () => {
      const strategy = new DownloadStrategy({
        outputDir: './media',
        failForward: false,
      });
      expect(strategy['config'].failForward).toBe(false);
    });
  });

  // Error Handling Mode Tests
  describe('Error Handling Modes', () => {
    test('throws errors in strict mode for invalid blocks', async () => {
      const strategy = new DownloadStrategy({
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

    test('throws errors in strict mode for download failures', async () => {
      const strategy = new DownloadStrategy({
        ...mockConfig,
        failForward: false,
      });

      const block = {
        id: 'block1',
        type: 'image',
        image: {
          type: 'file',
          file: { url: 'https://notion.so/image.png' },
        },
      };

      (fetch as unknown as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(strategy.process(block as any)).rejects.toThrow(
        MediaProcessingError,
      );
    });

    test('fails forward in lenient mode for various errors', async () => {
      const strategy = new DownloadStrategy({
        ...mockConfig,
        failForward: true,
      });

      // Test cases for different error scenarios
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
          mockError: new Error('Download failed'),
        },
      ];

      for (const testCase of testCases) {
        if (testCase.mockError) {
          (fetch as unknown as jest.Mock).mockRejectedValueOnce(
            testCase.mockError,
          );
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

  // Media URL Extraction Tests
  describe('Media URL Extraction', () => {
    test('extracts external URLs from all media block types', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const blocks = [
        {
          id: 'block1',
          type: 'image',
          image: {
            type: 'external',
            external: { url: 'https://example.com/image.png' },
          },
        },
        {
          id: 'block2',
          type: 'video',
          video: {
            type: 'external',
            external: { url: 'https://example.com/video.mp4' },
          },
        },
        {
          id: 'block3',
          type: 'file',
          file: {
            type: 'external',
            external: { url: 'https://example.com/document.pdf' },
          },
        },
        {
          id: 'block4',
          type: 'pdf',
          pdf: {
            type: 'external',
            external: { url: 'https://example.com/document.pdf' },
          },
        },
      ];

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        // @ts-ignore
        expect(result.originalUrl).toBe(block[block.type].external.url);
        expect(result.transformedPath).toBeDefined();
      }
    });

    test('extracts Notion file URLs from all media block types', async () => {
      const strategy = new DownloadStrategy(mockConfig);
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

      // Mock successful download for all cases
      (fetch as unknown as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/octet-stream' },
        buffer: () => Promise.resolve(Buffer.from('test')),
      });
      (mime.extension as jest.Mock).mockReturnValue('bin');

      for (const block of blocks) {
        const result = await strategy.process(block as any);
        // @ts-ignore
        expect(result.originalUrl).toBe(block[block.type].file.url);
      }
    });

    test('handles malformed media blocks gracefully', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const malformedBlocks = [
        {
          id: 'block1',
          type: 'image',
          image: {}, // Missing type and URL
        },
        {
          id: 'block2',
          type: 'video',
          video: {
            type: 'external',
            // Missing external.url
          },
        },
        {
          id: 'block3',
          type: 'file',
          file: {
            type: 'file',
            // Missing file.url
          },
        },
        {
          id: 'block4',
          type: 'pdf',
          // Missing pdf object entirely
        },
      ];

      for (const block of malformedBlocks) {
        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe('');
        expect(result.transformedPath).toBe('');
        expect(console.error).toHaveBeenCalledWith(
          expect.any(MediaProcessingError),
        );
      }
    });
  });

  // Download and Storage Tests
  describe('Download and Storage', () => {
    test('successfully downloads and stores all media types', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const testCases = [
        {
          block: {
            id: 'block1',
            type: 'image',
            image: {
              type: 'file',
              file: { url: 'https://notion.so/image.png' },
            },
          },
          mimeType: 'image/png',
          extension: 'png',
        },
        {
          block: {
            id: 'block2',
            type: 'video',
            video: {
              type: 'file',
              file: { url: 'https://notion.so/video.mp4' },
            },
          },
          mimeType: 'video/mp4',
          extension: 'mp4',
        },
        {
          block: {
            id: 'block3',
            type: 'pdf',
            pdf: {
              type: 'file',
              file: { url: 'https://notion.so/document.pdf' },
            },
          },
          mimeType: 'application/pdf',
          extension: 'pdf',
        },
      ];

      for (const testCase of testCases) {
        (fetch as unknown as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: { get: () => testCase.mimeType },
          buffer: () => Promise.resolve(Buffer.from('test')),
        });
        (mime.extension as jest.Mock).mockReturnValueOnce(testCase.extension);

        const result = await strategy.process(testCase.block as any);

        expect(result.type).toBe(MediaInfoType.DOWNLOAD);
        expect(result.localPath).toContain(testCase.block.id);
        expect(result.localPath).toContain(testCase.extension);
        expect(result.mimeType).toBe(testCase.mimeType);
        expect(result.transformedPath).toMatch(/^\/media\//);

        expect(fs.mkdir).toHaveBeenCalledWith(
          mockConfig.outputDir,
          expect.any(Object),
        );
        expect(fs.writeFile).toHaveBeenCalled();
      }
    });

    test('handles various download failures gracefully', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const block = {
        id: 'block1',
        type: 'image',
        image: {
          type: 'file',
          file: { url: 'https://notion.so/image.png' },
        },
      };

      const errorCases = [
        {
          error: new Error('Network error'),
          errorType: 'network',
        },
        {
          error: { ok: false, statusText: 'Not Found' },
          errorType: 'http',
        },
        {
          mock: {
            ok: true,
            headers: { get: () => 'invalid/type' },
            buffer: () => Promise.resolve(Buffer.from('test')),
          },
          errorType: 'mime',
        },
      ];

      for (const errorCase of errorCases) {
        if (errorCase.error) {
          if (errorCase.errorType === 'network') {
            (fetch as unknown as jest.Mock).mockRejectedValueOnce(
              errorCase.error,
            );
          } else {
            (fetch as unknown as jest.Mock).mockResolvedValueOnce(
              errorCase.error,
            );
          }
        } else {
          (fetch as unknown as jest.Mock).mockResolvedValueOnce(errorCase.mock);
          (mime.extension as jest.Mock).mockReturnValueOnce(false);
        }

        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DIRECT);
        expect(result.originalUrl).toBe('https://notion.so/image.png');
        expect(result.transformedPath).toBe('https://notion.so/image.png');
        expect(console.error).toHaveBeenCalledWith(
          expect.any(MediaProcessingError),
        );
      }
    });
  });

  // External URL Preservation Tests
  describe('External URL Preservation', () => {
    test('preserves external URLs when configured', async () => {
      const strategy = new DownloadStrategy({
        ...mockConfig,
        preserveExternalUrls: true,
      });

      const externalUrls = [
        'https://example.com/image.png',
        'https://somecdn.com/video.mp4',
        'https://storage.com/document.pdf',
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
        expect(fetch).not.toHaveBeenCalled();
      }
    });

    test('downloads Notion URLs even with preserveExternalUrls', async () => {
      const strategy = new DownloadStrategy({
        ...mockConfig,
        preserveExternalUrls: true,
      });

      const notionUrls = [
        'https://prod-files.notion-static.com/image.png',
        'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/video.mp4',
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

        (fetch as unknown as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'image/png' },
          buffer: () => Promise.resolve(Buffer.from('test')),
        });
        (mime.extension as jest.Mock).mockReturnValue('png');

        const result = await strategy.process(block as any);
        expect(result.type).toBe(MediaInfoType.DOWNLOAD);
        expect(fetch).toHaveBeenCalled();
      }
    });
  });

  // Path Transformation Tests
  describe('Path Transformation', () => {
    test('applies custom path transformation', async () => {
      const customTransform = (path: string) =>
        `/custom/${path.split('/').pop()}`;
      const strategy = new DownloadStrategy({
        ...mockConfig,
        transformPath: customTransform,
      });

      const mediaInfo = {
        type: MediaInfoType.DOWNLOAD as const,
        originalUrl: 'https://notion.so/image.png',
        localPath: '/local/path/image.png',
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toMatch(/^\/custom\//);
    });

    test('provides default path transformation', async () => {
      const strategy = new DownloadStrategy({
        outputDir: '/output/dir',
      });
      const mediaInfo = {
        type: MediaInfoType.DOWNLOAD as const,
        originalUrl: 'https://notion.so/image.png',
        localPath: '/output/dir/image.png',
      };

      const transformed = strategy.transform(mediaInfo);
      expect(transformed).toBe('image.png');
    });

    test('returns original URL for DIRECT type', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const testCases = [
        {
          type: MediaInfoType.DIRECT as const,
          originalUrl: 'https://example.com/image.png',
        },
        {
          type: MediaInfoType.DIRECT as const,
          originalUrl: 'https://example.com/video.mp4',
        },
      ];

      for (const mediaInfo of testCases) {
        const transformed = strategy.transform(mediaInfo);
        expect(transformed).toBe(mediaInfo.originalUrl);
      }
    });

    test('handles transformation errors gracefully', async () => {
      const erroringTransform = () => {
        throw new Error('Transform failed');
      };

      const strategy = new DownloadStrategy({
        ...mockConfig,
        transformPath: erroringTransform,
        failForward: true,
      });

      const mediaInfo = {
        type: MediaInfoType.DOWNLOAD as const,
        originalUrl: 'https://notion.so/image.png',
        localPath: '/local/path/image.png',
      };

      const result = strategy.transform(mediaInfo);
      expect(result).toBe(mediaInfo.originalUrl);
      expect(console.error).toHaveBeenCalledWith(
        expect.any(MediaProcessingError),
      );
    });

    test('throws transformation errors in strict mode', async () => {
      const erroringTransform = () => {
        throw new Error('Transform failed');
      };

      const strategy = new DownloadStrategy({
        ...mockConfig,
        transformPath: erroringTransform,
        failForward: false,
      });

      const mediaInfo = {
        type: MediaInfoType.DOWNLOAD as const,
        originalUrl: 'https://notion.so/image.png',
        localPath: '/local/path/image.png',
      };

      expect(() => strategy.transform(mediaInfo)).toThrow(MediaProcessingError);
    });
  });

  // Cleanup Tests
  describe('Cleanup', () => {
    test('cleans up downloaded files successfully', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entries: MediaManifestEntry[] = [
        {
          mediaInfo: {
            type: MediaInfoType.DOWNLOAD,
            originalUrl: 'https://notion.so/image1.png',
            localPath: '/output/dir/image1.png',
            mimeType: 'image/png',
            transformedPath: '/media/image1.png',
          },
          lastEdited: '2024-01-19',
          createdAt: '2024-01-19',
          updatedAt: '2024-01-19',
        },
        {
          mediaInfo: {
            type: MediaInfoType.DOWNLOAD,
            originalUrl: 'https://notion.so/image2.png',
            localPath: '/output/dir/image2.png',
            mimeType: 'image/png',
            transformedPath: '/media/image2.png',
          },
          lastEdited: '2024-01-19',
          createdAt: '2024-01-19',
          updatedAt: '2024-01-19',
        },
      ];

      for (const entry of entries) {
        await strategy.cleanup(entry);
        expect(fs.unlink).toHaveBeenCalledWith(entry.mediaInfo.localPath);
      }
    });

    test('handles missing files during cleanup', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          originalUrl: 'https://notion.so/image.png',
          localPath: '/output/dir/image.png',
          mimeType: 'image/png',
          transformedPath: '/media/image.png',
        },
        lastEdited: '2024-01-19',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19',
      };

      // Simulate ENOENT error
      (fs.unlink as jest.Mock).mockRejectedValueOnce({ code: 'ENOENT' });

      await expect(strategy.cleanup(entry)).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });

    test('handles invalid local paths during cleanup', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          originalUrl: 'https://notion.so/image.png',
          localPath: '', // Invalid local path
          mimeType: 'image/png',
          transformedPath: '/media/image.png',
        },
        lastEdited: '2024-01-19',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19',
      };

      // Since invalid path is an error case that should be logged
      await strategy.cleanup(entry);

      // Verify unlink wasn't called
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    test('handles permission errors gracefully', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const entry: MediaManifestEntry = {
        mediaInfo: {
          type: MediaInfoType.DOWNLOAD,
          originalUrl: 'https://notion.so/image.png',
          localPath: '/output/dir/image.png',
          mimeType: 'image/png',
          transformedPath: '/media/image.png',
        },
        lastEdited: '2024-01-19',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-19',
      };

      // Simulate permission error
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      (fs.unlink as jest.Mock).mockRejectedValueOnce(error);

      await expect(strategy.cleanup(entry)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        expect.any(MediaProcessingError),
      );
    });

    test('skips cleanup for DIRECT type entries', async () => {
      const strategy = new DownloadStrategy(mockConfig);
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
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  // Edge Cases and Special Scenarios
  describe('Edge Cases', () => {
    test('handles empty or null URLs', async () => {
      const strategy = new DownloadStrategy(mockConfig);
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

    test('handles unusual mime types', async () => {
      const strategy = new DownloadStrategy(mockConfig);
      const block = {
        id: 'block1',
        type: 'file',
        file: {
          type: 'file',
          file: { url: 'https://notion.so/file.xyz' },
        },
      };

      (fetch as unknown as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/x-custom' },
        buffer: () => Promise.resolve(Buffer.from('test')),
      });
      (mime.extension as jest.Mock).mockReturnValue('bin'); // Fallback extension

      const result = await strategy.process(block as any);
      expect(result.type).toBe(MediaInfoType.DOWNLOAD);
      expect(result.localPath).toContain('.bin');
    });
  });
});
