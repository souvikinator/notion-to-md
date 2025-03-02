---
title: "Getting Started"
description: "Learn how to quickly convert Notion pages to Markdown with notion-to-md v4"
weight: 1
---

This guide will help you quickly set up notion-to-md v4 and convert your first Notion page to Markdown.

## Installation

First, install the package using npm or yarn:

```bash
npm install notion-to-md
```

## Prerequisites

Before you can convert Notion pages to Markdown, you need to have a Notion integration set up.

## Basic Usage

Here's a simple example demonstrating how to convert a Notion page to Markdown:

```javascript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import * as fs from 'fs/promises';

// Initialize the Notion client with your integration token
const notion = new Client({
  auth: 'your-notion-integration-token',
});

// Create a basic NotionConverter instance
const n2m = new NotionConverter(notion);

async function convertPage() {
  try {
    // Replace with your actual page ID
    const pageId = 'your-notion-page-id';

    // Convert the page
    const result = await n2m.convert(pageId);

    // Save the markdown content to a file
    await fs.writeFile('output.md', result.content, 'utf-8');

    console.log('✓ Successfully converted page to markdown!');
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convertPage();
```

## Next Steps

Once you have basic conversion working, you might want to explore more advanced features:

- [Media Handling](/docs/v4/concepts/media-handling) - Download and process images and files
- [Page Reference Handling](/docs/v4/concepts/page-reference-handler) - Handle links between Notion pages
- [Plugin system](/docs/v4/concepts/plugin-system) - Extend the functionality of notion-to-md
- [Exporter Plugin](/docs/v4/concepts/creating-exporters) - Save conversion output to different destinations
- [Renderer Plugin](/docs/v4/concepts/creating-renderers) - Create custom output formats
- [Fetcher](/docs/v4/concepts/fetcher-configuration) - Customize the conversion process


That's it! You've successfully set up notion-to-md v4 and converted your first page.
