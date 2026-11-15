import type { FileSource } from '../tree/files';
import type { Document, MediaKind, Properties } from '../tree/types';

/** What plugins know about every page in a `pages()` run. */
export type SitePage = Pick<Document, 'id' | 'title' | 'url' | 'properties'>;

export interface PluginContext {
  /** Records a problem that did not stop the conversion. Throws instead when `strict` is on. */
  warn: (message: string) => void;
  /** Every page in the current `pages()` run, by page id. Empty for a single `convert()`. */
  site: ReadonlyMap<string, SitePage>;
}

/** A file used by the page: a media block, or a file in a `files` property. */
export interface Asset {
  /** Stable id: the block id, or `<pageId>/<property>/<index>` for property files. */
  id: string;
  kind: MediaKind;
  url: string;
  name: string;
  /** True when the file is stored by Notion, whose URLs expire after an hour. */
  hosted: boolean;
  /** Where the file appears: a block, the cover, a page property, or a property of a database row. */
  source: FileSource;
  pageId: string;
}

/** A link to a Notion page found in the page. */
export interface PageLinkTarget {
  pageId: string;
  /** Set when the link points at a block inside the page. */
  blockId?: string;
  url: string;
}

export interface Page {
  id: string;
  title: string;
  url: string;
  properties: Properties;
  content: string;
  tree: Document;
  assets: Asset[];
  links: PageLinkTarget[];
  warnings: string[];
}

/** Turns the document tree into output text. `markdown()`, `mdx()` and `html()` are renderers. */
export interface Renderer {
  render(document: Document): string;
}

type MaybePromise<T> = T | Promise<T>;

/**
 * A plugin hooks into fixed stages of a conversion. Plugins run in array order within a
 * stage; for `resolveAsset` and `resolveLink`, the first plugin to return a URL wins.
 */
export interface Plugin {
  name: string;
  /** Edit the tree before URLs are resolved and the page is rendered. */
  transform?(document: Document, context: PluginContext): MaybePromise<void>;
  /** Return the URL to use for a file, or nothing to leave it to the next plugin. */
  resolveAsset?(
    asset: Asset,
    context: PluginContext,
  ): MaybePromise<string | undefined>;
  /** Return the URL to use for a link to another Notion page, or nothing to keep looking. */
  resolveLink?(
    link: PageLinkTarget,
    context: PluginContext,
  ): MaybePromise<string | undefined>;
  /** Change the finished page, for example to add frontmatter. */
  result?(page: Page, context: PluginContext): MaybePromise<Page | undefined>;
}
