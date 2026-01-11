/**
 * Deep Analysis Test for Issue #140
 *
 * This test examines the actual output structure to understand
 * what's happening with nested lists and equations.
 *
 * Run with: npx ts-node tests/rca-140-deep-analysis.ts
 */

import { BaseRendererPlugin } from '../src/core/renderer';
import { NotionBlock, NotionBlocks } from '../src/types/notion';
import { blockTransformers } from '../src/plugins/renderer/mdx/transformers/blocks';
import { annotationTransformers } from '../src/plugins/renderer/mdx/transformers/annotations';

// Disable debug logging for cleaner output
console.debug = () => {};

class TestMDXRenderer extends BaseRendererPlugin {
  constructor() {
    super();
    this.createBlockTransformers(blockTransformers);
    this.createAnnotationTransformers(annotationTransformers);
  }
}

// Helper to create rich text
function richText(
  content: string,
  options: { bold?: boolean; italic?: boolean; equation?: boolean } = {},
) {
  if (options.equation) {
    return {
      type: 'equation' as const,
      equation: { expression: content },
      plain_text: content,
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default' as const,
      },
      href: null,
    };
  }
  return {
    type: 'text' as const,
    text: { content, link: null },
    plain_text: content,
    annotations: {
      bold: options.bold || false,
      italic: options.italic || false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default' as const,
    },
    href: null,
  };
}

function numberedListItem(
  id: string,
  parentId: string,
  parentType: 'page_id' | 'block_id',
  richTextItems: any[],
  children: NotionBlocks = [],
): NotionBlock {
  return {
    id,
    type: 'numbered_list_item',
    parent:
      parentType === 'page_id'
        ? { type: 'page_id', page_id: parentId }
        : { type: 'block_id', block_id: parentId },
    has_children: children.length > 0,
    numbered_list_item: {
      rich_text: richTextItems,
      color: 'default',
    },
    children,
    comments: [],
  } as unknown as NotionBlock;
}

function calloutBlock(
  id: string,
  parentId: string,
  parentType: 'page_id' | 'block_id',
  emoji: string,
  richTextItems: any[],
  children: NotionBlocks = [],
): NotionBlock {
  return {
    id,
    type: 'callout',
    parent:
      parentType === 'page_id'
        ? { type: 'page_id', page_id: parentId }
        : { type: 'block_id', block_id: parentId },
    has_children: children.length > 0,
    callout: {
      rich_text: richTextItems,
      icon: { type: 'emoji', emoji },
      color: 'gray_background',
    },
    children,
    comments: [],
  } as unknown as NotionBlock;
}

