import { createServer, type Server } from 'node:http';
import {
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile as write,
} from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { downloadMedia, fileCache, writeFile } from '../../src/node/index';
import type { Asset, PluginContext } from '../../src/index';
import { convertBlocks } from '../helpers/convert';
import { media } from '../helpers/notion';

let server: Server;
let base: string;
const requests: string[] = [];

beforeAll(async () => {
  server = createServer((request, response) => {
    requests.push(request.url ?? '');
    if (request.url?.startsWith('/missing')) {
      response.writeHead(404).end();
      return;
    }
    response
      .writeHead(200, { 'content-type': 'image/png' })
      .end(`content of ${request.url ?? ''}`);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    }),
  );
});

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'n2m-'));
  requests.length = 0;
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const context = (): PluginContext & { warnings: string[] } => {
  const warnings: string[] = [];
  return {
    warnings,
    site: new Map(),
    warn: (message) => {
      warnings.push(message);
    },
  };
};

const asset = (path: string, query = '?sig=1', hosted = true): Asset => ({
  id: 'block',
  kind: 'image',
  url: `${base}${path}${query}`,
  name: 'pic.png',
  hosted,
  source: 'block',
  pageId: 'page',
});

describe('downloadMedia', () => {
  it('downloads every Notion-hosted file on a page, not just one (#163)', async () => {
    const result = await convertBlocks(
      [
        media('image', `${base}/s/1/a.png?sig=x`),
        media('image', `${base}/s/2/b.png?sig=y`),
        media('image', `${base}/s/3/c.jpg?sig=z`),
      ],
      { plugins: [downloadMedia({ dir, publicPath: '/images' })] },
    );
    expect((await readdir(dir)).sort()).toHaveLength(3);
    expect(result.content).toMatch(
      /!\[\]\(\/images\/[0-9a-f]{16}\.png\)\n\n!\[\]\(\/images\/[0-9a-f]{16}\.png\)\n\n!\[\]\(\/images\/[0-9a-f]{16}\.jpg\)\n/,
    );
    expect(result.warnings).toEqual([]);
  });

  it('names files by their Notion path, so a new signature does not download again', async () => {
    const plugin = downloadMedia({ dir });
    const first = await plugin.resolveAsset?.(
      asset('/s/1/a.png', '?sig=one'),
      context(),
    );
    const second = await plugin.resolveAsset?.(
      asset('/s/1/a.png', '?sig=two'),
      context(),
    );
    expect(first).toBe(second);
    expect(requests).toHaveLength(1);
    expect(await readFile(first ?? '', 'utf8')).toBe(
      'content of /s/1/a.png?sig=one',
    );
  });

  it('leaves external files alone unless asked', async () => {
    const external = asset('/ext.png', '', false);
    expect(
      await downloadMedia({ dir }).resolveAsset?.(external, context()),
    ).toBeUndefined();
    expect(
      await downloadMedia({ dir, external: true }).resolveAsset?.(
        external,
        context(),
      ),
    ).toMatch(/\.png$/);
  });

  it('warns and keeps the original URL when a download fails', async () => {
    const ctx = context();
    expect(
      await downloadMedia({ dir }).resolveAsset?.(asset('/missing.png'), ctx),
    ).toBeUndefined();
    expect(ctx.warnings[0]).toContain('HTTP 404');
    expect(await readdir(dir)).toEqual([]);
  });
});

describe('writeFile', () => {
  it('creates folders and writes the content', async () => {
    const path = join(dir, 'a', 'b', 'page.md');
    await writeFile({ content: '# Hi\n' }, path);
    expect(await readFile(path, 'utf8')).toBe('# Hi\n');
  });
});

describe('fileCache', () => {
  it('stores one entry per page and reads it back', async () => {
    const store = fileCache(join(dir, 'cache'));
    expect(await store.get('page')).toBeUndefined();
    await store.set('page', { editedAt: 'a', blocks: [] });
    await store.set('page', { editedAt: 'b', blocks: [] });
    expect(await store.get('page')).toEqual({ editedAt: 'b', blocks: [] });
    expect(await readdir(join(dir, 'cache'))).toEqual(['page.json']);
  });

  it('treats a corrupt file as a miss', async () => {
    const store = fileCache(dir);
    await write(join(dir, 'page.json'), '{not json');
    expect(await store.get('page')).toBeUndefined();
  });
});

describe('downloadMedia review fixes', () => {
  it('warns instead of failing on a URL it cannot read', async () => {
    const ctx = context();
    const broken = { ...asset('/x.png'), url: 'not a url' };
    expect(
      await downloadMedia({ dir }).resolveAsset?.(broken, ctx),
    ).toBeUndefined();
    expect(ctx.warnings[0]).toContain('Could not download');
  });
});
