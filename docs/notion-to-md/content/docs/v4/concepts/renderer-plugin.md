---
title: "Renderer Plugins"
description: "Learn about renderer plugins and how to customize existing renderer plugins or create one from scratch for notion-to-md v4"
weight: 6
---

Renderer plugins determine how Notion blocks are transformed into your target format. They provide complete control over the conversion process, allowing you to generate exactly the output you need - whether that's Markdown, HTML, JSX, or any other format.

## Why Renderer Plugins Matter

The default renderer in notion-to-md outputs Markdown and MDX, which works well for many use cases. However, custom renderers enable:

1. **Format flexibility** - Generate HTML, JSX, LaTeX, or any text-based format
2. **Styling control** - Apply your own styling and formatting rules
3. **Component integration** - Create output that works with your component library

{{< callout emoji="🎨" >}}
**Share Your Renderers With The Community!**

Have you created a useful renderer for a popular format or framework? Consider sharing it with the community!

1. Create a GitHub repository for your renderer
2. Submit a PR
3. We'll review and link your quality renderers in our cataloge

Your contribution can help others generate content in formats like HTML, React components, Vue templates, LaTeX documents, and more!

{{< /callout >}}

## The Renderer Architecture

All renderers extend the `BaseRendererPlugin` abstract class, which provides the core rendering functionality:

```typescript
import { BaseRendererPlugin } from 'notion-to-md';

class CustomRenderer extends BaseRendererPlugin {
  // Template for the output document structure
  protected template = `{{{frontmatter}}}
{{{imports}}}
{{{content}}}`;

  // Variables to populate the template
  protected variables = { /* variable resolvers */ };

  // Block transformers define how each Notion block type is rendered
  protected blockTransformers = { /* block transformers */ };

  // Annotation transformers define how text formatting is handled
  protected annotationTransformers = { /* annotation transformers */ };
}
```

Let's look at each component in detail.

## Creating a Simple Renderer

Here's a basic example of a custom Markdown renderer:

```javascript
import { BaseRendererPlugin } from 'notion-to-md';

class SimpleMarkdownRenderer extends BaseRendererPlugin {
  // Define the document template
  protected template = `{{{frontmatter}}}
{{{content}}}`;

  // Define template variables
  protected variables = {
    frontmatter: (context) => {
      const title = context.pageProperties?.title?.title?.[0]?.plain_text || 'Untitled';
      return `---
title: ${title}
date: ${new Date().toISOString().split('T')[0]}
---\n\n`;
    }
  };

  // Define block transformers
  protected blockTransformers = {
    heading_1: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.heading_1.rich_text);
        return `# ${text}\n\n`;
      }
    },

    paragraph: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.paragraph.rich_text);
        return text ? `${text}\n\n` : '\n';
      }
    },

    image: {
      transform: async ({ block }) => {
        const caption = block.image.caption?.[0]?.plain_text || 'image';
        const url = block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;
        return `![${caption}](${url})\n\n`;
      }
    }
  };

  // Define annotation transformers
  protected annotationTransformers = {
    bold: {
      transform: async ({ text }) => `**${text}**`
    },

    italic: {
      transform: async ({ text }) => `*${text}*`
    },

    code: {
      transform: async ({ text }) => `\`${text}\``
    }
  };
}

// Usage
const n2m = new NotionConverter(notionClient)
  .withRenderer(new SimpleMarkdownRenderer());

await n2m.convert('your-page-id');
```

This renderer handles basic headings, paragraphs, images, and text formatting.

## Creating an HTML Renderer

Here's a simple HTML renderer:

```javascript
import { BaseRendererPlugin } from 'notion-to-md';

class HTMLRenderer extends BaseRendererPlugin {
  protected template = `<!DOCTYPE html>
<html>
<head>
  <title>{{{title}}}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    img { max-width: 100%; height: auto; }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
  </style>
</head>
<body>
  <article>
    {{{content}}}
  </article>
</body>
</html>`;

  protected variables = {
    title: (context) =>
      context.pageProperties?.title?.title?.[0]?.plain_text || 'Notion Page'
  };

  protected blockTransformers = {
    heading_1: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.heading_1.rich_text);
        return `<h1>${text}</h1>`;
      }
    },

    paragraph: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.paragraph.rich_text);
        return text ? `<p>${text}</p>` : '';
      }
    },

    image: {
      transform: async ({ block }) => {
        const caption = block.image.caption?.[0]?.plain_text || '';
        const url = block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;

        return `
<figure>
  <img src="${url}" alt="${caption}">
  ${caption ? `<figcaption>${caption}</figcaption>` : ''}
</figure>`;
      }
    },

    code: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.code.rich_text);
        const language = block.code.language || '';

        return `
<pre><code class="language-${language}">
${text}
</code></pre>`;
      }
    }
  };

  protected annotationTransformers = {
    bold: {
      transform: async ({ text }) => `<strong>${text}</strong>`
    },

    italic: {
      transform: async ({ text }) => `<em>${text}</em>`
    },

    underline: {
      transform: async ({ text }) => `<u>${text}</u>`
    },

    code: {
      transform: async ({ text }) => `<code>${text}</code>`
    },

    link: {
      transform: async ({ text, link }) =>
        link?.url ? `<a href="${link.url}">${text}</a>` : text
    }
  };
}

