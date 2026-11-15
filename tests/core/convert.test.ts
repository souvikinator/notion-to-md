import { describe, expect, it, vi } from 'vitest';
import { notionToMd, type Plugin } from '../../src/index';
import {
  frontmatter,
  media as mediaPlugin,
  pageLinks,
} from '../../src/plugins/index';
import { markdown } from '../../src/render/markdown/index';
import { fromBlocks } from '../../src/source/from-blocks';
import { notion } from '../../src/source/notion';
import { OTHER_PAGE } from '../helpers/fixtures';
import { mockClient } from '../helpers/client';
import { convertBlocks } from '../helpers/convert';
import {
  childDatabase,
  media,
  page,
  pageMention,
  paragraph,
  text,
  titleProperty,
  unsupported,
  type Property,
} from '../helpers/notion';

const linkTo = (pageId: string, label: string) =>
  paragraph([pageMention(pageId, label)]);

describe('plugins', () => {
  it('run each stage in order: transform, resolve, render, result', async () => {
    const order: string[] = [];
    const plugin: Plugin = {
      name: 'order',
      transform: () => void order.push('transform'),
      resolveLink: () => {
        order.push('resolveLink');
        return undefined;
      },
      result: (page) => {
        order.push('result');
        return page;
      },
    };
    await convertBlocks([linkTo(OTHER_PAGE, 'x')], { plugins: [plugin] });
    expect(order).toEqual(['transform', 'resolveLink', 'result']);
  });

  it('let a transform edit the tree before rendering', async () => {
    const result = await convertBlocks([paragraph('hello')], {
      plugins: [
        {
          name: 'shout',
          transform(document) {
            for (const node of document.children) {
              if (node.type === 'paragraph')
                node.content = [{ type: 'text', value: 'HELLO', marks: {} }];
            }
          },
        },
      ],
    });
    expect(result.content).toBe('HELLO\n');
  });

  it('use the first resolver that returns a URL', async () => {
    const result = await convertBlocks([linkTo(OTHER_PAGE, 'Other')], {
      plugins: [
        pageLinks(() => undefined),
        pageLinks(() => '/first'),
        pageLinks(() => '/second'),
      ],
    });
    expect(result.content).toBe('[Other](/first)\n');
    expect(result.links).toEqual([{ pageId: OTHER_PAGE, url: '/first' }]);
  });

  it('pass block ids so links to a block can become anchors (#161)', async () => {
    const blockId = '99999999999949998999999999999999';
    const result = await convertBlocks(
      [
        paragraph([
          text('section', {
            link: `https://www.notion.so/Other-${OTHER_PAGE.replaceAll('-', '')}#${blockId}`,
          }),
        ]),
      ],
      { plugins: [pageLinks((link) => `/other#${link.blockId ?? ''}`)] },
    );
    expect(result.content).toBe(
      '[section](/other#99999999-9999-4999-8999-999999999999)\n',
    );
  });

  it('resolve files in blocks and in properties (#133)', async () => {
    const files = {
      Cover: {
        id: 'c',
        type: 'files',
        files: [
          {
            name: 'cover.png',
            type: 'file',
            file: {
              url: 'https://files.notion.so/s/f/cover.png',
              expiry_time: '',
            },
          },
        ],
      } as Property,
    };
    const seen: string[] = [];
    const result = await convertBlocks(
      [
        media('image', 'https://files.notion.so/s/a/one.png'),
        media('image', 'https://files.notion.so/s/b/two.png'),
      ],
      {
        pageObject: page(files),
        plugins: [
          mediaPlugin((asset) => {
            seen.push(asset.name);
            return `/img/${asset.name}`;
          }),
        ],
      },
    );
    expect(seen.sort()).toEqual(['cover.png', 'one.png', 'two.png']);
    expect(result.content).toBe('![](/img/one.png)\n\n![](/img/two.png)\n');
    expect(result.properties.Cover).toEqual([
      { name: 'cover.png', url: '/img/cover.png', hosted: true },
    ]);
    expect(result.assets.map((asset) => asset.url).sort()).toEqual([
      '/img/cover.png',
      '/img/one.png',
      '/img/two.png',
    ]);
  });
});

