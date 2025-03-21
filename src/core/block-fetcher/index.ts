import type { Client } from '@notionhq/client';
import { BlockFetcherConfig } from '../../types/configuration';
import { ExtendedFetcherOutput, FetcherOutput } from '../../types/fetcher';
import { ProcessorChainNode, ChainData } from '../../types/module';
import {
  NotionBlock,
  NotionBlocks,
  NotionComments,
  NotionPageProperties,
} from '../../types/notion';
import {
  fetchNotionAllComments,
  fetchNotionBlockChildren,
  fetchNotionDatabase,
  fetchNotionDatabaseSchema,
  fetchNotionPageProperties,
  isMediaBlock,
  isPageRefBlock,
  normalizeUUID,
} from '../../utils/notion';
import { RateLimiter } from '../../utils/rate-limiter/index';

interface QueueTask {
  type:
    | 'fetch_properties'
    | 'fetch_comments'
    | 'fetch_blocks'
    | 'fetch_database';
  entity_id: string; // block, page, database id
  parentId?: string;
}

export class BlockFetcher implements ProcessorChainNode {
  next?: ProcessorChainNode;

  private queue: QueueTask[] = [];
  private blocks = new Map<string, NotionBlock>();
  private processedTasks = new Set<string>();
  private pageProperties?: NotionPageProperties;
  private rootComments: NotionComments = [];
  private rootBlockId: string = '';
  private mediaBlocks: NotionBlocks = [];
  private pageRefBlocks: NotionBlocks = [];

  private rateLimiter: RateLimiter;

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
    this.config.maxRequestsPerSecond = config.maxRequestsPerSecond ?? 3;
    this.config.batchSize = config.batchSize ?? 3;
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerSecond);
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
    this.addTask({ type: 'fetch_blocks', entity_id: pageId });

    if (this.config.fetchPageProperties) {
      this.addTask({ type: 'fetch_properties', entity_id: pageId });
    }

    if (this.config.fetchComments) {
      this.addTask({ type: 'fetch_comments', entity_id: pageId });
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
    const taskId = `${task.type}-${task.entity_id}`;
    if (!this.processedTasks.has(taskId)) {
      this.queue.push(task);
    }
  }

  private async processTask(task: QueueTask): Promise<void> {
    const taskId = `${task.type}-${task.entity_id}`;
    if (this.processedTasks.has(taskId)) return;

    switch (task.type) {
      case 'fetch_blocks': {
        const blocks = await fetchNotionBlockChildren(
          this.client,
          task.entity_id,
          this.rateLimiter,
        );

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

          // if block is a child_database and in config it's enabled send to queue to fetch
          if (
            'type' in block &&
            block.type === 'child_database' &&
            this.config.databaseConfig?.fetchDatabases
          ) {
            this.addTask({
              type: 'fetch_database',
              entity_id: block.id,
            });
          }

          // If block has children, queue task to fetch them
          if ('has_children' in block && block.has_children) {
            this.addTask({
              type: 'fetch_blocks',
              entity_id: block.id,
              parentId: task.entity_id,
            });
          }

          // Queue comment fetching for each block if enabled
          // extra api call for comment fetching, no way to know otherwise
          if (this.config.fetchComments) {
            this.addTask({
              type: 'fetch_comments',
              entity_id: block.id,
            });
          }
        }
        break;
      }

      case 'fetch_comments': {
        const comments = await fetchNotionAllComments(
          this.client,
          task.entity_id,
          this.rateLimiter,
        );

        if (task.entity_id === this.rootBlockId) {
          // page level comments
          this.rootComments = comments;
        } else {
          const block = this.blocks.get(task.entity_id);
          if (block) {
            block.comments = comments;
          }
        }
        break;
      }

      case 'fetch_properties': {
        const properties = await fetchNotionPageProperties(
          this.client,
          task.entity_id,
          this.rateLimiter,
        );

        this.pageProperties = properties;
        break;
      }

      case 'fetch_database': {
        // Fetch database metadata
        const databaseMetadata = await fetchNotionDatabaseSchema(
          this.client,
          task.entity_id,
          this.rateLimiter,
        );
        // Fetch database content
        const databaseContent = await fetchNotionDatabase(
          this.client,
          task.entity_id,
          this.rateLimiter,
          this.config.databaseConfig?.databaseQueries?.[task.entity_id],
        );

        // Add database info to the block
        const block = this.blocks.get(task.entity_id);
        if (block && block.type === 'child_database') {
          block.child_database = {
            ...block.child_database,
            schema: databaseMetadata, // output of the notionSdk.databases.retrieve
            entries: databaseContent, //  output of the notionSdk.databases.query.properties
          };
        }
        break;
      }
    }

    this.processedTasks.add(taskId);
  }

  private buildBlockTree(rootId: string): NotionBlocks {
    const childrenMap = new Map<string, NotionBlocks>();

    for (const [_id, block] of this.blocks.entries()) {
      let parentId: string | undefined;

      if (block.parent?.type === 'block_id') {
        parentId = normalizeUUID(block.parent.block_id);
      } else if (block.parent?.type === 'page_id') {
        parentId = normalizeUUID(block.parent.page_id);
      } else {
        parentId = undefined;
      }

      if (parentId) {
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)!.push(block);
      }
    }

    const buildChildren = (parentId: string): NotionBlocks => {
      const children = childrenMap.get(normalizeUUID(parentId)) || [];
      return children.map((block) => {
        block.children = buildChildren(block.id);
        return block;
      });
    };

    return buildChildren(rootId);
  }
}
