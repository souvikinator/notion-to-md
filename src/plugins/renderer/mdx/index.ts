import { BaseRendererPlugin } from '../../../core/renderer/index';
import { blockTransformers } from './transformers/blocks';
import { annotationTransformers } from './transformers/annotations';
import { createDefaultVariableResolvers } from './resolvers';
import { databasePropertyTransformers } from './transformers/database-properties';
import { formatAsMarkdownTable, transformDatabaseToTable } from './helpers';
import {
  NotionPageProperties,
  NotionPageProperty,
} from '../../../types/notion';

export interface FrontmatterConfig {
  include?: string[];
  exclude?: string[];
  rename?: Record<string, string>;
  defaults?: Record<string, any>;
  transform?: Record<
    string,
    (
      property: NotionPageProperty,
      allProperties: NotionPageProperties,
    ) => string
  >;
}

export type FrontmatterOptions = boolean | FrontmatterConfig;

export interface MDXRendererConfig {
  frontmatter?: FrontmatterOptions;
}

export class MDXRenderer extends BaseRendererPlugin {
  protected template = `{{{frontmatter}}}{{{imports}}}{{{content}}}`;

  constructor(config: MDXRendererConfig = {}) {
    super();

    // Store configuration in metadata
    this.addMetadata('config', config);

    // Initialize transformers
    this.createBlockTransformers(blockTransformers);
    this.createAnnotationTransformers(annotationTransformers);
    this.createPropertyTransformers(databasePropertyTransformers);

    // register utilities if any
    this.addUtil('formatAsMarkdownTable', formatAsMarkdownTable);
    this.addUtil('transformDatabaseToTable', transformDatabaseToTable);

    // Initialize resolvers
    const resolvers = createDefaultVariableResolvers();
    Object.entries(resolvers).forEach(([name, resolver]) => {
      this.addVariable(name, resolver);
    });
  }

  // Public method to render an array of blocks as Markdown, grouping lists
  public async renderBlocksAsMarkdown(
    blocks: any[],
    metadata: any = {},
  ): Promise<string> {
    const results: string[] = [];
    let i = 0;
    while (i < blocks.length) {
      const block = blocks[i];
      // Group consecutive numbered_list_items
      if (block.type === 'numbered_list_item') {
        const group: any[] = [];
        let j = i;
        while (j < blocks.length && blocks[j].type === 'numbered_list_item') {
          group.push(blocks[j]);
          j++;
        }
        // Render the group as a single list
        const lines: string[] = [];
        for (let idx = 0; idx < group.length; idx++) {
          const item = group[idx];
          const text = await this.processBlock(item, {
            ...metadata,
            listLevel: 0,
            currentNumber: idx + 1,
          });
          lines.push(text);
        }
        results.push(lines.join('\n'));
        i = j;
        continue;
      }
      // Group consecutive bulleted_list_items
      if (block.type === 'bulleted_list_item') {
        const group: any[] = [];
        let j = i;
        while (j < blocks.length && blocks[j].type === 'bulleted_list_item') {
          group.push(blocks[j]);
          j++;
        }
        // Render the group as a single list
        const lines: string[] = [];
        for (let idx = 0; idx < group.length; idx++) {
          const item = group[idx];
          const text = await this.processBlock(item, {
            ...metadata,
            listLevel: 0,
          });
          lines.push(text);
        }
        results.push(lines.join('\n'));
        i = j;
        continue;
      }
      // Otherwise, render the block normally
      const text = await this.processBlock(block, metadata);
      results.push(text);
      i++;
    }
    return results.join('\n');
  }
}
