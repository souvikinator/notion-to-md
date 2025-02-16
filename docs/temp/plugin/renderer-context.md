# Understanding Context Flow in Notion-to-MD v4 Renderer System

## Context Overview

The renderer system uses a layered context approach that flows information through the rendering pipeline. The context gets enriched at different stages and can be customized by plugin authors.

## Context Structure

```typescript
interface RendererContext {
  // Basic information
  pageId: string;
  pageProperties: PageProperties;

  // Custom data storage
  metadata: ContextMetadata;  // Map<string, any>

  // Current processing state
  block: ListBlockChildrenResponseResult;
  blockTree: ListBlockChildrenResponseResults;

  // Variable system state
  variableData: VariableCollector;

  // Available transformers
  transformers: {
    blocks: Record<BlockType, BlockTransformer>;
    annotations: Record<string, AnnotationTransformer>;
  };

  // Utility functions
  utils: {
    processRichText: (richText: RichTextItemResponse[], metadata?: ContextMetadata) => Promise<string>;
    processChildren: (blocks: ListBlockChildrenResponseResults, metadata?: ContextMetadata) => Promise<string>;
  };
}
```

## Context Flow Through System

The context flows through several stages during rendering:

```typescript
// 1. Initial Context Creation (in constructor)
class MyRenderer extends BaseRendererPlugin {
  constructor(config: MyConfig) {
    super();

    // Add configuration to metadata
    this.addMetadata('config', config);
    this.addMetadata('baseUrl', config.baseUrl);
  }
}

// 2. Chain Data Integration (during process)
public async process(data: ChainData): Promise<ChainData> {
  // Context updated with chain data
  this.updateContext(data);
  // ... processing continues
}

// 3. Block-Level Context (during block processing)
protected async processBlock(block: ListBlockChildrenResponseResult, metadata?: ContextMetadata): Promise<string> {
  const blockContext = {
    ...this.context,
    block,
    metadata: new Map([
      ...Array.from(this.context.metadata.entries()),
      ...(metadata ? Array.from(metadata.entries()) : []),
    ]),
  };
  // ... block processing with enriched context
}
```

## Adding Custom Context Data

Plugin authors can add custom data in several ways:

### 1. Configuration-Based Metadata

```typescript
class BlogRenderer extends BaseRendererPlugin {
  constructor(config: BlogConfig) {
    super();

    // Add entire config
    this.addMetadata('config', config);

    // Add specific values
    this.addMetadata('baseUrl', config.baseUrl);
    this.addMetadata('theme', config.theme);
  }
}
```

### 2. Processing-Time Metadata

```typescript
protected createNestedContext(depth: number): ContextMetadata {
  return new Map([
    ['nestingDepth', depth],
    ['indentation', '  '.repeat(depth)]
  ]);
}

protected transformNestedBlock({ block, utils, metadata }: RendererContext): Promise<string> {
  const depth = (metadata.get('nestingDepth') as number) || 0;
  const children = await utils.processChildren(
    block.children,
    this.createNestedContext(depth + 1)
  );
  return `${metadata.get('indentation')}${children}`;
}
```

### 3. Variable-Specific Metadata

```typescript
class DocsRenderer extends BaseRendererPlugin {
  constructor() {
    super();

    this.addVariable('toc', async (name, context) => {
      const headings = context.variableData.get('headings') || [];
      const tocDepth = context.metadata.get('tocDepth') || 3;
      return this.generateTOC(headings, tocDepth);
    });
  }
}
```

## Context Access Points

Context is accessible in:

1. Block Transformers
```typescript
createBlockTransformer('heading_1', {
  transform: ({ block, utils, metadata }) => {
    const baseUrl = metadata.get('baseUrl');
    const slug = createSlug(block.heading_1.text);
    return `<h1 id="${slug}"><a href="${baseUrl}#${slug}">...</a></h1>`;
  }
});
```

2. Variable Resolvers
```typescript
addVariable('frontmatter', async (name, context) => {
  const siteConfig = context.metadata.get('config');
  return generateFrontmatter(context.pageProperties, siteConfig);
});
```

3. Rich Text Processing
```typescript
processRichText(richText, new Map([
  ['inFootnote', true],
  ['footnoteIndex', 1]
]));
```

4. Child Block Processing
```typescript
processChildren(block.children, new Map([
  ['parentType', block.type],
  ['parentId', block.id]
]));
```

## Best Practices

1. Store configuration in metadata during initialization
2. Use metadata for state that needs to flow through the render pipeline
3. Create nested metadata for hierarchical structures
4. Access metadata safely with fallback values
5. Document metadata keys used by your plugin
