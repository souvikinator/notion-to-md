---
title: "Page References Handling"
description: "Handle links between Notion pages in your converted content"
weight: 3
---

When converting Notion content, one of the most challenging aspects is maintaining functional links between pages. The Page Reference Handler in notion-to-md v4 solves this challenge by tracking, transforming, and maintaining these relationships.

## Page Reference Types in Notion

Notion has several ways to reference pages:

1. **Direct Links** - Explicit links to other pages
2. **Page Mentions** - Page mentions in text content using @ mentions
3. **Link to Page Blocks** - Special blocks that link to other pages
4. **Child Page References** - Parent-child relationships between pages

The Page Reference Handler manages all these reference types, ensuring they work properly in your exported content.

## Prerequisites & How Page References Work

For page references to work properly, there's an important prerequisite to understand: **your Notion pages need a way to determine their final URLs**.

### The Basics

At its core, page reference handling requires:

1. **Source of Truth**: Each Notion page needs a property (like "Slug", "URL", or "Path") that indicates where that page will be located in your final system
2. **Reference Manifest**: notion-to-md maintains a registry that maps Notion page IDs to their corresponding URLs
3. **Transformation Process**: When a link to another page is found, it's transformed using information from the manifest

### Setting Up Your Notion Pages

Before using page references, ensure your pages have the necessary property:

1. Add a property to your Notion pages (name it anything, typically named "Slug", "URL", or "Path")
2. Fill this property with the path where each page will be accessible (e.g., "getting-started", "api/authentication")
3. Make sure this property is consistent across all pages that will be referenced

### How The Manifest Works

notion-to-md uses a two-step process to handle page references:

1. **Building the Manifest**:
   * As pages are processed, URL information is collected from it's properties and mapped against the page ID
   * This mapping is stored in a manifest file (`.notion-to-md/ref/page_ref.json`)

2. **Transforming References**:
   * When a reference to another page is found in content
   * The target page ID is looked up in the manifest
   * The reference is updated to use the proper URL

### Starting Fresh vs. Existing Content

Your approach depends on how much Notion content you already have:

#### For New

If you're just starting with no prior pages, the manifest builds automatically as you process pages:

```javascript
const n2m = new NotionConverter(notionClient)
  .withPageReferences({
    baseUrl: 'https://example.com',
    UrlPropertyNameNotion: 'slug'  // The name of your Notion property
  });

// Converting a page will also add it to the manifest
await n2m.convert('your-page-id');
```

#### For Existing Content With Many Pages

If you have a large Notion workspace with many interconnected pages, you should pre-build the entire manifest first:

##### Page reference builder

notion-to-md provides a utility specifically designed for building a complete reference manifest at a go provided each page has the specified property:

```javascript
import { PageReferenceManifestBuilder } from 'notion-to-md/utils';

// Create a builder instance
const builder = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'slug',  // The name of your Notion property
  baseUrl: 'https://example.com'  // Your site's base URL
});

// Build manifest starting from a root page or database
await builder.build('root-page-or-database-id');

console.log('Manifest built successfully!');
```

This utility:
1. Starts from a root page or database
2. Finds all pages with the specified property
3. Creates a complete manifest of page IDs to URLs

Once built, the manifest is automatically used by your NotionConverter:

```javascript
const n2m = new NotionConverter(notionClient)
  .withPageReferences({
    baseUrl: 'https://example.com',
    UrlPropertyNameNotion: 'slug'
  });

// Now any page conversions will use the pre-built manifest
await n2m.convert('your-page-id');
```

{{< callout type="info" >}}
Detailed configuration options are available in the [Page reference configuration guide](/docs/v4/concepts/configuration/#page-reference-configuration).
{{< /callout >}}

## Advanced Use Cases

### Creating a Site Map

You can use the Page Reference Handler to create a site map or navigation structure:

```javascript
import { NotionConverter } from 'notion-to-md';
import { PageReferenceManifestBuilder } from 'notion-to-md/utils';

// First, build a comprehensive page reference manifest
const builder = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'slug',
  baseUrl: 'https://example.com/docs'
});

// Build from a root page or database
await builder.build('root-page-id');

// Now use the converter with the pre-built manifest
const n2m = new NotionConverter(notionClient)
  .withPageReferences({
    baseUrl: 'https://example.com/docs',
    UrlPropertyNameNotion: 'slug'
  });

// The manifest is automatically shared between components
await n2m.convert('your-page-id');

// Access all page references
const manifestManager = builder.getManifestManager();
const allPages = manifestManager.getAllEntries();

// Generate a sitemap
const sitemap = Object.entries(allPages).map(([pageId, entry]) => ({
  id: pageId,
  url: entry.url,
  lastUpdated: entry.lastUpdated
}));
```

<!-- ### Handling Private Pages

Notion has complex access rules, and some pages might be private or inaccessible to your integration. The Page Reference Handler gracefully handles these cases:

```javascript
.withPageReferences({
  baseUrl: 'https://example.com/docs',
  UrlPropertyNameNotion: 'slug',
  // Optionally provide fallback handling for private pages
  transformUrl: (url, pageId, isAccessible) => {
    if (!isAccessible) {
      return `/login?redirect=${encodeURIComponent(url)}`;
    }
    return url;
  }
})
``` -->
