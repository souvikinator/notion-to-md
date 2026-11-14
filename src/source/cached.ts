import type { RawBlock, RawPage, Source } from './types';

export interface CacheEntry {
  /** The page's `last_edited_time` when the blocks were fetched. */
  editedAt: string;
  blocks: RawBlock[];
}

type MaybePromise<T> = T | Promise<T>;

/** Where cached blocks are kept, one entry per page. A `Map` works; `fileCache` from `notion-to-md/node` persists to disk. */
export interface CacheStore {
  get(pageId: string): MaybePromise<CacheEntry | undefined>;
  set(pageId: string, entry: CacheEntry): MaybePromise<unknown>;
}

/**
 * Reuses a page's blocks until the page is edited, so unchanged pages cost one request
 * instead of one per block with children. Content a page shows from elsewhere (synced
 * blocks, database rows, linked page titles) refreshes when the page itself is edited.
 */
export function cached(
  source: Source,
  store: CacheStore = new Map<string, CacheEntry>(),
): Source {
  const pending = new Map<string, Promise<RawPage>>();

  // convert() asks for the page and its blocks at the same time; both share one request.
  const page = (id: string): Promise<RawPage> => {
    let request = pending.get(id);
    if (!request) {
      request = source.page(id).finally(() => pending.delete(id));
      pending.set(id, request);
    }
    return request;
  };

  const wrapped: Source = {
    page,
    async blocks(id) {
      const { last_edited_time: editedAt } = await page(id);
      const entry = await store.get(id);
      if (entry?.editedAt === editedAt) return entry.blocks;
      const blocks = await source.blocks(id);
      await store.set(id, { editedAt, blocks });
      return blocks;
    },
  };
  if (source.query) wrapped.query = source.query.bind(source);
  return wrapped;
}
