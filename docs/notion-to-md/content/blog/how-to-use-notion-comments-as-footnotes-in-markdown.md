---
title: How to Convert Notion Comments to Markdown Footnotes with notion-to-md v4
date: 2025-03-11
authors:
  - name: souvikinator
    link: https://github.com/souvikinator
    image: https://avatars.githubusercontent.com/u/64456160?s=96&v=4
tags:
  - tutorial
  - markdown
  - v4
  - notion-to-md
  - transformers
  - renderer plugin
excludeSearch: true
---

In this guide, we'll explore how to modify the default renderer to transform Notion comments into proper Markdown footnotes.
<!-- more -->

## Why Convert Comments to Footnotes?

Notion comments frequently offer important explanations, references, or critical thoughts that improve your writing. You may make sure that this information is preserved when you publish or distribute your work by turning them into Markdown footnotes. For authors, developers, and bloggers that use Notion as a content management system, this method is perfect.

## Prerequisites

Before starting, make sure you have:

- notion-to-md v4 installed: `npm install notion-to-md@alpha`
- Notion API token with access to your content and can read comments
- You understand [block transformation](../../docs/v4/concepts/renderer-plugin/block-transformer) and [variable system](../../docs/v4/concepts/renderer-plugin/variables-and-templates).

Here is the test notion page:

![Test Notion Page](/images/notion-comments-footnotes-test-page.png)

## Step 1: Set Up Your Project

First, let's create a basic project structure:

```javascript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { MDXRenderer } from 'notion-to-md/plugins/renderer/mdx';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';

// Initialize Notion client
const notion = new Client({
  auth: 'your-notion-api-key',
});

// Using the default renderer that ships with package (we'll modify this)
const renderer = new MDXRenderer({ frontmatter: true });

// Set up the converter with our renderer
const n2m = new NotionConverter(notion)
  .withRenderer(renderer)
  .withExporter(new DefaultExporter({
    outputType: 'file',
    outputPath: './output.md'
  }));
```

## Step 2: Enable Comment Fetching

By default, notion-to-md doesn't fetch comments from the Notion API. We need to enable this first:

```javascript
const n2m = new NotionConverter(notionClient)
  .configureFetcher({
    fetchComments: true,  // This is important!
    fetchPageProperties: true
  });
```

## Step 3: Modify the Template to Include Footnotes

The default MD/MDX renderer plugin template doesn't include a dedicated section for footnotes. Let's update it to add a footnotes section at the end of the document:

```javascript
renderer.setTemplate(`{{{frontmatter}}}

{{{imports}}}

{{{content}}}

{{{footnotes}}}`); //footnotes placeholder

// Add a variable to collect footnotes
renderer.addVariable('footnotes', async (_, context) => {
  // through out the rendering process all the comments will be collected in the footnotes variable
  // at the end this resolver will be called to format the collected footnotes as a section and substitute them in the template
  const footnotes = context.variableData.get('footnotes') || [];
  if (!footnotes.length) return '';

  return `\n---\n## Footnotes\n\n${footnotes.join('\n')}\n`;
});
```

> [!TIP]
> know more about [context](../../docs/v4/concepts/renderer-plugin/context/)

Here, we're:
1. Adding a `{{{footnotes}}}` placeholder to the [template](../../docs/v4/concepts/renderer-plugin/variables-and-templates) where our footnotes will appear.
2. Creating a variable resolver that formats the collected footnotes as a section, the output of resolver is substituted in the template.

## Step 4: Modify Block Transformers to Handle Comments

Now, we need to intercept blocks with comments and transform them appropriately. We'll focus on paragraph blocks for this tutorial, as they're most commonly commented on:

```javascript
// Create a custom transformer for paragraphs
renderer.createBlockTransformer('paragraph', {
  transform: async ({ block, utils, variableData }) => {
    // Process rich text as usual
    const text = await utils.transformRichText(block.paragraph.rich_text);

    // Check if the block has comments
    if (block.comments && block.comments.length > 0) {
      // Get the current footnotes collection or initialize it
      const footnotes = variableData.get('footnotes') || [];
      const footnoteIndex = footnotes.length + 1;

      // Add comment text to footnotes variable
      const commentText = block.comments
        .map(comment => comment.rich_text.map(rt => rt.plain_text).join(''))
        .join(' ');

      footnotes.push(`[^${footnoteIndex}]: ${commentText}`); // collecting comments in the footnotes variable
      variableData.set('footnotes', footnotes);

      // Return paragraph with footnote reference
      return `${text} [^${footnoteIndex}]\n\n`;
    }

    // Return normal paragraph
    return `${text}\n\n`;
  }
});
```

This transformer does several important things:
1. Processes the paragraph text normally
2. Checks if the block has comments
3. If it does, creates a footnote reference in the paragraph
4. Adds the comment text to our footnotes collection

## Step 5: Putting It All Together

Here's the complete code that combines all the steps:

```javascript
import { Client } from "@notionhq/client";
import { NotionConverter } from "notion-to-md";
import { DefaultExporter } from "notion-to-md/plugins/exporter";
import { MDXRenderer } from "notion-to-md/plugins/renderer";

// Initialize Notion client
const notion = new Client({
  auth: "your-notion-api-key",
});

// Using the default renderer that ships with package (we'll modify this)
const renderer = new MDXRenderer({ frontmatter: true });

renderer.setTemplate(`{{{frontmatter}}}

{{{imports}}}

{{{content}}}

{{{footnotes}}}`); //footnotes placeholder