describe('warnings', () => {
  it('are collected on the page', async () => {
    const result = await convertBlocks([unsupported()]);
    expect(result.warnings).toHaveLength(1);
  });

  it('throw in strict mode', async () => {
    const run = notionToMd({
      source: fromBlocks({ blocks: [unsupported()] }),
      renderer: markdown(),
      strict: true,
    });
    await expect(run.convert('x')).rejects.toThrow(/unsupported/);
  });

  it('never print to the console (#168)', async () => {
    const spies = (['log', 'debug', 'info', 'warn', 'error'] as const).map(
      (method) => vi.spyOn(console, method),
    );
    await convertBlocks([unsupported(), paragraph('x')]);
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('convert with the Notion source', () => {
  it('fetches the page and its blocks', async () => {
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [paragraph('Hi')] }],
    });
    const result = await notionToMd({
      source: notion(client),
      renderer: markdown(),
    }).convert('11111111111141118111111111111111');
    expect(result).toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      title: 'Test page',
      content: 'Hi\n',
    });
  });

  it('is safe to call for several pages at once on one instance', async () => {
    const ids = [1, 2, 3].map(
      (digit) => `${String(digit).repeat(8)}-0000-4000-8000-000000000000`,
    );
    const { client } = mockClient({
      pages: ids.map((id, index) => ({
        page: page({ Name: titleProperty(`Page ${String(index)}`) }, id),
        blocks: [paragraph(`body ${String(index)}`)],
      })),
    });
    const converter = notionToMd({
      source: notion(client),
      renderer: markdown(),
      plugins: [frontmatter()],
    });
    const results = await Promise.all(ids.map((id) => converter.convert(id)));
    expect(results.map((result) => result.content)).toEqual([
      '---\nName: "Page 0"\n---\n\nbody 0\n',
      '---\nName: "Page 1"\n---\n\nbody 1\n',
      '---\nName: "Page 2"\n---\n\nbody 2\n',
    ]);
  });

  it('renders databases in a page as tables linking to each row', async () => {
    const db = childDatabase('Tasks');
    const row = page(
      {
        Name: titleProperty('Write tests'),
        Status: {
          id: 's',
          type: 'status',
          status: { id: 'x', name: 'Done', color: 'green' },
        } as Property,
      },
      '44444444-4444-4444-8444-444444444444',
    );
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [db] }],
      databases: {
        [db.id]: {
          title: 'Tasks',
          schema: { Status: { type: 'status' }, Name: { type: 'title' } },
          rows: [row],
        },
      },
    });
    const result = await notionToMd({
      source: notion(client),
      renderer: markdown(),
      plugins: [pageLinks(() => '/tasks/write-tests')],
    }).convert('11111111-1111-4111-8111-111111111111');
    expect(result.content).toBe(
      `[Tasks](https://www.notion.so/${db.id.replaceAll('-', '')})\n\n| Name | Status |\n| - | - |\n| [Write tests](/tasks/write-tests) | Done |\n`,
    );
  });

  it('warns instead of failing when a database is not shared (#158)', async () => {
    const db = childDatabase('Private');
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [db, paragraph('after')] }],
      forbidden: [db.id],
    });
    const result = await notionToMd({
      source: notion(client),
      renderer: markdown(),
    }).convert('11111111-1111-4111-8111-111111111111');
    expect(result.content).toContain('after');
    expect(result.warnings[0]).toContain('could not be fetched');
  });
});

