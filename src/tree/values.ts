import type { FileValue, PropertyValue } from './types';

export function isFileValue(value: unknown): value is FileValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    'hosted' in value
  );
}

/** A property value with every file replaced by a string, such as its name or URL. */
export function mapFiles(
  value: PropertyValue,
  file: (value: FileValue) => string,
): PropertyValue {
  if (!Array.isArray(value)) return value;
  return value.map((item) =>
    isFileValue(item) ? file(item) : mapFiles(item, file),
  );
}

/** A property value as display text, e.g. for a table cell. Files show their name. */
export function displayValue(value: PropertyValue | FileValue): string {
  if (value === null) return '';
  if (isFileValue(value)) return value.name;
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  return String(value);
}
