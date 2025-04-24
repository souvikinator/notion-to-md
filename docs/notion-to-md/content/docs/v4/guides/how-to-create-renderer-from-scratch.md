---
title: "How to create renderer plugin from scratch"
description: "Guide on how to create a renderer plugin from scratch in notion-to-md v4"
weight: 3
tags:
  - tutorial
  - markdown
  - v4
  - notion-to-md
  - transformers
  - renderer plugin
comments: true
---

This guide walks you through creating a custom JSX renderer plugin. We'll build it step by step, starting with the basics.

## Basic Structure

First, we need to create our renderer class that extends the base plugin and then we define the template for the renderer:

```typescript {linenos=table,filename="index.ts"}
import { BaseRendererPlugin } from "notion-to-md/core";

export class JSXRenderer extends BaseRendererPlugin {
  protected template = `{{{imports}}}

export function NotionContent({ components = {} }) {
  return (
    <div className="notion-content">
      {{{content}}}
    </div>
  );
}`;

}
```

Let's understand what's happening:
- We extend `BaseRendererPlugin` to get core rendering capabilities
- Our template defines the output structure with two variables:
  - `imports`: For component imports
  - `content`: For the actual content
- The template creates a React component that wraps our content

## Adding config

To allow customization, we’ll introduce a configuration option in the plugin's metadata. In this example, users can specify a custom name for the component.

```typescript {linenos=table,hl_lines=[3,4,5,10,18,19,20,21],file="index.ts"}
import { BaseRendererPlugin } from "notion-to-md/core";

export interface JSXRendererConfig {
  componentName?: string;
}

export class JSXRenderer extends BaseRendererPlugin {
  protected template = `{{{imports}}}

export function {{{component}}}({ components = {} }) {
  return (
    <div className="notion-content">
      {{{content}}}
    </div>
  );
}`;

  constructor(config: JSXRendererConfig = {}) {
    super();
    this.addMetadata('config', config); // Add config to metadata against key 'config'
  }
}
```

Note that we’ve replaced `NotionContent` with the `{{{component}}}` variable (name it whatever you want). We'll be dynamically substituting with the component name specified in the user’s configuration.

## Adding Annotation Transformers

Annotation transformers handle inline text formatting. Each transformer converts Notion's text formatting to JSX:

```typescript {linenos=table,linenostart=1,filename="transformers/annotations.ts"}
const annotationTransformers = {
  bold: {
    transform: async ({ text }) => `<strong>${text}</strong>`
  },

  italic: {
    transform: async ({ text }) => `<em>${text}</em>`
  },

  link: {
    transform: async ({ text, link }) => {
      if (!link?.url) return text;
      return `<a href="${link.url}" target="_blank" rel="noopener">${text}</a>`;
    }
  },

  code: {
    transform: async ({ text }) => `<code className="inline-code">${text}</code>`
  }
  // ...other annotations
};
```

> [!TIP]
> Read more about [annotation transformers](/notion-to-md/docs/v4/concepts/renderer-plugin/annotation-transformer/)

Let's add these to our renderer:

```typescript {linenos=table,linenostart=45,hl_lines=[5],filename="index.ts"}
// Update constructor
constructor(config: JSXRendererConfig = {}) {
  super();
  this.addMetadata('config', config);
  this.createAnnotationTransformers(annotationTransformers);
}
```

## Adding Block Transformers

Let's add more essential block transformers and integrate them into our renderer:

```typescript {linenos=table,filename="transformers/blocks.ts"}
const blockTransformers = {
  paragraph: {
    transform: async ({ block, utils }) => {
      const text = await utils.transformRichText(block.paragraph.rich_text);
      return `<p className="notion-paragraph">${text}</p>\n\n`;
    }
  },

  // heading with support for toggle
  heading_1: {
    transform: async ({ block, utils }) => {
      const headingBlock = block.heading_1;
      const isToggle = headingBlock.is_toggleable;
      const text = await utils.transformRichText(headingBlock.rich_text);

      if (!isToggle) {
        return `<h1 className="notion-h1">${text}</h1>\n\n`;
      }

      // For toggleable headings, we process children directly
      // This ensures proper content building from bottom up
      const childrenContent = block.children?.length
        ? await Promise.all(
            block.children.map((child) => utils.processBlock(child)),
          )
        : [];

      return `<details>
  <summary>
  <h1>${text}</h1>
  </summary>

  ${childrenContent.join('\n')}

