/** Notion color name, e.g. `red` or `red_background`. */
export type Color = string;

export interface Marks {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: Color;
}

/** Every node can carry `data`: free space for plugins to pass information to handlers. */
interface Base {
  data?: Record<string, unknown>;
}

interface BlockBase extends Base {
  /** The Notion block id. Notion has no list block, so a list uses its first item's id plus `:list`. */
  id: string;
  /** Comments on this block, when the source fetched them. */
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  createdTime: string;
  content: Inline[];
}

export interface Text extends Base {
  type: 'text';
  value: string;
  marks: Marks;
}

export interface Link extends Base {
  type: 'link';
  url: string;
  children: Inline[];
}

/** A link to another Notion page. `url` starts as the Notion URL and can be rewritten by plugins. */
export interface PageLink extends Base {
  type: 'pageLink';
  pageId: string;
  blockId?: string;
  url: string;
  children: Inline[];
}

export interface InlineEquation extends Base {
  type: 'inlineEquation';
  value: string;
}

export interface Break extends Base {
  type: 'break';
}

/** A reference to one of the document's `footnotes`. */
export interface FootnoteReference extends Base {
  type: 'footnoteReference';
  label: string;
}

export type Inline =
  Text | Link | PageLink | InlineEquation | Break | FootnoteReference;

interface TextBlock extends BlockBase {
  content: Inline[];
  children: Block[];
  color?: Color;
}

export interface Paragraph extends TextBlock {
  type: 'paragraph';
}

export interface Heading extends TextBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  toggleable: boolean;
}

export interface List extends BlockBase {
  type: 'list';
  kind: 'bulleted' | 'numbered' | 'todo';
  start: number;
  style?: 'numbers' | 'letters' | 'roman';
  children: ListItem[];
}

export interface ListItem extends TextBlock {
  type: 'listItem';
  /** Set for to-do items only. */
  checked?: boolean;
}

export interface Quote extends TextBlock {
  type: 'quote';
}

export interface Callout extends TextBlock {
  type: 'callout';
  /** Emoji, or `:name:` for a custom emoji. */
  icon?: string;
}

export interface Toggle extends TextBlock {
  type: 'toggle';
}

export interface Code extends BlockBase {
  type: 'code';
  language: string;
  value: string;
  caption: Inline[];
}

export interface Equation extends BlockBase {
  type: 'equation';
  value: string;
}

export interface Divider extends BlockBase {
  type: 'divider';
}

export interface TableRow {
  id: string;
  cells: Inline[][];
}

export interface Table extends BlockBase {
  type: 'table';
  columnHeader: boolean;
  rowHeader: boolean;
  rows: TableRow[];
}

export interface Column extends BlockBase {
  type: 'column';
  children: Block[];
}

export interface Columns extends BlockBase {
  type: 'columns';
  children: Column[];
}

export type MediaKind = 'image' | 'video' | 'audio' | 'file' | 'pdf';

/** A file shown in the page. Notion-hosted URLs expire, so plugins can replace `url`. */
export interface Media extends BlockBase {
  type: 'media';
  kind: MediaKind;
  url: string;
  hosted: boolean;
  /** The file name from Notion, or the last part of the URL path. */
  name: string;
  caption: Inline[];
}

export interface Embed extends BlockBase {
  type: 'embed';
  kind: 'bookmark' | 'embed' | 'link_preview';
  url: string;
  caption: Inline[];
}

/** A child page or a "link to page" block. */
export interface PageRef extends BlockBase {
  type: 'pageRef';
  pageId: string;
  title: string;
  url: string;
}

export interface DatabaseRow {
  pageId: string;
  url: string;
  properties: Properties;
}

export interface Database extends BlockBase {
  type: 'database';
  title: string;
  url: string;
  /** Property names in display order, title first. Empty when rows were not fetched. */
  columns: string[];
  rows: DatabaseRow[];
}

export interface TableOfContents extends BlockBase {
  type: 'tableOfContents';
}

/** A block type this library does not convert. Kept so nothing disappears silently. */
export interface Unknown extends BlockBase {
  type: 'unknown';
  notionType: string;
}

export type Block =
  | Paragraph
  | Heading
  | List
  | ListItem
  | Quote
  | Callout
  | Toggle
  | Code
  | Equation
  | Divider
  | Table
  | Columns
  | Column
  | Media
  | Embed
  | PageRef
  | Database
  | TableOfContents
  | Unknown;

export interface FileValue {
  name: string;
  url: string;
  hosted: boolean;
}

/** A page property simplified to plain data. */
export type PropertyValue =
  string | number | boolean | null | string[] | FileValue[] | PropertyValue[];

export type Properties = Record<string, PropertyValue>;

export interface Document extends Base {
  type: 'root';
  id: string;
  title: string;
  url: string;
  icon?: string;
  properties: Properties;
  /** Comments on the page itself, when the source fetched them. */
  comments?: Comment[];
  children: Block[];
  /** Notes rendered at the end of the document, referenced by `footnoteReference` nodes. */
  footnotes?: Footnote[];
}

export interface Footnote {
  label: string;
  content: Inline[];
}

export type Node = Document | Block | Inline;
