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
  NotionPageProperty,
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

export function isLinkToPageBlock(block: NotionBlock): boolean {
  return (
    block.type === 'link_to_page' &&
    block.link_to_page?.type === 'page_id' &&
    !!block.link_to_page.page_id
  );
}

export function isChildPageBlock(block: NotionBlock): boolean {
  return block.type === 'child_page' && !!block.child_page?.title;
}

export function isMentionPage(block: NotionBlock): boolean {
  const blockTypeObject = (block as any)[block.type];

  if (blockTypeObject?.rich_text) {
    return blockTypeObject.rich_text.some(
      (text: any) => text?.type === 'mention' && text.mention?.type === 'page',
    );
  }

  return false;
}

export function isLinkPreviewMention(block: NotionBlock): boolean {
  const blockTypeObject = (block as any)[block.type];

  if (blockTypeObject?.rich_text) {
    {
      return blockTypeObject.rich_text.some(
        (text: any) =>
          text?.type === 'mention' &&
          text.mention?.type === 'link_preview' &&
          isNotionPageUrl(text.mention.link_preview?.url || ''),
      );
    }
  }

  return false;
}

export function isNotionLinkText(block: NotionBlock): boolean {
  const blockTypeObject = (block as any)[block.type];

  if (blockTypeObject?.rich_text) {
    return blockTypeObject.rich_text.some(
      (text: any) =>
        text?.type === 'text' && isNotionPageUrl(text.text?.link?.url || ''),
    );
  }

  return false;
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
 * (possible that the UUID might not belong to Notion page, in that care there will be no entry in the manifest as there is not such page, so it'll be ignored)
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

/**
 *
 * @param rawUrl The raw URL string to validate
 * @returns
 */
export function isValidURL(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Extracts a URL from a Notion page property of type: url, formula, or plain text
 * The URL has to be a full URL (not slug/path) for it to be valid.
 * @param property NotionPageProperties - The Notion page property to extract the URL from.
 * @returns
 */
export function extractUrlFromNotionProperty(
  property: NotionPageProperty,
): string | null {
  if ('url' in property) return property.url;

  if ('formula' in property) {
    const { formula } = property;
    return formula.type === 'string' && formula.string?.startsWith('http')
      ? formula.string
      : null;
  }

  if ('rich_text' in property) {
    const text = property.rich_text[0]?.plain_text;
    return text?.startsWith('http') ? text : null;
  }

  return null;
}

export function isPageRefBlock(block: NotionBlock): boolean {
  return (
    isLinkToPageBlock(block) ||
    isChildPageBlock(block) ||
    isMentionPage(block) ||
    isLinkPreviewMention(block) ||
    isNotionLinkText(block)
  );
}

/**
 * Extracts Notion page UUID from a valid Notion link (absolute or relative) and returns it normalized.
 */
export function extractNotionPageIdFromUrl(url: string): string | null {
  if (!url) return null;

  // Case 1: /<uuid> format
  if (url.startsWith('/') && isRawUUID(url.slice(1))) {
    return normalizeUUID(url.slice(1));
  }

  // Case 2: Absolute URL with Notion hostnames
  // e.g. https://www.notion.so/Page-Title-<uuid>
  try {
    const parsed = new URL(url);
    const lastSegment = parsed.pathname.split('/').filter(Boolean).pop() || '';
    const uuidCandidate = lastSegment.split('-').pop() || '';

    return isRawUUID(uuidCandidate) ? normalizeUUID(uuidCandidate) : null;
  } catch {
    return null;
  }
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
 * Extracts page ID from a block that references another page.
 * Looks through link_to_page, mentions, and rich_text links.
 */
export function extractPageIdFromBlock(block: NotionBlock): string | null {
  if (
    isLinkToPageBlock(block) &&
    block.type === 'link_to_page' &&
    block.link_to_page.type === 'page_id'
  ) {
    return block.link_to_page.page_id;
  }

  const blockTypeObject = (block as any)[block.type];

  if ('rich_text' in blockTypeObject) {
    const richText = (blockTypeObject as { rich_text: any[] }).rich_text;

    for (const text of richText) {
      if (text.type === 'mention' && text.mention?.type === 'page') {
        return text.mention.page.id;
      }

      if (
        text?.type === 'mention' &&
        text.mention?.type === 'link_preview' &&
        text.mention.link_preview?.url
      ) {
        const id = extractNotionPageIdFromUrl(text.mention.link_preview.url);
        if (id) return id;
      }

      if (
        text?.type === 'text' &&
        text.text?.link?.url &&
        isNotionPageUrl(text.text.link.url)
      ) {
        const id = extractNotionPageIdFromUrl(text.text.link.url);
        if (id) return id;
      }
    }
  }

  return null;
}

// Checks if a Notion Database property contains page mentions
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

// block fetching utilities

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
