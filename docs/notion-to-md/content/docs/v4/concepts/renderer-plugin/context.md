---
title: "Context"
description: "Overview of the context object and its properties in renderer plugin"
weight: 1
---

Renderer plugins use context objects to access data and utilities during the transformation process. There are two main types of context:

## Renderer Context

The primary context object available throughout the rendering process that provides:

```typescript
interface RendererContext {
  // Basic page info
  pageId: string;
  pageProperties: PageProperties;

  // Custom metadata and collected data
  metadata: Record<string, any>;
  variableData: VariableCollector; // all variables and their collected data

  // Current block and all blocks
  block: Block;
  blockTree: Block[];

  // Available transformers
  // yes you can access the transformers and perform certain transformations on the fly
  transformers: {
    blocks: Record<BlockType, BlockTransformer>;
    annotations: Record<string, AnnotationTransformer>;
  };

  // Utility functions
  utils: {
    processRichText: (richText: RichText[], metadata?: any) => Promise<string>;
    processBlock: (block: Block, metadata?: any) => Promise<string>;
  };
}
```

This context is available in:
- Block transformers
- Variable resolvers
- Throughout the rendering process

## Annotation Context

A simpler context object specifically for text formatting:

```typescript
interface AnnotationContext {
  text: string;                 // The text being formatted
  annotations?: RichTextAnnotation;    // This is from the notion API
  link?: { url: string };      // For linked text
  metadata?: Record<string, any>; // Additional info
}
```

This context is used by:
- Annotation transformers
- Rich text processing

## Usage Example

```typescript
// Using renderer context in a block transformer
const codeTransformer = {
  transform: async (context: RendererContext) => {
    const { block, utils, metadata } = context;
    const code = await utils.processRichText(block.code.rich_text);
    return `<CodeBlock lang="${block.code.language}">${code}</CodeBlock>`;
  }
};

// Using annotation context
const boldTransformer = {
  transform: async (context: AnnotationContext) => {
    const { text, metadata } = context;
    return metadata?.html ? `<strong>${text}</strong>` : `**${text}**`;
  }
};
```

The context system provides a clean way to:
- Access necessary data during transformation
- Share state between components
- Provide utility functions
- Pass custom metadata through the rendering pipeline
