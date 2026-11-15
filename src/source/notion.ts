import type {
  BlockObjectResponse,
  Client,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  GetDataSourceResponse,
  PageObjectResponse,
} from '@notionhq/client';
import { normalizeId } from '../normalize/ids';
import { pageTitle } from '../normalize/properties';
import { plainText } from '../normalize/rich-text';
import { createLimiter } from '../utils/limit';
import type {
  BlockExtras,
  DatabaseQuery,
  RawBlock,
  RawDatabase,
  Source,
} from './types';

export interface NotionSourceOptions {
  /** Notion API requests in flight at once. Default 3, matching Notion's average rate limit. */
  concurrency?: number;
  /** Fetch the rows of databases placed inside a page. Default true. */
  databases?: boolean;
  /** Fetch comments on the page and its blocks (one extra request per block). Default false. */
  comments?: boolean;
  /** Filter and sort the rows of databases inside pages, by database id. */
  databaseQueries?: Record<string, DatabaseQuery>;
}

type LinkToPage = Extract<
  BlockObjectResponse,
  { type: 'link_to_page' }
>['link_to_page'];

interface Paginated<T> {
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
}

const NO_EXTRAS: BlockExtras = {};

/** Notion errors that mean "this extra content is not available", not "the conversion failed". */
const UNAVAILABLE = new Set([
  'object_not_found',
  'restricted_resource',
  'validation_error',
]);

/**
 * Reads pages from the Notion API. Retries for rate limits are left to the client, which
 * honours `Retry-After` (configure them with the client's `retry` option).
 */
export function notion(
  client: Client,
  options: NotionSourceOptions = {},
): Source {
  const limit = createLimiter(options.concurrency ?? 3);
  const fetchDatabases = options.databases ?? true;
  const fetchComments = options.comments ?? false;
  const queries = new Map(
    Object.entries(options.databaseQueries ?? {}).map(([id, query]) => [
      normalizeId(id),
      query,
    ]),
  );

  const all = async <T>(
    fetchPage: (cursor: string | undefined) => Promise<Paginated<T>>,
  ): Promise<T[]> => {
    const items: T[] = [];
    for await (const item of paginate(fetchPage)) items.push(item);
    return items;
  };

  const blocks = async (blockId: string): Promise<RawBlock[]> => {
    const results = await all((cursor) =>
      limit(() =>
        client.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
          page_size: 100,
        }),
      ),
    );
    return Promise.all(results.filter(isFullBlock).map(expand));
  };

  const expand = async (block: BlockObjectResponse): Promise<RawBlock> => {
    const [content, comments] = await Promise.all([
      contentOf(block),
      fetchComments ? commentsOf(block.id) : NO_EXTRAS,
    ]);
    const error = [content.error, comments.error].filter(Boolean).join('; ');
    return { ...block, ...content, ...comments, ...(error ? { error } : {}) };
  };

  /** What a block shows beyond its own data: children, database rows, a linked page's title. */
  const contentOf = async (
    block: BlockObjectResponse,
  ): Promise<BlockExtras> => {
    switch (block.type) {
      case 'child_page':
        return {};
      case 'child_database':
        return fetchDatabases
          ? optional(async () => ({ database: await database(block.id) }))
          : {};
      case 'link_to_page': {
        const link = block.link_to_page;
        return optional(async () => ({ title: await linkedTitle(link) }));
      }
      case 'synced_block': {
        // A synced copy holds no content of its own; it shows the original block's children.
        const original = block.synced_block.synced_from?.block_id;
        if (!original) break;
        return optional(async () => ({ children: await blocks(original) }));
      }
      default:
        break;
    }
    return block.has_children ? { children: await blocks(block.id) } : {};
  };

  /** Comments on a page or block. Needs the integration's "read comments" capability. */
  const commentsOf = (id: string): Promise<BlockExtras> =>
    optional(async () => ({
      comments: await all((cursor) =>
        limit(() =>
          client.comments.list({
            block_id: id,
            start_cursor: cursor,
            page_size: 100,
          }),
        ),
      ),
    }));

  const linkedTitle = async (link: LinkToPage): Promise<string> => {
    if (link.type === 'page_id') {
      const page = await limit(() =>
        client.pages.retrieve({ page_id: link.page_id }),
      );
      return isFullPage(page) ? pageTitle(page.properties) : '';
    }
    if (link.type === 'database_id') {
      const database = await databaseObject(link.database_id);
      return database ? plainText(database.title) : '';
    }
    return '';
  };

  const databaseObject = async (
    databaseId: string,
  ): Promise<DatabaseObjectResponse | undefined> => {
    const database = await limit(() =>
      client.databases.retrieve({ database_id: databaseId }),
    );
    return 'data_sources' in database ? database : undefined;
  };

  const dataSourceIds = async (databaseId: string): Promise<string[]> =>
    (await databaseObject(databaseId))?.data_sources.map(({ id }) => id) ?? [];

  /** Rows from every data source of a database. Columns come from the first. */
  const database = async (
    databaseId: string,
  ): Promise<RawDatabase | undefined> => {
    const ids = await dataSourceIds(databaseId);
    const [first] = ids;
    if (!first) return undefined;
    const [dataSource, rows] = await Promise.all([
      limit(() => client.dataSources.retrieve({ data_source_id: first })),
      rowsOf(ids, queries.get(normalizeId(databaseId))),
    ]);
    return isFullDataSource(dataSource) ? { dataSource, rows } : undefined;
  };

  const rowsOf = async (
    dataSources: string[],
    query: DatabaseQuery = {},
  ): Promise<PageObjectResponse[]> => {
    const results = await Promise.all(
      dataSources.map((dataSourceId) =>
        all((cursor) =>
          limit(() =>
            client.dataSources.query({
              data_source_id: dataSourceId,
              ...query,
              start_cursor: cursor,
              page_size: 100,
            }),
          ),
        ),
      ),
    );
    return results.flat().filter(isFullPage);
  };

  return {
    async page(id) {
      const [page, comments] = await Promise.all([
        limit(() => client.pages.retrieve({ page_id: id })),
        fetchComments ? commentsOf(id) : NO_EXTRAS,
      ]);
      if (!isFullPage(page)) {
        throw new Error(
          `Notion returned a partial page for ${id}; check the integration's access.`,
        );
      }
      return { ...page, ...comments };
    },
    blocks,
    async *query(databaseId, query) {
      yield* await rowsOf(await dataSourceIds(databaseId), query);
    },
  };
}

async function* paginate<T>(
  fetchPage: (cursor: string | undefined) => Promise<Paginated<T>>,
): AsyncGenerator<T> {
  let cursor: string | undefined;
  do {
    const response = await fetchPage(cursor);
    yield* response.results;
    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);
}

/** Runs a fetch for extra data. If Notion says it is unavailable, records why instead of failing. */
async function optional(
  fetchExtra: () => Promise<BlockExtras>,
): Promise<BlockExtras> {
  try {
    return await fetchExtra();
  } catch (error) {
    if (!isUnavailable(error)) throw error;
    return { error: error.message };
  }
}

function isUnavailable(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string' &&
    UNAVAILABLE.has(error.code)
  );
}

function isFullBlock(block: { object: string }): block is BlockObjectResponse {
  return 'type' in block;
}

function isFullDataSource(
  source: GetDataSourceResponse,
): source is DataSourceObjectResponse {
  return 'properties' in source;
}

function isFullPage(page: { object: string }): page is PageObjectResponse {
  return page.object === 'page' && 'properties' in page;
}
