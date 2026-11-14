import type { RichTextItemResponse } from '@notionhq/client';
import type { RawBlock, RawDatabase, RawPage } from '../source/types';
import { normalizeId, notionUrl } from './ids';
import { pageTitle, properties } from './properties';
import { plainText, richText } from './rich-text';
import type {
  Block,
  Color,
  Database,
  Document,
  Heading,
  Inline,
  List,
  ListItem,
  Media,
  MediaKind,
} from './types';

export type Warn = (message: string) => void;

type ListKind = List['kind'];
type Icon = RawPage['icon'];
type MediaContent = ReturnType<typeof mediaContent>;

/** Converts a fetched Notion page into the document tree. */
export function normalize(
  page: RawPage,
  blocks: RawBlock[],
  warn: Warn,
): Document {
  const icon = iconText(page.icon);
  return {
    type: 'root',
    id: normalizeId(page.id),
    title: pageTitle(page.properties),
    url: page.url,
    ...(icon && { icon }),
    properties: properties(page.properties),
    children: normalizeBlocks(blocks, warn),
  };
}

export function normalizeBlocks(blocks: RawBlock[], warn: Warn): Block[] {
  const result: Block[] = [];
  for (const block of blocks) {
    for (const node of normalizeBlock(block, warn)) {
      if (node.type === 'listItem') addListItem(result, node, block);
      else result.push(node);
    }
  }
  return result;
}

/** Notion has no list block, only list items; consecutive items of the same kind form one list. */
function addListItem(result: Block[], item: ListItem, block: RawBlock): void {
  const kind = listKind(block);
  const last = result.at(-1);
  if (last?.type === 'list' && last.kind === kind) {
    last.children.push(item);
    return;
  }
  const list: List = {
    type: 'list',
    id: item.id,
    kind,
    start: 1,
    children: [item],
  };
  if (block.type === 'numbered_list_item') {
    list.start = block.numbered_list_item.list_start_index ?? 1;
    const style = block.numbered_list_item.list_format;
    if (style) list.style = style;
  }
  result.push(list);
}

function listKind(block: RawBlock): ListKind {
  if (block.type === 'numbered_list_item') return 'numbered';
  if (block.type === 'to_do') return 'todo';
  return 'bulleted';
}

// One flat switch over every Notion block type keeps the mapping in a single place.
// eslint-disable-next-line complexity
function normalizeBlock(block: RawBlock, warn: Warn): Block[] {
  const id = normalizeId(block.id);
  const children = (): Block[] => normalizeBlocks(block.children ?? [], warn);
  if (block.error)
    warn(
      `Some content of "${block.type}" block ${id} could not be fetched: ${block.error}`,
    );

  switch (block.type) {
    case 'paragraph':
      return [
        { type: 'paragraph', ...textBlock(id, block.paragraph, children()) },
      ];
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
    case 'heading_4': {
      const { level, data } = heading(block);
      return [
        {
          type: 'heading',
          level,
          toggleable: data.is_toggleable,
          ...textBlock(id, data, children()),
        },
      ];
    }
    case 'bulleted_list_item':
      return [
        {
          type: 'listItem',
          ...textBlock(id, block.bulleted_list_item, children()),
        },
      ];
    case 'numbered_list_item':
      return [
        {
          type: 'listItem',
          ...textBlock(id, block.numbered_list_item, children()),
        },
      ];
    case 'to_do':
      return [
        {
          type: 'listItem',
          checked: block.to_do.checked,
          ...textBlock(id, block.to_do, children()),
        },
      ];
    case 'quote':
      return [{ type: 'quote', ...textBlock(id, block.quote, children()) }];
    case 'toggle':
      return [{ type: 'toggle', ...textBlock(id, block.toggle, children()) }];
    case 'callout': {
      const icon = iconText(block.callout.icon);
      return [
        {
          type: 'callout',
          ...(icon && { icon }),
          ...textBlock(id, block.callout, children()),
        },
      ];
    }
    case 'code':
      return [
        {
          type: 'code',
          id,
          language: codeLanguage(block.code.language),
          value: plainText(block.code.rich_text),
          caption: richText(block.code.caption),
        },
      ];
    case 'equation':
      return [{ type: 'equation', id, value: block.equation.expression }];
    case 'divider':
      return [{ type: 'divider', id }];
    case 'table':
      return [
        {
          type: 'table',
          id,
          columnHeader: block.table.has_column_header,
          rowHeader: block.table.has_row_header,
          rows: (block.children ?? []).flatMap((row) =>
            row.type === 'table_row'
              ? [
                  {
                    id: normalizeId(row.id),
                    cells: row.table_row.cells.map(richText),
                  },
                ]
              : [],
          ),
        },
      ];
    case 'column_list':
      return [
        {
          type: 'columns',
          id,
          children: children().filter((child) => child.type === 'column'),
        },
      ];
    case 'column':
      return [{ type: 'column', id, children: children() }];
    case 'image':
    case 'video':
    case 'audio':
    case 'file':
    case 'pdf':
      return [
        media(
          id,
          block.type,
          mediaContent(block),
          block.type === 'file' ? block.file.name : '',
        ),
      ];
    case 'bookmark':
      return [
        {
          type: 'embed',
          id,
          kind: 'bookmark',
          url: block.bookmark.url,
          caption: richText(block.bookmark.caption),
        },
      ];
    case 'embed':
      return [
        {
          type: 'embed',
          id,
          kind: 'embed',
          url: block.embed.url,
          caption: richText(block.embed.caption),
        },
      ];
    case 'link_preview':
      return [
        {
          type: 'embed',
          id,
          kind: 'link_preview',
          url: block.link_preview.url,
          caption: [],
        },
      ];
    case 'child_page':
      return [pageRef(id, id, block.child_page.title)];
    case 'link_to_page':
      if (block.link_to_page.type === 'page_id') {
        return [
          pageRef(
            id,
            normalizeId(block.link_to_page.page_id),
            block.title ?? '',
          ),
        ];
      }
      if (block.link_to_page.type === 'database_id') {
        return [pageRef(id, normalizeId(block.link_to_page.database_id), '')];
      }
      return [];
    case 'child_database':
      return [database(id, block.child_database.title, block.database)];
    case 'table_of_contents':
      return [{ type: 'tableOfContents', id }];
    case 'synced_block':
    case 'tab':
    case 'template':
    case 'meeting_notes':
    case 'transcription':
      return children();
    case 'breadcrumb':
      return [];
    case 'table_row':
    case 'unsupported':
      warn(`Skipped unsupported Notion block "${block.type}" (${id}).`);
      return [{ type: 'unknown', id, notionType: block.type }];
  }
}

