exports.inlineCode = (text) => {
  return `\`${text}\``;
};

exports.bold = (text) => {
  return `**${text}**`;
};

exports.italic = (text) => {
  return `_${text}_`;
};

exports.strikethrough = (text) => {
  return `~~${text}~~`;
};

exports.underline = (text) => {
  return `<u>${text}</u>`;
};

exports.link = (text, href) => {
  return `[${text}](${href})`;
};

exports.codeBlock = (text, language) => {
  return `\`\`\`${language}
${text}
\`\`\``;
};

exports.heading1 = (text) => {
  return `# ${text}`;
};

exports.heading2 = (text) => {
  return `## ${text}`;
};

exports.heading3 = (text) => {
  return `### ${text}`;
};

exports.quote = (text) => {
  // the replace is done to handle multiple lines
  return `> ${text.replace(/\n/g, "  \n>")}`;
};

exports.bullet = (text) => {
  return `- ${text}`;
};

exports.todo = (text, checked) => {
  return checked ? `- [x] ${text}` : `- [ ] ${text}`;
};

exports.image = (alt, href) => {
  return `![${alt}](${href})`;
};

exports.addTabSpace = (text, n = 0) => {
  const tab = "	";
  for (i = 0; i < n; i++) text = tab + text;
  return text;
};

exports.divider = () => {
  return "---";
};
