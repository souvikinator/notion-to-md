type BlockId = string;

export interface MediaManifest {
  pageId: string;
  lastUpdated: string;
  mediaEntries: Record<BlockId, MediaManifestEntry>;
}

export enum MediaInfoType {
  DOWNLOAD = "DOWNLOAD",
  UPLOAD = "UPLOAD",
  DIRECT = "DIRECT",
}

export interface MediaManifestInput {
  mediaInfo: MediaInfo;
  lastEdited: string;
}

export interface MediaManifestEntry extends MediaManifestInput {
  createdAt: string;
  updatedAt: string;
}

export interface MediaInfo {
  type: MediaInfoType;
  originalUrl: string;
  localPath?: string;
  uploadedUrl?: string;
  transformedUrl?: string;
  mimeType?: string;
}

// Types for the page reference media handler
export interface PageManifest {
  lastUpdated: string;
  references: Record<string, PageReferenceEntry>;
}

export interface PageReferenceEntry {
  notionUrl: string; // Original Notion URL
  siteUrl: string; // Corresponding site URL
  lastUpdated: string; // When this reference was last updated
}
