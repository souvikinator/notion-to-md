import { PageReferenceEntryType } from '../../types/manifest-manager';
import { ProcessorChainNode, ChainData } from '../../types/module';
import { NotionBlock, NotionPageProperties } from '../../types/notion';
import { TrackedBlockReferenceObject } from '../../types/fetcher';

import { PageReferenceManifestManager } from '../../utils/manifest-manager';
import { PageReferenceHandlerError } from '../errors';
import { PageRefConfig } from '../../types/configuration';

const DEFAULT_CONFIG: PageRefConfig = {
  UrlPropertyNameNotion: 'URL', // will be overridden by user config
  transformUrl: undefined,
  failForward: true,
};

export class PageReferenceHandler implements ProcessorChainNode {
  next?: ProcessorChainNode;
  private processedRefs: Set<string> = new Set();
  private pageProperties: NotionPageProperties | null = null;

  constructor(
    private readonly pageId: string,
    private config: PageRefConfig,
    private readonly manifestManager: PageReferenceManifestManager,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.debug('[PageRefHandler] Initializing with config:', config);
  }

  private handleError(message: string, error: unknown): void {
    const err = error instanceof Error ? error : undefined;
    const wrapped = new PageReferenceHandlerError(message, err);

    if (!this.config.failForward) {
      throw wrapped;
    }

    console.error(wrapped);
  }

  private reset(): void {
    console.debug('[PageRefHandler] Resetting processed references');
    this.processedRefs.clear();
  }

  private shouldProcess(data: ChainData): boolean {
    return !!(
      data.blockTree.pageRefBlockReferences && data.blockTree.properties
    );
  }

  private async processBlockTree(data: ChainData): Promise<void> {
    await this.processBlocks(
      data.blockTree.pageRefBlockReferences!,
      data.blockTree.properties!,
    );

    await this.cleanupRemovedReferences();
    await this.manifestManager.save();
  }

  async process(data: ChainData): Promise<ChainData> {
    console.debug('[PageRefHandler] Starting process');

    this.reset();

    if (this.shouldProcess(data)) {
      this.processBlockTree(data);
    }

    console.debug('[PageRefHandler] Process complete');

    if (!data.manifests) {
      data.manifests ??= {};
    }

    data.manifests.pageRef = this.manifestManager;
    return this.next ? this.next.process(data) : data;
  }

  async processBlocks(
    blocks: TrackedBlockReferenceObject[],
    properties: NotionPageProperties,
  ): Promise<void> {
    try {
      console.debug('[PageRefHandler] Processing blocks:', blocks.length);
      if (blocks.length === 0) {
        console.debug('[PageRefHandler] No blocks to process');
        return;
      }

      this.pageProperties = properties;
      await this.handlePageProperties();

      for (const reference of blocks) {
        await this.processPageRef(reference);
      }
      console.debug('[PageRefHandler] Blocks processing complete');
    } catch (error) {
      this.handleError('[PageRefHandler] Block processing failed:', error);
    }
  }

  private async handlePageProperties(): Promise<void> {
    if (!this.pageProperties) {
      console.debug(
        '[PageRefHandler] Skipping property handling - no config/properties',
      );
      return;
    }

    try {
      console.debug('[PageRefHandler] Processing page properties');

      // get the property object from the Notion page properties
      const urlProperty =
        this.pageProperties[this.config.UrlPropertyNameNotion];
      let url: string | null = null;

      if (!urlProperty) {
        console.debug(
          '[PageRefHandler] Skipping property handling - no url property',
        );
        return;
      }

      const value = (() => {
        if ('url' in urlProperty) {
          return urlProperty.url;
        }
        if ('formula' in urlProperty) {
          const f = urlProperty.formula;
          return f.type === 'string' && f.string?.startsWith('http')
            ? f.string
            : null;
        }
        if ('rich_text' in urlProperty) {
          const txt = urlProperty.rich_text[0]?.plain_text;
          return txt?.startsWith('http') ? txt : null;
        }
        return null;
      })();

      if (value) {
        const parsed = new URL(value); // validates URL
        url = parsed.toString();
      }

      if (url) {
        console.debug('[PageRefHandler] Updating manifest with URL:', url);
        await this.manifestManager.updateEntry(this.pageId, {
          url,
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: new Date().toISOString(),
        });

        // Mark this page as processed
        this.processedRefs.add(this.pageId);
      }
    } catch (error) {
      this.handleError('[PageRefHandler] Block processing failed:', error);
    }
  }

