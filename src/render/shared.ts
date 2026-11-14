import type { Database, Embed, Media, PageRef } from '../tree/types';
import { displayValue } from '../tree/values';

/** Text for a link to this node when Notion gives no caption. */
export function linkLabel(node: Media | Embed | PageRef | Database): string {
  switch (node.type) {
    case 'media':
      return node.name;
    case 'embed':
      return node.url;
    case 'pageRef':
    case 'database':
      return node.title || node.url;
  }
}

export interface DatabaseCell {
  text: string;
  /** Set on the title column, which links to the row's page. */
  url?: string;
}

/** A database's rows as display text, in column order. */
export function databaseCells(node: Database): DatabaseCell[][] {
  const [titleColumn] = node.columns;
  return node.rows.map((row) =>
    node.columns.map((column) => {
      const text = displayValue(row.properties[column] ?? null);
      return column === titleColumn ? { text, url: row.url } : { text };
    }),
  );
}
