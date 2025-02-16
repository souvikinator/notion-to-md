import { AnnotationTransformer } from '../../../../../types';

export const annotationTransformers: Record<string, AnnotationTransformer> = {
  bold: {
    transform: async ({ text }) => `**${text}**`,
  },

  italic: {
    transform: async ({ text }) => `*${text}*`,
  },

  strikethrough: {
    transform: async ({ text }) => `~~${text}~~`,
  },

  code: {
    transform: async ({ text }) => `\`${text}\``,
  },

  underline: {
    transform: async ({ text }) => `<u>${text}</u>`,
  },

  link: {
    transform: async ({ text, link }) =>
      link?.url ? `[${text}](${link.url})` : text,
  },
};
