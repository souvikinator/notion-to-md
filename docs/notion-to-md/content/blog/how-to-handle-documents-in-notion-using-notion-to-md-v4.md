---
title: How to Handle Documents in Notion Using notion-to-md v4
date: 2025-03-12
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
  - pdf
  - media handler
  - buffer
excludeSearch: true
comments: true
---

When converting Notion pages to Markdown, dealing with embedded documents such as PDFs might be tricky. Unlike photos or plain text, PDFs include rich content that necessitates particular handling. This guide explains how notion-to-md v4 helps handling these documents at different levels.

Embedded PDFs or any media in Notion present several unique challenges:

1. **Media Management**: Media are stored on temporary Notion URLs that expire
2. **Content Access**: You may want to extract or process the PDF content itself
3. **Embedded Experience**: In some outputs (like websites), you might want to embed the PDF viewer

## Media Handling Strategies

notion-to-md v4 offers three approaches:

1. Direct Strategy (Default)
   - Simple: Uses original Notion URLs
   - Advanced: Buffers media in memory for processing
2. Download Strategy
   - Saves files to your local filesystem
3. Upload Strategy
   - Uploads files to external storage (S3, Cloudinary, etc.)

To know more about each strategy, refer to the [Media Handling Strategies](../../docs/v4/concepts/configuration/#media-handling-configuration) guide.

In this guide, we'll explore both the Direct Strategy (with buffering) and Download Strategy to process PDFs. Each approach has its advantages:

- **Direct Strategy with Buffering**: Perfect for processing PDFs in memory without saving them to disk. Proves to be useful in serverless environment.
- **Download Strategy**: Ideal when you need permanent local copies of the files.

## Processing PDF Content

Let's look at both approaches for extracting and processing PDF content.

Here is what our target page looks like:

![notion page with pdf embedded](/images/notion-page-with-pdf-embedded.png)

### Approach 1: Using Direct Strategy with Buffering

This approach processes PDFs directly in memory without saving them to disk:

{{% details title="Code using Direct Strategy with buffering" closed="true" %}}

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';
import { MDXRenderer } from 'notion-to-md/plugins/renderer';
import pdf from 'pdf-parse';

// Initialize Notion client
const notion = new Client({
  auth: 'your-notion-api-key',
});

const renderer = new MDXRenderer();

// Customize how PDF blocks are processed
renderer.createBlockTransformer('pdf', {
  transform: async ({ block, utils }) => {
    // Access the buffer directly from the block
    if (block.buffer) {
      try {
        // Parse PDF directly from buffer
        const data = await pdf(block.buffer);

        // Extract first 1000 characters for preview
        const preview = data.text.slice(0, 1000).trim();

        // Get caption if available
        const caption =
          block.pdf.caption.length > 0
            ? block.pdf.caption[0].plain_text
            : 'Document Preview';

        // Format as collapsible preview with original URL
        return `
<details>
<summary>${caption}</summary>

\`\`\`text
${preview}...
\`\`\`

[View Full Document](${
          block.pdf.type === 'external'
            ? block.pdf.external.url
            : block.pdf.file.url
        })
</details>`;
      } catch (error) {
        console.error('Failed to process PDF:', error);
        return '[PDF Processing Failed]';
      }
    }

    // Fallback to URL if buffer is unavailable
    const pdfUrl =
      block.pdf.type === 'external'
        ? block.pdf.external.url
        : block.pdf.file.url;

    return `[PDF Document](${pdfUrl})`;
  },
});

const n2m = new NotionConverter(notion)
  .configureFetcher({
    fetchComments: true,
    fetchPageProperties: true,
  })
  // Configure Direct Strategy with buffering
  .useDirectStrategy({
    buffer: {
      enableFor: ['block'],
      includeBlockContentTypes: ['pdf'],
      maxBufferSize: 10 * 1024 * 1024, // 10MB limit
    },
  })
  .withRenderer(renderer)
  .withExporter(
    new DefaultExporter({
      outputType: 'file',
      outputPath: './output.md',
    }),
  );

(async () => {
  try {
    await n2m.convert('page-id');
    console.log('✓ Successfully converted page with buffered PDF processing!');
  } catch (error) {
    console.error('Conversion failed:', error);
  }
})();
```

{{% /details %}}

### Approach 2: Using Download Strategy

When you need to save PDFs locally and process them:

{{% details title="Code using Download Strategy" closed="true"  %}}

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { DefaultExporter } from 'notion-to-md/plugins/exporter';
import { MDXRenderer } from 'notion-to-md/plugins/renderer';
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

// Initialize Notion client
const notion = new Client({
  auth: 'your-notion-api-key',
});

const renderer = new MDXRenderer();

// Customize how PDF blocks are processed
renderer.createBlockTransformer('pdf', {
  transform: async ({ block, manifest }) => {
    // @ts-ignore
    const pdfBlock = block.pdf;

    // Get media information from manifest
    const mediaEntry = manifest.media?.getEntry(block.id);
    if (!mediaEntry) {
      return `[PDF File Not Found]`;
    }

    // Get the local path and transformed URL from media info
    const { localPath, transformedPath } = mediaEntry.mediaInfo;

    if (!localPath) {
      return `[PDF File Not Found]`;
    }
    console.log(mediaEntry, path.basename(localPath || ''));

    // Read and parse the PDF
    const dataBuffer = await fs.readFile(localPath);
    const data = await pdf(dataBuffer);

    // Extract first 1000 characters for preview
    const preview = data.text.slice(0, 1000).trim();

    // Format as collapsible preview with link
    return `
<details>
<summary>${pdfBlock.caption.length > 0 ? pdfBlock.caption[0].plain_text : 'Document Preview'}</summary>

\`\`\`text
${preview}...
\`\`\`

[View Full Document](${transformedPath})
</details>
`;
  },
});

