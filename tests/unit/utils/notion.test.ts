import { describe, it, expect } from 'vitest';
import {
  isMediaBlock,
  isRawUUID,
  isLinkToPageBlock,
  isChildPageBlock,
  isMentionPage,
  isLinkPreviewMention,
  isTextLinkedToNotionPage,
  isNotionPageUrl,
  isValidURL,
  extractUrlFromNotionProperty,
  isPageRefBlock,
  extractNotionPageIdFromUrl,
  normalizeUUID,
  isNotionS3Url,
  extractPageIdFromBlock,
  isPageRefProperty,
  isMediaProperty,
} from '@/utils/notion';
import { NotionBlock, NotionDatabaseEntryProperty } from '@/types/notion';

describe('Notion Utils', () => {
  describe('isMediaBlock', () => {
    it('should return true for media block types (image, video, file, pdf)', () => {
      expect(isMediaBlock({ type: 'image' } as NotionBlock)).toBe(true);
      expect(isMediaBlock({ type: 'video' } as NotionBlock)).toBe(true);
      expect(isMediaBlock({ type: 'file' } as NotionBlock)).toBe(true);
      expect(isMediaBlock({ type: 'pdf' } as NotionBlock)).toBe(true);
    });

    it('should return false for non-media block types', () => {
      expect(isMediaBlock({ type: 'paragraph' } as NotionBlock)).toBe(false);
      expect(isMediaBlock({ type: 'heading_1' } as NotionBlock)).toBe(false);
    });
  });

  describe('isRawUUID', () => {
    it('should return true for a valid raw UUID', () => {
      expect(isRawUUID('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6')).toBe(true);
    });

    it('should return false for an invalid UUID', () => {
      expect(isRawUUID('not-a-uuid')).toBe(false);
      expect(isRawUUID('a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6')).toBe(false);
    });
  });

  describe('isLinkToPageBlock', () => {
    it('should return true for a valid link_to_page block', () => {
      const block = {
        type: 'link_to_page',
        link_to_page: { type: 'page_id', page_id: 'some-uuid' },
      } as NotionBlock;
      expect(isLinkToPageBlock(block)).toBe(true);
    });

    it('should return false for other block types', () => {
      const block = { type: 'paragraph' } as NotionBlock;
      expect(isLinkToPageBlock(block)).toBe(false);
    });
  });

  describe('isChildPageBlock', () => {
    it('should return true for a valid child_page block', () => {
      const block = {
        type: 'child_page',
        child_page: { title: 'Test Page' },
      } as NotionBlock;
      expect(isChildPageBlock(block)).toBe(true);
    });
  });

  describe('isMentionPage', () => {
    it('should return true for a block with a page mention', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'mention', mention: { type: 'page' } }],
        },
      } as any;
      expect(isMentionPage(block)).toBe(true);
    });
  });

  describe('isLinkPreviewMention', () => {
    it('should return true for a link_preview mention of a Notion page', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: {
                type: 'link_preview',
                link_preview: {
                  url: 'https://www.notion.so/some-page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
                },
              },
            },
          ],
        },
      } as any;
      expect(isLinkPreviewMention(block)).toBe(true);
    });

    it('should return false for a link_preview mention of a non-Notion page url', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: {
                type: 'link_preview',
                link_preview: {
                  url: 'https://example.com',
                },
              },
            },
          ],
        },
      } as any;
      expect(isLinkPreviewMention(block)).toBe(false);
    });
  });

  describe('isTextLinkedToNotionPage', () => {
    it('should return true for text with a Notion page link', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                link: {
                  url: 'https://www.notion.so/some-page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
                },
              },
            },
          ],
        },
      } as any;
      expect(isTextLinkedToNotionPage(block)).toBe(true);
    });

    it('should return false for text with a non-Notion page link', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                link: {
                  url: 'https://example.com',
                },
              },
            },
          ],
        },
      } as any;
      expect(isTextLinkedToNotionPage(block)).toBe(false);
    });
  });

  describe('isNotionPageUrl', () => {
    describe('Relative Notion page paths', () => {
      it('should return true for valid relative paths with UUID', () => {
        expect(isNotionPageUrl('/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6')).toBe(true);
        expect(isNotionPageUrl('/123456789abcdef123456789abcdef12')).toBe(true);
        expect(isNotionPageUrl('/ABCDEF1234567890abcdef1234567890')).toBe(true); // Mixed case
      });

      it('should return false for relative paths with invalid UUIDs', () => {
        expect(isNotionPageUrl('/short-uuid')).toBe(false);
        expect(isNotionPageUrl('/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6x')).toBe(
          false,
        ); // 33 chars
        expect(isNotionPageUrl('/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d')).toBe(false); // 31 chars
        expect(isNotionPageUrl('/a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6')).toBe(
          false,
        ); // With dashes
        expect(isNotionPageUrl('/not-a-uuid-at-all')).toBe(false);
      });

      it('should return false for paths that do not start with /', () => {
        expect(isNotionPageUrl('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6')).toBe(false);
        expect(
          isNotionPageUrl('relative/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
        ).toBe(false);
      });

      it('should return true for paths that contain query parameters and fragments', () => {
        expect(isNotionPageUrl('/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6?v=123')).toBe(
          true,
        );
        expect(
          isNotionPageUrl('/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6#section'),
        ).toBe(true);
      });
    });

    describe('Absolute Notion URLs', () => {
      describe('notion.so domain', () => {
        it('should return true for valid notion.so URLs with UUID', () => {
          expect(
            isNotionPageUrl(
              'https://www.notion.so/Page-Title-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(true);
          expect(
            isNotionPageUrl(
              'https://notion.so/My-Awesome-Page-123456789abcdef123456789abcdef12',
            ),
          ).toBe(true);
          expect(
            isNotionPageUrl(
              'https://www.notion.so/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(true); // Just UUID
          expect(
            isNotionPageUrl(
              'https://notion.so/workspace/Page-With-Multiple-Dashes-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(true);
        });

        it('should return false for notion.so URLs without valid UUID', () => {
          expect(
            isNotionPageUrl('https://www.notion.so/Page-Title-invalid-uuid'),
          ).toBe(false);
          expect(isNotionPageUrl('https://notion.so/just-a-page-title')).toBe(
            false,
          );
          expect(isNotionPageUrl('https://www.notion.so/Page-Title-')).toBe(
            false,
          ); // Empty UUID part
          expect(isNotionPageUrl('https://notion.so/')).toBe(false); // Root path
        });
      });

      describe('notion.com domain', () => {
        it('should return true for valid notion.com URLs with UUID', () => {
          expect(
            isNotionPageUrl(
              'https://www.notion.com/Page-Title-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(true);
          expect(
            isNotionPageUrl(
              'https://notion.com/workspace/Project-Notes-123456789abcdef123456789abcdef12',
            ),
          ).toBe(true);
        });

        it('should return false for notion.com URLs without valid UUID', () => {
          expect(isNotionPageUrl('https://www.notion.com/pricing')).toBe(false);
          expect(isNotionPageUrl('https://notion.com/help')).toBe(false);
        });
      });

      describe('Custom workspace domains', () => {
        it('should return false for custom workspace domains (not supported)', () => {
          expect(
            isNotionPageUrl(
              'https://myworkspace.notion.so/Page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(false);
          expect(
            isNotionPageUrl(
              'https://company.notion.site/Project-123456789abcdef123456789abcdef12',
            ),
          ).toBe(false);
        });
      });

      describe('Non-Notion domains', () => {
        it('should return false for non-Notion domains', () => {
          expect(
            isNotionPageUrl(
              'https://example.com/page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(false);
          expect(isNotionPageUrl('https://google.com')).toBe(false);
          expect(
            isNotionPageUrl(
              'https://notion-like.com/page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(false);
          expect(
            isNotionPageUrl(
              'https://fakenotion.so/page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            ),
          ).toBe(false);
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle malformed URLs', () => {
        expect(isNotionPageUrl('')).toBe(false);
        expect(isNotionPageUrl('not-a-url-at-all')).toBe(false);
        expect(isNotionPageUrl('https://')).toBe(false);
        expect(isNotionPageUrl('://malformed')).toBe(false);
        expect(isNotionPageUrl('https://[invalid-url')).toBe(false);
      });
    });
  });

  describe('isValidURL', () => {
    it('should return the URL if valid', () => {
      expect(isValidURL('https://example.com')).toBeInstanceOf(URL);
    });
    it('should return null if invalid', () => {
      expect(isValidURL('not a url')).toBe(null);
    });
  });

  describe('extractUrlFromNotionProperty', () => {
    it('should extract URL from a URL property', () => {
      const prop = { type: 'url', url: 'https://example.com' } as any;
      expect(extractUrlFromNotionProperty(prop)).toBe('https://example.com');
    });

    it('should extract URL from a formula property', () => {
      const prop = {
        type: 'formula',
        formula: { type: 'string', string: 'https://example.com' },
      } as any;
      expect(extractUrlFromNotionProperty(prop)).toBe('https://example.com');
    });

    it('should extract URL from a rich_text property', () => {
      const prop = {
        type: 'rich_text',
        rich_text: [{ plain_text: 'https://example.com' }],
      } as any;
      expect(extractUrlFromNotionProperty(prop)).toBe('https://example.com');
    });

    it('should return null for empty/null values', () => {
      expect(
        extractUrlFromNotionProperty({ type: 'url', url: null } as any),
      ).toBe(null);
      expect(
        extractUrlFromNotionProperty({
          type: 'rich_text',
          rich_text: [],
        } as any),
      ).toBe(null);
      expect(
        extractUrlFromNotionProperty({
          type: 'formula',
          formula: { type: 'string', string: null },
        } as any),
      ).toBe(null);
    });

    it('should return null for non-http URLs', () => {
      expect(
        extractUrlFromNotionProperty({
          type: 'url',
          url: '/relative-path',
        } as any),
      ).toBe('/relative-path');
      expect(
        extractUrlFromNotionProperty({
          type: 'rich_text',
          rich_text: [{ plain_text: 'just text' }],
        } as any),
      ).toBe(null);
      expect(
        extractUrlFromNotionProperty({
          type: 'formula',
          formula: { type: 'string', string: 'not a url' },
        } as any),
      ).toBe(null);
    });

    it('should return null for different formula types other than string', () => {
      expect(
        extractUrlFromNotionProperty({
          type: 'formula',
          formula: { type: 'number', number: 123 },
        } as any),
      ).toBe(null);
    });
  });

  describe('isPageRefBlock', () => {
    it('should return true for link_to_page blocks', () => {
      const linkToPage = {
        type: 'link_to_page',
        link_to_page: { type: 'page_id', page_id: 'some-uuid' },
      } as NotionBlock;
      expect(isPageRefBlock(linkToPage)).toBe(true);
    });

    it('should return true for child_page blocks', () => {
      const childPage = {
        type: 'child_page',
        child_page: { title: 'Test Page' },
      } as NotionBlock;
      expect(isPageRefBlock(childPage)).toBe(true);
    });

    it('should return true for mention blocks with page references', () => {
      const mentionBlock = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: { type: 'page', page: { id: 'page-uuid' } },
            },
          ],
        },
      } as NotionBlock;
      expect(isPageRefBlock(mentionBlock)).toBe(true);
    });

    it('should return true for blocks with link preview mentions', () => {
      const linkPreviewBlock = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: {
                type: 'link_preview',
                link_preview: { url: '/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6' },
              },
            },
          ],
        },
      } as NotionBlock;
      expect(isPageRefBlock(linkPreviewBlock)).toBe(true);
    });

    it('should return true for blocks with text linked to a Notion page', () => {
      const notionLinkBlock = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                link: {
                  url: '/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
                },
              },
            },
          ],
        },
      } as NotionBlock;
      expect(isPageRefBlock(notionLinkBlock)).toBe(true);
    });

    it('should return false for non-page reference blocks', () => {
      const regularBlock = {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'Regular text' } }],
        },
      } as NotionBlock;
      expect(isPageRefBlock(regularBlock)).toBe(false);
    });
  });

  describe('extractNotionPageIdFromUrl', () => {
    const rawId = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
    const normalizedId = 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6';

    it('should extract and normalize page ID from relative paths', () => {
      expect(extractNotionPageIdFromUrl(`/${rawId}`)).toBe(normalizedId);
      expect(
        extractNotionPageIdFromUrl(`/123456789abcdef123456789abcdef12`),
      ).toBe('12345678-9abc-def1-2345-6789abcdef12');
    });

    it('should extract and normalize page ID from absolute URLs with titles "https://www.notion.so/Page-Title-<uuid>"', () => {
      expect(
        extractNotionPageIdFromUrl(`https://www.notion.so/Page-Title-${rawId}`),
      ).toBe(normalizedId);
      expect(
        extractNotionPageIdFromUrl(
          `https://notion.so/My-Complex-Page-Title-${rawId}`,
        ),
      ).toBe(normalizedId);
      expect(
        extractNotionPageIdFromUrl(
          `https://www.notion.so/Multiple-Dash-Title-${rawId}`,
        ),
      ).toBe(normalizedId);
    });

    it('should extract and normalize page ID from absolute URLs without titles "https://www.notion.so/<uuid>"', () => {
      expect(extractNotionPageIdFromUrl(`https://www.notion.so/${rawId}`)).toBe(
        normalizedId,
      );
      expect(extractNotionPageIdFromUrl(`https://notion.so/${rawId}`)).toBe(
        normalizedId,
      );
    });

    it('should handle URLs with query parameters and fragments', () => {
      expect(
        extractNotionPageIdFromUrl(`https://www.notion.so/Page-${rawId}?v=123`),
      ).toBe(normalizedId);

      expect(extractNotionPageIdFromUrl(`/${rawId}#section`)).toBe(
        normalizedId,
      );
    });

    it('should return null for invalid UUIDs', () => {
      expect(extractNotionPageIdFromUrl('')).toBe(null);
      expect(extractNotionPageIdFromUrl('/short-uuid')).toBe(null);
      expect(
        extractNotionPageIdFromUrl('/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6x'),
      ).toBe(null); // 33 chars
      expect(
        extractNotionPageIdFromUrl('https://www.notion.so/Page-invalid-uuid'),
      ).toBe(null);
    });

    it('should return null for non-Notion URLs', () => {
      expect(
        extractNotionPageIdFromUrl(`https://example.com/page-${rawId}`),
      ).toBe(null);
      expect(extractNotionPageIdFromUrl('https://google.com')).toBe(null);
    });

    it('should return null for malformed URLs', () => {
      expect(extractNotionPageIdFromUrl('not-a-url')).toBe(null);
      expect(extractNotionPageIdFromUrl('https://')).toBe(null);
      expect(extractNotionPageIdFromUrl('://malformed')).toBe(null);
    });
  });

  describe('normalizeUUID', () => {
    it('should add hyphens to a raw UUID', () => {
      const raw = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
      const normalized = 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6';
      expect(normalizeUUID(raw)).toBe(normalized);
    });

    it('should return a hyphenated UUID as-is', () => {
      const normalized = 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6';
      expect(normalizeUUID(normalized)).toBe(normalized);
    });
  });

  describe('isNotionS3Url', () => {
    it('should return true for Notion s3 URLs', () => {
      expect(
        isNotionS3Url(
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/some-file',
        ),
      ).toBe(true);
    });

    it('should return false for other URLs', () => {
      expect(isNotionS3Url('https://example.com/image.png')).toBe(false);
    });
  });

  describe('extractPageIdFromBlock', () => {
    it('should extract page ID from a link_to_page block', () => {
      const block = {
        type: 'link_to_page',
        link_to_page: { type: 'page_id', page_id: 'some-uuid' },
      } as any;
      expect(extractPageIdFromBlock(block)).toBe('some-uuid');
    });

    it('should extract page ID from a page mention', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: { type: 'page', page: { id: 'mention-uuid' } },
            },
          ],
        },
      } as any;
      expect(extractPageIdFromBlock(block)).toBe('mention-uuid');
    });

    it('should extract page ID from a link preview mention', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'mention',
              mention: {
                type: 'link_preview',
                link_preview: {
                  url: 'https://www.notion.so/Page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
                },
              },
            },
          ],
        },
      } as any;
      expect(extractPageIdFromBlock(block)).toBe(
        'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
      );
    });

    it('should extract page ID from text links to Notion pages', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                link: { url: '/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6' },
              },
            },
          ],
        },
      } as any;
      expect(extractPageIdFromBlock(block)).toBe(
        'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
      );
    });

    it('should return null for blocks with non-Notion URLs', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                link: { url: 'https://example.com/page' },
              },
            },
          ],
        },
      } as any;
      expect(extractPageIdFromBlock(block)).toBe(null);
    });

    it('should return null for empty rich_text', () => {
      const block = {
        type: 'paragraph',
        paragraph: { rich_text: [] },
      } as any;
      expect(extractPageIdFromBlock(block)).toBe(null);
    });
  });

  describe('isPageRefProperty', () => {
    it('should return true for properties with direct page mentions', () => {
      const property = {
        type: 'rich_text',
        rich_text: [
          {
            type: 'mention',
            mention: { type: 'page', page: { id: 'page-uuid' } },
          },
        ],
      } as NotionDatabaseEntryProperty;
      expect(isPageRefProperty(property)).toBe(true);
    });

    it('should return true for properties with link preview mentions', () => {
      const property = {
        type: 'rich_text',
        rich_text: [
          {
            type: 'mention',
            mention: {
              type: 'link_preview',
              link_preview: {
                url: 'https://www.notion.so/Page-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
              },
            },
          },
        ],
      } as any;
      expect(isPageRefProperty(property)).toBe(true);
    });

    it('should return true for properties with text links to Notion pages', () => {
      const property = {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              link: { url: '/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6' },
            },
          },
        ],
      } as NotionDatabaseEntryProperty;
      expect(isPageRefProperty(property)).toBe(true);
    });

    it('should return false for non-rich_text properties', () => {
      const property = {
        type: 'title',
        title: [{ plain_text: 'Title' }],
      } as NotionDatabaseEntryProperty;
      expect(isPageRefProperty(property)).toBe(false);
    });

    it('should return false for rich_text without page references', () => {
      const property = {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: { content: 'Regular text' },
          },
        ],
      } as NotionDatabaseEntryProperty;
      expect(isPageRefProperty(property)).toBe(false);
    });

    it('should return false for rich_text with non-Notion links', () => {
      const property = {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              link: { url: 'https://example.com' },
            },
          },
        ],
      } as NotionDatabaseEntryProperty;
      expect(isPageRefProperty(property)).toBe(false);
    });
  });

  describe('isMediaProperty', () => {
    it('should return true for a files property with files', () => {
      const prop = {
        type: 'files',
        files: [{ name: 'file.pdf', type: 'file', file: { url: '' } }],
      } as any;
      expect(isMediaProperty(prop)).toBe(true);
    });

    it('should return false for an empty files property', () => {
      const prop = { type: 'files', files: [] } as any;
      expect(isMediaProperty(prop)).toBe(false);
    });
  });
});
