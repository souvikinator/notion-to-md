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

1.  **A Notion Integration:** Set up an integration in your Notion workspace ([Notion Documentation](https://developers.notion.com/docs/create-a-notion-integration)).
2.  **Your Integration Token:** Copy the "Internal Integration Token". Keep it secure!
3.  **Shared Page:** Share the specific Notion page(s) you want to convert with your newly created integration.

## 1. Basic Conversion

The simplest way to use `notion-to-md` is to convert a page and get the Markdown content directly.

```javascript
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

This code fetches the Notion page, converts its content to Markdown, and prints it to the console. The `convert()` method returns a `ConversionResult` object containing the `content` string, along with the raw `blocks`, page `properties`, and other metadata.

## 2. Saving Markdown to a File

While getting the Markdown directly is useful, you often want to save it. `notion-to-md` uses **Exporter Plugins** for this. The built-in `DefaultExporter` can save to files, print to stdout, or store in a buffer.

Here's how to save the output to a file:

```javascript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter'; // Import the exporter
import * as path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function convertAndSavePage() {
  try {
    const pageId = 'your-notion-page-id';
    const outputDir = './output'; // Define where to save the file
    const outputPath = path.join(outputDir, `${pageId}.md`);

    // Configure the DefaultExporter to save to a file
    const exporter = new DefaultExporter({
      outputType: 'file',
      outputPath: outputPath,
      outputDir: outputDir, // Ensure the directory exists
    });

    // Create the converter and attach the exporter
    const n2m = new NotionConverter(notion).withExporter(exporter);

    // Convert the page (the exporter handles saving)
    await n2m.convert(pageId);

    console.log(`✓ Successfully converted page and saved to ${outputPath}`);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertAndSavePage();
```

{{< callout type="info" >}}
The `DefaultExporter` also supports `outputType: 'stdout'` (prints to console) and `outputType: 'buffer'` (stores in an object). You can also [create custom exporters](../concepts/exporter-plugin/) to send content anywhere (e.g., CMS, database).
{{< /callout >}}

## 3. Handling Media (Images, Files)

Notion uses temporary URLs for media files, which expire. To make your media permanent, you need a **Media Handling Strategy**.

- **Problem:** Notion's image/file URLs in the basic Markdown output will eventually break.
- **Solution:** Use a media strategy to download or upload media files and update the links.

The simplest strategy for local use is downloading:

```javascript
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
    const outputPath = path.join(outputDir, `${pageId}.md`);

    const exporter = new DefaultExporter({
      outputType: 'file',
      outputPath: outputPath,
      outputDir: outputDir,
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

    console.log(`✓ Converted page to ${outputPath}`);
    console.log(`✓ Downloaded media to ${mediaDir}`);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertWithMedia();
```

This configuration downloads all media files from the Notion page into the `./output/media` directory and updates the Markdown links (e.g., `![alt text](/media/image.png)`) to point to these local files.

{{< callout type="info" >}}
`
