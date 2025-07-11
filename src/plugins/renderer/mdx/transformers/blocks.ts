import { NotionBlockType } from '../../../../types/notion';
import { BlockTransformer } from '../../../../types/renderer';

const INDENT = '    '; // 4 whitespace = tab space (keeping it consistent)

export const blockTransformers: Partial<
  Record<NotionBlockType, BlockTransformer>
> = {
  paragraph: {
    transform: async ({ block, utils }) => {
      //@ts-ignore Just process this block's content
      const text = await utils.transformRichText(block.paragraph.rich_text);

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
      const text = await utils.transformRichText(headingBlock.rich_text, {
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
      const text = await utils.transformRichText(headingBlock.rich_text, {
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
      const text = await utils.transformRichText(headingBlock.rich_text, {
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
      // Only render the list if this is the first in a group
      if (metadata._renderedByGroup) return '';
      // Find all consecutive bulleted_list_items at this level
      const group = groupListItems(
        block,
        metadata.siblings,
        'bulleted_list_item',
      );
      const currentLevel = metadata.listLevel || 0;
      const indent = INDENT.repeat(currentLevel);
      const lines = [];
      for (const item of group) {
        const text = await utils.transformRichText(
          item.bulleted_list_item.rich_text,
        );
        let childrenContent = '';
        if (item.children?.length) {
          // Group nested list items by type
          const nestedBullets = item.children.filter(
            (b) => b.type === 'bulleted_list_item',
          );
          const nestedNumbers = item.children.filter(
            (b) => b.type === 'numbered_list_item',
          );
          if (nestedBullets.length) {
            childrenContent +=
              '\n' +
              (await blockTransformers.bulleted_list_item.transform({
                block: nestedBullets[0],
                utils,
                metadata: {
                  ...metadata,
                  listLevel: currentLevel + 1,
                  _renderedByGroup: false,
                },
                siblings: nestedBullets,
              }));
          }
          if (nestedNumbers.length) {
            childrenContent +=
              '\n' +
              (await blockTransformers.numbered_list_item.transform({
                block: nestedNumbers[0],
                utils,
                metadata: {
                  ...metadata,
                  listLevel: currentLevel + 1,
                  _renderedByGroup: false,
                },
                siblings: nestedNumbers,
              }));
          }
        }
        lines.push(
          `${indent}- ${text}${childrenContent ? '\n' + childrenContent : ''}`,
        );
      }
      // Mark all items in this group as rendered
      for (const item of group) {
        item._renderedByGroup = true;
      }
      return lines.join('\n') + '\n';
    },
  },

  numbered_list_item: {
    transform: async ({ block, utils, metadata = {} }) => {
      // Only render the list if this is the first in a group
      if (metadata._renderedByGroup) return '';
      // Find all consecutive numbered_list_items at this level
      const group = groupListItems(
        block,
        metadata.siblings,
        'numbered_list_item',
      );
      const currentLevel = metadata.listLevel || 0;
      const indent = INDENT.repeat(currentLevel);
      const lines = [];
      for (let idx = 0; idx < group.length; idx++) {
        const item = group[idx];
        const text = await utils.transformRichText(
          item.numbered_list_item.rich_text,
        );
        let childrenContent = '';
        if (item.children?.length) {
          // Group nested list items by type
          const nestedBullets = item.children.filter(
            (b) => b.type === 'bulleted_list_item',
          );
          const nestedNumbers = item.children.filter(
            (b) => b.type === 'numbered_list_item',
          );
          if (nestedBullets.length) {
            childrenContent +=
              '\n' +
              (await blockTransformers.bulleted_list_item.transform({
                block: nestedBullets[0],
                utils,
                metadata: {
                  ...metadata,
                  listLevel: currentLevel + 1,
                  _renderedByGroup: false,
                },
                siblings: nestedBullets,
              }));
          }
          if (nestedNumbers.length) {
            childrenContent +=
              '\n' +
              (await blockTransformers.numbered_list_item.transform({
                block: nestedNumbers[0],
                utils,
                metadata: {
                  ...metadata,
                  listLevel: currentLevel + 1,
                  _renderedByGroup: false,
                },
                siblings: nestedNumbers,
              }));
          }
        }
        lines.push(
          `${indent}${idx + 1}. ${text}${childrenContent ? '\n' + childrenContent : ''}`,
        );
      }
      // Mark all items in this group as rendered
      for (const item of group) {
        item._renderedByGroup = true;
      }
      return lines.join('\n') + '\n';
    },
  },

  to_do: {
    transform: async ({ block, utils, metadata = {} }) => {
      // Get current nesting level for indentation
      const currentLevel = metadata.listLevel || 0;
      const indent = INDENT.repeat(currentLevel);
      // @ts-ignore
      const todoBlock = block.to_do;

      const text = await utils.transformRichText(todoBlock.rich_text);

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
      const text = await utils.transformRichText(calloutBlock.rich_text);
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

      return `> ${icon} ${lines}${formattedChildren ? `\n${formattedChildren}` : ''}\n\n`;
    },
  },

  toggle: {
    transform: async ({ block, utils }) => {
      // @ts-ignore Process the toggle text
      const text = await utils.transformRichText(block.toggle.rich_text, {
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
      const text = await utils.transformRichText(block.code.rich_text);
      // @ts-ignore
      const language = block.code.language || '';
      return `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
    },
  },

  quote: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.transformRichText(block.quote.rich_text);

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
          ? await utils.transformRichText(imageBlock.caption)
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
          ? await utils.transformRichText(videoBlock.caption)
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
          ? await utils.transformRichText(fileBlock.caption)
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
          ? await utils.transformRichText(pdfBlock.caption)
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
          ? await utils.transformRichText(bookmarkBlock.caption)
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
          ? await utils.transformRichText(embedBlock.caption)
          : url;

      return `[${caption}](${url})\n\n`;
    },
  },

  equation: {
    transform: async ({ block }) => {
      // @ts-ignore
      const expression = block.equation.expression;
      return `$$\n${expression}\n$$\n\n`;
    },
  },

  divider: {
    transform: async () => '---\n\n',
  },

  table: {
    transform: async ({ block, utils }) => {
      if (!block.children?.length || block.type !== 'table') return '';

      // First, process all rows to get their cell content
      const processedRows = await Promise.all(
        block.children.map(async (row) => {
          // Ensure it's a table_row block
          if (!('table_row' in row)) return [];

          // Process each cell's rich text content
          return Promise.all(
            row.table_row.cells.map(async (cell) => {
              const content = await utils.transformRichText(cell);
              // Ensure empty cells have a space to maintain table structure
              return content.trim() || ' ';
            }),
          );
        }),
      );

      // Start building the table
      if (block.table?.has_column_header || block.table?.has_row_header) {
        // Use first row as header
        const headerRow = processedRows[0];
        const dataRows = processedRows.slice(1);

        // Use the formatAsMarkdownTable utility with the header separate from data rows
        return utils.formatAsMarkdownTable(headerRow, dataRows) + '\n';
      } else {
        // For tables without explicit headers, we'll create generic headers
        // Get the number of columns from the first row
        const columnCount = processedRows[0]?.length || 0;

        // Create generic headers (Column 1, Column 2, etc.)
        const headers = Array(columnCount)
          .fill('')
          .map((_, i) => `Column ${i + 1}`);

        // Use the formatAsMarkdownTable utility with all rows as data
        return utils.formatAsMarkdownTable(headers, processedRows) + '\n';
      }
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
        return `[Linked page](${url})\n\n`;
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
      return `[${title}](${url})\n\n`;
    },
  },

  child_database: {
    transform: async (context) => {
      const { block, utils } = context;
      if (
        !block.type ||
        block.type !== 'child_database' ||
        !block.child_database
      ) {
        return `\n`;
      }

      // Get the database title
      const title = block.child_database.title;

      // If there are no entries, just show the title
      if (
        !block.child_database.entries ||
        block.child_database.entries.length === 0
      ) {
        return `## ${title}\n\n*No entries in database*\n\n`;
      }

      // Get all entries with transformed properties
      const transformedEntries = await Promise.all(
        block.child_database.entries.map(async (entry) => {
          return await utils.transformDatabaseProperties(
            entry.properties,
            context,
          );
        }),
      );

      // Get all unique property names across all entries
      const propertyNames = [
        ...new Set(
          block.child_database.entries.flatMap((entry) =>
            Object.keys(entry.properties || {}),
          ),
        ),
      ];

      // Format as a table - use property names as headers
      const rows = transformedEntries.map((entry) => {
        // @ts-ignore
        return propertyNames.map((propName) => entry[propName] || '');
      });

      const tableContent = utils.formatAsMarkdownTable(propertyNames, rows);

      return `## ${title}\n\n${tableContent}\n\n`;
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

// NOTE: The following is a fallback to the previous per-block logic due to lack of blockTree context in MDX renderer.
// For future improvement, refactor to support grouping consecutive list items when blockTree context is available.

blockTransformers.bulleted_list_item = {
  transform: async ({ block, utils, metadata = {} }) => {
    const text = await utils.transformRichText(
      // @ts-ignore
      block.bulleted_list_item.rich_text,
    );
    const currentLevel = metadata.listLevel || 0;
    const indent = INDENT.repeat(currentLevel);

    if (!block.children?.length) {
      return `${indent}- ${text}`;
    }
    const childMetadata = {
      ...metadata,
      listLevel: currentLevel + 1,
    };
    const childrenContent = await Promise.all(
      block.children.map((childBlock) =>
        utils.processBlock(childBlock, childMetadata),
      ),
    );
    return `${indent}- ${text}\n${childrenContent.join('\n')}\n`;
  },
};

blockTransformers.numbered_list_item = {
  transform: async ({ block, utils, metadata = {} }) => {
    const currentLevel = metadata.listLevel || 0;
    const currentNumber = metadata.currentNumber || 1;
    const indent = INDENT.repeat(currentLevel);
    const text = await utils.transformRichText(
      // @ts-ignore
      block.numbered_list_item.rich_text,
    );
    const formattedItem = `${indent}${currentNumber}. ${text}`;
    if (!block.children?.length) {
      return formattedItem;
    }
    const childrenContent: string[] = [];
    for (let i = 0; i < block.children.length; i++) {
      const childContent = await utils.processBlock(block.children[i], {
        ...metadata,
        listLevel: currentLevel + 1,
        currentNumber: i + 1,
      });
      childrenContent.push(childContent);
    }
    return `${formattedItem}\n${childrenContent.join('\n')}\n`;
  },
};

function groupListItems(block, siblings, type) {
  // Find all consecutive list items of the same type at the same parent
  const startIdx = siblings.findIndex((b) => b.id === block.id);
  const group = [];
  for (
    let i = startIdx;
    i < siblings.length &&
    siblings[i].type === type &&
    siblings[i].parent?.id === block.parent?.id;
    i++
  ) {
    group.push(siblings[i]);
  }
  return group;
}
