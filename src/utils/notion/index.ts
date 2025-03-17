import {
  GetDatabaseResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import {
  CommentResponseResults,
  ListBlockChildrenResponseResult,
  ListBlockChildrenResponseResults,
  PageObjectProperties,
} from '../../types';
import type { Client as NotionClient } from '@notionhq/client';
import { RateLimiter } from '../rate-limiter/index';

export function isMediaBlock(block: ListBlockChildrenResponseResult): boolean {
  // @ts-ignore
  return ['image', 'video', 'file', 'pdf'].includes(block.type);
}

export function isPageRefBlock(
  block: ListBlockChildrenResponseResult,
): boolean {
  //@ts-ignore - Check for page mentions in paragraphs
  if (block.type && block[block.type].rich_text) {
    // @ts-ignore - Check for mentions in rich text for any block
    const hasPageMention = block[block.type].rich_text.some(
      (text: any) => text.type === 'mention' && text.mention?.type === 'page',
    );
    if (hasPageMention) return true;
  }
  // @ts-ignore - Check for direct page links
  return block.type === 'link_to_page' || block.type === 'child_page';
}

//  notion client calls
/**
 * Fetches all children blocks for a given block ID
 */
export async function fetchBlockChildren(
  client: NotionClient,
  blockId: string,
  rateLimiter: RateLimiter,
): Promise<ListBlockChildrenResponseResults> {
  let allBlocks: ListBlockChildrenResponseResults = [];
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
    ) as ListBlockChildrenResponseResults;

    allBlocks = [...allBlocks, ...blocks];
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return allBlocks;
}

/**
 * Fetches all comments for a given block ID
 */
export async function fetchAllComments(
  client: NotionClient,
  blockId: string,
  rateLimiter: RateLimiter,
): Promise<CommentResponseResults> {
  let allComments: CommentResponseResults = [];
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
export async function fetchPageProperties(
  client: NotionClient,
  pageId: string,
  rateLimiter: RateLimiter,
): Promise<PageObjectProperties> {
  const response = await rateLimiter.execute(() =>
    client.pages.retrieve({ page_id: pageId }),
  );

  return 'properties' in response ? response.properties : {};
}

/**
 * Fetches database metadata
 */
export async function fetchDatabaseMetadata(
  client: NotionClient,
  databaseId: string,
  rateLimiter: RateLimiter,
): Promise<GetDatabaseResponse> {
  return rateLimiter.execute(() =>
    client.databases.retrieve({
      database_id: databaseId,
    }),
  );
}

/**
 * Fetches all pages in a database
 */
export async function fetchDatabaseContent(
  client: NotionClient,
  databaseId: string,
  rateLimiter: RateLimiter,
): Promise<PageObjectResponse[]> {
  let allItems: PageObjectResponse[] = [];
  let hasMore = true;
  let cursor: string | undefined;

  while (hasMore) {
    const response = await rateLimiter.execute(() =>
      client.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
      }),
    );

    allItems = [...allItems, ...(response.results as PageObjectResponse[])];
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return allItems;
}
