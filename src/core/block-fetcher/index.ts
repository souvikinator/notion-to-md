import { Client } from "@notionhq/client";
import {
  ListBlockChildrenResponseResult,
  PageObjectProperties,
  CommentResponseResults,
  FetcherOutput,
  ListBlockChildrenResponseResults,
  ExtendedFetcherOutput,
  ProcessorChainNode,
  ChainData,
} from "../../types";
import { isMediaBlock, isPageRefBlock } from "../../utils/notion";

export interface BlockFetcherConfig {
  fetchPageProperties?: boolean;
  fetchComments?: boolean;
  maxRequestsPerSecond?: number;
  batchSize?: number;
  trackMediaBlocks?: boolean;
  trackPageRefBlocks?: boolean;
}

interface QueueTask {
  type: "fetch_properties" | "fetch_comments" | "fetch_blocks";
  id: string;
  parentId?: string;
}

export class BlockFetcher implements ProcessorChainNode {
  next?: ProcessorChainNode;

  private queue: QueueTask[] = [];
  private blocks = new Map<string, ListBlockChildrenResponseResult>();
  private processedTasks = new Set<string>();
  private pageProperties?: PageObjectProperties;
  private rootComments: CommentResponseResults = [];
  private rootBlockId: string = "";
  private mediaBlocks: ListBlockChildrenResponseResult[] = [];
  private pageRefBlocks: ListBlockChildrenResponseResult[] = [];

  private rateLimitWindow = {
    requests: 0,
    startTime: Date.now(),
  };

  constructor(
    pageId: string,
    private client: Client,
    private config: BlockFetcherConfig = {
      fetchPageProperties: false,
      fetchComments: false,
      maxRequestsPerSecond: 3,
      batchSize: 3,
    },
  ) {
    const moduleType = "BlockFetcher";
    this.config.maxRequestsPerSecond = config.maxRequestsPerSecond ?? 3;
    this.config.batchSize = config.batchSize ?? 3;
  }

  async process(data: ChainData): Promise<ChainData> {
    const blockTree = await this.getBlocks(data.pageId);

    const updatedData: ChainData = {
      ...data,
      blockTree,
    };

    return this.next ? this.next.process(updatedData) : updatedData;
  }

