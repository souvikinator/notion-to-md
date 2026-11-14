/**
 * Builders for realistic Notion API objects, shaped like `@notionhq/client` v5 responses.
 */
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client';
import type { RawBlock } from '../../src/source/types';

export const PAGE_ID = '11111111-1111-4111-8111-111111111111';

let counter = 0;
export function nextId(): string {
  counter += 1;
  return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
}

interface TextOptions {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
  link?: string;
}

type RichText = RichTextItemResponse;
export type Rich = string | RichText[];

const annotations = (options: TextOptions) => ({
  bold: options.bold ?? false,
  italic: options.italic ?? false,
  strikethrough: options.strikethrough ?? false,
  underline: options.underline ?? false,
  code: options.code ?? false,
  color: options.color ?? 'default',
});

export function text(content: string, options: TextOptions = {}): RichText {
  return {
    type: 'text',
    text: { content, link: options.link ? { url: options.link } : null },
    plain_text: content,
    href: options.link ?? null,
    annotations: annotations(options),
  } as RichText;
}

export function pageMention(
  pageId: string,
  title: string,
  options: TextOptions = {},
): RichText {
  return {
    type: 'mention',
    mention: { type: 'page', page: { id: pageId } },
    plain_text: title,
    href: `https://www.notion.so/${pageId.replaceAll('-', '')}`,
    annotations: annotations(options),
  } as RichText;
}

export function userMention(name: string): RichText {
  return {
    type: 'mention',
    mention: { type: 'user', user: { object: 'user', id: nextId() } },
    plain_text: `@${name}`,
    href: null,
    annotations: annotations({}),
  } as RichText;
}

export function dateMention(date: string): RichText {
  return {
    type: 'mention',
    mention: {
      type: 'date',
      date: { start: date, end: null, time_zone: null },
    },
    plain_text: date,
    href: null,
    annotations: annotations({}),
  } as RichText;
}

export function inlineEquation(expression: string): RichText {
  return {
    type: 'equation',
    equation: { expression },
    plain_text: expression,
    href: null,
    annotations: annotations({}),
  } as RichText;
}

const rich = (value: Rich): RichText[] =>
  typeof value === 'string' ? [text(value)] : value;

export function block(
  type: string,
  data: object,
  children: RawBlock[] = [],
): RawBlock {
  return {
    object: 'block',
    id: nextId(),
    type,
    [type]: data,
    parent: { type: 'page_id', page_id: PAGE_ID },
    created_time: '2026-01-01T00:00:00.000Z',
    last_edited_time: '2026-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'user' },
    last_edited_by: { object: 'user', id: 'user' },
    has_children: children.length > 0,
    in_trash: false,
    archived: false,
    ...(children.length > 0 && { children }),
  } as unknown as RawBlock;
}

const textData = (value: Rich, extra: object = {}) => ({
  rich_text: rich(value),
  color: 'default',
  ...extra,
});

export const paragraph = (value: Rich, children?: RawBlock[]) =>
  block('paragraph', textData(value), children);
export const heading = (
  level: 1 | 2 | 3 | 4,
  value: Rich,
  children?: RawBlock[],
) =>
  block(
    `heading_${String(level)}`,
    textData(value, { is_toggleable: Boolean(children?.length) }),
    children,
  );
export const bullet = (value: Rich, children?: RawBlock[]) =>
  block('bulleted_list_item', textData(value), children);
export const numbered = (
  value: Rich,
  children?: RawBlock[],
  extra: object = {},
) => block('numbered_list_item', textData(value, extra), children);
export const todo = (checked: boolean, value: Rich, children?: RawBlock[]) =>
  block('to_do', textData(value, { checked }), children);
export const quote = (value: Rich, children?: RawBlock[]) =>
  block('quote', textData(value), children);
export const toggle = (value: Rich, children?: RawBlock[]) =>
  block('toggle', textData(value), children);
export const callout = (icon: string, value: Rich, children?: RawBlock[]) =>
  block(
    'callout',
    textData(value, { icon: { type: 'emoji', emoji: icon } }),
    children,
  );
export const code = (value: Rich, language = 'javascript') =>
  block('code', { rich_text: rich(value), language, caption: [] });
export const equation = (expression: string) =>
  block('equation', { expression });
export const divider = () => block('divider', {});
export const tableOfContents = () =>
  block('table_of_contents', { color: 'default' });
export const breadcrumb = () => block('breadcrumb', {});
export const unsupported = () => block('unsupported', {});

export function table(
  rows: Rich[][],
  options: { columnHeader?: boolean; rowHeader?: boolean } = {},
): RawBlock {
  return block(
    'table',
    {
      table_width: rows[0]?.length ?? 0,
      has_column_header: options.columnHeader ?? true,
      has_row_header: options.rowHeader ?? false,
    },
    rows.map((cells) => block('table_row', { cells: cells.map(rich) })),
  );
}

export const columns = (...columnChildren: RawBlock[][]) =>
  block(
    'column_list',
    {},
    columnChildren.map((children) => block('column', {}, children)),
  );

export function media(
  kind: 'image' | 'video' | 'audio' | 'file' | 'pdf',
  url: string,
  options: { hosted?: boolean; caption?: Rich; name?: string } = {},
): RawBlock {
  const source =
    options.hosted === false
      ? { type: 'external', external: { url } }
      : {
          type: 'file',
          file: { url, expiry_time: '2026-01-01T01:00:00.000Z' },
        };
  return block(kind, {
    ...source,
    caption: options.caption ? rich(options.caption) : [],
    ...(kind === 'file' && { name: options.name ?? 'file.bin' }),
  });
}

export const bookmark = (url: string, caption?: Rich) =>
  block('bookmark', { url, caption: caption ? rich(caption) : [] });
export const embed = (url: string) => block('embed', { url, caption: [] });
export const childPage = (title: string, children?: RawBlock[]) =>
  block('child_page', { title }, children);
export const linkToPage = (pageId: string) =>
  block('link_to_page', { type: 'page_id', page_id: pageId });
export const childDatabase = (title: string) =>
  block('child_database', { title });
export function syncedBlock(
  children: RawBlock[],
  syncedFrom?: string,
): RawBlock {
  return block(
    'synced_block',
    {
      synced_from: syncedFrom
        ? { type: 'block_id', block_id: syncedFrom }
        : null,
    },
    children,
  );
}

export type Property = PageObjectResponse['properties'][string];

export const titleProperty = (value: string): Property => ({
  id: 'title',
  type: 'title',
  title: [text(value)],
});

export function page(
  properties: Record<string, Property> = {},
  id = PAGE_ID,
): PageObjectResponse {
  return {
    object: 'page',
    id,
    created_time: '2026-01-01T00:00:00.000Z',
    last_edited_time: '2026-01-01T00:00:00.000Z',
    in_trash: false,
    is_archived: false,
    is_locked: false,
    url: `https://www.notion.so/Page-${id.replaceAll('-', '')}`,
    public_url: null,
    parent: { type: 'workspace', workspace: true },
    properties: { Name: titleProperty('Test page'), ...properties },
    icon: null,
    cover: null,
    created_by: { object: 'user', id: 'user' },
    last_edited_by: { object: 'user', id: 'user' },
  } as unknown as PageObjectResponse;
}
