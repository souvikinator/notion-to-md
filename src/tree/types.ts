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

export interface Text {
  type: 'text';
  value: string;
  marks: Marks;
}

export interface Link {
  type: 'link';
  url: string;
  children: Inline[];
}

/** A link to another Notion page. `url` starts as the Notion URL and can be rewritten by plugins. */
export interface PageLink {
  type: 'pageLink';
  pageId: string;
  blockId?: string;
  url: string;
  children: Inline[];
}

export interface InlineEquation {
  type: 'inlineEquation';
  value: string;
}

export interface Break {
  type: 'break';
}

export type Inline = Text | Link | PageLink | InlineEquation | Break;

interface TextBlock {
  id: string;
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

export interface List {
  type: 'list';
  id: string;
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

export interface Code {
  type: 'code';
  id: string;
  language: string;
  value: string;
  caption: Inline[];
}

export interface Equation {
  type: 'equation';
  id: string;
  value: string;
}

export interface Divider {
  type: 'divider';
  id: string;
}

export interface TableRow {
  id: string;
  cells: Inline[][];
}

export interface Table {
  type: 'table';
  id: string;
  columnHeader: boolean;
  rowHeader: boolean;
  rows: TableRow[];
}

export interface Column {
  type: 'column';
  id: string;
  children: Block[];
}

export interface Columns {
  type: 'columns';
  id: string;
  children: Column[];
}

export type MediaKind = 'image' | 'video' | 'audio' | 'file' | 'pdf';

/** A file shown in the page. Notion-hosted URLs expire, so plugins can replace `url`. */
export interface Media {
  type: 'media';
  id: string;
  kind: MediaKind;
  url: string;
  hosted: boolean;
  /** The file name from Notion, or the last part of the URL path. */
  name: string;
  caption: Inline[];
}

export interface Embed {
  type: 'embed';
  id: string;
  kind: 'bookmark' | 'embed' | 'link_preview';
  url: string;
  caption: Inline[];
}

/** A child page or a "link to page" block. */
export interface PageRef {
  type: 'pageRef';
  id: string;
  pageId: string;
  title: string;
  url: string;
}

export interface DatabaseRow {
  pageId: string;
  url: string;
  properties: Properties;
}

export interface Database {
  type: 'database';
  id: string;
  title: string;
  url: string;
  /** Property names in display order, title first. Empty when rows were not fetched. */
  columns: string[];
  rows: DatabaseRow[];
}

export interface TableOfContents {
  type: 'tableOfContents';
  id: string;
}

/** A block type this library does not convert. Kept so nothing disappears silently. */
export interface Unknown {
  type: 'unknown';
  id: string;
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

export interface Document {
  type: 'root';
  id: string;
  title: string;
  url: string;
  icon?: string;
  properties: Properties;
  children: Block[];
}

export type Node = Document | Block | Inline;
