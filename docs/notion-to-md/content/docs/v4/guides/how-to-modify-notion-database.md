---
title: 'How to Modify Notion Database Rendering'
description: 'Learn how to customize the appearance and behavior of Notion Databases in your output'
weight: 5
tags:
  - guide
  - database
  - properties
  - transformer
  - notion-to-md
---

When working with Notion databases in `notion-to-md`, you have complete control over how databases and their properties are rendered. This guide will walk you through the process, from understanding the default behavior to creating sophisticated custom transformers.

## Default Behavior

By default, Notion databases are rendered as markdown tables with their properties as columns. Here's what happens without any customization:

```typescript
import { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionConverter(notion);

// This will render the database as a markdown table
await n2m.convert('your-database-id');
```

Output example:

```markdown
| Name   | Status      | Priority | Due Date   |
| ------ | ----------- | -------- | ---------- |
| Task 1 | In Progress | High     | 2025-04-01 |
| Task 2 | Done        | Medium   | 2025-03-28 |
```

## Filtering and Sorting Database Content

Before rendering, you can control which database records to include using Notion's filtering and sorting capabilities. This is particularly useful when you want to:

- Only show published content
- Filter by specific categories or tags
- Sort by date or priority
- Limit the number of records

Everything Notion database queries can do.

Here's how to configure database queries:

```typescript
const n2m = new NotionConverter(notion).configureDatabase({
  databaseQueries: {
    'your-database-id': {
      // Filter to only show published posts
      filter: {
        property: 'Status',
        select: {
          equals: 'Published',
        },
      },
      // Sort by publish date, most recent first
      sorts: [
        {
          property: 'PublishDate',
          direction: 'descending',
        },
      ],
    },
  },
});

// Now when you convert, it will only include filtered and sorted content
await n2m.convert('your-page-id');
```

You can use complex filters for more specific queries:

```typescript
const n2m = new NotionConverter(notion).configureDatabase({
  databaseQueries: {
    'your-database-id': {
      filter: {
        and: [
          {
            property: 'Status',
            select: {
              equals: 'Published',
            },
          },
          {
            property: 'Category',
            multi_select: {
              contains: 'Tutorial',
            },
          },
          {
            property: 'PublishDate',
            date: {
              on_or_before: new Date().toISOString(),
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Priority',
          direction: 'ascending',
        },
      ],
    },
  },
});
```

The query syntax follows the [Notion API's database query specification](https://developers.notion.com/reference/post-database-query).

## Understanding Database Structure

Before customizing, it's important to understand how Notion databases are structured:

1. **Database Properties**: Column definitions (e.g., title, status, date)
2. **Database Rows**: Individual entries with property values
3. **Property Types**: Different data types (text, select, multi-select, etc.)

## Customizing Property Rendering

You can customize how individual properties are rendered using `createPropertyTransformer`. Property transformers can also specify imports that will be automatically added to your output:

```typescript
import { MDXRenderer } from 'notion-to-md/plugins/renderer';

const renderer = new MDXRenderer();

// Customize how Status property is rendered
renderer.createPropertyTransformer('status', {
  transform: ({ property }) => {
    // TypeScript knows property.status exists
    const status = property.status;
    if (!status) return '';

    return `<StatusBadge status="${status.name}" />`;
  },
  // These imports will be automatically added when this transformer is used
  imports: [`import { StatusBadge } from '@/components/StatusBadge';`],
});

// Customize how Tags property is rendered
renderer.createPropertyTransformer('multi_select', {
  transform: ({ property }) => {
    // TypeScript knows property.multi_select exists
    return property.multi_select
      .map((tag) => `<Badge color="${tag.color}">${tag.name}</Badge>`)
      .join(' ');
  },
  // Multiple imports are supported
  imports: [
    `import { Badge } from '@/components/Badge';`,
    `import '@/styles/badges.css';`,
  ],
});

// Customize how People property is rendered
renderer.createPropertyTransformer('people', {
  transform: ({ property }) => {
    // TypeScript knows property.people exists
    return property.people
      .map(
        (person) =>
          `<Avatar name="${person.name}" src="${person.avatar_url}" />`,
      )
      .join(' ');
  },
  imports: [`import { Avatar } from '@/components/Avatar';`],
});
```

Imports defined within your property transformers are automatically collected and added to the beginning of the output file. This is especially useful when working with component-based frameworks like Astro, React, or Next.js, as it ensures all necessary dependencies are readily available.

## Customizing Overall Database Layout

You can completely change how the child database is rendered by creating a [custom block transformer](../../concepts/renderer-plugin/block-transformer/) for the database block just like you do for any other block:

```typescript
renderer.createBlockTransformer('child_database', {
  transform: async ({ block, utils, manifest }) => {
    const rows = await utils.getDatabaseRows(block.id);

    // Create a custom card-based layout
    return `
<div class="task-board">
  ${rows
    .map((row) => {
      const title = utils.getPropertyValue(row, 'Name');
      const status = utils.getPropertyValue(row, 'Status');
      const priority = utils.getPropertyValue(row, 'Priority');

      return `
  <div class="task-card ${status.toLowerCase()}">
    <h3>${title}</h3>
    <div class="meta">
      <span class="status">${status}</span>
      <span class="priority">${priority}</span>
    </div>
  </div>
    `;
    })
    .join('\n')}
</div>
    `;
  },

  imports: [`import { TaskBoard } from '@/components/TaskBoard';`],
});
```
