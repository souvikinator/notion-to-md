---
title: 'Getting Started'
description: 'Learn how to quickly convert Notion pages to Markdown with notion-to-md v4'
weight: 1
---

This guide will walk you through setting up `notion-to-md` v4 and converting your first Notion page, progressively introducing core features.

## Installation

First, install the package using npm or yarn:

```bash
npm install notion-to-md@alpha @notionhq/client
# or
yarn add notion-to-md@alpha @notionhq/client
```

We also install the official `@notionhq/client` which is needed to interact with the Notion API.

## Prerequisites

Before you begin, ensure you have:

1. **A Notion Integration:** Set up an integration in your Notion workspace ([Notion Documentation](https://developers.notion.com/docs/create-a-notion-integration)).
2. **Your Integration Token:** Copy the "Internal Integration Token". Keep it secure!
3. **Shared Page:** Share the specific Notion page(s) you want to convert with your newly created integration.

## 1. Basic Conversion

The simplest way to use `notion-to-md` is to convert a page and get the Markdown content directly.

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';

// Initialize the Notion client with your integration token
const notion = new Client({
  auth: process.env.NOTION_TOKEN, // Use environment variables for secrets!
});

async function convertPage() {
  try {
    const pageId = 'your-notion-page-id'; // Replace with your actual page ID

    // Create a NotionConverter instance
    const n2m = new NotionConverter(notion);

    // Convert the page
    const result = await n2m.convert(pageId);

    // Access the Markdown content
    console.log('--- Markdown Output ---');
    console.log(result.content);

    // The result object also contains block data, page properties, etc.
    // console.log('--- Conversion Result Object ---');
    // console.log(result);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertPage();
```

This code fetches the Notion page, converts its content to Markdown, and prints it to the console. The `convert()` method returns a `ConversionResult` object containing:

- `content`: The Markdown string
- `blocks`: Raw Notion blocks
- `properties`: Page properties
- `metadata`: Additional page metadata

## 2. Saving Markdown to a File

While getting the Markdown directly is useful, you often want to save it. `notion-to-md` uses **Exporter Plugins** for this. The built-in `DefaultExporter` can save to files, print to stdout, or store in a buffer.

Here's how to save the output to a file:

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';
import * as path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function convertAndSavePage() {
  try {
    const pageId = 'your-notion-page-id';
    const outputDir = './output'; // Define where to save the file

    // Configure the DefaultExporter to save to a file
    const exporter = new DefaultExporter({
      outputType: 'file',
      outputPath: path.join(outputDir, `${pageId}.md`),
    });

    // Create the converter and attach the exporter
    const n2m = new NotionConverter(notion).withExporter(exporter);

    // Convert the page (the exporter handles saving)
    await n2m.convert(pageId);

    console.log(
      `✓ Successfully converted page and saved to ${outputDir}/${pageId}.md`,
    );
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertAndSavePage();
```

{{< callout type="info" >}}
The `DefaultExporter` supports three output types:

- `outputType: 'file'` - Saves to a file (as shown above)
- `outputType: 'stdout'` - Prints to console
- `outputType: 'buffer'` - Stores in memory

You can also create your own custom exporter to export content to mutiple places. Refer the [Exporter Plugin documentation](../concepts/exporter-plugin/).
{{< /callout >}}

## 3. Handling Media (Images, Files)

Notion uses temporary URLs for media files, which expire. To make your media permanent, you need a **Media Handling Strategy**.

The simplest strategy for local use is downloading:

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';
import * as path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function convertWithMedia() {
  try {
    const pageId = 'your-notion-page-id';
    const outputDir = './output'; // For markdown file
    const mediaDir = path.join(outputDir, 'media'); // For downloaded media

    const exporter = new DefaultExporter({
      outputType: 'file',
      outputPath: path.join(outputDir, `${pageId}.md`),
    });

    const n2m = new NotionConverter(notion)
      .withExporter(exporter)
      // Configure media downloading
      .downloadMediaTo({
        outputDir: mediaDir,
        // Update the links in markdown to point to the local media path
        transformPath: (localPath) => `/media/${path.basename(localPath)}`,
      });

    await n2m.convert(pageId);

    console.log(`✓ Converted page to ${outputDir}/${pageId}.md`);
    console.log(`✓ Downloaded media to ${mediaDir}`);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertWithMedia();
```

This configuration:

1. Downloads all media files from the Notion page into the `./output/media` directory
2. Updates the Markdown links to point to these local files (e.g., `![alt text](/media/image.png)`)
3. Creates a self-contained output that works offline

{{< callout type="tip" >}}
The `transformPath` function is crucial - it converts local file paths into web-accessible URLs. Make sure the output paths match how your web server or static site generator will serve the files.
{{< /callout >}}

## Next Steps

Now that you have the basics down, you can explore more advanced features:

- [Media Handling Strategies](../../../blog/mastering-media-handling-in-notion-to-md-v4/) - Learn about all available media strategies
- [Exporter Plugin](../concepts/exporter-plugin/) - Customize how your content is saved
- [Renderer Plugin](../concepts/renderer-plugin/) - Control how blocks are converted to Markdown
- [Configuration Options](../concepts/configuration/) - Fine-tune the converter's behavior

For practical examples and common use cases, check out our [Guides section](../guides/) and [blog](../../../blog).
