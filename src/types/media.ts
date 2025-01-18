type BlockId = string;

export interface MediaManifest {
  pageId: string;
  lastUpdated: string;
  mediaEntries: Record<BlockId, MediaManifestEntry>;
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
  type: "download" | "upload" | "external";
  originalUrl: string;
  localPath?: string;
  uploadedUrl?: string;
  mimeType?: string;
}
