---
title: "Exporter Plugins"
description: "Learn how to create custom exporters for notion-to-md v4"
weight: 5
---

Exporter plugins control where your converted content goes after processing. notion-to-md comes with a built-in `DefaultExporter` and allows you to create custom exporters to save files, integrate with CMS platforms, or publish content across various channels.

## Default Exporter

notion-to-md provides a DefaultExporter that handles common output scenarios:

```typescript
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';
import { Client } from '@notionhq/client';

// Create Notion client
const notion = new Client({
  auth: 'your-notion-api-key'
});

// Create exporters with different configurations
// Save to file
const fileExporter = new DefaultExporter({
  outputType: 'file',
  outputPath: './content/output.md'
});

// Print to console
const stdoutExporter = new DefaultExporter({
  outputType: 'stdout'
});

// Store in memory buffer
const buffer = {};
const bufferExporter = new DefaultExporter({
  outputType: 'buffer',
  buffer: buffer
});

// Use a single exporter
const singleExporterConverter = new NotionConverter(notion)
  .withExporter(fileExporter);

// Or use multiple exporters at once
const multiExporterConverter = new NotionConverter(notion)
  .withExporter([fileExporter, stdoutExporter, bufferExporter]);

// Convert a page
await singleExporterConverter.convert('your-notion-page-id');

// Later, access the buffered content if using the buffer exporter
const pageContent = buffer['your-notion-page-id'];
```

You can find the DefaultExporter implementation in the [GitHub repository](https://github.com/souvikinator/notion-to-md/blob/v4.0.0-alpha/src/plugins/exporter/index.ts).

{{< callout emoji="🌐" >}}
**Share Your Exporters With The Community!**

Have you created a useful exporter for a popular CMS, hosting platform, or database? Consider sharing it with the community!

1. Create a GitHub repository for your exporter
2. Submit a PR
3. We'll review and link to your quality exporter plugin in our catalogue

Your contributions help the community build better content pipelines. Sharing your exporter can save others hours of development time.
{{< /callout >}}

## The Exporter Interface

Creating an exporter is straightforward. All you need to do is implement the `NotionExporter` interface:

```typescript
interface NotionExporter {
  export(data: ChainData): Promise<void>;
}

interface ChainData {
  pageId: string;                  // The Notion page ID
  blockTree: ExtendedFetcherOutput; // Raw block data from Notion
  content: string;                 // The converted content
  metadata?: Record<string, any>;  // Additional metadata
}
```

The `export` method receives all the data from the conversion process, giving you complete flexibility in how you handle it.

{{< callout type="info" >}}
Detailed types breakdown can be found in the [Exporter configuration guide](/docs/v4/concepts/configuration/#exporter-configuration).
{{< /callout >}}

## Basic Exporter

Let's start with the simplest possible exporter - one that just prints the converted content to the console:

```javascript
import { NotionExporter, ChainData } from 'notion-to-md/types';

class ConsoleExporter implements NotionExporter {
  constructor(private verbose = false) {}

  async export(data: ChainData): Promise<void> {
    console.log('-------- Converted Content --------');
    console.log(data.content); // contains the final rendered output
    console.log('---------------------------------');

    if (this.verbose) {
      console.log('Page ID:', data.pageId);
      console.log('Content Length:', data.content.length);
      console.log('Block Count:', data.blockTree.blocks.length);
    }
  }
}

// Usage
const n2m = new NotionConverter(notionClient)
  .withExporter(new ConsoleExporter(true));

await n2m.convert('your-page-id');
```

## File System Exporter

A more practical exporter saves content to your file system. Useful for Static site generators (Hugo, Jekyll, etc.):

```javascript
import { NotionExporter, ChainData } from 'notion-to-md/types';
import * as fs from 'fs/promises';
import * as path from 'path';

class FileSystemExporter implements NotionExporter {
  // You can define custom configurations for your plugin, allowing users to tailor it to their needs.
  constructor(private outputDir: string) {}

  async export(data: ChainData): Promise<void> {
    // Create output directory if it doesn't exist
    await fs.mkdir(this.outputDir, { recursive: true });

    // Generate filename from page properties or ID
    const title = data.blockTree.properties?.title?.title?.[0]?.plain_text || 'untitled';
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;

    // Full path for the file
    const filepath = path.join(this.outputDir, filename);

    // Write content to file
    await fs.writeFile(filepath, data.content, 'utf-8');

    console.log(`✓ Exported page to ${filepath}`);
  }
}

// Usage
const n2m = new NotionConverter(notionClient)
  .withExporter(new FileSystemExporter('./content/blog'));

await n2m.convert('your-page-id');
```

## CMS Integration Exporter

Here's how you might create an exporter for a headless CMS:

```javascript
import { NotionExporter, ChainData } from 'notion-to-md/types';

class CMSExporter implements NotionExporter {
  constructor(
    private apiKey: string,
    private apiEndpoint: string
  ) {}

  async export(data: ChainData): Promise<void> {
    // Extract metadata from page properties
    const properties = data.blockTree.properties;
    const title = properties?.title?.title?.[0]?.plain_text || 'Untitled';
    const tags = properties?.tags?.multi_select?.map(tag => tag.name) || [];

    // Prepare data for CMS
    const postData = {
      title,
      content: data.content,
      tags,
      notionPageId: data.pageId,
      lastUpdated: new Date().toISOString()
    };

    try {
      // Send to CMS API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`CMS API responded with ${response.status}`);
      }

      const result = await response.json();
      console.log(`✓ Published to CMS with ID: ${result.id}`);
    } catch (error) {
      console.error('Failed to publish to CMS:', error);
      throw error;
    }
  }
}

// Usage
const n2m = new NotionConverter(notionClient)
  .withExporter(new CMSExporter(
    'your-cms-api-key',
    'https://api.your-cms.com/posts'
  ));

await n2m.convert('your-page-id');
```

This exporter is ideal for:
- Publishing to headless CMS platforms (Contentful, Strapi, etc.)
- Automated content publishing workflows
- Syncing Notion content with your website

## Using Multiple Exporters

One of the most powerful features of notion-to-md v4 is the ability to use multiple exporters simultaneously:

```javascript
import { NotionExporter, ChainData } from 'notion-to-md/types';

// Create your exporters
const fileExporter = new FileSystemExporter('./content/blog');
const cmsExporter = new CMSExporter('api-key', 'https://api.cms.com/posts');
const newsletterExporter = new NewsletterExporter('api-key', newsletterPublishingClient);

// Use them all together
const n2m = new NotionConverter(notionClient)
  .withExporter([
    fileExporter,
    cmsExporter,
    backupExporter,
    analyticsExporter
  ]);

await n2m.convert('your-page-id');
```

## Best Practices

1. **Keep exporters focused** - Each exporter should have a single responsibility
2. **Handle errors gracefully** - Implement proper error handling to prevent data loss
3. **Use asynchronous operations** - Ensure all file system and network operations are properly awaited
4. **Provide feedback** - Log successful exports and errors for monitoring
5. **Consider rate limits** - When exporting to APIs, respect their rate limits
