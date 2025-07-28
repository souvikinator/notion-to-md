import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PageReferenceHandler } from '@/core/page-ref-handler';
import { PageReferenceManifestManager } from '@/utils/manifest-manager';
import { PageRefConfig } from '@/types/configuration';
import { PageReferenceHandlerError } from '@/core/errors';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { ChainData } from '@/types/module';
import {
  NotionPageProperties,
  NotionPageProperty,
  NotionBlock,
} from '@/types/notion';
import {
  ExtendedFetcherOutput,
  TrackedBlockReferenceObject,
} from '@/types/fetcher';
import {
  PageReferenceEntry,
  PageReferenceEntryType,
} from '@/types/manifest-manager';

// --- Mock Data Factories ---

const createMockParagraphBlock = (id: string): NotionBlock =>
  ({
    object: 'block',
    id,
    parent: { type: 'page_id', page_id: 'parent-page-id' },
    created_time: '2022-01-01T00:00:00.000Z',
    last_edited_time: '2022-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    has_children: false,
    in_trash: false,
    archived: false,
    type: 'paragraph',
    paragraph: {
      rich_text: [],
      color: 'default',
    },
    comments: [],
    children: [],
  }) as NotionBlock;

const createMockLinkToPageBlock = (id: string, pageId: string): NotionBlock =>
  ({
    object: 'block',
    id,
    parent: { type: 'page_id', page_id: 'parent-page-id' },
    created_time: '2022-01-01T00:00:00.000Z',
    last_edited_time: '2022-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    has_children: false,
    in_trash: false,
    archived: false,
    type: 'link_to_page',
    link_to_page: {
      type: 'page_id',
      page_id: pageId,
    },
  }) as NotionBlock;

const createMockChildPageBlock = (id: string, title: string): NotionBlock =>
  ({
    object: 'block',
    id,
    parent: { type: 'page_id', page_id: 'parent-page-id' },
    created_time: '2022-01-01T00:00:00.000Z',
    last_edited_time: '2022-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'user-1' },
    last_edited_by: { object: 'user', id: 'user-1' },
    has_children: false,
    in_trash: false,
    archived: false,
    type: 'child_page',
    child_page: {
      title,
    },
  }) as NotionBlock;

const createMockTrackedBlock = (
  id: string,
  ref: NotionBlock,
): TrackedBlockReferenceObject => ({
  type: 'block',
  parentId: 'page-id',
  id,
  ref,
});

const createMockProperties = (
  props: NotionPageProperties,
): NotionPageProperties => {
  return props;
};

const createMockBlockTree = (
  overrides: Partial<ExtendedFetcherOutput>,
): ExtendedFetcherOutput => {
  return {
    blocks: [],
    pageRefBlockReferences: [],
    mediaBlockReferences: [],
    properties: {},
    comments: [],
    ...overrides,
  };
};

const createMockChainData = (overrides: Partial<ChainData>): ChainData => {
  return {
    pageId: 'test-page-id',
    blockTree: createMockBlockTree({}),
    content: '',
    manifests: {},
    ...overrides,
  };
};

