import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { PageReferenceManifestBuilder } from '@/utils/page-ref-builder';
import { PageReferenceManifestManager } from '@/utils/manifest-manager';
import { NotionPageProperty } from '@/types/notion';
import type { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { PageReferenceEntryType } from '@/types/manifest-manager';

// --- Mocks ---
vi.mock('@/utils/manifest-manager');

// --- Mock Data Factories ---

const createMockNotionPage = (
  id: string,
  properties: Record<string, NotionPageProperty>,
): PageObjectResponse =>
  ({
    object: 'page',
    id,
    properties,
    // Add other required properties for type conformity
    created_time: '',
    last_edited_time: '',
    created_by: { object: 'user', id: '' },
    last_edited_by: { object: 'user', id: '' },
    parent: { type: 'database_id', database_id: 'db-id' },
    archived: false,
    in_trash: false,
    url: '',
    public_url: null,
    icon: null,
    cover: null,
    request_id: '',
  }) as PageObjectResponse;

describe('PageReferenceManifestBuilder', () => {
  let mockClient: DeepMockProxy<Client>;
  const MockedManifestManager = vi.mocked(PageReferenceManifestManager);
  const URL_PROP_NAME = 'Published URL';

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = mockDeep<Client>();
    // Mock the Notion client to simulate a database rootId
    mockClient.databases.retrieve.mockResolvedValue({ id: 'db-1' } as any);
  });

  describe('Database Processing & URL Extraction', () => {
    it('should extract URL from a URL property type', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const page = createMockNotionPage('page-url', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/from-url',
        } as NotionPageProperty,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');
      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'page-url',
        expect.objectContaining({ url: 'https://example.com/from-url' }),
      );
    });

    it('should extract URL from a rich_text property type', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });
      const page = createMockNotionPage('page-text', {
        [URL_PROP_NAME]: {
          type: 'rich_text',
          rich_text: [{ plain_text: 'https://example.com/from-text' }],
        } as NotionPageProperty,
      });
      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);
      await builder.build('db-1');
      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'page-text',
        expect.objectContaining({ url: 'https://example.com/from-text' }),
      );
    });

    it('should extract URL from a formula (return string) property type', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });
      const page = createMockNotionPage('page-formula', {
        [URL_PROP_NAME]: {
          type: 'formula',
          formula: {
            type: 'string',
            string: 'https://example.com/from-formula',
          },
        } as NotionPageProperty,
      });
      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);
      await builder.build('db-1');
      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'page-formula',
        expect.objectContaining({
          url: 'https://example.com/from-formula',
        }),
      );
    });

    it('should not extract URL from a formula (returns type other than string) property type', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });
      const page = createMockNotionPage('page-formula', {
        [URL_PROP_NAME]: {
          type: 'formula',
          formula: {
            type: 'number',
            number: 123,
          },
        } as NotionPageProperty,
      });
      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);
      await builder.build('db-1');
      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];
      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
    });

    it('should not extract URL from an unsupported property type (e.g., number)', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });
      const page = createMockNotionPage('page-unsupported', {
        [URL_PROP_NAME]: {
          type: 'number',
          number: 123,
        } as NotionPageProperty,
      });
      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);
      await builder.build('db-1');
      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];
      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
    });

    it('should not create an entry in manifest for page with an invalid URL value', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const page = createMockNotionPage('page-invalid', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: '/relative-path',
        } as NotionPageProperty,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
    });

    it('should not create an entry in manifest for pages with a missing URL property', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const page = createMockNotionPage('page-missing', {
        OtherProp: {
          type: 'url',
          url: 'https://example.com/good-url',
        } as NotionPageProperty,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [page],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
    });
  });

  describe('Manifest Generation Logic', () => {
    it('should initialize and save the manifest exactly once on a successful build', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(mockManifestManagerInstance.initialize).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.save).toHaveBeenCalledOnce();
    });

    it('should handle paginated database query results', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const page1 = createMockNotionPage('page-1', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-1',
        } as NotionPageProperty,
      });
      const page2 = createMockNotionPage('page-2', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-2',
        } as NotionPageProperty,
      });

      mockClient.databases.query
        .mockResolvedValueOnce({
          results: [page1],
          has_more: true,
          next_cursor: 'cursor-1',
        } as any)
        .mockResolvedValueOnce({
          results: [page2],
          has_more: false,
          next_cursor: null,
        } as any);

      await builder.build('db-1');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(mockClient.databases.query).toHaveBeenCalledTimes(2);
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledTimes(2);
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'page-1',
        expect.anything(),
      );
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'page-2',
        expect.anything(),
      );
    });

    it('should skip already processed pages to prevent redundant work', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const page1 = createMockNotionPage('page-1', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-1',
        } as NotionPageProperty,
      });

      mockClient.databases.query
        .mockResolvedValueOnce({
          results: [page1],
          has_more: false,
          next_cursor: null,
        } as any)
        .mockResolvedValueOnce({
          results: [page1], // Simulate same page in another database
          has_more: false,
          next_cursor: null,
        } as any);

      // Simulate finding a second database
      mockClient.blocks.children.list.mockResolvedValue({
        results: [{ id: 'db-2', type: 'child_database' }],
        has_more: false,
        next_cursor: null,
      } as any);
      // Fail the first rootId check to trigger findAndProcessDatabases
      mockClient.databases.retrieve
        .mockRejectedValueOnce(new Error('Not a DB'))
        .mockResolvedValue({ id: 'db-2' } as any);

      await builder.build('page-root-id');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      // updateEntry should only be called once, even though the page appeared twice
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'page-1',
        expect.anything(),
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle rootId that is not a database and contains no databases', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      // Fail the database check
      mockClient.databases.retrieve.mockRejectedValue(new Error('Not a DB'));
      // Return no child databases from the page check
      mockClient.blocks.children.list.mockResolvedValue({
        results: [],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('not-a-db-or-page-with-db');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      // Should still initialize and save, but process nothing
      expect(mockManifestManagerInstance.initialize).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.save).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
    });

    it('should gracefully handle a database query failure', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      mockClient.databases.query.mockRejectedValue(new Error('API Query Fail'));

      await builder.build('db-1');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Database query failed for db-1'),
      );
      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
      // Should still save the manifest
      expect(mockManifestManagerInstance.save).toHaveBeenCalledOnce();

      consoleErrorSpy.mockRestore();
    });

    it('should gracefully handle a page scanning failure', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      // Fail the database check to trigger page scanning
      mockClient.databases.retrieve.mockRejectedValue(new Error('Not a DB'));
      // Fail the page block listing
      mockClient.blocks.children.list.mockRejectedValue(
        new Error('API Page Scan Fail'),
      );

      await builder.build('page-id-1');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed scanning page page-id-1'),
      );
      expect(mockManifestManagerInstance.updateEntry).not.toHaveBeenCalled();
      expect(mockManifestManagerInstance.save).toHaveBeenCalledOnce();

      consoleWarnSpy.mockRestore();
    });

    it('should continue processing other databases if one fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const validPage = createMockNotionPage('valid-page', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/valid-page',
        } as NotionPageProperty,
      });

      // Fail the database check to trigger page scanning
      mockClient.databases.retrieve.mockRejectedValue(new Error('Not a DB'));
      // Return two child databases
      mockClient.blocks.children.list.mockResolvedValue({
        results: [
          { id: 'db-fail', type: 'child_database' },
          { id: 'db-ok', type: 'child_database' },
        ],
        has_more: false,
        next_cursor: null,
      } as any);

      // Make the first DB query fail, and the second succeed
      mockClient.databases.query
        .calledWith(expect.objectContaining({ database_id: 'db-fail' }))
        .mockRejectedValue(new Error('DB Fail 1'));
      mockClient.databases.query
        .calledWith(expect.objectContaining({ database_id: 'db-ok' }))
        .mockResolvedValue({
          results: [validPage],
          has_more: false,
          next_cursor: null,
        } as any);

      await builder.build('page-root');

      const mockManifestManagerInstance =
        MockedManifestManager.mock.instances[0];

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledOnce();
      expect(mockManifestManagerInstance.updateEntry).toHaveBeenCalledWith(
        'valid-page',
        expect.anything(),
      );
      expect(mockManifestManagerInstance.save).toHaveBeenCalledOnce();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Incremental Build Scenarios', () => {
    let mockManifestManagerInstance: DeepMockProxy<PageReferenceManifestManager>;
    let inMemoryManifest: any;

    const initialManifest = {
      lastUpdated: '2023-01-01T00:00:00.000Z',
      references: {
        'page-1': {
          url: 'https://example.com/page-1',
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: '2023-01-01T00:00:00.000Z',
        },
        'page-2': {
          url: 'https://example.com/page-2',
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: '2023-01-01T00:00:00.000Z',
        },
      },
    };

    beforeEach(() => {
      // Create a deep copy for each test to ensure isolation
      inMemoryManifest = JSON.parse(JSON.stringify(initialManifest));

      mockManifestManagerInstance = mockDeep<PageReferenceManifestManager>();
      vi.mocked(PageReferenceManifestManager).mockClear();
      vi.mocked(PageReferenceManifestManager).mockImplementation(
        () => mockManifestManagerInstance,
      );

      // When the manager is initialized, it does nothing special for the mock
      mockManifestManagerInstance.initialize.mockResolvedValue(undefined);

      // Mock updateEntry to modify our in-memory manifest
      mockManifestManagerInstance.updateEntry.mockImplementation(
        async (pageId, entry) => {
          inMemoryManifest.references[pageId] = entry;
        },
      );

      // Mock getManifest to return our in-memory manifest
      mockManifestManagerInstance.getManifest.mockReturnValue(inMemoryManifest);
    });

    it('should add a new page to an existing manifest without removing old entries', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });
      const page1 = createMockNotionPage('page-1', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-1',
        } as NotionPageProperty,
      });
      const page2 = createMockNotionPage('page-2', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-2',
        } as NotionPageProperty,
      });
      const newPage3 = createMockNotionPage('page-3', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-3',
        } as NotionPageProperty,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [page1, page2, newPage3],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');

      // The key assertion: check the content that was saved.
      const savedManifest = mockManifestManagerInstance.getManifest();
      expect(Object.keys(savedManifest.references)).toHaveLength(3);
      expect(savedManifest.references['page-1'].url).toBe(
        'https://example.com/page-1',
      );
      expect(savedManifest.references['page-2'].url).toBe(
        'https://example.com/page-2',
      );
      expect(savedManifest.references['page-3'].url).toBe(
        'https://example.com/page-3',
      );
    });

    it('should update existing entry with modified URL from Notion and add a new entry for the new page', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });
      const page1 = createMockNotionPage('page-1', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-1',
        } as NotionPageProperty,
      });
      const modifiedPage2 = createMockNotionPage('page-2', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-2-new-url', // URL has changed
        } as NotionPageProperty,
      });
      const newPage3 = createMockNotionPage('page-3', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-3',
        } as NotionPageProperty,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [page1, modifiedPage2, newPage3],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');

      const savedManifest = mockManifestManagerInstance.getManifest();
      expect(Object.keys(savedManifest.references)).toHaveLength(3);
      expect(savedManifest.references['page-1'].url).toBe(
        'https://example.com/page-1',
      );
      // Assert that the URL for page-2 was updated
      expect(savedManifest.references['page-2'].url).toBe(
        'https://example.com/page-2-new-url',
      );
      expect(savedManifest.references['page-3'].url).toBe(
        'https://example.com/page-3',
      );
    });

    /**
     * Why preserving the stale entry for a now-invalid page?
     * because for page-2 if it becomes invalid it would never show up in the page reference builder so it's hard to know if the existing entry is stale or not. So we let it be there and we don't remove it.
     */
    it('should add a new page and should preserve the stale entry for a now-invalid page', async () => {
      const builder = new PageReferenceManifestBuilder(mockClient, {
        urlPropertyNameNotion: URL_PROP_NAME,
      });

      const page1 = createMockNotionPage('page-1', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-1',
        } as NotionPageProperty,
      });
      // Page 2 is now invalid (unsupported property type)
      const invalidPage2 = createMockNotionPage('page-2', {
        SomeOtherProp: {
          type: 'number',
          number: 12345,
        } as NotionPageProperty,
      });
      const newPage3 = createMockNotionPage('page-3', {
        [URL_PROP_NAME]: {
          type: 'url',
          url: 'https://example.com/page-3',
        } as NotionPageProperty,
      });

      mockClient.databases.query.mockResolvedValue({
        results: [page1, invalidPage2, newPage3],
        has_more: false,
        next_cursor: null,
      } as any);

      await builder.build('db-1');

      const savedManifest = mockManifestManagerInstance.getManifest();
      expect(Object.keys(savedManifest.references)).toHaveLength(3);
      expect(savedManifest.references['page-1'].url).toBe(
        'https://example.com/page-1',
      );
      // Assert that page-3 was added
      expect(savedManifest.references['page-3'].url).toBe(
        'https://example.com/page-3',
      );
      // Assert that page-2 still exists with its old, stale URL
      expect(savedManifest.references['page-2'].url).toBe(
        'https://example.com/page-2',
      );
    });
  });
});
