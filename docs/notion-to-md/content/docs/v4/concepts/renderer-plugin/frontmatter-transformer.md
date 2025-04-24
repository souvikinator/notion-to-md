---
title: 'Frontmatter Transformers'
description: 'Understanding frontmatter transformers and how they modify page metadata'
weight: 5
---

Frontmatter transformers allow you to customize how Notion page properties are converted into frontmatter metadata. This is particularly useful for static site generators and content management systems that rely on frontmatter.

For practical examples of using frontmatter transformers in a blog, see the [Blog Setup Guide](../../../guides/blog-setup). For detailed configuration options, check out the [Configuration Reference](../../../reference/configuration#frontmatter).

## Basic Structure

Frontmatter transformers are configured directly in the renderer options. Each property type can have its own transform function:

```typescript
import { MDXRenderer } from 'notion-to-md/plugins/renderer';

const renderer = new MDXRenderer({
  frontmatter: {
    transform: {
      // Transform date properties
      date: (property, allProperties) => {
        if (property.type !== 'date' || !property.date?.start) return '';
        return new Date(property.date.start).toISOString();
      },
      // Transform title properties
      title: (property, allProperties) => {
        if (property.type !== 'title') return '';
        return property.title[0]?.plain_text || 'Untitled';
      },
      // Transform status properties
      status: (property, allProperties) => {
        if (property.type !== 'status') return '';
        return property.status?.name || '';
      },
    },
  },
});
```

Each transform function:

- Receives the specific property and all properties as arguments
- Should handle type checking and null cases
- Returns the transformed value for the frontmatter

## Basic Examples

Simple frontmatter configuration:

```typescript
const renderer = new MDXRenderer({
  frontmatter: {
    transform: {
      // Basic property transformations
      title: (property) => {
        if (property.type !== 'title') return '';
        return property.title[0]?.plain_text || 'Untitled';
      },
      date: (property) => {
        if (property.type !== 'date' || !property.date?.start) return '';
        return property.date.start;
      },
      tags: (property) => {
        if (property.type !== 'multi_select') return [];
        return property.multi_select.map((tag) => tag.name);
      },
      draft: (property) => {
        if (property.type !== 'status') return true;
        return property.status?.name !== 'Published';
      },
    },
  },
});
```
