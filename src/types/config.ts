import type {
  CommentResponseResults,
  ListBlockChildrenResponseResults,
  PageObjectProperties,
} from "./notion";

export interface BlockFetcherConfig {
  includeChildPageContent?: boolean;
  fetchPageProperties?: boolean;
  fetchComments?: boolean;
  maxRequestsPerSecond?: number;
  batchSize?: number;
}

export interface FetcherOutput {
  properties: PageObjectProperties;
  comments: CommentResponseResults;
  blocks: ListBlockChildrenResponseResults;
}

export type MediaType = "image" | "video" | "file" | "pdf";

export interface MediaInfo {
  blockId: string;
  lastEdited: string;
  mediaType: MediaType;
  url: string;
  mimeType?: string;
  filename: string;
  isExternal: boolean;
}

export interface MediaManifestEntry {
  lastEdited: string;
  originalPath: string;
  transformedPath?: string;
  mediaType: MediaType;
  strategy: "direct" | "download" | "upload";
}

export interface PageMediaManifest {
  pageId: string;
  lastUpdated: string;
  entries: Record<string, MediaManifestEntry>;
}

// Strategy configurations
export interface MediaStrategy {
  initialize(pageId: string): Promise<void>;
  handleMedia(mediaInfo: MediaInfo): Promise<string>;
  finish(processedBlockIds: Set<string>): Promise<void>;
}

export interface DirectStrategyConfig {
  preserveExternalUrls?: boolean;
}

export interface DownloadStrategyConfig {
  outputPath: string;
  preserveExternalUrls?: boolean;
  transformPath?: (path: string) => string;
}

export interface UploadStrategyConfig {
  uploadHandler: (mediaInfo: MediaInfo) => Promise<string>;
  cleanupHandler?: (mediaInfo: MediaManifestEntry) => Promise<void>;
  preserveExternalUrls?: boolean;
  transformPath?: (url: string) => string;
}

export interface MediaHandlerConfig {
  pageId: string;
  mediaTypes?: MediaType[];
  strategy: MediaStrategy;
}
