---
title: 'Configuration'
description: 'Complete reference for notion-to-md v4 configuration options'
weight: 1
---

This page documents all configuration options available in the notion-to-md v4 library. The library uses a builder pattern for configuration, making it easy to customize while maintaining readability.

## NotionConverter Builder Methods

The main `NotionConverter` class provides several builder methods to configure different aspects of the conversion process. The builder pattern makes configuration intuitive and type-safe.

### Basic Configuration

```javascript
const n2m = new NotionConverter(notionClient)
  .configureFetcher({...})     // Configure block fetching behavior
  .downloadMediaTo({...})      // Configure media downloading
  .uploadMediaUsing({...})     // Configure media uploading
  .withPageReferences({...})   // Configure page reference handling
  .withRenderer(renderer)      // Set custom renderer
  .withExporter(exporter);     // Add output exporter
```

## Block Fetcher Configuration

Block Fetcher is responsible for retrieving content from the Notion API. Its configuration controls what data is fetched and how the process is optimized.

```typescript
interface BlockFetcherConfig {
  fetchPageProperties?: boolean; // Include page properties in output
  fetchComments?: boolean; // Include comments in output
  maxRequestsPerSecond?: number; // API rate limit (default: 3)
  batchSize?: number; // Batch size for concurrent requests (default: 3)
  trackMediaBlocks?: boolean; // Track blocks with media content
  trackPageRefBlocks?: boolean; // Track blocks with page references
}
```

### Field Explanations

- **fetchPageProperties**: When `true`, notion page properties are included in the output. Essential for generating frontmatter in markdown or any other use case.

- **fetchComments**: When `true`, retrieves comments on blocks. Useful for collaborative workflows where comments might contain important information.

- **maxRequestsPerSecond**: Controls the API rate limiting to prevent hitting Notion's limits. The default of 3 is safe, but you can adjust based on your API tier.

- **batchSize**: Determines how many blocks are processed in parallel. Higher values improve performance but increase memory usage. The default of 3 balances performance and resource usage.

- **trackMediaBlocks**: When `true`, identifies and tracks blocks containing media (images, files, etc.) for special processing. Automatically enabled when using media handlers.

- **trackPageRefBlocks**: When `true`, identifies and tracks blocks containing page references for link processing. Automatically enabled when using page reference handling.

### Example

```javascript
const n2m = new NotionConverter(notionClient).configureFetcher({
  fetchPageProperties: true,
  fetchComments: false,
  maxRequestsPerSecond: 5,
  batchSize: 10,
});
```

## Media Handling Configuration

notion-to-md v4 offers media handling to ensure images and files are properly processed during conversion. Two strategies are available: downloading files locally or uploading to an external service.

### Download Strategy

Use this strategy when you want to save Notion media files to your local filesystem or server and refer to them in your output. Ideal for static site generation.

```typescript
interface DownloadStrategyConfig {
  outputDir: string; // Directory to save media files
  transformPath?: (localPath: string) => string; // Transform file paths for output
  preserveExternalUrls?: boolean; // Keep external URLs unchanged
  failForward?: boolean; // Continue on errors (default: true)
}
```

### Field Explanations

- **outputDir**: The directory where media files will be saved. Must be accessible and writable by the application.

- **transformPath**: A function that converts local file paths to the paths that will appear in the output. For example, converting `/server/path/image.jpg` to `/public/images/image.jpg`. This ensures URLs in the output content correctly reference the media files.

- **preserveExternalUrls**: When `true`, doesn't download media from external sources (non-Notion URLs). Keeps the original URLs in the output.

- **failForward**: When `true` (default), continues processing even if a media file fails to download. The original URL will be used as a fallback. When `false`, errors during media processing will halt the conversion.

### Example

```javascript
const n2m = new NotionConverter(notionClient).downloadMediaTo({
  outputDir: './public/images',
  transformPath: (localPath) => `/images/${path.basename(localPath)}`,
  preserveExternalUrls: true,
});
```

### Upload Strategy

Use this strategy when you want to upload Notion media to an external service like AWS S3, Cloudinary, or a custom storage system.

