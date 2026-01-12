/**
 * Root Cause Analysis Test for Issue #163
 *
 * Issue: Only One Image Downloaded with downloadMediaTo
 *
 * This test verifies that:
 * 1. Filenames are unique for each image
 * 2. MediaHandler processes all references
 * 3. Manifest entries are unique
 */

import { describe, it, expect, vi } from 'vitest';
import { MediaManifestManager } from '@/utils/manifest-manager/media';
import { MediaHandler } from '@/core/media-handler';
import { generateFilename } from '@/utils/media/filename';
import { TrackedBlockReferenceObject } from '@/types/fetcher';
import { NotionBlock } from '@/types/notion';
import { MediaStrategyType } from '@/types/manifest-manager';

describe('Issue #163 - Image Download RCA', () => {
  const mockPageId = 'test-page-123';

  describe('Filename Generation', () => {
    it('should generate unique filenames for each image block', () => {
      const ref1: TrackedBlockReferenceObject = {
        type: 'block',
        id: 'block-1',
        parentId: 'page-1',
        ref: {
          type: 'image',
          id: 'block-1',
          parent: { type: 'page_id', page_id: 'page-1' },
          created_time: '2025-01-01T00:00:00.000Z',
          last_edited_time: '2025-01-01T00:00:00.000Z',
          has_children: false,
          image: {
            type: 'external',
            external: { url: 'https://example.com/photo.png' },
            caption: [],
            file: { url: '', expiry_time: '' },
          },
          comments: [],
          children: [],
        } as unknown as NotionBlock,
        propertyName: undefined,
      };

      const ref2: TrackedBlockReferenceObject = {
        type: 'block',
        id: 'block-2',
        parentId: 'page-1',
        ref: {
          type: 'image',
          id: 'block-2',
          parent: { type: 'page_id', page_id: 'page-1' },
          created_time: '2025-01-01T00:00:00.000Z',
          last_edited_time: '2025-01-01T00:00:00.000Z',
          has_children: false,
          image: {
            type: 'external',
            external: { url: 'https://example.com/photo.png' },
            caption: [],
            file: { url: '', expiry_time: '' },
          },
          comments: [],
          children: [],
        } as unknown as NotionBlock,
        propertyName: undefined,
      };

      const filename1 = generateFilename(ref1);
      const filename2 = generateFilename(ref2);

      console.log('Generated filenames:', { filename1, filename2 });

      // Filenames should be different due to different block IDs
      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('block-1');
      expect(filename2).toContain('block-2');
    });

    it('should generate unique filenames even with same URL', () => {
      const ref1: TrackedBlockReferenceObject = {
        type: 'block',
        id: 'unique-id-1',
        parentId: 'page-1',
        ref: {
          type: 'image',
          id: 'unique-id-1',
          parent: { type: 'page_id', page_id: 'page-1' },
          created_time: '2025-01-01T00:00:00.000Z',
          last_edited_time: '2025-01-01T00:00:00.000Z',
          has_children: false,
          image: {
            type: 'external',
            external: { url: 'https://example.com/same-image.png' },
            caption: [],
            file: { url: '', expiry_time: '' },
          },
          comments: [],
          children: [],
        } as unknown as NotionBlock,
        propertyName: undefined,
      };

      const ref2: TrackedBlockReferenceObject = {
        type: 'block',
        id: 'unique-id-2',
        parentId: 'page-1',
        ref: {
          type: 'image',
          id: 'unique-id-2',
          parent: { type: 'page_id', page_id: 'page-1' },
          created_time: '2025-01-01T00:00:00.000Z',
          last_edited_time: '2025-01-01T00:00:00.000Z',
          has_children: false,
          image: {
            type: 'external',
            external: { url: 'https://example.com/same-image.png' },
            caption: [],
            file: { url: '', expiry_time: '' },
          },
          comments: [],
          children: [],
        } as unknown as NotionBlock,
        propertyName: undefined,
      };

      const filename1 = generateFilename(ref1);
      const filename2 = generateFilename(ref2);

      console.log('Generated filenames for same URL:', {
        filename1,
        filename2,
      });

      // Filenames should still be different due to different block IDs
      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('unique-id-1');
      expect(filename2).toContain('unique-id-2');
    });
  });

  describe('Manifest Manager', () => {
    it('should create unique entries for each image', async () => {
      const pageId = `${mockPageId}-unique-1`;
      const manifestManager = new MediaManifestManager();
      await manifestManager.initialize(pageId);

      // Simulate updating manifest for 3 images
      const imageRefs = ['img-1', 'img-2', 'img-3'];

      for (const refId of imageRefs) {
        await manifestManager.updateEntry(refId, {
          mediaInfo: {
            type: MediaStrategyType.DOWNLOAD,
            originalUrl: `https://example.com/${refId}.png`,
            localPath: `/tmp/${refId}.png`,
            transformedPath: `/tmp/${refId}.png`,
            sourceType: 'block',
            propertyName: undefined,
            propertyIndex: 0,
          },
          lastEdited: '2025-01-01T00:00:00.000Z',
        });
      }

      // Verify all 3 entries exist
      const manifest = manifestManager.getManifest();
      console.log(
        'Manifest entries:',
        Object.keys(manifest?.mediaEntries || {}),
      );

      expect(Object.keys(manifest?.mediaEntries || {})).toHaveLength(3);
      expect(manifest?.mediaEntries).toHaveProperty('img-1');
      expect(manifest?.mediaEntries).toHaveProperty('img-2');
      expect(manifest?.mediaEntries).toHaveProperty('img-3');
    });

    it('should overwrite entry for same refId', async () => {
      const pageId = `${mockPageId}-overwrite`;
      const manifestManager = new MediaManifestManager();
      await manifestManager.initialize(pageId);

      // Create initial entry
      await manifestManager.updateEntry('img-1', {
        mediaInfo: {
          type: MediaStrategyType.DOWNLOAD,
          originalUrl: 'https://example.com/old.png',
          localPath: '/tmp/old.png',
          transformedPath: '/tmp/old.png',
          sourceType: 'block',
          propertyName: undefined,
          propertyIndex: 0,
        },
        lastEdited: '2025-01-01T00:00:00.000Z',
      });

      // Update with new data
      await manifestManager.updateEntry('img-1', {
        mediaInfo: {
          type: MediaStrategyType.DOWNLOAD,
          originalUrl: 'https://example.com/new.png',
          localPath: '/tmp/new.png',
          transformedPath: '/tmp/new.png',
          sourceType: 'block',
          propertyName: undefined,
          propertyIndex: 0,
        },
        lastEdited: '2025-01-02T00:00:00.000Z',
      });

      // Verify only 1 entry exists (updated, not duplicated)
      const manifest = manifestManager.getManifest();
      expect(Object.keys(manifest?.mediaEntries || {})).toHaveLength(1);
      expect(manifest?.mediaEntries?.['img-1']?.mediaInfo.originalUrl).toBe(
        'https://example.com/new.png',
      );
    });
  });

  describe('MediaHandler', () => {
    it('should process multiple media references concurrently', async () => {
      const manifestManager = new MediaManifestManager();
      await manifestManager.initialize(`${mockPageId}-handler-1`);

      // Create mock strategy
      const mockStrategy = {
        process: vi.fn().mockResolvedValue({
          mediaInfo: {
            type: MediaStrategyType.DOWNLOAD,
            originalUrl: 'https://example.com/test.png',
            localPath: '/tmp/test.png',
            transformedPath: '/tmp/test.png',
            sourceType: 'block',
            propertyName: undefined,
            propertyIndex: 0,
          },
          needsManifestUpdate: true,
          isProcessed: true,
        }),
        cleanup: vi.fn().mockResolvedValue(undefined),
      };

      const handler = new MediaHandler(
        mockPageId,
        { strategy: mockStrategy as any },
        manifestManager,
      );

      const mockRefs: TrackedBlockReferenceObject[] = [
        {
          type: 'block',
          id: 'img-1',
          parentId: mockPageId,
          ref: {} as NotionBlock,
          propertyName: undefined,
        },
        {
          type: 'block',
          id: 'img-2',
          parentId: mockPageId,
          ref: {} as NotionBlock,
          propertyName: undefined,
        },
        {
          type: 'block',
          id: 'img-3',
          parentId: mockPageId,
          ref: {} as NotionBlock,
          propertyName: undefined,
        },
      ];

      await handler.processMediaReferences(mockRefs);

      // Strategy should be called for each reference
      expect(mockStrategy.process).toHaveBeenCalledTimes(3);
    });

    it('should track processed references for cleanup', async () => {
      const manifestManager = new MediaManifestManager();
      await manifestManager.initialize(`${mockPageId}-cleanup`);

      const processedRefs: string[] = [];

      const mockStrategy = {
        process: vi.fn().mockImplementation(async (input) => {
          processedRefs.push(input.refId);
          return {
            mediaInfo: {
              type: MediaStrategyType.DOWNLOAD,
              originalUrl: `https://example.com/${input.refId}.png`,
              localPath: `/tmp/${input.refId}.png`,
              transformedPath: `/tmp/${input.refId}.png`,
              sourceType: 'block',
              propertyName: undefined,
              propertyIndex: 0,
            },
            needsManifestUpdate: true,
            isProcessed: true,
          };
        }),
        cleanup: vi.fn().mockResolvedValue(undefined),
      };

      const handler = new MediaHandler(
        mockPageId,
        { strategy: mockStrategy as any },
        manifestManager,
      );

      const mockRefs: TrackedBlockReferenceObject[] = [
        {
          type: 'block',
          id: 'img-1',
          parentId: mockPageId,
          ref: {} as NotionBlock,
          propertyName: undefined,
        },
        {
          type: 'block',
          id: 'img-2',
          parentId: mockPageId,
          ref: {} as NotionBlock,
          propertyName: undefined,
        },
      ];

      await handler.processMediaReferences(mockRefs);

      // All references should be processed
      expect(processedRefs).toEqual(['img-1', 'img-2']);
    });
  });
});
