import type {
  Asset,
  PageLinkTarget,
  Plugin,
  PluginContext,
} from '../core/types';

type Resolve<T> = (
  target: T,
  context: PluginContext,
) => string | undefined | Promise<string | undefined>;

/**
 * Rewrites links to Notion pages. Return the URL for a page, or nothing to keep the Notion URL.
 *
 * @example
 * pageLinks((link, { site }) => {
 *   const slug = site.get(link.pageId)?.properties.Slug;
 *   return typeof slug === 'string' ? `/blog/${slug}` : undefined;
 * })
 */
export function pageLinks(resolve: Resolve<PageLinkTarget>): Plugin {
  return { name: 'page-links', resolveLink: resolve };
}

/**
 * Decides the URL of every file in the page, for example after uploading it somewhere.
 * Return nothing to keep the current URL. Use `downloadMedia` from `notion-to-md/node` to save files locally.
 */
export function media(resolve: Resolve<Asset>): Plugin {
  return { name: 'media', resolveAsset: resolve };
}
