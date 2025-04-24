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
  - notion-to-md
excludeSearch: true
---

Notion-to-md `v4.0.0-alpha.5` introduces several enhancements aimed at improving flexibility and developer experience. Here's a breakdown of the key updates:

## Enhanced Frontmatter Configuration

This release significantly improves **frontmatter handling**, making it easier to manage and modify metadata derived from Notion properties.

### What This Means

- **Powerful Value Transformation:** Need to format a date differently, convert tags to lowercase, or even generate a URL-friendly slug from your page title? The new `transform` option lets you apply custom logic to property values _before_ they are added to the frontmatter, giving you complete control over the final output format. [See frontmatter transform in action](../../../../blog/how-to-convert-notion-properties-to-frontmatter/#transforming-properties) and [refer to API reference](../../concepts/configuration/#mdx-renderer-configuration).

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

## Other Minor Fixes & Improvements

- Improved error handling for media buffering
- Better TypeScript types for media handling configurations



---

These improvements aim to make Notion an even more powerful CMS by bridging the gap between your Notion workspace and your final publication format.
