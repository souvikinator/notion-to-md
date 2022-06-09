import { callout, table } from "./md";

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
