import { PageReferenceEntryType } from '../../types/manifest-manager';
import { ProcessorChainNode, ChainData } from '../../types/module';
import { NotionBlock, NotionPageProperties } from '../../types/notion';
import { TrackedBlockReferenceObject } from '../../types/fetcher';

import { PageReferenceManifestManager } from '../../utils/manifest-manager';
import { PageReferenceHandlerError } from '../errors';
import { PageRefConfig } from '../../types/configuration';
import {
  extractNotionPageIdFromUrl,
  isNotionPageUrl,
} from '../../utils/notion';

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

  async process(data: ChainData): Promise<ChainData> {
    console.debug('[PageRefHandler] Starting process');

    this.reset();

    if (this.shouldProcess(data)) {
      await this.processBlocks(
        data.blockTree.pageRefBlockReferences!,
        data.blockTree.properties!,
      );

      await this.manifestManager.save();
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
      // updates the page ref manifest too
      await this.validateAndRegisterCurrentPageUrlFromNotionPageProperty();

      for (const reference of blocks) {
        await this.processPageRef(reference);
      }
      console.debug('[PageRefHandler] Blocks processing complete');
    } catch (error) {
      this.handleError('[PageRefHandler] Block processing failed:', error);
    }
  }

  private async validateAndRegisterCurrentPageUrlFromNotionPageProperty(): Promise<void> {
    if (!this.pageProperties) {
      console.debug('[PageRefHandler] Skipping - no config/properties');
      return;
    }

    console.debug('[PageRefHandler] Processing page properties');

    const urlProperty = this.pageProperties[this.config.UrlPropertyNameNotion];
    if (!urlProperty) {
      console.debug('[PageRefHandler] Skipping - no url property');
      return;
    }

    // Extract URL value based on property type
    const extractUrl = (): string | null => {
      if ('url' in urlProperty) return urlProperty.url;

      if ('formula' in urlProperty) {
        const { formula } = urlProperty;
        return formula.type === 'string' && formula.string?.startsWith('http')
          ? formula.string
          : null;
      }

      if ('rich_text' in urlProperty) {
        const text = urlProperty.rich_text[0]?.plain_text;
        return text?.startsWith('http') ? text : null;
      }

      return null;
    };

    const rawUrl = extractUrl();
    if (!rawUrl) {
      console.debug(
        `[PageRefHandler] No valid URL found in property '${this.config.UrlPropertyNameNotion}'`,
      );
      return;
    }

    // Validate and normalize URL
    let validatedUrl: string;
    try {
      validatedUrl = new URL(rawUrl).toString();
    } catch (error) {
      this.handleError(
        `[PageRefHandler] Invalid URL value in property '${this.config.UrlPropertyNameNotion}': ${rawUrl}`,
        error,
      );
      return;
    }

    try {
      console.debug(
        '[PageRefHandler] Updating manifest with URL:',
        validatedUrl,
      );

      await this.manifestManager.updateEntry(this.pageId, {
        url: validatedUrl,
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      });

      this.processedRefs.add(this.pageId);
    } catch (error) {
      this.handleError(
        `[PageRefHandler] Failed to update manifest for page: ${this.pageId}`,
        error,
      );
    }
  }

  private async processPageRef(
    reference: TrackedBlockReferenceObject,
  ): Promise<void> {
    try {
      // Extract the block from the reference
      const block = reference.ref as NotionBlock;
      const pageId = this.extractPageIdFromBlock(block);
      if (!pageId) {
        console.debug(
          '[PageRefHandler] No page ID found in block, skipping:',
          block.id,
        );
        return;
      }

      console.debug('[PageRefHandler] Processing reference:', pageId);

      const entry = this.manifestManager.getEntry(pageId);
      if (!entry) {
        console.debug('[PageRefHandler] No manifest entry for page:', pageId);
        return;
      }

      const transformedURL = this.transformUrl(entry.url);
      this.updateBlockContent(block, transformedURL);
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
   * Extracts page ID from link_to_page block and mention (page and link_preview) and regular links from any blocks.
   * @param block
   * @returns
   */
  private extractPageIdFromBlock(block: NotionBlock): string | null {
    if (
      block.type === 'link_to_page' &&
      block.link_to_page?.type === 'page_id'
    ) {
      return block.link_to_page.page_id;
    }

    // @ts-ignore
    const blockContent = block[block.type];
    if (!blockContent?.rich_text) return null;

    for (const text of blockContent.rich_text) {
      // Case 2: Mention block with page reference
      if (
        text.type === 'mention' &&
        text.mention?.type === 'page' &&
        text.mention.page?.id
      ) {
        return text.mention.page.id;
      }

      // Case 3: Mention block with link preview
      if (
        text.type === 'mention' &&
        text.mention?.type === 'link_preview' &&
        text.mention.link_preview?.url
      ) {
        const url = text.mention.link_preview.url;
        const pageId = extractNotionPageIdFromUrl(url);
        if (pageId) return pageId;
      }

      // Case 4: Regular link block that happens to point to a Notion page
      if (text.type === 'text' && text.text?.link?.url) {
        const url = text.text.link.url;
        const pageId = extractNotionPageIdFromUrl(url);
        if (pageId) return pageId;
      }
    }

    return null;
  }

  private transformUrl(url: string): string {
    try {
      // if user provides a transform function, use it
      if (this.config.transformUrl) return this.config.transformUrl(url);

      return url;
    } catch (error) {
      this.handleError('[PageRefHandler] URL transformation failed:', error);
      return url;
    }
  }

  /**
   * Update's block content with URL
   * Blocks: link_to_page, child_page, mention (page & link_preview), and regular links
   *
   * NOTE: since link_to_page and child_page do not support URL/href property,
   * we only convert them to mention block to maintain consistency
   */
  private updateBlockContent(block: NotionBlock, url: string): void {
    try {
      if (!('type' in block)) {
        throw new PageReferenceHandlerError('Invalid block structure');
      }

      if (
        block.type === 'link_to_page' &&
        block.link_to_page?.type === 'page_id'
      ) {
        // Manually inject for consistency
        //@ts-ignore
        block.link_to_page.url = url;
      } else if (block.type === 'child_page') {
        //@ts-ignore
        block.child_page.url = url;
      }

      // Handle rich_text-based blocks
      // @ts-ignore
      const blockContent = block[block.type];
      if (blockContent && 'rich_text' in blockContent) {
        for (const text of blockContent.rich_text) {
          // Mentions of pages
          if (text.type === 'mention' && text.mention?.type === 'page') {
            text.href = url;
            // Update the mention's page URL (mention.page.url is not standard, but used for consistency)
            // https://developers.notion.com/reference/rich-text#page-mention-type-object
            text.mention.page.url = url;
          }

          // Link previews (edge case: mention of a Notion page)
          if (
            text.type === 'mention' &&
            text.mention?.type === 'link_preview'
          ) {
            const previewUrl = text.mention.link_preview.url;
            if (isNotionPageUrl(previewUrl)) {
              text.mention.link_preview.url = url;
              text.href = url;
            }
          }

          // Regular links that point to Notion pages
          if (text.type === 'text' && isNotionPageUrl(text.href)) {
            text.href = url;
            text.text.link = url;
          }
        }
      }
    } catch (error) {
      this.handleError('[PageRefHandler] Block content update failed:', error);
    }
  }
}
