---
title: Renderer Plugins
cascade:
  type: docs
---

Renderer plugins form the heart of notion-to-md v4's transformation system. They determine how Notion blocks are converted into your desired output format, whether that's Markdown, HTML, JSX, or any other text-based format.

This guide is a must read for anyone looking to customize existing plugins or create new ones from scratch.

## Core Components

{{< cards >}}
{{< card link="./variables-and-templates" title="Variables and Templates" icon="variables-icon" >}}
{{< card link="./block-transformer" title="Block Transformers" icon="block-transformers-icon" >}}
{{< card link="./annotation-transformer" title="Annotation Transformers" icon="annotation-transformers-icon" >}}
{{< /cards >}}

Every renderer plugin consists of four essential components:

```mermaid
graph TD
    A[Template] --> E[Renderer Plugin]
    B[Variables] --> E
    C[Block Transformers] --> E
    D[Annotation Transformers] --> E
    E --> F[Final Output]

    style A fill:#e6fffa,stroke:#319795,color:#000000
    style B fill:#ebf8ff,stroke:#3182ce,color:#000000
    style C fill:#fefcbf,stroke:#d69e2e,color:#000000
    style D fill:#fed7d7,stroke:#e53e3e,color:#000000
    style E fill:#f0f4f8,stroke:#4a5568,color:#000000
```

## Renderer Lifecycle and Flow

The rendering process follows a specific flow:

```mermaid
flowchart TD
    A[Receive Block Data] --> B[Process Blocks]
    B --> C{Process Each Block}
    C --> D[Apply Block Transformer]
    D --> E[Process Rich Text]
    E --> F[Apply Annotation Transformers]
    F --> G[Collect Transformed Content]
    G --> H[Resolve Variables]
    H --> I[Apply Template]
    I --> J[Return Final Output]

    style A fill:#e6fffa,stroke:#319795,color:#000000
    style J fill:#e6fffa,stroke:#319795,color:#000000
    style D fill:#fefcbf,stroke:#d69e2e,color:#000000
    style F fill:#fed7d7,stroke:#e53e3e,color:#000000
    style H fill:#ebf8ff,stroke:#3182ce,color:#000000
    style I fill:#ebf8ff,stroke:#3182ce,color:#000000
```

1. **Initialization**: The renderer receives block data from the processor chain
2. **Block Processing**: Each block is processed according to its type
   - The appropriate block transformer is applied
   - Rich text within the block is processed
   - Annotation transformers are applied to format text
3. **Content Collection**: Transformed blocks are collected
4. **Variable Resolution**: Template variables are resolved
5. **Template Application**: The template is populated with variable content
6. **Output**: The final formatted content is returned

## Core Architecture

Renderer plugins are built on the `BaseRendererPlugin` abstract class, which implements the `ProcessorChainNode` interface:

```mermaid
classDiagram
    class ProcessorChainNode {
        <<interface>>
        +process(data: ChainData): Promise~ChainData~
    }

    class BaseRendererPlugin {
        #template: string
        #variables: Record~string, VariableResolver~
        #blockTransformers: Record~string, BlockTransformer~
        #annotationTransformers: Record~string, AnnotationTransformer~
        +process(data: ChainData): Promise~ChainData~
        #processBlock(block: Block): Promise~string~
        #transformRichText(richText: RichText[]): Promise~string~
    }

    class MDXRenderer {
        #template: string
        #variables: Record~string, VariableResolver~
        #blockTransformers: Record~string, BlockTransformer~
        #annotationTransformers: Record~string, AnnotationTransformer~
    }

    class HTMLRenderer {
        #template: string
        #variables: Record~string, VariableResolver~
        #blockTransformers: Record~string, BlockTransformer~
        #annotationTransformers: Record~string, AnnotationTransformer~
    }

    ProcessorChainNode <|.. BaseRendererPlugin : implements
    BaseRendererPlugin <|-- MDXRenderer : extends
    BaseRendererPlugin <|-- HTMLRenderer : extends
```

This architecture provides a consistent interface while allowing for complete customization of the rendering process.

## Data Context

Throughout the rendering process, components have access to a comprehensive [context object](context):

```typescript
interface RendererContext {
  pageId: string; // The Notion page ID
  pageProperties: PageProperties; // Notion page properties
  metadata: ContextMetadata; // Additional metadata
  block: Block; // Current block (during transforms)
  blockTree: Block[]; // All blocks
  variableData: VariableCollector; // Collected variable data
  transformers: {
    blocks: Record<BlockType, BlockTransformer>;
    annotations: Record<AnnotationType, AnnotationTransformer>;
  };
  utils: {
    transformRichText: (richText: RichText[]) => Promise<string>;
    processBlock: (block: Block) => Promise<string>;
  };
}
```

This context provides access to everything needed for sophisticated rendering decisions, from page metadata to utility functions.

## Default Renderer

notion-to-md v4 comes with a default MD/MDX renderer, which serves as both a useful default and an example implementation:

{{< callout type="info" >}}
For detailed view at the implementation, please refer the [default renderer notion-to-md ships](https://github.com/souvikinator/notion-to-md/tree/v4.0.0-alpha/src/plugins/renderer/mdx) with, as it's a good reference for creating your own renderer.
{{< /callout >}}

```javascript
// Default MDX renderer (simplified)
class MDXRenderer extends BaseRendererPlugin {
  protected template = `{{{frontmatter}}}{{{imports}}}{{{content}}}`;

  // Default variables for frontmatter, imports, and content
  protected variables = { /* ... */ };

  // Transformers for Markdown formatting
  protected blockTransformers = { /* ... */ };
  protected annotationTransformers = { /* ... */ };
}
```

Using a renderer is straightforward:

```javascript
// Using the default renderer
const n2m = new NotionConverter(notionClient);

// Using a custom renderer
const htmlRenderer = new HTMLRenderer();
const n2m = new NotionConverter(notionClient).withRenderer(htmlRenderer);
```
