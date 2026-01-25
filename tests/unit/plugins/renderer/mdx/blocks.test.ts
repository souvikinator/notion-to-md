import { describe, it, expect, vi } from 'vitest';
import { blockTransformers } from '@/plugins/renderer/mdx/transformers/blocks';
import { NotionBlock } from '@/types/notion';
import { RendererContext } from '@/types/renderer';

/**
 * Test Suite for MDX Block Transformers
 * Focus: Issue #140 - Nested Lists and Math Rendering in Callouts
 */

// Mock utilities for testing transformers
const createMockUtils = () => {
  const processedBlocks = new Map<string, string>();

  return {
    transformRichText: vi.fn(async (richText: any[]) => {
      if (!richText || richText.length === 0) return '';
      return richText.map((rt) => rt.plain_text).join('');
    }),

    processBlock: vi.fn(async (block: NotionBlock, metadata?: any) => {
      // Cache to prevent infinite recursion
      const cacheKey = `${block.id}-${JSON.stringify(metadata || {})}`;
      if (processedBlocks.has(cacheKey)) {
        return processedBlocks.get(cacheKey)!;
      }

      const transformer = blockTransformers[block.type];
      if (!transformer) return '';

      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: metadata || {},
        block,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils: createMockUtils(),
        manifest: {},
      };

      const result = await transformer.transform(context);
      processedBlocks.set(cacheKey, result);
      return result;
    }),

    formatAsMarkdownTable: vi.fn((headers: string[], rows: string[][]) => {
      const headerRow = `| ${headers.join(' | ')} |`;
      const separator = `| ${headers.map(() => '---').join(' | ')} |`;
      const dataRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
      return `${headerRow}\n${separator}\n${dataRows}`;
    }),

    transformDatabaseProperties: vi.fn(async () => ({})),
  };
};

// Helper to create mock blocks
const createMockBlock = (
  type: string,
  content: any,
  children: NotionBlock[] = [],
): NotionBlock => {
  return {
    object: 'block',
    id: `block-${Math.random().toString(36).substr(2, 9)}`,
    type: type as any,
    created_time: new Date().toISOString(),
    created_by: { object: 'user', id: 'user-1' },
    last_edited_time: new Date().toISOString(),
    last_edited_by: { object: 'user', id: 'user-1' },
    has_children: children.length > 0,
    archived: false,
    in_trash: false,
    parent: { type: 'page_id', page_id: 'page-1' },
    [type]: content,
    children,
    comments: [],
  } as any;
};

