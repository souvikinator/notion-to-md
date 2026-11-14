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
});

describe("Markdown escaping in blockToMarkdown (issue #176)", () => {
  const rt = (content: string, ann: Record<string, any> = {}) => ({
    type: "text",
    text: { content, link: null },
    plain_text: content,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
      ...ann,
    },
  });
  const para = (...r: any[]) =>
    ({
      object: "block",
      id: "1",
      type: "paragraph",
      has_children: false,
      paragraph: { rich_text: r, color: "default" },
    } as any);
  const code = (s: string, language: string) =>
    ({
      object: "block",
      id: "2",
      type: "code",
      has_children: false,
      code: { rich_text: [rt(s)], language, caption: [] },
    } as any);

  const plain = new NotionToMarkdown({ notionClient: {} as any });
  const escaping = new NotionToMarkdown({
    notionClient: {} as any,
    config: { escapeMarkdown: true },
  });

  test("plain text is unchanged by default", async () => {
    expect(await plain.blockToMarkdown(para(rt("2*3*4 = 24")))).toBe(
      "2*3*4 = 24"
    );
  });
  test("plain text is escaped when escapeMarkdown is enabled", async () => {
    expect(await escaping.blockToMarkdown(para(rt("2*3*4 = 24")))).toBe(
      "2\\*3\\*4 = 24"
    );
    expect(await escaping.blockToMarkdown(para(rt("# not a heading")))).toBe(
      "\\# not a heading"
    );
    expect(await escaping.blockToMarkdown(para(rt("1. not a list")))).toBe(
      "1\\. not a list"
    );
  });
  test("annotations still apply on top of escaped text", async () => {
    expect(
      await escaping.blockToMarkdown(para(rt("a*b", { bold: true })))
    ).toBe("**a\\*b**");
  });
  test("inline code is never escaped and survives backticks", async () => {
    expect(
      await escaping.blockToMarkdown(para(rt("a`b", { code: true })))
    ).toBe("``a`b``");
  });
  test("code blocks with fences and indentation", async () => {
    expect(
      await plain.blockToMarkdown(code("```\ninner\n```", "markdown"))
    ).toBe("````markdown\n```\ninner\n```\n````");
    expect(
      await plain.blockToMarkdown(code("    indented()\nnext()", "python"))
    ).toBe("```python\n    indented()\nnext()\n```");
  });
});
