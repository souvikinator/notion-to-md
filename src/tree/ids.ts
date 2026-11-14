const COMPACT_ID = /^[0-9a-f]{32}$/i;
const ID_AT_END =
  /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const NOTION_HOST = /(^|\.)notion\.(so|site|com)$/i;

/** Formats a Notion id as a lowercase, dashed UUID. Returns the input unchanged when it is not an id. */
export function normalizeId(id: string): string {
  const compact = id.replaceAll('-', '').toLowerCase();
  if (!COMPACT_ID.test(compact)) return id;
  return [
    compact.slice(0, 8),
    compact.slice(8, 12),
    compact.slice(12, 16),
    compact.slice(16, 20),
    compact.slice(20),
  ].join('-');
}

export function notionUrl(pageId: string, blockId?: string): string {
  const page = `https://www.notion.so/${pageId.replaceAll('-', '')}`;
  return blockId ? `${page}#${blockId.replaceAll('-', '')}` : page;
}

/**
 * Reads the page id (and block id, if the link points at a block) from a link to a Notion page.
 * Accepts relative links (`/<id>`) and links on notion.so, notion.com and notion.site.
 */
export function parseNotionUrl(
  url: string,
): { pageId: string; blockId?: string } | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url, 'https://www.notion.so');
  } catch {
    return undefined;
  }
  if (!NOTION_HOST.test(parsed.hostname)) return undefined;

  const lastSegment = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
  const pageId = ID_AT_END.exec(lastSegment)?.[1];
  if (!pageId) return undefined;

  const fragment = parsed.hash.slice(1);
  const blockId = COMPACT_ID.test(fragment) ? normalizeId(fragment) : undefined;
  return blockId
    ? { pageId: normalizeId(pageId), blockId }
    : { pageId: normalizeId(pageId) };
}
