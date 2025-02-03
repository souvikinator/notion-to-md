import { Client } from "@notionhq/client";
import { PageReferenceManifestManager } from "../../utils/manifest-manager";
import { PageReferenceEntryType } from "../../types";
import { PageReferenceHandlerError } from "../../core/errors";

interface PageRefBuilderConfig {
  urlPropertyNameNotion: string;
  recursive: boolean;
  concurrency?: number;
}

/**
 * A utility for building page reference manifests by scanning Notion pages
 * and extracting their published URLs. It manages its own manifest internally
 * to maintain a clean separation of concerns.
 */
export class PageReferenceManifestBuilder {
  private processedPages: Set<string> = new Set();
  private readonly concurrency: number;
  private manifestManager: PageReferenceManifestManager;

  constructor(
    private client: Client,
    private config: PageRefBuilderConfig,
  ) {
    this.concurrency = config.concurrency || 3;
    this.manifestManager = new PageReferenceManifestManager();
  }

  /**
   * Initializes the manifest system and builds the manifest starting from
   * the provided root page. This is the main entry point for using the utility.
   */
  async build(rootPageId: string): Promise<void> {
    try {
      // Initialize the manifest system
      await this.manifestManager.initialize();

      // Process root page and optionally its children
      await this.processPage(rootPageId);
      if (this.config.recursive) {
        await this.processChildPages(rootPageId);
      }

      // Save the final manifest
      await this.manifestManager.save();
    } catch (error) {
      throw new PageReferenceHandlerError(
        "Failed to build page reference manifest",
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async processPage(pageId: string): Promise<void> {
    if (this.processedPages.has(pageId)) return;

    try {
      const response = await this.client.pages.retrieve({
        page_id: pageId,
      });

      this.processedPages.add(pageId);

      if (!("properties" in response)) return;

      const url = await this.extractPublishedUrl(response.properties);
      if (!url) return;

      // Always update with latest value from Notion
      await this.manifestManager.updateEntry(pageId, {
        url,
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(
        `Failed to process page ${pageId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async extractPublishedUrl(
    properties: Record<string, any>,
  ): Promise<string | null> {
    const urlProperty = properties[this.config.urlPropertyNameNotion];
    if (!urlProperty) return null;

    if ("url" in urlProperty) {
      return urlProperty.url;
    }

    if (
      "rich_text" in urlProperty &&
      Array.isArray(urlProperty.rich_text) &&
      urlProperty.rich_text.length > 0
    ) {
      const text = urlProperty.rich_text[0]?.plain_text;
      if (text?.startsWith("http")) {
        return text;
      }
    }

    return null;
  }

  private async processChildPages(pageId: string): Promise<void> {
    try {
      const children = await this.getChildPages(pageId);

      // Process children in batches for controlled concurrency
      for (let i = 0; i < children.length; i += this.concurrency) {
        const batch = children.slice(i, i + this.concurrency);
        await Promise.all(
          batch.map(async (childId) => {
            await this.processPage(childId);
            await this.processChildPages(childId);
          }),
        );
      }
    } catch (error) {
      console.warn(
        `Failed to process child pages for ${pageId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async getChildPages(pageId: string): Promise<string[]> {
    const childPages: string[] = [];
    let cursor: string | undefined;

    try {
      do {
        const response = await this.client.blocks.children.list({
          block_id: pageId,
          start_cursor: cursor,
        });

        // Collect child page IDs
        response.results.forEach((block) => {
          // @ts-ignore
          if (block.type === "child_page") {
            childPages.push(block.id);
          }
        });

        cursor = response.next_cursor ?? undefined;
      } while (cursor);
    } catch (error) {
      console.warn(
        `Failed to get child pages for ${pageId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return childPages;
  }

  /**
   * Provides access to the built manifest for the page reference handler
   */
  getManifestManager(): PageReferenceManifestManager {
    return this.manifestManager;
  }
}
