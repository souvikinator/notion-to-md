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
excludeSearch: true
comments: true
---

When converting Notion pages to Markdown, dealing with embedded documents such as PDFs might be tricky. Unlike photos or plain text, PDFs include rich content that necessitates particular handling. This guide explains how notion-to-md v4 helps handling these documents at different levels.

Embedded PDFs or any media in Notion present several unique challenges:

1. **Media Management**: Media are stored on temporary Notion URLs that expire
2. **Content Access**: You may want to extract or process the PDF content itself
3. **Embedded Experience**: In some outputs (like websites), you might want to embed the PDF viewer

## Media Handling Strategies

The first step in working with PDFs or any media is ensuring the files themselves are properly handled. notion-to-md v4 offers three approaches:

1. Direct Strategy
2. Download Strategy
3. Upload Strategy

To know more about each strategy, refer to the [Media Handling Strategies](../../docs/v4/concepts/media-handler) guide.

In this guide we are going to use the download strategy to store the pdfs locally.

## Processing PDF Content

If you need to extract and include text from PDFs into your content, you can modify the **PDF block transformer**. This method is extremely helpful for **enhancing search optimization**, improving accessibility, and creating **automatic content summaries**. By extracting text from PDFs, you ensure that vital information is indexed and easily searchable inside your documentation or website.

Here is what our target page looks like:

![notion page with pdf embedded](/images/notion-page-with-pdf-embedded.png)

{{% details title="Code to process PDF content" closed="true"  %}}

```typescript
import { Client } from "@notionhq/client";
import { NotionConverter } from "notion-to-md";
import { DefaultExporter } from "notion-to-md/plugins/exporter";
import { MDXRenderer } from "notion-to-md/plugins/renderer";
import pdf from "pdf-parse";
import fs from "fs/promises";
import path from "path";

// Initialize Notion client
const notion = new Client({
  auth: "your-notion-api-key",
});

const renderer = new MDXRenderer();

// Customize how PDF blocks are processed
renderer.createBlockTransformer("pdf", {
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
    console.log(mediaEntry, path.basename(localPath || ""));

    // Read and parse the PDF
    const dataBuffer = await fs.readFile(localPath);
    const data = await pdf(dataBuffer);

    // Extract first 1000 characters for preview
    const preview = data.text.slice(0, 1000).trim();

    // Format as collapsible preview with link
    return `
<details>
<summary>${pdfBlock.caption.length > 0 ? pdfBlock.caption[0].plain_text : "Document Preview"}</summary>

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
    outputDir: "./public/documents",
    transformPath: (localPath) => `/documents/${path.basename(localPath)}`,
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
    await n2m.convert("page-id");
    console.log("✓ Successfully converted page with comments as footnotes!");
  } catch (error) {
    console.error("Conversion failed:", error);
  }
})();
```

{{% /details %}}

> [!TIP]
> It's not necessary to use the download strategy or media handler, you can directly get the original notion URL from `mediaEntry.mediaInfo.originalUrl`, read the PDF content and do as your usecase requires.

{{% details title="Markdown Output" closed="true"  %}}

![notion page with pdf converted using notion to md v4](https://gist.github.com/user-attachments/assets/b38564b4-3abc-433e-a415-605842191011)

{{% /details %}}

Further efforts can be put into formatting the content of the PDF.

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

and we use that in our mdx file

```typescript {filename="src/app/example/page.mdx"}
renderer.createBlockTransformer('pdf', {
  transform: async ({ block, manifest }) => {
    const pdfBlock = block.pdf;
    const mediaEntry = manifest.media?.getEntry(block.id);

    if (!mediaEntry) {
      return `[PDF File Not Found]`;
    }

    const { transformedUrl } = mediaEntry.mediaInfo;

    return `
<PDFViewer url="${transformedUrl}" />
`;
  },
  imports: [
    `import { PDFViewer } from '@/components/PDFViewer';` // import the component
  ]
});
```

> [!NOTE]
> The example is tested in [nextjs with mdx integration](https://nextjs.org/docs/pages/building-your-application/configuring/mdx)

Here is your output MDX content:

```markdown
---
Created: "2025-01-04T02:17:00.000Z"
Tags: ["V4", "notion to md", "test"]
PublishURL: "/page-1"
Name: "Handling PDF using Notion to md v4"
---

import { PDFViewer } from '@/components/PDFViewer';

# Embedded pdf

I’ll put up my resume for this example (I’m looking for opportunities 😅)

<PDFViewer url="/documents/1b54171b-8be6-8019-9f53-cc63c3e7ae2f.pdf" />
```

and this is how it'll show up in browser:

![notion page embedded pdf output renderer using notion-to-md](https://gist.github.com/user-attachments/assets/4e463d4d-fb0d-4122-a4b0-940088686f47)


## Conclusion:

With **notion-to-md v4**, managing PDFs is more flexible than ever. You can:

1. Use media handlers to effectively store and manage files.
2. Extract content from PDF blocks and integrate it smoothly into your workflow.
3. Use MDX to embed rich documents and create a more dynamic experience.

Whether you require **improved searchability through content extraction** or **an interactive PDF viewer for your website**, you may choose what works best for you.

Best of all, you're not restricted to simply HTML,JSX,TSX,etc; you may also use **shortcodes** provided by your static site generator for even more personalization.

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
