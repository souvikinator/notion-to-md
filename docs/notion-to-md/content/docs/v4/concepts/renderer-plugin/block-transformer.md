---
title: "Block Transformers"
description: "Understanding the block transformer and the possibilities it offers"
weight: 3
---

Block transformers handle the conversion of specific Notion block types into your target format. Each transformer should focus on a single block type and returns corresponding output in string.

#### Basic Structure

A block transformer consists of:
- A required `transform` function that converts the block
- Optional `imports` array for required imports
- Optional `targetVariable` string to specify where output is collected

```typescript
type BlockTransformer = {
  // Required: Transform function that converts block to string
  transform: (context: RendererContext) => Promise<string>;

  // Optional: Imports needed for this block
  // this gets populated into the default import variable
  imports?: string[];

  // Optional: Variable to collect output (defaults to 'content')
  targetVariable?: string;
};
```

#### Basic Examples

Simple transformers for common blocks:

```typescript
protected blockTransformers = {
  heading_1: {
    transform: async ({ block, utils }) => {
      const text = await utils.transformRichText(block.heading_1.rich_text);
      return `# ${text}\n\n`;
    }
  },
  paragraph: {
    transform: async ({ block, utils }) => {
      const text = await utils.transformRichText(block.paragraph.rich_text);
      return `${text}\n\n`;
    }
  }
};
```

#### Working with Imports

When a block needs specific imports (like React components), you can define them in the transformer:

```typescript
protected blockTransformers = {
  code: {
    transform: async ({ block, utils }) => {
      const code = block.code.rich_text[0].plain_text;
      const language = block.code.language || 'plain';
      return `<CodeBlock language="${language}">${code}</CodeBlock>\n\n`;
    },
    // These imports will be automatically added to the 'imports' variable
    // when this block type is used
    imports: [
      `import { CodeBlock } from '@/components/CodeBlock';`
    ]
  },

  callout: {
    transform: async ({ block, utils }) => {
      const text = await utils.transformRichText(block.callout.rich_text);
      return `<Callout type="info">${text}</Callout>\n\n`;
    },
    imports: [
      `import { Callout } from '@/components/Callout';`
    ]
  }
};
```

#### Custom Variable Targeting

Transformers can send their output to specific variables using `targetVariable`:

```typescript
protected blockTransformers = {
  // Table of contents block goes to a dedicated variable
  table_of_contents: {
    transform: async () => {
      return `<TableOfContents />\n\n`;
    },
    imports: [`import { TableOfContents } from '@/components/TableOfContents';`],
    targetVariable: 'tableOfContents'
  },

  // Sidebar content goes to sidebar variable
  callout: {
    transform: async ({ block, utils }) => {
      const text = await utils.transformRichText(block.callout.rich_text);
      return `<aside class="sidebar-note">${text}</aside>\n\n`;
    },
    targetVariable: 'sidebar'
  }
};
```

#### Advanced Examples

##### Complex Block with Multiple Variables

Sometimes a block might need to contribute to multiple variables. You can handle this by using the [context's utility methods](../context):

```typescript
protected blockTransformers = {
  hero_section: {
    transform: async ({ block, utils, variableData }) => {
      const title = await utils.transformRichText(block.hero_section.title);
      const subtitle = await utils.transformRichText(block.hero_section.subtitle);

      // Add required styles
      const styles = variableData.get('styles') || [];
      styles.push(`
        .hero {
          background: linear-gradient(#fff, #f0f0f0);
          padding: 2rem;
        }
      `);
      variableData.set('styles', styles);

      // Return main content
      return `
        <section class="hero">
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </section>
      `;
    },
    imports: [`import { Hero } from '@/components/Hero';`]
  }
};
```

##### Interactive Component with Dependencies

Here's an example of a transformer that handles an interactive component with both imports and styles:

```typescript
protected blockTransformers = {
  interactive_demo: {
    transform: async ({ block, utils, variableData }) => {
      const code = block.interactive_demo.code;

      // Add required scripts
      const scripts = variableData.get('scripts') || [];
      scripts.push('https://unpkg.com/monaco-editor@latest/min/vs/editor/editor.main.js');
      variableData.set('scripts', scripts);

      // Add required styles
      const styles = variableData.get('styles') || [];
      styles.push(`
        .interactive-demo {
          height: 400px;
          border: 1px solid #ccc;
        }
      `);
      variableData.set('styles', styles);

      return `
        <InteractiveDemo
          code={${JSON.stringify(code)}}
          language="typescript"
        />
      `;
    },
    imports: [
      `import { InteractiveDemo } from '@/components/InteractiveDemo';`,
      `import '@/styles/monaco.css';`
    ]
  }
};
```

#### Best Practices

1. **Variable Management**
   - Use `targetVariable` when output belongs in a specific section
   - Access `variableData` from context for complex variable manipulation
   - Consider creating dedicated variables for specialized content

2. **Import Handling**
   - Define imports in the transformer when components are needed
   - Group related imports in the same transformer
   - Consider import deduplication (handled automatically by the renderer)

3. **Content Organization**
   - Use meaningful variable names for different content types
   - Keep transformers focused on single responsibilities
   - Document variable dependencies in comments

4. **Context Usage**
   - Leverage the full context object for advanced transformations
   - Use utility methods like `transformRichText` for consistent formatting
   - Access metadata and page properties when needed