const n2m = new NotionConverter(notion)
  .configureFetcher({
    fetchComments: true,
    fetchPageProperties: true,
  })
  .downloadMediaTo({
    outputDir: './public/documents',
    transformPath: (localPath) => `/documents/${path.basename(localPath)}`,
  })
  .withRenderer(renderer)
  .withExporter(
    new DefaultExporter({
      outputType: 'file',
      outputPath: './output.md',
    }),
  );

(async () => {
  try {
    await n2m.convert('page-id');
    console.log('✓ Successfully converted page with downloaded PDFs!');
  } catch (error) {
    console.error('Conversion failed:', error);
  }
})();
```

{{% /details %}}

> [!TIP]
> Choose the Direct Strategy with buffering when you only need to process the PDF content and don't need to store the files. Use the Download Strategy when you need permanent local copies or want to serve the PDFs from your own server.

{{% details title="Markdown Output" closed="true"  %}}

![notion page with pdf converted using notion to md v4](https://gist.github.com/user-attachments/assets/b38564b4-3abc-433e-a415-605842191011)

{{% /details %}}

## Embedding PDFs

Say you want some **interactivity** in your web-based content such as allowing people to browse, scroll, or search within PDFs directly on your website. Instead of just linking to a file, embedding a PDF creates a seamless reading experience that keeps users interested without diverting them away.

Let's start by creating a PDF viewer component:

```typescript {filename="src/components/PDFViewer.tsx"}
// for example purpose we'll stick with iframe, you can use
// modern packages like react-pdf-viewer, react-pdf etc...
export function PDFViewer({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      style={{ width: "100%", height: "750px", border: "none" }}
    />
  );
}
```

You can use this component with either strategy:

```typescript
renderer.createBlockTransformer('pdf', {
  transform: async ({ block, manifest, utils }) => {
    // For Direct Strategy with buffering
    if (block.buffer) {
      // You could convert the buffer to a data URL
      const base64 = block.buffer.toString('base64');
      return `
<PDFViewer url="data:application/pdf;base64,${base64}" />
`;
    }

    // For Download Strategy
    const mediaEntry = manifest.media?.getEntry(block.id);
    if (mediaEntry?.mediaInfo.transformedPath) {
      return `
<PDFViewer url="${mediaEntry.mediaInfo.transformedPath}" />
`;
    }

    // Fallback to original URL
    const pdfUrl =
      block.pdf.type === 'external'
        ? block.pdf.external.url
        : block.pdf.file.url;

    return `
<PDFViewer url="${pdfUrl}" />
`;
  },
  imports: [`import { PDFViewer } from '@/components/PDFViewer';`],
});
```

> [!NOTE]
> The example is tested in [nextjs with mdx integration](https://nextjs.org/docs/pages/building-your-application/configuring/mdx)

Here is your output MDX content:

```markdown
---
Created: '2025-01-04T02:17:00.000Z'
Tags: ['V4', 'notion to md', 'test']
PublishURL: '/page-1'
Name: 'Handling PDF using Notion to md v4'
---

import { PDFViewer } from '@/components/PDFViewer';

# Embedded pdf

I'll put up my resume for this example (I'm looking for opportunities 😅)

<PDFViewer url="data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50..." />
```

and this is how it'll show up in browser:

![notion page embedded pdf output renderer using notion-to-md](https://gist.github.com/user-attachments/assets/4e463d4d-fb0d-4122-a4b0-940088686f47)

## Conclusion:

With **notion-to-md v4**, managing PDFs is more flexible than ever. You can:

1. Use the Direct Strategy with buffering for efficient in-memory processing
2. Use the Download Strategy for permanent local storage
3. Extract content from PDFs for better SEO and accessibility
4. Create interactive PDF experiences in your web content

Whether you need quick in-memory processing or permanent local storage, notion-to-md v4 provides the tools to handle PDFs effectively.

> [!NOTE]
>
> ## Share Your Use Case and Work
>
> Have you created an interesting customization or workflow with notion-to-md?
> We'd love to hear about it! Consider sharing your experience by:
>
> 1. Creating a blog post in the [notion-to-md blog](/notion-to-md/blog/) section
> 2. Adding an entry to our [plugin catalog](/notion-to-md/catalogue/) if you've built a reusable plugin
> 3. Joining our community discussions on GitHub
>
> Your real-world examples can help others unlock the full potential of using Notion as a content source!
