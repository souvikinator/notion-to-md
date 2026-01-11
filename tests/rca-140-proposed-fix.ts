/**
 * Proposed Fix Validation for Issue #140
 *
 * This file contains the proposed fixes and tests them against all scenarios.
 *
 * Run with: npx ts-node tests/rca-140-proposed-fix.ts
 */

import { ProcessorChainNode, ChainData } from '../src/types/module';
import {
  NotionBlock,
  NotionBlocks,
  NotionBlockType,
  NotionAnnotationType,
  NotionRichTextItem,
} from '../src/types/notion';
import {
  RendererContext,
  BlockTransformer,
  AnnotationTransformer,
  ContextMetadata,
  VariableCollector,
  VariableResolvers,
  VariableResolver,
} from '../src/types/renderer';

// Disable debug logging
console.debug = () => {};

const INDENT = '    ';

// ============================================================================
// FIXED ANNOTATION TRANSFORMERS
// ============================================================================

const fixedAnnotationTransformers: Partial<
  Record<NotionAnnotationType, AnnotationTransformer>
> = {
  bold: {
    transform: async ({ text, metadata }) =>
      !metadata?.html ? `**${text}**` : `<strong>${text}</strong>`,
  },
  italic: {
    transform: async ({ text, metadata }) =>
      !metadata?.html ? `*${text}*` : `<i>${text}</i>`,
  },
  strikethrough: {
    transform: async ({ text, metadata }) =>
      !metadata?.html ? `~~${text}~~` : `<strike>${text}</strike>`,
  },
  code: {
    transform: async ({ text, metadata }) =>
      metadata?.html ? `<code>${text}</code>` : `\`${text}\``,
  },
  underline: {
    transform: async ({ text }) => `<u>${text}</u>`,
  },
  link: {
    transform: async ({ text, link, metadata }) => {
      if (!link?.url) return text;
      return !metadata?.html
        ? `[${text}](${link.url})`
        : `<a href="${link.url}">${text}</a>`;
    },
  },
  equation: {
    transform: async ({ text, metadata }) => {
      if (!metadata?.html) return `$${text}$`;
      return `<code>${text}</code>`;
    },
  },
};

// ============================================================================
// HELPER: Process children with proper list numbering
// ============================================================================

async function processChildrenWithNumbering(
  children: NotionBlocks,
  processBlock: (
    block: NotionBlock,
    metadata?: ContextMetadata,
  ) => Promise<string>,
  baseMetadata: ContextMetadata = {},
): Promise<string[]> {
  const results: string[] = [];
  let currentNumber = 0;

  for (const child of children) {
    const isNumberedList = child.type === 'numbered_list_item';

    if (isNumberedList) {
      currentNumber++;
    } else {
      currentNumber = 0; // Reset on non-list item
    }

    const metadata: ContextMetadata = {
      ...baseMetadata,
      currentNumber: isNumberedList ? currentNumber : undefined,
    };

    const result = await processBlock(child, metadata);
    results.push(result);
  }

  return results;
}

// ============================================================================
// FIXED BLOCK TRANSFORMERS
// ============================================================================

const fixedBlockTransformers: Partial<
  Record<NotionBlockType, BlockTransformer>
