import { BaseRendererPlugin } from '../../../core/renderer/index';
import { blockTransformers } from './transformers/block';
import { annotationTransformers } from './transformers/annotations';
import { createDefaultVariableResolvers } from './resolvers';
import {
  escapeJSXAttribute,
  escapeJSXContent,
  generateJSXClassName,
  formatAsJSXTable,
  transformDatabaseToJSXTable,
  transformRichText,
} from './helpers';
import { NotionPageProperties } from '../../../types/notion';

export interface JSXComponentConfig {
  name?: string;
  exportType?: 'named' | 'default';
  propsInterface?: string;
  propsType?: Record<string, string>;
}

export interface JSXStylingConfig {
  classNamePrefix?: string;
  useModules?: boolean;
  customClasses?: Record<string, string>;
}

export interface JSXImportConfig {
  react?: boolean;
  fragments?: boolean;
  customImports?: string[];
}

export interface JSXRendererConfig {
  component?: JSXComponentConfig;
  styling?: JSXStylingConfig;
  imports?: JSXImportConfig;
  typescript?: boolean;
  wrapContent?: boolean;
  // Database/property related config
  tableComponent?: string;
  propertyComponents?: Record<string, string>;
}

/**
 * JSXRenderer usage example:
 *
 * const renderer = new JSXRenderer(config);
 * const jsxString = await renderer.render(blocks, { pageId, properties, metadata });
 * // jsxString contains the full JSX/TSX output
 */
export class JSXRenderer extends BaseRendererPlugin {
  protected template = `{{{imports}}}

{{{types}}}

{{{exportStatement}}} {{{componentName}}}({{{props}}}) {
  return (
    {{{wrapperStart}}}{{{content}}}{{{wrapperEnd}}}
  );
}`;

  constructor(config: JSXRendererConfig = {}) {
    super();

    // Store configuration in metadata with defaults
    const defaultConfig: JSXRendererConfig = {
      component: {
        name: 'NotionContent',
        exportType: 'named',
        propsInterface: 'NotionContentProps',
      },
      styling: {
        classNamePrefix: 'notion-',
        useModules: false,
        customClasses: {},
      },
      imports: {
        react: true,
        fragments: false,
        customImports: [],
      },
      typescript: false,
      wrapContent: true,
      tableComponent: 'table',
      propertyComponents: {},
    };

    // Deep merge with provided config
    this.addMetadata('config', this.mergeConfig(defaultConfig, config));

    // Initialize transformers
    this.createBlockTransformers(blockTransformers);
    this.createAnnotationTransformers(annotationTransformers);

    // Register JSX-specific utilities
    this.addUtil('escapeJSXAttribute', escapeJSXAttribute);
    this.addUtil('escapeJSXContent', escapeJSXContent);
    this.addUtil('generateJSXClassName', generateJSXClassName);
    this.addUtil('formatAsJSXTable', formatAsJSXTable);
    this.addUtil('transformDatabaseToJSXTable', transformDatabaseToJSXTable);
    this.addUtil('transformRichText', transformRichText);

    // Initialize resolvers
    const resolvers = createDefaultVariableResolvers();
    Object.entries(resolvers).forEach(([name, resolver]) => {
      this.addVariable(name, resolver);
    });
  }

  /**
   * Utility to flatten all blocks (including nested children) into a single array
   */
  private flattenBlocks(blocks: any[]): any[] {
    const result: any[] = [];
    function recurse(blockArr: any[]) {
      for (const block of blockArr) {
        if (block && typeof block === 'object' && 'type' in block) {
          result.push(block);
          if (Array.isArray(block.children) && block.children.length > 0) {
            recurse(block.children);
          }
        }
      }
    }
    recurse(blocks);
    return result;
  }

  /**
   * Render Notion blocks to a JSX/TSX string.
   * @param blocks Array of Notion blocks to render
   * @param options Optional: { pageId, properties, metadata }
   * @returns JSX/TSX string
   */
  public async render(
    blocks: any[],
    options?: {
      pageId?: string;
      properties?: NotionPageProperties;
      metadata?: any;
    },
  ): Promise<string> {
    // Flatten all blocks (including nested children) for blockTree
    const flatBlocks = this.flattenBlocks(blocks);
    const chainData = {
      pageId: options?.pageId || '',
      blockTree: {
        properties: options?.properties || {},
        blocks: flatBlocks,
        comments: [],
      },
      metadata: options?.metadata || {},
      manifests: {},
      content: '',
    };
    const result = await this.process(chainData);
    return result.content;
  }

  private mergeConfig(
    defaults: JSXRendererConfig,
    provided: JSXRendererConfig,
  ): JSXRendererConfig {
    return {
      component: { ...defaults.component, ...provided.component },
      styling: { ...defaults.styling, ...provided.styling },
      imports: { ...defaults.imports, ...provided.imports },
      typescript: provided.typescript ?? defaults.typescript,
      wrapContent: provided.wrapContent ?? defaults.wrapContent,
      tableComponent: provided.tableComponent ?? defaults.tableComponent,
      propertyComponents: {
        ...defaults.propertyComponents,
        ...provided.propertyComponents,
      },
    };
  }

  /**
   * Override processBlock to set _isFirstListItem for list grouping logic
   */
  protected async processBlock(block: any, metadata?: any): Promise<string> {
    // Determine if this block is the first of its type among its siblings
    let isFirst = true;
    if (
      block.parent &&
      block.parent.id &&
      Array.isArray(this.context.blockTree)
    ) {
      const siblings = this.context.blockTree.filter(
        (b: any) =>
          b.parent && b.parent.id === block.parent.id && b.type === block.type,
      );
      if (siblings.length > 0 && siblings[0].id !== block.id) {
        isFirst = false;
      }
    }
    // Pass _isFirstListItem in metadata
    const newMetadata = { ...metadata, _isFirstListItem: isFirst };
    return await super.processBlock(block, newMetadata);
  }
}
