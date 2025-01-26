type BlockId = string;
type PageId = string;

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

/**
 * Page reference handler types
 */

export enum PageReferenceEntryType {
  PROPERTY = "PROPERTY",
  MANIFEST = "MANIFEST",
}

export interface PageManifest {
  lastUpdated: string;
  references: Record<PageId, PageReferenceEntry>;
}

export interface PageReferenceEntry {
  url: string;
  source: PageReferenceEntryType;
  lastUpdated: string;
}
