---
title: v4-0-0-alpha.5
date: 2025-03-15 # Adjust date if needed
description: Overview of the key improvements and features introduced in notion-to-md v4.0.0-alpha.5.
tags:
  - changelog
  - v4
  - frontmatter
  - media
  - buffer
  - properties
  - database
  - notion-to-md
excludeSearch: true
---

Notion-to-md `v4.0.0-alpha.5` introduces several enhancements aimed at improving flexibility and developer experience. Here's a breakdown of the key updates:

## Notion Child Database Support

This release introduces powerful new features for customizing how Notion databases are rendered.

### What This Means

- **Property Transformers**: Create custom renderers for specific database properties using `createPropertyTransformer` chain function.
- **Query Database**: The notion database can be queried similar to how it's done in Notion's official SDK, allowing to render filtered data.
- **Database Layout Control**: Completely customize database appearance with database block transformers
- **Rich Property Types**: Full support for all Notion property types including select, multi-select, people, files, and more

### Dive Deeper

- [Database Customization Guide](../../guides/how-to-modify-notion-database)
- [Property Types Reference](../../guides/how-to-modify-notion-database#working-with-property-types)
- [Database Configuration](../../concepts/configuration/#database-configuration)

## Enhanced Frontmatter Configuration

This release significantly improves **frontmatter handling**, making it easier to manage and modify metadata derived from Notion properties.

### What This Means

- **Powerful Value Transformation:** Need to format a date differently, convert tags to lowercase, or even generate a URL-friendly slug from your page title? The new `transform` option lets you apply custom logic to property values _before_ they are added to the frontmatter, giving you complete control over the final output format.

### Dive Deeper

- [See frontmatter transform in action](../../../../blog/how-to-convert-notion-properties-to-frontmatter/#transforming-properties)
- Refer to the [Renderer API reference](../../concepts/configuration/#mdx-renderer-configuration).

## Direct Media Strategy with In-Memory Buffering

This release introduces a powerful new media handling strategy that enables in-memory processing of media files.

### What This Means

- **In-Memory Media Processing:** Process images, PDFs, and other media files directly in memory without saving to disk
- **Flexible Media Handling:** Choose which types of media to buffer and set size limits
- **Enhanced Control:** Access media content as Node.js Buffers for custom transformations
- **Optimized Performance:** Avoid unnecessary disk I/O when working with media files

### Dive Deeper

- [Using Direct Media Strategy Guide](../../../../blog/mastering-media-handling-in-notion-to-md-v4#strategy-1-direct-strategy-the-default)
- [Handling Documents and PDFs](../../../../blog/how-to-handle-documents-in-notion-using-notion-to-md-v4/)
- [Direct Strategy API Reference](../../concepts/configuration/#direct-strategy-default)

## Expanded Media Handling Scope

Media handlers (Direct, Download, Upload) can now process media found in Notion **page properties** (like `Files & Media`) and **page-level** elements (cover images and icons).

### What This Means

- **Comprehensive Media Management:** Apply your chosen media strategy consistently across all Notion content, including page covers, icons, and file properties.
- **Unified Workflow:** Simplify your setup by handling all media types (block, property, page) with the same configuration.
- **Controlled Scope:** Use the `enableFor` configuration option within your media strategy to specify whether to process media from `block`, `database_property`, and/or `page` elements.

### Dive Deeper

- [Mastering Media Handling Guide](../../../../blog/mastering-media-handling-in-notion-to-md-v4)
- [Media Handling Configuration](../../concepts/configuration/#media-handling-configuration) (See the `enableFor` option)

---

These improvements aim to make Notion an even more powerful CMS by bridging the gap between your Notion workspace and your final publication format.
