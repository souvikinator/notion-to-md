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

exports.codeBlock = (text) => {
  return `\`\`\`${text}\`\`\``;
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
  return `| ${text}`;
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

//TODO: embed and fluid tags
