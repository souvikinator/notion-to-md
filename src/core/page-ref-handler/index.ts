import { PageReferenceManifestManager } from "../../utils/manifest-manager";
import {
  PageProperties,
  ListBlockChildrenResponseResults,
  ListBlockChildrenResponseResult,
  PageReferenceEntryType,
  ProcessorChainNode,
  ChainData,
} from "../../types";
import { PageReferenceHandlerError } from "../errors";

export interface PageRefConfig {
  // this field is not use to link rather it's to make an entry in the manifest file
  UrlPropertyNameNotion?: string;
  baseUrl?: string;
  transformUrl?: (url: string) => string;
}

export class PageReferenceHandler implements ProcessorChainNode {
  next?: ProcessorChainNode;

  private pageId: string;
  private processedRefs: Set<string> = new Set();
  private pageProperties: PageProperties | null = null;
  private manifestManager: PageReferenceManifestManager;

  constructor(
    pageId: string,
    private config: PageRefConfig = {},
    manifestManager: PageReferenceManifestManager,
  ) {
    if (!pageId) {
      throw new PageReferenceHandlerError("Page ID is required");
    }
    if (!manifestManager) {
      throw new PageReferenceHandlerError("Manifest manager is required");
    }
    this.pageId = pageId;
    this.manifestManager = manifestManager;
  }

  async process(data: ChainData): Promise<ChainData> {
    if (data.blockTree.pageRefBlocks && data.blockTree.properties) {
      await this.processBlocks(
        data.blockTree.pageRefBlocks,
        data.blockTree.properties,
      );
    }

    return this.next ? this.next.process(data) : data;
  }

  async processBlocks(
    blocks: ListBlockChildrenResponseResults,
    properties: PageProperties,
  ): Promise<void> {
    try {
      if (!blocks || !Array.isArray(blocks)) {
        throw new PageReferenceHandlerError("Invalid blocks array provided");
      }
      if (!properties) {
        throw new PageReferenceHandlerError("Page properties are required");
      }

      this.pageProperties = properties;
      await this.handlePageProperties();

      for (const block of blocks) {
        await this.processPageRef(block);
      }
    } catch (error) {
      throw new PageReferenceHandlerError(
        "Failed to process page reference blocks",
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async handlePageProperties(): Promise<void> {
    try {
      if (!this.config.UrlPropertyNameNotion || !this.pageProperties) {
        return;
      }

      const urlProperty =
        this.pageProperties[this.config.UrlPropertyNameNotion];

      let url: string | null = null;

      if ("url" in urlProperty) {
        url = urlProperty.url;
      } else if (
        "rich_text" in urlProperty &&
        Array.isArray(urlProperty.rich_text) &&
        urlProperty.rich_text.length > 0
      ) {
        const text = urlProperty.rich_text[0]?.plain_text;
        if (text?.startsWith("http")) url = text;
      }

      if (url) {
        await this.manifestManager.updateEntry(this.pageId, {
          url,
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      throw new PageReferenceHandlerError(
        "Failed to handle page properties",
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async processPageRef(
    block: ListBlockChildrenResponseResult,
  ): Promise<void> {
    try {
      const pageId = this.extractPageId(block);
      if (!pageId || this.processedRefs.has(pageId)) return;

      const entry = this.manifestManager.getEntry(pageId);
      if (!entry) return;

      const transformedUrl = this.transformUrl(entry.url);
      this.updateBlockContent(block, transformedUrl);
      this.processedRefs.add(pageId);
    } catch (error) {
      throw new PageReferenceHandlerError(
        `Failed to process page reference for block`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  private extractPageId(block: ListBlockChildrenResponseResult): string | null {
    if (
      "type" in block &&
      block.type === "link_to_page" &&
      block.link_to_page?.type === "page_id"
    ) {
      return block.link_to_page.page_id;
    }

    // Handle page mentions in rich text blocks
    const richTextBlocks = [
      "paragraph",
      "bulleted_list_item",
      "numbered_list_item",
      "quote",
    ];

    if ("type" in block && richTextBlocks.includes(block.type)) {
      // @ts-ignore
      const richText = block[block.type].rich_text;

      for (const text of richText) {
        if (
          text.type === "mention" &&
          text.mention?.type === "page" &&
          text.mention.page?.id
        ) {
          return text.mention.page.id;
        }
      }
    }

    return null;
  }

  private transformUrl(url: string): string {
    if (!url) {
      throw new PageReferenceHandlerError("URL is required for transformation");
    }

    if (this.config.transformUrl) {
      return this.config.transformUrl(url);
    }

    if (this.config.baseUrl) {
      const baseUrl = this.config.baseUrl.replace(/\/$/, "");
      const pathUrl = url.replace(/^\//, "");
      return `${baseUrl}/${pathUrl}`;
    }

    return url;
  }

  private updateBlockContent(
    block: ListBlockChildrenResponseResult,
    url: string,
  ): void {
    try {
      if (!("type" in block)) {
        throw new PageReferenceHandlerError("Invalid block structure");
      }

      if (block.type === "link_to_page" && "href" in block) {
        block.href = url;
        return;
      }

      const blockContent = block[block.type as keyof typeof block];
      if (
        blockContent &&
        typeof blockContent === "object" &&
        "rich_text" in blockContent &&
        Array.isArray(blockContent.rich_text)
      ) {
        for (const text of blockContent.rich_text) {
          if (text.type === "mention" && text.mention?.type === "page") {
            text.href = url;
          }
        }
      }
    } catch (error) {
      throw new PageReferenceHandlerError(
        "Failed to update block content",
        error instanceof Error ? error : undefined,
      );
    }
  }
}
