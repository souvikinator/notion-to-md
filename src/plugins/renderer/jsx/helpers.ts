import {
  NotionPageProperties,
  NotionPageProperty,
} from '../../../types/notion';
import { NotionRichTextItem } from '../../../types/notion';
import { RendererContext } from '../../../types/renderer';

/**
 * Escape JSX attribute values
 */
export function escapeJSXAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape JSX content (between tags)
 */
export function escapeJSXContent(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

/**
 * Generate JSX className from notion block type and custom config
 */
export function generateJSXClassName(
  blockType: string,
  prefix: string = 'notion-',
  customClasses: Record<string, string> = {},
): string {
  const customClass = customClasses[blockType];
  if (customClass) {
    return customClass;
  }

  return `${prefix}${blockType.replace(/_/g, '-')}`;
}

/**
 * Format database properties as JSX table
 */
export function formatAsJSXTable(
  properties: NotionPageProperties,
  options: {
    tableComponent?: string;
    headerComponent?: string;
    rowComponent?: string;
    cellComponent?: string;
    classNamePrefix?: string;
  } = {},
): string {
  const {
    tableComponent = 'table',
    headerComponent = 'th',
    rowComponent = 'tr',
    cellComponent = 'td',
    classNamePrefix = 'notion-',
  } = options;

  const propertyEntries = Object.entries(properties);
  if (propertyEntries.length === 0) {
    return '';
  }

  const tableClass = `${classNamePrefix}table`;
  const headerClass = `${classNamePrefix}table-header`;
  const rowClass = `${classNamePrefix}table-row`;
  const cellClass = `${classNamePrefix}table-cell`;

  const headerRow = `
    <${rowComponent} className="${headerClass}">
      ${propertyEntries
        .map(
          ([key]) =>
            `<${headerComponent} className="${cellClass}">${escapeJSXContent(key)}</${headerComponent}>`,
        )
        .join('\n      ')}
    </${rowComponent}>`;

  const dataRow = `
    <${rowComponent} className="${rowClass}">
      ${propertyEntries
        .map(
          ([, property]) =>
            `<${cellComponent} className="${cellClass}">${formatPropertyValue(property)}</${cellComponent}>`,
        )
        .join('\n      ')}
    </${rowComponent}>`;

  return `
  <${tableComponent} className="${tableClass}">
    <thead>${headerRow}
    </thead>
    <tbody>${dataRow}
    </tbody>
  </${tableComponent}>`;
}

/**
 * Transform database to JSX table with more advanced options
 */
export function transformDatabaseToJSXTable(
  properties: NotionPageProperties,
  config: {
    includeProperties?: string[];
    excludeProperties?: string[];
    propertyComponents?: Record<string, string>;
    customRenderers?: Record<string, (property: NotionPageProperty) => string>;
    classNamePrefix?: string;
  } = {},
): string {
  const {
    includeProperties,
    excludeProperties,
    propertyComponents = {},
    customRenderers = {},
    classNamePrefix = 'notion-',
  } = config;

  let filteredProperties = Object.entries(properties);

  // Apply include/exclude filters
  if (includeProperties) {
    filteredProperties = filteredProperties.filter(([key]) =>
      includeProperties.includes(key),
    );
  }

  if (excludeProperties) {
    filteredProperties = filteredProperties.filter(
      ([key]) => !excludeProperties.includes(key),
    );
  }

  if (filteredProperties.length === 0) {
    return '';
  }

  const tableClass = `${classNamePrefix}database-table`;
  const headerClass = `${classNamePrefix}database-header`;
  const rowClass = `${classNamePrefix}database-row`;

  const headerRow = `
    <tr className="${headerClass}">
      ${filteredProperties
        .map(
          ([key]) =>
            `<th className="${classNamePrefix}database-header-cell">${escapeJSXContent(key)}</th>`,
        )
        .join('\n      ')}
    </tr>`;

  const dataRow = `
    <tr className="${rowClass}">
      ${filteredProperties
        .map(([key, property]) => {
          const customComponent = propertyComponents[key];
          const customRenderer = customRenderers[key];

          if (customRenderer) {
            return `<td className="${classNamePrefix}database-cell">${customRenderer(property)}</td>`;
          }

          if (customComponent) {
            return `<td className="${classNamePrefix}database-cell"><${customComponent} property={${JSON.stringify(property)}} /></td>`;
          }

          return `<td className="${classNamePrefix}database-cell">${formatPropertyValue(property)}</td>`;
        })
        .join('\n      ')}
    </tr>`;

  return `
  <table className="${tableClass}">
    <thead>${headerRow}
    </thead>
    <tbody>${dataRow}
    </tbody>
  </table>`;
}

/**
 * Safely get a user's name or id
 */
function getUserName(user: any): string {
  if (!user) return '';
  if ('name' in user && typeof user.name === 'string') return user.name;
  if ('id' in user && typeof user.id === 'string') return user.id;
  return '';
}

/**
 * Format a single property value for JSX display
 */
export function formatPropertyValue(property: NotionPageProperty): string {
  if (!property) return '';

  switch (property.type) {
    case 'title':
      return (
        property.title?.map((t) => escapeJSXContent(t.plain_text)).join('') ||
        ''
      );
    case 'rich_text':
      return (
        property.rich_text
          ?.map((t) => escapeJSXContent(t.plain_text))
          .join('') || ''
      );
    case 'number':
      return property.number?.toString() || '';
    case 'select':
      return property.select?.name
        ? escapeJSXContent(property.select.name)
        : '';
    case 'multi_select':
      return (
        property.multi_select
          ?.map((s) => escapeJSXContent(s.name))
          .join(', ') || ''
      );
    case 'date':
      return property.date?.end
        ? `${escapeJSXContent(property.date.start)} to ${escapeJSXContent(property.date.end)}`
        : property.date?.start
          ? escapeJSXContent(property.date.start)
          : '';
    case 'people':
      return (
        property.people
          ?.map((p) => escapeJSXContent(getUserName(p)))
          .join(', ') || ''
      );
    case 'files':
      return (
        property.files
          ?.map((f) =>
            f.type === 'external'
              ? `<a href="${escapeJSXAttribute(f.external.url)}" target="_blank" rel="noopener noreferrer">${escapeJSXContent(f.name || 'File')}</a>`
              : escapeJSXContent(f.name || 'File'),
          )
          .join(', ') || ''
      );
    case 'checkbox':
      return property.checkbox
        ? '<input type="checkbox" checked disabled />'
        : '<input type="checkbox" disabled />';
    case 'url':
      return property.url
        ? `<a href="${escapeJSXAttribute(property.url)}" target="_blank" rel="noopener noreferrer">${escapeJSXContent(property.url)}</a>`
        : '';
    case 'email':
      return property.email
        ? `<a href="mailto:${escapeJSXAttribute(property.email)}">${escapeJSXContent(property.email)}</a>`
        : '';
    case 'phone_number':
      return property.phone_number
        ? `<a href="tel:${escapeJSXAttribute(property.phone_number)}">${escapeJSXContent(property.phone_number)}</a>`
        : '';
    case 'formula':
      if (property.formula?.type === 'string' && property.formula.string) {
        return escapeJSXContent(property.formula.string);
      }
      if (
        property.formula?.type === 'number' &&
        typeof property.formula.number === 'number'
      ) {
        return property.formula.number.toString();
      }
      if (
        property.formula?.type === 'boolean' &&
        typeof property.formula.boolean === 'boolean'
      ) {
        return property.formula.boolean ? 'true' : 'false';
      }
      if (property.formula?.type === 'date' && property.formula.date?.start) {
        return escapeJSXContent(property.formula.date.start);
      }
      return '';
    case 'relation':
      return (
        property.relation?.map((r) => escapeJSXContent(r.id)).join(', ') || ''
      );
    case 'rollup':
      if (
        property.rollup?.type === 'array' &&
        Array.isArray(property.rollup.array)
      ) {
        return property.rollup.array
          .map((item) =>
            typeof item === 'string'
              ? escapeJSXContent(item)
              : JSON.stringify(item),
          )
          .join(', ');
      }
      if (
        property.rollup?.type === 'number' &&
        typeof property.rollup.number === 'number'
      ) {
        return property.rollup.number.toString();
      }
      if (property.rollup?.type === 'date' && property.rollup.date?.start) {
        return escapeJSXContent(property.rollup.date.start);
      }
      return '';
    case 'created_time':
      return property.created_time
        ? escapeJSXContent(property.created_time)
        : '';
    case 'created_by':
      return property.created_by
        ? escapeJSXContent(getUserName(property.created_by))
        : '';
    case 'last_edited_time':
      return property.last_edited_time
        ? escapeJSXContent(property.last_edited_time)
        : '';
    case 'last_edited_by':
      return property.last_edited_by
        ? escapeJSXContent(getUserName(property.last_edited_by))
        : '';
    default:
      return '';
  }
}

/**
 * Transform a Notion rich text array into JSX, applying annotation transformers.
 * Usage: await transformRichText(richText, context, metadata)
 */
export async function transformRichText(
  richText: NotionRichTextItem[],
  context: RendererContext,
  metadata?: any,
): Promise<string> {
  if (!richText || !Array.isArray(richText)) return '';
  const annotationTransformers = context.transformers.annotations;
  const results = await Promise.all(
    richText.map(async (item) => {
      let text = item.plain_text;
      const link = item.href;
      const annotations = item.annotations;

      // 1. Process code annotation first if it exists and is enabled
      if (annotations.code && annotationTransformers.code) {
        text = await annotationTransformers.code.transform({
          text,
          annotations,
          metadata,
          manifest: context.manifest,
        });
      }

      // 2. Process equation next if it exists
      if (
        item.type === 'equation' &&
        item.equation &&
        annotationTransformers.equation
      ) {
        text = await annotationTransformers.equation.transform({
          text,
          metadata,
          manifest: context.manifest,
        });
      }

      // 3. Process all other annotations except code
      for (const [name, value] of Object.entries(annotations)) {
        if (
          name !== 'code' &&
          value &&
          annotationTransformers[name as keyof typeof annotationTransformers]
        ) {
          text = await annotationTransformers[
            name as keyof typeof annotationTransformers
          ]!.transform({
            text,
            annotations,
            metadata,
            manifest: context.manifest,
          });
        }
      }

      // 4. Apply link transformation last if exists
      if (link && annotationTransformers.link) {
        text = await annotationTransformers.link.transform({
          text,
          link: link ? { url: link } : undefined,
          metadata,
          manifest: context.manifest,
        });
      }

      return text || '';
    }),
  );
  return results.join('');
}