describe('pages', () => {
  const posts = [
    {
      id: '70000000-0000-4000-8000-000000000001',
      title: 'First',
      slug: 'first',
    },
    {
      id: '70000000-0000-4000-8000-000000000002',
      title: 'Second',
      slug: 'second',
    },
  ];
  const slugProperty = (slug: string) =>
    ({ id: 'slug', type: 'rich_text', rich_text: [text(slug)] }) as Property;

  it('converts every page and resolves links between them through the site map', async () => {
    const rows = posts.map((post) =>
      page(
        { Name: titleProperty(post.title), Slug: slugProperty(post.slug) },
        post.id,
      ),
    );
    const { client } = mockClient({
      pages: [
        { page: rows[0]!, blocks: [linkTo(posts[1]!.id, 'Next post')] },
        { page: rows[1]!, blocks: [linkTo(posts[0]!.id, 'Previous post')] },
      ],
      databases: { blog: { title: 'Blog', schema: {}, rows } },
    });
    const converter = notionToMd({
      source: notion(client),
      renderer: markdown(),
      plugins: [
        pageLinks((link, { site }) => {
          const target = site.get(link.pageId);
          const slug = target?.properties.Slug;
          return typeof slug === 'string' ? `/blog/${slug}` : undefined;
        }),
      ],
    });
    const results = [];
    for await (const result of converter.pages('blog'))
      results.push(result.content);
    expect(results).toEqual([
      '[Next post](/blog/second)\n',
      '[Previous post](/blog/first)\n',
    ]);
  });

  it('needs a source that can list pages', async () => {
    const converter = notionToMd({
      source: fromBlocks({ blocks: [], page: page() }),
      renderer: markdown(),
    });
    await expect(converter.pages('db').next()).rejects.toThrow(/cannot list/);
  });
});

describe('frontmatter', () => {
  it('writes properties as valid YAML', async () => {
    const result = await convertBlocks([paragraph('body')], {
      pageObject: page({
        Tags: {
          id: 't',
          type: 'multi_select',
          multi_select: [{ id: '1', name: 'a "quoted" tag', color: 'red' }],
        } as Property,
        'Published at': {
          id: 'd',
          type: 'date',
          date: { start: '2026-01-01', end: null, time_zone: null },
        } as Property,
        'Odd: key': { id: 'o', type: 'checkbox', checkbox: false } as Property,
      }),
      plugins: [
        frontmatter({
          rename: { Name: 'title' },
          defaults: { draft: true },
        }),
      ],
    });
    expect(result.content).toBe(
      '---\ntitle: "Test page"\nTags: ["a \\"quoted\\" tag"]\nPublished at: "2026-01-01"\n"Odd: key": false\ndraft: true\n---\n\nbody\n',
    );
  });

  it('adds nothing when there are no fields', async () => {
    const result = await convertBlocks([paragraph('body')], {
      plugins: [frontmatter({ include: [] })],
    });
    expect(result.content).toBe('body\n');
  });

  it('can include only some properties', async () => {
    const result = await convertBlocks([], {
      pageObject: page({
        Hidden: { id: 'h', type: 'number', number: 1 } as Property,
      }),
      plugins: [frontmatter({ include: ['Name'] })],
    });
    expect(result.content).toBe('---\nName: "Test page"\n---\n\n');
  });
});

describe('input handling', () => {
  it('accepts a link to the page instead of an id', async () => {
    const { client, calls } = mockClient({
      pages: [{ page: page(), blocks: [paragraph('Hi')] }],
    });
    const result = await notionToMd({
      source: notion(client),
      renderer: markdown(),
    }).convert(
      'https://www.notion.so/team/Test-11111111111141118111111111111111?pvs=4',
    );
    expect(result.content).toBe('Hi\n');
    expect(calls[0]).toBe(
      'pages.retrieve:11111111-1111-4111-8111-111111111111',
    );
  });

  it('needs a page id when converting saved blocks', () => {
    expect(() => fromBlocks({ blocks: [] })).toThrow(/page object/);
  });

  it('quotes frontmatter keys YAML would read as other types', async () => {
    const result = await convertBlocks([], {
      pageObject: page({
        true: { id: 'a', type: 'checkbox', checkbox: true } as Property,
        '123': { id: 'b', type: 'number', number: 1 } as Property,
      }),
      plugins: [frontmatter({ exclude: ['Name'] })],
    });
    expect(result.content).toBe('---\n"123": 1\n"true": true\n---\n\n');
  });
});
