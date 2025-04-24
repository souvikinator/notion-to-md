---
title: "Plugin System"
description: "Understanding the extensible plugin architecture in notion-to-md v4"
weight: 4
draft: true
---

notion-to-md v4 introduces a powerful and flexible plugin architecture that allows you to customize every aspect of the conversion process. This system enables you to adapt the library to your specific needs without modifying its core functionality.

## Plugin System Overview

The plugin system in notion-to-md v4 is built around a processor chain pattern, where each specialized component handles a specific aspect of the conversion process while maintaining a consistent data flow.

### Key Benefits

- **Separation of Concerns** - Each plugin has a clear, single responsibility
- **Extensibility** - Add custom behavior without modifying the core library
- **Composability** - Mix and match plugins to create your ideal conversion pipeline
- **Type Safety** - TypeScript interfaces ensure plugin compatibility
- **Predictable Data Flow** - Standardized input and output for each plugin

## Types of Plugins

notion-to-md v4 supports two primary plugin types:

### 1. Renderer Plugins

Renderer plugins determine how Notion blocks are transformed into your target format. They control:

- The output format (Markdown, HTML, JSX, etc.)
- Block transformation logic
- Text annotation processing
- Document structure and organization

**Example Use Cases:**
- Generating clean Markdown for documentation
- Creating React components from Notion content
- Producing LaTeX documents
- Generating terminal-friendly output

### 2. Exporter Plugins

Exporter plugins determine where and how the converted content is saved or used. They control:

- The destination of the converted content
- File naming and organization
- Additional processing or validation
- Integration with external systems

**Example Use Cases:**
- Saving files to a filesystem
- Publishing content to a CMS
- Storing content in a database
- Sending content via API

## Plugin Integration

Plugins are integrated into notion-to-md through a processor chain architecture, ensuring consistent data flow throughout the conversion process.


### Processor Chain Pattern

The conversion process follows this sequence:

1. **Block Fetcher** - Retrieves content from Notion API
2. **Media Handler** (optional) - Processes images and files
3. **Page Reference Handler** (optional) - Processes links between pages
4. **Renderer Plugin** - Transforms blocks into target format
5. **Exporter Plugin** - Handles the converted output

Each processor:
1. Receives input data from the previous processor
2. Performs its specific processing task
3. Passes enriched data to the next processor in the chain

### Chain Data Structure

All processors in the chain work with a unified data structure:

```typescript
interface ChainData {
  pageId: string;                 // The Notion page ID
  blockTree: ExtendedFetcherOutput; // Raw block data from Notion
  metadata?: Record<string, any>; // Additional processing metadata
  content: string;                // The converted content (added by renderer)
}
```

This structure ensures each plugin has access to both the original data and any enrichments added by previous processors.

## Plugin Lifecycle

Understanding the lifecycle of plugins helps you integrate custom plugins effectively.

### Registration

Plugins are registered using builder methods on the `NotionConverter` class:

```javascript
const n2m = new NotionConverter(notionClient)
  .withRenderer(customRenderer)     // Register a renderer plugin
  .withExporter(customExporter);    // Register an exporter plugin
```

### Initialization

When the conversion process begins:

1. The processor chain is assembled based on registered plugins
2. Each plugin is initialized with its configuration
3. Resource dependencies (manifest managers, etc.) are assigned

### Execution

During conversion:

1. The `convert()` method starts the processing chain
2. Each plugin receives the `ChainData` object from the previous processor
3. Each plugin processes the data according to its responsibility
4. The enriched `ChainData` is passed to the next plugin

## Interfaces and Extension Points

notion-to-md v4 provides clear interfaces for creating custom plugins.

{{< cards >}}
  {{< card link="../renderer-plugin" title="Renderer plugin" icon="document" >}}
  {{< card link="../exporter-plugin" title="Exporter plugin" icon="export" >}}
{{< /cards >}}
