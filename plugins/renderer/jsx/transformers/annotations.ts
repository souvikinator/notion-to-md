import { AnnotationTransformer } from '../../../../types/renderer';
import { NotionAnnotationType } from '../../../../types/notion';
import { escapeJSXAttribute, generateJSXClassName } from '../helpers';

export const annotationTransformers: Partial<
  Record<NotionAnnotationType, AnnotationTransformer>
> = {
  bold: {
    transform: async (context) => {
      const { text, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'bold',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<strong className="${className}">${text}</strong>`;
    },
  },
  italic: {
    transform: async (context) => {
      const { text, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'italic',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<em className="${className}">${text}</em>`;
    },
  },
  strikethrough: {
    transform: async (context) => {
      const { text, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'strikethrough',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<s className="${className}">${text}</s>`;
    },
  },
  underline: {
    transform: async (context) => {
      const { text, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'underline',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<u className="${className}">${text}</u>`;
    },
  },
  code: {
    transform: async (context) => {
      const { text, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'inline-code',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<code className="${className}">${text}</code>`;
    },
  },
  color: {
    transform: async (context) => {
      const { text, annotations, metadata } = context;
      const config = metadata?.config || {};
      const colorClass =
        annotations?.color && annotations.color !== 'default'
          ? generateJSXClassName(
              `color-${annotations.color}`,
              config.styling?.classNamePrefix,
              config.styling?.customClasses,
            )
          : null;
      return colorClass
        ? `<span className="${colorClass}">${text}</span>`
        : text;
    },
  },
  link: {
    transform: async (context) => {
      const { text, link, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'link',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      const href = link?.url ? escapeJSXAttribute(link.url) : '';
      return href
        ? `<a href="${href}" className="${className}">${text}</a>`
        : text;
    },
  },
  // Inline equation annotation
  equation: {
    transform: async (context) => {
      const { text, metadata } = context;
      const config = metadata?.config || {};
      const className = generateJSXClassName(
        'equation',
        config.styling?.classNamePrefix,
        config.styling?.customClasses,
      );
      return `<code className="${className}">{${text}}</code>`;
    },
  },
};
