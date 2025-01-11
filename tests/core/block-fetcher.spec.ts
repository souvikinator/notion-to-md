// block-fetcher.test.ts
import { Client } from "@notionhq/client";
import { BlockFetcher } from "../../src/core/block-fetcher";
import {
  BlockFetcherConfig,
  ListBlockChildrenResponseResults,
  ListBlockChildrenResponseResult,
  PageObjectProperties,
  CommentResponseResults,
} from "../../src/types";

// Creating realistic mock data that matches Notion's API structure
const mockBlocks = {
  // Root page block with basic metadata
  root: {
    id: "root-id",
    type: "page",
    parent: { type: "page_id", page_id: "parent-page-id" },
    has_children: true,
    object: "block",
    created_time: "2024-01-12T00:00:00.000Z",
    last_edited_time: "2024-01-12T00:00:00.000Z",
    archived: false,
    created_by: { id: "user1" },
    last_edited_by: { id: "user1" },
  },

  // A paragraph block that demonstrates nesting capability
  block1: {
    id: "block1-id",
    type: "paragraph",
    parent: { type: "page_id", page_id: "root-id" },
    has_children: true,
    paragraph: { rich_text: [] },
    object: "block",
    created_time: "2024-01-12T00:00:00.000Z",
    last_edited_time: "2024-01-12T00:00:00.000Z",
    archived: false,
    created_by: { id: "user1" },
    last_edited_by: { id: "user1" },
  },

  // A text block showing rich text content structure
  block1_1: {
    id: "block1_1-id",
    type: "paragraph",
    parent: { type: "block_id", block_id: "block1-id" },
    has_children: false,
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "Hello", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "Hello",
          href: null,
        },
      ],
    },
    object: "block",
    created_time: "2024-01-12T00:00:00.000Z",
    last_edited_time: "2024-01-12T00:00:00.000Z",
    archived: false,
    created_by: { id: "user1" },
    last_edited_by: { id: "user1" },
  },
};

