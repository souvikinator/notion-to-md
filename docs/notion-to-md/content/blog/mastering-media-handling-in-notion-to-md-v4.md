---
title: Mastering Media Handling in notion-to-md v4 - Download, Upload, and Direct Strategies
date: 2025-04-23 # Adjust date as needed
authors:
  - name: souvikinator
    link: https://github.com/souvikinator
    image: https://avatars.githubusercontent.com/u/64456160?s=96&v=4
tags:
  - tutorial
  - guide
  - v4
  - notion-to-md
  - media handler
  - download
  - upload
  - buffer
  - direct
excludeSearch: false
comments: true
---

Notion is a fantastic tool for content creation, but when you want to programmatically convert your Notion pages into Markdown, HTML, or other formats using [`notion-to-md`](https://github.com/souvikinator/notion-to-md), you hit a common challenge: **handling media assets**. Images, files, PDFs, and videos stored in Notion use temporary URLs that expire, making them unsuitable for permanent content like websites or documentation.

Luckily, `notion-to-md` v4 provides a robust **Media Handling system** with multiple strategies to solve this exact problem. This guide walks you through each strategy, explaining what it does, when to use it, and how to implement it with practical examples.

## Prerequisites

This guide assumes you have a basic Node.js project set up with `notion-to-md` installed. Here's how to get started:

```typescript
// First, install the required packages
// npm install @notionhq/client notion-to-md
// or: yarn add @notionhq/client notion-to-md

// Basic setup for NotionConverter
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import * as path from 'path';
import * as fs from 'fs';

// Initialize the Notion client with your integration token
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Create a basic NotionConverter instance
const baseConverter = new NotionConverter(notion);

// The page ID you want to convert
const pageId = 'your-notion-page-id'; // Replace with your actual page ID
```

## Understanding Media Handling Strategies

`notion-to-md` offers three primary strategies to manage media assets:

1. **Direct Strategy:** Uses the original Notion URLs (default behavior). Optionally buffers content for in-memory processing.
2. **Download Strategy:** Downloads media files to your local filesystem.
3. **Upload Strategy:** Uploads media files to an external service (like S3, Cloudinary, etc.).

Each strategy is designed for different use cases. Let's explore them in detail.

---

## Strategy 1: Direct Strategy (The Default)

The Direct Strategy is the default approach in `notion-to-md` if you don't configure any other media handler.

### What it does

It preserves the original URLs provided by Notion for all media files in your output markdown.

### When to use

- For quick development and testing where temporary URLs are acceptable
- When you need to preprocess media files before they appear in your output
- In applications where another system will handle the media files separately

### Basic Usage (No Configuration Needed)

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';

// Create a Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Create a converter with default (Direct) strategy
const converter = new NotionConverter(notion);

// Convert a page - media URLs will remain unchanged
converter.convert(pageId).then(({ content }) => {
  console.log(content);
  // Markdown output example:
  // ![Image](https://prod-files-secure.s3.us-west-2.amazonaws.com/...)
});
```

### Advanced: In-Memory Buffering

A powerful feature of the Direct Strategy is its ability to buffer media content directly in memory.

#### What it does

It fetches media files from Notion and attaches them as Node.js `Buffer` objects to the block data structure during conversion. This lets you:

- Process media directly (resize images, extract text from PDFs, etc.)
- Embed media directly in output (e.g., as Base64 encoded data)
- Implement custom handling without saving files to disk

#### Configuration

To enable buffering, use the `useDirectStrategy` method with a configuration object:

```typescript {linenos=table}
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';

// Create basic clients
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Configure converter with Direct Strategy + buffering
const converter = new NotionConverter(notion).useDirectStrategy({
  // Simple configuration - buffer all media types
  buffer: true,

  // OR use detailed configuration:
  /*
    buffer: {
      // Which references to buffer: blocks and/or properties
      enableFor: ['block', 'database_property'],
      
      // Which block types to buffer (when enableFor includes 'block')
      includeBlockContentTypes: ['image', 'pdf', 'video'],
      
      // Maximum buffer size (5MB limit in this example)
      maxBufferSize: 5 * 1024 * 1024,
    }
    */
});
```

> [!NOTE]
> Refer to [Direct stategy API Reference](../../docs/v4/concepts/configuration/#direct-strategy-default) to know more about the buffer configuration

and here is how you access the buffer:

```typescript {linenos=table,hl_lines=[3,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,30]}
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { MDXRenderer } from "notion-to-md/plugins/renderer";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const renderer = new MDXRenderer();

renderer.createBlockTransformer('image', {
  transform: async ({ block, utils }) => {
    // Access the buffer directly from the block
    if (block.buffer) {
      // We have the image data as a Buffer!
      const base64Image = block.buffer.toString('base64');
      return `<img src="data:image/png;base64,${base64Image}" alt="Embedded image" />`;
    } else {
      // Fallback to URL if buffer is unavailable (in case of errors and stuff)
      const imageUrl =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;
      return `![Image](${imageUrl})`;
    }
  },
});

const converter = new NotionConverter(notion).useDirectStrategy({
  buffer: true,
  ...
}).withRenderer(renderer);

// Convert a page with buffered media
converter.convert(pageId);

```

{{< callout type="tip" >}}
With buffering, each media block (like image, PDF, video) can have a `buffer` property containing the raw file data. This enables powerful custom processing directly in your transformers.
{{< /callout >}}

> [!NOTE]
> Related Reads: [How to notion documents using notion-to-md's media handlers](../how-to-handle-documents-in-notion-using-notion-to-md-v4/)

---

## Strategy 2: Download Strategy

The Download Strategy saves media files from Notion to your local filesystem.

### What it does

- Fetches media files from Notion and saves them to a specified directory
- Updates URLs in the output to point to the locally saved files
- Optionally tracks which files have been downloaded to avoid duplicates

### When to use

- For static websites where media is served alongside content. Great for all types of static site generators (example: Hugo, jekyll, etc)
- For offline documentation or content that needs to work without internet
- When you need permanent local copies of Notion media files

### Configuration

Use the `downloadMediaTo` method with appropriate settings:

```typescript {linenos=table,hl_lines=[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]}
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import * as path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const converter = new NotionConverter(notion).downloadMediaTo({
  // Required: Where to save the files
  outputDir: path.resolve('./public/assets/media'),

  // Optional: Convert filesystem paths to URLs for markdown
  transformPath: (localPath) => {
    // your logic to transform local path to web accessible path
  },

  // Optional: Control for which Notion entity the media is downloaded
  enableFor: ['block', 'database_property'],

  // Optional: Skip URLs that are already from external sources
  preserveExternalUrls: true,
});

converter.convert(pageId);
```

{{< callout type="tip" >}}
The optional `transformPath` function converts the local path where a media file is saved into the URL used in your final Markdown. This ensures your media links work correctly in the final output (e.g., on a website).

**Example:**

- **Local Path:** `/path/to/project/public/assets/media/image.png`
- **`transformPath` Output:** `/assets/media/image.png` (This becomes the URL like `![alt](/assets/media/image.png)` in your Markdown)

Make sure this output URL matches how your web server or static site generator serves the files. If you omit `transformPath`, the library defaults to using the local file path as the reference, which might not be web-accessible or work as intended on a website.
{{< /callout >}}

> [!NOTE]
> Refer to [Download stategy API Reference](../../docs/v4/concepts/configuration/#download-strategy) to know more about the individual configuration options

### Example: Complete Workflow for Static Site

Here's a more complete example showing a typical workflow for a static site:

```typescript {linenos=table,hl_lines=[3,13,14,15,16,17,21,22,23,24,25,26]}
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';
import * as path from 'path';

async function exportNotionPageToStaticSite() {
  // Setup
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const pageId = 'your-page-id';
  const outputDir = path.resolve('./content');
  const mediaDir = path.resolve('./public/images/notion');

  // Configure exporter to save markdown file
  const exporter = new DefaultExporter({
    outputType: 'file',
    outputPath: path.join(outputDir, `${pageId}.md`),
  });

  // Configure converter with Download Strategy and Exporter
  const converter = new NotionConverter(notion)
    .withExporter(exporter)
    .downloadMediaTo({
      outputDir: mediaDir,
      transformPath: (localPath) =>
        `/images/notion/${path.basename(localPath)}`,
    });

  // Convert the page
  await converter.convert(pageId);

  console.log(`✓ Exported page to ${outputDir}`);
  console.log(`✓ Downloaded media to ${mediaDir}`);
}

exportNotionPageToStaticSite().catch(console.error);
```

{{< callout type="tip" >}}
The `DefaultExporter` handles file creation and directory management for you. You don't need to manually create directories or write files - just specify the output path and directory.
{{< /callout >}}

> [!NOTE]
> For more information about exporters and their configuration options, check out the [Exporter Plugin documentation](../../docs/v4/concepts/exporter-plugin/).

---

## Strategy 3: Upload Strategy

The Upload Strategy sends media files from Notion to an external storage service.

### What it does

- Fetches media files from Notion
- Uses your custom `uploadHandler` function to upload them to a service (AWS S3, Cloudinary, etc.)
- Updates URLs in the output markdown to point to the newly uploaded files
- Optionally tracks which files have been uploaded to avoid duplicates
- Optionally cleans up files that are no longer referenced

### When to use

- For web applications where media needs to be on a CDN
- When integrating with cloud storage services
- For scalable solutions that need reliable, permanent URLs

### Configuration

Use the `uploadMediaUsing` method with your custom upload handler:

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
// You would typically import your cloud storage SDK here
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';

// Create basic clients
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Configure converter with Upload Strategy
const converter = new NotionConverter(notion).uploadMediaUsing({
  // Required: Your custom upload handler function
  uploadHandler: async (originalUrl, contextId, blockType) => {
    console.log(
      `Uploading media from ${originalUrl} (Block type: ${blockType})`,
    );

    // This is where you would implement your actual upload logic
    // Example (pseudo-code):
    /*
      // Download the file from Notion first
      const response = await fetch(originalUrl);
      const fileBuffer = await response.arrayBuffer();
      
      // Upload to your chosen service (S3, Cloudinary, etc.)
      const fileName = `notion-${contextId}.png`;
      const uploadedUrl = await uploadToMyService(fileBuffer, fileName);
      */

    // For demo purposes, just return a fake URL
    return `https://my-cdn.example.com/media/${contextId}.png`;
  },

  // Optional: Transform the URL after upload
  transformPath: (uploadedUrl) => {
    // Add cache-busting or other modifications
    return `${uploadedUrl}?v=${Date.now()}`;
  },

  // Optional: Clean up files that are no longer referenced
  cleanupHandler: async (manifestEntry) => {
    console.log(`Cleaning up: ${manifestEntry.mediaInfo.uploadedUrl}`);
    // Your deletion logic here
  },

  // Optional: Settings to control behavior
  enableFor: ['block', 'database_property'],
  preserveExternalUrls: true,
  failForward: true,
});