describe('Block Transformers - Issue #140', () => {
  describe('Callout with nested numbered list', () => {
    it('should properly format nested numbered list items inside callout', async () => {
      // Create a callout with nested numbered list
      const numberedListItem1 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'First item', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const numberedListItem2 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Second item', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const calloutBlock = createMockBlock(
        'callout',
        {
          rich_text: [
            { type: 'text', plain_text: 'PROOF', annotations: { bold: true } },
          ],
          icon: { type: 'emoji', emoji: '📌' },
          color: 'default',
        },
        [numberedListItem1, numberedListItem2],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: calloutBlock,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.callout!.transform(context);

      // Expected: Nested list items should be properly prefixed with "> "
      // and maintain their numbering
      expect(result).toContain('> 📌 PROOF');
      expect(result).toContain('> 1. First item');
      expect(result).toContain('> 2. Second item');
    });

    it('should maintain nested list numbering across multiple levels', async () => {
      // Create nested structure: callout > list item > nested list item
      const nestedListItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Nested item', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const parentListItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Parent item', annotations: {} },
          ],
          color: 'default',
        },
        [nestedListItem],
      );

      const calloutBlock = createMockBlock(
        'callout',
        {
          rich_text: [{ type: 'text', plain_text: 'Note', annotations: {} }],
          icon: { type: 'emoji', emoji: '💡' },
          color: 'default',
        },
        [parentListItem],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: calloutBlock,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.callout!.transform(context);

      // Should have proper indentation for nested list
      expect(result).toContain('> 1. Parent item');
      expect(result).toContain('>     1. Nested item'); // 4 spaces indent
    });
  });

  describe('Numbered list with nested equation block', () => {
    it('should render equation block nested in numbered list item', async () => {
      // Create equation block
      const equationBlock = createMockBlock(
        'equation',
        {
          expression: '\\gcd(a,b) = am+bn',
        },
        [],
      );

      // Create numbered list item with equation as child
      const listItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'We have concluded that given a and b',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [equationBlock],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.numbered_list_item!.transform(context);

      // Should contain the list item text
      expect(result).toContain('1. We have concluded that given a and b');

      // Should contain the equation block
      expect(result).toContain('$$');
      expect(result).toContain('\\gcd(a,b) = am+bn');
    });

    it('should handle equation block with proper indentation at nested level', async () => {
      const equationBlock = createMockBlock(
        'equation',
        {
          expression:
            '\\begin{split}\nc &= ax+by \\\\\nkd &= k(am+bn)\n\\end{split}',
        },
        [],
      );

      const listItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Proof step', annotations: {} },
          ],
          color: 'default',
        },
        [equationBlock],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: { listLevel: 0 }, // At nested level
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.numbered_list_item!.transform(context);

      // Should maintain indentation
      // Level 1 indentation is 4 spaces
      expect(result).toContain('1. Proof step');
      // The equation should be indented with 4 spaces
      expect(result).toMatch(/\n {4}\$\$/);
      expect(result).toMatch(/\n {4}\\begin{split}/);
    });
  });

  describe('Callout with mixed nested content', () => {
    it('should handle callout with numbered list, paragraphs, and equations', async () => {
      // Create complex nested structure similar to user's issue
      const paragraph = createMockBlock(
        'paragraph',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Part 1: Proof that there are at least one solution',
              annotations: { italic: true },
            },
          ],
          color: 'default',
        },
        [],
      );

      const equation = createMockBlock(
        'equation',
        {
          expression: 'd = am+bn',
        },
        [],
      );

      const listItem1 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'We can always find m,n such that gcd(a,b) = am+bn',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [equation],
      );

      const listItem2 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Let gcd(a,b)=d', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const calloutBlock = createMockBlock(
        'callout',
        {
          rich_text: [
            { type: 'text', plain_text: 'PROOF', annotations: { bold: true } },
          ],
          icon: { type: 'emoji', emoji: '📐' },
          color: 'default',
        },
        [paragraph, listItem1, listItem2],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: calloutBlock,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.callout!.transform(context);

      // All content should be prefixed with "> "
      expect(result).toContain('> 📐 PROOF');
      expect(result).toContain('> Part 1'); // Paragraph
      expect(result).toContain('> 1. We can always find'); // First list item
      expect(result).toContain('> 2. Let gcd(a,b)=d'); // Second list item

      // Equation is nested inside the first list item, so it should be indented
      // Indentation: 4 spaces (Level 1) + "> " prefix from callout
      expect(result).toMatch(/> {5}\$\$/);
      expect(result).toMatch(/> {5}d = am\+bn/);
    });

    it('should handle deeply nested callout > list > nested list > equation', async () => {
      const equation = createMockBlock(
        'equation',
        {
          expression: 'x = km - \\frac{tb}{d}',
        },
        [],
      );

      const nestedListItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Sub-proof assumption',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [equation],
      );

      const parentListItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Main proof with nested steps',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [nestedListItem],
      );

      const calloutBlock = createMockBlock(
        'callout',
        {
          rich_text: [{ type: 'text', plain_text: 'PROOF', annotations: {} }],
          icon: { type: 'emoji', emoji: '🔬' },
          color: 'default',
        },
        [parentListItem],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: calloutBlock,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.callout!.transform(context);

      // Check proper nesting structure
      expect(result).toContain('> 1. Main proof'); // Level 0
      expect(result).toContain('>     1. Sub-proof'); // Level 1 (4 space indent)

      // Equation is nested inside Sub-proof (Level 1 list item)
      // So it is at Level 2 indentation (8 spaces)
      // Plus "> " prefix from callout
      expect(result).toMatch(/> {9}\$\$/);
      expect(result).toMatch(/> {9}x = km/);
    });
  });

  describe('Numbered list item with non-list children', () => {
    it('should not treat equation blocks as numbered list items', async () => {
      const equation = createMockBlock(
        'equation',
        {
          expression: 'E = mc^2',
        },
        [],
      );

      const paragraph = createMockBlock(
        'paragraph',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'This is an explanation',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [],
      );

      const listItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Item with mixed children',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [equation, paragraph],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.numbered_list_item!.transform(context);

      // Should render list item with number
      expect(result).toContain('1. Item with mixed children');

      // Should render equation without treating it as a list item
      expect(result).toContain('$$');
      expect(result).toContain('E = mc^2');

      // Should render paragraph
      expect(result).toContain('This is an explanation');

      // Should NOT have "2." for equation or paragraph
      expect(result).not.toContain('2. $$');
      expect(result).not.toContain('2. This is an explanation');
    });
  });

  describe('Equation block context awareness', () => {
    it('should render equation block standalone', async () => {
      const equationBlock = createMockBlock(
        'equation',
        {
          expression: '\\int_0^1 x^2 dx = \\frac{1}{3}',
        },
        [],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: equationBlock,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.equation!.transform(context);

      expect(result).toContain('$$');
      expect(result).toContain('\\int_0^1 x^2 dx = \\frac{1}{3}');
      expect(result).toContain('\n$$\n'); // Block equation format
    });
  });
});

