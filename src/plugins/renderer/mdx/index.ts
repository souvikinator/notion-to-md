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
}