  async getBlocks(pageId: string): Promise<ExtendedFetcherOutput> {
    this.rootBlockId = pageId;
    this.queue = [];
    this.blocks.clear();
    this.processedTasks.clear();
    this.pageProperties = undefined;
    this.rootComments = [];

    // Initialize queue with root level tasks
    this.addTask({ type: "fetch_blocks", id: pageId });

    if (this.config.fetchPageProperties) {
      this.addTask({ type: "fetch_properties", id: pageId });
    }

    if (this.config.fetchComments) {
      this.addTask({ type: "fetch_comments", id: pageId });
    }

    // Process queue until empty
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.config.batchSize);
      await Promise.all(batch.map((task) => this.processTask(task)));
    }

    const baseOutput: FetcherOutput = {
      properties: this.pageProperties || {},
      comments: this.rootComments,
      blocks: this.buildBlockTree(pageId),
    };

    // Only include special arrays if tracking was enabled
    if (this.config.trackMediaBlocks || this.config.trackPageRefBlocks) {
      return {
        ...baseOutput,
        ...(this.config.trackMediaBlocks && { mediaBlocks: this.mediaBlocks }),
        ...(this.config.trackPageRefBlocks && {
          pageRefBlocks: this.pageRefBlocks,
        }),
      };
    }

    return baseOutput;
  }

  private addTask(task: QueueTask): void {
    const taskId = `${task.type}-${task.id}`;
    if (!this.processedTasks.has(taskId)) {
      this.queue.push(task);
    }
  }

  private async processTask(task: QueueTask): Promise<void> {
    const taskId = `${task.type}-${task.id}`;
    if (this.processedTasks.has(taskId)) return;

    switch (task.type) {
      case "fetch_blocks": {
        const blocks = await this.fetchBlockChildren(task.id);

        for (const block of blocks) {
          const storedBlock = {
            ...block,
            children: [],
            comments: [],
          };
          this.blocks.set(block.id, storedBlock);

          // Track special blocks if enabled (storing references)
          // these will be used by the next stage saving us from a
          // lot of recursive calls to idenitfy blocks
          if (this.config.trackMediaBlocks && isMediaBlock(storedBlock)) {
            this.mediaBlocks.push(storedBlock);
          }
          if (this.config.trackPageRefBlocks && isPageRefBlock(storedBlock)) {
            this.pageRefBlocks.push(storedBlock);
          }

          // If block has children, queue task to fetch them
          if ("has_children" in block && block.has_children) {
            this.addTask({
              type: "fetch_blocks",
              id: block.id,
              parentId: task.id,
            });
          }

          // Queue comment fetching for each block if enabled
          // extra api call for comment fetching, no way to know otherwise
          if (this.config.fetchComments) {
            this.addTask({
              type: "fetch_comments",
              id: block.id,
            });
          }
        }
        break;
      }

      case "fetch_comments": {
        const comments = await this.fetchAllComments(task.id);
        if (task.id === this.rootBlockId) {
          // page level comments
          this.rootComments = comments;
        } else {
          const block = this.blocks.get(task.id);
          if (block) {
            block.comments = comments;
          }
        }
        break;
      }

      case "fetch_properties": {
        const properties = await this.fetchPageProperties(task.id);
        this.pageProperties = properties;
        break;
      }
    }

    this.processedTasks.add(taskId);
  }

  private async rateLimitRequest<T>(request: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const windowSize = 1000;

    // Reset window if it's expired
    if (now - this.rateLimitWindow.startTime >= windowSize) {
      this.rateLimitWindow = {
        requests: 0,
        startTime: now,
      };
    }

    // Wait if we've hit the rate limit
    if (this.rateLimitWindow.requests >= this.config.maxRequestsPerSecond!) {
      const waitTime = windowSize - (now - this.rateLimitWindow.startTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.rateLimitWindow = {
        requests: 0,
        startTime: Date.now(),
      };
    }

    this.rateLimitWindow.requests++;
    return request();
  }

  private async fetchBlockChildren(
    blockId: string,
  ): Promise<ListBlockChildrenResponseResults> {
    let allBlocks: ListBlockChildrenResponseResults = [];
    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const response = await this.rateLimitRequest(() =>
        this.client.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
        }),
      );

      // Filter out unsupported blocks
      // should we leave it here or let user handle it in renderer?
      const blocks = response.results.filter(
        (block) => "type" in block && block.type !== "unsupported",
      ) as ListBlockChildrenResponseResults;

      allBlocks = [...allBlocks, ...blocks];
      hasMore = response.has_more;
      cursor = response.next_cursor ?? undefined;
    }

    return allBlocks;
  }

  private async fetchAllComments(
    blockId: string,
  ): Promise<CommentResponseResults> {
    let allComments: CommentResponseResults = [];
    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const response = await this.rateLimitRequest(() =>
        this.client.comments.list({
          block_id: blockId,
          start_cursor: cursor,
        }),
      );

      allComments = [...allComments, ...response.results];
      hasMore = response.has_more;
      cursor = response.next_cursor ?? undefined;
    }

    return allComments;
  }

  private async fetchPageProperties(
    pageId: string,
  ): Promise<PageObjectProperties> {
    const response = await this.rateLimitRequest(() =>
      this.client.pages.retrieve({ page_id: pageId }),
    );

    return "properties" in response ? response.properties : {};
  }

  private normalizeId(id: string): string {
    return id.replace(/-/g, "");
  }

  private buildBlockTree(rootId: string): ListBlockChildrenResponseResults {
    const childrenMap = new Map<string, ListBlockChildrenResponseResult[]>();

    for (const [id, block] of this.blocks.entries()) {
      const parentId =
        // @ts-ignore
        block.parent?.type === "block_id"
          ? // @ts-ignore
            this.normalizeId(block.parent.block_id)
          : // @ts-ignore
            block.parent?.type === "page_id"
            ? // @ts-ignore
              this.normalizeId(block.parent.page_id)
            : undefined;

      if (parentId) {
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)!.push(block);
      }
    }

    const buildChildren = (
      parentId: string,
    ): ListBlockChildrenResponseResults => {
      const children = childrenMap.get(this.normalizeId(parentId)) || [];
      return children.map((block) => ({
        ...block,
        children: buildChildren(block.id),
      }));
    };

    return buildChildren(rootId);
  }
}