// Add a variable to collect footnotes
renderer.addVariable("footnotes", async (_, context) => {
  const footnotes = context.variableData.get("footnotes") || [];
  if (!footnotes.length) return "";

  return `\n---\n## Footnotes\n\n${footnotes.join("\n")}\n`;
});

// Create a custom transformer for paragraphs
renderer.createBlockTransformer("paragraph", {
  transform: async ({ block, utils, variableData }) => {
    const text = await utils.transformRichText(block.paragraph.rich_text);

    // Check if the block has comments
    if (block.comments && block.comments.length > 0) {
      // Get the current footnotes collection or initialize it
      const footnotes = variableData.get("footnotes") || [];
      const footnoteIndex = footnotes.length + 1;

      // Add comment text to footnotes variable
      const commentText = block.comments
        .map((comment) => comment.rich_text.map((rt) => rt.plain_text).join(""))
        .join(" ");

      footnotes.push(`[^${footnoteIndex}]: ${commentText}`);
      variableData.set("footnotes", footnotes);

      // Return paragraph with footnote reference
      return `${text} [^${footnoteIndex}]\n\n`;
    }

    // Return normal paragraph
    return `${text}\n\n`;
  },
});

// Set up the converter with our renderer
const n2m = new NotionConverter(notion)
  .configureFetcher({
    fetchComments: true,
    fetchPageProperties: true,
  })
  .withRenderer(renderer)
  .withExporter(
    new DefaultExporter({
      outputType: "file",
      outputPath: "./output.md",
    }),
  );

(async () => {
  try {
    await n2m.convert("your-page-id");
    console.log("✓ Successfully converted page with comments as footnotes!");
  } catch (error) {
    console.error("Conversion failed:", error);
  }
})();
```

## Example Output

With this setup, a Notion page with comments will convert to Markdown that looks like this:

```markdown
---
Created: "2025-01-04T02:17:00.000Z"
Tags: ["V4", "notion to md", "test"]
PublishURL: "/page-1"
Name: "Notion comment as Footnotes guide"
---

# My Notion Content

This is a paragraph with a comment attached. [^1]

Another paragraph with multiple comments. [^2]

Here is a comment on a phrase in the third paragraph. [^3]


---
## Footnotes

[^1]: This paragraph needs to be updated
[^2]: Comment 1  Follow up comment (2) https://github.com/join-escape/exporto-playground
[^3]: This is a very specific comment
```

![notion comments converted to footnotes in markdown rendered](/images/nc-output.png)

## Improvements and Advanced Customization

### Reusable Comment Processing Function

Optimize your code by reusing the comment-handling logic across block types:

```javascript
// Create a utility function for handling comments
function addCommentsAsFootnotes(text, block, variableData) {
  if (!block.comments || block.comments.length === 0) {
    return text;
  }

  const footnotes = variableData.get('footnotes') || [];
  const footnoteIndex = footnotes.length + 1;

  // Process comment text
  const commentText = block.comments
    .map(comment => comment.rich_text.map(rt => rt.plain_text).join(''))
    .join(' ');

  footnotes.push(`[^${footnoteIndex}]: ${commentText}`);
  variableData.set('footnotes', footnotes);

  // Return text with footnote reference
  return `${text} [^${footnoteIndex}]`;
}

// Now we can use this utility with any block transformer
renderer.createBlockTransformer('heading_1', {
  transform: async ({ block, utils, variableData }) => {
    const text = await utils.transformRichText(block.heading_1.rich_text);
    const processedText = addCommentsAsFootnotes(text, block, variableData);
    return `# ${processedText}\n\n`;
  }
});

renderer.createBlockTransformer('bulleted_list_item', {
  transform: async ({ block, utils, variableData }) => {
    const text = await utils.transformRichText(block.bulleted_list_item.rich_text);
    const processedText = addCommentsAsFootnotes(text, block, variableData);
    return `- ${processedText}\n`;
  }
});

// ... and so on for other block types
```


### Handling Nested Blocks with Comments

If you have comments on nested blocks (like in toggle lists), you'll need to pass the context through to child blocks:

```javascript
renderer.createBlockTransformer('toggle', {
  transform: async ({ block, utils, variableData, metadata }) => {
    const summary = await utils.transformRichText(block.toggle.rich_text);
    const processedSummary = addCommentsAsFootnotes(summary, block, variableData);

    // Process children with the same context to maintain footnote numbering
    const childContent = block.children?.length
      ? await Promise.all(
          block.children.map(child => utils.processBlock(child, metadata))
        )
      : [];

    return `<details>
  <summary>${processedSummary}</summary>
  ${childContent.join('\n')}
</details>\n\n`;
  }
});
```

## Conclusion

With notion-to-md v4's flexible plugin system, you can easily transform Notion comments into useful footnotes in your Markdown output. This approach preserves important context and additional information from your collaborative work in Notion when publishing or sharing content.

For more ways to customize your Notion-to-Markdown conversion, check out the [official documentation on how to modify renderer plugins](../../docs/v4/guides/how-to-modify-renderer-plugin/). You can also explore other [block transformers](../../docs/v4/concepts/renderer-plugin/block-transformer/) to customize how different Notion blocks are rendered.

> [!NOTE]
> ## Share Your Use Case and Work
>
> Have you created an interesting customization or workflow with notion-to-md?
> We'd love to hear about it! Consider sharing your experience by:
>
> 1. Creating a blog post in the [notion-to-md blog](/notion-to-md/blog/) section
> 2. Adding an entry to our [plugin catalog](/notion-to-md/catalogue/) if you've built a > reusable plugin
> 3. Joining our community discussions on GitHub
>
> Your real-world examples can help others unlock the full potential of using Notion as a content source!
