---
title: "How to handle blocks with children"
description: "Guide on how to handle blocks with children and nested blocks"
weight: 2
---

Some Notion blocks like lists, callouts,toggles etc can contain nested content. Here's how to handle them effectively in your transformers.

## Basic Structure

A block transformer receives the full block context, including any children:

```typescript
interface Block {
  children?: Block[];  // Array of child blocks
  // ... other block properties
}
```

## Simple Example: Nested Lists

Here's a basic example of handling a bulleted list with nested items:

```typescript
const bulletedListTransformer = {
  transform: async ({ block, utils, metadata = {} }) => {
    // Get current nesting level from metadata (defaults to 0)
    const level = metadata.listLevel || 0;
    const indent = '  '.repeat(level);

    // Process this item's text
    const text = await utils.transformRichText(block.bulleted_list_item.rich_text);

    // If no children, return just this item
    if (!block.children?.length) {
      return `${indent}- ${text}`;
    }

    // Process children with increased nesting level
    const childContent = await Promise.all(
      block.children.map(child =>
        utils.processBlock(child, {
          ...metadata,
          listLevel: level + 1
        })
      )
    );

    // Combine item with its children
    return `${indent}- ${text}\n${childContent.join('\n')}`;
  }
};
```

## Using Metadata for Context

The metadata object in the context helps pass information down the transformation chain:

```typescript
const numberListTransformer = {
  transform: async ({ block, utils, metadata = {} }) => {
    // Track nesting level
    const level = metadata.listLevel || 0;

    // Track item number within current level
    const number = metadata.currentNumber || 1;

    // Process children with updated metadata
    const children = await Promise.all(
      block.children.map((child, index) =>
        utils.processBlock(child, {
          ...metadata,
          listLevel: level + 1,
          currentNumber: index + 1  // Number for each child
        })
      )
    );

    // ... rest of the transformation
  }
};
```

## Common Use Cases

### Toggle Blocks
```typescript
const toggleTransformer = {
  transform: async ({ block, utils }) => {
    const text = await utils.transformRichText(block.toggle.rich_text);

    // Process child content if present
    const childContent = block.children?.length
      ? await Promise.all(
          block.children.map(child => utils.processBlock(child))
        )
      : [];

    return `<details>
  <summary>${text}</summary>
  ${childContent.join('\n')}
</details>`;
  }
};
```

### Callouts with Nested Content
```typescript
const calloutTransformer = {
  transform: async ({ block, utils }) => {
    const text = await utils.transformRichText(block.callout.rich_text);

    // Process children and maintain callout formatting
    const childContent = block.children?.length
      ? await Promise.all(
          block.children.map(child => utils.processBlock(child))
        ).then(content =>
          content
            .join('\n')
            .split('\n')
            .map(line => `> ${line}`)
            .join('\n')
        )
      : '';

    return `> 💡 ${text}\n${childContent}\n\n`;
  }
};
```

## Best Practices

1. **Always Check for Children**
   ```typescript
   if (!block.children?.length) {
     // consider using the utility functions
     return simpleTransform();
   }
   ```

2. **Preserve Context**
   ```typescript
   const childMetadata = {
     ...metadata,           // Keep existing metadata
     listLevel: level + 1,  // Add/update needed values
   };
   ```

3. **Handle Formatting**
   - Consider how nested content affects spacing
   - Maintain consistent indentation
   - Preserve block-specific formatting
