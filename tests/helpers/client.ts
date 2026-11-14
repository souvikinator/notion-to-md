/**
 * An in-memory stand-in for `@notionhq/client` that serves pages built with the helpers in
 * `notion.ts`. It paginates like the API, records every call and tracks requests in flight.
 */
import type { Client, PageObjectResponse } from '@notionhq/client';
import type { RawBlock } from '../../src/source/types';

export interface MockDatabase {
  title: string;
  /** Property schema of the data source, in display order. */
  schema: Record<string, { type: string }>;
  rows: PageObjectResponse[];
  /** Rows of further data sources, for databases with more than one. */
  extraSources?: PageObjectResponse[][];
}

export interface Workspace {
  pages: { page: PageObjectResponse; blocks: RawBlock[] }[];
  databases?: Record<string, MockDatabase>;
  /** Results per paginated response. Default 100, like the API. */
  pageSize?: number;
  /** Ids that answer with `object_not_found`, as Notion does without access. */
  forbidden?: string[];
}

export interface MockClient {
  client: Client;
  calls: string[];
  maxInFlight: () => number;
}

class NotFound extends Error {
  code = 'object_not_found';
}

export function mockClient(workspace: Workspace): MockClient {
  const calls: string[] = [];
  const pageSize = workspace.pageSize ?? 100;
  let inFlight = 0;
  let maxInFlight = 0;

  const childrenById = new Map<string, RawBlock[]>();
  const pagesById = new Map<string, PageObjectResponse>();
  const index = (parentId: string, blocks: RawBlock[]): void => {
    childrenById.set(parentId, blocks);
    for (const block of blocks) index(block.id, block.children ?? []);
  };
  for (const { page, blocks } of workspace.pages) {
    pagesById.set(page.id, page);
    index(page.id, blocks);
  }
  const dataSources = new Map<
    string,
    { database: MockDatabase; rows: PageObjectResponse[] }
  >();
  for (const [id, database] of Object.entries(workspace.databases ?? {})) {
    const sources = [database.rows, ...(database.extraSources ?? [])];
    sources.forEach((rows, index) => {
      dataSources.set(dataSourceId(id, index), { database, rows });
      for (const row of rows) pagesById.set(row.id, row);
    });
  }

  const call = async <T>(
    name: string,
    id: string,
    answer: () => T,
  ): Promise<T> => {
    calls.push(`${name}:${id}`);
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1));
      if (workspace.forbidden?.includes(id))
        throw new NotFound(`Could not find ${id}`);
      return answer();
    } finally {
      inFlight -= 1;
    }
  };

  const paginate = <T>(items: T[], cursor: string | undefined) => {
    const start = cursor ? Number(cursor) : 0;
    const end = start + pageSize;
    return {
      object: 'list',
      results: items.slice(start, end),
      has_more: end < items.length,
      next_cursor: end < items.length ? String(end) : null,
    };
  };

  const strip = ({ children: _children, ...block }: RawBlock) => block;

  const database = (id: string): MockDatabase => {
    const found = workspace.databases?.[id];
    if (!found) throw new NotFound(`No database ${id}`);
    return found;
  };

  const dataSource = (id: string) => {
    const found = dataSources.get(id);
    if (!found) throw new NotFound(`No data source ${id}`);
    return found;
  };

  const client = {
    blocks: {
      children: {
        list: (args: { block_id: string; start_cursor?: string }) =>
          call('blocks.children.list', args.block_id, () =>
            paginate(
              (childrenById.get(args.block_id) ?? []).map(strip),
              args.start_cursor,
            ),
          ),
      },
    },
    pages: {
      retrieve: (args: { page_id: string }) =>
        call('pages.retrieve', args.page_id, () => {
          const page = pagesById.get(args.page_id);
          if (!page) throw new NotFound(`No page ${args.page_id}`);
          return page;
        }),
    },
    databases: {
      retrieve: (args: { database_id: string }) =>
        call('databases.retrieve', args.database_id, () => {
          const found = database(args.database_id);
          const count = 1 + (found.extraSources?.length ?? 0);
          return {
            object: 'database',
            id: args.database_id,
            title: [{ type: 'text', plain_text: found.title }],
            data_sources: Array.from({ length: count }, (_, index) => ({
              id: dataSourceId(args.database_id, index),
              name: found.title,
            })),
          };
        }),
    },
    dataSources: {
      retrieve: (args: { data_source_id: string }) =>
        call('dataSources.retrieve', args.data_source_id, () => {
          const found = dataSource(args.data_source_id).database;
          const properties = Object.fromEntries(
            Object.entries(found.schema).map(([name, { type }], position) => [
              name,
              { id: String(position), name, type },
            ]),
          );
          return { object: 'data_source', id: args.data_source_id, properties };
        }),
      query: (args: { data_source_id: string; start_cursor?: string }) =>
        call('dataSources.query', args.data_source_id, () =>
          paginate(dataSource(args.data_source_id).rows, args.start_cursor),
        ),
    },
  };

  return {
    client: client as unknown as Client,
    calls,
    maxInFlight: () => maxInFlight,
  };
}

function dataSourceId(databaseId: string, index: number): string {
  return index === 0 ? `ds-${databaseId}` : `ds-${databaseId}-${String(index)}`;
}
