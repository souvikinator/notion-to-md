// // block-fetcher.spec.ts
// import { Client } from "@notionhq/client";
// import { BlockFetcher } from "../../src/core/block-fetcher";
// import { ManifestManager } from "../../src/utils/manifest-manager";

// // Mock the Notion client
// jest.mock("@notionhq/client");

// describe("BlockFetcher", () => {
//   let blockFetcher: BlockFetcher;
//   let mockClient: jest.Mocked<Client>;
//   let manifestManager: ManifestManager;

//   beforeEach(() => {
//     // Setup mock client
//     mockClient = {
//       blocks: {
//         children: {
//           list: jest.fn(),
//         },
//       },
//       pages: {
//         retrieve: jest.fn(),
//       },
//       comments: {
//         list: jest.fn(),
//       },
//     } as unknown as jest.Mocked<Client>;

//     // Create BlockFetcher instance
//     blockFetcher = new BlockFetcher(mockClient);

//     // Setup ManifestManager
//     manifestManager = new ManifestManager("test-page-id");
//     blockFetcher.setManifestManager(manifestManager);
//   });

//   describe("getBlocks", () => {
//     const mockPageId = "test-page-id";

//     beforeEach(() => {
//       // Reset all mock implementations
//       jest.clearAllMocks();
//     });

//     test("fetches blocks recursively with proper rate limiting", async () => {
//       // Mock responses for block fetching
//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({
//           results: [
//             {
//               id: "block-1",
//               type: "paragraph",
//               has_children: true,
//             },
//             {
//               id: "block-2",
//               type: "heading_1",
//               has_children: false,
//             },
//           ],
//           has_more: false,
//         })
//         .mockResolvedValueOnce({
//           results: [
//             {
//               id: "block-1-1",
//               type: "text",
//               has_children: false,
//             },
//           ],
//           has_more: false,
//         });

//       const result = await blockFetcher.getBlocks(mockPageId);

//       // Verify block structure
//       expect(result.blocks).toHaveLength(2);
//       expect(result.blocks[0].children).toHaveLength(1);

//       // Verify rate limiting
//       const calls = mockClient.blocks.children.list.mock.calls;
//       const timeBetweenCalls = calls[1][0].timestamp - calls[0][0].timestamp;
//       expect(timeBetweenCalls).toBeGreaterThanOrEqual(333); // 1000ms/3 requests
//     });

//     test("handles pagination correctly", async () => {
//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({
//           results: [{ id: "block-1", type: "paragraph" }],
//           has_more: true,
//           next_cursor: "cursor-1",
//         })
//         .mockResolvedValueOnce({
//           results: [{ id: "block-2", type: "paragraph" }],
//           has_more: false,
//         });

//       const result = await blockFetcher.getBlocks(mockPageId);

//       expect(result.blocks).toHaveLength(2);
//       expect(mockClient.blocks.children.list).toHaveBeenCalledTimes(2);
//       expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
//         block_id: mockPageId,
//         start_cursor: "cursor-1",
//       });
//     });

//     test("fetches page properties when configured", async () => {
//       blockFetcher = new BlockFetcher(mockClient, {
//         fetchPageProperties: true,
//       });

//       mockClient.blocks.children.list.mockResolvedValue({
//         results: [],
//         has_more: false,
//       });

//       mockClient.pages.retrieve.mockResolvedValue({
//         properties: {
//           title: { type: "title", title: [{ plain_text: "Test" }] },
//         },
//       });

//       const result = await blockFetcher.getBlocks(mockPageId);

//       expect(result.properties).toBeDefined();
//       expect(mockClient.pages.retrieve).toHaveBeenCalledWith({
//         page_id: mockPageId,
//       });
//     });

//     test("fetches comments when configured", async () => {
//       blockFetcher = new BlockFetcher(mockClient, {
//         fetchComments: true,
//       });

//       mockClient.blocks.children.list.mockResolvedValue({
//         results: [{ id: "block-1", type: "paragraph" }],
//         has_more: false,
//       });

//       mockClient.comments.list.mockResolvedValue({
//         results: [{ id: "comment-1", content: "Test comment" }],
//         has_more: false,
//       });

//       const result = await blockFetcher.getBlocks(mockPageId);

//       expect(result.comments).toBeDefined();
//       expect(mockClient.comments.list).toHaveBeenCalled();
//     });

//     test("filters out unsupported blocks", async () => {
//       mockClient.blocks.children.list.mockResolvedValue({
//         results: [
//           { id: "block-1", type: "paragraph" },
//           { id: "block-2", type: "unsupported" },
//         ],
//         has_more: false,
//       });

//       const result = await blockFetcher.getBlocks(mockPageId);

//       expect(result.blocks).toHaveLength(1);
//       expect(result.blocks[0].type).toBe("paragraph");
//     });

//     test("builds correct block tree structure", async () => {
//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({
//           results: [
//             {
//               id: "parent",
//               type: "paragraph",
//               has_children: true,
//               parent: { type: "page_id", page_id: mockPageId },
//             },
//           ],
//           has_more: false,
//         })
//         .mockResolvedValueOnce({
//           results: [
//             {
//               id: "child",
//               type: "text",
//               has_children: false,
//               parent: { type: "block_id", block_id: "parent" },
//             },
//           ],
//           has_more: false,
//         });

//       const result = await blockFetcher.getBlocks(mockPageId);

//       expect(result.blocks[0].id).toBe("parent");
//       expect(result.blocks[0].children[0].id).toBe("child");
//     });
//   });
// });
