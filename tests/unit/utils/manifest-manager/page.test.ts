import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PageReferenceManifestManager } from '@/utils/manifest-manager/page';
import {
  PageReferenceStateError,
  ManifestIOError,
} from '@/utils/manifest-manager/errors';
import {
  PageReferenceEntry,
  PageReferenceEntryType,
} from '@/types/manifest-manager';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs module
vi.mock('fs/promises');

describe('PageReferenceManifestManager', () => {
  let manager: PageReferenceManifestManager;
  const mockFs = vi.mocked(fs);

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new PageReferenceManifestManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create manager with default base directory', () => {
      const manager = new PageReferenceManifestManager();
      expect(manager).toBeInstanceOf(PageReferenceManifestManager);
    });

    it('should create manager with custom base directory', () => {
      const customDir = '/custom/base/dir';
      const manager = new PageReferenceManifestManager(customDir);
      expect(manager).toBeInstanceOf(PageReferenceManifestManager);
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
    });

    it('should initialize successfully when manifest file exists', async () => {
      const mockManifest = {
        lastUpdated: '2023-01-01T00:00:00.000Z',
        references: {
          'page-1': {
            url: 'https://example.com/page-1',
            source: PageReferenceEntryType.PROPERTY,
            lastUpdated: '2023-01-01T00:00:00.000Z',
          },
        },
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      await manager.initialize();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining(path.join('.notion-to-md', 'ref')),
        { recursive: true },
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('page_ref.json'),
        'utf-8',
      );
    });

    it('should initialize with empty manifest when file does not exist', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await manager.initialize();

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.readFile).toHaveBeenCalled();

      // Should create empty manifest internally
      const manifest = manager.getManifest();
      expect(manifest.references).toEqual({});
      expect(manifest.lastUpdated).toBeDefined();
    });

    it('should throw ManifestIOError when directory creation fails', async () => {
      const error = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(error);

      await expect(manager.initialize()).rejects.toThrow(ManifestIOError);
      expect(mockFs.mkdir).toHaveBeenCalled();
    });

    it('should handle file system permission errors', async () => {
      const permissionError = new Error(
        'EACCES: permission denied',
      ) as NodeJS.ErrnoException;
      permissionError.code = 'EACCES';
      mockFs.mkdir.mockRejectedValue(permissionError);

      await expect(manager.initialize()).rejects.toThrow(ManifestIOError);
    });

    it('should reset manifest state when initialization fails', async () => {
      const error = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(error);

      await expect(manager.initialize()).rejects.toThrow();

      // Should throw when trying to access uninitialized manager
      expect(() => manager.getManifest()).toThrow(PageReferenceStateError);
    });
  });

  describe('updateEntry', () => {
    const sampleEntry: PageReferenceEntry = {
      url: 'https://example.com/page-1',
      source: PageReferenceEntryType.PROPERTY,
      lastUpdated: '2023-01-01T00:00:00.000Z',
    };

    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();
    });

    it('should update entry successfully', async () => {
      await manager.updateEntry('page-1', sampleEntry);

      const manifest = manager.getManifest();
      expect(manifest.references['page-1']).toEqual(sampleEntry);
      expect(new Date(manifest.lastUpdated).getTime()).toBeGreaterThan(
        new Date('2023-01-01T00:00:00.000Z').getTime(),
      );
    });

    it('should throw PageReferenceStateError when not initialized', async () => {
      const uninitializedManager = new PageReferenceManifestManager();

      await expect(
        uninitializedManager.updateEntry('page-1', sampleEntry),
      ).rejects.toThrow(PageReferenceStateError);
    });
  });

  describe('getEntry', () => {
    const sampleEntry: PageReferenceEntry = {
      url: 'https://example.com/page-1',
      source: PageReferenceEntryType.PROPERTY,
      lastUpdated: '2023-01-01T00:00:00.000Z',
    };

    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();
      await manager.updateEntry('page-1', sampleEntry);
    });

    it('should return existing entry', () => {
      const result = manager.getEntry('page-1');
      expect(result).toEqual(sampleEntry);
    });

    it('should return undefined for non-existing entry', () => {
      const result = manager.getEntry('non-existing-page');
      expect(result).toBeUndefined();
    });

    it('should throw PageReferenceStateError when not initialized', () => {
      const uninitializedManager = new PageReferenceManifestManager();

      expect(() => uninitializedManager.getEntry('page-1')).toThrow(
        PageReferenceStateError,
      );
    });
  });

  describe('hasEntry', () => {
    const sampleEntry: PageReferenceEntry = {
      url: 'https://example.com/page-1',
      source: PageReferenceEntryType.PROPERTY,
      lastUpdated: '2023-01-01T00:00:00.000Z',
    };

    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();
      await manager.updateEntry('page-1', sampleEntry);
    });

    it('should return true for existing entry', () => {
      expect(manager.hasEntry('page-1')).toBe(true);
    });

    it('should return false for non-existing entry', () => {
      expect(manager.hasEntry('non-existing-page')).toBe(false);
    });

    it('should throw PageReferenceStateError when not initialized', () => {
      const uninitializedManager = new PageReferenceManifestManager();

      expect(() => uninitializedManager.hasEntry('page-1')).toThrow(
        PageReferenceStateError,
      );
    });
  });

  describe('removeEntry', () => {
    const sampleEntry: PageReferenceEntry = {
      url: 'https://example.com/page-1',
      source: PageReferenceEntryType.PROPERTY,
      lastUpdated: '2023-01-01T00:00:00.000Z',
    };

    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();
      await manager.updateEntry('page-1', sampleEntry);
    });

    it('should remove existing entry', () => {
      expect(manager.hasEntry('page-1')).toBe(true);

      manager.removeEntry('page-1');

      expect(manager.hasEntry('page-1')).toBe(false);
      const manifest = manager.getManifest();
      expect(new Date(manifest.lastUpdated).getTime()).toBeGreaterThan(
        new Date('2023-01-01T00:00:00.000Z').getTime(),
      );
    });

    it('should handle removal of non-existing entry gracefully', () => {
      expect(() => manager.removeEntry('non-existing-page')).not.toThrow();
    });

    it('should throw PageReferenceStateError when not initialized', () => {
      const uninitializedManager = new PageReferenceManifestManager();

      expect(() => uninitializedManager.removeEntry('page-1')).toThrow(
        PageReferenceStateError,
      );
    });
  });

  describe('getAllEntries', () => {
    const sampleEntries = {
      'page-1': {
        url: 'https://example.com/page-1',
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      },
      'page-2': {
        url: 'https://example.com/page-2',
        source: PageReferenceEntryType.MANIFEST,
        lastUpdated: '2023-01-02T00:00:00.000Z',
      },
    };

    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();

      for (const [pageId, entry] of Object.entries(sampleEntries)) {
        await manager.updateEntry(pageId, entry);
      }
    });

    it('should return all entries', () => {
      const result = manager.getAllEntries();
      expect(result).toEqual(sampleEntries);
    });

    it('should return empty object when no entries exist', async () => {
      const emptyManager = new PageReferenceManifestManager();
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await emptyManager.initialize();

      const result = emptyManager.getAllEntries();
      expect(result).toEqual({});
    });

    it('should throw PageReferenceStateError when not initialized', () => {
      const uninitializedManager = new PageReferenceManifestManager();

      expect(() => uninitializedManager.getAllEntries()).toThrow(
        PageReferenceStateError,
      );
    });
  });

  describe('save', () => {
    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();
    });

    it('should save manifest successfully', async () => {
      mockFs.writeFile.mockResolvedValue(undefined);

      await manager.save();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('page_ref.json'),
        expect.stringContaining('"references"'),
        'utf-8',
      );
    });

    it('should throw ManifestIOError when save fails', async () => {
      const error = new Error('Permission denied');
      mockFs.writeFile.mockRejectedValue(error);

      await expect(manager.save()).rejects.toThrow(ManifestIOError);
    });

    it('should throw PageReferenceStateError when not initialized', async () => {
      const uninitializedManager = new PageReferenceManifestManager();

      await expect(uninitializedManager.save()).rejects.toThrow(
        PageReferenceStateError,
      );
    });
  });

  describe('getManifest', () => {
    beforeEach(async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();
    });

    it('should return manifest when initialized', () => {
      const manifest = manager.getManifest();
      expect(manifest).toHaveProperty('lastUpdated');
      expect(manifest).toHaveProperty('references');
      expect(typeof manifest.references).toBe('object');
    });

    it('should throw PageReferenceStateError when not initialized', () => {
      const uninitializedManager = new PageReferenceManifestManager();

      expect(() => uninitializedManager.getManifest()).toThrow(
        PageReferenceStateError,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: initialize, add entries, save, and retrieve', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await manager.initialize();

      const entry1: PageReferenceEntry = {
        url: 'https://example.com/page-1',
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };

      const entry2: PageReferenceEntry = {
        url: 'https://example.com/page-2',
        source: PageReferenceEntryType.MANIFEST,
        lastUpdated: '2023-01-02T00:00:00.000Z',
      };

      await manager.updateEntry('page-1', entry1);
      await manager.updateEntry('page-2', entry2);

      expect(manager.hasEntry('page-1')).toBe(true);
      expect(manager.hasEntry('page-2')).toBe(true);
      expect(manager.getEntry('page-1')).toEqual(entry1);
      expect(manager.getEntry('page-2')).toEqual(entry2);

      const allEntries = manager.getAllEntries();
      expect(Object.keys(allEntries)).toHaveLength(2);

      await manager.save();
      expect(mockFs.writeFile).toHaveBeenCalled();

      manager.removeEntry('page-1');
      expect(manager.hasEntry('page-1')).toBe(false);
      expect(manager.hasEntry('page-2')).toBe(true);
    });

    it('should handle manifest loading with existing data', async () => {
      const existingManifest = {
        lastUpdated: '2023-01-01T00:00:00.000Z',
        references: {
          'existing-page': {
            url: 'https://example.com/existing',
            source: PageReferenceEntryType.PROPERTY,
            lastUpdated: '2023-01-01T00:00:00.000Z',
          },
        },
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingManifest));

      await manager.initialize();

      expect(manager.hasEntry('existing-page')).toBe(true);
      expect(manager.getEntry('existing-page')).toEqual(
        existingManifest.references['existing-page'],
      );

      const manifest = manager.getManifest();
      expect(manifest.lastUpdated).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should preserve existing manifest entries when adding new ones and saving', async () => {
      const existingManifest = {
        lastUpdated: '2023-10-26T10:00:00.000Z',
        references: {
          'page-1': {
            url: 'https://example.com/page-1',
            source: PageReferenceEntryType.PROPERTY,
            lastUpdated: '2023-10-26T10:00:00.000Z',
          },
          'page-2': {
            url: 'https://example.com/page-2',
            source: PageReferenceEntryType.PROPERTY,
            lastUpdated: '2023-10-26T10:00:00.000Z',
          },
        },
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingManifest));
      mockFs.writeFile.mockResolvedValue(undefined);

      await manager.initialize(); // Loads existing manifest

      // Add a new entry
      const newEntry: PageReferenceEntry = {
        url: 'https://example.com/new-page',
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      };
      await manager.updateEntry('new-page-3', newEntry);

      // Save the updated manifest
      await manager.save();

      expect(mockFs.writeFile).toHaveBeenCalledOnce();

      // Verify the content written to the file
      const savedContent = mockFs.writeFile.mock.calls[0][1] as string;
      const savedManifest = JSON.parse(savedContent);

      // Check that all entries (old and new) are present
      expect(Object.keys(savedManifest.references)).toHaveLength(3);
      expect(savedManifest.references['page-1']).toEqual(
        existingManifest.references['page-1'],
      );
      expect(savedManifest.references['page-2']).toEqual(
        existingManifest.references['page-2'],
      );
      expect(savedManifest.references['new-page-3']).toEqual(newEntry);
    });

    it('should handle normalized and un-normalized UUIDs consistently across all operations', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();

      const unnormalizedId = '1107e9d7682d455287113965a3979313';
      const normalizedId = '1107e9d7-682d-4552-8711-3965a3979313';

      const entry: PageReferenceEntry = {
        url: 'https://example.com/page-uuid-test',
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      };

      // Scenario 1: Add with un-normalized ID, then check/get/remove with normalized ID
      await manager.updateEntry(unnormalizedId, entry);
      expect(manager.hasEntry(normalizedId)).toBe(true);
      expect(manager.getEntry(normalizedId)).toEqual(entry);
      manager.removeEntry(normalizedId);
      expect(manager.hasEntry(unnormalizedId)).toBe(false);

      // Scenario 2: Add with normalized ID, then check/get/remove with un-normalized ID
      await manager.updateEntry(normalizedId, entry);
      expect(manager.hasEntry(unnormalizedId)).toBe(true);
      expect(manager.getEntry(unnormalizedId)).toEqual(entry);
      manager.removeEntry(unnormalizedId);
      expect(manager.hasEntry(normalizedId)).toBe(false);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle JSON parse errors during initialization', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue('invalid json{');

      await expect(manager.initialize()).rejects.toThrow(ManifestIOError);
    });

    it('should maintain state consistency after failed operations', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      await manager.initialize();

      const entry: PageReferenceEntry = {
        url: 'https://example.com/page-1',
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };

      await manager.updateEntry('page-1', entry);
      expect(manager.hasEntry('page-1')).toBe(true);

      // Simulate save failure
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));
      await expect(manager.save()).rejects.toThrow(ManifestIOError);

      // Data should still be in memory
      expect(manager.hasEntry('page-1')).toBe(true);
      expect(manager.getEntry('page-1')).toEqual(entry);
    });
  });
});
