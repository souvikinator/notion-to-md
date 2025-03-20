import type { Client as NotionClient } from '@notionhq/client';
import {
  NotionBlock,
  NotionBlocks,
  NotionComments,
  NotionDatabaseContent,
  NotionDatabaseProperties,
  NotionDatabaseQueryOptions,
  NotionPageProperties,
} from '../../types/notion';
import { RateLimiter } from '../rate-limiter/index';

export function isMediaBlock(block: NotionBlock): boolean {
  return ['image', 'video', 'file', 'pdf'].includes(block.type);
}

export function isPageRefBlock(block: NotionBlock): boolean {
  const blockTypeObject = (block as any)[block.type];

  switch (block.type) {
    case 'link_to_page':
    case 'child_page':
      return true;
    default:
      if (blockTypeObject.rich_text) {
        return blockTypeObject.rich_text.some(
          (text: any) =>
            text.type === 'mention' && text.mention?.type === 'page',
        );
      }
      return false;
  }
}

/**
 * Converts UUID without hyphens to the one with hyphens. If UUID with hyphens is given then return the same.
 *
 * Example:
 *  `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` to `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
 * @param uuid in hyphenated or unhyphenated form
 * @returns UUID (with hyphens)
 */
export function normalizeUUID(uuid: string): string {
  // If the UUID already contains hyphens, return it as-is
  if (uuid.includes('-')) {
    return uuid;
  }

  // Convert bare UUID to hyphenated format
  return uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

export function isExternalUrl(url: string): boolean {
  return !url.includes('prod-files-secure.s3.us-west-2.amazonaws.com');
}

/**
 * Fetches all children blocks for a given block ID
 */
export async function fetchNotionBlockChildren(
  client: NotionClient,
  blockId: string,
  rateLimiter: RateLimiter,
): Promise<NotionBlocks> {
  let allBlocks: NotionBlocks = [];
  let hasMore = true;
  let cursor: string | undefined;

  while (hasMore) {
    const response = await rateLimiter.execute(() =>
      client.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
      }),
    );

    // Filter out unsupported blocks
    const blocks = response.results.filter(
      (block) => 'type' in block && block.type !== 'unsupported',
    ) as NotionBlocks;

    allBlocks = [...allBlocks, ...blocks];
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return allBlocks;
}

/**
 * Fetches all comments for a given block ID and page ID
 */
export async function fetchNotionAllComments(
  client: NotionClient,
  blockId: string,
  rateLimiter: RateLimiter,
): Promise<NotionComments> {
  let allComments: NotionComments = [];
  let hasMore = true;
  let cursor: string | undefined;

  while (hasMore) {
    const response = await rateLimiter.execute(() =>
      client.comments.list({
        block_id: blockId,
        start_cursor: cursor,
      }),
    );

    allComments = [...allComments, ...response.results];
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return allComments;
}

/**
 * Fetches properties for a given page ID
 */
export async function fetchNotionPageProperties(
  client: NotionClient,
  pageId: string,
  rateLimiter: RateLimiter,
): Promise<NotionPageProperties> {
  const response = await rateLimiter.execute(() =>
    client.pages.retrieve({ page_id: pageId }),
  );

  return 'properties' in response ? response.properties : {};
}

/**
 * Fetches database metadata
 */
export async function fetchNotionDatabaseMetadata(
  client: NotionClient,
  databaseId: string,
  rateLimiter: RateLimiter,
): Promise<NotionDatabaseProperties> {
  const res = await rateLimiter.execute(() =>
    client.databases.retrieve({
      database_id: databaseId,
    }),
  );
  return res.properties;
}

/**
 * Fetches all pages in a database
 */
export async function fetchNotionDatabaseContent(
  client: NotionClient,
  databaseId: string,
  rateLimiter: RateLimiter,
  query?: NotionDatabaseQueryOptions,
): Promise<NotionDatabaseContent[]> {
  let allItems: NotionDatabaseContent[] = [];
  let hasMore = true;
  let cursor: string | undefined;

  while (hasMore) {
    const response = await rateLimiter.execute(() => {
      return client.databases.query({
        database_id: databaseId,
        filter: query?.filter,
        sorts: query?.sorts,
        start_cursor: cursor,
      });
    });

    allItems = [...allItems, ...(response.results as NotionDatabaseContent[])];
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return allItems;
}
