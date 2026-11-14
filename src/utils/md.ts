import { CalloutIcon } from "../types";
import markdownTable from "markdown-table";

import fetch from "node-fetch";

/**
 * Length of the longest run of consecutive backticks in `text`.
 */
const longestBacktickRun = (text: string): number => {
  const runs = text.match(/`+/g);
  return runs ? Math.max(...runs.map((run) => run.length)) : 0;
};

/**
 * Escapes characters that would otherwise be interpreted as Markdown
 * syntax, so the text renders literally (CommonMark backslash escapes).
 */
export const escapeMarkdown = (text: string): string => {
  return (
    text
      // inline syntax: emphasis, code, links, html, strikethrough, tables
      .replace(/([\\`*_[\]<>~|])/g, "\\$1")
      // block syntax at the start of a line: headings, quotes, list markers
      .replace(/(^|\n)([ \t]*)([#>+-])/g, "$1$2\\$3")
      // ordered list markers at the start of a line, e.g. "1." or "1)"
      .replace(/(^|\n)([ \t]*\d+)([.)])/g, "$1$2\\$3")
  );
};

export const inlineCode = (text: string) => {
  // The delimiter must be a backtick run longer than any run inside the text.
  const fence = "`".repeat(longestBacktickRun(text) + 1);
  // Pad with a space when the content would otherwise merge with the
  // delimiter, or would lose a meaningful leading/trailing space.
  const needsPadding =
    text.startsWith("`") ||
    text.endsWith("`") ||
    (text.startsWith(" ") && text.endsWith(" ") && text.trim() !== "");
  const content = needsPadding ? ` ${text} ` : text;
  return `${fence}${content}${fence}`;
};

export const inlineEquation = (text: string) => {
  return `$${text}$`;
};

export const bold = (text: string) => {
  return `**${text}**`;
};

export const italic = (text: string) => {
  return `_${text}_`;
};

export const strikethrough = (text: string) => {
  return `~~${text}~~`;
};

export const underline = (text: string) => {
  return `<u>${text}</u>`;
};

export const link = (text: string, href: string) => {
  return `[${text}](${href})`;
};

export const codeBlock = (text: string, language?: string) => {
  if (!text) return "";
  // Ensure a valid language, default to "plaintext" if missing
  const lang =
    language && language.trim() ? language.toLowerCase() : "plaintext";
  // The fence must be longer than any backtick run inside the code.
  const fence = "`".repeat(Math.max(3, longestBacktickRun(text) + 1));
  // Drop leading blank lines and trailing whitespace only, so indentation
  // on the first line of code is preserved.
  const code = text.replace(/^(?:[ \t]*\r?\n)+/, "").replace(/\s+$/, "");
  return `${fence}${lang}
${code}
${fence}`;
};

export const equation = (text: string) => {
  return `$$
${text}
$$`;
};

export const heading1 = (text: string) => {
  return `# ${text}`;
};

export const heading2 = (text: string) => {
  return `## ${text}`;
};

export const heading3 = (text: string) => {
  return `### ${text}`;
};

export const quote = (text: string) => {
  // the replace is done to handle multiple lines
  return `> ${text.replace(/\n/g, "  \n> ")}`;
};

export const callout = (text: string, icon?: CalloutIcon) => {
  let emoji: string | undefined;
  if (icon?.type === "emoji") {
    emoji = icon.emoji;
  }

  // the replace is done to handle multiple lines
  const formattedText = text.replace(/\n/g, "  \n> ");
  const formattedEmoji = emoji ? emoji + " " : "";
  const headingMatch = formattedText.match(/^(#{1,6})\s+([.*\s\S]+)/);
  if (headingMatch) {
    const headingLevel = headingMatch[1].length;
    const headingContent = headingMatch[2];
    return `> ${"#".repeat(headingLevel)} ${formattedEmoji}${headingContent}`;
  }
  return `> ${formattedEmoji}${formattedText}`;
};

export const bullet = (text: string, count?: number) => {
  let renderText = text.trim();
  return count ? `${count}. ${renderText}` : `- ${renderText}`;
};

export const todo = (text: string, checked: boolean) => {
  return checked ? `- [x] ${text}` : `- [ ] ${text}`;
};

export const image = async (
  alt: string,
  href: string,
  convertToBase64: boolean = false,
): Promise<string> => {
  // In case the user does not want to convert the images to Base64
  // or the image is already base64
  if (!convertToBase64 || href.startsWith("data:")) {
    if (href.startsWith("data:")) {
      // Extract base64 data, i.e. the string after 'data:mime/type;base64,'
      const base64 = href.split(",").pop();

      // This overrides incorrect data: string format to png
      // so that browsers can correctly render the data
      return `![${alt}](data:image/png;base64,${base64})`;
    }

    return `![${alt}](${href})`;
  } else {
    // Otherwise, download the image and convert it to base64
    const res = await fetch(href);
    const buf = await res.arrayBuffer();

    const base64 = Buffer.from(buf).toString("base64");

    return `![${alt}](data:image/png;base64,${base64})`;
  }
};

export const addTabSpace = (text: string, n = 0) => {
  const tab = "    ";
  for (let i = 0; i < n; i++) {
    if (text.includes("\n")) {
      const multiLineText = text.split(/(?:^|\n)/).join(`\n${tab}`);
      text = tab + multiLineText;
    } else text = tab + text;
  }
  return text;
};

export const divider = () => {
  return "---";
};

export const toggle = (summary?: string, children?: string) => {
  if (!summary) return children || "";
  return `<details>
<summary>${summary}</summary>
${children || ""}
</details>\n\n`;
};

export const table = (cells: string[][]) => {
  return markdownTable(cells);
};
