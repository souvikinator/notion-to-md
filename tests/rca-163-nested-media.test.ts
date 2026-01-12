/**
 * Reproduction Test for Issue #163 - Nested Media Download
 *
 * Issue: Only one image downloaded when images are nested in list items
 *
 * This test simulates the user's structure:
 * - List Item 1
 *   - Image 1 (Nested)
 * - List Item 2
 *   - Image 2 (Nested)
 *
 * We verify that ALL images are tracked by BlockFetcher.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlockFetcher } from '@/core/block-fetcher';
import { Client } from '@notionhq/client';

// Mock Notion Client
const mockNotionClient = {
  blocks: {
    children: {
      list: vi.fn(),
    },
  },
  comments: {
    list: vi.fn(),
  },
  pages: {
    retrieve: vi.fn(),
  },
} as unknown as Client;

describe('Issue #163 - Nested Media Tracking', () => {
  const pageId = 'test-page-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track nested media blocks inside list items', async () => {
    const fetcher = new BlockFetcher(pageId, mockNotionClient, {
      trackMediaBlocks: true,
      maxRequestsPerSecond: 50, // fast execution
    });

    // Mock response structure
    // Level 1: List items
    const rootBlocks = {
      results: [
        {
          object: 'block',
          id: 'list-item-1',
          type: 'bulleted_list_item',
          has_children: true,
          bulleted_list_item: { rich_text: [] },
          parent: { type: 'page_id', page_id: pageId },
        },
        {
          object: 'block',
          id: 'list-item-2',
          type: 'bulleted_list_item',
          has_children: true,
          bulleted_list_item: { rich_text: [] },
          parent: { type: 'page_id', page_id: pageId },
        },
      ],
      next_cursor: null,
    };

    // Level 2: Images inside list items
    const nestedBlocks1 = {
      results: [
        {
          object: 'block',
          id: 'image-1',
          type: 'image',
          has_children: false,
          image: {
            type: 'external',
            external: { url: 'https://example.com/1.png' },
          },
          parent: { type: 'block_id', block_id: 'list-item-1' },
        },
      ],
      next_cursor: null,
    };

    const nestedBlocks2 = {
      results: [
        {
          object: 'block',
          id: 'image-2',
          type: 'image',
          has_children: false,
          image: {
            type: 'external',
            external: { url: 'https://example.com/2.png' },
          },
          parent: { type: 'block_id', block_id: 'list-item-2' },
        },
      ],
      next_cursor: null,
    };

    // Setup mocks
    const listMock = mockNotionClient.blocks.children.list as any;

    // First call for root blocks
    listMock.mockResolvedValueOnce(rootBlocks);

    // Subsequent calls for children (order depends on queue processing)
    // We'll use mockImplementation to return based on block_id
    listMock.mockImplementation(async (args: any) => {
      if (args.block_id === 'list-item-1') return nestedBlocks1;
      if (args.block_id === 'list-item-2') return nestedBlocks2;
      return { results: [], next_cursor: null };
    });

    // Run fetcher
    const result = await fetcher.getBlocks(pageId);

    // Verify
    console.log('Tracked Media Blocks:', result.mediaBlockReferences?.length);
    result.mediaBlockReferences?.forEach((ref) => console.log(' - ', ref.id));

    expect(result.mediaBlockReferences).toHaveLength(2);
    expect(result.mediaBlockReferences?.map((r) => r.id).sort()).toEqual([
      'image-1',
      'image-2',
    ]);
  });
});
