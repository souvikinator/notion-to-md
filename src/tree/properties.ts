import type { PageObjectResponse } from '@notionhq/client';
import { plainText } from './rich-text';
import type { FileValue, Properties, PropertyValue } from './types';

type NotionProperty = PageObjectResponse['properties'][string];
type RollupValue = Extract<NotionProperty, { type: 'rollup' }>['rollup'];
type ArrayItem = Extract<RollupValue, { type: 'array' }>['array'][number];
interface DateRange {
  start: string;
  end: string | null;
}
type FileItem = Extract<NotionProperty, { type: 'files' }>['files'][number];
interface Person {
  id: string;
  name?: string | null;
}

export function properties(notion: Record<string, NotionProperty>): Properties {
  const result: Properties = {};
  for (const [name, property] of Object.entries(notion)) {
    result[name] = propertyValue(property);
  }
  return result;
}

/** A property value as display text, e.g. for a table cell. */
export function formatPropertyValue(value: PropertyValue): string {
  if (value === null) return '';
  if (!Array.isArray(value)) return String(value);
  return value
    .map((item) => (isFileValue(item) ? item.name : formatPropertyValue(item)))
    .join(', ');
}

export function isFileValue(value: unknown): value is FileValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    'hosted' in value
  );
}

/** The plain-text title of a page, from whichever property has the `title` type. */
export function pageTitle(notion: Record<string, NotionProperty>): string {
  for (const property of Object.values(notion)) {
    if (property.type === 'title') return plainText(property.title);
  }
  return '';
}

// One flat switch over every Notion property type keeps the mapping in a single place.
// eslint-disable-next-line complexity
function propertyValue(property: NotionProperty | ArrayItem): PropertyValue {
  switch (property.type) {
    case 'title':
      return plainText(property.title);
    case 'rich_text':
      return plainText(property.rich_text);
    case 'number':
      return property.number;
    case 'checkbox':
      return property.checkbox;
    case 'url':
      return property.url;
    case 'email':
      return property.email;
    case 'phone_number':
      return property.phone_number;
    case 'select':
      return property.select?.name ?? null;
    case 'status':
      return property.status?.name ?? null;
    case 'multi_select':
      return property.multi_select.map((option) => option.name);
    case 'date':
      return dateValue(property.date);
    case 'created_time':
      return property.created_time;
    case 'last_edited_time':
      return property.last_edited_time;
    case 'created_by':
      return personName(property.created_by);
    case 'last_edited_by':
      return personName(property.last_edited_by);
    case 'people':
      return property.people.map(personName);
    case 'relation':
      return property.relation.map((item) => item.id);
    case 'files':
      return property.files.map(fileValue);
    case 'formula':
      return formulaValue(property.formula);
    case 'rollup':
      return rollupValue(property.rollup);
    case 'unique_id':
      return uniqueIdValue(property.unique_id);
    case 'verification':
      return property.verification?.state ?? null;
    case 'place':
      return property.place
        ? (property.place.name ?? property.place.address ?? null)
        : null;
    case 'button':
      return null;
  }
}

/** Dates become ISO strings; a range becomes an ISO 8601 interval (`start/end`). */
function dateValue(date: DateRange | null): string | null {
  if (!date) return null;
  return date.end ? `${date.start}/${date.end}` : date.start;
}

function personName(person: Person): string {
  return person.name ?? person.id;
}

function fileValue(file: FileItem): FileValue {
  return file.type === 'file'
    ? { name: file.name, url: file.file.url, hosted: true }
    : { name: file.name, url: file.external.url, hosted: false };
}

function formulaValue(
  formula: Extract<NotionProperty, { type: 'formula' }>['formula'],
): PropertyValue {
  switch (formula.type) {
    case 'string':
      return formula.string;
    case 'number':
      return formula.number;
    case 'boolean':
      return formula.boolean;
    case 'date':
      return dateValue(formula.date);
    default:
      return null;
  }
}

function rollupValue(rollup: RollupValue): PropertyValue {
  switch (rollup.type) {
    case 'number':
      return rollup.number;
    case 'date':
      return dateValue(rollup.date);
    case 'array':
      return rollup.array.map(propertyValue);
    case 'unsupported':
      return null;
  }
}

function uniqueIdValue(id: {
  prefix: string | null;
  number: number | null;
}): string | null {
  if (id.number === null) return null;
  return id.prefix ? `${id.prefix}-${id.number}` : String(id.number);
}
