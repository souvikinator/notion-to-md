import { BaseRendererPlugin } from '../';
import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

import { BlockType, ListBlockChildrenResponseResult } from '../../../types';

class MDXRenderer extends BaseRendererPlugin {
  // Define our document structure - notice the order matters
  // We want frontmatter at top, followed by imports, then content
  protected template = `{{{frontmatter}}}

{{{imports}}}

{{{content}}}`;

  // Define how each section of our template is generated
  protected variables = {
    // Handle frontmatter generation
    frontmatter: async (context) => {
      const { pageProperties } = context;

      // Start with standard properties we can extract from page
      const frontmatter = {
        title: this.extractTitle(pageProperties),
        date: new Date().toISOString(),
        lastUpdated: pageProperties.last_edited_time,
      };

      // Any special page properties like tags, status, etc.
      const customProperties = this.extractCustomProperties(pageProperties);

      // Convert to YAML format
      return [
        '---',
        ...this.objectToYAML({ ...frontmatter, ...customProperties }),
        '---',
      ];
    },
    import: async (context) => {
      return [''];
    },
  };

  // Define how each type of block is transformed
  protected blockTransformers = {
    paragraph: {
      transform: async ({ block, processRichText }) => {
        const content = await processRichText(block.paragraph.rich_text);
        return `${content}\n\n`;
      },
    },

    heading_1: {
      transform: async ({ block, processRichText }) => {
        const content = await processRichText(block.heading_1.rich_text);
        return `# ${content}\n\n`;
      },
    },

    heading_2: {
      transform: async ({ block, processRichText }) => {
        const content = await processRichText(block.heading_2.rich_text);
        return `## ${content}\n\n`;
      },
    },

    heading_3: {
      transform: async ({ block, processRichText }) => {
        const content = await processRichText(block.heading_3.rich_text);
        return `### ${content}\n\n`;
      },
    },

    code: {
      transform: async ({ block, processRichText }) => {
        const language = block.code.language || '';
        const content = block.code.rich_text[0]?.plain_text || '';

        // If language includes "mermaid", treat as MDX component
        if (language.includes('mermaid')) {
          return `<Mermaid>\`\`\`${language}\n${content}\n\`\`\`</Mermaid>\n\n`;
        }

        return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
      },
      // Add necessary imports for code blocks
      imports: ['import { Mermaid } from "@/components/mermaid";'],
    },

    callout: {
      transform: async ({ block, processRichText, processChildren }) => {
        const content = await processRichText(block.callout.rich_text);
        const icon = block.callout.icon?.emoji || '💡';

        // Handle children if any
        const children = block.children?.length
          ? await processChildren(block.children)
          : '';

        return `<Callout icon="${icon}">
  ${content}
  ${children}
</Callout>\n\n`;
      },
      imports: ['import { Callout } from "@/components/callout";'],
    },

    bulleted_list_item: {
      transform: async ({
        block,
        processRichText,
        processChildren,
        metadata,
      }) => {
        const content = await processRichText(
          block.bulleted_list_item.rich_text,
        );
        const indent = '  '.repeat(metadata?.level || 0);

        // Process children with increased indentation
        const children = block.children?.length
          ? await processChildren(block.children, {
              level: (metadata?.level || 0) + 1,
            })
          : '';

        return `${indent}- ${content}\n${children}`;
      },
    },
    // Add more block transformers as needed
  };

  // Helper methods for our renderer
  private extractTitle(properties: any): string {
    // Handle different title property types
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

    // Look for common property types
    for (const [key, value] of Object.entries(properties)) {
      if (key === 'title' || key === 'Name') continue;

      // Handle different property types
      if ('multi_select' in value) {
        result[key] = value.multi_select.map((item: any) => item.name);
      } else if ('select' in value) {
        result[key] = value.select?.name;
      } else if ('rich_text' in value) {
        result[key] = value.rich_text[0]?.plain_text;
      }
      // Add more property type handlers as needed
    }

    return result;
  }

  private objectToYAML(obj: Record<string, any>, level = 0): string[] {
    const indent = '  '.repeat(level);
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        lines.push(`${indent}${key}:`);
        value.forEach((item) => lines.push(`${indent}- ${item}`));
      } else if (typeof value === 'object') {
        lines.push(`${indent}${key}:`);
        lines.push(...this.objectToYAML(value, level + 1));
      } else {
        lines.push(`${indent}${key}: ${value}`);
      }
    }

    return lines;
  }
}
