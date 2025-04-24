import { NotionDatabasePropertyType } from '../../../../types/notion';
import { DatabasePropertyTransformer } from '../../../../types/renderer';

/**
 * Transformers for database property types to MDX/Markdown format
 * Using direct type narrowing for better TypeScript support
 */
export const databasePropertyTransformers: Partial<
  Record<NotionDatabasePropertyType, DatabasePropertyTransformer>
> = {
  title: {
    transform: async ({ property }) => {
      if (property.type !== 'title') return '';

      const titleContent = property.title;
      if (!titleContent || !titleContent.length) return '';

      return titleContent.map((textItem) => textItem.plain_text).join('') || '';
    },
  },

  rich_text: {
    transform: async ({ property, utils }) => {
      if (property.type !== 'rich_text') return '';

      // If we have access to the rich text processor, use it
      if (property.rich_text && utils.transformRichText) {
        return utils.transformRichText(property.rich_text);
      }

      // Fallback to manual text extraction
      return (
        property.rich_text.map((textItem) => textItem.plain_text).join('') || ''
      );
    },
  },

  select: {
    transform: async ({ property }) => {
      if (property.type !== 'select') return '';

      return property.select?.name || '';
    },
  },

  multi_select: {
    transform: async ({ property }) => {
      if (property.type !== 'multi_select') return '';

      if (!property.multi_select || !property.multi_select.length) return '';

      return property.multi_select.map((item) => `\`${item.name}\``).join(', ');
    },
  },

  date: {
    transform: async ({ property }) => {
      if (property.type !== 'date') return '';

      if (!property.date) return '';

      if (property.date.end) {
        return `${property.date.start} to ${property.date.end}`;
      }

      return property.date.start || '';
    },
  },

  number: {
    transform: async ({ property }) => {
      if (property.type !== 'number') return '';

      return property.number !== null && property.number !== undefined
        ? String(property.number)
        : '';
    },
  },

  checkbox: {
    transform: async ({ property }) => {
      if (property.type !== 'checkbox') return '';

      return `<ul><li>${property.checkbox ? '- [x]&nbsp;' : '- [ ]&nbsp;'}</li></ul>`;
    },
  },

  url: {
    transform: async ({ property }) => {
      if (property.type !== 'url') return '';

      const url = property.url;
      if (!url) return '';

      return `[${url}](${url})`;
    },
  },

  email: {
    transform: async ({ property }) => {
      if (property.type !== 'email') return '';

      const email = property.email;
      if (!email) return '';

      return `[${email}](mailto:${email})`;
    },
  },

  phone_number: {
    transform: async ({ property }) => {
      if (property.type !== 'phone_number') return '';

      return property.phone_number || '';
    },
  },

  formula: {
    transform: async ({ property }) => {
      if (property.type !== 'formula') return '';

      const formula = property.formula;
      if (!formula) return '';

      switch (formula.type) {
        case 'string':
          return formula.string || '';
        case 'number':
          return formula.number !== null && formula.number !== undefined
            ? String(formula.number)
            : '';
        case 'boolean':
          return formula.boolean === true ? 'True' : 'False';
        case 'date':
          return formula.date?.start || '';
        default:
          return '';
      }
    },
  },

  status: {
    transform: async ({ property }) => {
      if (property.type !== 'status') return '';

      const status = property.status;
      if (!status) return '';

      return status.name || '';
    },
  },

  relation: {
    transform: async ({ property }) => {
      if (property.type !== 'relation') return '';

      const relations = property.relation;
      if (!relations || !relations.length) return '';

      return `Related to ${relations.length} item${relations.length === 1 ? '' : 's'}`;
    },
  },

  rollup: {
    transform: async ({ property }) => {
      if (property.type !== 'rollup') return '';

      const rollup = property.rollup;
      if (!rollup) return '';

      switch (rollup.type) {
        case 'number':
          return rollup.number !== null && rollup.number !== undefined
            ? String(rollup.number)
            : '';
        case 'date':
          return rollup.date?.start || '';
        case 'array':
          if (!rollup.array || !rollup.array.length) return '';

          // Array items require more complex handling
          // This is simplified but could be extended further
          return `Array with ${rollup.array.length} items`;
        default:
          return '';
      }
    },
  },

  created_time: {
    transform: async ({ property }) => {
      if (property.type !== 'created_time') return '';

      return property.created_time || '';
    },
  },

  created_by: {
    transform: async ({ property }) => {
      if (property.type !== 'created_by') return '';

      // Notion types sometimes have inconsistencies
      // @ts-ignore - user objects have name property
      return property.created_by?.name || property.created_by?.id || '';
    },
  },

  last_edited_time: {
    transform: async ({ property }) => {
      if (property.type !== 'last_edited_time') return '';

      return property.last_edited_time || '';
    },
  },

  last_edited_by: {
    transform: async ({ property }) => {
      if (property.type !== 'last_edited_by') return '';

      // @ts-ignore - user objects have name property
      return property.last_edited_by?.name || property.last_edited_by?.id || '';
    },
  },

  files: {
    transform: async ({ property }) => {
      if (property.type !== 'files') return '';

      const files = property.files;
      if (!files || !files.length) return '';

      return files
        .map((file, index) => {
          let url: string | null = null;

          if (file.type === 'external') url = file.external?.url;
          else if (file.type === 'file') url = file.file?.url;

          if (!url) return '';

          return `[File ${index + 1}](${url})`;
        })
        .filter(Boolean)
        .join('\n');
    },
  },

  people: {
    transform: async ({ property }) => {
      if (property.type !== 'people') return '';

      const people = property.people;
      if (!people || !people.length) return '';

      return people
        .map((person) => {
          // @ts-ignore - user objects have name property
          return person.name || person.id || 'Unknown';
        })
        .join(', ');
    },
  },
};
