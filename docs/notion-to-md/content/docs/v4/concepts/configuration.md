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

notion-to-md v4 offers media handling to ensure images and files are properly processed during conversion. Three strategies are available: downloading files locally (`DownloadStrategy`), uploading to an external service (`UploadStrategy`), or using direct Notion URLs, optionally with in-memory buffering (`DirectStrategy`).

### Direct Strategy (default)

This is the default strategy, when it's not configured it's default behavior is to keep original Notion URLs for media files in your output. This is the simplest strategy but relies on Notion's temporary URLs, which might expire.

This strategy also supports optional **in-memory buffering** of media content and needs to be enabled through extra configuration. It adds an extra field to the block/property called `buffer`. Proves to be useful in cases where media preprocessing is required.

```typescript
/** Custom handler function type for DirectStrategy buffering */
export type CustomBufferHandler = (
  /** The full reference object (block or property) being processed. */
  reference: TrackedBlockReferenceObject, // Requires definition or import if not available
  /** The index of the file within a property (undefined for blocks, only valid for properties). */
  index: number | undefined,
  /** The original URL of the media file. */
  url: string,
) => Promise<Buffer>;

/** Configuration options specifically for buffering in DirectStrategy. */
export interface DirectStrategyBufferOptions {
  /**
   * Array specifying which reference types to enable buffering for.
   * If `buffer` is set to `true` in `DirectStrategyConfig` and this is omitted,
   * it defaults to `['block', 'database_property']`.
   * To enable for page properties as well, use `['block', 'database_property', 'page_property']`.
   * Provide an empty array `[]` to disable buffering even if `buffer` is `true`.
   * See `MediaReferenceType` in Advanced Types.
   * @default ['block', 'database_property']
   */
  enableFor?: MediaReferenceType[];
  /**
   * **Only applies if 'block' is included in `enableFor`**.
   * Array specifying which specific Notion media block content types should be buffered.
   * If omitted, all supported media block types ('image', 'video', 'pdf', 'file')
   * encountered within enabled 'block' references will be buffered.
   * Example: `['image', 'pdf']` to only buffer images and PDFs found in blocks.
   * See `NotionMediaBlockType` in Advanced Types.
   */
  includeBlockContentTypes?: NotionMediaBlockType[];
  /**
   * Maximum buffer size in bytes for each media file.
   * If a file exceeds this size, buffering will be skipped for that file.
   * Set to `0` or `undefined` for no limit.
   * @default 0
   */
  maxBufferSize?: number;
  /**
   * Optional custom fetching logic per reference type.
   * Allows providing specific functions to fetch and return a Buffer for
   * 'block', 'database_property', or 'page_property' references.
   * If a handler is provided for a type, it overrides the default fetch behavior for that type.
   */
  handlers?: Partial<Record<MediaReferenceType, CustomBufferHandler>>;
}

interface DirectStrategyConfig {
  /**
   * Enables or configures in-memory buffering of media content.
   * - `false` (default): Buffering is disabled. Original URLs are used.
   * - `true`: Buffering is enabled with default options (buffers blocks and database properties).
   * - `DirectStrategyBufferOptions`: Provide an object to customize buffering behavior (which types to buffer, size limits, custom handlers).
   * When enabled, a `buffer` property (Node.js Buffer) is attached to the corresponding Notion block or property file object.
   * @default false
   */
  buffer?: boolean | DirectStrategyBufferOptions;
  /** Continue processing other media references on errors. @default true */
  failForward?: boolean;
}
```

### Field Explanations

- **buffer**: Controls whether media content is fetched and stored in memory as a Node.js `Buffer`.
  - If `false` (default), only the original Notion URL is used.
  - If `true`, enables buffering with default settings (targets blocks and database properties).
  - If an object (`DirectStrategyBufferOptions`) is provided, allows fine-grained control over buffering (e.g., which types to buffer (`enableFor`), which block content types (`includeBlockContentTypes`), maximum size (`maxBufferSize`), custom fetching logic (`handlers`)).
  - When buffering is successful, the fetched `Buffer` is attached as a `buffer` property directly onto the modified Notion block object (e.g., `image`, `file`, `video`, `pdf`) or the specific file entry within a `files` property. Consumers (like renderers or transformers) can then access this raw data.
- **failForward**: When `true` (default), continues processing other references even if fetching/buffering fails for one. When `false`, errors during buffering will halt the conversion.

