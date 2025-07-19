import type { Client } from '@notionhq/client';
import { PageReferenceManifestManager } from '../../utils/manifest-manager';
import { PageReferenceEntryType } from '../../types/manifest-manager';
import { PageReferenceHandlerError } from '../../core/errors';
import { extractFinalReferenceUrlFromNotionProperty } from '../notion';

interface PageRefBuilderConfig {
  urlPropertyNameNotion: string;
  concurrency?: number;
}

export class PageReferenceManifestBuilder {
  private processedItems: Set<string> = new Set();
  private readonly concurrency: number;
  private manifestManager: PageReferenceManifestManager;

  constructor(
    private client: Client,
    private config: PageRefBuilderConfig,
  ) {
    this.concurrency = config.concurrency || 3;
    this.manifestManager = new PageReferenceManifestManager();
  }

  async build(rootId: string): Promise<void> {
    console.info(`Starting manifest build from root ${rootId}`);
    try {
      await this.manifestManager.initialize();

      try {
        // Try database endpoint first
        await this.client.databases.retrieve({ database_id: rootId });
        console.info(`Processing database ${rootId}`);
        await this.processDatabase(rootId);
      } catch {
        // If not database, try as page
        console.info(`Processing page ${rootId} for databases`);
        await this.findAndProcessDatabases(rootId);
      }

      await this.manifestManager.save();
      console.info('Manifest build completed successfully');
    } catch (error) {
      console.error(
        `Build failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new PageReferenceHandlerError(
        'Failed to build manifest',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async processDatabase(databaseId: string): Promise<void> {
    if (this.processedItems.has(databaseId)) {
      console.debug(`Skipping processed database ${databaseId}`);
      return;
    }

    console.debug(`Querying database ${databaseId}`);
    let cursor: string | undefined;

    try {
      do {
        const response = await this.client.databases.query({
          database_id: databaseId,
          start_cursor: cursor,
        });

        await Promise.all(
          response.results.map(async (page) => {
            await this.processDatabasePage(page);
          }),
        );

        cursor = response.next_cursor ?? undefined;
      } while (cursor);

      this.processedItems.add(databaseId);
    } catch (error) {
      console.error(
        `Database query failed for ${databaseId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async findAndProcessDatabases(pageId: string): Promise<void> {
    let cursor: string | undefined;

    try {
      do {
        const response = await this.client.blocks.children.list({
          block_id: pageId,
          start_cursor: cursor,
        });

        const databaseBlocks = response.results.filter(
          // @ts-ignore
          (block) => block.type === 'child_database',
        );

        console.debug(
          `Found ${databaseBlocks.length} databases in page ${pageId}`,
        );

        for (const block of databaseBlocks) {
          await this.processDatabase(block.id);
        }

        cursor = response.next_cursor ?? undefined;
      } while (cursor);
    } catch (error) {
      console.warn(
        `Failed scanning page ${pageId} for databases: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async processDatabasePage(page: any): Promise<void> {
    if (this.processedItems.has(page.id)) {
      return;
    }

    console.debug(`Processing database page ${page.id}`);
    try {
      const urlProperty = page.properties[this.config.urlPropertyNameNotion];
      if (!urlProperty) {
        console.debug(`No url property found for page ${page.id}`);
        return;
      }
      const url = extractFinalReferenceUrlFromNotionProperty(urlProperty);
      if (!url) {
        console.debug(`No valid URL for page ${page.id}`);
        return;
      }

      await this.manifestManager.updateEntry(page.id, {
        url,
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      });

      console.debug(`Updated manifest for page ${page.id} with URL ${url}`);
      this.processedItems.add(page.id);
    } catch (error) {
      console.warn(
        `Failed processing page ${page.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getManifestManager(): PageReferenceManifestManager {
    return this.manifestManager;
  }
}
