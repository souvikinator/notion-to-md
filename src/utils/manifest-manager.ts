import * as fs from "fs/promises";
import * as path from "path";
import { MediaInfo } from "../types";

export interface MediaManifestEntry {
  blockId: string; // Added to make entries self-contained
  lastEdited: string; // Last edited time from Notion
  mediaInfo: MediaInfo;
  createdAt: string; // When this entry was first created
  updatedAt: string; // When this entry was last updated
}

export interface PageReferenceEntry {
  notionUrl: string;
  siteUrl: string;
  lastUpdated: string;
}

interface Manifest {
  pageId: string;
  lastUpdated: string;
  mediaEntries: Record<string, MediaManifestEntry>;
  pageReferences: Record<string, PageReferenceEntry>;
}

export class ManifestManager {
  private manifest: Manifest | null = null;
  private readonly MANIFEST_DIR = ".notion-to-md";
  protected readonly pageId: string;

  constructor(pageId: string) {
    this.pageId = pageId;
  }

  async initialize(): Promise<void> {
    await this.loadManifest();
  }

  private async loadManifest(): Promise<void> {
    const manifestPath = this.getManifestPath();
    try {
      await fs.mkdir(this.MANIFEST_DIR, { recursive: true });
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      this.manifest = JSON.parse(manifestContent);
    } catch (error) {
      this.manifest = {
        pageId: this.pageId,
        lastUpdated: new Date().toISOString(),
        mediaEntries: {},
        pageReferences: {},
      };
    }
  }

  async saveManifest(): Promise<void> {
    if (!this.manifest) return;
    const manifestPath = this.getManifestPath();
    this.manifest.lastUpdated = new Date().toISOString();
    await fs.writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
  }

  private getManifestPath(): string {
    return path.join(this.MANIFEST_DIR, `${this.pageId}.manifest.json`);
  }

  // Enhanced media entry methods
  updateMediaEntry(
    blockId: string,
    entry: Omit<MediaManifestEntry, "createdAt" | "updatedAt">,
  ): void {
    if (!this.manifest) return;

    const now = new Date().toISOString();
    const existingEntry = this.manifest.mediaEntries[blockId];

    this.manifest.mediaEntries[blockId] = {
      ...entry,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
  }

  getMediaEntry(blockId: string): MediaManifestEntry | undefined {
    return this.manifest?.mediaEntries[blockId];
  }

  removeMediaEntry(blockId: string): void {
    if (!this.manifest) return;
    delete this.manifest.mediaEntries[blockId];
  }

  getAllMediaEntries(): Record<string, MediaManifestEntry> {
    return this.manifest?.mediaEntries || {};
  }

  // Get entries that might need cleanup
  getOrphanedMediaEntries(currentBlockIds: Set<string>): MediaManifestEntry[] {
    if (!this.manifest) return [];

    return Object.entries(this.manifest.mediaEntries)
      .filter(([blockId]) => !currentBlockIds.has(blockId))
      .map(([_, entry]) => entry);
  }

  // Page reference methods remain the same
  updatePageReference(pageId: string, entry: PageReferenceEntry): void {
    if (!this.manifest) return;
    this.manifest.pageReferences[pageId] = entry;
  }

  getPageReference(pageId: string): PageReferenceEntry | undefined {
    return this.manifest?.pageReferences[pageId];
  }

  getAllPageReferences(): Record<string, PageReferenceEntry> {
    return this.manifest?.pageReferences || {};
  }
}
