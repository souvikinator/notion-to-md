import { Client } from "@notionhq/client";
import type {
  ListBlockChildrenResponse,
  GetBlockParameters,
} from "@notionhq/client/build/src/api-endpoints";

export type BlockAttributes = {
  numbered_list_item?: {
    number?: number;
  };
};

export type ListBlockChildrenResponseResults =
  ListBlockChildrenResponse["results"] & BlockAttributes;

export type ListBlockChildrenResponseResult =
  ListBlockChildrenResponseResults[0] & BlockAttributes;

export type TextRequest = string;

export type BlockType =
  | "image"
  | "video"
  | "file"
  | "pdf"
  | "table"
  | "bookmark"
  | "embed"
  | "equation"
  | "divider"
  | "toggle"
  | "to_do"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "synced_block"
  | "column_list"
  | "column"
  | "link_preview"
  | "link_to_page"
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "quote"
  | "to_do"
  | "template"
  | "synced_block"
  | "child_page"
  | "child_database"
  | "code"
  | "callout"
  | "breadcrumb"
  | "table_of_contents"
  | "link_to_page"
  | "audio"
  | "unsupported"
  | (string & {});

export type ConfigurationOptions = {
  separateChildPage?: boolean;
  convertImagesToBase64?: boolean;
  parseChildPages?: boolean;
};
export interface NotionToMarkdownOptions {
  notionClient: Client;
  config?: ConfigurationOptions;
}

export type MdStringObject = Record<string, string>;

export type MdBlock = {
  type?: string;
  blockId: string;
  parent: string;
  children: MdBlock[];
};

export type Annotations = {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color:
    | "default"
    | "gray"
    | "brown"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "red"
    | "gray_background"
    | "brown_background"
    | "orange_background"
    | "yellow_background"
    | "green_background"
    | "blue_background"
    | "purple_background"
    | "pink_background"
    | "red_background";
};

export type Text = {
  type: "text";
  text: {
    content: string;
    link: {
      url: TextRequest;
    } | null;
  };
  annotations: Annotations;
  plain_text: string;
  href: string | null;
};

export type Equation = {
  type: "equation";
  equation: {
    expression: string;
  };
  annotations: {
    bold: false;
    italic: false;
    strikethrough: false;
    underline: false;
    code: false;
    color: "default";
  };
  plain_text: string;
  href: null;
};

export type CalloutIcon =
  | { type: "emoji"; emoji?: string }
  | { type: "external"; external?: { url: string } }
  | { type: "file"; file: { url: string; expiry_time: string } }
  | null;

export type CustomTransformer = (
  block: ListBlockChildrenResponseResult
) => string | boolean | Promise<string | boolean>;

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
