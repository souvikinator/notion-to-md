import { Client } from "@notionhq/client";
import {
  BlockFetcherConfig,
  ListBlockChildrenResponseResults,
  FetcherOutput,
  PageObjectProperties,
} from "../plugins/types";

export class BlockFetcher {
  private queue: string[] = [];
  private results: Map<string, ListBlockChildrenResponseResults> = new Map();
  private pageProps: Map<string, PageObjectProperties> = new Map();
  private processedBlocks: Set<string> = new Set();

  private maxRequestsPerSecond: number;
  private batchSize: number;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;

  constructor(
    private client: Client,
    private config: BlockFetcherConfig = {
      includeChildPageContent: false,
      fetchPageProperties: false,
    }
  ) {
    this.maxRequestsPerSecond = config.rateLimiting?.maxRequestsPerSecond ?? 3;
    this.batchSize = config.rateLimiting?.batchSize ?? 3;
  }

  private async rateLimitRequest<T>(request: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Reset counter if a second has passed
    if (timeSinceLastRequest >= 1000) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // If we've hit the limit, wait until next second
    if (this.requestCount >= this.maxRequestsPerSecond) {
      const waitTime = 1000 - timeSinceLastRequest;
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
      }
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
    return request();
  }

  async getBlocks(pageId: string): Promise<FetcherOutput> {
    // Reset state
    this.queue = [pageId];
    this.results.clear();
    this.pageProps.clear();
    this.processedBlocks.clear();
    this.requestCount = 0;
    this.lastRequestTime = 0;

    // Fetch initial page properties if configured
    if (this.config.fetchPageProperties) {
      const pageData = await this.rateLimitRequest(() =>
        this.client.pages.retrieve({
          page_id: pageId,
        })
      );

      if ("properties" in pageData) {
        this.pageProps.set(pageId, pageData.properties);
      }
    }

    // Process blocks
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      const uniqueBatch = batch.filter((id) => !this.processedBlocks.has(id));

      if (uniqueBatch.length === 0) continue;

      // Process batch with rate limiting
      const results = await Promise.all(
        uniqueBatch.map((id) =>
          this.rateLimitRequest(() => this.fetchBlockChildren(id))
        )
      );

      // Process batch results
      for (let i = 0; i < uniqueBatch.length; i++) {
        const blockId = uniqueBatch[i];
        const blocks = results[i];

        this.results.set(blockId, blocks);
        this.processedBlocks.add(blockId);

        // Process child blocks
        for (const block of blocks) {
          if ("has_children" in block && block.has_children) {
            const shouldProcessChildren =
              block.type !== "child_page" ||
              this.config.includeChildPageContent;

            if (shouldProcessChildren) {
              this.queue.push(block.id);
            }

            // Handle child page properties
            if (
              block.type === "child_page" &&
              this.config.includeChildPageContent &&
              this.config.fetchPageProperties
            ) {
              this.rateLimitRequest(() => this.fetchPageProperties(block.id));
            }
          }
        }
      }
    }

    return {
      properties: this.pageProps.get(pageId) || {},
      blocks: this.organizeBlocks(pageId),
    };
  }

  private async fetchBlockChildren(
    blockId: string
  ): Promise<ListBlockChildrenResponseResults> {
    try {
      let blocks: ListBlockChildrenResponseResults = [];
      let cursor: string | undefined;

      do {
        const response = await this.rateLimitRequest(() =>
          this.client.blocks.children.list({
            block_id: blockId,
            start_cursor: cursor,
          })
        );

        blocks = [...blocks, ...response.results];
        cursor = response.next_cursor ?? undefined;
      } while (cursor);

      return blocks;
    } catch (error) {
      console.error(`Error fetching block ${blockId}:`, error);
      return [];
    }
  }

  private async fetchPageProperties(blockId: string): Promise<void> {
    try {
      const pageData = await this.rateLimitRequest(() =>
        this.client.pages.retrieve({
          page_id: blockId,
        })
      );

      if ("properties" in pageData) {
        this.pageProps.set(blockId, pageData.properties);
      }
    } catch (error) {
      console.error(`Error fetching page properties for ${blockId}:`, error);
    }
  }

  private organizeBlocks(
    rootId: string,
    processed: Set<string> = new Set()
  ): ListBlockChildrenResponseResults {
    if (processed.has(rootId)) return [];
    processed.add(rootId);

    const blocks = this.results.get(rootId) || [];
    return blocks.map((block) => {
      if ("has_children" in block && block.has_children) {
        return {
          ...block,
          children: this.organizeBlocks(block.id, processed),
        };
      }
      return block;
    });
  }
}