/**
 * Test Suite for Issue #162 - Block indentation is not preserved
 * Focus: Nested content (paragraph, image, callout, quote) inside list items
 */
describe('Block Transformers - Issue #162', () => {
  describe('Paragraph nested inside list items', () => {
    it('should indent paragraph when nested inside bulleted list item', async () => {
      const paragraph = createMockBlock(
        'paragraph',
        {
          rich_text: [
            { type: 'text', plain_text: 'Image in point 1', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const listItem = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 1', annotations: {} },
          ],
          color: 'default',
        },
        [paragraph],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.bulleted_list_item!.transform(context);

      // Should contain the list item text
      expect(result).toContain('- Minor point 1');

      // Paragraph should be indented with 4 spaces (level 1)
      expect(result).toContain('    Image in point 1');
    });

    it('should indent paragraph when nested inside numbered list item', async () => {
      const paragraph = createMockBlock(
        'paragraph',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Explanation text here',
              annotations: {},
            },
          ],
          color: 'default',
        },
        [],
      );

      const listItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Step one', annotations: {} },
          ],
          color: 'default',
        },
        [paragraph],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.numbered_list_item!.transform(context);

      // Should contain the list item text
      expect(result).toContain('1. Step one');

      // Paragraph should be indented with 4 spaces (level 1)
      expect(result).toContain('    Explanation text here');
    });
  });

  describe('Image nested inside list items', () => {
    it('should indent image when nested inside bulleted list item', async () => {
      const image = createMockBlock(
        'image',
        {
          type: 'external',
          external: { url: 'https://example.com/image.png' },
          caption: [{ type: 'text', plain_text: 'My Image', annotations: {} }],
        },
        [],
      );

      const listItem = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 1', annotations: {} },
          ],
          color: 'default',
        },
        [image],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.bulleted_list_item!.transform(context);

      // Should contain the list item text
      expect(result).toContain('- Minor point 1');

      // Image should be indented with 4 spaces (level 1)
      expect(result).toContain(
        '    ![My Image](https://example.com/image.png)',
      );
    });
  });

  describe('Quote nested inside list items', () => {
    it('should indent quote when nested inside bulleted list item', async () => {
      const quote = createMockBlock(
        'quote',
        {
          rich_text: [
            { type: 'text', plain_text: 'Quote in point 3', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const listItem = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 3', annotations: {} },
          ],
          color: 'default',
        },
        [quote],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.bulleted_list_item!.transform(context);

      // Should contain the list item text
      expect(result).toContain('- Minor point 3');

      // Quote should be indented with 4 spaces (level 1)
      expect(result).toContain('    > Quote in point 3');
    });
  });

  describe('Callout nested inside list items', () => {
    it('should indent callout when nested inside bulleted list item', async () => {
      const callout = createMockBlock(
        'callout',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Callout in point 2',
              annotations: {},
            },
          ],
          icon: { type: 'emoji', emoji: '💡' },
          color: 'default',
        },
        [],
      );

      const listItem = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 2', annotations: {} },
          ],
          color: 'default',
        },
        [callout],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.bulleted_list_item!.transform(context);

      // Should contain the list item text
      expect(result).toContain('- Minor point 2');

      // Callout should be indented with 4 spaces (level 1)
      expect(result).toContain('    > 💡 Callout in point 2');
    });
  });

  describe('Full Issue #162 example - mixed nested content', () => {
    it('should preserve indentation for all nested content types', async () => {
      // Create the exact structure from Issue #162:
      // - Major point
      //     - Minor point 1
      //         Image in point 1
      //         ![Image](/media/image.png)
      //     - Minor point 2
      //         > 💡 > Callout in point 2
      //     - Minor point 3
      //         > Quote in point 3

      const paragraph = createMockBlock(
        'paragraph',
        {
          rich_text: [
            { type: 'text', plain_text: 'Image in point 1', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const image = createMockBlock(
        'image',
        {
          type: 'external',
          external: { url: '/media/image.png' },
          caption: [{ type: 'text', plain_text: 'Image', annotations: {} }],
        },
        [],
      );

      const callout = createMockBlock(
        'callout',
        {
          rich_text: [
            {
              type: 'text',
              plain_text: 'Callout in point 2',
              annotations: {},
            },
          ],
          icon: { type: 'emoji', emoji: '💡' },
          color: 'default',
        },
        [],
      );

      const quote = createMockBlock(
        'quote',
        {
          rich_text: [
            { type: 'text', plain_text: 'Quote in point 3', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const minorPoint1 = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 1', annotations: {} },
          ],
          color: 'default',
        },
        [paragraph, image],
      );

      const minorPoint2 = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 2', annotations: {} },
          ],
          color: 'default',
        },
        [callout],
      );

      const minorPoint3 = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Minor point 3', annotations: {} },
          ],
          color: 'default',
        },
        [quote],
      );

      const majorPoint = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Major point', annotations: {} },
          ],
          color: 'default',
        },
        [minorPoint1, minorPoint2, minorPoint3],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: majorPoint,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.bulleted_list_item!.transform(context);

      // Major point (level 0)
      expect(result).toContain('- Major point');

      // Minor points (level 1 - 4 spaces)
      expect(result).toContain('    - Minor point 1');
      expect(result).toContain('    - Minor point 2');
      expect(result).toContain('    - Minor point 3');

      // Content nested inside minor points (level 2 - 8 spaces)
      expect(result).toContain('        Image in point 1');
      expect(result).toContain('        ![Image](/media/image.png)');
      expect(result).toContain('        > 💡 Callout in point 2');
      expect(result).toContain('        > Quote in point 3');
    });
  });
});

