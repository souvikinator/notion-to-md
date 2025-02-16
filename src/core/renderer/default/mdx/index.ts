import { BaseRendererPlugin } from '../../index';
import { blockTransformers } from './transformers/blocks';
import { annotationTransformers } from './transformers/annotations';
import { createDefaultResolvers } from './resolvers';

interface FrontmatterConfig {
  properties?: {
    include?: string[];
    exclude?: string[];
    rename?: Record<string, string>;
    defaults?: Record<string, any>;
  };
}

interface MDXRendererConfig {
  frontmatter?: FrontmatterConfig;
}

export class MDXRenderer extends BaseRendererPlugin {
  protected template = `{{{frontmatter}}}

{{{imports}}}

{{{content}}}`;

  constructor(config: MDXRendererConfig = {}) {
    super();

    // Store configuration in metadata
    this.addMetadata('config', config);

    // Initialize transformers
    this.createBlockTransformers(blockTransformers);
    this.createAnnotationTransformers(annotationTransformers);

    // Initialize resolvers
    const resolvers = createDefaultResolvers();
    Object.entries(resolvers).forEach(([name, resolver]) => {
      this.addVariable(name, resolver);
    });
  }
}
