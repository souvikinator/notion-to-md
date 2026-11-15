import { normalizeId, parseNotionUrl } from '../normalize/ids';
import { normalize, pageInfo } from '../normalize/normalize';
import type { DatabaseQuery, RawBlock, RawPage, Source } from '../source/types';
import { resolveUrls } from './resolve';
import type { Page, Plugin, PluginContext, Renderer, SitePage } from './types';

export interface NotionToMdOptions {
  source: Source;
  renderer: Renderer;
  plugins?: Plugin[];
  /** Throw on the first warning instead of collecting warnings on the page. */
  strict?: boolean;
}

export interface NotionToMd {
  /** Converts one page. Accepts a page id or a link to the page. */
  convert(page: string): Promise<Page>;
  /**
   * Converts every page in a database, one at a time. All pages are listed first, so
   * plugins can resolve links between them through `context.site`.
   */
  pages(database: string, query?: DatabaseQuery): AsyncGenerator<Page>;
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
    const { assets, links } = await resolveUrls(tree, plugins, context);

    let result: Page = {
      id: tree.id,
      title: tree.title,
      url: tree.url,
      properties: tree.properties,
      content: renderer.render(tree),
      tree,
      assets,
      links,
      warnings,
    };
    for (const plugin of plugins) {
      result = (await plugin.result?.(result, context)) ?? result;
    }
    return result;
  };

  return {
    async convert(page) {
      const id = toId(page);
      const [rawPage, blocks] = await Promise.all([
        source.page(id),
        source.blocks(id),
      ]);
      return run(rawPage, blocks, new Map());
    },

    async *pages(database, query) {
      if (!source.query) {
        throw new Error('This source cannot list database pages.');
      }
      const rows = [];
      for await (const row of source.query(toId(database), query)) {
        rows.push(row);
      }
      const site = new Map<string, SitePage>(
        rows.map((row) => {
          const info = pageInfo(row);
          return [info.id, info];
        }),
      );
      for (const row of rows) {
        yield await run(row, await source.blocks(normalizeId(row.id)), site);
      }
    },
  };
}

/** Sources always receive dashed ids, whether the user passed an id or a Notion link. */
function toId(input: string): string {
  return parseNotionUrl(input)?.pageId ?? normalizeId(input);
}
