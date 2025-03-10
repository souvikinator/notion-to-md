# Notion URL Reference Builder Documentation

A utility for scanning Notion databases and pages to build URL reference manifests.

## Installation

```bash
npm install @notionhq/client notion-to-md@latest
```

## Usage Example

```typescript
import { Client } from "@notionhq/client";
import { PageReferenceManifestBuilder } from "notion-to-md/utils/page-ref-builder";

const notion = new Client({
  auth: "your-notion-api-key"
});

const builder = new PageReferenceManifestBuilder(notion, {
  urlPropertyNameNotion: "PublishURL",  // Property name in Notion containing URLs
  recursive: true,                       // Process nested databases
  concurrency: 5,                        // Parallel processing limit
  baseUrl: "https://example.com"         // Optional base URL to prepend
});

await builder.build("your-database-or-page-id");
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| urlPropertyNameNotion | string | Name of Notion property containing URLs |
| recursive | boolean | Process nested databases |
| concurrency | number | Max parallel operations (default: 3) |
| baseUrl | string | Optional URL to prepend to property values |

## Features

- Processes both standalone databases and pages containing databases
- Handles both URL and rich text property types
- Parallel processing with configurable concurrency
- Optional base URL prefixing
- Maintains manifest of processed items

## Error Handling

- Gracefully handles API errors
- Skips invalid/missing URLs
- Logs operation status and errors
- Prevents duplicate processing

## Common Use Cases

1. Generating URL manifests from Notion databases
2. Building sitemap data
3. URL reference tracking
4. Content publishing workflows

The builder saves processed data through the `PageReferenceManifestManager` for later use in your application.
