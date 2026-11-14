import type { DatabaseQuery, RawBlock, RawPage, Source } from '../source/types';
import { normalizeId } from '../tree/ids';
import { normalize } from '../tree/normalize';
import { pageTitle, properties } from '../tree/properties';
import { resolveAssets, resolveLinks } from './resolve';
import type { Page, Plugin, PluginContext, Renderer, SitePage } from './types';

export interface NotionToMdOptions {
  source: Source;
  renderer: Renderer;
  plugins?: Plugin[];
  /** Throw on the first warning instead of collecting warnings on the page. */
  strict?: boolean;
}

export interface NotionToMd {
  /** Converts one page. */
  convert(pageId: string): Promise<Page>;
  /**
   * Converts every page in a database, one at a time. All pages are listed first, so
   * plugins can resolve links between them through `context.site`.
   */
  pages(databaseId: string, query?: DatabaseQuery): AsyncGenerator<Page>;
}

export function notionToMd(options: NotionToMdOptions): NotionToMd {
  const { source, renderer, plugins = [], strict = false } = options;

  const run = async (
    page: RawPage,
    blocks: RawBlock[],
    site: ReadonlyMap<string, SitePage>,
  ): Promise<Page> => {
    const warnings: string[] = [];
    const warn = (message: string): void => {
      if (strict) throw new Error(message);
      warnings.push(message);
    };
    const context: PluginContext = { site, warn };

    const tree = normalize(page, blocks, warn);
    for (const plugin of plugins) await plugin.transform?.(tree, context);
    const [assets, links] = await Promise.all([
      resolveAssets(tree, plugins, context),
      resolveLinks(tree, plugins, context),
    ]);

    let result: Page = {
      id: tree.id,
      title: tree.title,
      url: tree.url,
      properties: tree.properties,
      content: renderer.render(tree, context),
      tree,
      assets,
      links,
      warnings,
    };
    for (const plugin of plugins)
      result = (await plugin.result?.(result, context)) ?? result;
    return result;
  };

  return {
    async convert(pageId) {
      const id = normalizeId(pageId);
      const [page, blocks] = await Promise.all([
        source.page(id),
        source.blocks(id),
      ]);
      return run(page, blocks, new Map());
    },

    async *pages(databaseId, query) {
      if (!source.query)
        throw new Error('This source cannot list database pages.');
      const rows = [];
      for await (const row of source.query(databaseId, query)) rows.push(row);

      const site = new Map<string, SitePage>(
        rows.map((row) => {
          const id = normalizeId(row.id);
          return [
            id,
            {
              id,
              title: pageTitle(row.properties),
              url: row.url,
              properties: properties(row.properties),
            },
          ];
        }),
      );
      for (const row of rows)
        yield await run(row, await source.blocks(row.id), site);
    },
  };
}
