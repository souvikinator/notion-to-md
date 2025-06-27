import { NotionToMarkdown } from "./notion-to-md";

describe("setCustomTransformer", () => {
  test("blockToMarkdown sends parsing block to customTransformer", () => {
    const customTransformerMock = jest.fn();
    const n2m = new NotionToMarkdown({ notionClient: {} as any });
    n2m.setCustomTransformer("test", customTransformerMock);
    n2m.blockToMarkdown({
      id: "test",
      name: "test",
      type: "test",
      test: { foo: "bar" },
    } as any);
    expect(customTransformerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "test",
        test: { foo: "bar" },
      })
    );
  });
  test("supports only one customTransformer per type ", () => {
    const customTransformerMock1 = jest.fn();
    const customTransformerMock2 = jest.fn();
    const n2m = new NotionToMarkdown({ notionClient: {} as any });
    n2m.setCustomTransformer("test", customTransformerMock1);
    n2m.setCustomTransformer("test", customTransformerMock2);
    n2m.blockToMarkdown({
      id: "test",
      name: "test",
      type: "test",
      test: { foo: "bar" },
    } as any);
    expect(customTransformerMock1).not.toHaveBeenCalled();
    expect(customTransformerMock2).toHaveBeenCalled();
  });

  test("customTransformer implementation works", async () => {
    const customTransformerMock = jest.fn();
    customTransformerMock.mockImplementation(async () => {
      return "hello";
    });
    const n2m = new NotionToMarkdown({ notionClient: {} as any });
    n2m.setCustomTransformer("divider", customTransformerMock);
    const md = await n2m.blockToMarkdown({
      id: "test",
      type: "divider",
      divider: {},
      object: "block",
    });
    expect(md).toBe("hello");
  });

  test("customTransformer default implementation works", async () => {
    const customTransformerMock = jest.fn();
    customTransformerMock.mockImplementation(async () => {
      return false;
    });
    const n2m = new NotionToMarkdown({ notionClient: {} as any });
    n2m.setCustomTransformer("divider", customTransformerMock);
    const md = await n2m.blockToMarkdown({
      id: "test",
      type: "divider",
      divider: {},
      object: "block",
    });
    expect(md).toBe("---");
  });

  test("setLinkTransformer works", async () => {
    const n2m = new NotionToMarkdown({ notionClient: {} as any });
    n2m.setLinkTransformer(async (text, href) => {
      return `<a href="${href}" data-testid="my-link">${text}</a>`;
    });
    const md = await n2m.blockToMarkdown({
      id: "test",
      type: "paragraph",
      paragraph: {
        color: "default",
        rich_text: [
          {
            type: "text",
            text: {
              content: "Link using at-sign ",
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: "Link using at-sign ",
            href: null,
          },
          {
            type: "mention",
            mention: {
              type: "page",
              page: {
                id: "f1b1910b-caec-8014-aecb-d34ee7f50191",
              },
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: "My page",
            href: "https://www.notion.so/f1b1910bcaec8014aecbd34ee7f50191",
          },
        ],
      },
      object: "block",
    });
    expect(md).toBe(
      'Link using at-sign <a href="https://www.notion.so/f1b1910bcaec8014aecbd34ee7f50191" data-testid="my-link">My page</a>'
    );
  });
});
