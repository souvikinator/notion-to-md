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

describe("escapeMarkdown with toggles", () => {
  const rt = (content: string, ann: Record<string, any> = {}) => ({
    type: "text",
    text: { content, link: null },
    plain_text: content,
    href: null,
    annotations: {
      bold: false, italic: false, strikethrough: false,
      underline: false, code: false, color: "default",
      ...ann,
    },
  });
  const summaryOf = async (...pieces: any[]) => {
    const child = {
      object: "block", id: "c", type: "paragraph", has_children: false,
      paragraph: { rich_text: [rt("child")], color: "default" },
    };
    const toggle = {
      object: "block", id: "t", type: "toggle", has_children: true,
      toggle: { rich_text: pieces, color: "default" },
    };
    const client = {
      blocks: {
        children: {
          list: async ({ block_id }: any) => ({
            results: block_id === "t" ? [child] : [],
            has_more: false,
            next_cursor: null,
          }),
        },
      },
    };
    const n2m = new NotionToMarkdown({
      notionClient: client as any,
      config: { escapeMarkdown: true },
    });
    const out = n2m.toMarkdownString(
      await n2m.blocksToMarkdown([toggle as any])
    ).parent;
    return out.match(/<summary>([\s\S]*?)<\/summary>/)![1];
  };

  test("toggle summary is HTML-safe instead of backslash-escaped", async () => {
    expect(await summaryOf(rt("2*3 <b>"))).toBe("2*3 &lt;b&gt;");
  });
  test("underlined toggle summary keeps its <u> tags", async () => {
    expect(await summaryOf(rt("Title", { underline: true }))).toBe(
      "<u>Title</u>"
    );
  });
  test("code toggle summary keeps its backslashes", async () => {
    expect(await summaryOf(rt("a\\*b", { code: true }))).toBe("`a\\*b`");
  });
});

describe("escapeMarkdown across rich text pieces", () => {
  test("ordered list marker split across pieces is escaped", async () => {
    const rt = (content: string) => ({
      type: "text",
      text: { content, link: null },
      plain_text: content,
      href: null,
      annotations: {
        bold: false, italic: false, strikethrough: false,
        underline: false, code: false, color: "default",
      },
    });
    const n2m = new NotionToMarkdown({
      notionClient: {} as any,
      config: { escapeMarkdown: true },
    });
    const para = {
      object: "block", id: "p", type: "paragraph", has_children: false,
      paragraph: { rich_text: [rt("1"), rt(". not a list")], color: "default" },
    };
    expect(await n2m.blockToMarkdown(para as any)).toBe("1\\. not a list");
  });
});

describe("code block regressions from PR #125", () => {
  const piece = (content: string) => ({
    type: "text",
    text: { content, link: null },
    plain_text: content,
    href: null,
    annotations: {
      bold: false, italic: false, strikethrough: false,
      underline: false, code: false, color: "default",
    },
  });
  const code = (pieces: string[], language: string) =>
    ({
      object: "block", id: "x", type: "code", has_children: false,
      code: { rich_text: pieces.map(piece), language, caption: [] },
    } as any);
  const n2m = new NotionToMarkdown({ notionClient: {} as any });

  test("rich text pieces are joined without adding newlines", async () => {
    expect(
      await n2m.blockToMarkdown(code(["const x = ", "42", ";"], "javascript"))
    ).toBe("```javascript\nconst x = 42;\n```");
  });
  test('"plain text" language maps to "text" (#47)', async () => {
    expect(await n2m.blockToMarkdown(code(["hello"], "plain text"))).toBe(
      "```text\nhello\n```"
    );
  });
});

describe("numbered lists from caller-fetched blocks (#166)", () => {
  const item = (id: string, content: string) =>
    ({
      object: "block", id, type: "numbered_list_item", has_children: false,
      numbered_list_item: {
        rich_text: [{
          type: "text", text: { content, link: null }, plain_text: content,
          href: null,
          annotations: {
            bold: false, italic: false, strikethrough: false,
            underline: false, code: false, color: "default",
          },
        }],
        color: "default",
      },
    } as any);
  const n2m = new NotionToMarkdown({ notionClient: {} as any });

  test("blocksToMarkdown numbers items that have no number yet", async () => {
    const out = n2m.toMarkdownString(
      await n2m.blocksToMarkdown([item("a", "Buy milk"), item("b", "Call mom")])
    ).parent;
    expect(out).toContain("1. Buy milk");
    expect(out).toContain("2. Call mom");
  });
  test("a single block without a number falls back to 1.", async () => {
    expect(await n2m.blockToMarkdown(item("c", "Solo"))).toBe("1. Solo");
  });
});
