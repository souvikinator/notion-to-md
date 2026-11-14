import { describe, expect, it } from 'vitest';
import { notion } from '../../src/source/notion';
import { mockClient, type Workspace } from '../helpers/client';
import {
  PAGE_ID,
  block,
  bullet,
  childDatabase,
  childPage,
  linkToPage,
  page,
  paragraph,
  syncedBlock,
  titleProperty,
  toggle,
} from '../helpers/notion';

const workspaceWith = (
  blocks: ReturnType<typeof paragraph>[],
  extra: Partial<Workspace> = {},
): Workspace => ({
  pages: [{ page: page(), blocks }],
  ...extra,
});

describe('notion source', () => {
  it('fetches nested children at every depth', async () => {
    const { client } = mockClient(
      workspaceWith([
        toggle('t', [bullet('a', [bullet('deep', [paragraph('deepest')])])]),
      ]),
    );
    const blocks = await notion(client).blocks(PAGE_ID);
    expect(
      blocks[0]?.children?.[0]?.children?.[0]?.children?.[0],
    ).toMatchObject({ type: 'paragraph' });
  });

  it('follows pagination', async () => {
    const many = Array.from({ length: 7 }, (_, index) =>
      paragraph(`p${String(index)}`),
    );
    const { client, calls } = mockClient(workspaceWith(many, { pageSize: 3 }));
    const blocks = await notion(client).blocks(PAGE_ID);
    expect(blocks).toHaveLength(7);
    expect(
      calls.filter((call) => call === `blocks.children.list:${PAGE_ID}`),
    ).toHaveLength(3);
  });

  it('never has more requests in flight than the concurrency limit', async () => {
    const wide = Array.from({ length: 20 }, () =>
      toggle('t', [paragraph('x')]),
    );
    const { client, calls, maxInFlight } = mockClient(workspaceWith(wide));
    await notion(client, { concurrency: 2 }).blocks(PAGE_ID);
    expect(calls).toHaveLength(21);
    expect(maxInFlight()).toBe(2);
  });

  it('keeps every slot busy instead of waiting for the slowest request in a batch', async () => {
    const wide = Array.from({ length: 12 }, () =>
      toggle('t', [paragraph('x')]),
    );
    const { client, maxInFlight } = mockClient(workspaceWith(wide));
    await notion(client, { concurrency: 4 }).blocks(PAGE_ID);
    expect(maxInFlight()).toBe(4);
  });

  it('does not fetch the content of child pages (#88)', async () => {
    const sub = childPage('Sub', [paragraph('sub content')]);
    const { client, calls } = mockClient(workspaceWith([sub]));
    await notion(client).blocks(PAGE_ID);
    expect(calls).toEqual([`blocks.children.list:${PAGE_ID}`]);
  });

  it('reads a synced copy from its original block', async () => {
    const original = syncedBlock([paragraph('shared')]);
    const copy = syncedBlock([], original.id);
    const { client } = mockClient(workspaceWith([original, copy]));
    const [, fetchedCopy] = await notion(client).blocks(PAGE_ID);
    expect(fetchedCopy?.children?.[0]).toMatchObject({ type: 'paragraph' });
  });

  it('fetches the title of linked pages', async () => {
    const otherId = '33333333-3333-4333-8333-333333333333';
    const other = page({ Name: titleProperty('Other page') }, otherId);
    const { client } = mockClient({
      pages: [
        { page: page(), blocks: [linkToPage(otherId)] },
        { page: other, blocks: [] },
      ],
    });
    const [link] = await notion(client).blocks(PAGE_ID);
    expect(link?.title).toBe('Other page');
  });

  it('fetches database rows and the column order', async () => {
    const db = childDatabase('Tasks');
    const row = page(
      { Name: titleProperty('Write tests') },
      '44444444-4444-4444-8444-444444444444',
    );
    const { client } = mockClient(
      workspaceWith([db], {
        databases: {
          [db.id]: {
            title: 'Tasks',
            schema: { Status: { type: 'status' }, Name: { type: 'title' } },
            rows: [row],
          },
        },
      }),
    );
    const [fetched] = await notion(client).blocks(PAGE_ID);
    expect(fetched?.database?.rows).toHaveLength(1);
    expect(Object.keys(fetched?.database?.dataSource.properties ?? {})).toEqual(
      ['Status', 'Name'],
    );
  });

  it('keeps going when a database or synced original is not shared with the integration (#158)', async () => {
    const db = childDatabase('Private');
    const copy = syncedBlock([], '55555555-5555-4555-8555-555555555555');
    const { client } = mockClient(
      workspaceWith([db, copy], {
        forbidden: [db.id, '55555555-5555-4555-8555-555555555555'],
      }),
    );
    const [fetchedDb, fetchedCopy] = await notion(client).blocks(PAGE_ID);
    expect(fetchedDb?.error).toContain('Could not find');
    expect(fetchedCopy?.error).toContain('Could not find');
  });

  it('can skip databases', async () => {
    const db = childDatabase('Tasks');
    const { client, calls } = mockClient(workspaceWith([db]));
    await notion(client, { databases: false }).blocks(PAGE_ID);
    expect(calls).toEqual([`blocks.children.list:${PAGE_ID}`]);
  });

  it('lists database pages through every data source', async () => {
    const rows = ['a', 'b', 'c'].map((name, index) =>
      page(
        { Name: titleProperty(name) },
        `6666666${String(index)}-6666-4666-8666-666666666666`,
      ),
    );
    const { client } = mockClient({
      pages: [],
      databases: { db: { title: 'Blog', schema: {}, rows } },
      pageSize: 2,
    });
    const listed = [];
    for await (const row of notion(client).query?.('db') ?? [])
      listed.push(row.id);
    expect(listed).toEqual(rows.map((row) => row.id));
  });

  it('rejects an invalid concurrency', () => {
    const { client } = mockClient(workspaceWith([]));
    expect(() => notion(client, { concurrency: 0 })).toThrow(RangeError);
  });

  it('skips partial block objects', async () => {
    const partial = { object: 'block', id: 'partial' } as unknown as ReturnType<
      typeof block
    >;
    const { client } = mockClient(workspaceWith([partial, paragraph('full')]));
    expect(await notion(client).blocks(PAGE_ID)).toHaveLength(1);
  });
});

describe('notion source review fixes', () => {
  it('reads rows from every data source of a database', async () => {
    const db = childDatabase('Tasks');
    const rows = [1, 2].map((n) =>
      page(
        { Name: titleProperty(`Row ${String(n)}`) },
        `8888888${String(n)}-8888-4888-8888-888888888888`,
      ),
    );
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [db] }],
      databases: {
        [db.id]: {
          title: 'Tasks',
          schema: { Name: { type: 'title' } },
          rows: [rows[0]!],
          extraSources: [[rows[1]!]],
        },
      },
    });
    const [fetched] = await notion(client).blocks(PAGE_ID);
    expect(fetched?.database?.rows.map((row) => row.id)).toEqual(
      rows.map((row) => row.id),
    );
  });

  it('fetches the title of linked databases', async () => {
    const dbId = '99999999-9999-4999-8999-999999999999';
    const link = block('link_to_page', {
      type: 'database_id',
      database_id: dbId,
    });
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [link] }],
      databases: { [dbId]: { title: 'Roadmap', schema: {}, rows: [] } },
    });
    const [fetched] = await notion(client).blocks(PAGE_ID);
    expect(fetched?.title).toBe('Roadmap');
  });
});
