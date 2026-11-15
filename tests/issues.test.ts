/**
 * Scenarios from closed issues, merged PRs and release notes of the v4 alphas (and the v3
 * fixes v4 users still expect), rebuilt against the v4 API. Named by issue/PR number.
 */
import { createServer, type Server } from 'node:http';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { notion, notionToMd } from '../src/index';
import { markdown } from '../src/render/markdown/index';
import { mdx } from '../src/render/mdx/index';
import { downloadMedia } from '../src/node/index';
import { frontmatter, pageLinks } from '../src/plugins/index';
import { mockClient } from './helpers/client';
import {
  compileMdx,
  convertBlocks,
  parseMarkdown,
  renderMarkdown,
  textsOf,
  toHtml,
  toMd,
} from './helpers/convert';
import {
  PAGE_ID,
  block,
  bullet,
  callout,
  childDatabase,
  childPage,
  code,
  dateMention,
  equation,
  heading,
  inlineEquation,
  linkToPage,
  media,
  numbered,
  page,
  pageMention,
  paragraph,
  quote,
  table,
  tableOfContents,
  text,
  titleProperty,
  toggle,
  unsupported,
  type Property,
} from './helpers/notion';

let server: Server;
let base: string;
const requests: string[] = [];
beforeAll(async () => {
  server = createServer((request, response) => {
    requests.push(request.url ?? '');
    response.writeHead(200).end('bytes');
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});
afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
});

