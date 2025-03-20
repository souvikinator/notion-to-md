import { PageReferenceEntryType } from '../../types/manifest-manager';
import { ProcessorChainNode, ChainData } from '../../types/module';
import {
  NotionBlock,
  NotionBlocks,
  NotionPageProperties,
} from '../../types/notion';

import { PageReferenceManifestManager } from '../../utils/manifest-manager';
import { PageReferenceHandlerError } from '../errors';

export interface PageRefConfig {
  UrlPropertyNameNotion?: string;
  baseUrl?: string;
  transformUrl?: (url: string) => string;
}

export class PageReferenceHandler implements ProcessorChainNode {
  next?: ProcessorChainNode;
  private pageId: string;
  private processedRefs: Set<string> = new Set();
  private pageProperties: NotionPageProperties | null = null;
  private manifestManager: PageReferenceManifestManager;

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
    console.debug('[PageRefHandler] Initialized for page:', pageId);
  }

  async process(data: ChainData): Promise<ChainData> {
    console.debug('[PageRefHandler] Starting process');
    if (data.blockTree.pageRefBlocks && data.blockTree.properties) {
      await this.processBlocks(
        data.blockTree.pageRefBlocks,
        data.blockTree.properties,
      );
    }
    console.debug('[PageRefHandler] Process complete');

    if (!data.manifests) {
      data.manifests = {};
    }

    data.manifests.pageRef = this.manifestManager;
    return this.next ? this.next.process(data) : data;
  }

  async processBlocks(
    blocks: NotionBlocks,
    properties: NotionPageProperties,
  ): Promise<void> {
    try {
      console.debug('[PageRefHandler] Processing blocks:', blocks.length);
      if (!blocks?.length)
        throw new PageReferenceHandlerError('Invalid blocks array');
      if (!properties)
        throw new PageReferenceHandlerError('Properties required');

      this.pageProperties = properties;
      await this.handlePageProperties();

      for (const block of blocks) {
        await this.processPageRef(block);
      }
      console.debug('[PageRefHandler] Blocks processing complete');
    } catch (error) {
      console.error('[PageRefHandler] Block processing failed:', error);
      throw new PageReferenceHandlerError(
        'Failed to process blocks',
        error instanceof Error ? error : undefined,
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
      }
    } catch (error) {
      console.error('[PageRefHandler] Property handling failed:', error);
      throw new PageReferenceHandlerError(
        'Property handling failed',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async processPageRef(block: NotionBlock): Promise<void> {
    try {
      const pageId = this.extractPageId(block);
      if (!pageId) return;

      console.debug('[PageRefHandler] Processing reference:', pageId);
      const entry = this.manifestManager.getEntry(pageId);
      if (!entry) {
        console.debug('[PageRefHandler] No manifest entry for:', pageId);
        return;
      }

      const transformedPath = this.transformUrl(entry.url);
      this.updateBlockContent(block, transformedPath);
      this.processedRefs.add(pageId);
    } catch (error) {
      console.error('[PageRefHandler] Reference processing failed:', error);
      throw new PageReferenceHandlerError(
        'Reference processing failed',
        error instanceof Error ? error : undefined,
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
      throw new PageReferenceHandlerError(
        'URL transformation failed',
        error instanceof Error ? error : undefined,
      );
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
      throw new PageReferenceHandlerError(
        'Content update failed',
        error instanceof Error ? error : undefined,
      );
    }
  }
}
