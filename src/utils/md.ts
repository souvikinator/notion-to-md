import { CalloutIcon } from '../types';

export const inlineCode = (text: string) => {
  return `\`${text}\``;
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
  return `\`\`\`${language}
${text}
\`\`\``;
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
  return `> ${text.replace(/\n/g, "  \n>")}`;
};

export const callout = (text: string, icon?: CalloutIcon) => {
  let emoji: string | undefined;
  if (icon?.type === 'emoji') {
    emoji = icon.emoji;
  }

  // the replace is done to handle multiple lines
  return `> ${emoji ? emoji + ' ' : ''}${text.replace(/\n/g, "  \n>")}`;
};

export const bullet = (text: string, count?: number) => {
  return count ? `${count}. ${text}` : `- ${text}`;
};

export const todo = (text: string, checked: boolean) => {
  return checked ? `- [x] ${text}` : `- [ ] ${text}`;
};

export const image = (alt: string, href: string) => {
  return `![${alt}](${href})`;
};

export const addTabSpace = (text: string, n = 0) => {
  const tab = "	";
  for (let i = 0; i < n; i++) text = tab + text;
  return text;
};

export const divider = () => {
  return "---";
};

export const tableRowHeader = (row: string[]) => {
  let header = row.join("|");
  let divider = row.map((_) => "---").join("|");
  return `${header}\n${divider}`;
};

export const tableRowBody = (row: string[]) => {
  return row.join("|");
};

export const table = (cells: string[][]) => {
  const tableRows = cells.map((row, i) =>
    !i ? tableRowHeader(row) : tableRowBody(row)
  );
  return tableRows.join("\n");
};