</details>\n`;
    },

  code: {
    transform: async ({ block, utils }) => {
      const code = await utils.transformRichText(block.code.rich_text);
      const lang = block.code.language || 'plain';

      return `<CodeBlock language="${lang}">
  ${code}
</CodeBlock>\n\n`;
    },
    imports: [`import { CodeBlock } from '@/components/CodeBlock';`] // added imports
  }

  //...add other block types and their transformers
};
```

> [!TIP]
> Read more about [block transformers and their interaction with variables](/notion-to-md/docs/v4/concepts/renderer-plugin/block-transformer/).

Now let's update our renderer to use these transformers:

```typescript {linenos=table,hl_lines=[6],filename="index.ts"}
constructor(config: JSXRendererConfig = {}) {
  super();

  this.addMetadata('config', config);
  this.createAnnotationTransformers(annotationTransformers);
  this.createBlockTransformers(blockTransformers);
}
```

## Adding Variable Resolvers

To handle our template variables (`imports`, `content`, and `component`), we need to create resolvers. Each variable get assiged a default resolver which works fine for `imports` and `content` but for `component` we needs a custom resolver since it has different use case.

```typescript {linenos=table,filename="resolvers.ts"}
import { VariableResolver } from 'notion-to-md';

export const createComponentNameResolver = (): VariableResolver => {
  return async (_, context) => {
    // accessing the config we created from context.metadata
    const config = context.metadata.config || {};
    return config.componentName || 'NotionContent';
  };
};

// can define resolvers for content or import or any other use case if needed
// for this default works just fine for content and imports variables.
```

> [!TIP]
> Read more about [variables and resolvers](/notion-to-md/docs/v4/concepts/renderer-plugin/variables-and-templates/).


Let's add these resolvers to our renderer:

```typescript {linenos=table,hl_lines=[8],filename="index.ts"}
constructor(config: JSXRendererConfig = {}) {
  super();

  this.addMetadata('config', config);
  this.createAnnotationTransformers(annotationTransformers);
  this.createBlockTransformers(blockTransformers);

  this.addVariable('component', createComponentResolver());
}
```

## Using the Renderer

Now that we have our JSX renderer complete, here's how to use it:

```typescript
import { NotionConverter } from 'notion-to-md';
import { Client } from '@notionhq/client';
import { JSXRenderer } from './jsx-renderer';

// Create Notion client
const notionClient = new Client({
  auth: 'your-notion-api-key'
});

// Initialize converter with builder pattern
const n2m = new NotionConverter(notionClient)
  .withRenderer(new JSXRenderer({
    componentName: 'MyNotionContent'
  }))
  .withExporter({
    // Your exporter configuration
    outputType: 'file',
    outputPath: './output/my-page.jsx'
  });

// Convert notion page to JSX
await n2m.convert('your-notion-page-id');
```

This will output JSX code that looks like:

```jsx
export function MyNotionContent({ components = {} }) {
  return (
    <div className="notion-content">
      <h1 className="notion-h1">Welcome to Notion</h1>
      <p className="notion-paragraph">This is a paragraph with some <strong>bold</strong> text.</p>
      <pre className="notion-code">
        <code className="language-javascript">
          console.log('Hello World');
        </code>
      </pre>
    </div>
  );
}
```

## Next Steps

- Add more block transformers for other Notion block types
- Implement custom styling system
- Add support for interactive components
- Handle nested blocks (like toggle lists)
- Add proper TypeScript types for components props

Remember that this is a basic implementation. You can extend it further based on your specific needs by adding more transformers, improving the styling, or adding additional features.
