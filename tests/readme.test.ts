/**
 * The README examples, run against a mock Notion workspace so the docs cannot drift from the API.
 */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import {
  cached,
  fromBlocks,
  notion,
  notionToMd,
  type Plugin,
} from '../src/index';
import { markdown } from '../src/render/markdown/index';
import { mdx } from '../src/render/mdx/index';
import { fileCache, writeFile } from '../src/node/index';
import { frontmatter, pageLinks } from '../src/plugins/index';
import { mockClient } from './helpers/client';
import {
  callout,
  page,
  pageMention,
  paragraph,
  text,
  titleProperty,
  type Property,
} from './helpers/notion';

const postId = (n: number) => `5000000${String(n)}-0000-4000-8000-000000000000`;
const slug = (value: string) =>
  ({ id: 's', type: 'rich_text', rich_text: [text(value)] }) as Property;

it('quick start', async () => {
  const { client } = mockClient({
    pages: [{ page: page(), blocks: [paragraph('Hello')] }],
  });
  const n2m = notionToMd({ source: notion(client), renderer: markdown() });
  const result = await n2m.convert(
    'https://www.notion.so/My-Page-11111111111141118111111111111111',
  );
  expect(result.content).toBe('Hello\n');
});

it('a blog from a Notion database', async () => {
  const rows = [1, 2].map((n) =>
    page(
      {
        Name: titleProperty(`Post ${String(n)}`),
        Slug: slug(`post-${String(n)}`),
      },
      postId(n),
    ),
  );
  const { client } = mockClient({
    pages: [
      {
        page: rows[0]!,
        blocks: [
          paragraph([text('See '), pageMention(postId(2), 'the next post')]),
        ],
      },
      { page: rows[1]!, blocks: [paragraph('Second')] },
    ],
    databases: { db: { title: 'Blog', schema: {}, rows } },
  });
  const dir = await mkdtemp(join(tmpdir(), 'n2m-readme-'));
  try {
    const blog = notionToMd({
      source: notion(client),
      renderer: mdx(),
      plugins: [
        pageLinks((link, { site }) => {
          const value = site.get(link.pageId)?.properties.Slug;
          return typeof value === 'string' ? `/blog/${value}` : undefined;
        }),
        frontmatter({ rename: { Name: 'title' } }),
      ],
    });
    for await (const post of blog.pages('db')) {
      await writeFile(post, join(dir, `${post.properties.Slug as string}.mdx`));
    }
    expect(await readFile(join(dir, 'post-1.mdx'), 'utf8')).toBe(
      '---\ntitle: "Post 1"\nSlug: "post-1"\n---\n\nSee [the next post](/blog/post-2)\n',
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

it('custom output and plugins', async () => {
  const plugin: Plugin = {
    name: 'my-plugin',
    transform(tree) {
      tree.title = tree.title.trim();
    },
    result: (page) => page,
  };
  const result = await notionToMd({
    source: fromBlocks({
      blocks: [callout('💡', 'Tip', [paragraph('More')])],
      page: page(),
    }),
    renderer: markdown({
      handlers: {
        callout: (node, { content, children }) =>
          `:::note ${node.icon ?? ''}\n${content()}\n\n${children()}\n:::`,
      },
    }),
    plugins: [plugin],
  }).convert('11111111-1111-4111-8111-111111111111');
  expect(result.content).toBe(':::note 💡\nTip\n\nMore\n:::\n');
});

it('caching', async () => {
  const { client } = mockClient({
    pages: [{ page: page(), blocks: [paragraph('Hi')] }],
  });
  const dir = await mkdtemp(join(tmpdir(), 'n2m-cache-'));
  try {
    const source = cached(notion(client), fileCache(dir));
    const n2m = notionToMd({ source, renderer: markdown() });
    expect(
      (await n2m.convert('11111111-1111-4111-8111-111111111111')).content,
    ).toBe('Hi\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