// Convert a page - media will be uploaded and links updated
converter.convert(pageId).then(({ content }) => {
  console.log(content);
  // Markdown output example:
  // ![Image](https://my-cdn.example.com/media/block123.png?v=1650000000000)
});
```

### Real-World Example: S3 Upload

Here's a more concrete example using AWS S3:

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

async function convertWithS3Upload() {
  // Basic setup
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const pageId = 'your-page-id';

  // S3 configuration
  const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const bucketName = 'my-notion-media-bucket';

  // Configure converter with Upload Strategy
  const converter = new NotionConverter(notion).uploadMediaUsing({
    uploadHandler: async (originalUrl, contextId, blockType) => {
      try {
        // 1. Download the file from Notion
        const response = await fetch(originalUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch from Notion: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();

        // 2. Determine file extension (simplified)
        const contentType =
          response.headers.get('content-type') || 'application/octet-stream';
        const extension = contentType.split('/')[1] || 'bin';

        // 3. Create a unique filename
        const filename = `notion-media/${contextId}.${extension}`;

        // 4. Upload to S3
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: Buffer.from(buffer),
          ContentType: contentType,
          // Make the object publicly readable
          ACL: 'public-read',
        });

        await s3Client.send(command);

        // 5. Return the public URL
        return `https://${bucketName}.s3.amazonaws.com/${filename}`;
      } catch (error) {
        console.error('Upload failed:', error);
        throw error;
      }
    },
    // Clean up handler to delete files when they're removed from Notion
    cleanupHandler: async (manifestEntry) => {
      // Extract the key from the URL
      const url = new URL(manifestEntry.mediaInfo.uploadedUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      // Delete the file from S3
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
        );
        console.log(`Deleted ${key} from S3`);
      } catch (error) {
        console.error(`Failed to delete ${key}:`, error);
      }
    },
  });

  // Convert the page
  const { content } = await converter.convert(pageId);
  console.log('Conversion complete with S3 upload');
  return content; // or use exporter
}