### Example (Buffering Images and PDFs)

```javascript
const n2m = new NotionConverter(notionClient)
  // Use direct strategy with buffering enabled only for image/pdf blocks
  .useDirectMediaStrategy({
    buffer: {
      enableFor: ['block'], // Only buffer block references
      includeBlockContentTypes: ['image', 'pdf'], // Only buffer these block types
      maxBufferSize: 5 * 1024 * 1024, // 5MB limit per file
    },
  });

// In a custom renderer/transformer:
function handleImageBlock(block: NotionImageBlock) {
  if (block.buffer) {
    // Use the buffer (e.g., create base64 data URI)
    const base64 = block.buffer.toString('base64');
    const mimeType = 'image/png'; // Determine actual mime type if possible
    return `<img src="data:${mimeType};base64,${base64}" />`;
  } else {
    // Fallback to URL if buffer is missing (e.g., too large, fetch error)
    return `<img src="${block.image.url}" />`;
  }
}
```

> **Note:** The builder method might be `.useDirectMediaStrategy({...})` or similar, depending on the actual implementation. Check the API reference. Using the Direct strategy without buffering requires no explicit configuration (`new NotionConverter(notion)` would use it by default if no other strategy is specified, assuming it's the default).

### Download Strategy

Use this strategy when you want to save Notion media files to your local filesystem or server and refer to them in your output. Ideal for static site generation or when you are using some framework.

```typescript
interface DownloadStrategyConfig {
  outputDir: string; // Directory to save media files
  transformPath?: (localPath: string) => string; // Transform file paths for output
  preserveExternalUrls?: boolean; // Keep external URLs unchanged (default: false)
  /**
   * Specifies which types of media references this strategy should apply to.
   * If omitted, defaults to all types: `['block', 'database_property', 'page_property']`.
   * @default ['block', 'database_property', 'page_property']
   */
  enableFor?: MediaReferenceType[];
  failForward?: boolean; // Continue on errors (default: true)
}
```

### Field Explanations

- **outputDir**: The directory where media files will be saved. Must be accessible and writable by the application.

- **transformPath**: A function that converts local file paths to the paths that will appear in the output. For example, converting `/server/path/image.jpg` to `/public/images/image.jpg`. This ensures URLs in the output content correctly reference the media files.

- **preserveExternalUrls**: When `true`, doesn't download media from external sources (non-Notion URLs). Keeps the original URLs in the output. Defaults to `false`.

- **enableFor**: Decide _which_ Notion media you want this strategy to handle based on where it is in Notion. You can specify an array with these options:
  - `'block'`: For media placed directly within your page content (like image blocks, file blocks, PDFs).
  - `'database_property'`: For media found in 'Files & media' properties within database entries (like attachments in a table row).
  - `'page_property'`: For media in 'Files & media' properties on the page properties (not in a database), including page covers or icons if they are files uploaded to Notion.
    If you don't set this option, the strategy will apply to media from all these locations by default (`['block', 'database_property', 'page_property']`). For example, you could use `['block']` if you only care about downloading images and files embedded directly in your page's main content.

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
  preserveExternalUrls?: boolean; // Keep external URLs (default: false)
  /**
   * Specifies which types of media references this strategy should apply to.
   * If omitted, defaults to all types: `['block', 'database_property', 'page_property']`.
   * @default ['block', 'database_property', 'page_property']
   */
  enableFor?: MediaReferenceType[];
  failForward?: boolean; // Continue on errors (default: true)
}
```

### Field Explanations

- **uploadHandler**: A function that receives the original media URL and block ID, handles the upload process, and returns the new URL. This is where you implement your custom upload logic.

- **cleanupHandler**: An optional function that cleans up media files when they're no longer needed (e.g., when a block is deleted or changed). Helps prevent accumulating unused files. This is called internally when the media is no longer referenced.

- **transformPath**: A function that transforms the URLs returned by your upload handler. Useful for adding CDN prefixes or modifying domains.

- **preserveExternalUrls**: When `true`, doesn't upload media from external sources. Keeps the original URLs in the output. Defaults to `false`.

- **enableFor**: Decide _which_ Notion media you want this strategy to handle based on where it is in Notion. You can specify an array with these options:
  - `'block'`: For media placed directly within your page content (like image blocks, file blocks, PDFs).
  - `'database_property'`: For media found in 'Files & media' properties within database entries (like attachments in a table row).
  - `'page_property'`: For media in 'Files & media' properties on the page properties (not in a database), including page covers or icons if they are files uploaded to Notion.
    If you don't set this option, the strategy will apply to media from all these locations by default (`['block', 'database_property', 'page_property']`). For example, you could use `['block']` if you only care about downloading images and files embedded directly in your page's main content.

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

You are required to provide a Notion property that contains the **full published URL** for each page. This will be used as the reference for all page links.

### Property Requirements

- The property referenced by `urlPropertyNameNotion` **must contain the full published URL** for the page (not just a slug or path segment). For example, `https://example.com/docs/getting-started`.
- **Supported property types:**
  - Text (plain text property)
  - Formula (the final computed value must be a string URL)
  - URL (URL property or formula that returns a URL)
