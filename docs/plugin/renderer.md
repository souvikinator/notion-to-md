# Notion-to-MD v4: Renderer Plugin System Design

## Core Philosophy

The renderer plugin system aims to provide a flexible, type-safe way to transform Notion blocks into any desired output format. The system should be intuitive for simple use cases while allowing complex customization when needed.

## Design Principles

1. Variables are containers that collect and transform content
2. Block transformers focus on single-block conversion
3. Context flows through the system providing necessary information
4. Templates define document structure using variables
5. Metadata allows arbitrary data sharing

## System Components

### Variables

Variables collect content throughout rendering and optionally transform it before final output. 'content' and 'imports' are required variables.

```typescript
// Adding variable with default joining behavior
renderer.addVariable('content');

// Adding variable with custom resolver
renderer.addVariable('frontmatter', async (name, context) => {
  const collected = context.variableData.get(name) || [];
  return `---\n${collected.join('\n')}\n---`;
});
```

### Block Transformers

Transformers convert Notion blocks to output format. Their output goes to a target variable (defaults to 'content').

```typescript
renderer.createBlockTransformer('paragraph', {
  transform: async ({ block, utils }) => {
    const content = await utils.processRichText(block.paragraph.rich_text);
    return content;
  },
  targetVariable: 'content',
  imports: ['import { Paragraph } from "./ui";']
});
```

### Context System

Context flows through the rendering pipeline carrying necessary information:

```typescript
interface RendererContext {
  pageId: string;
  pageProperties: PageProperties;
  metadata: ContextMetadata;
  block: ListBlockChildrenResponseResult;
  blockTree: ListBlockChildrenResponseResults;
  variableData: VariableCollector;
  transformers: { blocks, annotations };
  utils: { processRichText, processChildren };
}
```

### Templates

Templates define document structure using variables:

```typescript
protected template = `{{{frontmatter}}}

{{{imports}}}

{{{content}}}`;
```

## Implementation Details

### Variable Collection

- Each variable has a collector array
- Block outputs go to target variable collector
- Collectors reset between renderings (except imports)
- Optional resolvers transform collected content

### Import Management

- Imports stored in 'imports' variable collector
- Block-level imports added only when transformer used
- Imports persist across collector resets
- Automatic deduplication

### Metadata

- Map-based storage for arbitrary data
- Accessible throughout rendering process
- Can be nested for block-specific context

## Usage Patterns

### Basic Renderer
```typescript
class MDRenderer extends BaseRendererPlugin {
  protected template = `{{{content}}}`;

  constructor() {
    super();
    this.createBlockTransformers({
      paragraph: {
        transform: async ({ block, utils }) => {
          return await utils.processRichText(block.paragraph.rich_text);
        }
      }
    });
  }
}
```

### Complex Renderer
```typescript
class BlogRenderer extends BaseRendererPlugin {
  constructor(config: BlogConfig) {
    super();

    // Add variables
    this.addVariable('frontmatter', this.resolveFrontmatter)
      .addVariable('content')
      .addVariable('footnotes', this.resolveFootnotes);

    // Add metadata
    this.addMetadata('baseUrl', config.baseUrl);

    // Add transformers
    this.createBlockTransformers({
      paragraph: { transform: this.transformParagraph },
      footnote: {
        transform: this.transformFootnote,
        targetVariable: 'footnotes'
      }
    });
  }
}
```

## Extension Guidelines

1. Use variables for collecting related content
2. Create focused block transformers
3. Use metadata for sharing state
4. Override processBlock for custom block handling
5. Extend context utilities as needed
