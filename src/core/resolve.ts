import { isFileValue } from '../tree/properties';
import type { Document, Properties } from '../tree/types';
import { visit } from '../tree/visit';
import type { Asset, PageLinkTarget, Plugin, PluginContext } from './types';

/** Something in the tree that carries a URL, and what plugins are told about it. */
interface UrlTarget<T> {
  info: T;
  holder: { url: string };
}

/** Asks plugins for the final URL of every file in the page, and writes the answers into the tree. */
export async function resolveAssets(
  document: Document,
  plugins: Plugin[],
  context: PluginContext,
): Promise<Asset[]> {
  const resolvers = plugins.flatMap((plugin) =>
    plugin.resolveAsset
      ? [(asset: Asset) => plugin.resolveAsset?.(asset, context)]
      : [],
  );
  return resolve(assetTargets(document), resolvers);
}

/** Asks plugins for the final URL of every link to a Notion page, and writes the answers into the tree. */
export async function resolveLinks(
  document: Document,
  plugins: Plugin[],
  context: PluginContext,
): Promise<PageLinkTarget[]> {
  const resolvers = plugins.flatMap((plugin) =>
    plugin.resolveLink
      ? [(link: PageLinkTarget) => plugin.resolveLink?.(link, context)]
      : [],
  );
  return resolve(linkTargets(document), resolvers);
}

async function resolve<T extends { url: string }>(
  targets: UrlTarget<T>[],
  resolvers: ((info: T) => Promise<string | undefined> | string | undefined)[],
): Promise<T[]> {
  await Promise.all(
    targets.map(async ({ info, holder }) => {
      for (const resolver of resolvers) {
        const url = await resolver(info);
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