- Set `urlPropertyNameNotion` in your config to the exact name of this property.
- This property must be consistent across all pages that will be referenced.

> **Note:** The Page Reference Handler will extract the value from this property and expects it to be a valid, full URL. If you use a formula, ensure the result is a string containing the full URL.

{{< callout type="info" >}}
Read more about [how to use page reference builder utility](/docs/v4/guides/how-to-generate-references-for-page).
{{< /callout >}}

```typescript
interface PageRefConfig {
  urlPropertyNameNotion: string; // Property containing the full published URL (required)
  useUrlPath?: boolean; // Use only the path part of the URL (default: true)
  transformUrl?: (url: string) => string; // Custom URL transformation (optional)
  failForward?: boolean; // Continue on errors (default: true)
}
```

### Field Explanations

- **urlPropertyNameNotion**: The name of a Notion page property that contains the **full published URL** for the page. This property must be of type text, formula (final value string), or URL. This is required.
- **useUrlPath**: When `true` (the default), only the path component of the URL is used to replace the page reference (e.g., for `https://mysite.com/blog/my-post`, the reference becomes `/blog/my-post`). Set to `false` to use the full URL.
- **transformUrl**: An optional function to customize the final URL. It receives the full URL from the manifest and its return value is used as the final reference. If provided, this function takes precedence over the `useUrlPath` setting.
- **failForward**: When `true` (default), continues processing even if a reference fails to resolve. When `false`, errors will halt the conversion.

{{< callout type="info" >}}
Why does `useUrlPath` exists?

Page reference handler's primary use case is to build internal page links and those are relative which is why by default we add update the block with the URL path.
{{< /callout >}}

### Example

```javascript
const n2m = new NotionConverter(notionClient).withPageReferences({
  urlPropertyNameNotion: 'Published URL', // The property must contain the full published URL
  useUrlPath: true, // This is the default, creates relative links like '/my-page'
});

// Example with transformUrl taking precedence
const n2mWithTransform = new NotionConverter(notionClient).withPageReferences({
  urlPropertyNameNotion: 'Published URL',
  useUrlPath: true, // This will be ignored
  transformUrl: (url) => url.toLowerCase().replace('https://my.domain.com', ''), // returns just the path, but in lowercase
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
  transform?: Record<
    string,
    (
      property: NotionPageProperty,
      allProperties: NotionPageProperties,
    ) => string
  >; // Transform functions
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

- **transform**: A mapping where keys are property names and values are functions `(property: NotionPageProperty, allProperties: NotionPageProperties) => string`. These functions receive the Notion property object and all page properties, and it should return a transformed string value for the frontmatter. Useful for formatting dates, generating slugs, etc.

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

/** Identifies the source of a media reference (block, page property, or database property). */
export type MediaReferenceType =
  | 'block'
  | 'page_property'
  | 'database_property';

/** Specific Notion block types that contain media URLs and can potentially be buffered. */
export type NotionMediaBlockType = 'image' | 'video' | 'file' | 'pdf';

interface MediaInfo {
  type: MediaStrategyType; // The strategy used for this media
  originalUrl: string; // The original Notion URL
  localPath?: string; // Path on local filesystem (for DOWNLOAD)
  uploadedUrl?: string; // URL after upload (for UPLOAD)
  transformedPath?: string; // Final URL/filepath used in output (derived from local/uploaded/original)
  mimeType?: string; // Media content type (may not always be available)
  sourceType: MediaReferenceType; // Where the media URL was found
  propertyName?: string; // Name of the property if sourceType is property
  propertyIndex?: number; // Index within the files array if sourceType is property
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
