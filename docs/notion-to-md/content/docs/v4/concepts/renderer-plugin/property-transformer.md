---
title: 'Database Property Transformers'
description: 'Understanding property transformers and how they modify Notion database properties'
weight: 4
---

Property transformers allow you to customize how individual Notion database properties are rendered. Each transformer focuses on a specific property type and can modify its output format, appearance, and behavior.

For a practical guide on using property transformers, see the [How to Modify Notion Database Rendering](../../../guides/how-to-modify-notion-database) guide.

## Basic Structure

A property transformer consists of:

- A required `transform` function that converts the property value
- Optional `imports` array for required imports

The transformer works in conjunction with [block transformers](../block-transformer) and has access to the same [context utilities](../context) for advanced transformations.

## Basic Examples

Simple transformers for common property types:

```typescript
import { MDXRenderer } from 'notion-to-md/plugins/renderer';

const renderer = new MDXRenderer();

renderer.createPropertyTransformer('select', {
  transform: ({ property }) => {
    return property.select?.name || '';
  },
});

renderer.createPropertyTransformer('multi_select', {
  transform: ({ property }) => {
    // No type guard needed - TypeScript knows property.multi_select exists
    return property.multi_select
      .map((tag) => `<Badge color="${tag.color}">${tag.name}</Badge>`)
      .join(' ');
  },
  imports: [`import { Badge } from '@/components/Badge';`],
});
```

## Integration with Block Transformers

Property transformers can be used within database block transformers. For more details on block transformers, see the [Block Transformers](../block-transformer) documentation.

```typescript
renderer.createBlockTransformer('child_database', {
  transform: async ({ block, utils }) => {
    const rows = await utils.getDatabaseRows(block.id);

    return `
      <DataGrid>
        ${rows
          .map(
            (row) => `
          <DataRow>
            ${Object.entries(row.properties)
              .map(
                ([key, value]) => `
              <DataCell>
                ${utils.transformProperty(key, value)}
              </DataCell>
            `,
              )
              .join('')}
          </DataRow>
        `,
          )
          .join('')}
      </DataGrid>
    `;
  },
  imports: [
    `import { DataGrid, DataRow, DataCell } from '@/components/DataGrid';`,
  ],
});
```

### How Property Transformation Works

When you use `utils.transformProperty(key, value)` in your code, here's what happens internally:

1. The renderer looks up the registered transformer for the property type
2. If a transformer is found, ituses that transformer
3. If no transformer is found, it falls back to a default string representation

This process ensures that each property is consistently transformed and any required imports are properly tracked.