async function runAnalysis() {
  console.log('='.repeat(80));
  console.log('DEEP ANALYSIS OF ISSUE #140');
  console.log('='.repeat(80));
  console.log();

  // -------------------------------------------------------------------------
  // ANALYSIS 1: Sibling numbered list items at page level
  // -------------------------------------------------------------------------
  console.log('ANALYSIS 1: Sibling numbered list items at page level');
  console.log('-'.repeat(60));

  const renderer1 = new TestMDXRenderer();
  const blocks1 = [
    numberedListItem('n1', 'page', 'page_id', [richText('First')]),
    numberedListItem('n2', 'page', 'page_id', [richText('Second')]),
    numberedListItem('n3', 'page', 'page_id', [richText('Third')]),
  ];

  const result1 = await renderer1.process({
    pageId: 'test-page',
    blockTree: { blocks: blocks1, properties: {}, comments: [] },
    content: '',
    manifests: {},
    metadata: {},
  });

  console.log('OUTPUT:');
  console.log(result1.content);
  console.log();
  console.log(
    'PROBLEM: All items get "1." because each is processed independently',
  );
  console.log('         The renderer has no concept of siblings.');
  console.log();

  // -------------------------------------------------------------------------
  // ANALYSIS 2: Sibling numbered list items INSIDE callout
  // -------------------------------------------------------------------------
  console.log('ANALYSIS 2: Sibling numbered list items inside callout');
  console.log('-'.repeat(60));

  const renderer2 = new TestMDXRenderer();
  const blocks2 = [
    calloutBlock(
      'c1',
      'page',
      'page_id',
      '💡',
      [richText('Proof')],
      [
        numberedListItem('n1', 'c1', 'block_id', [richText('Step 1')]),
        numberedListItem('n2', 'c1', 'block_id', [richText('Step 2')]),
        numberedListItem('n3', 'c1', 'block_id', [richText('Step 3')]),
      ],
    ),
  ];

  const result2 = await renderer2.process({
    pageId: 'test-page',
    blockTree: { blocks: blocks2, properties: {}, comments: [] },
    content: '',
    manifests: {},
    metadata: {},
  });

  console.log('OUTPUT:');
  console.log(result2.content);
  console.log();
  console.log('SAME PROBLEM: Items inside callout also all get "1."');
  console.log();

  // -------------------------------------------------------------------------
  // ANALYSIS 3: Nested numbered list with correct parent numbering
  // -------------------------------------------------------------------------
  console.log('ANALYSIS 3: Nested numbered list (children of a single parent)');
  console.log('-'.repeat(60));

  const renderer3 = new TestMDXRenderer();
  const blocks3 = [
    numberedListItem(
      'n1',
      'page',
      'page_id',
      [richText('Parent')],
      [
        numberedListItem('n1-1', 'n1', 'block_id', [richText('Child 1')]),
        numberedListItem('n1-2', 'n1', 'block_id', [richText('Child 2')]),
        numberedListItem('n1-3', 'n1', 'block_id', [richText('Child 3')]),
      ],
    ),
  ];

  const result3 = await renderer3.process({
    pageId: 'test-page',
    blockTree: { blocks: blocks3, properties: {}, comments: [] },
    content: '',
    manifests: {},
    metadata: {},
  });

  console.log('OUTPUT:');
  console.log(result3.content);
  console.log();
  console.log('This WORKS! Because the parent numbered_list_item transformer');
  console.log('iterates over children sequentially and passes currentNumber.');
  console.log();

  // -------------------------------------------------------------------------
  // ANALYSIS 4: The exact scenario from issue - callout with nested proof
  // -------------------------------------------------------------------------
  console.log('ANALYSIS 4: Callout with nested proof (issue #140 scenario)');
  console.log('-'.repeat(60));

  const renderer4 = new TestMDXRenderer();
  const blocks4 = [
    calloutBlock(
      'c1',
      'page',
      'page_id',
      '💡',
      [richText('Proof by Contradiction', { bold: true })],
      [
        numberedListItem(
          'n1',
          'c1',
          'block_id',
          [
            richText('Assume '),
            richText('P \\land \\neg P', { equation: true }),
          ],
          [
            numberedListItem('n1-1', 'n1', 'block_id', [
              richText('From assumption, '),
              richText('P', { equation: true }),
              richText(' holds'),
            ]),
            numberedListItem('n1-2', 'n1', 'block_id', [
              richText('From assumption, '),
              richText('\\neg P', { equation: true }),
              richText(' also holds'),
            ]),
          ],
        ),
        numberedListItem('n2', 'c1', 'block_id', [
          richText('But '),
          richText('P', { equation: true }),
          richText(' and '),
          richText('\\neg P', { equation: true }),
          richText(' cannot both be true'),
        ]),
        numberedListItem('n3', 'c1', 'block_id', [
          richText('Therefore, contradiction '),
          richText('\\bot', { equation: true }),
        ]),
      ],
    ),
  ];

  const result4 = await renderer4.process({
    pageId: 'test-page',
    blockTree: { blocks: blocks4, properties: {}, comments: [] },
    content: '',
    manifests: {},
    metadata: {},
  });

  console.log('OUTPUT:');
  console.log(result4.content);
  console.log();

  // -------------------------------------------------------------------------
  // ANALYSIS 5: Check the callout formatting issue
  // -------------------------------------------------------------------------
  console.log('ANALYSIS 5: Callout blockquote formatting');
  console.log('-'.repeat(60));

  const renderer5 = new TestMDXRenderer();
  const blocks5 = [
    calloutBlock('c1', 'page', 'page_id', '📌', [richText('Simple callout')]),
  ];

  const result5 = await renderer5.process({
    pageId: 'test-page',
    blockTree: { blocks: blocks5, properties: {}, comments: [] },
    content: '',
    manifests: {},
    metadata: {},
  });

  console.log('OUTPUT:');
  console.log(JSON.stringify(result5.content));
  console.log();
  console.log('Notice: The output has "> 📌 > Simple callout"');
  console.log(
    'The ">" appears twice - once from icon prefix, once from text formatting',
  );
  console.log();

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('='.repeat(80));
  console.log('SUMMARY OF ISSUES FOUND');
  console.log('='.repeat(80));
  console.log();
  console.log('1. NUMBERED LIST SIBLING NUMBERING (Critical)');
  console.log(
    '   - Sibling numbered list items all get "1." instead of 1, 2, 3...',
  );
  console.log(
    '   - Root cause: The renderer processes each top-level block independently',
  );
  console.log(
    '   - The numbered_list_item transformer only handles its own children correctly',
  );
  console.log('   - No mechanism to track siblings at the same level');
  console.log();
  console.log('2. CALLOUT DUPLICATE BLOCKQUOTE PREFIX (Medium)');
  console.log('   - Output: "> 💡 > text" instead of "> 💡 text"');
  console.log(
    '   - Root cause: lines variable is pre-formatted with "> " prefix',
  );
  console.log(
    '   - Then the return statement adds another "> ${icon} ${lines}"',
  );
  console.log();
  console.log('3. ANNOTATION SPACING (Low)');
  console.log('   - Extra spaces around inline equations and bold/italic');
  console.log('   - Root cause: Annotation transformers add padding spaces');
  console.log();
  console.log('WHAT WAS NOT BROKEN (despite issue report):');
  console.log('   - Nested content IS preserved correctly');
  console.log('   - Child blocks inside callouts ARE processed');
  console.log('   - Equations ARE rendered (with extra spacing)');
  console.log('   - Deep nesting DOES work');
  console.log();
}

runAnalysis().catch(console.error);