describe('PageReferenceHandler', () => {
  let mockManifestManager: DeepMockProxy<PageReferenceManifestManager>;
  const pageId = 'test-page-id';

  beforeEach(() => {
    mockManifestManager = mockDeep<PageReferenceManifestManager>();
  });

  describe('Configuration Testing', () => {
    it('Should throw an error if config is missing `urlPropertyNameNotion`', () => {
      const config = {} as PageRefConfig;

      const createHandler = () =>
        new PageReferenceHandler(pageId, config, mockManifestManager);

      expect(createHandler).toThrow(PageReferenceHandlerError);
    });

    it('Should initialize successfully if `urlPropertyNameNotion` is provided', () => {
      const config: PageRefConfig = {
        urlPropertyNameNotion: 'URL',
      };

      const createHandler = () =>
        new PageReferenceHandler(pageId, config, mockManifestManager);

      expect(createHandler).not.toThrow();
    });
  });

  describe('Reference Property Testing', () => {
    const URL_PROP_NAME = 'Published URL';

    const config: PageRefConfig = {
      urlPropertyNameNotion: URL_PROP_NAME,
      useUrlPath: false,
    };

    it("should not create a manifest entry if the URL property doesn't exist", async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      const chainData = createMockChainData({
        blockTree: createMockBlockTree({ properties: {} }), // No properties
      });

      await handler.process(chainData);

      expect(mockManifestManager.updateEntry).not.toHaveBeenCalled();
    });

    describe('when property exists', () => {
      it('should create entry for a valid URL in a URL property', async () => {
        const handler = new PageReferenceHandler(
          pageId,
          config,
          mockManifestManager,
        );
        const properties = createMockProperties({
          [URL_PROP_NAME]: {
            type: 'url',
            url: 'https://example.com/valid-url',
          } as NotionPageProperty,
        });
        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            properties,
            pageRefBlockReferences: [
              createMockTrackedBlock('b-1', createMockParagraphBlock('b-1')),
            ],
          }),
        });

        await handler.process(chainData);

        expect(mockManifestManager.updateEntry).toHaveBeenCalledWith(
          pageId,
          expect.objectContaining({
            url: 'https://example.com/valid-url',
            source: PageReferenceEntryType.PROPERTY,
          }),
        );
      });

      it('should not create entry for an invalid URL in a URL property', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        const handler = new PageReferenceHandler(
          pageId,
          { ...config, failForward: true }, // Ensure it doesn't throw
          mockManifestManager,
        );
        const properties = createMockProperties({
          [URL_PROP_NAME]: {
            type: 'url',
            url: '/invalid-relative-path',
          } as NotionPageProperty,
        });
        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            properties,
            pageRefBlockReferences: [
              createMockTrackedBlock('b-1', createMockParagraphBlock('b-1')),
            ],
          }),
        });

        await handler.process(chainData);

        expect(mockManifestManager.updateEntry).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      });

      it('should create entry for a valid URL in a rich_text property', async () => {
        const handler = new PageReferenceHandler(
          pageId,
          config,
          mockManifestManager,
        );
        const properties = createMockProperties({
          [URL_PROP_NAME]: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                plain_text: 'https://example.com/valid-text-url',
              },
            ],
          } as NotionPageProperty,
        });
        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            properties,
            pageRefBlockReferences: [
              createMockTrackedBlock('b-1', createMockParagraphBlock('b-1')),
            ],
          }),
        });

        await handler.process(chainData);

        expect(mockManifestManager.updateEntry).toHaveBeenCalledWith(
          pageId,
          expect.objectContaining({
            url: 'https://example.com/valid-text-url',
          }),
        );
      });

      it('should create entry for a valid URL in a formula property', async () => {
        const handler = new PageReferenceHandler(
          pageId,
          config,
          mockManifestManager,
        );
        const properties = createMockProperties({
          [URL_PROP_NAME]: {
            type: 'formula',
            formula: {
              type: 'string',
              string: 'https://example.com/valid-formula-url',
            },
          } as NotionPageProperty,
        });
        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            properties,
            pageRefBlockReferences: [
              createMockTrackedBlock('b-1', createMockParagraphBlock('b-1')),
            ],
          }),
        });

        await handler.process(chainData);

        expect(mockManifestManager.updateEntry).toHaveBeenCalledWith(
          pageId,
          expect.objectContaining({
            url: 'https://example.com/valid-formula-url',
          }),
        );
      });

      it('should not create an entry for an unsupported property type', async () => {
        const handler = new PageReferenceHandler(
          pageId,
          config,
          mockManifestManager,
        );
        const properties = createMockProperties({
          [URL_PROP_NAME]: {
            type: 'number',
            number: 123,
          } as NotionPageProperty,
        });
        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            properties,
            pageRefBlockReferences: [
              createMockTrackedBlock('b-1', createMockParagraphBlock('b-1')),
            ],
          }),
        });

        await handler.process(chainData);

        expect(mockManifestManager.updateEntry).not.toHaveBeenCalled();
      });
    });
  });

  describe('Content Modification Testing', () => {
    const URL_PROP_NAME = 'Published URL';
    const config: PageRefConfig = {
      urlPropertyNameNotion: URL_PROP_NAME,
      useUrlPath: false,
    };
    const referencedPageId = '1107e9d7682d455287113965a3979313'; // Non-dashed format (normalized)
    const finalUrl = 'https://example.com/final-url-for-ref-page';

    beforeEach(() => {
      const manifestEntry: PageReferenceEntry = {
        url: finalUrl,
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      };
      mockManifestManager.getEntry
        .calledWith(referencedPageId)
        .mockReturnValue(manifestEntry);
    });

    it('should update block with link_to_page', async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      const linkToPageBlock = createMockTrackedBlock(
        'link-to-page-block-1',
        createMockLinkToPageBlock('link-to-page-block-1', referencedPageId),
      );

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [linkToPageBlock],
        }),
      });

      await handler.process(chainData);

      const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
        .ref as any;
      expect(updatedBlock.link_to_page.url).toBe(finalUrl);
    });

    it('should update block with child_page', async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      // NOTE: The pageId for a child_page block *is* its blockId.
      const childPageBlock = createMockTrackedBlock(
        referencedPageId,
        createMockChildPageBlock(referencedPageId, 'A sub-page title'),
      );

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [childPageBlock],
        }),
      });

      await handler.process(chainData);

      const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
        .ref as any;
      expect(updatedBlock.child_page.url).toBe(finalUrl);
    });

    it('should update block with page mention', async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      const mentionBlock = createMockTrackedBlock('mention-block-1', {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: { type: 'page', page: { id: referencedPageId } },
            },
          ],
        },
      } as NotionBlock);

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [mentionBlock],
        }),
      });

      await handler.process(chainData);

      const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
        .ref as any;
      expect(updatedBlock.paragraph.rich_text[0].href).toBe(finalUrl);
    });

    it('should update block with link_preview mention', async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      const notionPageUrl = `https://www.notion.so/refpage-${referencedPageId}`;
      const linkPreviewBlock = createMockTrackedBlock('link-preview-block-1', {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: {
                type: 'link_preview',
                link_preview: { url: notionPageUrl },
              },
            },
          ],
        },
      } as NotionBlock);

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [linkPreviewBlock],
        }),
      });

      await handler.process(chainData);

      const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
        .ref as any;
      expect(updatedBlock.paragraph.rich_text[0].mention.link_preview.url).toBe(
        finalUrl,
      );
      expect(updatedBlock.paragraph.rich_text[0].href).toBe(finalUrl);
    });

    it('should update block with a text link to a notion page', async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      const notionPageUrl = `https://www.notion.so/some-slug-here-${referencedPageId}`;
      const textLinkBlock = createMockTrackedBlock('text-link-block-1', {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              href: notionPageUrl,
              plain_text: 'a link',
              text: {
                content: 'a link',
                link: {
                  url: notionPageUrl,
                },
              },
            },
          ],
        },
      } as NotionBlock);

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [textLinkBlock],
        }),
      });

      console.log('### ', JSON.stringify(chainData, null, 2));

      await handler.process(chainData);

      const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
        .ref as any;
      console.log('@@@@ ', JSON.stringify(chainData, null, 2));
      expect(updatedBlock.paragraph.rich_text[0].href).toBe(finalUrl);
      expect(updatedBlock.paragraph.rich_text[0].text.link.url).toBe(finalUrl);
    });

    it('should not update block if manifest has no record', async () => {
      mockManifestManager.getEntry
        .calledWith('unresolved-page')
        .mockReturnValue(null);
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );

      const originalBlock = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: { type: 'page', page: { id: 'unresolved-page' } },
            },
          ],
        },
      } as NotionBlock;

      const mentionBlock = createMockTrackedBlock(
        'mention-block-2',
        originalBlock,
      );
      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [mentionBlock],
        }),
      });
      const originalJson = JSON.stringify(mentionBlock.ref);
      await handler.process(chainData);

      const processedJson = JSON.stringify(
        chainData.blockTree.pageRefBlockReferences![0].ref,
      );
      expect(processedJson).toBe(originalJson);
    });

    it('should update block with transformed URL', async () => {
      const transformedUrl = 'https://transformed.com/path';
      const handler = new PageReferenceHandler(
        pageId,
        {
          ...config,
          useUrlPath: false, // Explicitly false for this test
          transformUrl: (url: string) => {
            expect(url).toBe(finalUrl);
            return transformedUrl;
          },
        },
        mockManifestManager,
      );

      const mentionBlock = createMockTrackedBlock('mention-block-3', {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: { type: 'page', page: { id: referencedPageId } },
            },
          ],
        },
      } as NotionBlock);

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [mentionBlock],
        }),
      });

      await handler.process(chainData);

      const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
        .ref as any;
      expect(updatedBlock.paragraph.rich_text[0].href).toBe(transformedUrl);
    });

    it('should not modify external links', async () => {
      const handler = new PageReferenceHandler(
        pageId,
        config,
        mockManifestManager,
      );
      const externalLink = 'https://google.com';

      const textBlock = createMockTrackedBlock('text-block-1', {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { link: { url: externalLink } } }],
        },
      } as NotionBlock);

      const chainData = createMockChainData({
        blockTree: createMockBlockTree({
          pageRefBlockReferences: [textBlock],
        }),
      });

      const originalJson = JSON.stringify(textBlock.ref);
      await handler.process(chainData);
      const processedJson = JSON.stringify(
        chainData.blockTree.pageRefBlockReferences![0].ref,
      );

      expect(processedJson).toBe(originalJson);
    });

    describe('with useUrlPath configuration', () => {
      it('should update block with only the path when useUrlPath is true', async () => {
        const handler = new PageReferenceHandler(
          pageId,
          {
            ...config,
            useUrlPath: true,
          },
          mockManifestManager,
        );
        const linkToPageBlock = createMockTrackedBlock(
          'link-to-page-block-url-path',
          createMockLinkToPageBlock(
            'link-to-page-block-url-path',
            referencedPageId,
          ),
        );

        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            pageRefBlockReferences: [linkToPageBlock],
          }),
        });

        await handler.process(chainData);

        const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
          .ref as any;
        expect(updatedBlock.link_to_page.url).toBe(new URL(finalUrl).pathname);
      });

      it('should update block with the full URL when useUrlPath is false', async () => {
        const handler = new PageReferenceHandler(
          pageId,
          {
            ...config,
            useUrlPath: false, // Explicitly false
          },
          mockManifestManager,
        );
        const linkToPageBlock = createMockTrackedBlock(
          'link-to-page-block-full-url',
          createMockLinkToPageBlock(
            'link-to-page-block-full-url',
            referencedPageId,
          ),
        );

        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            pageRefBlockReferences: [linkToPageBlock],
          }),
        });

        await handler.process(chainData);

        const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
          .ref as any;
        expect(updatedBlock.link_to_page.url).toBe(finalUrl);
      });

      it('should prioritize transformUrl over useUrlPath', async () => {
        const transformedUrl = 'https://custom-transformed.com/overridden';
        const handler = new PageReferenceHandler(
          pageId,
          {
            ...config,
            useUrlPath: true, // This should be ignored
            transformUrl: (url: string) => {
              expect(url).toBe(finalUrl); // Still receives the full URL
              return transformedUrl;
            },
          },
          mockManifestManager,
        );
        const linkToPageBlock = createMockTrackedBlock(
          'link-to-page-block-transform-override',
          createMockLinkToPageBlock(
            'link-to-page-block-transform-override',
            referencedPageId,
          ),
        );

        const chainData = createMockChainData({
          blockTree: createMockBlockTree({
            pageRefBlockReferences: [linkToPageBlock],
          }),
        });

        await handler.process(chainData);

        const updatedBlock = chainData.blockTree.pageRefBlockReferences![0]
          .ref as any;
        expect(updatedBlock.link_to_page.url).toBe(transformedUrl);
      });
    });
  });
});
