import type {
  BlockObjectResponse,
  DataSourceObjectResponse,
  PageObjectResponse,
  QueryDataSourceParameters,
} from '@notionhq/client';

/** The page fields the converter reads. A full `PageObjectResponse` satisfies it. */
export type RawPage = Pick<
  PageObjectResponse,
  'id' | 'url' | 'icon' | 'properties' | 'last_edited_time'
>;

export interface RawDatabase {
  /** Data source schema, used for column order. */
  dataSource: DataSourceObjectResponse;
  rows: PageObjectResponse[];
}

/** Data a source adds to a Notion block beyond what the blocks API returns. */
export interface BlockExtras {
  children?: RawBlock[];
  /** Rows of a `child_database` block. */
  database?: RawDatabase;
  /** Title of the page a `link_to_page` block points at. */
  title?: string;
  /** Why extra data for this block could not be fetched (for example, no access). */
  error?: string;
}

/** A Notion block with the extra data the converter needs already fetched. */
export type RawBlock = BlockObjectResponse & BlockExtras;

export type DatabaseQuery = Pick<QueryDataSourceParameters, 'filter' | 'sorts'>;

/**
 * Where page content comes from. `notion()` reads the Notion API; `fromBlocks()` reads saved JSON.
 * The converter passes ids as dashed UUIDs.
 */
export interface Source {
  page(id: string): Promise<RawPage>;
  blocks(id: string): Promise<RawBlock[]>;
  /** Lists the pages in a database. Needed by `pages()`. */
  query?(
    databaseId: string,
    query?: DatabaseQuery,
  ): AsyncIterable<PageObjectResponse>;
}
