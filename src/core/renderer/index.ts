import { ProcessorChainNode, ChainData } from '../../types/module';
import {
  NotionAnnotationType,
  NotionBlock,
  NotionBlockType,
  NotionDatabaseEntryProperties,
  NotionDatabasePropertyType,
  NotionRichTextItem,
} from '../../types/notion';
import {
  VariableCollector,
  VariableResolvers,
  RendererContext,
  BlockTransformer,
  AnnotationTransformer,
  VariableResolver,
  ContextMetadata,
  DatabasePropertyTransformer,
} from '../../types/renderer';

/**
 * Interface for renderer plugins in the Notion-to-MD system.
 * Provides core framework for transforming Notion blocks into any desired output format.
 */
export abstract class BaseRendererPlugin implements ProcessorChainNode {
  next?: ProcessorChainNode;

  // Class-level constants for required variables
  private static readonly DEFAULT_VARIABLES = ['content', 'imports'] as const;

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
      block: {} as NotionBlock,
      blockTree: [],
      variableData: this.variableDataCollector,
      transformers: {
        blocks: {} as Record<NotionBlockType, BlockTransformer>,
        annotations: {} as Record<NotionAnnotationType, AnnotationTransformer>,
        properties: {} as Record<
          NotionDatabasePropertyType,
          DatabasePropertyTransformer
        >,
      },
      utils: {
        transformRichText: this.transformRichText.bind(this),
        processBlock: this.processBlock.bind(this),
        transformDatabaseProperties:
          this.transformDatabaseProperties.bind(this),
      },
      manifest: {},
    };
    console.debug('[BaseRendererPlugin] Context initialized');

    // Initialize required variables
    this.initializeDefaultVariables();

    // Initialize additional variables from template
    this.validateAndInitializeTemplate();
    console.debug(
      '[BaseRendererPlugin] Renderer plugin initialization complete',
    );
  }

  private validateAndInitializeTemplate(): void {
    console.debug('[BaseRendererPlugin] Validating and initializing template');

    // First validate the template exists
    if (!this.template) {
      console.debug('[BaseRendererPlugin] Template not defined');
      throw new Error('Template must be defined');
    }

    // Reuse existing validation method
    this.validateTemplate(this.template);

    // Initialize default variables first - these are required
    this.initializeDefaultVariables();

    // Then initialize template-specific variables
    this.initializeTemplateVariables();
    console.debug('[BaseRendererPlugin] Template initialization complete');
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
    console.debug(`[BaseRendererPlugin] Adding variable: ${name}`);

    // Create collector if it doesn't exist
    if (!this.variableDataCollector.has(name)) {
      this.variableDataCollector.set(name, []);
      console.debug(`[BaseRendererPlugin] Created new collector for: ${name}`);
    }

    // Register resolver if provided
    if (resolver) {
      this.variableResolvers.set(name, resolver);
      console.debug(
        `[BaseRendererPlugin] Registered custom resolver for: ${name}`,
      );
    }

    return this;
  }

  /**
   * Add utility functions to the context for usage
   */
  public addUtil<T>(name: string, util: T): this {
    this.context.utils[name] = util;
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

  public createPropertyTransformer(
    type: NotionDatabasePropertyType,
    transformer: DatabasePropertyTransformer,
  ): this {
    this.context.transformers.properties[type] = transformer;
    return this;
  }

  public createPropertyTransformers(
    transformers: Partial<
      Record<NotionDatabasePropertyType, DatabasePropertyTransformer>
    >,
  ): this {
    for (const [type, transformer] of Object.entries(transformers)) {
      if (transformer) {
        this.createPropertyTransformer(
          type as NotionDatabasePropertyType,
          transformer,
        );
      }
    }
    return this;
  }

  /**
   * Creates a single block transformer with proper type inference.
   * Note: Block level imports are stored with the transformer, not added to import variable immediately.
   * Only added when the transformer is actually used.
   */
  public createBlockTransformer<T extends NotionBlockType>(
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
    transformers: Partial<Record<NotionBlockType, BlockTransformer>>,
  ): this {
    for (const [type, transformer] of Object.entries(transformers)) {
      if (transformer) {
        this.createBlockTransformer(type as NotionBlockType, transformer);
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
    transformers: Partial<Record<NotionAnnotationType, AnnotationTransformer>>,
  ): this {
    Object.entries(transformers).forEach(([name, transformer]) => {
      if (transformer) {
        this.createAnnotationTransformer(name, transformer);
      }
    });
    return this;
  }

  /**
   * Main processing method that orchestrates the rendering pipeline
   */
  public async process(data: ChainData): Promise<ChainData> {
    console.debug('[BaseRendererPlugin] Starting rendering process', {
      pageId: data.pageId,
      blockCount: data.blockTree.blocks.length,
    });

    try {
      this.updateContext(data);
      this.resetCollectors();

      // Process all blocks
      console.debug('[BaseRendererPlugin] Processing blocks');
      for (const block of data.blockTree.blocks) {
        await this.processBlock(block);
      }

      const content = await this.renderTemplate();
      console.debug(
        '[BaseRendererPlugin] Rendering process completed successfully',
      );

      data = {
        ...data,
        content,
      };

      return this.next ? this.next.process(data) : data;
    } catch (error) {
      console.debug('[BaseRendererPlugin] Error during rendering:', error);
      throw new Error(
        `Renderer failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Core processing function that processes Notion rich text content.
   * Applies registered annotation transformers in order.
   */
  protected async transformRichText(
    richText: NotionRichTextItem[],
    metadata?: ContextMetadata,
  ): Promise<string> {
    const results = await Promise.all(
      richText.map(async (item) => {
        let text = item.plain_text;
        const link = item.href;
        // Process each annotation that has a registered transformer
        for (const [name, value] of Object.entries(item.annotations)) {
          if (value && this.context.transformers.annotations[name]) {
            text = await this.context.transformers.annotations[name].transform({
              text,
              annotations: item.annotations,
              metadata,
              manifest: this.context.manifest,
            });
          }
        }

        if (item.type === 'equation' && item.equation) {
          text = await this.context.transformers.annotations.equation.transform(
            {
              text,
              metadata,
              manifest: this.context.manifest,
            },
          );
        }

        if (link) {
          // Apply link transformation last if exists
          text = await this.context.transformers.annotations.link.transform({
            text,
            link: link ? { url: link } : undefined,
            metadata,
            manifest: this.context.manifest,
          });
        }

        return text;
      }),
    );

    return results.join('');
  }

  /**
   * Processes a single Notion block by applying the appropriate transformer and managing its content.
   *
   * This method serves as a critical junction in the rendering pipeline, handling two key responsibilities:
   * 1. Block Transformation: Converts a Notion block into the target format using registered transformers
   * 2. Content Collection: Manages how transformed content enters the final output
   *
   * The method follows an important principle about content hierarchy:
   * - Top-level blocks (those with parent.type === "page_id") are added to the variable collector
   * - Nested blocks (those with parent.type === "block_id") return their content but don't add to collector
   *
   * This design ensures that nested content (like list items within a list) can be:
   * - Transformed individually using their specific transformers
   * - Assembled into larger structures by their parent blocks
   * - Added to the final output only when the complete structure is ready
   *
   * For example, in a nested list:
   * - Child items are transformed but not collected
   * - The parent list assembles all children into the complete list structure
   * - Only the complete list is added to the collector
   */
  protected async processBlock(
    block: NotionBlock,
    metadata?: ContextMetadata,
  ): Promise<string> {
    // @ts-ignore
    const blockType = block.type;
    console.debug(
      `[BaseRendererPlugin] Processing block of type: ${blockType}`,
    );

    const transformer = this.context.transformers.blocks[blockType];
    if (!transformer) {
      console.debug(
        `[BaseRendererPlugin] No transformer found for type: ${blockType}`,
      );
      return '';
    }

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
      console.debug(
        `[BaseRendererPlugin] Successfully transformed block: ${blockType}`,
      );

      // Handle imports
      if (transformer.imports?.length) {
        console.debug(`[BaseRendererPlugin] Adding imports for ${blockType}`);
        this.addImports(...transformer.imports);
      }

      // Handle variable targeting
      const targetVariable = transformer.targetVariable || 'content';
      if (!this.variableDataCollector.has(targetVariable)) {
        console.debug(
          `[BaseRendererPlugin] Creating new collector for target: ${targetVariable}`,
        );
        this.addVariable(targetVariable);
      }

      // Only collect if this isn't a child block
      // Note: Even top-level blocks are technically children of the page
      // So we might want to handle this collection at a higher level
      // @ts-ignore
      if (block.parent.type === 'page_id') {
        this.addToCollector(targetVariable, output);
      }

      return output;
    } catch (error) {
      console.debug(
        `[BaseRendererPlugin] Error processing block ${blockType}:`,
        error,
      );
      throw new Error(
        `Failed to process block: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Takes in database properties and applies the defined transformers for the given properties
   * If no transformer is found, empty string is returned
   */
  protected async transformDatabaseProperties(
    properties: NotionDatabaseEntryProperties,
    context: RendererContext,
  ): Promise<Partial<Record<NotionDatabasePropertyType, string>>> {
    const result: Partial<Record<NotionDatabasePropertyType, string>> = {};

    for (const [propName, property] of Object.entries(properties)) {
      const transformer = context.transformers.properties[property.type];

      if (transformer) {
        result[propName as NotionDatabasePropertyType] =
          await transformer.transform({
            property,
            properties,
            block: context.block,
            utils: context.utils,
            metadata: context.metadata,
          });
      } else {
        result[propName as NotionDatabasePropertyType] = '';
      }
    }

    return result;
  }

  /**
   * Initializes the required 'content' and 'imports' variables.
   * Sets up default resolver for 'imports' variable.
   */
  private initializeDefaultVariables(): void {
    console.debug('[BaseRendererPlugin] Initializing default variables');
    BaseRendererPlugin.DEFAULT_VARIABLES.forEach((variable) => {
      this.addVariable(variable, this.defaultResolver);
    });
    console.debug('[BaseRendererPlugin] Default variables initialized');
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
    BaseRendererPlugin.DEFAULT_VARIABLES.forEach((name) => {
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
    console.debug('[BaseRendererPlugin] Starting template rendering');
    const resolvedVariables: Record<string, string> = {};

    for (const [name, _collector] of this.variableDataCollector.entries()) {
      console.debug(`[BaseRendererPlugin] Resolving variable: ${name}`);
      const resolver = this.variableResolvers.get(name) || this.defaultResolver;
      resolvedVariables[name] = await resolver(name, {
        ...this.context,
      });
    }

    console.debug(
      '[BaseRendererPlugin] Template variables resolved, applying to template',
    );
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
    // Reset all collectors while preserving imports
    const imports = this.variableDataCollector.get('imports') || [];

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
      manifest: data.manifests,
    };
  }
}
