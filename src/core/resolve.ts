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

function assetTargets(document: Document): UrlTarget<Asset>[] {
  const targets = propertyFileTargets(document.id, document.properties);
  visit(document, (node) => {
    if (node.type === 'media') {
      const { id, kind, url, hosted, name } = node;
      targets.push({
        info: { id, kind, url, hosted, name, pageId: document.id },
        holder: node,
      });
    }
    if (node.type === 'database') {
      for (const row of node.rows)
        targets.push(...propertyFileTargets(row.pageId, row.properties));
    }
  });
  return targets;
}

function propertyFileTargets(
  pageId: string,
  properties: Properties,
): UrlTarget<Asset>[] {
  return Object.entries(properties).flatMap(([property, value]) => {
    if (!Array.isArray(value)) return [];
    return value.filter(isFileValue).map((file, index) => ({
      info: {
        id: `${pageId}/${property}/${String(index)}`,
        kind: 'file' as const,
        url: file.url,
        name: file.name,
        hosted: file.hosted,
        pageId,
      },
      holder: file,
    }));
  });
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
