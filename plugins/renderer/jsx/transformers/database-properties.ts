import { NotionDatabasePropertyType } from '../../../../types/notion';
import { DatabasePropertyTransformer } from '../../../../types/renderer';
import { escapeJSXContent, escapeJSXAttribute } from '../helpers';

/**
 * Transformers for database property types to JSX format
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

      return escapeJSXContent(
        titleContent.map((textItem) => textItem.plain_text).join('') || '',
      );
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
      return escapeJSXContent(
        property.rich_text.map((textItem) => textItem.plain_text).join('') ||
          '',
      );
    },
  },

  select: {
    transform: async ({ property }) => {
      if (property.type !== 'select') return '';

      return escapeJSXContent(property.select?.name || '');
    },
  },

  multi_select: {
    transform: async ({ property }) => {
      if (property.type !== 'multi_select') return '';

      if (!property.multi_select || !property.multi_select.length) return '';

      return property.multi_select
        .map(
          (item) =>
            `<span className="notion-multi-select-tag">${escapeJSXContent(item.name)}</span>`,
        )
        .join(', ');
    },
  },

  date: {
    transform: async ({ property }) => {
      if (property.type !== 'date') return '';

      if (!property.date) return '';

      if (property.date.end) {
        return escapeJSXContent(
          `${property.date.start} to ${property.date.end}`,
        );
      }

      return escapeJSXContent(property.date.start || '');
    },
  },

  number: {
    transform: async ({ property }) => {
      if (property.type !== 'number') return '';

      return property.number !== null && property.number !== undefined
        ? escapeJSXContent(String(property.number))
        : '';
    },
  },

  checkbox: {
    transform: async ({ property }) => {
      if (property.type !== 'checkbox') return '';

      return `<input type="checkbox" checked={${property.checkbox}} readOnly className="notion-checkbox" />`;
    },
  },

  url: {
    transform: async ({ property }) => {
      if (property.type !== 'url') return '';

      const url = property.url;
      if (!url) return '';

      return `<a href="${escapeJSXAttribute(url)}" className="notion-link" target="_blank" rel="noopener noreferrer">${escapeJSXContent(url)}</a>`;
    },
  },

  email: {
    transform: async ({ property }) => {
      if (property.type !== 'email') return '';

      const email = property.email;
      if (!email) return '';

      return `<a href="mailto:${escapeJSXAttribute(email)}" className="notion-email">${escapeJSXContent(email)}</a>`;
    },
  },

  phone_number: {
    transform: async ({ property }) => {
      if (property.type !== 'phone_number') return '';

      return escapeJSXContent(property.phone_number || '');
    },
  },

  formula: {
    transform: async ({ property }) => {
      if (property.type !== 'formula') return '';

      const formula = property.formula;
      if (!formula) return '';

      switch (formula.type) {
        case 'string':
          return escapeJSXContent(formula.string || '');
        case 'number':
          return formula.number !== null && formula.number !== undefined
            ? escapeJSXContent(String(formula.number))
            : '';
        case 'boolean':
          return formula.boolean === true ? 'True' : 'False';
        case 'date':
          return escapeJSXContent(formula.date?.start || '');
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

      return `<span className="notion-status notion-status-${escapeJSXAttribute(status.name?.toLowerCase() || 'default')}">${escapeJSXContent(status.name || '')}</span>`;
    },
  },

  relation: {
    transform: async ({ property }) => {
      if (property.type !== 'relation') return '';

      const relations = property.relation;
      if (!relations || !relations.length) return '';

      return escapeJSXContent(
        `Related to ${relations.length} item${relations.length === 1 ? '' : 's'}`,
      );
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
            ? escapeJSXContent(String(rollup.number))
            : '';
        case 'date':
          return escapeJSXContent(rollup.date?.start || '');
        case 'array':
          if (!rollup.array || !rollup.array.length) return '';

          return escapeJSXContent(`Array with ${rollup.array.length} items`);
        default:
          return '';
      }
    },
  },

  created_time: {
    transform: async ({ property }) => {
      if (property.type !== 'created_time') return '';

      return escapeJSXContent(property.created_time || '');
    },
  },

  created_by: {
    transform: async ({ property }) => {
      if (property.type !== 'created_by') return '';

      // Handle both PartialUserObjectResponse and UserObjectResponse
      const user = property.created_by;
      if (!user) return '';

      // Check if user has name property (UserObjectResponse)
      if ('name' in user && user.name) {
        return escapeJSXContent(user.name);
      }

      // Fallback to ID
      return escapeJSXContent(user.id || '');
    },
  },

  last_edited_time: {
    transform: async ({ property }) => {
      if (property.type !== 'last_edited_time') return '';

      return escapeJSXContent(property.last_edited_time || '');
    },
  },

  last_edited_by: {
    transform: async ({ property }) => {
      if (property.type !== 'last_edited_by') return '';

      // Handle both PartialUserObjectResponse and UserObjectResponse
      const user = property.last_edited_by;
      if (!user) return '';

      // Check if user has name property (UserObjectResponse)
      if ('name' in user && user.name) {
        return escapeJSXContent(user.name);
      }

      // Fallback to ID
      return escapeJSXContent(user.id || '');
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

          return `<a href="${escapeJSXAttribute(url)}" className="notion-file-link" target="_blank" rel="noopener noreferrer">File ${index + 1}</a>`;
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
          return escapeJSXContent(person.name || person.id || 'Unknown');
        })
        .join(', ');
    },
  },
};
