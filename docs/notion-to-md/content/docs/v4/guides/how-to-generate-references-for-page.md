---
title: 'How to use page reference utility'
description: 'Guide on how to generate page references using the page reference utility for internal linking'
weight: 4
---

The Page Reference Utility is a powerful tool designed to build and maintain a manifest of references between Notion pages. This utility extracts URLs from Notion databases and creates a mapping between Notion page IDs and their corresponding published URLs, making it easier to **implement internal linking** in your content.

## Prerequisites & Setup

Before using the page reference utility, ensure your Notion pages are properly configured:

### Setting Up Your Notion Pages

1. **Add a URL property to your Notion pages** - Name it something descriptive like "Published URL", "Full URL", or "Website URL"
2. **This property must contain the full published URL** for each page (not just a slug or path segment)
   - ✅ Correct: `https://example.com/docs/getting-started`
   - ❌ Incorrect: `getting-started` or `/docs/getting-started`
3. **Supported property types:**
   - **Text** (plain text property)
   - **Formula** (the final computed value must be a string URL)
   - **URL** (URL property)
4. **Make this property consistent** across all pages that will be referenced

> **Important:** The Page Reference Handler extracts the value from this property and expects it to be a valid, full URL. If you use a formula, ensure the result is a string containing the complete URL.

## Usage Approaches

Your approach depends on how much Notion content you already have:

### For New Projects

If you're just starting with no prior pages, the manifest builds automatically as you process pages:

```javascript
const n2m = new NotionConverter(notionClient).withPageReferences({
  urlPropertyNameNotion: 'Published URL', // The name of your Notion property (required)
});

// Converting a page will also add it to the manifest
await n2m.convert('your-page-id');
```

### For Existing Content With Many Pages

If you have a large Notion workspace with many interconnected pages, you should pre-build the entire manifest first:

#### Page Reference Builder

notion-to-md provides a utility specifically designed for building a complete reference manifest in one go, provided each page has the specified property:

```javascript
import { PageReferenceManifestBuilder } from 'notion-to-md/utils/page-ref-builder';

// Create a builder instance
const builder = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'Published URL', // The name of your Notion property (required)
});

// Build manifest starting from a root page or database
await builder.build('root-page-or-database-id');

console.log('Manifest built successfully!');
```

This utility:

1. Starts from a root page or database
2. Finds all pages with the specified property
3. Extracts valid, full URLs from the property
4. Creates a complete manifest of page IDs to URLs
5. Skips pages with invalid URLs or missing properties

Once built, the manifest is automatically used by your NotionConverter:

```javascript
const n2m = new NotionConverter(notionClient).withPageReferences({
  urlPropertyNameNotion: 'Published URL',
});

// Now any page conversions will use the pre-built manifest
await n2m.convert('your-page-id');
```

## How The Manifest Works

notion-to-md uses a two-step process to handle page references:

1. **Building the Manifest**:
   - As pages are processed, URL information is collected from the specified property and mapped against the page ID
   - This mapping is stored in a manifest file (`.notion-to-md/ref/page_ref.json`)
   - Only valid, full URLs are included in the manifest

2. **Transforming References**:
   - When a reference to another page is found in content
   - The target page ID is looked up in the manifest
   - The reference is updated to use the proper URL from the manifest

## Configuration Examples

### Example with Different Property Types

```javascript
// Using a Text property
const builder = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'Website URL', // Text property containing full URLs
});

// Using a Formula property
const builderWithFormula = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'Generated URL', // Formula that outputs full URLs
});

// Using a URL property
const builderWithURL = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'Published URL', // URL property type
});
```

### Example Property Values in Notion

Your Notion property should contain values like:

- `https://example.com/docs/getting-started`
- `https://mysite.com/blog/my-first-post`
- `https://docs.company.com/api/reference`

**Not like this:**

- `getting-started` (missing domain)
- `/docs/getting-started` (relative path)
- `docs/getting-started` (incomplete URL)

## Advanced Use Cases

### Creating a Site Map

You can use the Page Reference Handler to create a site map or navigation structure:

```javascript
import { NotionConverter } from 'notion-to-md';
import { PageReferenceManifestBuilder } from 'notion-to-md/utils/page-ref-builder';

// First, build a comprehensive page reference manifest
const builder = new PageReferenceManifestBuilder(notionClient, {
  urlPropertyNameNotion: 'Published URL',
});

// Build from a root page or database
await builder.build('root-page-id');

// Now use the converter with the pre-built manifest
const n2m = new NotionConverter(notionClient).withPageReferences({
  urlPropertyNameNotion: 'Published URL',
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
  lastUpdated: entry.lastUpdated,
}));
```

## Configuration Reference

For detailed configuration options, see the [Page Reference Configuration Guide](../configuration/#page-reference-configuration).

Key configuration properties:

- **urlPropertyNameNotion**: The name of your Notion property containing full URLs (required)
- **useUrlPath**: When `true` (the default), converts the full URL to just its path (e.g., `/blog/my-post`). Set to `false` to keep the full URL.
- **transformUrl**: Optional function to transform URLs before storing. This takes precedence over `useUrlPath`.
- **failForward**: Whether to continue processing on errors (default: true)

## Common Issues and Solutions

### Issue: References Not Working

**Solution**: Ensure your property contains full URLs, not just slugs or paths.

### Issue: Some Pages Missing from Manifest

**Solution**: Check that all pages have the specified property with valid URLs.

### Issue: Property Name Not Found

**Solution**: Verify the property name matches exactly (case-sensitive) and use `urlPropertyNameNotion` (with lowercase 'u').

---

> **Note:** This utility is essential for maintaining functional internal links when converting Notion content to other formats. Make sure your URL property is consistently populated across all pages that need to be referenced.
