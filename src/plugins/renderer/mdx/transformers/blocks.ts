import { BlockTransformer, BlockType } from '../../../../types';

export const blockTransformers: Partial<Record<BlockType, BlockTransformer>> = {
  paragraph: {
    transform: async ({ block, utils }) => {
      //@ts-ignore Just process this block's content
      const text = await utils.processRichText(block.paragraph.rich_text);

      // If block has no content, return empty string
      if (!text) return '';

      //@ts-ignore Add a newline only for top-level paragraphs
      const needsNewline = block.parent.type === 'page_id';
      return text + (needsNewline ? '\n' : '');
    },
  },

  heading_1: {
    transform: async ({ block, utils }) => {
      // Get the heading text content
      // @ts-ignore
      const headingBlock = block.heading_1;
      const isToggle = headingBlock.is_toggleable;
      // since markdown doesn't get renderer in HTML, on toggle enabled
      // we parse annotations as HTML
      const text = await utils.processRichText(headingBlock.rich_text, {
        html: isToggle,
      });

      // For regular headings, return simple markdown
      if (!isToggle) {
        return `# ${text}\n\n`;
      }

      // For toggleable headings, we process children directly
      // This ensures proper content building from bottom up
      const childrenContent = block.children?.length
        ? await Promise.all(
            block.children.map((child) => utils.processBlock(child)),
          )
        : [];

      // Build the complete toggle structure with the heading
      // we need to add a newline after the summary tag for the markdown to render
      // cant' do the same for content inside summary tag since it adds a newline
      // and the toggle looks ugly
      return `<details>
  <summary>
  <h1>${text}</h1>
  </summary>

  ${childrenContent.join('\n')}

</details>\n`;
    },
  },

  heading_2: {
    transform: async ({ block, utils }) => {
      // Process heading content
      // @ts-ignore
      const headingBlock = block.heading_2;
      const isToggle = headingBlock.is_toggleable;
      // since markdown doesn't get renderer in HTML, on toggle enabled
      // we parse annotations as HTML
      const text = await utils.processRichText(headingBlock.rich_text, {
        html: isToggle,
      });

      // Regular heading case
      if (!isToggle) {
        return `## ${text}\n\n`;
      }

      // Handle toggleable heading with children
      const childrenContent = block.children?.length
        ? await Promise.all(
            block.children.map((child) => utils.processBlock(child)),
          )
        : [];

      // Create toggle structure with h2
      return `<details>
  <summary>
  <h2>${text}</h2>
  </summary>

  ${childrenContent.join('\n')}

</details>\n`;
    },
  },

  heading_3: {
    transform: async ({ block, utils }) => {
      // Get heading content
      // @ts-ignore
      const headingBlock = block.heading_3;
      const isToggle = headingBlock.is_toggleable;
      // since markdown doesn't get renderer in HTML, on toggle enabled
      // we parse annotations as HTML
      const text = await utils.processRichText(headingBlock.rich_text, {
        html: isToggle,
      });

      // Simple heading case
      if (!isToggle) {
        return `### ${text}\n\n`;
      }

      // Process children for toggleable heading
      const childrenContent = block.children?.length
        ? await Promise.all(
            block.children.map((child) => utils.processBlock(child)),
          )
        : [];

      // Build toggle with h3
      return `<details>
  <summary>
  <h3>${text}</h3>
  </summary>

  ${childrenContent.join('\n')}

</details>\n`;
    },
  },

  bulleted_list_item: {
    transform: async ({ block, utils, metadata = {} }) => {
      // First, handle this block's own content
      const text = await utils.processRichText(
        // @ts-ignore
        block.bulleted_list_item.rich_text,
      );
      const currentLevel = metadata.listLevel || 0;
      const indent = '  '.repeat(currentLevel);

      // If no children, just return formatted content
      if (!block.children?.length) {
        return `${indent}- ${text}`;
      }

      // For blocks with children, we'll recursively handle them
      const childMetadata = {
        ...metadata,
        listLevel: currentLevel + 1, // can be anything as per your use case
      };

      // Process each child block directly through processBlock
      const childrenContent = await Promise.all(
        block.children.map((childBlock) =>
          utils.processBlock(childBlock, childMetadata),
        ),
      );

      // Combine everything with proper formatting
      return `${indent}- ${text}\n${childrenContent.join('\n')}\n`;
    },
  },

  numbered_list_item: {
    transform: async ({ block, utils, metadata = {} }) => {
      // Get the current nesting level
      const currentLevel = metadata.listLevel || 0;

      // The parent passes down the current number to its children
      const currentNumber = metadata.currentNumber || 1;

      // Create indentation based on level
      const indent = '   '.repeat(currentLevel);

      // Process the item's text content
      const text = await utils.processRichText(
        // @ts-ignore
        block.numbered_list_item.rich_text,
      );

      // Format this item with proper number
      const formattedItem = `${indent}${currentNumber}. ${text}`;

      // If no children, just return this item
      if (!block.children?.length) {
        return formattedItem;
      }

      // For items with children, process each child sequentially
      // Each child starts with number 1 at its level
      const childrenContent = [];
      for (let i = 0; i < block.children.length; i++) {
        const childContent = await utils.processBlock(block.children[i], {
          ...metadata,
          listLevel: currentLevel + 1,
          currentNumber: i + 1, // Pass sequential numbers to siblings
        });
        childrenContent.push(childContent);
      }

      // Combine this item with its children
      return `${formattedItem}\n${childrenContent.join('\n')}\n`;
    },
  },

  to_do: {
    transform: async ({ block, utils, metadata = {} }) => {
      // Get current nesting level for indentation
      const currentLevel = metadata.listLevel || 0;
      const indent = '  '.repeat(currentLevel);
      // @ts-ignore
      const todoBlock = block.to_do;

      const text = await utils.processRichText(todoBlock.rich_text);

      // Determine checkbox state - checked or unchecked
      const checkbox = todoBlock.checked ? 'x' : ' ';

      // Format the todo item with proper indentation and checkbox
      const formattedItem = `${indent}- [${checkbox}] ${text}`;

      // If this todo item has no children, return just the item
      if (!block.children?.length) {
        return formattedItem;
      }

      // For todo items with children, process each child
      // maintaining the proper hierarchy
      const childrenContent = await Promise.all(
        block.children.map((child) =>
          utils.processBlock(child, {
            ...metadata,
            listLevel: currentLevel + 1,
          }),
        ),
      );

      return `${formattedItem}\n${childrenContent.join('\n')}\n`;
    },
  },

  callout: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const calloutBlock = block.callout;
      const text = await utils.processRichText(calloutBlock.rich_text);
      const icon = calloutBlock.icon?.emoji || '';

      // Process any children
      const childrenContent = block.children?.length
        ? await Promise.all(
            block.children.map((child) => utils.processBlock(child)),
          )
        : [];

      // Format the main content
      const lines = text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      // Format children content
      const formattedChildren = childrenContent.length
        ? childrenContent
            .join('\n')
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
        : '';

      return `> ${icon} ${text}${formattedChildren ? `\n${formattedChildren}` : ''}\n\n`;
    },
  },

  toggle: {
    transform: async ({ block, utils }) => {
      // @ts-ignore Process the toggle text
      const text = await utils.processRichText(block.toggle.rich_text, {
        html: true, // since markdown doesn't get's renderer
      });

      // If no children, return just a basic toggle
      if (!block.children?.length) {
        return `<details>
  <summary>
  ${text}
  </summary>
</details>\n\n`;
      }

      // Process children and include them in the toggle
      const childrenContent = await Promise.all(
        block.children.map((child) => utils.processBlock(child)),
      );

      return `<details>
  <summary>
  ${text}
  </summary>

  ${childrenContent.join('\n')}

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

      // Format main quote text
      const lines = text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      // If no children, return just the quote
      if (!block.children?.length) {
        return `${lines}\n\n`;
      }

      // Process and format children as part of the quote
      const childrenContent = await Promise.all(
        block.children.map((child) => utils.processBlock(child)),
      );

      const formattedChildren = childrenContent
        .join('\n')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      return `${lines}\n${formattedChildren}\n\n`;
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

      const caption =
        imageBlock.caption.length > 0
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

      const caption =
        videoBlock.caption.length > 0
          ? await utils.processRichText(videoBlock.caption)
          : 'Video';

      return `[${caption}](${url})\n\n`;
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

      const caption =
        fileBlock.caption.length > 0
          ? await utils.processRichText(fileBlock.caption)
          : fileBlock.name || 'File';

      return `[${caption}](${url})\n\n`;
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

      const caption =
        pdfBlock.caption.length > 0
          ? await utils.processRichText(pdfBlock.caption)
          : 'PDF Document';

      return `[${caption}](${url})\n\n`;
    },
  },

  bookmark: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const bookmarkBlock = block.bookmark;
      const url = bookmarkBlock.url;
      const caption =
        bookmarkBlock.caption.length > 0
          ? await utils.processRichText(bookmarkBlock.caption)
          : url;
      return `[${caption}](${url})\n\n`;
    },
  },

  embed: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const embedBlock = block.embed;
      const url = embedBlock.url;

      const caption =
        embedBlock.caption.length > 0
          ? await utils.processRichText(embedBlock.caption)
          : url;

      return `[${caption}](${url})\n\n`;
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
      if (!block.children?.length) return '';

      // First, process all rows to get their cell content
      const processedRows = await Promise.all(
        block.children.map(async (row) => {
          // Ensure it's a table_row block
          if (!('table_row' in row)) return [];

          // Process each cell's rich text content
          return Promise.all(
            row.table_row.cells.map(async (cell) => {
              const content = await utils.processRichText(cell);
              // Ensure empty cells have a space to maintain table structure
              return content.trim() || ' ';
            }),
          );
        }),
      );

      // Start building the table
      let markdown = '';

      // For column tables (first column is header) or tables with column headers
      // We'll always create a header row
      // @ts-ignore
      if (block.table?.has_column_header || block.table?.has_row_header) {
        // Use first row as header
        const headerRow = processedRows[0];
        markdown += `| ${headerRow.join(' | ')} |\n`;
        // Add separator row with the correct number of columns
        markdown += `| ${headerRow.map(() => '---').join(' | ')} |\n`;
        // Add remaining rows
        processedRows.slice(1).forEach((row) => {
          markdown += `| ${row.join(' | ')} |\n`;
        });
      } else {
        // For tables without explicit headers, we'll create a generic header
        // Get the number of columns from the first row
        const columnCount = processedRows[0]?.length || 0;
        // Create generic headers (Column 1, Column 2, etc.)
        const headers = Array(columnCount)
          .fill('')
          .map((_, i) => `Column ${i + 1}`);
        // Add header row
        markdown += `| ${headers.join(' | ')} |\n`;
        // Add separator row
        markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        // Add all data rows
        processedRows.forEach((row) => {
          markdown += `| ${row.join(' | ')} |\n`;
        });
      }

      return markdown + '\n';
    },
  },

  column_list: {
    transform: async ({ block, utils }) => {
      // Column lists are containers - they need their children processed
      // but don't add any formatting themselves
      if (!block.children?.length) return '';

      const columnContent = await Promise.all(
        block.children.map((child) => utils.processBlock(child)),
      );

      // Join columns with newlines to keep content separated
      return columnContent.join('\n');
    },
  },

  column: {
    transform: async ({ block, utils }) => {
      // Similar to column_list, columns just process their children
      // The main difference is these are individual columns
      if (!block.children?.length) return '';

      const content = await Promise.all(
        block.children.map((child) => utils.processBlock(child)),
      );

      // Join column content, preserving block separation
      return content.join('\n');
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
      const title = block.child_database.title | 'child database';
      return `[${title}](${block.id})\n\n`;
    },
  },

  synced_block: {
    transform: async ({ block, utils }) => {
      // Synced blocks are interesting because they reference content
      // that might appear elsewhere. We process their children directly.
      if (!block.children?.length) return '';

      // If this is a synced_from block (original content),
      // process its children normally
      // @ts-ignore
      if (!block.synced_block.synced_from) {
        const content = await Promise.all(
          block.children.map((child) => utils.processBlock(child)),
        );
        return content.join('\n');
      }

      // For duplicate blocks (those synced to original),
      // we could potentially handle them differently
      // but for markdown output, we'll process them the same way
      const content = await Promise.all(
        block.children.map((child) => utils.processBlock(child)),
      );
      return content.join('\n');
    },
  },

  table_of_contents: {
    transform: async () => '',
  },

  breadcrumb: {
    transform: async () => '',
  },
};
