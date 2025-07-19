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
  /**
   * URL/slug referred from a page property
   */
  PROPERTY = 'PROPERTY',
  /**
   * URL/slug referred from a existing records from manifest
   */
  MANIFEST = 'MANIFEST',
}

export interface PageManifest {
  lastUpdated: string;
  references: Record<PageId, PageReferenceEntry>;
}

export interface PageReferenceEntry {
  /**
   * This is the final publishing/ed URL for the page. This cannot be a slug or URL path. It has to be a full URL
   */
  url: string;
  /**
   * From where this URL was sourced. This can be a property in the page, or an existing record in the manifest.
   */
  source: PageReferenceEntryType;
  lastUpdated: string;
}