```typescript
interface UploadStrategyConfig {
  uploadHandler: (url: string, blockId: string) => Promise<string>; // Upload function
  cleanupHandler?: (entry: MediaManifestEntry) => Promise<void>; // Cleanup function
  transformPath?: (uploadedUrl: string) => string; // Transform URLs
  preserveExternalUrls?: boolean; // Keep external URLs
  failForward?: boolean; // Continue on errors
}
```

### Field Explanations

- **uploadHandler**: A function that receives the original media URL and block ID, handles the upload process, and returns the new URL. This is where you implement your custom upload logic.

- **cleanupHandler**: An optional function that cleans up media files when they're no longer needed (e.g., when a block is deleted or changed). Helps prevent accumulating unused files. This is called internally when the media is no longer referenced.

- **transformPath**: A function that transforms the URLs returned by your upload handler. Useful for adding CDN prefixes or modifying domains.

- **preserveExternalUrls**: When `true`, doesn't upload media from external sources. Keeps the original URLs in the output.

- **failForward**: When `true` (default), continues processing even if media upload fails. The original URL will be used as a fallback. When `false`, upload errors will halt the conversion.

### Example

```javascript
const n2m = new NotionConverter(notionClient).uploadMediaUsing({
  uploadHandler: async (url, blockId) => {
    // Upload file to S3/Cloudinary/etc
    return 'https://cdn.example.com/uploaded-file.jpg';
  },
  cleanupHandler: async (entry) => {
    // Delete file from storage when no longer needed
  },
  transformPath: (url) => url.replace('s3.amazonaws.com', 'cdn.example.com'),
});
```

## Page Reference Configuration

The Page Reference handler manages links between Notion pages, ensuring they work properly in the output. This is especially important for websites or knowledge bases built from Notion content.
You are required to provide URL where the page will be live once published. That will be used as reference for page links.

{{< callout type="info" >}}
Read more about [how to use page reference builder utility](/notion-to-md/docs/v4/concepts/page-reference-handler).
{{< /callout >}}

```typescript
interface PageRefConfig {
  UrlPropertyNameNotion?: string; // Property containing page URL
  baseUrl?: string; // Base URL for page references
  transformUrl?: (url: string) => string; // Custom URL transformation
}
```

### Field Explanations

- **UrlPropertyNameNotion**: The name of a Notion page property that contains the URL or slug for the page. If provided, this property's value will be used instead of generating a URL from the page ID.

- **baseUrl**: The base URL that will be prepended to page references. For example, `https://example.com/blog` will transform references to `https://example.com/blog/page-slug`.

- **transformUrl**: A function that customizes how URLs are generated or transformed. Useful for implementing custom slug generation, URL normalization, or adding path prefixes.

### Example

```javascript
const n2m = new NotionConverter(notionClient).withPageReferences({
  UrlPropertyNameNotion: 'slug',
  baseUrl: 'https://example.com/blog',
  transformUrl: (url) => url.toLowerCase().replace(/\s+/g, '-'),
});
```

## Renderer Configuration

Renderers determine the output format of the conversion. notion-to-md v4 includes a default MDX renderer, but you can create custom renderers for any format.

{{< callout type="info" >}}
Read more about [how to create custom renderer from scratch](/notion-to-md/docs/v4/guides/how-to-create-renderer-from-scratch).
{{< /callout >}}

### MDX Renderer Configuration

The built-in MDX renderer supports frontmatter generation and customization.

```typescript
interface FrontmatterConfig {
  include?: string[]; // Properties to include
  exclude?: string[]; // Properties to exclude
  rename?: Record<string, string>; // Rename properties
  transform?: Record<string, (prop: any) => string>; // Transform functions
  defaults?: Record<string, any>; // Default values
}

interface MDXRendererConfig {
  frontmatter?: boolean | FrontmatterConfig; // Enable/configure frontmatter
}
```

### Field Explanations

- **frontmatter**: Controls frontmatter generation. Can be:

  - `true`: Generate frontmatter from all page properties
  - `false`: Don't generate frontmatter
  - `FrontmatterConfig`: Configure detailed frontmatter behavior

- **include**: An array of property names to include in the frontmatter. If provided, only these properties will be used.

