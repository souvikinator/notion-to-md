import {
  escapeJSXContent,
  escapeJSXAttribute,
  generateJSXClassName,
} from '../helpers';
import type { NotionBlock, NotionBlocks } from '../../../../types/notion';
import type { RendererContext } from '../../../../types/renderer';

// Helper to indent content
function indentJSX(content: string, level: number = 1): string {
  const indent = '  '.repeat(level);
  return content
    .split('\n')
    .map((line) => (line.trim() ? indent + line : line))
    .join('\n');
}

// Helper to render a list group
async function renderListGroup(
  blocks: NotionBlocks,
  type: string,
  context: RendererContext,
  level = 0,
): Promise<string> {
  const tag = type === 'bulleted_list_item' ? 'ul' : 'ol';
  const className = generateJSXClassName(
    tag,
    context.metadata.config?.styling?.classNamePrefix,
    context.metadata.config?.styling?.customClasses,
  );
  const items = await Promise.all(
    blocks
      .filter(
        (block: NotionBlock | undefined) =>
          block && typeof block === 'object' && 'type' in block,
      )
      .map(async (block: NotionBlock) => {
        // Render the list item content
        const content = await context.utils.transformRichText(
          (block as any)[type].rich_text,
          context,
        );
        // Render children (nested lists)
        let childrenContent = '';
        if (block.children && block.children.length > 0) {
          // Group nested list items by type
          const nestedBullets = block.children.filter(
            (b: NotionBlock) =>
              b && typeof b === 'object' && b.type === 'bulleted_list_item',
          );
          const nestedNumbers = block.children.filter(
            (b: NotionBlock) =>
              b && typeof b === 'object' && b.type === 'numbered_list_item',
          );
          if (nestedBullets.length) {
            childrenContent +=
              '\n' +
              (await renderListGroup(
                nestedBullets,
                'bulleted_list_item',
                context,
                level + 1,
              ));
          }
          if (nestedNumbers.length) {
            childrenContent +=
              '\n' +
              (await renderListGroup(
                nestedNumbers,
                'numbered_list_item',
                context,
                level + 1,
              ));
          }
        }
        return indentJSX(
          `<li className="notion-list-item">${content}${childrenContent}</li>`,
          level + 1,
        );
      }),
  );
  return `<${tag} className="${className}">\n${items.join('\n')}\n${'  '.repeat(level)}</${tag}>`;
}

