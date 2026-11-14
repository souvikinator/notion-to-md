import { describe, expect, it } from 'vitest';
import { notionToMd } from '../../src/index';
import { markdown } from '../../src/render/markdown/index';
import { cached } from '../../src/source/cached';
import { notion } from '../../src/source/notion';
import { mockClient } from '../helpers/client';
import { PAGE_ID, page, paragraph, toggle } from '../helpers/notion';

const setup = () => {
  const notionPage = page();
  const workspace = {
    pages: [{ page: notionPage, blocks: [toggle('t', [paragraph('inside')])] }],
  };
  return { notionPage, ...mockClient(workspace) };
};

describe('cached', () => {
  it('reuses blocks while the page is unchanged', async () => {
    const { client, calls } = setup();
    const converter = notionToMd({
      source: cached(notion(client)),
      renderer: markdown(),
    });

    const first = await converter.convert(PAGE_ID);
    const callsAfterFirst = calls.length;
    const second = await converter.convert(PAGE_ID);

    expect(second.content).toBe(first.content);
    expect(callsAfterFirst).toBe(3);
    expect(calls.slice(callsAfterFirst)).toEqual([`pages.retrieve:${PAGE_ID}`]);
  });

  it('fetches again after the page is edited', async () => {
    const { client, calls, notionPage } = setup();
    const source = cached(notion(client));
    await source.blocks(PAGE_ID);
    notionPage.last_edited_time = '2026-02-01T00:00:00.000Z';
    await source.blocks(PAGE_ID);
    expect(
      calls.filter((call) => call.startsWith('blocks.children.list')),
    ).toHaveLength(4);
  });

  it('keeps the wrapped source able to list databases', () => {
    const { client } = setup();
    expect(cached(notion(client))).toHaveProperty('query');
  });
});