const withTempDir = async (run: (dir: string) => Promise<void>) => {
  const dir = await mkdtemp(join(tmpdir(), 'n2m-issues-'));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

describe('rendering', () => {
  it('#166 #108: numbered lists count up, restart after an interruption, and a lone item is 1.', async () => {
    const md = await toMd([
      heading(3, 'Steps'),
      numbered('First'),
      numbered([text('Second has a bold '), text('2', { bold: true })]),
      numbered('Third'),
      paragraph('Interruption'),
      numbered('Again'),
    ]);
    expect(md).toBe(
      '### Steps\n\n1. First\n2. Second has a bold **2**\n3. Third\n\nInterruption\n\n1. Again\n',
    );
    expect(await toMd([numbered('Solo')])).toBe('1. Solo\n');
  });

  it('alpha.7 #160: inline equations lose stray spaces and ignore text formatting', async () => {
    const formatted = {
      ...inlineEquation('x'),
      annotations: {
        ...inlineEquation('x').annotations,
        bold: true,
        code: true,
      },
    };
    const md = await toMd([
      paragraph([text('Let '), inlineEquation(' x = 5 '), text(' be given')]),
      paragraph([formatted]),
    ]);
    expect(md).toBe('Let $x = 5$ be given\n\n$x$\n');
  });

  it('alpha.7 #160: block equations use $$ fences', async () => {
    expect(await toMd([equation('E = mc^2')])).toBe('$$\nE = mc^2\n$$\n');
  });

  it('#153: code inside a toggle is not indented, and empty toggles still close', async () => {
    const md = await toMd([
      toggle('Title', [code('def f():\n    return 1', 'python')]),
      toggle('Empty'),
    ]);
    expect(md).toBe(
      '<details>\n<summary>Title</summary>\n\n```python\ndef f():\n    return 1\n```\n\n</details>\n\n<details>\n<summary>Empty</summary>\n\n</details>\n',
    );
    expect(textsOf(parseMarkdown(md), 'code')).toEqual([
      'def f():\n    return 1',
    ]);
  });

  it('#153: toggle summaries keep their formatting as HTML', async () => {
    const md = await toMd([
      toggle([
        text('bold', { bold: true }),
        text(' '),
        text('it', { italic: true }),
        text(' '),
        text('code', { code: true }),
        text(' '),
        text('link', { link: 'https://a.com' }),
      ]),
    ]);
    expect(md).toContain(
      '<summary><strong>bold</strong> <em>it</em> <code>code</code> <a href="https://a.com">link</a></summary>',
    );
  });

  it('#111: toggleable headings become details; normal headings stay headings', async () => {
    const md = await toMd([
      heading(1, 'Heading 1'),
      heading(1, 'Heading ', [heading(2, 'Heading 2'), paragraph('paragraph')]),
      toggle([dateMention('2024-09-03'), text(' ')], [paragraph('inside')]),
    ]);
    expect(md).toBe(
      '# Heading 1\n\n<details>\n<summary><h1>Heading</h1></summary>\n\n## Heading 2\n\nparagraph\n\n</details>\n\n<details>\n<summary>2024-09-03</summary>\n\ninside\n\n</details>\n',
    );
  });

  it('#118 #119 #120: a callout renders once with every child, including toggles inside it', async () => {
    const md = await toMd([
      callout('📝', '', [
        heading(3, [text('A Simplified Analogy', { bold: true })]),
        paragraph('Think of confidential computing as an ultra-secure vault:'),
        numbered([text('Vault:', { bold: true }), text(' the enclave')]),
        numbered([text('Key:', { bold: true }), text(' the attestation')]),
        toggle('More', [paragraph('hidden detail')]),
      ]),
    ]);
    expect(md.match(/📝/g)).toHaveLength(1);
    expect(md).toContain('> ### **A Simplified Analogy**');
    expect(md).toContain(
      '> 1. **Vault:** the enclave\n> 2. **Key:** the attestation',
    );
    expect(md).toContain('> hidden detail');
    const html = renderMarkdown(md);
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<h3><strong>A Simplified Analogy</strong></h3>');
  });

  it('#117 #103: quote children stay inside the quote, including nested quotes and lists', async () => {
    const md = await toMd([
      quote('Backstory for how this got implemented in flow:', [
        paragraph([
          text('Closing brace '),
          text('}', { code: true }),
          text(' matters'),
        ]),
        quote('A nested quote'),
        paragraph('Last line'),
      ]),
      quote('SMART is a proven goal-setting methodology.', [
        bullet([
          text('Specific:', { bold: true }),
          text(' Clearly defined and detailed.'),
        ]),
        bullet([text('Measurable:', { bold: true }), text(' Trackable.')]),
      ]),
    ]);
    expect(md).toBe(
      [
        '> Backstory for how this got implemented in flow:',
        '>',
        '> Closing brace `}` matters',
        '>',
        '> > A nested quote',
        '>',
        '> Last line',
        '',
        '> SMART is a proven goal-setting methodology.',
        '>',
        '> - **Specific:** Clearly defined and detailed.',
        '> - **Measurable:** Trackable.',
        '',
      ].join('\n'),
    );
  });

  it('#137 #138: a quote with a paragraph child renders', async () => {
    expect(await toMd([quote('Quote', [paragraph('dragged in')])])).toBe(
      '> Quote\n>\n> dragged in\n',
    );
  });

  it('#165: a quote whose only child renders nothing still renders its own text', async () => {
    expect(
      await toMd([
        quote(
          [text('Table of Contents', { underline: true })],
          [tableOfContents()],
        ),
      ]),
    ).toBe('> <u>Table of Contents</u>\n');
  });

  it('#127: nested bullets are a nested list, not a code block', async () => {
    const md = await toMd([
      bullet('Tenure', [
        bullet('Candidate has at least 1 year'),
        bullet('Candidate has at least 3 years'),
      ]),
    ]);
    expect(md).toBe(
      '- Tenure\n  - Candidate has at least 1 year\n  - Candidate has at least 3 years\n',
    );
    expect(renderMarkdown(md)).toContain(
      '<li>Tenure\n<ul>\n<li>Candidate has at least 1 year</li>',
    );
  });

  it('#131: a table skips children that are not rows', async () => {
    const rows = table([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    rows.children?.push(childPage('Not a row'));
    expect(await toMd([rows])).toBe('| a | b |\n| - | - |\n| c | d |\n');
  });

  it('#176 #177: escaping keeps bare URLs working', async () => {
    const md = await toMd([paragraph('see https://x.com/a_b?q=1*2 and a_b')], {
      escape: true,
    });
    const html = renderMarkdown(md);
    expect(html).toContain('href="https://x.com/a_b?q=1*2"');
    expect(html).toContain('and a_b');
  });

  it('#176 #177: code split into runs stays on one line; blank lines around code are dropped', async () => {
    expect(
      await toMd([
        code([text('const x = '), text('42', { color: 'red' }), text(';')]),
      ]),
    ).toBe('```javascript\nconst x = 42;\n```\n');
    expect(await toMd([code('\n\n  x = 1\n\n', 'python')])).toBe(
      '```python\n  x = 1\n```\n',
    );
  });

  it('#126: default_background is not a highlight; custom emoji icons work', async () => {
    const icon = callout('', 'Note');
    Object.assign(icon, {
      callout: {
        rich_text: [text('Note')],
        color: 'default',
        icon: {
          type: 'custom_emoji',
          custom_emoji: { id: 'e', name: 'party', url: 'https://e.png' },
        },
      },
    });
    expect(
      await toMd([
        paragraph([text('plain', { color: 'default_background' })]),
        icon,
      ]),
    ).toBe('plain\n\n> :party: Note\n');
  });

  it('#105: unsupported blocks are skipped with a warning', async () => {
    const result = await convertBlocks([
      paragraph('before'),
      unsupported(),
      paragraph('after'),
    ]);
    expect(result.content).toBe('before\n\nafter\n');
    expect(result.warnings).toHaveLength(1);
  });

  it('#84 #78: custom HTML from a handler is written as is', async () => {
    const md = await toMd(
      [
        media('video', 'https://a.com/v.mp4', { hosted: false }),
        table([['a'], ['b']]),
      ],
      {
        handlers: {
          media: (node) => `<video src="${node.url}" controls></video>`,
          table: (_, { fallback }) =>
            `<div class="table">\n\n${fallback()}\n\n</div>`,
        },
      },
    );
    expect(md).toBe(
      '<video src="https://a.com/v.mp4" controls></video>\n\n<div class="table">\n\n| a |\n| - |\n| b |\n\n</div>\n',
    );
  });
});

describe('frontmatter', () => {
  const properties = (): Record<string, Property> => ({
    Name: titleProperty('My Post'),
    date: {
      id: 'd',
      type: 'date',
      date: { start: '2025-04-01T10:00:00.000Z', end: null, time_zone: null },
    },
    tags: {
      id: 't',
      type: 'multi_select',
      multi_select: ['V4', 'Test'].map((name) => ({
        id: name,
        name,
        color: 'default',
      })),
    },
    Count: { id: 'c', type: 'number', number: 3 },
    Draft: { id: 'b', type: 'checkbox', checkbox: false },
  });

  it('#132: transforms format values', async () => {
    const result = await convertBlocks([], {
      pageObject: page(properties()),
      plugins: [
        frontmatter({
          include: ['date', 'tags'],
          transform: {
            date: (value) => String(value).split('T')[0],
            tags: (value) =>
              (value as string[]).map((tag) => tag.toLowerCase()),
          },
        }),
      ],
    });
    expect(result.content).toBe(
      '---\ndate: "2025-04-01"\ntags: ["v4","test"]\n---\n\n',
    );
  });

  it('#132: a failing transform keeps the value and warns', async () => {
    const result = await convertBlocks([], {
      pageObject: page(properties()),
      plugins: [
        frontmatter({
          include: ['Name'],
          transform: {
            Name: () => {
              throw new Error('boom');
            },
          },
        }),
      ],
    });
    expect(result.content).toBe('---\nName: "My Post"\n---\n\n');
    expect(result.warnings[0]).toContain('boom');
  });

  it('writes strings quoted, lists as arrays, numbers and booleans bare', async () => {
    const result = await convertBlocks([], {
      pageObject: page(properties()),
      plugins: [frontmatter({ rename: { Name: 'title' } })],
    });
    expect(result.content).toBe(
      '---\ntitle: "My Post"\ndate: "2025-04-01T10:00:00.000Z"\ntags: ["V4","Test"]\nCount: 3\nDraft: false\n---\n\n',
    );
  });
});

describe('media', () => {
  const hostedFile = (path: string) => ({
    name: path.split('/').pop() ?? '',
    type: 'file',
    file: { url: `${base}${path}?sig=1`, expiry_time: '' },
  });

  const workspace = () => {
    const db = childDatabase('Gallery');
    const row = page(
      {
        Name: titleProperty('Row'),
        Photos: {
          id: 'p',
          type: 'files',
          files: [hostedFile('/s/row/r.png')],
        } as Property,
      },
      '77777777-7777-4777-8777-777777777777',
    );
    const pageObject = page({
      Attachments: {
        id: 'a',
        type: 'files',
        files: [hostedFile('/s/page/a.pdf'), hostedFile('/s/page/b.pdf')],
      } as Property,
    });
    pageObject.cover = {
      type: 'file',
      file: { url: `${base}/s/cover/cover.jpg?sig=1`, expiry_time: '' },
    };
    return mockClient({
      pages: [
        {
          page: pageObject,
          blocks: [media('image', `${base}/s/block/i.png?sig=1`), db],
        },
      ],
      databases: {
        [db.id]: {
          title: 'Gallery',
          schema: { Name: { type: 'title' }, Photos: { type: 'files' } },
          rows: [row],
        },
      },
    });
  };

  it('#133: covers, page properties and database properties are downloaded too', async () => {
    await withTempDir(async (dir) => {
      const { client } = workspace();
      const result = await notionToMd({
        source: notion(client),
        renderer: markdown(),
        plugins: [downloadMedia({ dir, publicPath: '/media' })],
      }).convert(PAGE_ID);
      expect((await readdir(dir)).sort()).toHaveLength(5);
      expect(result.tree.cover?.url).toMatch(/^\/media\/[0-9a-f]{16}\.jpg$/);
      expect(result.properties.Attachments).toEqual([
        expect.objectContaining({
          url: expect.stringMatching(/^\/media\//) as string,
        }),
        expect.objectContaining({
          url: expect.stringMatching(/^\/media\//) as string,
        }),
      ]);
      expect(result.content).toMatch(
        /\| \[Row\]\(https:\/\/www\.notion\.so\/Page-[0-9a-f]+\) \| r\.png \|/,
      );
      expect(result.assets.map((asset) => asset.source).sort()).toEqual([
        'block',
        'database_property',
        'page_cover',
        'page_property',
        'page_property',
      ]);
    });
  });

  it('#133: include limits downloads to some kinds of files', async () => {
    await withTempDir(async (dir) => {
      const { client } = workspace();
      const result = await notionToMd({
        source: notion(client),
        renderer: markdown(),
        plugins: [downloadMedia({ dir, include: ['block'] })],
      }).convert(PAGE_ID);
      expect(await readdir(dir)).toHaveLength(1);
      expect(result.tree.cover?.url).toContain('/s/cover/cover.jpg?sig=1');
    });
  });

  it('#163: images nested in list items are all downloaded, captions become alt text', async () => {
    await withTempDir(async (dir) => {
      const blocks = [
        bullet(
          'Major point',
          [1, 2, 3].map((n) =>
            bullet(`Minor point ${String(n)}`, [
              media('image', `${base}/s/n${String(n)}/img.png?sig=1`, {
                caption: `Caption ${String(n)}`,
              }),
            ]),
          ),
        ),
      ];
      const result = await convertBlocks(blocks, {
        plugins: [downloadMedia({ dir, publicPath: '/media' })],
      });
      expect(await readdir(dir)).toHaveLength(3);
      for (const n of [1, 2, 3])
        expect(result.content).toMatch(
          new RegExp(
            `!\\[Caption ${String(n)}\\]\\(/media/[0-9a-f]{16}\\.png\\)`,
          ),
        );
    });
  });

  it('alpha.4: a new path mapping applies to files already downloaded', async () => {
    await withTempDir(async (dir) => {
      const blocks = () => [
        media('image', `${base}/s/same/pic.png?sig=${String(Math.random())}`),
      ];
      requests.length = 0;
      await convertBlocks(blocks(), {
        plugins: [downloadMedia({ dir, publicPath: '/old' })],
      });
      const second = await convertBlocks(blocks(), {
        plugins: [
          downloadMedia({
            dir,
            publicPath: (path) => `/new/${path.split('/').pop() ?? ''}`,
          }),
        ],
      });
      expect(requests).toHaveLength(1);
      expect(second.content).toMatch(/^!\[\]\(\/new\/[0-9a-f]{16}\.png\)\n$/);
    });
  });
});

describe('page references', () => {
  const target = '1f5b9cf9-443c-45a3-a5b2-f5844b1f1dc7';
  const compact = target.replaceAll('-', '');
  const toSite = pageLinks((link) =>
    link.pageId === target ? '/some-slug-defined-by-user' : undefined,
  );

  it('#148: plain links to Notion pages are rewritten; other links are not', async () => {
    const result = await convertBlocks(
      [
        paragraph([
          text('this is a link to '),
          text('another page', {
            link: `https://www.notion.so/Another-Page-${compact}`,
          }),
          text(' and '),
          text('a site', { link: 'https://example.com' }),
        ]),
      ],
      { plugins: [toSite] },
    );
    expect(result.content).toBe(
      'this is a link to [another page](/some-slug-defined-by-user) and [a site](https://example.com)\n',
    );
  });

  it('#123 #156: mentions, link-to-page, child pages and link previews all resolve', async () => {
    const preview = block('paragraph', {
      rich_text: [
        {
          type: 'mention',
          mention: {
            type: 'link_preview',
            link_preview: { url: `https://www.notion.so/${compact}` },
          },
          plain_text: 'preview',
          href: `https://www.notion.so/${compact}`,
          annotations: text('').annotations,
        },
      ],
      color: 'default',
    });
    const sub = childPage('Sub');
    Object.assign(sub, { id: target });
    const result = await convertBlocks(
      [
        paragraph([pageMention(target, 'mention')]),
        linkToPage(target),
        sub,
        preview,
      ],
      { plugins: [toSite] },
    );
    expect(result.content).toBe(
      [
        '[mention](/some-slug-defined-by-user)',
        '[/some-slug-defined-by-user](/some-slug-defined-by-user)',
        '[Sub](/some-slug-defined-by-user)',
        '[preview](/some-slug-defined-by-user)\n',
      ].join('\n\n'),
    );
  });

  it('#156: links can be written as paths only', async () => {
    const result = await convertBlocks(
      [paragraph([pageMention(target, 'Docs')])],
      {
        plugins: [pageLinks(() => new URL('https://site.com/docs/a').pathname)],
      },
    );
    expect(result.content).toBe('[Docs](/docs/a)\n');
  });

  it('#160: ids with and without dashes are the same page', async () => {
    const seen: string[] = [];
    await convertBlocks(
      [
        paragraph([
          pageMention(target, 'dashed'),
          text(' '),
          text('compact', { link: `/${compact}` }),
        ]),
      ],
      { plugins: [pageLinks((link) => void seen.push(link.pageId))] },
    );
    expect(seen).toEqual([target, target]);
  });

  it('#101: page mentions link to the Notion page by default', async () => {
    expect(await toMd([paragraph([pageMention(target, 'D1 P1')])])).toBe(
      `[D1 P1](https://www.notion.so/${compact})\n`,
    );
  });
});

describe('databases', () => {
  const tasks = () => {
    const db = childDatabase('Tasks');
    const status = (name: string) =>
      ({
        id: 's',
        type: 'status',
        status: { id: name, name, color: 'default' },
      }) as Property;
    const due = (start: string) =>
      ({
        id: 'd',
        type: 'date',
        date: { start, end: null, time_zone: null },
      }) as Property;
    const rows = [
      page(
        {
          Name: titleProperty('Task 1'),
          Status: status('In Progress'),
          Due: due('2025-04-01'),
        },
        '60000000-0000-4000-8000-000000000001',
      ),
      page(
        {
          Name: titleProperty('Task 2'),
          Status: status('Done'),
          Due: due('2025-04-02'),
        },
        '60000000-0000-4000-8000-000000000002',
      ),
    ];
    return { db, rows };
  };

  it('#141 alpha.5: a database inside a page becomes a table', async () => {
    const { db, rows } = tasks();
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [db] }],
      databases: {
        [db.id]: {
          title: 'Tasks',
          schema: {
            Name: { type: 'title' },
            Status: { type: 'status' },
            Due: { type: 'date' },
          },
          rows,
        },
      },
    });
    const result = await notionToMd({
      source: notion(client),
      renderer: markdown(),
    }).convert(PAGE_ID);
    const table = parseMarkdown(result.content).children[1];
    expect(table?.type).toBe('table');
    expect(result.content).toContain('| Name | Status | Due |');
    expect(result.content).toContain('| In Progress | 2025-04-01 |');
  });

  it('alpha.5: databases inside pages can be filtered and sorted', async () => {
    const { db, rows } = tasks();
    const { client, queries } = mockClient({
      pages: [{ page: page(), blocks: [db] }],
      databases: { [db.id]: { title: 'Tasks', schema: {}, rows } },
    });
    const filter = { property: 'Status', status: { equals: 'Done' } };
    const sorts = [{ property: 'Due', direction: 'descending' as const }];
    await notionToMd({
      source: notion(client, {
        databaseQueries: { [db.id.replaceAll('-', '')]: { filter, sorts } },
      }),
      renderer: markdown(),
    }).convert(PAGE_ID);
    expect(queries).toEqual([{ filter, sorts }]);
  });

  it('alpha.5: a database can be rendered with custom MDX components and imports', async () => {
    const { db, rows } = tasks();
    const { client } = mockClient({
      pages: [{ page: page(), blocks: [db] }],
      databases: {
        [db.id]: {
          title: 'Tasks',
          schema: { Name: { type: 'title' }, Status: { type: 'status' } },
          rows,
        },
      },
    });
    const result = await notionToMd({
      source: notion(client),
      renderer: mdx({
        handlers: {
          database: (node, { addImport }) => {
            addImport(
              "import { StatusBadge } from '@/components/StatusBadge';",
            );
            return node.rows
              .map(
                (row) =>
                  `- ${row.properties.Name as string} <StatusBadge status="${row.properties.Status as string}" />`,
              )
              .join('\n');
          },
        },
      }),
    }).convert(PAGE_ID);
    expect(result.content).toBe(
      'import { StatusBadge } from \'@/components/StatusBadge\';\n\n- Task 1 <StatusBadge status="In Progress" />\n- Task 2 <StatusBadge status="Done" />\n',
    );
    await expect(compileMdx(result.content)).resolves.toBeUndefined();
  });
});

describe('fetching', () => {
  it('#107: a page with 10,000 blocks converts in a few seconds', async () => {
    const blocks = Array.from({ length: 10_000 }, (_, index) =>
      index % 10 === 0
        ? toggle(`Toggle ${String(index)}`, [paragraph('child')])
        : paragraph(`Paragraph ${String(index)}`),
    );
    const { client, calls } = mockClient({ pages: [{ page: page(), blocks }] });
    const started = performance.now();
    const result = await notionToMd({
      source: notion(client, { concurrency: 10 }),
      renderer: markdown(),
    }).convert(PAGE_ID);
    const seconds = (performance.now() - started) / 1000;
    expect(calls).toHaveLength(1 + 100 + 1000);
    expect(result.content.split('\n\n')).toHaveLength(10_000 + 2000);
    expect(seconds).toBeLessThan(5);
  });
});

describe('html', () => {
  it('#133: the HTML renderer uses resolved URLs too', async () => {
    const output = await toHtml([
      media('image', 'https://a.com/x.png', { hosted: false, caption: 'X' }),
    ]);
    expect(output).toContain('src="https://a.com/x.png"');
  });
});
