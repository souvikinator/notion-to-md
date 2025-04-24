---
title: "How to modify an existing renderer plugin?"
description: "Guide on how to modify an existing renderer plugin based on your needs"
weight: 1
---

The default MDX renderer or infact any renderer you are using might work great for basic needs, but sometimes you might want to customize how certain things are rendered. Let's explore how to modify an existing renderer step by step.

## "I don't like how this block is rendered!"

The most common customization need is changing how specific blocks are rendered. For example, maybe you want your code blocks to use a custom component:

{{< callout type="info" >}}
Know more about [Block Transformer](../../concepts/renderer-plugin/block-transformer/).
{{< /callout >}}

```typescript
const renderer = new MDXRenderer();

// Customize code blocks to use a custom component
renderer.createBlockTransformer('code', {
  transform: async ({ block, utils }) => {
    const code = block.code.rich_text[0].plain_text;
    const lang = block.code.language;

    return `<CodeBlock language="${lang}">${code}</CodeBlock>\n\n`;
  },
  // Don't forget to add required imports
  imports: [`import { CodeBlock } from '@/components/CodeBlock';`]
});
```

Or perhaps you want callouts to use your design system's alert component:

```typescript
renderer.createBlockTransformer('callout', {
  transform: async ({ block, utils }) => {
    const text = await utils.transformRichText(block.callout.rich_text);
    const emoji = block.callout.icon?.emoji;

    return `<Alert type="info" icon="${emoji}">${text}</Alert>\n\n`;
  },
  imports: [`import { Alert } from '@/components/Alert';`]
});
```

The transform function receives a rich context including:
- `block`: The Notion block data
- `utils`: Helper functions like `transformRichText`
- `metadata`: Additional context you can pass
- And more!

## "The text formatting doesn't match my needs!"

Want to change how bold text looks? Or maybe add custom styling to links? Annotation transformers are your friend:

{{< callout type="info" >}}
Know more about [Annotation Transformer](../../concepts/renderer-plugin/annotation-transformer/).
{{< /callout >}}


```typescript
// Make bold text use a custom class
renderer.createAnnotationTransformer('bold', {
  transform: async ({ text }) => `<span class="font-bold">${text}</span>`
});

// Add custom link handling
renderer.createAnnotationTransformer('link', {
  transform: async ({ text, link }) => {
    if (!link?.url) return text;
    const isExternal = link.url.startsWith('http');
    return isExternal
      ? `<a href="${link.url}" target="_blank" rel="noopener">${text}</a>`
      : `[${text}](${link.url})`;
  }
});
```

## "I need to add new sections to my documents!"

Sometimes you need more than just content - maybe you want to add footnotes, comments, or a table of contents.

First, let's modify the template to include our new sections:

```typescript
/**
one should be aware of the variables used in that template preserve those
in the one they might be defining to make sure existing functionality doen't break.

existing template for MDX renderer:
{{{frontmatter}}}
{{{imports}}}
{{{content}}}

notice how we are keeping the existing variables intact
*/

renderer.setTemplate(`{{{frontmatter}}}
{{{imports}}}
{{{toc}}}
{{{content}}}
{{{footnotes}}}`);
```

Then add variables for each new section:

```typescript
// Add a table of contents
renderer.addVariable('toc', async (_, context) => {
  // can access any variable defined from the context
  const headings = context.variableData.get('content')
    .filter(line => line.startsWith('#'))
    .map(heading => {
      const level = heading.match(/^#+/)[0].length;
      return `${' '.repeat(level * 2)}- ${heading.replace(/^#+\s+/, '')}`;
    });
  return `## Table of Contents\n\n${headings.join('\n')}\n\n`;
});

// Convert comments to footnotes
renderer.addVariable('footnotes', async (_, context) => {
  const comments = context.variableData.get('comments') || [];
  if (!comments.length) return '';

  return `\n---\n## Footnotes\n\n${comments.join('\n')}\n`;
});
```

{{< callout type="info" >}}
**Notice** that we are using 'comments' variable but we are not using it in the template. That's because we are using it to collect comments from the blocks in the [block transformer](../../concepts/renderer-plugin/block-transformer) and then adding them to the footnotes section after the collection is done.
{{< /callout >}}

Now you can collect content into these variables from your transformers:

```typescript
renderer.createBlockTransformer('paragraph', {
  transform: async ({ block, utils, context }) => {
    const text = await utils.transformRichText(block.paragraph.rich_text);

    // If block has comments, add them to footnotes
    if (block.paragraph.comments?.length) {
      const comments = context.variableData.get('comments') || [];
      comments.push(`[^${comments.length + 1}]: ${block.paragraph.comments[0].text}`);
      context.variableData.set('comments', comments);

      return `${text} [^${comments.length}]\n\n`;
    }

    return `${text}\n\n`;
  }
});
```

## "I need more complex customizations!"

For more extensive modifications, you might want to extend the renderer class:

```typescript
class CustomMDXRenderer extends MDXRenderer {
  constructor(config: MDXRendererConfig = {}) {
    super(config);

    // Custom template with new sections
    this.setTemplate(`{{{meta}}}
{{{imports}}}
{{{toc}}}
{{{content}}}
{{{footnotes}}}`);

    // Add meta variable for better SEO
    this.addVariable('meta', async (_, context) => {
      const { title, description, tags } = context.pageProperties;
      return `---
title: ${title}
description: ${description}
tags: ${tags}
---\n\n`;
    });

    // Custom code blocks with line numbers
    this.createBlockTransformer('code', {
      transform: async ({ block, utils }) => {
        const code = block.code.rich_text[0].plain_text;
        const lines = code.split('\n').map((line, i) =>
          `<div class="line-number">${i + 1}</div>${line}`
        );

        return `<pre class="with-line-numbers">
  <code class="language-${block.code.language}">
    ${lines.join('\n')}
  </code>
</pre>\n\n`;
      }
    });
  }
}
```

## Real-World Examples

{{% details title="Adding Copy Buttons to Code Blocks" closed="true" %}}

```typescript
renderer.createBlockTransformer('code', {
  transform: async ({ block }) => {
    const code = block.code.rich_text[0].plain_text;
    const lang = block.code.language;

    return `<div class="code-wrapper">
  <CodeBlock language="${lang}">${code}</CodeBlock>
  <CopyButton code={${JSON.stringify(code)}} />
</div>\n\n`;
  },
  imports: [
    `import { CodeBlock } from '@/components/CodeBlock';`,
    `import { CopyButton } from '@/components/CopyButton';`
  ]
});
```

{{% /details %}}

{{% details title="Interactive Callouts" closed="true" %}}

```typescript
renderer.createBlockTransformer('callout', {
  transform: async ({ block, utils }) => {
    const text = await utils.transformRichText(block.callout.rich_text);
    const type = block.callout.icon?.emoji === '💡' ? 'tip' : 'info';

    return `<Callout
  type="${type}"
  expandable={true}
  defaultExpanded={false}
>${text}</Callout>\n\n`;
  },
  imports: [`import { Callout } from '@/components/Callout';`]
});
```

{{% /details %}}


{{% details title="Custom Frontmatter" closed="true" %}}

```typescript
renderer.addVariable('frontmatter', async (_, context) => {
  const props = context.pageProperties;
  const readingTime = calculateReadingTime(context.variableData.get('content'));

  return `---
title: ${props.title}
description: ${props.description}
date: ${props.publishedAt}
readingTime: ${readingTime}
tags: ${props.tags.join(', ')}
---\n\n`;
});
```

{{% /details %}}
