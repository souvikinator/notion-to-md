/**
 * Comprehensive RCA Test for Issue #140 - Nested Lists and Maths Rendering
 *
 * This test replicates the exact structure described in the issue:
 * - Callout blocks containing numbered lists
 * - Nested numbered lists (sub-proofs within proofs)
 * - Inline and block equations
 * - Multiple levels of nesting
 *
 * Run with: npx ts-node tests/rca-140-comprehensive.ts
 */

import { BaseRendererPlugin } from '../src/core/renderer';
import { ChainData } from '../src/types/module';
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

// Helper to create a numbered list item block
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

// Helper to create a bulleted list item block
function bulletedListItem(
  id: string,
  parentId: string,
  parentType: 'page_id' | 'block_id',
  richTextItems: any[],
  children: NotionBlocks = [],
): NotionBlock {
  return {
    id,
    type: 'bulleted_list_item',
    parent:
      parentType === 'page_id'
        ? { type: 'page_id', page_id: parentId }
        : { type: 'block_id', block_id: parentId },
    has_children: children.length > 0,
    bulleted_list_item: {
      rich_text: richTextItems,
      color: 'default',
    },
    children,
    comments: [],
  } as unknown as NotionBlock;
}

// Helper to create a callout block
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

// Helper to create a paragraph block
function paragraphBlock(
  id: string,
  parentId: string,
  parentType: 'page_id' | 'block_id',
  richTextItems: any[],
  children: NotionBlocks = [],
): NotionBlock {
  return {
    id,
    type: 'paragraph',
    parent:
      parentType === 'page_id'
        ? { type: 'page_id', page_id: parentId }
        : { type: 'block_id', block_id: parentId },
    has_children: children.length > 0,
    paragraph: {
      rich_text: richTextItems,
      color: 'default',
    },
    children,
    comments: [],
  } as unknown as NotionBlock;
}

// Helper to create an equation block
function equationBlock(
  id: string,
  parentId: string,
  parentType: 'page_id' | 'block_id',
  expression: string,
): NotionBlock {
  return {
    id,
    type: 'equation',
    parent:
      parentType === 'page_id'
        ? { type: 'page_id', page_id: parentId }
        : { type: 'block_id', block_id: parentId },
    has_children: false,
    equation: {
      expression,
    },
    children: [],
    comments: [],
  } as unknown as NotionBlock;
}

// ============================================================================
// TEST CASES
// ============================================================================

interface TestCase {
  name: string;
  description: string;
  blocks: NotionBlocks;
  expectedPatterns: string[]; // Patterns that MUST appear in output
  unexpectedPatterns?: string[]; // Patterns that should NOT appear
}