> = {
  paragraph: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.transformRichText(block.paragraph.rich_text);
      if (!text) return '';
      // @ts-ignore
      const needsNewline = block.parent.type === 'page_id';
      return text + (needsNewline ? '\n' : '');
    },
  },

  bulleted_list_item: {
    transform: async ({ block, utils, metadata = {} }) => {
      const text = await utils.transformRichText(
        // @ts-ignore
        block.bulleted_list_item.rich_text,
      );
      const currentLevel = metadata.listLevel || 0;
      const indent = INDENT.repeat(currentLevel);

      if (!block.children?.length) {
        return `${indent}- ${text}`;
      }

      const childMetadata = {
        ...metadata,
        listLevel: currentLevel + 1,
      };

      // Use helper for proper numbering of child list items
      const childrenContent = await processChildrenWithNumbering(
        block.children,
        utils.processBlock,
        childMetadata,
      );

      return `${indent}- ${text}\n${childrenContent.join('\n')}`;
    },
  },

  numbered_list_item: {
    transform: async ({ block, utils, metadata = {} }) => {
      const currentLevel = metadata.listLevel || 0;
      const currentNumber = metadata.currentNumber || 1;
      const indent = INDENT.repeat(currentLevel);

      const text = await utils.transformRichText(
        // @ts-ignore
        block.numbered_list_item.rich_text,
      );

      const formattedItem = `${indent}${currentNumber}. ${text}`;

      if (!block.children?.length) {
        return formattedItem;
      }

      const childMetadata = {
        ...metadata,
        listLevel: currentLevel + 1,
      };

      // Use helper for proper numbering of child list items
      const childrenContent = await processChildrenWithNumbering(
        block.children,
        utils.processBlock,
        childMetadata,
      );

      return `${formattedItem}\n${childrenContent.join('\n')}`;
    },
  },

  callout: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const calloutBlock = block.callout;
      const text = await utils.transformRichText(calloutBlock.rich_text);
      const icon = calloutBlock.icon?.emoji || '';

      // Process children with proper numbering
      const childrenContent = block.children?.length
        ? await processChildrenWithNumbering(
            block.children,
            utils.processBlock,
            {},
          )
        : [];

      // Format the main text (may be multi-line)
      const textLines = text.split('\n');
      const formattedText = textLines
        .map((line, i) => (i === 0 ? `> ${icon} ${line}` : `> ${line}`))
        .join('\n');

      // Format children content - each line gets ">" prefix
      const formattedChildren = childrenContent.length
        ? '\n' +
          childrenContent
            .join('\n')
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
        : '';

      return `${formattedText}${formattedChildren}\n\n`;
    },
  },

  equation: {
    transform: async ({ block }) => {
      // @ts-ignore
      const expression = block.equation.expression;
      return `$$\n${expression}\n$$\n\n`;
    },
  },

  quote: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.transformRichText(block.quote.rich_text);

      const lines = text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      if (!block.children?.length) {
        return `${lines}\n\n`;
      }

      // Use helper for proper numbering
      const childrenContent = await processChildrenWithNumbering(
        block.children,
        utils.processBlock,
        {},
      );

      const formattedChildren = childrenContent
        .join('\n')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      return `${lines}\n${formattedChildren}\n\n`;
    },
  },

  toggle: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.transformRichText(block.toggle.rich_text, {
        html: true,
      });

      if (!block.children?.length) {
        return `<details>\n<summary>\n${text}\n</summary>\n</details>\n\n`;
      }

      // Use helper for proper numbering
      const childrenContent = await processChildrenWithNumbering(
        block.children,
        utils.processBlock,
        {},
      );

      return `<details>\n<summary>\n${text}\n</summary>\n\n${childrenContent.join('\n')}\n\n</details>\n\n`;
    },
  },
};

// ============================================================================
// FIXED RENDERER
// ============================================================================

class FixedMDXRenderer implements ProcessorChainNode {
  next?: ProcessorChainNode;

  private template = `{{{imports}}}\n{{{content}}}`;
  private variableDataCollector: VariableCollector = new Map();
  private variableResolvers: VariableResolvers = new Map();
  private context: RendererContext;

  constructor() {
    this.context = {
      pageId: '',
      pageProperties: {},
      metadata: {},
      block: {} as NotionBlock,
      blockTree: [],
      variableData: this.variableDataCollector,
      transformers: {
        blocks: fixedBlockTransformers as Record<
          NotionBlockType,
          BlockTransformer
        >,
        annotations: fixedAnnotationTransformers as Record<
          NotionAnnotationType,
          AnnotationTransformer
        >,
        properties: {} as any,
      },
      utils: {
        transformRichText: this.transformRichText.bind(this),
        processBlock: this.processBlock.bind(this),
        transformDatabaseProperties: async () => ({}),
      },
      manifest: {},
    };

    this.addVariable('content', this.defaultResolver);
    this.addVariable('imports', this.defaultResolver);
  }

