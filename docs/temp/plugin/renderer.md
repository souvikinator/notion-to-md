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
    const content = await utils.transformRichText(block.paragraph.rich_text);
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
  utils: { transformRichText, processChildren };
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
          return await utils.transformRichText(block.paragraph.rich_text);
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

## Example


```typescript
// resolvers.ts
import { VariableResolver } from '../types';
import { extractPropertyValue, formatYamlValue } from './helpers';

/**
 * Resolver for frontmatter variable that handles configuration-based
 * property extraction and formatting
 */
export const createFrontmatterResolver = (): VariableResolver => {
  return async (_, context) => {
    const config = context.metadata.config?.frontmatter;
    const properties = context.pageProperties;

    // Return empty string if no properties exist
    if (!properties || Object.keys(properties).length === 0) {
      return '';
    }

    const frontmatterObj: Record<string, any> = {};

    // Process properties according to configuration
    for (const [key, value] of Object.entries(properties)) {
      // Skip excluded properties
      if (config?.properties?.exclude?.includes(key)) {
        continue;
      }

      // Skip if not in include list (when include list exists)
      if (config?.properties?.include &&
          !config.properties.include.includes(key)) {
        continue;
      }

      // Apply property name mapping
      const propertyName = config?.properties?.rename?.[key] || key;
      frontmatterObj[propertyName] = extractPropertyValue(value);
    }

    // Apply default values for missing properties
    if (config?.properties?.defaults) {
      for (const [key, value] of Object.entries(config.properties.defaults)) {
        if (!(key in frontmatterObj)) {
          frontmatterObj[key] = value;
        }
      }
    }

    // Format as YAML
    return `---\n${Object.entries(frontmatterObj)
      .map(([key, value]) => `${key}: ${formatYamlValue(value)}`)
      .join('\n')}\n---`;
  };
};

/**
 * Default resolver for content variable that joins collected content with newlines
 */
export const createContentResolver = (): VariableResolver => {
  return async (_, context) => {
    const collected = context.variableData.get('content') || [];
    return collected.join('\n');
  };
};

/**
 * Resolver for imports variable that handles deduplication and formatting
 */
export const createImportsResolver = (): VariableResolver => {
  return async (_, context) => {
    const imports = context.variableData.get('imports') || [];
    // Deduplicate imports while preserving order
    const uniqueImports = [...new Set(imports)];
    return uniqueImports.join('\n');
  };
};

/**
 * Creates a collection of default resolvers used by the MD renderer
 */
export const createDefaultResolvers = () => ({
  frontmatter: createFrontmatterResolver(),
  content: createContentResolver(),
  imports: createImportsResolver()
});
```

Now our MDRenderer becomes even cleaner with the resolvers moved out:

```typescript
// MDRenderer.ts
import { BaseRendererPlugin } from './base';
import { blockTransformers } from './blockTransformers';
import { annotationTransformers } from './annotationTransformers';
import { createDefaultResolvers } from './resolvers';

interface FrontmatterConfig {
  properties?: {
    include?: string[];
    exclude?: string[];
    rename?: Record<string, string>;
    defaults?: Record<string, any>;
  };
}

interface MDRendererConfig {
  frontmatter?: FrontmatterConfig;
}

export class MDRenderer extends BaseRendererPlugin {
  protected template = `{{{frontmatter}}}

{{{imports}}}

{{{content}}}`;

  constructor(config: MDRendererConfig = {}) {
    super();

    // Store configuration in metadata
    this.addMetadata('config', config);

    // Initialize transformers
    this.createBlockTransformers(blockTransformers);
    this.createAnnotationTransformers(annotationTransformers);

    // Initialize resolvers
    const resolvers = createDefaultResolvers();
    Object.entries(resolvers).forEach(([name, resolver]) => {
      this.addVariable(name, resolver);
    });
  }
}
```

This separation provides several benefits:

1. Each resolver is self-contained and can be tested independently
2. Users can easily create and swap in custom resolvers
3. The code is more maintainable with clear separation of concerns
4. Resolvers can be reused across different renderer implementations

Users can create custom resolvers for special needs:

```typescript
// Example of creating a custom frontmatter resolver
const customFrontmatterResolver: VariableResolver = async (_, context) => {
  // Custom frontmatter logic here
  return '---\ncustom: true\n---';
};

const renderer = new MDRenderer();
renderer.addVariable('frontmatter', customFrontmatterResolver);
```
