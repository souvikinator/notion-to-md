import type * as M from 'mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import {
  toMarkdown,
  type Handle,
  type Options as ToMarkdownOptions,
} from 'mdast-util-to-markdown';

type Extension = NonNullable<ToMarkdownOptions['extensions']>[number];
import type {
  Block,
  Database,
  Embed,
  Footnote,
  Inline,
  List,
  ListItem,
  Media,
  PageRef,
  Table,
} from '../../tree/types';
import { blockChildren, inlineContent, toPlainText } from '../../tree/visit';
import { inlineToHtml } from '../html/convert';
import {
  handlerFor,
  type ContentNode,
  type HandlerHelpers,
  type Handlers,
  type MdxHandlerHelpers,
  type Renderer,
} from '../types';
import { databaseCells, linkLabel, type DatabaseCell } from '../shared';
import { phrasing, type Leaf } from './phrasing';

export interface MarkdownOptions<H extends HandlerHelpers = HandlerHelpers> {
  /** Custom output per node type. */
  handlers?: Handlers<H>;
  /**
   * Escape characters in Notion text that Markdown would read as formatting, so `2*3*4`
   * stays literal. Off by default: text typed as Markdown in Notion is kept as Markdown.
   */
  escape?: boolean;
}

/** What a Markdown dialect adds on top of GFM. MDX uses it to make the output valid JSX. */
export interface Dialect {
  extensions: Extension[];
  /** Escapes Notion text that would break the output even when `escape` is off. */
  escapeText: (text: string) => string;
  /** Escapes HTML written into the output, such as toggle summaries. */
  escapeHtml: (html: string) => string;
}

const unchanged = (value: string): string => value;
const GFM: Dialect = {
  extensions: [],
  escapeText: unchanged,
  escapeHtml: unchanged,
};

interface Flavor extends Required<MarkdownOptions<MdxHandlerHelpers>> {
  dialect: Dialect;
}

export function createMarkdownRenderer(
  options: MarkdownOptions<MdxHandlerHelpers>,
  dialect: Dialect = GFM,
): Renderer {
  const flavor: Flavor = { handlers: {}, escape: false, ...options, dialect };
  return {
    render: (document) => {
      // A converter per render keeps imports from one page out of the next.
      const converter = createConverter(flavor);
      const body = converter.serialize([
        ...converter.blocks(document.children),
        ...converter.footnotes(document.footnotes ?? []),
      ]);
      const imports = converter.imports();
      return imports.length > 0 ? `${imports.join('\n')}\n\n${body}` : body;
    },
  };
}

