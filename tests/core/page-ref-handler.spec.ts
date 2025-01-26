import { PageReferenceHandler } from "../../src/core/page-ref-handler";
import { PageReferenceManifestManager } from "../../src/utils/manifest-manager";
import { PageReferenceHandlerError } from "../../src/core/errors";
import {
  PageReferenceEntryType,
  PageProperties,
  ListBlockChildrenResponseResults,
  ListBlockChildrenResponseResult,
} from "../../src/types";

describe("PageReferenceHandler", () => {
  // Common test configuration
  const validConfig = {
    UrlPropertyNameNotion: "publishUrl",
    baseUrl: "https://example.com",
  };
  const validPageId = "page-123";

  // Mock manifest manager with proper typing
  let manifestManager: jest.Mocked<PageReferenceManifestManager>;

  // Create a properly typed mock property object matching Notion's API
  const mockProperties: PageProperties = {
    publishUrl: {
      id: "prop-123",
      type: "url",
      url: "https://mysite.com/page",
    },
    richTextUrl: {
      id: "rich-123",
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: { content: "https://mysite.com/rich-text", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "https://mysite.com/rich-text",
          href: null,
        },
      ],
    },
  };

  // Create properly typed mock blocks matching Notion's API
  const createLinkToPageBlock = (
    pageId: string,
  ): ListBlockChildrenResponseResult => ({
    id: "block-123",
    type: "link_to_page",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    has_children: false,
    archived: false,
    link_to_page: {
      type: "page_id",
      page_id: pageId,
    },
    comments: [],
    children: [],
  });

  const createParagraphWithMention = (
    pageId: string,
  ): ListBlockChildrenResponseResult => ({
    id: "block-123",
    type: "paragraph",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    has_children: false,
    archived: false,
    paragraph: {
      rich_text: [
        {
          type: "mention",
          mention: {
            type: "page",
            page: { id: pageId },
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "Linked Page",
          href: null,
        },
      ],
    },
    comments: [],
    children: [],
  });

  beforeEach(() => {
    manifestManager = {
      updateEntry: jest.fn(),
      getEntry: jest.fn(),
    } as unknown as jest.Mocked<PageReferenceManifestManager>;
  });

  describe("Constructor Validation", () => {
    test("should create instance with valid parameters", () => {
      expect(
        () =>
          new PageReferenceHandler(validPageId, validConfig, manifestManager),
      ).not.toThrow();
    });

    test.each([
      ["empty pageId", "", "Page ID is required"],
      ["null pageId", null, "Page ID is required"],
      ["undefined pageId", undefined, "Page ID is required"],
    ])("should throw error for %s", (_, pageId, expectedError) => {
      expect(
        () =>
          new PageReferenceHandler(pageId as any, validConfig, manifestManager),
      ).toThrow(expectedError);
    });
  });

  describe("URL Property Handling", () => {
    let handler: PageReferenceHandler;

    beforeEach(() => {
      handler = new PageReferenceHandler(
        validPageId,
        validConfig,
        manifestManager,
      );
    });

    test("should handle URL property type", async () => {
      const properties = {
        publishUrl: mockProperties.publishUrl,
      };

      await handler.processBlocks([], properties);

      expect(manifestManager.updateEntry).toHaveBeenCalledWith(
        validPageId,
        expect.objectContaining({
          url: "https://mysite.com/page",
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: expect.any(String),
        }),
      );
    });

    test("should handle rich text property type with URL", async () => {
      const properties = {
        publishUrl: mockProperties.richTextUrl,
      };

      await handler.processBlocks([], properties);

      expect(manifestManager.updateEntry).toHaveBeenCalledWith(
        validPageId,
        expect.objectContaining({
          url: "https://mysite.com/rich-text",
          source: PageReferenceEntryType.PROPERTY,
          lastUpdated: expect.any(String),
        }),
      );
    });

    test("should not update manifest when property doesn't contain URL", async () => {
      const properties = {
        publishUrl: {
          id: "prop-123",
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: { content: "not a url", link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: "not a url",
              href: null,
            },
          ],
        },
      } as PageProperties;

      await handler.processBlocks([], properties);

      expect(manifestManager.updateEntry).not.toHaveBeenCalled();
    });
  });

  describe("Block Processing", () => {
    let handler: PageReferenceHandler;

    beforeEach(() => {
      handler = new PageReferenceHandler(
        validPageId,
        validConfig,
        manifestManager,
      );
    });

    test("should process link_to_page block", async () => {
      const targetPageId = "target-page-123";
      const blocks = [
        createLinkToPageBlock(targetPageId),
      ] as ListBlockChildrenResponseResults;

      manifestManager.getEntry.mockReturnValue({
        url: "/target-page",
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      });

      await handler.processBlocks(blocks, mockProperties);

      expect(manifestManager.getEntry).toHaveBeenCalledWith(targetPageId);
      expect(blocks[0].href).toBe("https://example.com/target-page");
    });

    test("should process page mention in paragraph", async () => {
      const targetPageId = "target-page-123";
      const blocks = [
        createParagraphWithMention(targetPageId),
      ] as ListBlockChildrenResponseResults;

      manifestManager.getEntry.mockReturnValue({
        url: "/target-page",
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      });

      await handler.processBlocks(blocks, mockProperties);

      expect(manifestManager.getEntry).toHaveBeenCalledWith(targetPageId);
      expect(blocks[0].paragraph.rich_text[0].href).toBe(
        "https://example.com/target-page",
      );
    });

    test("should skip blocks without manifest entry", async () => {
      const blocks = [
        createLinkToPageBlock("non-existent-page"),
      ] as ListBlockChildrenResponseResults;

      manifestManager.getEntry.mockReturnValue(null);

      await handler.processBlocks(blocks, mockProperties);

      expect(blocks[0].href).toBeUndefined();
    });

    test("should handle custom URL transformation", async () => {
      const customConfig = {
        ...validConfig,
        transformUrl: (url: string) => `${url}-transformed`,
      };

      const handler = new PageReferenceHandler(
        validPageId,
        customConfig,
        manifestManager,
      );

      const blocks = [
        createLinkToPageBlock("target-page-123"),
      ] as ListBlockChildrenResponseResults;

      manifestManager.getEntry.mockReturnValue({
        url: "/target-page",
        source: PageReferenceEntryType.PROPERTY,
        lastUpdated: new Date().toISOString(),
      });

      await handler.processBlocks(blocks, mockProperties);

      expect(blocks[0].href).toBe("/target-page-transformed");
    });
  });

  describe("Error Handling", () => {
    let handler: PageReferenceHandler;

    beforeEach(() => {
      handler = new PageReferenceHandler(
        validPageId,
        validConfig,
        manifestManager,
      );
    });

    test("should handle manifest manager errors", async () => {
      manifestManager.updateEntry.mockRejectedValue(
        new Error("Manifest error"),
      );

      await expect(handler.processBlocks([], mockProperties)).rejects.toThrow(
        "Failed to handle page properties",
      );
    });

    test("should handle invalid blocks array", async () => {
      await expect(
        handler.processBlocks(null as any, mockProperties),
      ).rejects.toThrow("Invalid blocks array provided");
    });

    test("should handle missing properties", async () => {
      await expect(handler.processBlocks([], null as any)).rejects.toThrow(
        "Page properties are required",
      );
    });
  });
});
