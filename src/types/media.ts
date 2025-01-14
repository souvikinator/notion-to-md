import { ListBlockChildrenResponseResult } from "./notion";

// Enrich the MediaInfo type to track more details
export enum MediaInfoType {
  DOWNLOAD = "download",
  UPLOAD = "upload",
  DIRECT = "direct",
}

export interface MediaInfo {
  type: MediaInfoType;
  originalUrl: string; // Original Notion/external URL
  transformedUrl?: string; // URL after processing
  localPath?: string; // For downloaded files
  uploadedUrl?: string; // For uploaded files
  mimeType?: string; // Store content type for better file handling
  fileSize?: number; // Track file sizes for cleanup decisions
}

export interface MediaManifestEntry {
  blockId: string;
  lastEdited: string;
  mediaInfo: MediaInfo;
}

export interface DownloadConfig {
  outputPath: string;
  transformPath?: (path: string) => string;
  preserveExternalUrls?: boolean;
}

export interface UploadConfig {
  uploadHandler: (block: ListBlockChildrenResponseResult) => Promise<string>;
  cleanupHandler?: (entry: MediaManifestEntry) => Promise<void>;
  transformPath?: (url: string) => string;
}

export class MediaProcessingError extends Error {
  constructor(
    message: string,
    public readonly blockId: string,
    public readonly operation: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = "MediaProcessingError";
  }
}