function createConverter(flavor: Flavor) {
  const imports = new Set<string>();
  const settings: ToMarkdownOptions = {
    extensions: [
      gfmToMarkdown({ tablePipeAlign: false }),
      ...flavor.dialect.extensions,
    ],
    bullet: '-',
    listItemIndent: 'one',
    rule: '-',
    handlers: { text: textHandler(flavor) },
  };

  const serialize = (nodes: M.RootContent[]): string =>
    nodes.length === 0
      ? ''
      : toMarkdown({ type: 'root', children: nodes }, settings);

  const serializeInline = (nodes: M.PhrasingContent[]): string =>
    serialize([{ type: 'paragraph', children: nodes }]).trimEnd();

  const custom = (
    node: ContentNode,
    fallback: () => M.RootContent[],
  ): string | undefined => {
    const handler = handlerFor(flavor.handlers, node);
    return handler?.(node, {
      addImport: (statement) => imports.add(statement),
      content: () => serializeInline(inline(inlineContent(node) ?? [])),
      children: () => serialize(childBlocks(node)).trimEnd(),
      fallback: () => serialize(fallback()).trimEnd(),
    });
  };

  const blocks = (nodes: Block[]): M.BlockContent[] => nodes.flatMap(block);

  /** List items only mean something inside their list, so a list's children are rendered as one. */
  const childBlocks = (node: ContentNode): M.BlockContent[] =>
    node.type === 'list' ? [list(node)] : blocks(blockChildren(node));

  const block = (node: Block): M.BlockContent[] => {
    const output = custom(node, () => builtInBlock(node));
    return output === undefined
      ? builtInBlock(node)
      : [{ type: 'html', value: output }];
  };

  const inline = (nodes: Inline[], inTable = false): M.PhrasingContent[] => {
    const builtIn: Leaf = (node, convert) =>
      builtInInline(node, inTable, convert);
    const withHandler: Leaf = (node, convert) =>
      inlineLeaf(node, () => builtIn(node, convert));
    if (!flavor.handlers.text) return phrasing(nodes, withHandler);

    // A text handler owns a text's formatting, so texts are not merged with their neighbours.
    return nodes.flatMap((node) =>
      node.type === 'text'
        ? inlineLeaf(node, () => phrasing([node], builtIn))
        : withHandler(node, (children) => inline(children, inTable)),
    );
  };

  const inlineLeaf = (
    node: Inline,
    builtIn: () => M.PhrasingContent[],
  ): M.PhrasingContent[] => {
    const output = custom(node, () => [
      { type: 'paragraph', children: builtIn() },
    ]);
    return output === undefined ? builtIn() : [{ type: 'html', value: output }];
  };

  const paragraph = (nodes: Inline[]): M.BlockContent[] =>
    nodes.length === 0 ? [] : [{ type: 'paragraph', children: inline(nodes) }];

  /** A block's own text followed by its nested blocks. */
  const body = (node: Block): M.BlockContent[] => [
    ...paragraph(inlineContent(node) ?? []),
    ...blocks(blockChildren(node)),
  ];

  const details = (summary: string, children: Block[]): M.BlockContent[] => [
    { type: 'html', value: `<details>\n<summary>${summary}</summary>` },
    ...blocks(children),
    { type: 'html', value: '</details>' },
  ];

  const link = (url: string, children: M.PhrasingContent[]): M.Paragraph => ({
    type: 'paragraph',
    children: [{ type: 'link', url, children }],
  });

  // A flat switch over every block type keeps the built-in output for each in one place.
  // eslint-disable-next-line complexity
  const builtInBlock = (node: Block): M.BlockContent[] => {
    switch (node.type) {
      case 'paragraph':
        return body(node);
      case 'heading':
        if (node.toggleable) {
          const level = String(node.level);
          return details(
            `<h${level}>${summaryHtml(node.content)}</h${level}>`,
            node.children,
          );
        }
        return node.content.length === 0
          ? blocks(node.children)
          : [
              {
                type: 'heading',
                depth: node.level,
                children: inline(node.content),
              },
              ...blocks(node.children),
            ];
      case 'list':
        return [list(node)];
      case 'listItem':
        return [{ type: 'list', spread: false, children: [listItem(node)] }];
      case 'quote':
        return blockquote(body(node));
      case 'callout': {
        const icon: Inline[] = node.icon
          ? [{ type: 'text', value: `${node.icon} `, marks: {} }]
          : [];
        return blockquote([
          ...paragraph([...icon, ...node.content]),
          ...blocks(node.children),
        ]);
      }
      case 'toggle':
        return details(summaryHtml(node.content), node.children);
      case 'code':
        return [
          { type: 'code', lang: node.language || null, value: node.value },
          ...paragraph(node.caption),
        ];
      case 'equation':
        return [{ type: 'html', value: `$$\n${node.value}\n$$` }];
      case 'divider':
        return [{ type: 'thematicBreak' }];
      case 'table':
        return table(node);
      case 'columns':
      case 'column':
        return blocks(node.children);
      case 'media':
        return [media(node)];
      case 'embed':
        return [link(node.url, captionOrLabel(node))];
      case 'pageRef':
        return [link(node.url, captionOrLabel(node))];
      case 'database':
        return database(node);
      case 'tableOfContents':
      case 'unknown':
        return [];
    }
  };

  const builtInInline = (
    node: Inline,
    inTable: boolean,
    convert: (nodes: Inline[]) => M.PhrasingContent[],
  ): M.PhrasingContent[] => {
    switch (node.type) {
      case 'text':
        return [
          node.marks.code
            ? { type: 'inlineCode', value: node.value }
            : { type: 'text', value: node.value },
        ];
      case 'link':
      case 'pageLink':
        return [
          { type: 'link', url: node.url, children: convert(node.children) },
        ];
      case 'inlineEquation': {
        const value = inTable ? node.value.replaceAll('|', '\\|') : node.value;
        return [{ type: 'html', value: `$${value}$` }];
      }
      case 'break':
        return [
          inTable ? { type: 'html', value: '<br />' } : { type: 'break' },
        ];
      case 'footnoteReference':
        return [
          {
            type: 'footnoteReference',
            identifier: node.label,
            label: node.label,
          },
        ];
    }
  };

  const blockquote = (children: M.BlockContent[]): M.BlockContent[] =>
    children.length === 0 ? [] : [{ type: 'blockquote', children }];

  const captionOrLabel = (
    node: Media | Embed | PageRef | Database,
  ): M.PhrasingContent[] =>
    'caption' in node && node.caption.length > 0
      ? inline(node.caption)
      : [{ type: 'text', value: linkLabel(node) }];

  const summaryHtml = (nodes: Inline[]): string => {
    const html = inlineToHtml(nodes);
    return flavor.dialect.escapeHtml(html);
  };

  const list = (node: List): M.List => ({
    type: 'list',
    ordered: node.kind === 'numbered',
    start: node.kind === 'numbered' ? node.start : null,
    spread: false,
    children: node.children.map(listItem),
  });

  const listItem = (node: ListItem): M.ListItem => {
    const output = custom(node, () => body(node));
    return {
      type: 'listItem',
      spread: false,
      checked: node.checked ?? null,
      children:
        output === undefined ? body(node) : [{ type: 'html', value: output }],
    };
  };

  const tableRow = (cells: Inline[][], width: number): M.TableRow => ({
    type: 'tableRow',
    children: Array.from({ length: width }, (_, index) => ({
      type: 'tableCell',
      children: inline(cells[index] ?? [], true),
    })),
  });

  const table = (node: Table): M.BlockContent[] => {
    const width = Math.max(0, ...node.rows.map((row) => row.cells.length));
    if (width === 0) return [];
    // Markdown tables need a header row; a Notion table without one gets an empty header.
    const rows = node.columnHeader
      ? node.rows.map((row) => row.cells)
      : [[], ...node.rows.map((row) => row.cells)];
    return [
      { type: 'table', children: rows.map((cells) => tableRow(cells, width)) },
    ];
  };

  const media = (node: Media): M.Paragraph => {
    if (node.kind === 'image') {
      return {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url: node.url,
            alt: toPlainText(node.caption) || null,
          },
        ],
      };
    }
    return link(node.url, captionOrLabel(node));
  };

  const database = (node: Database): M.BlockContent[] => {
    const title = link(node.url, captionOrLabel(node));
    if (node.rows.length === 0) return [title];
    const cell = ({ text, url }: DatabaseCell): M.TableCell => {
      const value: M.Text = { type: 'text', value: text };
      return {
        type: 'tableCell',
        children: url ? [{ type: 'link', url, children: [value] }] : [value],
      };
    };
    const row = (cells: DatabaseCell[]): M.TableRow => ({
      type: 'tableRow',
      children: cells.map(cell),
    });
    const header = row(node.columns.map((column) => ({ text: column })));
    return [
      title,
      { type: 'table', children: [header, ...databaseCells(node).map(row)] },
    ];
  };

  const footnotes = (notes: Footnote[]): M.FootnoteDefinition[] =>
    notes.map(({ label, content }) => ({
      type: 'footnoteDefinition',
      identifier: label,
      label,
      children: [{ type: 'paragraph', children: inline(content) }],
    }));

  return { blocks, footnotes, serialize, imports: () => [...imports] };
}

/**
 * Text output. With escaping off, only characters that would break the document's
 * structure are escaped: pipes inside tables, and `{` `<` in MDX (they start JSX).
 */
function textHandler(flavor: Flavor): Handle {
  return (node: M.Text, _, state, info) => {
    if (flavor.escape) return escapeOutsideUrls(node.value, state, info);
    let value = node.value;
    if (state.stack.includes('tableCell')) value = value.replaceAll('|', '\\|');
    return flavor.dialect.escapeText(value);
  };
}

const BARE_URL = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+)/;

/** Escapes text except bare URLs: a backslash inside a URL would stop GitHub from linking it. */
function escapeOutsideUrls(
  value: string,
  state: Parameters<Handle>[2],
  info: Parameters<Handle>[3],
): string {
  const parts = value.split(BARE_URL);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      const before = parts[index - 1]?.at(-1) ?? info.before;
      const after = parts[index + 1]?.[0] ?? info.after;
      return state.safe(part, { ...info, before, after });
    })
    .join('');
}
