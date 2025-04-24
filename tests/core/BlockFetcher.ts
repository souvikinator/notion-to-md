// import { Client } from "@notionhq/client";
// import { BlockFetcher } from "../../src/core/BlockFetcher";

// describe("BlockFetcher", () => {
//   let mockClient: jest.Mocked<Client>;
//   let fetcher: BlockFetcher;

//   beforeEach(() => {
//     // Reset mock for each test
//     mockClient = {
//       blocks: {
//         children: {
//           list: jest.fn(),
//         },
//       },
//     } as any;
//     fetcher = new BlockFetcher(mockClient);
//   });

//   describe("Basic Block Fetching", () => {
//     test("should fetch top-level blocks", async () => {
//       const mockBlocks = [
//         { id: "block1", type: "paragraph", has_children: false },
//         { id: "block2", type: "heading_1", has_children: false },
//       ];

//       mockClient.blocks.children.list.mockResolvedValueOnce({
//         results: mockBlocks,
//         has_more: false,
//       });

//       const result = await fetcher.getBlocks("page-id");

//       expect(result).toHaveLength(2);
//       expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
//         block_id: "page-id",
//         start_cursor: undefined,
//       });
//     });

//     test("should handle empty pages", async () => {
//       mockClient.blocks.children.list.mockResolvedValueOnce({
//         results: [],
//         has_more: false,
//       });

//       const result = await fetcher.getBlocks("empty-page");

//       expect(result).toHaveLength(0);
//     });

//     test("should preserve block order", async () => {
//       const mockBlocks = [
//         { id: "block1", type: "paragraph", has_children: false },
//         { id: "block2", type: "heading_1", has_children: false },
//         { id: "block3", type: "code", has_children: false },
//       ];

//       mockClient.blocks.children.list.mockResolvedValueOnce({
//         results: mockBlocks,
//         has_more: false,
//       });

//       const result = await fetcher.getBlocks("page-id");

//       expect(result.map((b) => b.id)).toEqual(["block1", "block2", "block3"]);
//     });
//   });

//   describe("Batch Processing", () => {
//     test("should process in batches of 3", async () => {
//       // Mock blocks with children to trigger batch processing
//       const rootBlocks = [
//         { id: "block1", type: "toggle", has_children: true },
//         { id: "block2", type: "toggle", has_children: true },
//         { id: "block3", type: "toggle", has_children: true },
//         { id: "block4", type: "toggle", has_children: true },
//       ];

//       // Mock responses for each block's children
//       const childrenResponses = {
//         block1: [{ id: "child1", type: "paragraph", has_children: false }],
//         block2: [{ id: "child2", type: "paragraph", has_children: false }],
//         block3: [{ id: "child3", type: "paragraph", has_children: false }],
//         block4: [{ id: "child4", type: "paragraph", has_children: false }],
//       };

//       // Setup mock responses
//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({ results: rootBlocks, has_more: false })
//         .mockResolvedValueOnce({
//           results: childrenResponses.block1,
//           has_more: false,
//         })
//         .mockResolvedValueOnce({
//           results: childrenResponses.block2,
//           has_more: false,
//         })
//         .mockResolvedValueOnce({
//           results: childrenResponses.block3,
//           has_more: false,
//         })
//         .mockResolvedValueOnce({
//           results: childrenResponses.block4,
//           has_more: false,
//         });

//       await fetcher.getBlocks("page-id");

//       // First call + 2 batches of children fetching
//       expect(mockClient.blocks.children.list).toHaveBeenCalledTimes(5);
//     });

//     test("should respect rate limits", async () => {
//       jest.useFakeTimers();
//       const startTime = Date.now();

//       const mockBlocks = [
//         { id: "block1", type: "toggle", has_children: true },
//         { id: "block2", type: "toggle", has_children: true },
//         { id: "block3", type: "toggle", has_children: true },
//       ];

//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({ results: mockBlocks, has_more: false })
//         .mockResolvedValueOnce({ results: [], has_more: false })
//         .mockResolvedValueOnce({ results: [], has_more: false })
//         .mockResolvedValueOnce({ results: [], has_more: false });

//       const fetchPromise = fetcher.getBlocks("page-id");

//       // Fast-forward timers
//       jest.runAllTimers();
//       await fetchPromise;

//       // Should have waited between batches
//       expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 334);
//     });
//   });

//   describe("Nested Structure Handling", () => {
//     test("should fetch children for blocks and maintain structure", async () => {
//       const rootBlock = {
//         id: "root",
//         type: "toggle",
//         has_children: true,
//       };

//       const childBlock = {
//         id: "child",
//         type: "paragraph",
//         has_children: true,
//       };

//       const grandchildBlock = {
//         id: "grandchild",
//         type: "text",
//         has_children: false,
//       };

//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({ results: [rootBlock], has_more: false })
//         .mockResolvedValueOnce({ results: [childBlock], has_more: false })
//         .mockResolvedValueOnce({ results: [grandchildBlock], has_more: false });

//       const result = await fetcher.getBlocks("page-id");

//       expect(result[0].id).toBe("root");
//       expect(result[0].children[0].id).toBe("child");
//       expect(result[0].children[0].children[0].id).toBe("grandchild");
//     });
//   });

//   describe("Pagination", () => {
//     test("should handle multiple pages of results", async () => {
//       const page1 = [{ id: "block1", type: "text", has_children: false }];
//       const page2 = [{ id: "block2", type: "text", has_children: false }];

//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({
//           results: page1,
//           has_more: true,
//           next_cursor: "cursor1",
//         })
//         .mockResolvedValueOnce({
//           results: page2,
//           has_more: false,
//         });

//       const result = await fetcher.getBlocks("page-id");

//       expect(result).toHaveLength(2);
//       expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
//         block_id: "page-id",
//         start_cursor: undefined,
//       });
//       expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
//         block_id: "page-id",
//         start_cursor: "cursor1",
//       });
//     });
//   });

//   describe("Error Handling", () => {
//     test("should continue processing after block fetch failure", async () => {
//       const rootBlocks = [
//         { id: "block1", type: "toggle", has_children: true },
//         { id: "block2", type: "toggle", has_children: true },
//       ];

//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({ results: rootBlocks, has_more: false })
//         .mockRejectedValueOnce(new Error("Failed to fetch"))
//         .mockResolvedValueOnce({ results: [], has_more: false });

//       const result = await fetcher.getBlocks("page-id");

//       expect(result).toHaveLength(2);
//       // Second block should still have been processed despite first block's children failing
//       expect(mockClient.blocks.children.list).toHaveBeenCalledTimes(3);
//     });
//   });

//   describe("Cycle Prevention", () => {
//     test("should handle circular references", async () => {
//       const blockA = { id: "A", type: "toggle", has_children: true };
//       const blockB = { id: "B", type: "toggle", has_children: true };

//       // Create a circular reference A -> B -> A
//       mockClient.blocks.children.list
//         .mockResolvedValueOnce({ results: [blockA], has_more: false })
//         .mockResolvedValueOnce({ results: [blockB], has_more: false })
//         .mockResolvedValueOnce({ results: [blockA], has_more: false });

//       const result = await fetcher.getBlocks("page-id");

//       // Should not get stuck in infinite loop
//       expect(result).toBeDefined();
//       // Each block should only be processed once
//       expect(mockClient.blocks.children.list).toHaveBeenCalledTimes(3);
//     });
//   });
// });
