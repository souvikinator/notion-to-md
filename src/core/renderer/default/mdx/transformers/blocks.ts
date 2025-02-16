import { BlockTransformer, BlockType } from '../../../../../types';

export const blockTransformers: Partial<Record<BlockType, BlockTransformer>> = {
  paragraph: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.paragraph.rich_text);

      // Process any child blocks (for nested content)
      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      return text ? `${text}${children ? `\n${children}` : ''}\n` : '\n';
    },
  },

  heading_1: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.heading_1.rich_text);
      // @ts-ignore
      const isToggle = block.heading_1.is_toggleable;

      if (!isToggle) {
        return `# ${text}\n\n`;
      }

      // Handle toggle heading with children
      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      return `<details>
<summary><h1>${text}</h1></summary>

${children}
</details>\n\n`;
    },
  },

  heading_2: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.heading_2.rich_text);
      // @ts-ignore
      const isToggle = block.heading_2.is_toggleable;

      if (!isToggle) {
        return `## ${text}\n\n`;
      }

      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      return `<details>
<summary><h2>${text}</h2></summary>

${children}
</details>\n\n`;
    },
  },

  heading_3: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.heading_3.rich_text);
      // @ts-ignore
      const isToggle = block.heading_3.is_toggleable;

      if (!isToggle) {
        return `### ${text}\n\n`;
      }

      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      return `<details>
<summary><h3>${text}</h3></summary>

${children}
</details>\n\n`;
    },
  },

  bulleted_list_item: {
    transform: async ({ block, utils, metadata }) => {
      const text = await utils.processRichText(
        // @ts-ignore
        block.bulleted_list_item.rich_text,
      );

      // Process nested items with increased indentation
      const children = block.children
        ? await utils.processChildren(block.children, { indent: '  ' })
        : '';

      // Apply indentation from parent context if it exists
      const indent = metadata?.indent || '';
      return `${indent}- ${text}${children ? `\n${children}` : ''}\n`;
    },
  },

  numbered_list_item: {
    transform: async ({ block, utils, metadata }) => {
      const text = await utils.processRichText(
        // @ts-ignore
        block.numbered_list_item.rich_text,
      );

      // Get current nesting level and number
      const level = metadata?.level || 0;
      const numbers = metadata?.numbers || [0];

      // Increment number for current level
      numbers[level] = (numbers[level] || 0) + 1;

      // Process children with incremented level
      const children = block.children
        ? await utils.processChildren(block.children, {
            level: level + 1,
            numbers: [...numbers],
            indent: '   '.repeat(level + 1),
          })
        : '';

      const indent = '   '.repeat(level);
      return `${indent}${numbers[level]}. ${text}${children ? `\n${children}` : ''}\n`;
    },
  },

  callout: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.callout.rich_text);
      // @ts-ignore
      const icon = block.callout.icon?.emoji || '';

      // Process any child blocks
      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      // Split into lines and format each as a quote
      const lines = text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      return `> ${icon} ${lines}${
        children
          ? `\n${children
              .split('\n')
              .map((line) => `> ${line}`)
              .join('\n')}`
          : ''
      }\n\n`;
    },
  },

  toggle: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.toggle.rich_text);

      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      return `<details>
<summary>${text}</summary>

${children}
</details>\n\n`;
    },
  },

  code: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.code.rich_text);
      // @ts-ignore
      const language = block.code.language || '';
      return `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
    },
  },

  quote: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.quote.rich_text);

      // Handle multiline quotes
      const lines = text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      const children = block.children
        ? await utils.processChildren(block.children)
        : '';

      return `${lines}${children ? `\n${children}` : ''}\n\n`;
    },
  },

  image: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const imageBlock = block.image;
      const url =
        imageBlock.type === 'external'
          ? imageBlock.external.url
          : imageBlock.file.url;
      // @ts-ignore
      const caption = imageBlock.caption
        ? await utils.processRichText(imageBlock.caption)
        : 'Image';

      return `![${caption}](${url})\n\n`;
    },
  },

  video: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const videoBlock = block.video;
      const url =
        videoBlock.type === 'external'
          ? videoBlock.external.url
          : videoBlock.file.url;

      const caption = videoBlock.caption
        ? await utils.processRichText(videoBlock.caption)
        : 'Video';

      return `[📺 ${caption}](${url})\n\n`;
    },
  },

  file: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const fileBlock = block.file;
      const url =
        fileBlock.type === 'external'
          ? fileBlock.external.url
          : fileBlock.file.url;

      const caption = fileBlock.caption
        ? await utils.processRichText(fileBlock.caption)
        : fileBlock.name || 'File';

      return `[📎 ${caption}](${url})\n\n`;
    },
  },

  pdf: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const pdfBlock = block.pdf;
      const url =
        pdfBlock.type === 'external'
          ? pdfBlock.external.url
          : pdfBlock.file.url;

      const caption = pdfBlock.caption
        ? await utils.processRichText(pdfBlock.caption)
        : 'PDF Document';

      return `[📄 ${caption}](${url})\n\n`;
    },
  },

  bookmark: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const bookmarkBlock = block.bookmark;
      const url = bookmarkBlock.url;
      const caption = bookmarkBlock.caption
        ? await utils.processRichText(bookmarkBlock.caption)
        : url;

      return `[🔖 ${caption}](${url})\n\n`;
    },
  },

  equation: {
    transform: async ({ block }) => {
      // @ts-ignore
      const expression = block.equation.expression;
      return `\`\`\`math\n${expression}\n\`\`\`\n\n`;
    },
  },

  divider: {
    transform: async () => '---\n\n',
  },

  table: {
    transform: async ({ block, utils }) => {
      // Early return if not a table block
      if (!('table' in block)) return '';

      // Check if we have header configuration
      const hasColumnHeader = block.table?.has_column_header || false;
      const hasRowHeader = block.table?.has_row_header || false;

      // Early return if no children
      if (!block.children || block.children.length === 0) return '';

      // Process each row's cells
      const rows = await Promise.all(
        block.children.map(async (row) => {
          // Ensure it's a table_row block
          if (!('table_row' in row)) return [];

          // Process each cell's rich text content
          const cells = await Promise.all(
            row.table_row.cells.map(async (cell) => {
              // Each cell is an array of rich text objects
              const cellContent = await utils.processRichText(cell);
              return cellContent.trim() || ' '; // Use space for empty cells
            }),
          );

          return cells;
        }),
      );

      // Build markdown table
      let markdown = '';

      // Handle header row
      if (hasColumnHeader && rows.length > 0) {
        const headerRow = rows[0];
        markdown += `| ${headerRow.join(' | ')} |\n`;
        // Add separator row with correct number of columns
        markdown += `| ${headerRow.map(() => '---').join(' | ')} |\n`;
        // Remove header from data rows
        rows.shift();
      }

      // Add data rows
      rows.forEach((row) => {
        markdown += `| ${row.join(' | ')} |\n`;
      });

      return markdown + '\n';
    },
  },

  column_list: {
    transform: async ({ block, utils }) => {
      return block.children ? await utils.processChildren(block.children) : '';
    },
  },

  column: {
    transform: async ({ block, utils }) => {
      return block.children ? await utils.processChildren(block.children) : '';
    },
  },

  link_to_page: {
    transform: async ({ block }) => {
      // @ts-ignore
      if (block.link_to_page.type === 'page_id') {
        // @ts-ignore
        const url = block.link_to_page.url || block.id;
        return `[🔗 Linked page](${url})\n\n`;
      }
      return '';
    },
  },

  child_page: {
    transform: async ({ block }) => {
      // @ts-ignore
      const title = block.child_page.title;
      // @ts-ignore
      const url = block.child_page.url || block.id;
      return `[📑 ${title}](${url})\n\n`;
    },
  },

  child_database: {
    transform: async ({ block }) => {
      // @ts-ignore
      const title = block.child_database.title;
      return `[🗄️ ${title}](${block.id})\n\n`;
    },
  },

  synced_block: {
    transform: async ({ block, utils }) => {
      return block.children ? await utils.processChildren(block.children) : '';
    },
  },

  template: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.template.rich_text);
      return `${text}\n\n`;
    },
  },

  table_of_contents: {
    transform: async () => '',
  },

  breadcrumb: {
    transform: async () => '',
  },
};