export const blockTransformers = {
  // Headings
  heading_1: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'h1',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const content = await context.utils.transformRichText(
        context.block.heading_1.rich_text,
        context,
        context.metadata,
      );
      return `<h1 className="${className}">${content}</h1>\n`;
    },
  },

  heading_2: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'h2',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const content = await context.utils.transformRichText(
        context.block.heading_2.rich_text,
        context,
        context.metadata,
      );
      return `<h2 className="${className}">${content}</h2>\n`;
    },
  },

  heading_3: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'h3',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const content = await context.utils.transformRichText(
        context.block.heading_3.rich_text,
        context,
        context.metadata,
      );
      return `<h3 className="${className}">${content}</h3>\n`;
    },
  },

  // Text blocks
  paragraph: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'paragraph',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const content = await context.utils.transformRichText(
        context.block.paragraph.rich_text,
        context,
        context.metadata,
      );

      // Return empty string for empty paragraphs
      if (!content.trim()) {
        return '';
      }

      return `<p className="${className}">${content}</p>\n`;
    },
  },

  quote: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'quote',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const content = await context.utils.transformRichText(
        context.block.quote.rich_text,
        context,
        context.metadata,
      );
      return `<blockquote className="${className}">${content}</blockquote>\n`;
    },
  },

  callout: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'callout',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const iconClassName = generateJSXClassName(
        'callout-icon',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const contentClassName = generateJSXClassName(
        'callout-content',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );

      const content = await context.utils.transformRichText(
        context.block.callout.rich_text,
        context,
        context.metadata,
      );
      let icon = '';

      const calloutIcon = context.block.callout.icon;
      if (calloutIcon) {
        if (calloutIcon.type === 'emoji') {
          icon = `<span className="${iconClassName}">${escapeJSXContent(calloutIcon.emoji)}</span>`;
        } else if (
          calloutIcon.type === 'external' ||
          calloutIcon.type === 'file'
        ) {
          const src = escapeJSXAttribute(
            calloutIcon.external?.url || calloutIcon.file?.url || '',
          );
          icon = `<img src="${src}" alt="Icon" className="${iconClassName}" />`;
        }
      }
      // Render children if any
      let childrenContent = '';
      if (context.block.children && context.block.children.length > 0) {
        const children = await Promise.all(
          context.block.children.map((child) => {
            return context.utils.processBlock(child);
          }),
        );
        childrenContent = children.join('\n');
      }
      return `<div className="${className}">${icon}<div className="${contentClassName}">${content}</div>${childrenContent}</div>\n`;
    },
  },

  // Code blocks
  code: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'code',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const language = context.block.code.language || 'text';
      const content = await context.utils.transformRichText(
        context.block.code.rich_text,
        context,
        context.metadata,
      );

      return `<pre className="${className}">
  <code className="language-${language}">${escapeJSXContent(content)}</code>
</pre>\n`;
    },
  },

  // Lists
  bulleted_list_item: {
    transform: async (context) => {
      // Only render the list if this is the first in a group
      if (!context.metadata._isFirstListItem) return '';
      // Find all consecutive bulleted_list_items at this level
      const siblings = context.blockTree.filter(
        (b) =>
          b &&
          typeof b === 'object' &&
          'type' in b &&
          b.parent?.id === context.block.parent?.id,
      );
      const startIdx = siblings.findIndex((b) => b.id === context.block.id);
      const group: NotionBlocks = [];
      for (
        let i = startIdx;
        i < siblings.length && siblings[i].type === 'bulleted_list_item';
        i++
      ) {
        group.push(siblings[i]);
      }
      // Render the group as a <ul>
      return (
        (await renderListGroup(group, 'bulleted_list_item', context, 0)) + '\n'
      );
    },
  },

  numbered_list_item: {
    transform: async (context) => {
      if (!context.metadata._isFirstListItem) return '';
      const siblings = context.blockTree.filter(
        (b) =>
          b &&
          typeof b === 'object' &&
          'type' in b &&
          b.parent?.id === context.block.parent?.id,
      );
      const startIdx = siblings.findIndex((b) => b.id === context.block.id);
      const group: NotionBlocks = [];
      for (
        let i = startIdx;
        i < siblings.length && siblings[i].type === 'numbered_list_item';
        i++
      ) {
        group.push(siblings[i]);
      }
      return (
        (await renderListGroup(group, 'numbered_list_item', context, 0)) + '\n'
      );
    },
  },

  to_do: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'todo',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const checkboxClassName = generateJSXClassName(
        'todo-checkbox',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const contentClassName = generateJSXClassName(
        'todo-content',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );

      const content = await context.utils.transformRichText(
        context.block.to_do.rich_text,
        context,
        context.metadata,
      );
      const checked = context.block.to_do.checked ? 'checked' : '';

      return `<div className="${className}">
  <input type="checkbox" className="${checkboxClassName}" ${checked} disabled />
  <span className="${contentClassName}">${content}</span>
</div>\n`;
    },
  },

  // Divider
  divider: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'divider',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<hr className="${className}" />\n`;
    },
  },

  // Media
  image: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'image',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const captionClassName = generateJSXClassName(
        'image-caption',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );

      const src = escapeJSXAttribute(
        context.block.image?.file?.url ||
          context.block.image?.external?.url ||
          '',
      );
      const alt = context.block.image?.caption
        ? await context.utils.transformRichText(
            context.block.image.caption,
            context,
            context.metadata,
          )
        : 'Image';

      let imageElement = `<img src="${src}" alt="${escapeJSXAttribute(alt)}" className="${className}" />`;

      if (
        context.block.image?.caption &&
        context.block.image.caption.length > 0
      ) {
        const captionContent = await context.utils.transformRichText(
          context.block.image.caption,
          context,
          context.metadata,
        );
        imageElement += `\n<figcaption className="${captionClassName}">${captionContent}</figcaption>`;

        const figureClassName = generateJSXClassName(
          'figure',
          config.styling?.classNamePrefix,
          config.styling?.customClasses,
        );
        imageElement = `<figure className="${figureClassName}">\n${imageElement}\n</figure>`;
      }

      return imageElement + '\n';
    },
  },

  video: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'video',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const captionClassName = generateJSXClassName(
        'video-caption',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );

      const src = escapeJSXAttribute(
        context.block.video?.file?.url ||
          context.block.video?.external?.url ||
          '',
      );

      let videoElement = `<video className="${className}" controls>
  <source src="${src}" />
  Your browser does not support the video tag.
