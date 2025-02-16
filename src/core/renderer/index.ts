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
 * Interface for renderer plugins in the Notion-to-MD system.
 * Provides core framework for transforming Notion blocks into any desired output format.
 */
export abstract class BaseRendererPlugin implements ProcessorChainNode {
  next?: ProcessorChainNode;

  /**
   * Defines the document structure using variables in {{{variableName}}} format.
   * Must include at least 'content' and 'imports' variables.
   */
  protected template: string = `{{{imports}}}\n{{{content}}}`;

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
      metadata: {},
      block: {} as ListBlockChildrenResponseResult,
      blockTree: [],
      variableData: this.variableDataCollector,
      transformers: {
        blocks: {} as Record<BlockType, BlockTransformer>,
        annotations: {} as Record<string, AnnotationTransformer>,
      },
      utils: {
        processRichText: this.processRichText.bind(this),
        processChildren: this.processChildren.bind(this),
      },
    };

    // Initialize required variables
    this.initializeDefaultVariables();

    // Initialize additional variables from template
    this.validateAndInitializeTemplate();
  }

  private validateAndInitializeTemplate(): void {
    // First validate the template exists
    if (!this.template) {
      throw new Error('Template must be defined');
    }

    // Reuse existing validation method
    this.validateTemplate(this.template);

    // Initialize default variables first - these are required
    this.initializeDefaultVariables();

    // Then initialize template-specific variables
    this.initializeTemplateVariables();
  }

  /**
   * Adds custom metadata that will be available throughout rendering
   */
  public addMetadata(key: string, value: any): this {
    this.context.metadata[key] = value;
    return this;
  }

  /**
   * Adds a new variable with an optional custom resolver
   */
  public addVariable(name: string, resolver?: VariableResolver): this {
    // Create collector if it doesn't exist
    if (!this.variableDataCollector.has(name)) {
      this.variableDataCollector.set(name, []);
    }

    // Register resolver if provided
    if (resolver) {
      this.variableResolvers.set(name, resolver);
    }

    return this;
  }

  /**
   * Adds imports that will be collected in the imports variable
   */
  public addImports(...imports: string[]): this {
    const importCollector = this.variableDataCollector.get('imports') || [];
    imports.forEach((imp) => {
      if (!importCollector.includes(imp)) {
        importCollector.push(imp);
      }
    });
    this.variableDataCollector.set('imports', importCollector);
    return this;
  }

  /**
   * Updates template while ensuring required variables exist
   */
  public setTemplate(template: string): this {
    this.validateTemplate(template);
    this.template = template;
    this.initializeTemplateVariables();
    return this;
  }

  /**
   * Creates a single block transformer with proper type inference.
   * Note: Block level imports are stored with the transformer, not added to import variable immediately.
   * Only added when the transformer is actually used.
   */
  public createBlockTransformer<T extends BlockType>(
    type: T,
    transformer: BlockTransformer,
  ): this {
    this.context.transformers.blocks[type] = transformer;
    return this;
  }

  /**
   * Creates multiple block transformers at once
   */
  public createBlockTransformers(
    transformers: Partial<Record<BlockType, BlockTransformer>>,
  ): this {
    for (const [type, transformer] of Object.entries(transformers)) {
      if (transformer) {
        this.createBlockTransformer(type as BlockType, transformer);
      }
    }
    return this;
  }

  /**
   * Creates a single annotation transformer with proper type inference.
   */
  public createAnnotationTransformer(
    name: string,
    transformer: AnnotationTransformer,
  ): this {
    this.context.transformers.annotations[name] = transformer;
    return this;
  }

  /**
   * Creates multiple annotation transformers simultaneously.
   */
  public createAnnotationTransformers(
    transformers: Record<string, AnnotationTransformer>,
  ): this {
    Object.entries(transformers).forEach(([name, transformer]) => {
      this.createAnnotationTransformer(name, transformer);
    });
    return this;
  }

  /**
   * Main processing method that orchestrates the rendering pipeline
   */
  public async process(data: ChainData): Promise<ChainData> {
    try {
      this.updateContext(data);
      this.resetCollectors();

      // Process all blocks
      for (const block of data.blockTree.blocks) {
        await this.processBlock(block);
      }

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

  /**
   * Core processing function that processes Notion rich text content.
   * Applies registered annotation transformers in order.
   */
  protected async processRichText(
    richText: RichTextItemResponse[],
    metadata?: ContextMetadata,
  ): Promise<string> {
    const results = await Promise.all(
      richText.map(async (item) => {
        let text = item.plain_text;

        // Process each annotation that has a registered transformer
        for (const [name, value] of Object.entries(item.annotations)) {
          if (value && this.context.transformers.annotations[name]) {
            text = await this.context.transformers.annotations[name].transform({
              text,
              annotations: item.annotations,
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
   * Processes a block's child blocks recursively.
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

  /**
   * Processes an individual block using registered transformers.
   * Handles import collection and variable targeting.
   */
  protected async processBlock(
    block: ListBlockChildrenResponseResult,
    metadata?: ContextMetadata,
  ): Promise<string> {
    // @ts-ignore
    const transformer = this.context.transformers.blocks[block.type];
    if (!transformer) return '';

    try {
      // Create context for this block transformation
      const blockContext: RendererContext = {
        ...this.context,
        block,
        metadata: {
          ...this.context.metadata,
          ...metadata,
        },
      };

      // Process the block
      const output = await transformer.transform(blockContext);

      // Add imports only when this transformer is actually used
      if (transformer.imports?.length) {
        this.addImports(...transformer.imports);
      }

      // Handle target variable - default to 'content' if not specified
      const targetVariable = transformer.targetVariable || 'content';

      // Ensure target variable exists in collector
      if (!this.variableDataCollector.has(targetVariable)) {
        this.addVariable(targetVariable);
      }

      // Add output to appropriate variable collector
      this.addToCollector(targetVariable, output);

      return output;
    } catch (error) {
      throw new Error(
        `Failed to process block: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Initializes the required 'content' and 'imports' variables.
   * Sets up default resolver for 'imports' variable.
   */
  private initializeDefaultVariables(): void {
    // Initialize required variables with default resolvers
    this.addVariable('imports', this.defaultResolver);
    this.addVariable('content', this.defaultResolver);
  }

  /**
   * Default resolver for variables without custom resolvers.
   * Joins collected content with newlines.
   */
  private defaultResolver: VariableResolver = async (variableName, context) => {
    const collected = context.variableData.get(variableName) || [];
    return collected.join('\n');
  };

  private initializeTemplateVariables(): void {
    const variables = this.template.match(/{{{(\w+)}}}/g) || [];
    variables.forEach((variable) => {
      const name = variable.replace(/{{{|}}}/, '');
      this.addVariable(name);
    });
  }

  private validateTemplate(template: string): void {
    const required = ['content', 'imports'];
    required.forEach((name) => {
      if (!template.includes(`{{{${name}}}}`)) {
        throw new Error(`Template must contain ${name} variable`);
      }
    });
  }

  /**
   * Adds content to a variable's collector, creating it if needed.
   */
  private addToCollector(variable: string, content: string): void {
    // Ensure the collector exists
    if (!this.variableDataCollector.has(variable)) {
      this.variableDataCollector.set(variable, []);
    }

    // Add content to collector
    const collector = this.variableDataCollector.get(variable)!;
    collector.push(content);
  }

  /**
   * Resolves variables using their registered resolvers or default resolver.
   * Replaces {{{variableName}}} in template with resolved content.
   */
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

  /**
   * Resets all variable collectors while preserving imports.
   * Called at the start of each processing cycle.
   */
  private resetCollectors(): void {
    // Preserve imports when resetting collectors
    const imports = this.variableDataCollector.get('imports') || [];

    // Reset all collectors
    for (const [name] of this.variableDataCollector) {
      this.variableDataCollector.set(name, name === 'imports' ? imports : []);
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
