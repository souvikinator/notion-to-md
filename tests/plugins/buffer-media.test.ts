import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { select } from '../../src/index';
import { bufferMedia } from '../../src/plugins/index';
import { convertBlocks } from '../helpers/convert';
import { media, page, type Property } from '../helpers/notion';

let server: Server;
let base: string;
const requests: string[] = [];

beforeAll(async () => {
  server = createServer((request, response) => {
    const url = request.url ?? '';
    requests.push(url);
    if (url.startsWith('/missing')) {
      response.writeHead(404).end();
      return;
    }
    if (url.startsWith('/big-streamed')) {
      // No content-length: the size is only known while reading.
      response.writeHead(200, { 'transfer-encoding': 'chunked' });
      response.write('x'.repeat(60));
      response.end('x'.repeat(60));
      return;
    }
    const body = url.startsWith('/big') ? 'x'.repeat(120) : `bytes of ${url}`;
    response
      .writeHead(200, { 'content-length': String(body.length) })
      .end(body);
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

const text = (buffer: unknown): string =>
  new TextDecoder().decode(buffer as Uint8Array);

describe('bufferMedia', () => {
  it('puts the bytes of blocks and property files on their data', async () => {
    const result = await convertBlocks(
      [media('pdf', `${base}/s/1/doc.pdf?sig=1`)],
      {
        pageObject: page({
          Files: {
            id: 'f',
            type: 'files',
            files: [
              {
                name: 'a.png',
                type: 'file',
                file: { url: `${base}/s/2/a.png?sig=1`, expiry_time: '' },
              },
            ],
          } as Property,
        }),
        plugins: [bufferMedia()],
      },
    );
    const [pdf] = select(result.tree, 'media');
    expect(text(pdf?.data?.buffer)).toBe('bytes of /s/1/doc.pdf?sig=1');
    const [file] = result.tree.properties.Files as {
      data?: { buffer?: unknown };
    }[];
    expect(text(file?.data?.buffer)).toBe('bytes of /s/2/a.png?sig=1');
    expect(result.content).toContain(`${base}/s/1/doc.pdf?sig=1`);
  });

  it('leaves files over the size limit with only their URL', async () => {
    const result = await convertBlocks(
      [
        media('image', `${base}/big.png?sig=1`),
        media('image', `${base}/big-streamed.png?sig=1`),
        media('image', `${base}/small.png?sig=1`),
      ],
      { plugins: [bufferMedia({ maxSize: 100 })] },
    );
    const [big, streamed, small] = select(result.tree, 'media');
    expect(big?.data).toBeUndefined();
    expect(streamed?.data).toBeUndefined();
    expect(text(small?.data?.buffer)).toBe('bytes of /small.png?sig=1');
  });

  it('fetches only the files asked for', async () => {
    requests.length = 0;
    await convertBlocks(
      [
        media('image', `${base}/s/3/hosted.png?sig=1`),
        media('image', `${base}/external.png`, { hosted: false }),
      ],
      { plugins: [bufferMedia({ include: ['page_property'] })] },
    );
    expect(requests).toEqual([]);
    await convertBlocks(
      [
        media('image', `${base}/s/3/hosted.png?sig=1`),
        media('image', `${base}/external.png`, { hosted: false }),
      ],
      { plugins: [bufferMedia()] },
    );
    expect(requests).toEqual(['/s/3/hosted.png?sig=1']);
  });

  it('stops the conversion when a fetch fails', async () => {
    await expect(
      convertBlocks([media('image', `${base}/missing.png?sig=1`)], {
        plugins: [bufferMedia()],
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Could not fetch image') as string,
      cause: { message: 'HTTP 404' },
    });
  });
});
