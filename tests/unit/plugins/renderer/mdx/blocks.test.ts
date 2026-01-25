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