  private async processPageRef(
    reference: TrackedBlockReferenceObject,
  ): Promise<void> {
    try {
      // Extract the block from the reference
      const block = reference.ref as NotionBlock;
      const pageId = this.extractPageId(block);
      if (!pageId) return;

      console.debug('[PageRefHandler] Processing reference:', pageId);

      const entry = this.manifestManager.getEntry(pageId);
      if (!entry) {
        console.debug('[PageRefHandler] No manifest entry for page:', pageId);
        return;
      }

      const transformedPath = this.transformUrl(entry.url);
      this.updateBlockContent(block, transformedPath);
      this.processedRefs.add(pageId);

      console.debug(
        '[PageRefHandler] Successfully processed reference:',
        pageId,
      );
    } catch (error) {
      this.handleError('[PageRefHandler] Block processing failed:', error);
    }
  }

  private async cleanupRemovedReferences(): Promise<void> {
    console.debug('[PageRefHandler] Starting cleanup of removed references');

    try {
      // Find entries that weren't processed this time
      const allEntries = this.manifestManager.getAllEntries();

      for (const [pageId] of Object.entries(allEntries)) {
        if (!this.processedRefs.has(pageId)) {
          console.debug('[PageRefHandler] Removing unused reference:', pageId);
          this.manifestManager.removeEntry(pageId);
        }
      }

      console.debug('[PageRefHandler] References cleanup complete');
    } catch (error) {
      this.handleError('[PageRefHandler] Error during cleanup:', error);
    }
  }

  /**
   * Extracts page ID from link_to_page block and mention.
   * TODO: should also extract from child_page, also be able to handle regular links in annotations
   * @param block
   * @returns
   */
  private extractPageId(block: NotionBlock): string | null {
    if (
      block.type === 'link_to_page' &&
      block.link_to_page?.type === 'page_id'
    ) {
      return block.link_to_page.page_id;
    }

    // @ts-ignore
    const blockContent = block[block.type];

    if (blockContent && blockContent.rich_text) {
      const richText = blockContent.rich_text;
      for (const text of richText) {
        if (
          text.type === 'mention' &&
          text.mention?.type === 'page' &&
          text.mention.page?.id
        ) {
          return text.mention.page.id;
        }
      }
    }
    return null;
  }

  private transformUrl(url: string): string {
    if (!url) throw new PageReferenceHandlerError('URL required');

    try {
      if (this.config.transformUrl) return this.config.transformUrl(url);
      return url;
    } catch (error) {
      this.handleError('[PageRefHandler] URL transformation failed:', error);
      return url;
    }
  }

  /**
   * Update's block content with URL
   * Blocks: link_to_page, child_page, mention
   * NOTE: since link_to_page and child_page do not support URL/href property,
   * we only convert them to mention block to maintain consistency
   * TODO: should also handle regular links (usually inside rich text annotations)
   */
  private updateBlockContent(block: NotionBlock, url: string): void {
    try {
      if (!('type' in block)) {
        throw new PageReferenceHandlerError('Invalid block structure');
      }
      // Handle direct page references
      if (
        block.type === 'link_to_page' &&
        block.link_to_page?.type === 'page_id'
      ) {
        //@ts-ignore - url doesn't exist in block, we are adding to keep things consistent
        block.link_to_page.url = url;
      } else if (block.type === 'child_page') {
        // @ts-ignore
        block.child_page.url = url;
      } else {
        // Handle mentions
        // @ts-ignore
        const blockContent = block[block.type];
        if (blockContent && 'rich_text' in blockContent) {
          for (const text of blockContent.rich_text) {
            if (text.type === 'mention' && text.mention?.type === 'page') {
              text.href = url;
            }
          }
        }
      }
    } catch (error) {
      this.handleError('[PageRefHandler] Block content update failed:', error);
    }
  }
}