  private defaultResolver: VariableResolver = async (variableName, context) => {
    const collected = context.variableData.get(variableName) || [];
    return collected.join('\n');
  };

  private addVariable(name: string, resolver?: VariableResolver): void {
    if (!this.variableDataCollector.has(name)) {
      this.variableDataCollector.set(name, []);
    }
    if (resolver) {
      this.variableResolvers.set(name, resolver);
    }
  }

  async process(data: ChainData): Promise<ChainData> {
    this.context.pageId = data.pageId;
    this.context.blockTree = data.blockTree.blocks;
    this.variableDataCollector.set('content', []);
    this.variableDataCollector.set('imports', []);

    // KEY FIX: Process top-level blocks with proper sibling numbering
    const topLevelResults = await processChildrenWithNumbering(
      data.blockTree.blocks,
      this.processBlock.bind(this),
      {},
    );

    // Add to collector
    for (const result of topLevelResults) {
      this.addToCollector('content', result);
    }

    const content = await this.renderTemplate();

    return this.next
      ? this.next.process({ ...data, content })
      : { ...data, content };
  }

  protected async transformRichText(
    richText: NotionRichTextItem[],
    metadata?: ContextMetadata,
  ): Promise<string> {
    const results = await Promise.all(
      richText.map(async (item) => {
        let text = item.plain_text;
        const link = item.href;
        const annotations = item.annotations;

        if (
          item.type === 'equation' &&
          item.equation &&
          this.context.transformers.annotations.equation
        ) {
          return this.context.transformers.annotations.equation.transform({
            text,
            metadata,
            manifest: this.context.manifest,
          });
        }

        if (annotations.code && this.context.transformers.annotations.code) {
          text = await this.context.transformers.annotations.code.transform({
            text,
            annotations,
            metadata,
            manifest: this.context.manifest,
          });
        }

        for (const [name, value] of Object.entries(annotations)) {
          if (
            name !== 'code' &&
            value &&
            this.context.transformers.annotations[name]
          ) {
            text = await this.context.transformers.annotations[name].transform({
              text,
              annotations,
              metadata,
              manifest: this.context.manifest,
            });
          }
        }

        if (link && this.context.transformers.annotations.link) {
          text = await this.context.transformers.annotations.link.transform({
            text,
            link: { url: link },
            metadata,
            manifest: this.context.manifest,
          });
        }

        return text;
      }),
    );

    return results.join('');
  }

  protected async processBlock(
    block: NotionBlock,
    metadata?: ContextMetadata,
  ): Promise<string> {
    // @ts-ignore
    const blockType = block.type;
    const transformer = this.context.transformers.blocks[blockType];

    if (!transformer) {
      return '';
    }

    const blockContext: RendererContext = {
      ...this.context,
      block,
      metadata: {
        ...this.context.metadata,
        ...metadata,
      },
    };

    return transformer.transform(blockContext);
  }

  private addToCollector(variable: string, content: string): void {
    if (!this.variableDataCollector.has(variable)) {
      this.variableDataCollector.set(variable, []);
    }
    this.variableDataCollector.get(variable)!.push(content);
  }

  private async renderTemplate(): Promise<string> {
    const resolvedVariables: Record<string, string> = {};

    for (const [name] of this.variableDataCollector.entries()) {
      const resolver = this.variableResolvers.get(name) || this.defaultResolver;
      resolvedVariables[name] = await resolver(name, this.context);
    }

    return this.template.replace(
      /{{{(\w+)}}}/g,
      (_, name) => resolvedVariables[name] || '',
    );
  }
}

// ============================================================================
// TEST HELPERS
// ============================================================================

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
    numbered_list_item: { rich_text: richTextItems, color: 'default' },
    children,
    comments: [],
  } as unknown as NotionBlock;
}

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
    bulleted_list_item: { rich_text: richTextItems, color: 'default' },
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
    paragraph: { rich_text: richTextItems, color: 'default' },
    children,
    comments: [],
  } as unknown as NotionBlock;
}

