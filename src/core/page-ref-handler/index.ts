import { PageReferenceEntryType } from '../../types/manifest-manager';
import { ProcessorChainNode, ChainData } from '../../types/module';
import { NotionBlock, NotionPageProperties } from '../../types/notion';
import { TrackedBlockReferenceObject } from '../../types/fetcher';

import { PageReferenceManifestManager } from '../../utils/manifest-manager';
import { PageReferenceHandlerError } from '../errors';

export interface PageRefConfig {
  UrlPropertyNameNotion?: string;
  baseUrl?: string;
  transformUrl?: (url: string) => string;
  failForward?: boolean;
}

export class PageReferenceHandler implements ProcessorChainNode {
  next?: ProcessorChainNode;
  private pageId: string;
  private processedRefs: Set<string> = new Set();
  private pageProperties: NotionPageProperties | null = null;
  private manifestManager: PageReferenceManifestManager;
  private readonly failForward: boolean;

  constructor(
    pageId: string,
    private config: PageRefConfig = {},
    manifestManager: PageReferenceManifestManager,
  ) {
    console.debug('[PageRefHandler] Initializing with config:', config);

    if (!pageId) throw new PageReferenceHandlerError('Page ID is required');
    if (!manifestManager)
      throw new PageReferenceHandlerError('Manifest manager is required');

    this.pageId = pageId;
    this.manifestManager = manifestManager;
    this.failForward = config.failForward ?? true;

    console.debug(
      '[PageRefHandler] Initialized for page:',
      pageId,
      'failForward:',
      this.failForward,
    );
  }

  async process(data: ChainData): Promise<ChainData> {
    console.debug('[PageRefHandler] Starting process');

    // Reset processed references tracking
    this.processedRefs.clear();

    if (data.blockTree.pageRefBlockReferences && data.blockTree.properties) {
      await this.processBlocks(
        data.blockTree.pageRefBlockReferences,
        data.blockTree.properties,
      );

      // Clean up any references that no longer exist
      await this.cleanupRemovedReferences();

      // Save the manifest after processing
      await this.manifestManager.save();
    }

    console.debug('[PageRefHandler] Process complete');

    if (!data.manifests) {
      data.manifests = {};
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
      if (!blocks?.length) {
        console.debug('[PageRefHandler] No blocks to process');
        return;
      }
      if (!properties) {
        throw new PageReferenceHandlerError('Properties required');
      }

      this.pageProperties = properties;
      await this.handlePageProperties();

      for (const reference of blocks) {
        await this.processPageRef(reference);
      }
      console.debug('[PageRefHandler] Blocks processing complete');
    } catch (error) {
      console.error('[PageRefHandler] Block processing failed:', error);
      if (!this.failForward) {
        throw new PageReferenceHandlerError(
          'Failed to process blocks',
          error instanceof Error ? error : undefined,
        );
      }
      console.error(
        new PageReferenceHandlerError(
          'Failed to process blocks - continuing due to failForward',
          error instanceof Error ? error : undefined,
        ),
      );
    }
  }

  private async handlePageProperties(): Promise<void> {
    if (!this.config.UrlPropertyNameNotion || !this.pageProperties) {
      console.debug(
        '[PageRefHandler] Skipping property handling - no config/properties',
      );
      return;
    }

    try {
      console.debug('[PageRefHandler] Processing page properties');
      const urlProperty =
        this.pageProperties[this.config.UrlPropertyNameNotion];
      let url: string | null = null;

      if (!urlProperty) {
        console.debug(
          '[PageRefHandler] Skipping property handling - no url property',
        );
        return;
      }

      if ('url' in urlProperty) {
        url = urlProperty.url;
      } else if (
        'rich_text' in urlProperty &&
        urlProperty.rich_text?.[0]?.plain_text?.startsWith('http')
      ) {
        url = urlProperty.rich_text[0].plain_text;
      }

      if (url) {
        console.debug('[PageRefHandler] Updating manifest with URL:', url);
        await this.manifestManager.updateEntry(this.pageId, {
          url,
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: new Date().toISOString(),
        });

        // Mark this page's reference as processed
        this.processedRefs.add(this.pageId);
      }
    } catch (error) {
      console.error('[PageRefHandler] Property handling failed:', error);
      const handlerError = new PageReferenceHandlerError(
        'Property handling failed',
        error instanceof Error ? error : undefined,
      );

      if (!this.failForward) {
        throw handlerError;
      }
      console.error(handlerError);
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

      let entry;
      try {
        entry = this.manifestManager.getEntry(pageId);
      } catch (error: unknown) {
        console.debug('[PageRefHandler] No manifest entry for:', pageId, error);
        return;
      }

      if (!entry) {
        console.debug('[PageRefHandler] No manifest entry for:', pageId);
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
      console.error('[PageRefHandler] Reference processing failed:', error);
      const handlerError = new PageReferenceHandlerError(
        'Reference processing failed',
        error instanceof Error ? error : undefined,
      );

      if (!this.failForward) {
        throw handlerError;
      }
      console.error(handlerError);
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
      console.error('[PageRefHandler] Error during cleanup:', error);
      // Cleanup errors are always logged but don't stop processing
      console.warn(
        new PageReferenceHandlerError(
          'Reference cleanup failed',
          error instanceof Error ? error : undefined,
        ),
      );
    }
  }

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
      if (this.config.baseUrl) {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const pathUrl = url.replace(/^\//, '');
        return `${baseUrl}/${pathUrl}`;
      }
      return url;
    } catch (error) {
      console.error('[PageRefHandler] URL transformation failed:', error);
      const handlerError = new PageReferenceHandlerError(
        'URL transformation failed',
        error instanceof Error ? error : undefined,
      );

      if (!this.failForward) {
        throw handlerError;
      }
      console.error(handlerError);
      return url; // Return original URL when failing forward
    }
  }

  /**
   * Update's block content with URL
   * Blocks: link_to_page, child_page, mention
   * NOTE: since link_to_page and child_page do not support URL/href property,
   * we only convert them to mention block to maintain consistency
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
      console.error('[PageRefHandler] Block content update failed:', error);
      const handlerError = new PageReferenceHandlerError(
        'Content update failed',
        error instanceof Error ? error : undefined,
      );

      if (!this.failForward) {
        throw handlerError;
      }
      console.error(handlerError);
    }
  }
}
