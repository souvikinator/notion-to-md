---
title: "Getting Started"
description: "Learn how to quickly convert Notion pages to Markdown with notion-to-md v4"
weight: 1
---

This guide will help you quickly set up notion-to-md v4 and convert your first Notion page to Markdown.

## Installation

First, install the package using npm or yarn:

```bash
npm install notion-to-md@alpha
```

## Prerequisites

Before you can convert Notion pages to Markdown, you need to:

1. Set up a Notion integration in your workspace
2. Get your integration token
3. Share the page you want to convert with your integration

## Basic Usage

Here's a simple example demonstrating how to convert a Notion page to Markdown:

```javascript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';

// Initialize the Notion client with your integration token
const notion = new Client({
  auth: 'your-notion-integration-token',
});

async function convertPage() {
  try {
    // Replace with your actual page ID
    const pageId = 'your-notion-page-id';

    // use the default exporter
    const exporter = new DefaultExporter({
      outputType: 'file',
      outputPath: `some/dir/${pageId}.md`
    });

    const n2m = new NotionConverter(notion)
      .withExporter(exporter);

    // Convert the page
    await n2m.convert(pageId);

    console.log('✓ Successfully converted page to markdown!');
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertPage();
```

The DefaultExporter supports three output types:

1. `file` - Saves the markdown to a file:
```javascript
new DefaultExporter({
  outputType: 'file',
  outputPath: 'some/dir/output.md'
})
```

2. `stdout` - Prints the markdown to console:
```javascript
new DefaultExporter({
  outputType: 'stdout'
})
```

3. `buffer` - Stores the markdown in a buffer object:
```javascript
const buffer = {};
new DefaultExporter({
  outputType: 'buffer',
  buffer: buffer
})

// pageId="..."
// access output using buffer[pageId]
```

> [!TIP]
> Learn how to [create your own exporter plugins](/notion-to-md/docs/v4/concepts/exporter-plugin/) to save/publish conversion output to different destinations.

## Next Steps

Once you have basic conversion working, you might want to explore more advanced features:

- [Media Handling](../concepts/media-handler) - Download and process images and files
- [Page Reference Handling](../concepts/page-reference-handler) - Handle links between Notion pages
- [Plugin system](../concepts/plugin-system) - Extend the functionality of notion-to-md
- [Exporter Plugin](../concepts/exporter-plugin/) - Save conversion output to different destinations
- [Renderer Plugin](../concepts/renderer-plugin/) - Create custom output formats
<!-- - [Fetcher](/notion-to-md/docs/v4/concepts/fetcher) - Customize the fetching process -->

That's it! You've successfully set up notion-to-md v4 and converted your first page.
