type BlockId = string;
type PageId = string;

/**
 * Media Manifest manager
 */
export interface MediaManifest {
  pageId: string;
  lastUpdated: string;
  mediaEntries: Record<BlockId, MediaManifestEntry>;
}

export enum MediaStrategyType {
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  DIRECT = 'DIRECT',
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
  type: MediaStrategyType;
  originalUrl: string;
  localPath?: string;
  uploadedUrl?: string;
  transformedPath?: string;
  mimeType?: string;
  sourceType?: 'block' | 'database_property' | 'page_property';
  propertyName?: string;
  propertyIndex?: number;
}

/**
 * Page reference handler types
 */

export enum PageReferenceEntryType {
  PROPERTY = 'PROPERTY',
  MANIFEST = 'MANIFEST',
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
