import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  ProcessorChainNode,
  ChainData,
  BlockType,
  ListBlockChildrenResponseResult,
  ListBlockChildrenResponseResults,
  PageProperties,
  AnnotationTransformer,
  BlockTransformer,
  ContextMetadata,
  VariableResolver,
  RendererContext,
  VariableCollector,
  VariableResolvers,
} from '../../types';

/**
 * Base class for renderer plugins that handles the core rendering logic
 * while providing a flexible API for creating custom renderers.
 */
abstract class BaseRendererPlugin implements ProcessorChainNode {
  next?: ProcessorChainNode;

  // Core template that defines document structure
  protected abstract template: string;

  // Registry for block transformers
  protected blockTransformers: Partial<Record<BlockType, BlockTransformer>> =
    {};

  // Internal state
  private variableDataCollector: VariableCollector = new Map();
  private variableResolvers: VariableResolvers = new Map();

  // Protected context available to child classes
  protected context: RendererContext;

  constructor() {
    // Initialize context with default values
    this.context = {
      pageId: '',
      pageProperties: {},
      metadata: new Map(),
      block: {} as ListBlockChildrenResponseResult,
      blockTree: [],
      variableData: this.variableDataCollector,
      transformers: {
        blocks: {} as Record<BlockType, BlockTransformer>,
        annotations: this.defaultAnnotationTransformers,
      },
      utils: {
        processRichText: this.processRichText.bind(this),
        processChildren: this.processChildren.bind(this),
      },
    };

    // Initialize variable collectors from template
    this.initializeVariables();
  }

  /**
   * Allows plugins to add custom metadata that will be available
   * throughout the rendering process
   */
  public addMetadata(key: string, value: any): this {
    this.context.metadata.set(key, value);
    return this;
  }

  /**
   * Adds a new variable to the renderer with an optional resolver
   */
  public addVariable(name: string, resolver?: VariableResolver): this {
    // Create collector for this variable
    this.variableDataCollector.set(name, []);

    // Register resolver if provided
    if (resolver) {
      this.variableResolvers.set(name, resolver);
    }

    return this;
  }

  /**
   * Updates the template while validating variable usage
   */
  public setTemplate(template: string): this {
    this.validateTemplate(template);
    this.template = template;
    this.initializeVariables();
    return this;
  }

  /**
   * Allows customization of block transformers
   */
  public customizeBlock(
    type: BlockType,
    transformer: Partial<BlockTransformer>,
  ): this {
    const existing = this.blockTransformers[type] || {
      transform: async () => '',
      imports: [],
    };

    this.blockTransformers[type] = {
      ...existing,
      ...transformer,
      imports: [...(existing.imports || []), ...(transformer.imports || [])],
    };

    return this;
  }

  /**
   * Main processing method that orchestrates the rendering pipeline
   */
  public async process(data: ChainData): Promise<ChainData> {
    try {
      // Update context with new data
      this.updateContext(data);

      // Reset collectors
      this.resetCollectors();

      // Process all blocks
      for (const block of data.blockTree.blocks) {
        await this.processBlock(block);
      }

      // Resolve variables and render template
      const content = await this.renderTemplate();

      return {
        ...data,
        content,
      };
    } catch (error) {
      throw new Error(
        `Renderer failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Protected utility methods available to child classes

  /**
   * Processes rich text with annotations
   */
  protected async processRichText(
    richText: RichTextItemResponse[],
    metadata?: ContextMetadata,
  ): Promise<string> {
    const results = await Promise.all(
      richText.map(async (item) => {
        let text = item.plain_text;

        // Apply annotations
        for (const [name, value] of Object.entries(item.annotations)) {
          if (value && this.defaultAnnotationTransformers[name]) {
            // Pass the complete annotations object rather than just the value
            text = await this.defaultAnnotationTransformers[name].transform({
              text,
              annotations: item.annotations, // Pass the complete annotations object
              metadata,
            });
          }
        }

        return text;
      }),
    );

    return results.join('');
  }

  /**
   * Processes child blocks recursively
   */
  protected async processChildren(
    blocks: ListBlockChildrenResponseResults,
    metadata?: ContextMetadata,
  ): Promise<string> {
    const results = await Promise.all(
      blocks.map((block) => this.processBlock(block, metadata)),
    );

    return results.filter(Boolean).join('\n');
  }

  // Private implementation details

  private defaultAnnotationTransformers: Record<string, AnnotationTransformer> =
    {
      bold: { transform: async ({ text }) => `**${text}**` },
      italic: { transform: async ({ text }) => `*${text}*` },
      code: { transform: async ({ text }) => `\`${text}\`` },
    };

  private async processBlock(
    block: ListBlockChildrenResponseResult,
    metadata?: ContextMetadata,
  ): Promise<string> {
    // @ts-ignore
    const transformer = this.blockTransformers[block.type];
    if (!transformer) return '';

    try {
      const output = await transformer.transform({
        ...this.context,
        block,
        metadata: {
          ...this.context.metadata,
          ...metadata,
        },
      });

      // Add to appropriate collector
      const target = transformer.targetVariable || 'content';
      this.addToCollector(target, output);

      return output;
    } catch (error) {
      throw new Error(
        `Failed to process block: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private addToCollector(variable: string, content: string): void {
    const collector = this.variableDataCollector.get(variable);
    if (collector) {
      collector.push(content);
    }
  }

  private async renderTemplate(): Promise<string> {
    const resolvedVariables: Record<string, string> = {};

    for (const [name, collector] of this.variableDataCollector.entries()) {
      const resolver = this.variableResolvers.get(name) || this.defaultResolver;
      resolvedVariables[name] = await resolver(name, {
        ...this.context,
      });
    }

    return this.template.replace(
      /{{{(\w+)}}}/g,
      (_, name) => resolvedVariables[name] || '',
    );
  }

  private defaultResolver: VariableResolver = async (variableName, context) => {
    const collected = context.variableData.get(variableName) || [];
    return collected.join('\n');
  };

  private initializeVariables(): void {
    // Extract variables from template
    const variables = this.template.match(/{{{(\w+)}}}/g) || [];

    // Initialize collectors for each variable
    variables.forEach((variable) => {
      const name = variable.replace(/{{{|}}}/, '');
      if (!this.variableDataCollector.has(name)) {
        this.variableDataCollector.set(name, []);
      }
    });
  }

  private validateTemplate(template: string): void {
    // Ensure required variables exist
    const required = ['content'];
    required.forEach((name) => {
      if (!template.includes(`{{{${name}}}}`)) {
        throw new Error(`Template must contain ${name} variable`);
      }
    });
  }

  private resetCollectors(): void {
    // Reset all collectors to empty arrays
    for (const [name] of this.variableDataCollector) {
      this.variableDataCollector.set(name, []);
    }
  }

  private updateContext(data: ChainData): void {
    this.context = {
      ...this.context,
      pageId: data.pageId,
      pageProperties: data.blockTree.properties,
      blockTree: data.blockTree.blocks,
      metadata: {
        ...this.context.metadata,
        ...data.metadata,
      },
    };
  }
}