function textBlock(
  id: string,
  data: { rich_text: RichTextItemResponse[]; color: Color },
  children: Block[],
): { id: string; content: Inline[]; children: Block[]; color?: Color } {
  const base = { id, content: richText(data.rich_text), children };
  return data.color === 'default' ? base : { ...base, color: data.color };
}

type HeadingBlock = Extract<RawBlock, { type: `heading_${number}` }>;
type HeadingData = Extract<RawBlock, { type: 'heading_1' }>['heading_1'];

function heading(block: HeadingBlock): {
  level: Heading['level'];
  data: HeadingData;
} {
  switch (block.type) {
    case 'heading_1':
      return { level: 1, data: block.heading_1 };
    case 'heading_2':
      return { level: 2, data: block.heading_2 };
    case 'heading_3':
      return { level: 3, data: block.heading_3 };
    case 'heading_4':
      return { level: 4, data: block.heading_4 };
  }
}

function mediaContent(block: Extract<RawBlock, { type: MediaKind }>) {
  switch (block.type) {
    case 'image':
      return block.image;
    case 'video':
      return block.video;
    case 'audio':
      return block.audio;
    case 'file':
      return block.file;
    case 'pdf':
      return block.pdf;
  }
}

function media(
  id: string,
  kind: MediaKind,
  content: MediaContent,
  name: string,
): Media {
  const hosted = content.type === 'file';
  const url = hosted ? content.file.url : content.external.url;
  return {
    type: 'media',
    id,
    kind,
    url,
    hosted,
    name: name || fileNameFromUrl(url) || kind,
    caption: richText(content.caption),
  };
}

function pageRef(id: string, pageId: string, title: string): Block {
  return { type: 'pageRef', id, pageId, title, url: notionUrl(pageId) };
}

function database(
  id: string,
  title: string,
  raw: RawDatabase | undefined,
): Database {
  const node: Database = {
    type: 'database',
    id,
    title,
    url: notionUrl(id),
    columns: [],
    rows: [],
  };
  if (!raw) return node;

  const schema = Object.values(raw.dataSource.properties);
  node.columns = [
    ...schema.filter((property) => property.type === 'title'),
    ...schema.filter((property) => property.type !== 'title'),
  ].map((property) => property.name);
  node.rows = raw.rows.map((row) => ({
    pageId: normalizeId(row.id),
    url: row.url,
    properties: properties(row.properties),
  }));
  return node;
}

function iconText(icon: Icon): string | undefined {
  if (icon?.type === 'emoji') return icon.emoji;
  if (icon?.type === 'custom_emoji') return `:${icon.custom_emoji.name}:`;
  return undefined;
}

function fileNameFromUrl(url: string): string {
  try {
    const segment = new URL(url).pathname.split('/').pop() ?? '';
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

/** Notion's "plain text" is not a language name, and fence info strings cannot contain spaces. */
function codeLanguage(language: string): string {
  return language === 'plain text' ? 'text' : language.replaceAll(' ', '-');
}
