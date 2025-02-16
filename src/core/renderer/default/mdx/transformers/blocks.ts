import { BlockTransformer, BlockType } from '../../../../../types';

export const blockTransformers: Partial<Record<BlockType, BlockTransformer>> = {
  paragraph: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.paragraph.rich_text);
      return text ? `${text}\n` : '\n';
    },
  },

  heading_1: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.heading_1.rich_text);
      return `# ${text}\n\n`;
    },
  },

  heading_2: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.heading_2.rich_text);
      return `## ${text}\n\n`;
    },
  },

  heading_3: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.heading_3.rich_text);
      return `### ${text}\n\n`;
    },
  },

  bulleted_list_item: {
    transform: async ({ block, utils }) => {
      const text = await utils.processRichText(
        // @ts-ignore
        block.bulleted_list_item.rich_text,
      );
      const children = block.children
        ? await utils.processChildren(block.children, { indent: '  ' })
        : '';
      return `- ${text}${children ? `\n${children}` : ''}\n`;
    },
  },

  numbered_list_item: {
    transform: async ({ block, utils }) => {
      const text = await utils.processRichText(
        // @ts-ignore
        block.numbered_list_item.rich_text,
      );
      const children = block.children
        ? await utils.processChildren(block.children, { indent: '   ' })
        : '';
      return `1. ${text}${children ? `\n${children}` : ''}\n`;
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
      return `> ${text}\n\n`;
    },
  },

  callout: {
    transform: async ({ block, utils }) => {
      // @ts-ignore
      const text = await utils.processRichText(block.callout.rich_text);
      // @ts-ignore
      const icon = block.callout.icon?.emoji || '';
      return `> ${icon} ${text}\n\n`;
    },
  },

  divider: {
    transform: async () => '---\n\n',
  },
};