- **exclude**: An array of property names to exclude from the frontmatter. Useful when you want most properties except specific ones.

- **rename**: A mapping of original property names to new names. For example, `{ "Created time": "date" }` will rename the "Created time" property to "date" in the output.

- **transform**: A mapping where keys are property names and values are functions `(property, allProperties) => string`. These functions receive the Notion property object and all page properties, returning a transformed string value for the frontmatter. Useful for formatting dates, generating slugs, etc.

- **defaults**: Default values for properties that might be missing. These values will be used if the corresponding property doesn't exist or is empty.

> [!NOTE]
> The property names are case-sensitive. Meaning that "Title" and "title" are considered different properties.

### Example

```javascript
import { MDXRenderer } from 'notion-to-md/plugins/renderer/mdx';
import { NotionPageProperty, NotionPageProperties } from 'notion-to-md/types/notion';

const renderer = new MDXRenderer({
  frontmatter: {
    include: ['Name', 'date', 'tags'],
    rename: { Name: 'title' },
    transform: {
      date: (prop: NotionPageProperty) => prop.type === 'date' ? new Date(prop.date.start).toLocaleDateString() : '',
      tags: (prop: NotionPageProperty) => prop.type === 'multi_select' ? JSON.stringify(prop.multi_select.map(t => t.name)) : '[]'
    },
    defaults: { draft: false }
  }
});

const n2m = new NotionConverter(notionClient)
  .withRenderer(renderer);
```

## Exporter Configuration

Exporters determine how and where the converted content is saved or used. You can create custom exporters for any destination.

```typescript
interface NotionExporter<TConfig = unknown> {
  export(data: ChainData): Promise<void>;
}

interface ChainData {
  pageId: string; // ID of the converted page
  blockTree: ExtendedFetcherOutput; // Raw block data
  metadata?: Record<string, any>; // Additional metadata
  content: string; // Converted content
}
```

### Field Explanations

- **export()**: The main method that handles the export process. Receives the complete `ChainData` object containing all information about the conversion.

- **pageId**: The Notion page ID that was converted.

- **blockTree**: The complete tree of blocks retrieved from Notion, including all metadata and content.

- **metadata**: Additional information collected during the conversion process, such as processing statistics or conversion settings.

- **content**: The final converted content string (e.g., markdown, HTML) ready for export.

### Example

```javascript
class FileSystemExporter implements NotionExporter {
  constructor(private outputDir: string) {}

  async export(data: ChainData): Promise<void> {
    const filename = `${data.pageId}.md`;
    const filepath = path.join(this.outputDir, filename);
    await fs.writeFile(filepath, data.content, 'utf-8');
  }
}

const n2m = new NotionConverter(notionClient)
  .withExporter(new FileSystemExporter('./content'));
```

## Advanced Types

For reference, these are the detailed types used in some configuration options. These types provide deeper insight into the structure of the data handled during conversion.

### Media Types

```typescript
enum MediaStrategyType {
  DOWNLOAD = 'DOWNLOAD', // Media is downloaded to local filesystem
  UPLOAD = 'UPLOAD', // Media is uploaded to external service
  DIRECT = 'DIRECT', // Original media URLs are used directly
}

interface MediaInfo {
  type: MediaStrategyType; // The strategy used for this media
  originalUrl: string; // The original Notion URL
  localPath?: string; // Path on local filesystem (for DOWNLOAD)
  uploadedUrl?: string; // URL after upload (for UPLOAD)
  transformedPath?: string; // Final URL/filepath used in output
  mimeType?: string; // Media content type
}

interface MediaManifestEntry {
  mediaInfo: MediaInfo; // Complete media information
  lastEdited: string; // Last edit timestamp from Notion
  createdAt: string; // When the entry was first created
  updatedAt: string; // When the entry was last updated
}
```

### Page Reference Types

```typescript
enum PageReferenceEntryType {
  PROPERTY = 'PROPERTY', // URL derived from page property
  MANIFEST = 'MANIFEST', // URL stored in reference manifest
}

interface PageReferenceEntry {
  url: string; // The URL for the page reference
  source: PageReferenceEntryType; // How the URL was determined
  lastUpdated: string; // When the reference was last updated
}
```
