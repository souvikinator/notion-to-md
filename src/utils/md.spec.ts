import {
  callout,
  table,
  inlineCode,
  bold,
  italic,
  strikethrough,
  underline,
  link,
  codeBlock,
  heading1,
  heading2,
  heading3,
  quote,
  bullet,
  todo,
  toggle,
  image,
  inlineEquation,
  equation,
  escapeMarkdown,
  markdownEscapesToHtml,
} from "./md";

describe("Callout", () => {
  test("parses callout without emoji", () => {
    const text = "Call out text content.";

    expect(callout(text)).toBe(`> ${text}`);
  });

  test("parses callout with emoji", () => {
    const text = "Call out text content.";

    expect(
      callout(text, {
        type: "emoji",
        emoji: "😍",
      })
    ).toBe(`> 😍 ${text}`);
  });
});

describe("Markdown Table", () => {
  test("parse simple table to markdown table", () => {
    const mockTable = [
      ["number", "char"],
      ["1", "a"],
      ["2", "b"],
    ];

    expect(table(mockTable)).toBe(
      `
| number | char |
| ------ | ---- |
| 1      | a    |
| 2      | b    |
    `.trim()
    );
  });
});

describe("Text Annotations", () => {
  test("Inline Code", () => {
    expect(inlineCode("simple text")).toBe("`simple text`");
  });
  test("Code Block", () => {
    expect(codeBlock("simple text", "javascript")).toBe(
      `\`\`\`javascript
simple text
\`\`\``.trim()
    );
  });
  test("Inline Equation", () => {
    expect(inlineEquation("E = mc^2")).toBe("$E = mc^2$");
  });
  test("Equation Block", () => {
    expect(equation("E = mc^2")).toBe(
      `$$
E = mc^2
$$`.trim()
    );
  });
  test("Bold", () => {
    expect(bold("simple text")).toBe("**simple text**");
  });
  test("Italic", () => {
    expect(italic("simple text")).toBe("_simple text_");
  });
  test("StrikeThrough", () => {
    expect(strikethrough("simple text")).toBe("~~simple text~~");
  });
  test("Underline", () => {
    expect(underline("simple text")).toBe("<u>simple text</u>");
  });
});

describe("Headings", () => {
  test("Heading 1", () => {
    expect(heading1("simple text")).toBe("# simple text");
  });
  test("Heading 2", () => {
    expect(heading2("simple text")).toBe("## simple text");
  });
  test("Heading 3", () => {
    expect(heading3("simple text")).toBe("### simple text");
  });
});

describe("List Elements", () => {
  test("Bullet", () => {
    expect(bullet("simple text")).toBe("- simple text");
  });

  test("Checked todo", () => {
    expect(todo("simple text", true)).toBe("- [x] simple text");
  });

  test("Unchecked todo", () => {
    expect(todo("simple text", false)).toBe("- [ ] simple text");
  });
});

describe("Image", () => {
  test("Image with alt text", async () => {
    expect(await image("simple text", "https://example.com/image", false)).toBe(
      `![simple text](https://example.com/image)`
    );
  });

  test("Image to Base64", async () => {
    const image_markdown = await image(
      "simple text",
      "https://w.wallhaven.cc/full/ex/wallhaven-ex9gwo.png",
      true
    );

    expect(image_markdown).toMatch(
      `![simple text](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4CAYAAADo08FDAAAgAElEQVR4Aby9O5OlW5r`
    );
  });
});

describe("Toggle", () => {
  const noSpaces = (text: string) => text.replace(/\s+/g, "");
  test("displays content if toggle title is empty", () => {
    expect(noSpaces(toggle(undefined, "content"))).toBe("content");
  });
  test("return empty string if title and content are empty", () => {
    expect(noSpaces(toggle(undefined, undefined))).toBe("");
  });
  test("Displays toggle with <details> and <summary>", () => {
    expect(noSpaces(toggle("title", "content"))).toBe(
      "<details><summary>title</summary>content</details>"
    );
  });
});

describe("Code spans and fences (issue #176)", () => {
  test("inline code containing a backtick uses a longer delimiter", () => {
    expect(inlineCode("a`b")).toBe("``a`b``");
  });
  test("inline code containing a double backtick run", () => {
    expect(inlineCode("a``b")).toBe("```a``b```");
  });
  test("inline code starting or ending with a backtick is padded", () => {
    expect(inlineCode("`a")).toBe("`` `a ``");
    expect(inlineCode("a`")).toBe("`` a` ``");
  });
  test("code block containing a ``` fence uses a longer fence", () => {
    expect(codeBlock("```\ninner\n```", "markdown")).toBe(
      "````markdown\n```\ninner\n```\n````"
    );
  });
  test("code block preserves first-line indentation", () => {
    expect(codeBlock("    indented()\nnext()", "python")).toBe(
      "```python\n    indented()\nnext()\n```"
    );
  });
  test("code block still drops leading blank lines and trailing whitespace", () => {
    expect(codeBlock("\n\n  x = 1\n\n", "python")).toBe(
      "```python\n  x = 1\n```"
    );
  });
});

describe("escapeMarkdown (issue #176)", () => {
  test("escapes emphasis characters", () => {
    expect(escapeMarkdown("2*3*4 = 24")).toBe("2\\*3\\*4 = 24");
    expect(escapeMarkdown("snake_case_name")).toBe("snake\\_case\\_name");
  });
  test("escapes headings at line start", () => {
    expect(escapeMarkdown("# not a heading")).toBe("\\# not a heading");
  });
  test("escapes ordered and unordered list markers at line start", () => {
    expect(escapeMarkdown("1. not a list")).toBe("1\\. not a list");
    expect(escapeMarkdown("- not a list")).toBe("\\- not a list");
    expect(escapeMarkdown("a\n2) b")).toBe("a\n2\\) b");
  });
  test("escapes links, html, backslashes and pipes", () => {
    expect(escapeMarkdown("[x](y) <b> a\\b | c")).toBe(
      "\\[x\\](y) \\<b\\> a\\\\b \\| c"
    );
  });
  test("leaves ordinary text alone", () => {
    expect(escapeMarkdown("Hello, world. 3 - 2 = 1")).toBe(
      "Hello, world. 3 - 2 = 1"
    );
  });
});

describe("escapeMarkdown edge cases", () => {
  test("leaves bare URLs untouched so auto-links keep working", () => {
    expect(escapeMarkdown("see https://x.com/a_b?q=1*2 and a_b")).toBe(
      "see https://x.com/a_b?q=1*2 and a\\_b"
    );
    expect(escapeMarkdown("www.x.com/a_b")).toBe("www.x.com/a_b");
  });
  test("escapes entities and setext underlines", () => {
    expect(escapeMarkdown("&amp;")).toBe("\\&amp;");
    expect(escapeMarkdown("Title\n===")).toBe("Title\n\\===");
  });
  test("markdownEscapesToHtml turns escapes into HTML-safe text", () => {
    expect(markdownEscapesToHtml(escapeMarkdown("2*3 <b> & a_b"))).toBe(
      "2*3 &lt;b&gt; &amp; a_b"
    );
  });
});