/**
 * Test Suite for Issue #166 - Numbered list in Notion serialized as bullet list
 * Focus: Top-level consecutive numbered_list_item blocks must be numbered sequentially
 */
describe('Block Transformers - Issue #166', () => {
  describe('Top-level consecutive numbered lists', () => {
    it('should number consecutive top-level numbered list items sequentially', async () => {
      // This test simulates what happens when the renderer processes top-level blocks
      // The issue is that without proper metadata tracking, all items default to "1."

      const listItem1 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'First item', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const listItem2 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Second item', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const listItem3 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Third item', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const utils = createMockUtils();

      // Simulate processing as top-level blocks with proper metadata
      const result1 = await blockTransformers.numbered_list_item!.transform({
        pageId: 'test-page',
        pageProperties: {},
        metadata: { currentNumber: 1 },
        block: listItem1,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      });

      const result2 = await blockTransformers.numbered_list_item!.transform({
        pageId: 'test-page',
        pageProperties: {},
        metadata: { currentNumber: 2 },
        block: listItem2,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      });

      const result3 = await blockTransformers.numbered_list_item!.transform({
        pageId: 'test-page',
        pageProperties: {},
        metadata: { currentNumber: 3 },
        block: listItem3,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      });

      // Should have sequential numbering
      expect(result1).toContain('1. First item');
      expect(result2).toContain('2. Second item');
      expect(result3).toContain('3. Third item');
    });

    it('should default to 1 when no currentNumber metadata is provided', async () => {
      // This demonstrates the bug: without metadata, items default to 1
      const listItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Item text', annotations: {} },
          ],
          color: 'default',
        },
        [],
      );

      const utils = createMockUtils();

      // Process without metadata (simulating the bug)
      const result = await blockTransformers.numbered_list_item!.transform({
        pageId: 'test-page',
        pageProperties: {},
        metadata: {}, // No currentNumber!
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      });

      // Should default to 1
      expect(result).toContain('1. Item text');
    });
  });
});