convertWithS3Upload().then(console.log).catch(console.error);
```

{{< callout type="warning" >}}
**Security Note:** The S3 example assumes your bucket is configured to allow public access to uploaded files. In production, you might want a more sophisticated setup with proper access controls.
{{< /callout >}}

---

## Choosing the Right Strategy

| Strategy     | Use Case                                           | Pros                                  | Cons                                                   |
| :----------- | :------------------------------------------------- | :------------------------------------ | :----------------------------------------------------- |
| **Direct**   | Development, testing, in-memory processing         | Default, simple, enables buffering    | URLs expire, not for permanent content                 |
| **Download** | Static sites, local hosting, offline documentation | Easy setup, permanent local files     | Requires disk space, path management needed            |
| **Upload**   | Web apps, CDNs, cloud storage integration          | Scalable, reliable URLs, CDN benefits | Requires custom upload code, potentially complex setup |

## Strategy Selection Guide

1. **Choose Direct Strategy with buffering if:**

   - You need to manipulate media files in memory
   - You want to embed media directly (e.g., as Base64)
   - You're doing development/testing

2. **Choose Download Strategy if:**

   - You're building a static site with local media
   - You need offline content access
   - You want a simple setup with local files

3. **Choose Upload Strategy if:**
   - You're developing a web app with cloud storage
   - You need CDN performance benefits
   - You want permanent, scalable media hosting

## Conclusion

`notion-to-md` v4's media handling strategies provide flexible, powerful solutions to the common problem of dealing with Notion's temporary media URLs. By choosing the right strategy for your use case, you can ensure your converted content includes permanent, correctly linked media assets.

- **Direct Strategy** with buffering gives you access to media data in memory
- **Download Strategy** creates local files for static sites and offline use
- **Upload Strategy** integrates with cloud storage for scalable web applications

Remember to configure your chosen strategy properly, especially focusing on the path transformation functions that ensure your media references work correctly in the final output.

Happy converting!
