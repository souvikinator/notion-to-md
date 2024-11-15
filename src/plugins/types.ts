// types.ts
import type {
  ListBlockChildrenResponse,
  GetBlockParameters,
  GetPageResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

// Block Types
export type BlockAttributes = {
  numbered_list_item?: {
    number?: number;
  };
};

export type ListBlockChildrenResponseResults =
  (ListBlockChildrenResponse["results"] & BlockAttributes) & {
    children?: ListBlockChildrenResponseResults;
  };

export type ListBlockChildrenResponseResult =
  ListBlockChildrenResponseResults[0];

// BlockFetcher Types
export interface BlockFetcherConfig {
  includeChildPageContent?: boolean;
  fetchPageProperties?: boolean;
  rateLimiting?: {
    maxRequestsPerSecond?: number;
    batchSize?: number;
  };
}

export type PageObjectProperties = PageObjectResponse["properties"];

export interface FetcherOutput {
  properties: PageObjectProperties;
  blocks: ListBlockChildrenResponseResults;
}

// Plugin Types
export interface Plugin {
  type: BlockType | BlockType[];
  transform: (
    block: ListBlockChildrenResponseResult,
    context?: PluginContext
  ) => Promise<string> | string;
}

export interface PluginContext {
  getChildren: (
    blockId: string,
    options?: { recursive?: boolean; depth?: number }
  ) => Promise<ListBlockChildrenResponseResults>;
}

export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "quote"
  | "to_do"
  | "toggle"
  | "code"
  | "image"
  | "video"
  | "file"
  | "pdf"
  | "bookmark"
  | "equation"
  | "divider"
  | "table"
  | "column"
  | "column_list"
  | "link_preview"
  | "synced_block"
  | "template"
  | "link_to_page"
  | "table_of_contents"
  | "child_page"
  | "child_database"
  | "breadcrumb"
  | "callout"
  | (string & {});
