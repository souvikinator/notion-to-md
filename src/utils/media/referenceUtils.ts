import {
  NotionBlock,
  NotionDatabaseEntryProperty,
  NotionPageProperty,
} from '../../types/notion';
import { TrackedBlockReferenceObject } from '../../types/fetcher';
import { MediaInfo } from '../../types/manifest-manager';

/**
 * Extracts the media URL from a Notion block object.
 * @param block The Notion block object.
 * @returns The media URL string or null if not found/applicable.
 */
function extractBlockUrl(block: NotionBlock): string | null {
  try {
    if (!block || !('type' in block)) {
      console.debug('[MediaUtils] Invalid block structure for URL extraction');
      return null;
    }

    // Only media blocks have URLs we typically handle this way
    if (!['image', 'video', 'file', 'pdf'].includes(block.type)) {
      // console.debug(`[MediaUtils] Block type ${block.type} does not have a standard URL`);
      return null;
    }

    // @ts-ignore - Accessing dynamic property type verified by includes check
    const mediaObject = block[block.type];
    if (!mediaObject) {
      console.debug(
        `[MediaUtils] Media object not found within block type ${block.type}`,
      );
      return null;
    }

    // Check if it's external or file type and return the URL
    const url =
      mediaObject.type === 'external'
        ? mediaObject.external?.url
        : mediaObject.file?.url;

    return url || null; // Return null if url is undefined/empty
  } catch (error) {
    console.debug('[MediaUtils] Error extracting block URL:', error);
    return null;
  }
}

/**
 * Extracts the media URL from a Notion 'files' property entry.
 * @param property The Notion database or page property object.
 * @param index The index of the file within the property's files array.
 * @returns The media URL string or null if not found/applicable.
 */
function extractPropertyFileUrl(
  property: NotionDatabaseEntryProperty | NotionPageProperty,
  index: number,
): string | null {
  try {
    if (
      property.type !== 'files' ||
      !property.files ||
      !property.files[index]
    ) {
      return null; // Not a valid files property or index out of bounds
    }

    const fileEntry = property.files[index];
    let url: string | undefined | null = null;

    if (fileEntry.type === 'external') {
      url = fileEntry.external?.url;
    } else if (fileEntry.type === 'file') {
      // Notion's type for internal files is just 'file', the url is within file.url
      url = fileEntry.file?.url;
    }

    return url || null; // Return null if url is undefined/empty
  } catch (error) {
    console.debug('[MediaUtils] Error extracting property file URL:', error);
    return null;
  }
}

/**
 * Extracts the media URL from various Notion reference types.
 * @param reference The tracked block/property reference object.
 * @param index Optional index, required for 'database_property' and 'page_property' types.
 * @returns The media URL string or null if not applicable/found.
 */
export function extractReferenceUrl(
  reference: TrackedBlockReferenceObject,
  index?: number,
): string | null {
  try {
    switch (reference.type) {
      case 'block':
        return extractBlockUrl(reference.ref as NotionBlock);

      case 'database_property':
      case 'page_property':
        // Index is crucial for properties
        return extractPropertyFileUrl(
          reference.ref as NotionDatabaseEntryProperty | NotionPageProperty,
          index ?? 0, // Default to 0 if undefined, though should ideally be passed for properties
        );

      default:
        console.warn(
          `[MediaUtils] Unknown reference type for URL extraction: ${reference.type}`,
        );
        return null;
    }
  } catch (error) {
    console.error(
      '[MediaUtils] Unexpected error extracting reference URL:',
      error,
    );
    return null;
  }
}

/**
 * Updates the URL within the original Notion block or property reference object.
 * This directly modifies the passed-in reference object.
 * @param reference The tracked block/property reference object to modify.
 * @param index Optional index (required for properties) of the file to update.
 * @param mediaInfo MediaInfo containing the target URL (transformedPath or originalUrl).
 */
export function updateReferenceSourceUrl(
  reference: TrackedBlockReferenceObject,
  index: number | undefined,
  mediaInfo: MediaInfo, // Contains the URL to set (transformedPath or originalUrl)
): void {
  // Use transformed path if available (means download/upload happened), otherwise original.
  const targetUrl = mediaInfo.transformedPath || mediaInfo.originalUrl;
  if (!targetUrl) {
    console.warn(
      `[MediaUtils] Attempted to update reference ${reference.id} with an empty target URL.`,
    );
    return;
  }
  console.debug(
    `[MediaUtils] Updating source ref ${reference.id} URL to: ${targetUrl}`,
  );

  try {
    switch (reference.type) {
      case 'block': {
        const block = reference.ref as NotionBlock;
        if (!('type' in block) || !block.type) return;
        const blockType = block.type;
        // Ensure it's a media block type that we expect to have a URL field
        if (!['image', 'video', 'file', 'pdf'].includes(blockType)) return;
        // @ts-ignore - Accessing dynamic property
        const mediaObject = block[blockType];
        if (!mediaObject || !mediaObject.type) return;
        // @ts-ignore - Accessing external or file based on mediaObject.type
        const urlType = mediaObject.type as 'external' | 'file';
        if (mediaObject[urlType]) {
          // @ts-ignore - Setting url on external or file
          mediaObject[urlType].url = targetUrl;
        } else {
          console.warn(
            `[MediaUtils] Could not find URL property container for ${urlType} in block ${block.id}`,
          );
        }
        break;
      }
      case 'database_property':
      case 'page_property': {
        const property = reference.ref as
          | NotionDatabaseEntryProperty
          | NotionPageProperty;
        if (property.type !== 'files' || !property.files) return;
        const fileIndex = index ?? 0; // Default to 0 if index is missing for property
        if (!property.files[fileIndex]) {
          console.warn(
            `[MediaUtils] Invalid file index ${fileIndex} for property ${reference.propertyName}`,
          );
          return;
        }
        const fileEntry = property.files[fileIndex];
        // Update URL based on whether it's an external or internal file reference
        if (fileEntry.type === 'external') {
          fileEntry.external.url = targetUrl;
        } else if (fileEntry.type === 'file') {
          fileEntry.file.url = targetUrl;
        } else {
          console.warn(
            `[MediaUtils] Unknown file entry type ${fileEntry.type} in property ${reference.propertyName}`,
          );
        }
        break;
      }
      default:
        console.warn(
          `[MediaUtils] Cannot update URL for unknown reference type: ${reference.type}`,
        );
        break;
    }
  } catch (error) {
    console.error(
      `[MediaUtils] Failed during update of reference source URL for ${reference.id}`,
      error,
    );
    // Don't re-throw, allow process to continue if possible
  }
}
