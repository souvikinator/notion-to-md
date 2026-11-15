/**
 * The use cases from the v4 blog posts, rebuilt with the v4 API and run end to end.
 */
import { createServer, type Server } from 'node:http';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { notion, notionToMd, select, type Plugin } from '../src/index';
import { html } from '../src/render/html/index';
import { markdown } from '../src/render/markdown/index';
import { mdx } from '../src/render/mdx/index';
import { downloadMedia } from '../src/node/index';
import { footnotes, frontmatter, media } from '../src/plugins/index';
import { mockClient, type Workspace } from './helpers/client';
import { compileMdx, renderMdx } from './helpers/convert';
import {
  PAGE_ID,
  bullet,
  heading,
  media as mediaBlock,
  page,
  paragraph,
  titleProperty,
  toggle,
  type Property,
} from './helpers/notion';

let server: Server;
let base: string;
beforeAll(async () => {
  server = createServer((request, response) => {
    response.writeHead(200).end(`file at ${request.url ?? ''}`);
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

const blogProperties = (): Record<string, Property> => ({
  Name: titleProperty('Notion Properties as Frontmatter'),
  Created: {
    id: 'c',
    type: 'created_time',
    created_time: '2025-01-04T02:17:00.000Z',
  },
  Tags: {
    id: 't',
    type: 'multi_select',
    multi_select: ['V4', 'notion to md', 'test'].map((name) => ({
      id: name,
      name,
      color: 'default',
    })),
  },
  PublishURL: {
    id: 'p',
    type: 'url',
    url: '/page-1',
  },
});

const convertWith = async (
  workspace: Workspace,
  options: Omit<Parameters<typeof notionToMd>[0], 'source'> & {
    comments?: boolean;
  },
) => {
  const { client } = mockClient(workspace);
  const { comments, ...rest } = options;
  return notionToMd({
    source: notion(client, { comments: comments ?? false }),
    ...rest,
  }).convert(PAGE_ID);
};

describe('blog: comments as footnotes', () => {
  const blocks = () => {
    const first = paragraph('This is a paragraph with a comment attached.');
    const second = paragraph('Another paragraph with multiple comments.');
    const plain = paragraph('No comments here.');
    const title = heading(2, 'A commented heading');
    const nested = toggle('Toggle', [bullet('Nested item with a comment')]);
    const nestedItem = nested.children?.[0];
    return { first, second, plain, title, nested, nestedItem };
  };

  it('writes each commented block as a footnote reference with the comments at the end', async () => {
    const { first, second, plain, title, nested, nestedItem } = blocks();
    const result = await convertWith(
      {
        pages: [
          {
            page: page(blogProperties()),
            blocks: [title, first, second, plain, nested],
          },
        ],
        comments: {
          [first.id]: ['This paragraph needs to be updated'],
          [second.id]: ['Comment 1', 'Follow up comment (2)'],
          [title.id]: ['Rename this'],
          [nestedItem?.id ?? '']: ['Deep comment'],
        },
      },
      {
        comments: true,
        renderer: mdx(),
        plugins: [footnotes(), frontmatter()],
      },
    );

    expect(result.content).toBe(
      [
        '---',
        'Name: "Notion Properties as Frontmatter"',
        'Created: "2025-01-04T02:17:00.000Z"',
        'Tags: ["V4","notion to md","test"]',
        'PublishURL: "/page-1"',
        '---',
        '',
        '## A commented heading[^1]',
        '',
        'This is a paragraph with a comment attached.[^2]',
        '',
        'Another paragraph with multiple comments.[^3]',
        '',
        'No comments here.',
        '',
        '<details>',
        '<summary>Toggle</summary>',
        '',
        '- Nested item with a comment[^4]',
        '',
        '</details>',
        '',
        '[^1]: Rename this',
        '',
        '[^2]: This paragraph needs to be updated',
        '',
        '[^3]: Comment 1 Follow up comment (2)',
        '',
        '[^4]: Deep comment',
        '',
      ].join('\n'),
    );
    const rendered = await renderMdx(
      result.content.replace(/^---[\s\S]*?---\n/, ''),
    );
    expect(rendered).toContain('data-footnote-ref');
    expect(rendered).toContain('Comment 1 Follow up comment (2)');
  });

  it('keeps comments in the tree for custom plugins, with authors', async () => {
    const { first } = blocks();
    const result = await convertWith(
      {
        pages: [{ page: page(), blocks: [first] }],
        comments: {
          [first.id]: ['Looks good'],
          [PAGE_ID]: ['Page-level note'],
        },
      },
      { comments: true, renderer: markdown() },
    );
    expect(result.tree.comments).toEqual([
      expect.objectContaining({
        author: 'Ada',
        content: [expect.objectContaining({ value: 'Page-level note' })],
      }),
    ]);
    expect(result.tree.children[0]?.comments?.[0]?.author).toBe('Ada');
    expect(result.content).toBe(
      'This is a paragraph with a comment attached.\n',
    );
  });

  it('renders footnotes in HTML too', async () => {
    const { first } = blocks();
    const result = await convertWith(
      {
        pages: [{ page: page(), blocks: [first] }],
        comments: { [first.id]: ['Fix this'] },
      },
      { comments: true, renderer: html(), plugins: [footnotes()] },
    );
    expect(result.content).toBe(
      '<p>This is a paragraph with a comment attached.<sup><a href="#fn-1" id="fnref-1">1</a></sup></p>\n<section class="footnotes">\n<ol>\n<li id="fn-1">Fix this <a href="#fnref-1">↩</a></li>\n</ol>\n</section>',
    );
  });

  it('warns and keeps converting when the integration cannot read comments', async () => {
    const result = await convertWith(
      {
        pages: [{ page: page(), blocks: [paragraph('Body')] }],
        commentsRestricted: true,
      },
      { comments: true, renderer: markdown(), plugins: [footnotes()] },
    );
    expect(result.content).toBe('Body\n');
    expect(
      result.warnings.some((warning) =>
        warning.includes('Insufficient permissions'),
      ),
    ).toBe(true);
  });

  it('does not ask for comments unless enabled', async () => {
    const { client, calls } = mockClient({
      pages: [{ page: page(), blocks: [paragraph('Body')] }],
    });
    await notionToMd({ source: notion(client), renderer: markdown() }).convert(
      PAGE_ID,
    );
    expect(calls.some((call) => call.startsWith('comments.list'))).toBe(false);
  });
});

describe('blog: properties as frontmatter', () => {
  const convertPage = (plugin: Plugin) =>
    convertWith(
      {
        pages: [{ page: page(blogProperties()), blocks: [paragraph('Body')] }],
      },
      { renderer: mdx(), plugins: [plugin] },
    );

  it('writes every property by default', async () => {
    const result = await convertPage(frontmatter());
    expect(result.content).toBe(
      '---\nName: "Notion Properties as Frontmatter"\nCreated: "2025-01-04T02:17:00.000Z"\nTags: ["V4","notion to md","test"]\nPublishURL: "/page-1"\n---\n\nBody\n',
    );
  });

  it('supports include, exclude, defaults and rename', async () => {
    const excluded = await convertPage(
      frontmatter({
        exclude: ['PublishURL'],
        defaults: { draft: true, comments: 'true' },
        rename: { Name: 'title' },
      }),
    );
    expect(excluded.content).toBe(
      '---\ntitle: "Notion Properties as Frontmatter"\nCreated: "2025-01-04T02:17:00.000Z"\nTags: ["V4","notion to md","test"]\ndraft: true\ncomments: "true"\n---\n\nBody\n',
    );
    const included = await convertPage(
      frontmatter({ include: ['PublishURL'] }),
    );
    expect(included.content).toBe('---\nPublishURL: "/page-1"\n---\n\nBody\n');
  });

  it('transforms fields and adds computed ones', async () => {
    const result = await convertPage(
      frontmatter({
        include: ['Created', 'Tags'],
        rename: { Created: 'date', Tags: 'tags' },
        transform: {
          date: (value) => String(value).split('T')[0],
          tags: (value) => (value as string[]).map((tag) => tag.toLowerCase()),
          slug: (_, page) =>
            page.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-'),
        },
      }),
    );
    expect(result.content).toBe(
      '---\ndate: "2025-01-04"\ntags: ["v4","notion to md","test"]\nslug: "notion-properties-as-frontmatter"\n---\n\nBody\n',
    );
  });

  it('lets a custom plugin write its own frontmatter format', async () => {
    const yamlList: Plugin = {
      name: 'yaml-list',
      result: (page) => {
        const tags = page.properties.Tags as string[];
        const head = [
          `title: "${page.title}"`,
          'tags:',
          ...tags.map((tag) => `  - ${tag}`),
        ];
        return {
          ...page,
          content: `---\n${head.join('\n')}\n---\n\n${page.content}`,
        };
      },
    };
    const result = await convertPage(yamlList);
    expect(result.content).toBe(
      '---\ntitle: "Notion Properties as Frontmatter"\ntags:\n  - V4\n  - notion to md\n  - test\n---\n\nBody\n',
    );
  });
});

describe('blog: media handling', () => {
  const notionFile = (path: string) => `${base}${path}?X-Amz-Signature=abc`;
  const withCover = (): Record<string, Property> => ({
    Cover: {
      id: 'cover',
      type: 'files',
      files: [
        {
          name: 'cover.png',
          type: 'file',
          file: { url: notionFile('/s/cover/cover.png'), expiry_time: '' },
        },
      ],
    },
  });
  const blocks = () => [
    mediaBlock('image', notionFile('/s/1/photo.png'), { caption: 'Photo' }),
    mediaBlock('image', 'https://example.com/external.png', { hosted: false }),
  ];

  it('keeps Notion URLs as they are by default (direct strategy)', async () => {
    const result = await convertWith(
      { pages: [{ page: page(), blocks: blocks() }] },
      { renderer: markdown() },
    );
    expect(result.content).toBe(
      `![Photo](${notionFile('/s/1/photo.png')})\n\n![](https://example.com/external.png)\n`,
    );
  });

  it('downloads files and writes URLs from a path function, for blocks only', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'n2m-media-'));
    try {
      const result = await convertWith(
        { pages: [{ page: page(withCover()), blocks: blocks() }] },
        {
          renderer: markdown(),
          plugins: [
            downloadMedia({
              dir,
              include: ['block'],
              publicPath: (path) =>
                `/images/notion/${path.split('/').pop() ?? ''}`,
            }),
            frontmatter({ include: ['Cover'] }),
          ],
        },
      );
      const files = await readdir(dir);
      expect(files).toHaveLength(1);
      expect(result.content).toContain(
        `![Photo](/images/notion/${files[0] ?? ''})`,
      );
      expect(result.content).toContain('![](https://example.com/external.png)');
      expect(result.content).toContain(
        `Cover: ["${notionFile('/s/cover/cover.png')}"]`,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('uploads files with a custom handler (upload strategy)', async () => {
    const uploads: string[] = [];
    const result = await convertWith(
      { pages: [{ page: page(withCover()), blocks: blocks() }] },
      {
        renderer: markdown(),
        plugins: [
          media((asset) => {
            if (!asset.hosted) return undefined;
            uploads.push(`${asset.source}:${asset.kind}:${asset.name}`);
            return `https://cdn.example.com/media/${asset.id}.png`;
          }),
          frontmatter({ include: ['Cover'] }),
        ],
      },
    );
    expect(uploads.sort()).toEqual([
      'block:image:photo.png',
      'page_property:file:cover.png',
    ]);
    expect(result.content).toContain('![Photo](https://cdn.example.com/media/');
    expect(result.content).toContain(
      `Cover: ["https://cdn.example.com/media/${PAGE_ID}/Cover/0.png"]`,
    );
  });

  it('inlines files as data URLs without touching the disk (buffer)', async () => {
    const result = await convertWith(
      { pages: [{ page: page(), blocks: blocks() }] },
      {
        renderer: markdown(),
        plugins: [
          media(async (asset) => {
            if (!asset.hosted) return undefined;
            const bytes = Buffer.from(
              await (await fetch(asset.url)).arrayBuffer(),
            );
            return `data:image/png;base64,${bytes.toString('base64')}`;
          }),
        ],
      },
    );
    const encoded = Buffer.from(
      'file at /s/1/photo.png?X-Amz-Signature=abc',
    ).toString('base64');
    expect(result.content).toContain(
      `![Photo](data:image/png;base64,${encoded})`,
    );
  });
});

describe('blog: documents (PDF)', () => {
  const pdfs = () => [
    paragraph('My resume:'),
    mediaBlock('pdf', `${base}/s/9/resume.pdf?sig=1`, { caption: 'Resume' }),
    mediaBlock('pdf', `${base}/s/8/cover-letter.pdf?sig=1`),
  ];

  /** Fetches each PDF and stores a text preview on the node, for the handler to use. */
  const pdfPreview: Plugin = {
    name: 'pdf-preview',
    async transform(document) {
      await Promise.all(
        select(document, 'media')
          .filter((node) => node.kind === 'pdf')
          .map(async (node) => {
            const body = await (await fetch(node.url)).text();
            node.data = { preview: body.slice(0, 20) };
          }),
      );
    },
  };

  it('shows a preview built by async work in a plugin', async () => {
    const result = await convertWith(
      { pages: [{ page: page(), blocks: pdfs() }] },
      {
        renderer: markdown({
          handlers: {
            media: (node, { fallback }) => {
              const preview = node.data?.preview;
              if (node.kind !== 'pdf' || typeof preview !== 'string')
                return fallback();
              return `<details>\n<summary>${node.name}</summary>\n\n\`\`\`text\n${preview}...\n\`\`\`\n\n[View Full Document](${node.url})\n</details>`;
            },
          },
        }),
        plugins: [pdfPreview],
      },
    );
    expect(result.content).toContain(
      '<summary>resume.pdf</summary>\n\n```text\nfile at /s/9/resume....\n```',
    );
    expect(result.content).toContain('<summary>cover-letter.pdf</summary>');
  });

  it('uses an MDX component and adds its import once', async () => {
    const result = await convertWith(
      { pages: [{ page: page(), blocks: pdfs() }] },
      {
        renderer: mdx({
          handlers: {
            media: (node, { addImport, fallback }) => {
              if (node.kind !== 'pdf') return fallback();
              addImport("import { PDFViewer } from '@/components/PDFViewer';");
              return `<PDFViewer url="${node.url}" />`;
            },
          },
        }),
        plugins: [frontmatter({ include: ['Name'] })],
      },
    );
    expect(result.content).toBe(
      [
        '---',
        'Name: "Test page"',
        '---',
        '',
        "import { PDFViewer } from '@/components/PDFViewer';",
        '',
        'My resume:',
        '',
        `<PDFViewer url="${base}/s/9/resume.pdf?sig=1" />`,
        '',
        `<PDFViewer url="${base}/s/8/cover-letter.pdf?sig=1" />`,
        '',
      ].join('\n'),
    );
    await expect(
      compileMdx(result.content.replace(/^---[\s\S]*?---\n/, '')),
    ).resolves.toBeUndefined();
  });

  it('keeps imports from one page out of the next', async () => {
    const renderer = mdx({
      handlers: {
        media: (node, { addImport, fallback }) => {
          if (node.kind !== 'pdf') return fallback();
          addImport("import { PDFViewer } from '@/components/PDFViewer';");
          return '<PDFViewer />';
        },
      },
    });
    const withPdf = await convertWith(
      { pages: [{ page: page(), blocks: pdfs() }] },
      { renderer },
    );
    const withoutPdf = await convertWith(
      { pages: [{ page: page(), blocks: [paragraph('Plain')] }] },
      { renderer },
    );
    expect(withPdf.content).toContain('import { PDFViewer }');
    expect(withoutPdf.content).toBe('Plain\n');
  });
});

it('downloaded files are readable on disk', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'n2m-read-'));
  try {
    const result = await convertWith(
      {
        pages: [
          {
            page: page(),
            blocks: [mediaBlock('pdf', `${base}/s/7/doc.pdf?sig=2`)],
          },
        ],
      },
      { renderer: markdown(), plugins: [downloadMedia({ dir })] },
    );
    const [asset] = result.assets;
    expect(await readFile(asset?.url ?? '', 'utf8')).toBe(
      'file at /s/7/doc.pdf?sig=2',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
