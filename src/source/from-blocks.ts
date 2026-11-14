import type { RawBlock, RawPage, Source } from './types';

export interface SavedPage {
  blocks: RawBlock[];
  /** The page object, for title, properties and URL. Optional when only blocks were saved. */
  page?: RawPage;
}

/** Converts blocks you already have (for example, saved JSON) without calling Notion. */
export function fromBlocks(saved: SavedPage): Source {
  const page: RawPage = saved.page ?? {
    id: parentPageId(saved.blocks) ?? '',
    url: '',
    icon: null,
    properties: {},
  };
  return {
    page: () => Promise.resolve(page),
    blocks: () => Promise.resolve(saved.blocks),
  };
}

function parentPageId(blocks: RawBlock[]): string | undefined {
  const parent = blocks[0]?.parent;
  return parent?.type === 'page_id' ? parent.page_id : undefined;
}