</video>`;

      if (
        context.block.video?.caption &&
        context.block.video.caption.length > 0
      ) {
        const captionContent = await context.utils.transformRichText(
          context.block.video.caption,
          context,
          context.metadata,
        );
        videoElement += `\n<figcaption className="${captionClassName}">${captionContent}</figcaption>`;

        const figureClassName = generateJSXClassName(
          'figure',
          config.styling?.classNamePrefix,
          config.styling?.customClasses,
        );
        videoElement = `<figure className="${figureClassName}">\n${videoElement}\n</figure>`;
      }

      return videoElement + '\n';
    },
  },

  // Toggle block
  toggle: {
    transform: async (context) => {
      const config = context.metadata.config;
      const className = generateJSXClassName(
        'toggle',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const summaryClass = generateJSXClassName(
        'toggle-summary',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const content = await context.utils.transformRichText(
        context.block.toggle.rich_text,
        context,
        context.metadata,
      );
      let childrenContent = '';
      if (context.block.children && context.block.children.length > 0) {
        const children = await Promise.all(
          context.block.children.map((child) =>
            context.utils.processBlock(child),
          ),
        );
        childrenContent = children.join('\n');
      }
      return `<details className="${className}"><summary className="${summaryClass}">${content}</summary>${indentJSX(childrenContent, 1)}</details>\n`;
    },
  },

  // Table block (basic JSX table rendering)
  table: {
    transform: async (context) => {
      const config = context.metadata.config;
      if (!context.block.children || context.block.children.length === 0)
        return '';
      // Process all rows
      const processedRows = await Promise.all(
        context.block.children.map(async (row) => {
          if (!('table_row' in row)) return [];
          return Promise.all(
            row.table_row.cells.map(async (cell) => {
              const content = await context.utils.transformRichText(
                cell,
                context,
                context.metadata,
              );
              return content.trim() || ' ';
            }),
          );
        }),
      );
      // Build JSX table
      const tableClass = generateJSXClassName(
        'table',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      let headerRow = '';
      let dataRows = '';
      if (
        context.block.table?.has_column_header ||
        context.block.table?.has_row_header
      ) {
        const header = processedRows[0];
        headerRow = `<tr>${header.map((cell) => `<th>${cell}</th>`).join('')}</tr>`;
        dataRows = processedRows
          .slice(1)
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`,
          )
          .join('');
      } else {
        const columnCount = processedRows[0]?.length || 0;
        const headers = Array(columnCount)
          .fill('')
          .map((_, i) => `Column ${i + 1}`);
        headerRow = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
        dataRows = processedRows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`,
          )
          .join('');
      }
      return `<table className="${tableClass}"><thead>${headerRow}</thead><tbody>${dataRows}</tbody></table>\n`;
    },
  },

  // Column list
  column_list: {
    transform: async (context) => {
      if (!context.block.children || context.block.children.length === 0)
        return '';
      const children = await Promise.all(
        context.block.children.map((child) =>
          context.utils.processBlock(child),
        ),
      );
      return `<div className="notion-column-list">${children.join('')}</div>\n`;
    },
  },

  // Column
  column: {
    transform: async (context) => {
      if (!context.block.children || context.block.children.length === 0)
        return '';
      const children = await Promise.all(
        context.block.children.map((child) =>
          context.utils.processBlock(child),
        ),
      );
      return `<div className="notion-column">${children.join('')}</div>\n`;
    },
  },

  // Link to page
  link_to_page: {
    transform: async (context) => {
      if (
        context.block.link_to_page &&
        context.block.link_to_page.type === 'page_id'
      ) {
        const url = context.block.link_to_page.url || context.block.id;
        return `<a href="${escapeJSXAttribute(url)}" className="notion-link-to-page">Linked page</a>\n`;
      }
      return '';
    },
  },

  // Child page
  child_page: {
    transform: async (context) => {
      const title = context.block.child_page?.title || '';
      const url = context.block.child_page?.url || context.block.id;
      return `<a href="${escapeJSXAttribute(url)}" className="notion-child-page">${escapeJSXContent(title)}</a>\n`;
    },
  },

  // Child database
  child_database: {
    transform: async (context) => {
      if (
        !context.block.type ||
        context.block.type !== 'child_database' ||
        !context.block.child_database
      )
        return '';
      const title = context.block.child_database.title;
      if (
        !context.block.child_database.entries ||
        context.block.child_database.entries.length === 0
      ) {
        return `<div className="notion-child-database"><h2>${escapeJSXContent(title)}</h2><em>No entries in database</em></div>\n`;
      }
      // Get all entries with transformed properties
      const transformedEntries = await Promise.all(
        context.block.child_database.entries.map(async (entry) => {
          return await context.utils.transformDatabaseProperties(
            entry.properties,
            context,
          );
        }),
      );
      const propertyNames = [
        ...new Set(
          context.block.child_database.entries.flatMap((entry) =>
            Object.keys(entry.properties || {}),
          ),
        ),
      ] as string[];
      const rows = transformedEntries.map((entry) =>
        propertyNames.map(
          (propName: string) =>
            (entry as Record<string, string>)[propName] || '',
        ),
      );
      // Build a JSX table for the database
      const tableRows = rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeJSXContent(cell)} </td>`).join('')}</tr>`,
        )
        .join('');
      const headerRow = `<tr>${propertyNames.map((name) => `<th>${escapeJSXContent(name)}</th>`).join('')}</tr>`;
      return `<div className="notion-child-database"><h2>${escapeJSXContent(title)}</h2><table><thead>${headerRow}</thead><tbody>${tableRows}</tbody></table></div>\n`;
    },
  },

  // Synced block
  synced_block: {
    transform: async (context) => {
      if (!context.block.children || context.block.children.length === 0)
        return '';
      // If this is a synced_from block (original content), process its children normally
      if (!context.block.synced_block?.synced_from) {
        const content = await Promise.all(
          context.block.children.map((child) =>
            context.utils.processBlock(child),
          ),
        );
        return content.join('');
      }
      // For duplicate blocks (those synced to original), process the same way
      const content = await Promise.all(
        context.block.children.map((child) =>
          context.utils.processBlock(child),
        ),
      );
      return content.join('');
    },
  },

  // Table of contents (empty for now)
  table_of_contents: {
    transform: async () => '',
  },

  // Breadcrumb (empty for now)
  breadcrumb: {
    transform: async () => '',
  },
};
