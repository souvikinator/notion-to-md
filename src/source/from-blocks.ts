import type { RawBlock, RawPage, Source } from './types';

export interface SavedPage {
  blocks: RawBlock[];
  /** The page object, for title, properties and URL. Optional when only blocks were saved. */
  page?: RawPage;
}

/** Converts blocks you already have (for example, saved JSON) without calling Notion. */
export function fromBlocks(saved: SavedPage): Source {
  const page: RawPage = saved.page ?? emptyPage(saved.blocks);
  return {
    page: () => Promise.resolve(page),
    blocks: () => Promise.resolve(saved.blocks),
  };
}

/** Without a saved page, the page id comes from the blocks' parent. */
function emptyPage(blocks: RawBlock[]): RawPage {
  const parent = blocks[0]?.parent;
  if (parent?.type !== 'page_id') {
    throw new Error(
      'fromBlocks needs the page object, or blocks whose parent is a page.',
    );
  }
  return {
    id: parent.page_id,
    url: '',
    icon: null,
    properties: {},
    last_edited_time: '',
  };
}
