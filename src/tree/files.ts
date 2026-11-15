import type {
  Document,
  FileValue,
  Media,
  MediaKind,
  Properties,
} from './types';
import { isFileValue } from './values';
import { visit } from './visit';

/** Where a file appears in a page. */
export type FileSource =
  'block' | 'page_cover' | 'page_property' | 'database_property';

/** A file in the document, and the tree object holding it (edit `file` to change it). */
export interface FileRef {
  /** Stable id: the block id, `<pageId>/cover`, or `<pageId>/<property>/<index>`. */
  id: string;
  kind: MediaKind;
  source: FileSource;
  pageId: string;
  file: Media | FileValue;
}

/** Every file in the document: media blocks, the cover, and files in page and database properties. */
export function files(document: Document): FileRef[] {
  const pageId = document.id;
  const refs = propertyFiles(pageId, document.properties, 'page_property');
  if (document.cover) {
    refs.push({
      id: `${pageId}/cover`,
      kind: 'image',
      source: 'page_cover',
      pageId,
      file: document.cover,
    });
  }
  visit(document, (node) => {
    if (node.type === 'media') {
      refs.push({
        id: node.id,
        kind: node.kind,
        source: 'block',
        pageId,
        file: node,
      });
    }
    if (node.type === 'database') {
      for (const row of node.rows) {
        refs.push(
          ...propertyFiles(row.pageId, row.properties, 'database_property'),
        );
      }
    }
  });
  return refs;
}

function propertyFiles(
  pageId: string,
  properties: Properties,
  source: FileSource,
): FileRef[] {
  return Object.entries(properties).flatMap(([property, value]) =>
    (Array.isArray(value) ? value : [])
      .filter(isFileValue)
      .map((file, index) => ({
        id: `${pageId}/${property}/${String(index)}`,
        kind: 'file' as const,
        source,
        pageId,
        file,
      })),
  );
}