function _equationBlock(
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
    equation: { expression },
    children: [],
    comments: [],
  } as unknown as NotionBlock;
}

// ============================================================================
// TEST CASES
// ============================================================================

interface TestCase {
  name: string;
  blocks: NotionBlocks;
  expectedPatterns: string[];
  unexpectedPatterns?: string[];
}

const testCases: TestCase[] = [
  {
    name: 'Multiple numbered list siblings - MUST have sequential numbers',
    blocks: [
      numberedListItem('n1', 'page', 'page_id', [richText('First')]),
      numberedListItem('n2', 'page', 'page_id', [richText('Second')]),
      numberedListItem('n3', 'page', 'page_id', [richText('Third')]),
      numberedListItem('n4', 'page', 'page_id', [richText('Fourth')]),
      numberedListItem('n5', 'page', 'page_id', [richText('Fifth')]),
    ],
    expectedPatterns: [
      '1. First',
      '2. Second',
      '3. Third',
      '4. Fourth',
      '5. Fifth',
    ],
  },
  {
    name: 'Nested numbered list with correct numbers at all levels',
    blocks: [
      numberedListItem(
        'n1',
        'page',
        'page_id',
        [richText('Item 1')],
        [
          numberedListItem('n1-1', 'n1', 'block_id', [richText('Item 1.1')]),
          numberedListItem('n1-2', 'n1', 'block_id', [richText('Item 1.2')]),
        ],
      ),
      numberedListItem(
        'n2',
        'page',
        'page_id',
        [richText('Item 2')],
        [
          numberedListItem('n2-1', 'n2', 'block_id', [richText('Item 2.1')]),
          numberedListItem('n2-2', 'n2', 'block_id', [richText('Item 2.2')]),
        ],
      ),
    ],
    expectedPatterns: [
      '1. Item 1',
      '    1. Item 1.1',
      '    2. Item 1.2',
      '2. Item 2',
      '    1. Item 2.1',
      '    2. Item 2.2',
    ],
  },
  {
    name: 'Callout with NO duplicate blockquote prefix',
    blocks: [
      calloutBlock('c1', 'page', 'page_id', '📌', [richText('Simple callout')]),
    ],
    expectedPatterns: ['> 📌 Simple callout'],
    unexpectedPatterns: [
      '> 📌 > ', // No duplicate prefix
    ],
  },
  {
    name: 'Callout with numbered list - correct numbering',
    blocks: [
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
    ],
    expectedPatterns: [
      '> 💡 Proof',
      '> 1. Step 1',
      '> 2. Step 2',
      '> 3. Step 3',
    ],
  },
  {
    name: 'Callout with nested numbered list - all numbers correct',
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
            [richText('Assume P')],
            [
              numberedListItem('n1-1', 'n1', 'block_id', [
                richText('Sub-step 1.1'),
              ]),
              numberedListItem('n1-2', 'n1', 'block_id', [
                richText('Sub-step 1.2'),
              ]),
            ],
          ),
          numberedListItem('n2', 'c1', 'block_id', [richText('Contradiction')]),
          numberedListItem('n3', 'c1', 'block_id', [
            richText('Therefore not P'),
          ]),
        ],
      ),
    ],
    expectedPatterns: [
      '**Proof by Contradiction**',
      '> 1. Assume P',
      '>     1. Sub-step 1.1',
      '>     2. Sub-step 1.2',
      '> 2. Contradiction',
      '> 3. Therefore not P',
    ],
  },
  {
    name: 'Inline equations without extra spaces',
    blocks: [
      numberedListItem('n1', 'page', 'page_id', [
        richText('Let '),
        richText('x = 5', { equation: true }),
        richText(' be given'),
      ]),
    ],
    expectedPatterns: ['Let $x = 5$ be given'],
    unexpectedPatterns: [
      '  $', // No double spaces before equation
      '$  ', // No double spaces after equation
    ],
  },
  {
    name: 'Mixed list types reset numbering correctly',
    blocks: [
      numberedListItem('n1', 'page', 'page_id', [richText('Numbered 1')]),
      numberedListItem('n2', 'page', 'page_id', [richText('Numbered 2')]),
      bulletedListItem('b1', 'page', 'page_id', [richText('Bullet A')]),
      bulletedListItem('b2', 'page', 'page_id', [richText('Bullet B')]),
      numberedListItem('n3', 'page', 'page_id', [richText('Numbered 1 again')]),
      numberedListItem('n4', 'page', 'page_id', [richText('Numbered 2 again')]),
    ],
    expectedPatterns: [
      '1. Numbered 1',
      '2. Numbered 2',
      '- Bullet A',
      '- Bullet B',
      '1. Numbered 1 again',
      '2. Numbered 2 again',
    ],
  },
  {
    name: 'Paragraph breaks numbered list',
    blocks: [
      numberedListItem('n1', 'page', 'page_id', [richText('Item 1')]),
      numberedListItem('n2', 'page', 'page_id', [richText('Item 2')]),
      paragraphBlock('p1', 'page', 'page_id', [richText('A paragraph')]),
      numberedListItem('n3', 'page', 'page_id', [richText('New list item 1')]),
      numberedListItem('n4', 'page', 'page_id', [richText('New list item 2')]),
    ],
    expectedPatterns: [
      '1. Item 1',
      '2. Item 2',
      'A paragraph',
      '1. New list item 1',
      '2. New list item 2',
    ],
  },
  {
    name: 'Complex callout with equations and nested lists',
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
            richText('n \\in \\mathbb{N}', { equation: true }),
          ]),
          numberedListItem(
            'n2',
            'c1',
            'block_id',
            [
              richText('Assume '),
              richText('P(n)', { equation: true }),
              richText(' holds'),
            ],
            [
              numberedListItem('n2-1', 'n2', 'block_id', [
                richText('Then '),
                richText('P(n+1)', { equation: true }),
              ]),
            ],
          ),
          numberedListItem('n3', 'c1', 'block_id', [richText('QED')]),
        ],
      ),
    ],
    expectedPatterns: [
      '> 📐 Math Proof',
      '> 1. Let $n \\in \\mathbb{N}$',
      '> 2. Assume $P(n)$ holds',
      '>     1. Then $P(n+1)$',
      '> 3. QED',
    ],
  },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runTests() {
  console.log('='.repeat(80));
  console.log('PROPOSED FIX VALIDATION');
  console.log('Testing the fix for Issue #140');
  console.log('='.repeat(80));
  console.log();

  let passed = 0;
  let failed = 0;
  const failures: { name: string; issues: string[]; output: string }[] = [];

  for (const testCase of testCases) {
    const renderer = new FixedMDXRenderer();

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
      const issues: string[] = [];

      // Check expected patterns
      for (const pattern of testCase.expectedPatterns) {
        if (!output.includes(pattern)) {
          issues.push(`Missing: "${pattern}"`);
        }
      }

      // Check unexpected patterns
      if (testCase.unexpectedPatterns) {
        for (const pattern of testCase.unexpectedPatterns) {
          if (output.includes(pattern)) {
            issues.push(`Found unexpected: "${pattern}"`);
          }
        }
      }

      if (issues.length === 0) {
        console.log(`✅ PASS: ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${testCase.name}`);
        for (const issue of issues) {
          console.log(`   ${issue}`);
        }
        failed++;
        failures.push({ name: testCase.name, issues, output });
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

  if (failures.length > 0) {
    console.log();
    console.log('FAILURE DETAILS:');
    console.log('='.repeat(80));

    for (const failure of failures) {
      console.log();
      console.log(`TEST: ${failure.name}`);
      console.log('-'.repeat(60));
      console.log('ISSUES:', failure.issues.join('; '));
      console.log();
      console.log('OUTPUT:');
      console.log(failure.output);
      console.log('-'.repeat(60));
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
