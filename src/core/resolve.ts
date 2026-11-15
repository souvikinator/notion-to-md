import { isFileValue } from '../tree/values';
import type { Document, Properties } from '../tree/types';
import { visit } from '../tree/visit';
import type { Asset, PageLinkTarget, Plugin, PluginContext } from './types';

/** Something in the tree that carries a URL, and what plugins are told about it. */
interface UrlTarget<T> {
  info: T;
  holder: { url: string };
}

type Hook<T> = (
  target: T,
  context: PluginContext,
) => string | undefined | Promise<string | undefined>;

/**
 * Asks plugins for the final URL of every file and every link to a Notion page,
 * and writes the answers into the tree. The first plugin to return a URL wins.
 */
export async function resolveUrls(
  document: Document,
  plugins: Plugin[],
  context: PluginContext,
): Promise<{ assets: Asset[]; links: PageLinkTarget[] }> {
  const [assets, links] = await Promise.all([
    resolve(
      assetTargets(document),
      plugins.map((plugin) => plugin.resolveAsset?.bind(plugin)),
      context,
    ),
    resolve(
      linkTargets(document),
      plugins.map((plugin) => plugin.resolveLink?.bind(plugin)),
      context,
    ),
  ]);
  return { assets, links };
}

async function resolve<T extends { url: string }>(
  targets: UrlTarget<T>[],
  hooks: (Hook<T> | undefined)[],
  context: PluginContext,
): Promise<T[]> {
  const resolvers = hooks.filter((hook) => hook !== undefined);
  await Promise.all(
    targets.map(async ({ info, holder }) => {
      for (const resolver of resolvers) {
        const url = await resolver(info, context);
        if (url !== undefined) {
          holder.url = url;
          return;
        }
      }
    }),
  );
  return targets.map(({ info, holder }) => ({ ...info, url: holder.url }));
}

/** Anything in the tree that is a file: a media block, the cover, a file in a property. */
interface FileHolder {
  url: string;
  name: string;
  hosted: boolean;
}

function assetTargets(document: Document): UrlTarget<Asset>[] {
  const pageId = document.id;
  const target = (
    holder: FileHolder,
    rest: Pick<Asset, 'id' | 'kind' | 'source' | 'pageId'>,
  ): UrlTarget<Asset> => {
    const { url, name, hosted } = holder;
    return { info: { ...rest, url, name, hosted }, holder };
  };
  const propertyFiles = (
    owner: string,
    properties: Properties,
    source: Asset['source'],
  ): UrlTarget<Asset>[] =>
    Object.entries(properties).flatMap(([property, value]) =>
      (Array.isArray(value) ? value : [])
        .filter(isFileValue)
        .map((file, index) =>
          target(file, {
            id: `${owner}/${property}/${String(index)}`,
            kind: 'file',
            source,
            pageId: owner,
          }),
        ),
    );

  const targets = propertyFiles(pageId, document.properties, 'page_property');
  if (document.cover) {
    targets.push(
      target(document.cover, {
        id: `${pageId}/cover`,
        kind: 'image',
        source: 'page_cover',
        pageId,
      }),
    );
  }
  visit(document, (node) => {
    if (node.type === 'media') {
      targets.push(
        target(node, { id: node.id, kind: node.kind, source: 'block', pageId }),
      );
    }
    if (node.type === 'database') {
      for (const row of node.rows) {
        targets.push(
          ...propertyFiles(row.pageId, row.properties, 'database_property'),
        );
      }
    }
  });
  return targets;
}

function linkTargets(document: Document): UrlTarget<PageLinkTarget>[] {
  const targets: UrlTarget<PageLinkTarget>[] = [];
  visit(document, (node) => {
    if (node.type === 'pageLink') {
      const info: PageLinkTarget = { pageId: node.pageId, url: node.url };
      if (node.blockId) info.blockId = node.blockId;
      targets.push({ info, holder: node });
    }
    if (node.type === 'pageRef')
      targets.push({
        info: { pageId: node.pageId, url: node.url },
        holder: node,
      });
    if (node.type === 'database') {
      for (const row of node.rows)
        targets.push({
          info: { pageId: row.pageId, url: row.url },
          holder: row,
        });
    }
  });
  return targets;
}
