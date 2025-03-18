import type {
  ListBlockChildrenResponse,
  ListCommentsResponse,
  PageObjectResponse,
  RichTextItemResponse,
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';

export type BlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'bulleted_list_item'
  | 'numbered_list_item'
  | 'quote'
  | 'to_do'
  | 'toggle'
  | 'code'
  | 'image'
  | 'video'
  | 'file'
  | 'pdf'
  | 'bookmark'
  | 'equation'
  | 'divider'
  | 'table'
  | 'column'
  | 'column_list'
  | 'link_preview'
  | 'synced_block'
  | 'template'
  | 'link_to_page'
  | 'table_of_contents'
  | 'child_page'
  | 'child_database'
  | 'breadcrumb'
  | 'callout'
  | (string & {});

export type AnnotationType =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'underline'
  | 'link'
  | 'equation'
  | (string & {});

type DatabaseId = string;

export interface NotionDatabaseQueryOptions {
  filter?: QueryDatabaseParameters['filter'];
  sorts?: QueryDatabaseParameters['sorts'];
}

export type NotionDatabaseQueryMapping = Record<
  DatabaseId,
  NotionDatabaseQueryOptions
>;

export type BlockAttributes = {
  numbered_list_item?: {
    number?: number;
  };
  comments: CommentResponseResults;
  children: ListBlockChildrenResponseResults;
};

export interface FetcherOutput {
  properties: PageProperties;
  blocks: ListBlockChildrenResponseResults;
  comments: CommentResponseResults;
}

// Optional tracked blocks interface
export interface TrackedBlocks {
  mediaBlocks?: ListBlockChildrenResponseResult[];
  pageRefBlocks?: ListBlockChildrenResponseResult[];
}

export type ExtendedFetcherOutput = FetcherOutput & TrackedBlocks;

export type ListBlockChildrenResponseResults =
  ListBlockChildrenResponseResult[];

export type ListBlockChildrenResponseResult =
  ListBlockChildrenResponse['results'][number] & BlockAttributes;

export type CommentResponseResults = ListCommentsResponse['results'];
export type CommentResponseResult = CommentResponseResults[number];
export type PageProperties = PageObjectProperties;
export type PageObjectProperties = PageObjectResponse['properties'];
export type RichTextItem = RichTextItemResponse;
export type RichTextAnnotation = RichTextItem['annotations'];