// Mock comments that would be associated with blocks
const mockComments: Record<string, CommentResponseResults> = {
  "root-id": [
    {
      id: "comment1-id",
      parent: { type: "page_id", page_id: "root-id" },
      discussion_id: "disc1",
      created_time: "2024-01-12T00:00:00.000Z",
      last_edited_time: "2024-01-12T00:00:00.000Z",
      created_by: { id: "user1" },
      rich_text: [
        {
          type: "text",
          text: { content: "Root comment", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "Root comment",
          href: null,
        },
      ],
    },
  ],
  "block1-id": [
    {
      id: "comment2-id",
      parent: { type: "block_id", block_id: "block1-id" },
      discussion_id: "disc2",
      created_time: "2024-01-12T00:00:00.000Z",
      last_edited_time: "2024-01-12T00:00:00.000Z",
      created_by: { id: "user1" },
      rich_text: [
        {
          type: "text",
          text: { content: "Block comment", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "Block comment",
          href: null,
        },
      ],
    },
  ],
};

// Mock page properties that would be returned by the pages.retrieve endpoint
const mockProperties: PageObjectProperties = {
  title: {
    id: "title",
    type: "title",
    title: [
      {
        type: "text",
        text: { content: "Test Page", link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        plain_text: "Test Page",
        href: null,
      },
    ],
  },
};

// Tell Jest to automatically mock the Notion client
jest.mock("@notionhq/client");

describe("BlockFetcher", () => {
  let mockClient: jest.Mocked<Client>;
  let blockFetcher: BlockFetcher;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Create a new instance of the mocked client
    mockClient = new Client({}) as jest.Mocked<Client>;

    // Setup mock implementations for all required Notion API methods
    (mockClient.blocks.children.list as jest.Mock).mockImplementation(
      async ({ block_id, start_cursor }) => {
        // Simulate the block hierarchy based on the requested block ID
        if (block_id === "root-id") {
          return {
            results: [mockBlocks.block1],
            has_more: false,
            next_cursor: null,
          };
        }
        if (block_id === "block1-id") {
          return {
            results: [mockBlocks.block1_1],
            has_more: false,
            next_cursor: null,
          };
        }
        return { results: [], has_more: false, next_cursor: null };
      },
    );

    (mockClient.comments.list as jest.Mock).mockImplementation(
      async ({ block_id, start_cursor }) => {
        return {
          results: mockComments[block_id] || [],
          has_more: false,
          next_cursor: null,
        };
      },
    );

    (mockClient.pages.retrieve as jest.Mock).mockImplementation(
      async ({ page_id }) => ({
        object: "page",
        id: page_id,
        properties: mockProperties,
      }),
    );

    // Initialize BlockFetcher with mock client
    blockFetcher = new BlockFetcher(mockClient, {
      fetchPageProperties: true,
      fetchComments: true,
      maxRequestsPerSecond: 3,
      batchSize: 3,
    });
  });

  // Test suites organized by functionality
  describe("Block Fetching", () => {
    it("should fetch complete block hierarchy", async () => {
      const result = await blockFetcher.getBlocks("root-id");

      // Verify block structure
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].id).toBe("block1-id");
      expect(result.blocks[0].children).toHaveLength(1);
      expect(result.blocks[0].children[0].id).toBe("block1_1-id");

      // Verify API calls
      expect(mockClient.blocks.children.list).toHaveBeenCalledTimes(2);
      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
        block_id: "root-id",
        start_cursor: undefined,
      });
    });

    it("should handle pagination", async () => {
      (mockClient.blocks.children.list as jest.Mock)
        .mockResolvedValueOnce({
          results: [mockBlocks.block1],
          has_more: true,
          next_cursor: "cursor1",
        })
        .mockResolvedValueOnce({
          results: [mockBlocks.block1_1],
          has_more: false,
          next_cursor: null,
        });

      await blockFetcher.getBlocks("root-id");

      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
        block_id: "root-id",
        start_cursor: "cursor1",
      });
    });
  });

  describe("Comment Fetching", () => {
    it("should associate comments with correct blocks", async () => {
      const result = await blockFetcher.getBlocks("root-id");

      expect(result.comments).toHaveLength(1);
      expect(result.blocks[0].comments).toHaveLength(1);
      expect(result.blocks[0].comments[0].id).toBe("comment2-id");
      expect(mockClient.comments.list).toHaveBeenCalled();
    });

    it("should handle blocks without comments", async () => {
      (mockClient.comments.list as jest.Mock).mockResolvedValue({
        results: [],
        has_more: false,
        next_cursor: null,
      });

      const result = await blockFetcher.getBlocks("root-id");

      expect(result.comments).toHaveLength(0);
      expect(result.blocks[0].comments).toHaveLength(0);
    });
  });

  describe("Rate Limiting", () => {
    it("should respect rate limits", async () => {
      const startTime = Date.now();

      // Configure for low rate limit to test timing
      blockFetcher = new BlockFetcher(mockClient, {
        fetchPageProperties: true,
        fetchComments: true,
        maxRequestsPerSecond: 2,
        batchSize: 1,
      });

      await blockFetcher.getBlocks("root-id");

      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThanOrEqual(1000);
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      (mockClient.blocks.children.list as jest.Mock).mockRejectedValueOnce(
        new Error("API Error"),
      );

      await expect(blockFetcher.getBlocks("root-id")).rejects.toThrow(
        "API Error",
      );
    });

    it("should handle invalid block types", async () => {
      (mockClient.blocks.children.list as jest.Mock).mockResolvedValueOnce({
        results: [{ ...mockBlocks.block1, type: "unsupported" }],
        has_more: false,
      });

      const result = await blockFetcher.getBlocks("root-id");
      expect(result.blocks).toHaveLength(0);
    });
  });
});
