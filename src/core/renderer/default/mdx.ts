import { BaseRendererPlugin } from '..';

class MDXRenderer extends BaseRendererPlugin {
  constructor() {
    super();

    // Initialize with standard MDX variables
    this.addVariable('frontmatter', async (_, context) => {
      const properties = context.pageProperties;
      const frontmatter = {
        title: this.extractTitle(properties),
        date: new Date().toISOString(),
        lastUpdated: properties.last_edited_time,
        // Extract custom properties
        ...this.extractCustomProperties(properties),
      };

      // Convert to YAML format
      return ['---', ...this.objectToYAML(frontmatter), '---'].join('\n');
    })
      .addVariable('imports')
      .addVariable('content');
  }

  // Default MDX document structure
  protected template = `{{{frontmatter}}}

{{{imports}}}

{{{content}}}`;

  // Define transformers for different block types
  protected blockTransformers = {
    paragraph: {
      transform: async ({ block, utils }) => {
        const content = await utils.processRichText(block.paragraph.rich_text);
        if (!content.trim()) return '';
        return `${content}\n\n`;
      },
    },

    heading_1: {
      transform: async ({ block, utils }) => {
        const content = await utils.processRichText(block.heading_1.rich_text);
        return `# ${content}\n\n`;
      },
    },

    heading_2: {
      transform: async ({ block, utils }) => {
        const content = await utils.processRichText(block.heading_2.rich_text);
        return `## ${content}\n\n`;
      },
    },

    heading_3: {
      transform: async ({ block, utils }) => {
        const content = await utils.processRichText(block.heading_3.rich_text);
        return `### ${content}\n\n`;
      },
    },

    bulleted_list_item: {
      transform: async ({ block, utils, metadata }) => {
        const content = await utils.processRichText(
          block.bulleted_list_item.rich_text,
        );
        // Handle nested lists through metadata
        const level = (metadata?.get('listLevel') as number) || 0;
        const indent = '  '.repeat(level);

        let output = `${indent}- ${content}`;

        // Process nested items with increased indentation
        if (block.children?.length) {
          const nestedContent = await utils.processChildren(
            block.children,
            new Map([['listLevel', level + 1]]),
          );
          output += '\n' + nestedContent;
        }

        return output + '\n';
      },
    },

    numbered_list_item: {
      transform: async ({ block, utils, metadata }) => {
        const content = await utils.processRichText(
          block.numbered_list_item.rich_text,
        );
        const level = (metadata?.get('listLevel') as number) || 0;
        const indent = '  '.repeat(level);

        let output = `${indent}1. ${content}`;

        if (block.children?.length) {
          const nestedContent = await utils.processChildren(
            block.children,
            new Map([['listLevel', level + 1]]),
          );
          output += '\n' + nestedContent;
        }

        return output + '\n';
      },
    },

    code: {
      transform: async ({ block }) => {
        const language = block.code.language || '';
        const content = block.code.rich_text[0]?.plain_text || '';
        return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
      },
    },

    quote: {
      transform: async ({ block, utils }) => {
        const content = await utils.processRichText(block.quote.rich_text);
        let output = content
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n');
        return output + '\n\n';
      },
    },

    callout: {
      transform: async ({ block, utils }) => {
        const content = await utils.processRichText(block.callout.rich_text);
        const icon = block.callout.icon?.emoji || '💡';
        return `> ${icon} ${content}\n\n`;
      },
    },

    divider: {
      transform: async () => '---\n\n',
    },

    table: {
      transform: async ({ block, utils }) => {
        let output: string[] = [];
        const rows = block.children || [];

        // Process each row
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.type !== 'table_row') continue;

          const cells = row.table_row.cells;
          const processedCells = await Promise.all(
            cells.map((cell) => utils.processRichText(cell)),
          );

          // Add row to output
          output.push(`| ${processedCells.join(' | ')} |`);

          // Add header separator after first row if needed
          if (i === 0 && block.table.has_column_header) {
            output.push(`|${cells.map(() => ' --- |').join('')}`);
          }
        }

        return output.join('\n') + '\n\n';
      },
    },
  };

  // Helper methods for frontmatter generation
  private extractTitle(properties: any): string {
    if (properties.title?.title) {
      return properties.title.title[0]?.plain_text || 'Untitled';
    }
    if (properties.Name?.title) {
      return properties.Name.title[0]?.plain_text || 'Untitled';
    }
    return 'Untitled';
  }

  private extractCustomProperties(properties: any): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (key === 'title' || key === 'Name') continue;

      if ('multi_select' in value) {
        result[key] = value.multi_select.map((item: any) => item.name);
      } else if ('select' in value) {
        result[key] = value.select?.name;
      } else if ('rich_text' in value) {
        result[key] = value.rich_text[0]?.plain_text;
      } else if ('number' in value) {
        result[key] = value.number;
      } else if ('checkbox' in value) {
        result[key] = value.checkbox;
      }
    }

    return result;
  }

  private objectToYAML(obj: Record<string, any>, level = 0): string[] {
    const indent = '  '.repeat(level);
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`${indent}${key}: []`);
        } else {
          lines.push(`${indent}${key}:`);
          value.forEach((item) => lines.push(`${indent}- ${item}`));
        }
      } else if (typeof value === 'object') {
        lines.push(`${indent}${key}:`);
        lines.push(...this.objectToYAML(value, level + 1));
      } else {
        // Handle special characters in YAML
        const formattedValue =
          typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"` : value;
        lines.push(`${indent}${key}: ${formattedValue}`);
      }
    }

    return lines;
  }
}
