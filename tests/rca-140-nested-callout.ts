/**
 * RCA Test Script for Issue #140 - Nested Lists and Maths Rendering
 *
 * This script simulates the scenario where:
 * 1. A callout block contains nested numbered lists with math equations
 * 2. The nested content is being lost during conversion
 *
 * Run with: npx ts-node tests/rca-140-nested-callout.ts
 */

import { BaseRendererPlugin } from '../src/core/renderer';
import { ChainData } from '../src/types/module';
import { NotionBlock } from '../src/types/notion';
import { blockTransformers } from '../src/plugins/renderer/mdx/transformers/blocks';
import { annotationTransformers } from '../src/plugins/renderer/mdx/transformers/annotations';

// Create a test renderer
class TestMDXRenderer extends BaseRendererPlugin {
  constructor() {
    super();
    this.createBlockTransformers(blockTransformers);
    this.createAnnotationTransformers(annotationTransformers);
  }
}

// Mock block data simulating a callout with nested numbered list containing equations
const mockCalloutWithNestedContent: NotionBlock = {
  id: 'callout-1',
  type: 'callout',
  parent: { type: 'page_id', page_id: 'test-page' },
  has_children: true,
  callout: {
    rich_text: [
      {
        type: 'text',
        text: { content: 'Proof by Contradiction', link: null },
        plain_text: 'Proof by Contradiction',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        },
        href: null,
      },
    ],
    icon: { type: 'emoji', emoji: '💡' },
    color: 'gray_background',
  },
  children: [
    // First level: numbered list item
    {
      id: 'numbered-1',
      type: 'numbered_list_item',
      parent: { type: 'block_id', block_id: 'callout-1' },
      has_children: true,
      numbered_list_item: {
        rich_text: [
          {
            type: 'text',
            text: { content: 'Assume ', link: null },
            plain_text: 'Assume ',
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            href: null,
          },
          {
            type: 'equation',
            equation: { expression: 'P \\land \\neg P' },
            plain_text: 'P \\land \\neg P',
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            href: null,
          },
        ],
        color: 'default',
      },
      children: [
        // Nested numbered list (sub-proof)
        {
          id: 'numbered-1-1',
          type: 'numbered_list_item',
          parent: { type: 'block_id', block_id: 'numbered-1' },
          has_children: false,
          numbered_list_item: {
            rich_text: [
              {
                type: 'text',
                text: { content: 'From step 1, we have ', link: null },
                plain_text: 'From step 1, we have ',
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
              {
                type: 'equation',
                equation: { expression: 'P' },
                plain_text: 'P',
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
            ],
            color: 'default',
          },
          children: [],
        },
        {
          id: 'numbered-1-2',
          type: 'numbered_list_item',
          parent: { type: 'block_id', block_id: 'numbered-1' },
          has_children: false,
          numbered_list_item: {
            rich_text: [
              {
                type: 'text',
                text: { content: 'From step 1, we also have ', link: null },
                plain_text: 'From step 1, we also have ',
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
              {
                type: 'equation',
                equation: { expression: '\\neg P' },
                plain_text: '\\neg P',
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
            ],
            color: 'default',
          },
          children: [],
        },
      ],
    },
    // Second numbered list item
    {
      id: 'numbered-2',
      type: 'numbered_list_item',
      parent: { type: 'block_id', block_id: 'callout-1' },
      has_children: false,
      numbered_list_item: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'This is a contradiction, therefore ',
              link: null,
            },
            plain_text: 'This is a contradiction, therefore ',
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            href: null,
          },
          {
            type: 'equation',
            equation: { expression: '\\bot' },
            plain_text: '\\bot',
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            href: null,
          },
        ],
        color: 'default',
      },
      children: [],
    },
  ],
} as unknown as NotionBlock;

