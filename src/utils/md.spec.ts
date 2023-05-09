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
  test("Image with alt text", () => {
    expect(image("simple text", "https://example.com/image", false)).toBe(
      `![simple text](https://example.com/image)`
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