/**
 * Test Suite for Advanced Nested List Scenarios & Combinations
 * Focus: Verifying indentation and numbering propagation across various containers
 */
describe('Advanced Nested List Scenarios', () => {
  describe('Depth 3 Mixed Nesting', () => {
    it('should handle Numbered > Bulleted > Numbered nesting with correct indentation', async () => {
      // Structure:
      // 1. Level 0
      //    - Level 1
      //        1. Level 2

      const level2Item = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Level 2 Item', annotations: {} },
          ],
        },
        [],
      );

      const level1Item = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Level 1 Item', annotations: {} },
          ],
        },
        [level2Item],
      );

      const level0Item = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Level 0 Item', annotations: {} },
          ],
        },
        [level1Item],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: { currentNumber: 1 },
        block: level0Item,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.numbered_list_item!.transform(context);

      expect(result).toContain('1. Level 0 Item');
      expect(result).toContain('    - Level 1 Item'); // 4 spaces
      expect(result).toContain('        1. Level 2 Item'); // 8 spaces
    });
  });

  describe('Numbered List inside Quote', () => {
    it('should propagate numbering and indentation inside quote block', async () => {
      // Structure:
      // > Quote
      // > 1. First Item
      // > 2. Second Item

      const item1 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'First Item', annotations: {} },
          ],
        },
        [],
      );

      const item2 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Second Item', annotations: {} },
          ],
        },
        [],
      );

      const quote = createMockBlock(
        'quote',
        {
          rich_text: [
            { type: 'text', plain_text: 'Quote Header', annotations: {} },
          ],
        },
        [item1, item2],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: quote,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.quote!.transform(context);

      expect(result).toContain('> Quote Header');
      // Numbering should work
      expect(result).toContain('> 1. First Item');
      expect(result).toContain('> 2. Second Item');
    });
  });

  describe('Numbered List inside Toggle', () => {
    it('should propagate numbering inside toggle block', async () => {
      // Structure:
      // Toggle
      // 1. First Item
      // 2. Second Item

      const item1 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'First Item', annotations: {} },
          ],
        },
        [],
      );

      const item2 = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'Second Item', annotations: {} },
          ],
        },
        [],
      );

      const toggle = createMockBlock(
        'toggle',
        {
          rich_text: [
            { type: 'text', plain_text: 'Toggle Header', annotations: {} },
          ],
        },
        [item1, item2],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: toggle,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.toggle!.transform(context);

      expect(result).toContain('<summary>\nToggle Header\n</summary>');
      expect(result).toContain('1. First Item');
      expect(result).toContain('2. Second Item');
    });
  });

  describe('Numbered List inside Bulleted List', () => {
    it('should correctly number sequential numbered items nested in a bullet', async () => {
      // Structure:
      // - Bullet
      //     1. Num 1
      //     2. Num 2

      const num1 = createMockBlock(
        'numbered_list_item',
        { rich_text: [{ type: 'text', plain_text: 'Num 1', annotations: {} }] },
        [],
      );

      const num2 = createMockBlock(
        'numbered_list_item',
        { rich_text: [{ type: 'text', plain_text: 'Num 2', annotations: {} }] },
        [],
      );

      const bullet = createMockBlock(
        'bulleted_list_item',
        {
          rich_text: [{ type: 'text', plain_text: 'Bullet', annotations: {} }],
        },
        [num1, num2],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: bullet,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.bulleted_list_item!.transform(context);

      expect(result).toContain('- Bullet');
      expect(result).toContain('    1. Num 1');
      expect(result).toContain('    2. Num 2');
    });
  });

  describe('Multi-line Paragraph in Nested List', () => {
    it('should indent all lines of a multi-line paragraph inside a list', async () => {
      // Structure:
      // 1. List Item
      //     Line 1
      //     Line 2

      const paragraph = createMockBlock(
        'paragraph',
        {
          rich_text: [
            { type: 'text', plain_text: 'Line 1\nLine 2', annotations: {} },
          ],
        },
        [],
      );

      const listItem = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [
            { type: 'text', plain_text: 'List Item', annotations: {} },
          ],
        },
        [paragraph],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: { currentNumber: 1 },
        block: listItem,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result =
        await blockTransformers.numbered_list_item!.transform(context);

      expect(result).toContain('1. List Item');
      expect(result).toContain('    Line 1');
      expect(result).toContain('    Line 2');
    });
  });

  describe('Interrupted Sequence in Container', () => {
    it('should reset numbering when sequence is interrupted inside a container', async () => {
      // Structure (inside callout):
      // > 1. Item A
      // > Interruption (Paragraph)
      // > 1. Item B (Should restart at 1)

      const itemA = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [{ type: 'text', plain_text: 'Item A', annotations: {} }],
        },
        [],
      );

      const interruption = createMockBlock(
        'paragraph',
        {
          rich_text: [
            { type: 'text', plain_text: 'Interruption', annotations: {} },
          ],
        },
        [],
      );

      const itemB = createMockBlock(
        'numbered_list_item',
        {
          rich_text: [{ type: 'text', plain_text: 'Item B', annotations: {} }],
        },
        [],
      );

      const callout = createMockBlock(
        'callout',
        {
          rich_text: [{ type: 'text', plain_text: 'Callout', annotations: {} }],
          icon: { type: 'emoji', emoji: '📢' },
          color: 'default',
        },
        [itemA, interruption, itemB],
      );

      const utils = createMockUtils();
      const context: RendererContext = {
        pageId: 'test-page',
        pageProperties: {},
        metadata: {},
        block: callout,
        blockTree: [],
        variableData: new Map(),
        transformers: {
          blocks: blockTransformers as any,
          annotations: {} as any,
          properties: {} as any,
        },
        utils,
        manifest: {},
      };

      const result = await blockTransformers.callout!.transform(context);

      expect(result).toContain('> 1. Item A');
      expect(result).toContain('> Interruption');
      expect(result).toContain('> 1. Item B'); // Should reset to 1
    });
  });
});