// Usage
const n2m = new NotionConverter(notionClient)
  .withRenderer(new HTMLRenderer());

await n2m.convert('your-page-id');
```

This renderer generates a complete HTML document with basic styling.

## Creating a JSX/React Renderer

Here's a renderer that outputs React components:

```javascript
import { BaseRendererPlugin } from 'notion-to-md';

class JSXRenderer extends BaseRendererPlugin {
  protected template = `import React from 'react';
{{{imports}}}

export function NotionContent({ pageId = '{{{pageId}}}' }) {
  return (
    <article className="notion-content">
      {{{content}}}
    </article>
  );
}`;

  protected blockTransformers = {
    heading_1: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.heading_1.rich_text);
        return `<h1>${text}</h1>`;
      }
    },

    paragraph: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.paragraph.rich_text);
        return text ? `<p>${text}</p>` : null;
      }
    },

    callout: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.callout.rich_text);
        const icon = block.callout.icon?.emoji || '💡';

        return `
<Callout icon="${icon}" type="${block.callout.color || 'default'}">
  ${text}
</Callout>`;
      },
      imports: ["import { Callout } from './components/Callout';"]
    },

    code: {
      transform: async ({ block, utils }) => {
        const text = await utils.processRichText(block.code.rich_text);
        const language = block.code.language || 'plaintext';

        return `
<CodeBlock language="${language}">
{\`${text.replace(/`/g, '\\`')}\`}
</CodeBlock>`;
      },
      imports: ["import { CodeBlock } from './components/CodeBlock';"]
    }
  };

  protected annotationTransformers = {
    bold: {
      transform: async ({ text }) => `<strong>${text}</strong>`
    },
    italic: {
      transform: async ({ text }) => `<em>${text}</em>`
    },
    code: {
      transform: async ({ text }) => `<code>${text}</code>`
    }
  };
}

// Usage
const n2m = new NotionConverter(notionClient)
  .withRenderer(new JSXRenderer());

await n2m.convert('your-page-id');
```

This renderer creates a React component with imports for custom components.

## Understanding the Key Components

### Template System

The template is a string with placeholders in the format `{{{variableName}}}`. These placeholders are replaced with content during rendering:

```javascript
protected template = `{{{header}}}
{{{content}}}
{{{footer}}}`;
```

### Variables

Variables provide the content for template placeholders:

```javascript
protected variables = {
  header: (context) => `<header><h1>${context.pageProperties?.title || 'Untitled'}</h1></header>`,
  footer: () => `<footer>Generated on ${new Date().toLocaleDateString()}</footer>`
};
```

Each variable is a function that receives a context object containing page properties, metadata, and more.

### Block Transformers

Block transformers define how each Notion block type is rendered:

```javascript
protected blockTransformers = {
  paragraph: {
    transform: async ({ block, utils }) => {
      const text = await utils.processRichText(block.paragraph.rich_text);
      return `<p>${text}</p>`;
    }
  },

  // Support multiple block types with one transformer
  ['heading_1', 'heading_2', 'heading_3']: {
    transform: async ({ block, utils }) => {
      const level = parseInt(block.type.slice(-1));
      const text = await utils.processRichText(block[block.type].rich_text);
      return `<h${level}>${text}</h${level}>`;
    }
  }
};
```

Each transformer receives:
- `block`: The Notion block object
- `utils`: Helper functions for processing text and children
- `metadata`: Optional context-specific metadata

### Annotation Transformers

Annotation transformers define how text styling is rendered:

```javascript
protected annotationTransformers = {
  bold: {
    transform: async ({ text }) => `<strong>${text}</strong>`
  },
  italic: {
    transform: async ({ text }) => `<em>${text}</em>`
  }
};
```

## Best Practices

1. **Test thoroughly** - Test your renderer with various block types and nested structures
2. **Handle empty content** - Gracefully handle empty blocks and missing content
3. **Use utilities** - The `utils` object provides helpful methods for text processing
4. **Maintain imports** - If using component imports, track them properly
5. **Sanitize output** - Escape special characters when necessary

{{< callout emoji="💡" >}}
**Popular Renderer Ideas**

Looking for renderer ideas? Here are some useful formats to consider:

- **LaTeX Document Renderer** - Create academic papers or books
- **Terminal Output Renderer** - Generate CLI-friendly documentation
- **WikiText Renderer** - For wiki platforms like MediaWiki
- **AsciiDoc Renderer** - For technical documentation
- **JSON/YAML Renderer** - For data-oriented applications

If you build any of these, please share them with the community!
{{< /callout >}}