const testCases: TestCase[] = [
  // -------------------------------------------------------------------------
  // TEST 1: Simple numbered list at page level (baseline)
  // -------------------------------------------------------------------------
  {
    name: 'Simple numbered list at page level',
    description:
      'Numbered list items directly under page should render correctly',
    blocks: [
      numberedListItem('n1', 'page', 'page_id', [richText('First item')]),
      numberedListItem('n2', 'page', 'page_id', [richText('Second item')]),
      numberedListItem('n3', 'page', 'page_id', [richText('Third item')]),
    ],
    expectedPatterns: ['First item', 'Second item', 'Third item'],
  },

  // -------------------------------------------------------------------------
  // TEST 2: Nested numbered list (2 levels)
  // -------------------------------------------------------------------------
  {
    name: 'Nested numbered list (2 levels)',
    description: 'Parent list item with child list items',
    blocks: [
      numberedListItem(
        'n1',
        'page',
        'page_id',
        [richText('Parent item')],
        [
          numberedListItem('n1-1', 'n1', 'block_id', [
            richText('Child item 1'),
          ]),
          numberedListItem('n1-2', 'n1', 'block_id', [
            richText('Child item 2'),
          ]),
        ],
      ),
    ],
    expectedPatterns: ['Parent item', 'Child item 1', 'Child item 2'],
  },

  // -------------------------------------------------------------------------
  // TEST 3: Deeply nested numbered list (3 levels)
  // -------------------------------------------------------------------------
  {
    name: 'Deeply nested numbered list (3 levels)',
    description: 'Three levels of nesting to test deep recursion',
    blocks: [
      numberedListItem(
        'n1',
        'page',
        'page_id',
        [richText('Level 1')],
        [
          numberedListItem(
            'n1-1',
            'n1',
            'block_id',
            [richText('Level 2')],
            [
              numberedListItem('n1-1-1', 'n1-1', 'block_id', [
                richText('Level 3'),
              ]),
            ],
          ),
        ],
      ),
    ],
    expectedPatterns: ['Level 1', 'Level 2', 'Level 3'],
  },

  // -------------------------------------------------------------------------
  // TEST 4: Callout with simple text (baseline)
  // -------------------------------------------------------------------------
  {
    name: 'Callout with simple text',
    description: 'Callout block with no children should render main text',
    blocks: [
      calloutBlock('c1', 'page', 'page_id', '💡', [
        richText('This is a callout'),
      ]),
    ],
    expectedPatterns: [
      '💡',
      'This is a callout',
      '>', // Should be blockquote style
    ],
  },

  // -------------------------------------------------------------------------
  // TEST 5: Callout with child paragraph (THE CRITICAL CASE)
  // -------------------------------------------------------------------------
  {
    name: 'Callout with child paragraph',
    description:
      'Callout containing a paragraph child - children must be preserved',
    blocks: [
      calloutBlock(
        'c1',
        'page',
        'page_id',
        '📌',
        [richText('Main callout text')],
        [
          paragraphBlock('p1', 'c1', 'block_id', [
            richText('Child paragraph inside callout'),
          ]),
        ],
      ),
    ],
    expectedPatterns: ['Main callout text', 'Child paragraph inside callout'],
  },

  // -------------------------------------------------------------------------
  // TEST 6: Callout with numbered list (THE MAIN BUG SCENARIO)
  // -------------------------------------------------------------------------
  {
    name: 'Callout with numbered list',
    description: 'This is the main bug scenario from issue #140',
    blocks: [
      calloutBlock(
        'c1',
        'page',
        'page_id',
        '💡',
        [richText('Proof', { bold: true })],
        [
          numberedListItem('n1', 'c1', 'block_id', [
            richText('Step 1: Assume something'),
          ]),
          numberedListItem('n2', 'c1', 'block_id', [
            richText('Step 2: Do something'),
          ]),
          numberedListItem('n3', 'c1', 'block_id', [
            richText('Step 3: Conclude'),
          ]),
        ],
      ),
    ],
    expectedPatterns: [
      'Proof',
      'Step 1',
      'Step 2',
      'Step 3',
      'Assume something',
      'Do something',
      'Conclude',
    ],
  },

  // -------------------------------------------------------------------------
  // TEST 7: Callout with NESTED numbered list (COMPLEX BUG SCENARIO)
  // -------------------------------------------------------------------------
  {
    name: 'Callout with nested numbered list',
    description: 'Callout containing numbered list with nested sub-items',
    blocks: [
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
            [richText('Assume P is true')],
            [
              numberedListItem('n1-1', 'n1', 'block_id', [
                richText('Sub-step 1.1'),
              ]),
              numberedListItem('n1-2', 'n1', 'block_id', [
                richText('Sub-step 1.2'),
              ]),
            ],
          ),
          numberedListItem('n2', 'c1', 'block_id', [
            richText('This leads to contradiction'),
          ]),
          numberedListItem('n3', 'c1', 'block_id', [
            richText('Therefore P is false'),
          ]),
        ],
      ),
    ],
    expectedPatterns: [
      'Proof by Contradiction',
      'Assume P is true',
      'Sub-step 1.1',
      'Sub-step 1.2',
      'This leads to contradiction',
      'Therefore P is false',
    ],
  },

  // -------------------------------------------------------------------------
  // TEST 8: Callout with inline equations
  // -------------------------------------------------------------------------
  {
    name: 'Callout with inline equations',
    description: 'Callout containing list items with inline math',
    blocks: [
      calloutBlock(
        'c1',
        'page',
        'page_id',
        '📐',
        [richText('Math Proof')],
        [
          numberedListItem('n1', 'c1', 'block_id', [
            richText('Let '),
            richText('x = 5', { equation: true }),
          ]),
          numberedListItem('n2', 'c1', 'block_id', [
            richText('Then '),
            richText('x^2 = 25', { equation: true }),
          ]),
        ],
      ),
    ],
    expectedPatterns: ['Math Proof', 'Let', '$x = 5$', 'Then', '$x^2 = 25$'],
  },

  // -------------------------------------------------------------------------
  // TEST 9: Block equation inside callout
  // -------------------------------------------------------------------------
  {
    name: 'Block equation inside callout',
    description: 'Callout containing a block-level equation',
    blocks: [
      calloutBlock(
        'c1',
        'page',
        'page_id',
        '📐',
        [richText('Important Formula')],
        [equationBlock('eq1', 'c1', 'block_id', 'E = mc^2')],
      ),
    ],
    expectedPatterns: ['Important Formula', '$$', 'E = mc^2'],
  },

  // -------------------------------------------------------------------------
  // TEST 10: Mixed content in callout
  // -------------------------------------------------------------------------
  {
    name: 'Mixed content in callout',
    description: 'Callout with paragraphs, lists, and equations mixed',
    blocks: [
      calloutBlock(
        'c1',
        'page',
        'page_id',
        '📝',
        [richText('Complex Proof')],
        [
          paragraphBlock('p1', 'c1', 'block_id', [
            richText('Introduction paragraph'),
          ]),
          numberedListItem('n1', 'c1', 'block_id', [richText('First step')]),
          numberedListItem('n2', 'c1', 'block_id', [richText('Second step')]),
          equationBlock(
            'eq1',
            'c1',
            'block_id',
            '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
          ),
          paragraphBlock('p2', 'c1', 'block_id', [
            richText('Conclusion paragraph'),
          ]),
        ],
      ),
    ],
    expectedPatterns: [
      'Complex Proof',
      'Introduction paragraph',
      'First step',
      'Second step',
      '\\sum_{i=1}^{n}',
      'Conclusion paragraph',
    ],
  },

  // -------------------------------------------------------------------------
  // TEST 11: Multiple consecutive numbered list items at page level
  // (Testing sibling numbering)
  // -------------------------------------------------------------------------
  {
    name: 'Multiple numbered list siblings',
    description:
      'Testing that sibling numbered items get correct sequential numbers',
    blocks: [
      numberedListItem('n1', 'page', 'page_id', [richText('Item one')]),
      numberedListItem('n2', 'page', 'page_id', [richText('Item two')]),
      numberedListItem('n3', 'page', 'page_id', [richText('Item three')]),
      numberedListItem('n4', 'page', 'page_id', [richText('Item four')]),
      numberedListItem('n5', 'page', 'page_id', [richText('Item five')]),
    ],
    expectedPatterns: [
      '1. Item one',
      '2. Item two',
      '3. Item three',
      '4. Item four',
      '5. Item five',
    ],
  },

  // -------------------------------------------------------------------------
  // TEST 12: Bulleted list inside callout
  // -------------------------------------------------------------------------
  {
    name: 'Bulleted list inside callout',
    description: 'Callout with nested bulleted list items',
    blocks: [
      calloutBlock(
        'c1',
        'page',
        'page_id',
        '📋',
        [richText('Key Points')],
        [
          bulletedListItem(
            'b1',
            'c1',
            'block_id',
            [richText('Point A')],
            [
              bulletedListItem('b1-1', 'b1', 'block_id', [
                richText('Sub-point A.1'),
              ]),
              bulletedListItem('b1-2', 'b1', 'block_id', [
                richText('Sub-point A.2'),
              ]),
            ],
          ),
          bulletedListItem('b2', 'c1', 'block_id', [richText('Point B')]),
        ],
      ),
    ],
    expectedPatterns: [
      'Key Points',
      'Point A',
      'Sub-point A.1',
      'Sub-point A.2',
      'Point B',
    ],
  },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runTests() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE RCA TEST FOR ISSUE #140');
  console.log('Nested Lists and Math Rendering in Callouts');
  console.log('='.repeat(80));
  console.log();

  let passed = 0;
  let failed = 0;
  const failures: { name: string; missing: string[]; output: string }[] = [];

  for (const testCase of testCases) {
    const renderer = new TestMDXRenderer();

    const chainData: ChainData = {
      pageId: 'test-page',
      blockTree: {
        blocks: testCase.blocks,
        properties: {},
        comments: [],
      },
      content: '',
      manifests: {},
      metadata: {},
    };

    try {
      const result = await renderer.process(chainData);
      const output = result.content;

      // Check all expected patterns
      const missingPatterns: string[] = [];
      for (const pattern of testCase.expectedPatterns) {
        if (!output.includes(pattern)) {
          missingPatterns.push(pattern);
        }
      }

      // Check unexpected patterns
      const foundUnexpected: string[] = [];
      if (testCase.unexpectedPatterns) {
        for (const pattern of testCase.unexpectedPatterns) {
          if (output.includes(pattern)) {
            foundUnexpected.push(pattern);
          }
        }
      }

      if (missingPatterns.length === 0 && foundUnexpected.length === 0) {
        console.log(`✅ PASS: ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${testCase.name}`);
        if (missingPatterns.length > 0) {
          console.log(`   Missing: ${missingPatterns.join(', ')}`);
        }
        if (foundUnexpected.length > 0) {
          console.log(`   Unexpected: ${foundUnexpected.join(', ')}`);
        }
        failed++;
        failures.push({
          name: testCase.name,
          missing: missingPatterns,
          output,
        });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${testCase.name}`);
      console.log(`   ${error}`);
      failed++;
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log(
    `SUMMARY: ${passed} passed, ${failed} failed out of ${testCases.length} tests`,
  );
  console.log('='.repeat(80));

  // Show detailed output for failures
  if (failures.length > 0) {
    console.log();
    console.log('DETAILED FAILURE ANALYSIS:');
    console.log('='.repeat(80));

    for (const failure of failures) {
      console.log();
      console.log(`TEST: ${failure.name}`);
      console.log('-'.repeat(60));
      console.log('MISSING PATTERNS:', failure.missing.join(', '));
      console.log();
      console.log('ACTUAL OUTPUT:');
      console.log('-'.repeat(40));
      console.log(failure.output);
      console.log('-'.repeat(40));
    }
  }

  // Return exit code based on test results
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
