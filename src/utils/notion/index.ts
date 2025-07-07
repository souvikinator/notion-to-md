import type { Client as NotionClient } from '@notionhq/client';
import {
  NotionBlock,
  NotionBlocks,
  NotionComments,
  NotionDatabaseEntry,
  NotionDatabaseEntryProperty,
  NotionDatabaseQueryOptions,
  NotionDatabaseSchema,
  NotionPageProperties,
} from '../../types/notion';
import { RateLimiter } from '../rate-limiter/index';

const VALID_NOTION_HOST = [
  'notion.so',
  'www.notion.so',
  'notion.com',
  'www.notion.com',
];

export function isMediaBlock(block: NotionBlock): boolean {
  return ['image', 'video', 'file', 'pdf'].includes(block.type);
}

export function isRawUUID(input: string): boolean {
  return /^[a-f0-9]{32}$/i.test(input);
}

/**
 * Determines whether a given URL string refers to a Notion page.
 *
 * ⚠️ This accounts for Notion’s inconsistent behavior where:
 * - Links to internal pages may appear as **relative paths** like `/uuid`
 * - Full shared links may appear as `https://www.notion.so/Page-Title-<uuid>`
 * - Mention blocks may return URLs under `link_preview.url` or `text.link.url`
 *
 * ## Detection Logic:
 * 1. If the string starts with `/` and the rest is a 32-character hex UUID → ✅ Notion page
 * (possible that this might not be a Notion page, in that care there will be no entry in the manifest so it'll be ignored)
 * 2. If the string is an absolute URL with hostname `notion.so` or `notion.com`:
 *    - Split the last segment of the path by `-`
 *    - If the last part is a 32-character hex UUID → ✅ Notion page
 * 3. Else → ❌ Not a Notion page
 */
export function isNotionPageUrl(url: string): boolean {
  if (!url) return false;

  // Case 1: Relative Notion page path e.g. "/some-page-uuid"
  if (url.startsWith('/') && isRawUUID(url.slice(1))) return true;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Case 2: Notion hostnames check for absolute URLs
    if (VALID_NOTION_HOST.includes(hostname)) {
      // path is usually of the form "/Page-Title-<uuid>" or "/<uuid>"
      // Extract slug part and get the last part after splitting by "-"
      const segments = parsed.pathname.split('/');
      const lastSegment = segments.filter(Boolean).pop() || '';
      const lastPart = lastSegment.split('-').pop() || '';

      if (isRawUUID(lastPart)) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export function isPageRefBlock(block: NotionBlock): boolean {
  const blockTypeObject = (block as any)[block.type];

  if (block.type === 'link_to_page' || block.type === 'child_page') {
    return true;
  }

  if (blockTypeObject?.rich_text) {
    return blockTypeObject.rich_text.some((text: any) => {
      if (text.type === 'mention' && text.mention?.type === 'page') {
        return true;
      }

      if (
        text.type === 'mention' &&
        text.mention?.type === 'link_preview' &&
        isNotionPageUrl(text.mention.link_preview?.url || '')
      ) {
        return true;
      }

      if (text.type === 'text' && isNotionPageUrl(text.text?.link?.url || '')) {
        return true;
      }

      return false;
    });
  }

  return false;
}

// checks if database property is a media property
export function isMediaProperty(
  property: NotionDatabaseEntryProperty,
): boolean {
  return (
    property.type === 'files' &&
    Array.isArray(property.files) &&
    property.files.length > 0
  );
}

// Checks if a property contains page mentions
export function isPageRefProperty(
  property: NotionDatabaseEntryProperty,
): boolean {
  // Only rich_text properties contain page mentions
  if (property.type !== 'rich_text' || !Array.isArray(property.rich_text)) {
    return false;
  }

  // Check each rich text item for page mentions
  return property.rich_text.some(
    (item) => item.type === 'mention' && item.mention?.type === 'page',
  );
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
export async function fetchNotionDatabaseSchema(
  client: NotionClient,
  databaseId: string,
  rateLimiter: RateLimiter,
): Promise<NotionDatabaseSchema> {
  const res = await rateLimiter.execute(() =>
    client.databases.retrieve({
      database_id: databaseId,
    }),
  );
  return res as NotionDatabaseSchema;
}

/**
 * Fetches all pages in a database
 */
export async function fetchNotionDatabase(
  client: NotionClient,
  databaseId: string,
  rateLimiter: RateLimiter,
  query?: NotionDatabaseQueryOptions,
): Promise<NotionDatabaseEntry[]> {
  let allItems: NotionDatabaseEntry[] = [];
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

    allItems = [...allItems, ...(response.results as NotionDatabaseEntry[])];
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return allItems;
}