// Also test with a simpler nested bulleted list
const mockCalloutWithBulletedList: NotionBlock = {
  id: 'callout-2',
  type: 'callout',
  parent: { type: 'page_id', page_id: 'test-page' },
  has_children: true,
  callout: {
    rich_text: [
      {
        type: 'text',
        text: { content: 'Important Points', link: null },
        plain_text: 'Important Points',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        },
        href: null,
      },
    ],
    icon: { type: 'emoji', emoji: '📌' },
    color: 'yellow_background',
  },
  children: [
    {
      id: 'bullet-1',
      type: 'bulleted_list_item',
      parent: { type: 'block_id', block_id: 'callout-2' },
      has_children: true,
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: { content: 'First point', link: null },
            plain_text: 'First point',
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            href: null,
          },
        ],
        color: 'default',
      },
      children: [
        {
          id: 'bullet-1-1',
          type: 'bulleted_list_item',
          parent: { type: 'block_id', block_id: 'bullet-1' },
          has_children: false,
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: { content: 'Sub-point A', link: null },
                plain_text: 'Sub-point A',
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
            ],
            color: 'default',
          },
          children: [],
        },
        {
          id: 'bullet-1-2',
          type: 'bulleted_list_item',
          parent: { type: 'block_id', block_id: 'bullet-1' },
          has_children: false,
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: { content: 'Sub-point B', link: null },
                plain_text: 'Sub-point B',
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
            ],
            color: 'default',
          },
          children: [],
        },
      ],
    },
    {
      id: 'bullet-2',
      type: 'bulleted_list_item',
      parent: { type: 'block_id', block_id: 'callout-2' },
      has_children: false,
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: { content: 'Second point', link: null },
            plain_text: 'Second point',
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default',
            },
            href: null,
          },
        ],
        color: 'default',
      },
      children: [],
    },
  ],
} as unknown as NotionBlock;

async function runTest() {
  console.log('='.repeat(80));
  console.log('RCA Test for Issue #140: Nested Lists and Math in Callouts');
  console.log('='.repeat(80));
  console.log();

  const renderer = new TestMDXRenderer();

  // Test 1: Callout with nested numbered list and equations
  console.log('TEST 1: Callout with nested numbered list and math equations');
  console.log('-'.repeat(60));

  const chainData1: ChainData = {
    pageId: 'test-page',
    blockTree: {
      blocks: [mockCalloutWithNestedContent],
      properties: {},
      comments: [],
    },
    content: '',
    manifests: {},
    metadata: {},
  };

  try {
    const result1 = await renderer.process(chainData1);
    console.log('OUTPUT:');
    console.log(result1.content);
    console.log();

    // Analysis
    console.log('ANALYSIS:');
    const content1 = result1.content;
    const hasNestedItems = content1.includes('From step 1');
    const hasEquations =
      content1.includes('$P') || content1.includes('$\\neg P');
    const hasContradiction =
      content1.includes('contradiction') || content1.includes('\\bot');

    console.log(
      `- Contains nested sub-proof items: ${hasNestedItems ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log(
      `- Contains inline equations: ${hasEquations ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log(
      `- Contains contradiction symbol: ${hasContradiction ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log();
  } catch (error) {
    console.log('ERROR:', error);
    console.log();
  }

  // Test 2: Callout with nested bulleted list
  console.log('TEST 2: Callout with nested bulleted list');
  console.log('-'.repeat(60));

  // Create new renderer instance to reset state
  const renderer2 = new TestMDXRenderer();

  const chainData2: ChainData = {
    pageId: 'test-page',
    blockTree: {
      blocks: [mockCalloutWithBulletedList],
      properties: {},
      comments: [],
    },
    content: '',
    manifests: {},
    metadata: {},
  };

  try {
    const result2 = await renderer2.process(chainData2);
    console.log('OUTPUT:');
    console.log(result2.content);
    console.log();

    // Analysis
    console.log('ANALYSIS:');
    const content2 = result2.content;
    const hasSubPointA = content2.includes('Sub-point A');
    const hasSubPointB = content2.includes('Sub-point B');
    const hasFirstPoint = content2.includes('First point');
    const hasSecondPoint = content2.includes('Second point');

    console.log(
      `- Contains 'First point': ${hasFirstPoint ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log(
      `- Contains 'Sub-point A': ${hasSubPointA ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log(
      `- Contains 'Sub-point B': ${hasSubPointB ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log(
      `- Contains 'Second point': ${hasSecondPoint ? 'YES' : 'NO (MISSING!)'}`,
    );
    console.log();
  } catch (error) {
    console.log('ERROR:', error);
    console.log();
  }

  console.log('='.repeat(80));
  console.log('EXPECTED OUTPUT for Test 1:');
  console.log('-'.repeat(60));
  console.log(`
> 💡 **Proof by Contradiction**
> 1. Assume $P \\land \\neg P$
>     1. From step 1, we have $P$
>     2. From step 1, we also have $\\neg P$
> 2. This is a contradiction, therefore $\\bot$
`);

  console.log('EXPECTED OUTPUT for Test 2:');
  console.log('-'.repeat(60));
  console.log(`
> 📌 Important Points
> - First point
>     - Sub-point A
>     - Sub-point B
> - Second point
`);
  console.log('='.repeat(80));
}

runTest().catch(console.error);
