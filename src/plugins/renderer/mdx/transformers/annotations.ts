import { NotionAnnotationType } from '../../../../types/notion';
import { AnnotationTransformer } from '../../../../types/renderer';

export const annotationTransformers: Partial<
  Record<NotionAnnotationType, AnnotationTransformer>
> = {
  bold: {
    transform: async ({ text, metadata }) =>
      !metadata?.html ? ` **${text.trim()}** ` : `<strong>${text}</strong>`,
  },

  italic: {
    transform: async ({ text, metadata }) =>
      !metadata?.html ? ` *${text.trim()}* ` : `<i>${text}</i>`,
  },

  strikethrough: {
    transform: async ({ text, metadata }) =>
      !metadata?.html ? ` ~~${text.trim()}~~ ` : `<strike>${text}</strike>`,
  },

  code: {
    transform: async ({ text, metadata }) =>
      metadata?.html ? `<code>${text}</code>` : ` \`${text.trim()}\` `,
  },

  underline: {
    transform: async ({ text }) => `<u>${text}</u>`,
  },

  link: {
    transform: async ({ text, link, metadata }) => {
      if (!link?.url) return text;
      return !metadata?.html
        ? `[${text}](${link.url})`
        : `<a href="${link.url}">${text}</a>`;
    },
  },

  equation: {
    transform: async ({ text, metadata }) => {
      if (!metadata?.html) return ` $${text.trim()}$ `;
      return `<code>${text}</code>`;
    },
  },
};
