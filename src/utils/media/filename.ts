import { TrackedBlockReferenceObject } from '../../types/fetcher';
import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../types/notion';

/**
 * Centralized filename generation based on reference source type
 */
export function generateFilename(
  ref: TrackedBlockReferenceObject,
  index?: number, // Index is now relevant for all property types
): string {
  // 1. Identify the source type
  switch (ref.type) {
    case 'block':
      return generateBlockFilename(ref);
    case 'database_property':
    case 'page_property':
      // Pass index for both property types
      return generatePropertyFilename(ref, index);
    default:
      // Fallback for unknown types
      return `file_${ref.id}`;
  }
}

/**
 * Generate filename for block references
 */
function generateBlockFilename(ref: TrackedBlockReferenceObject): string {
  const block = ref.ref as NotionBlock;
  let filename = '';
  let originalUrl = '';

  if (block.type && ['image', 'video', 'file', 'pdf'].includes(block.type)) {
    // @ts-ignore - Accessing by dynamic property
    const mediaBlock = block[block.type];
    if (mediaBlock?.name) {
      filename = mediaBlock.name;
    }
    originalUrl =
      mediaBlock?.type === 'external'
        ? mediaBlock.external?.url
        : mediaBlock?.file?.url;
  }

  if (!filename && originalUrl) {
    filename = extractFilenameFromUrl(originalUrl);
  }

  if (!filename) {
    // Default if no name found or extracted
    return `file_${ref.id}`;
  }

  // Split name and extension, clean only the name part
  const { nameWithoutExt, extension } = splitExtension(filename);
  const cleanName = cleanFilename(nameWithoutExt);

  // Add block ID for uniqueness before the extension
  return extension
    ? `${cleanName}_${ref.id}${extension}`
    : `${cleanName}_${ref.id}`;
}

/**
 * Generate filename for property references (database and page properties)
 */
function generatePropertyFilename(
  ref: TrackedBlockReferenceObject,
  index: number = 0, // Default index to 0 if not provided
): string {
  const property = ref.ref as NotionDatabaseEntryProperty | NotionPageProperty;
  const propertyName = cleanFilename(ref.propertyName || 'property'); // Clean property name too

  // Ensure it's a 'files' type property with files
  if (property.type !== 'files' || !property.files || !property.files[index]) {
    // Default filename if not a valid file property or index out of bounds
    return `file_${index}_${propertyName}`;
  }

  const fileEntry = property.files[index];
  let filename = '';
  let originalUrl = '';

  if (fileEntry.type === 'file') {
    filename = fileEntry.name || '';
    originalUrl = fileEntry.file?.url || '';
  } else if (fileEntry.type === 'external') {
    originalUrl = fileEntry.external?.url || '';
    filename = extractFilenameFromUrl(originalUrl);
  }

  if (!filename) {
    // Default filename if name extraction failed
    return `file_${index}_${propertyName}`;
  }

  // Split name and extension, clean only the name part
  const { nameWithoutExt, extension } = splitExtension(filename);
  const cleanName = cleanFilename(nameWithoutExt);

  // Consistent naming for both property types, including index
  return extension
    ? `${cleanName}_${index}_${propertyName}${extension}`
    : `${cleanName}_${index}_${propertyName}`;
}

/**
 * Helper: Extract filename from URL
 * Handles removing query parameters and hash
 */
export function extractFilenameFromUrl(url: string): string {
  if (!url) return '';
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const pathSegments = cleanUrl.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    // Return decoded only if lastSegment is not empty
    return lastSegment ? decodeURIComponent(lastSegment) : '';
  } catch (error) {
    console.debug(
      '[Utils/Media] Error extracting filename from URL:',
      url,
      error,
    );
    return '';
  }
}

/**
 * Helper: Clean filename base (without extension) to remove invalid characters
 */
export function cleanFilename(filenameBase: string): string {
  // Remove invalid filesystem characters and replace spaces
  return (
    filenameBase
      .replace(/[/\\?%*:|"<>.]/g, '_') // Replace invalid chars (including dot) with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_+|_+$/g, '') // Trim leading/trailing underscores
      .trim() || 'file'
  ); // Ensure not empty, default to 'file'
}

/**
 * Helper: Split filename into name and extension
 * Returns an object with nameWithoutExt and extension (including the dot, or empty string)
 */
export function splitExtension(filename: string): {
  nameWithoutExt: string;
  extension: string;
} {
  const lastDotIndex = filename.lastIndexOf('.');

  // No dot, or dot is first character (hidden file like .bashrc)
  if (lastDotIndex <= 0) {
    return { nameWithoutExt: filename, extension: '' };
  }

  const nameWithoutExt = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex); // Includes the dot

  // Basic check if extension looks valid (e.g., not just ".")
  if (extension.length <= 1) {
    return { nameWithoutExt: filename, extension: '' };
  }

  return { nameWithoutExt, extension };
}
