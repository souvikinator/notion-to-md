import type { Plugin } from '../core/types';
import { files, type FileSource } from '../tree/files';
import { createLimiter } from '../utils/limit';

export interface BufferMediaOptions {
  /** Largest file kept in memory, in bytes. Larger files keep only their URL. Default 5 MB. */
  maxSize?: number;
  /** Which files to fetch, by where they appear. Default: all. */
  include?: FileSource[];
  /** Also fetch files hosted outside Notion. Default false. */
  external?: boolean;
  /** Fetches in flight at once. Default 4. */
  concurrency?: number;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/**
 * Fetches files into memory, for handlers that embed or parse them, without writing to disk.
 * The bytes are put on the file's `data.buffer` as a `Uint8Array`. A failed fetch stops the conversion.
 */
export function bufferMedia(options: BufferMediaOptions = {}): Plugin {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
  const limit = createLimiter(options.concurrency ?? 4);

  return {
    name: 'buffer-media',
    async transform(document) {
      const wanted = files(document).filter(
        ({ source, file }) =>
          (file.hosted || options.external) &&
          (!options.include || options.include.includes(source)),
      );
      await Promise.all(
        wanted.map(async ({ id, kind, file }) => {
          const buffer = await limit(() => fetchUpTo(file.url, maxSize)).catch(
            (error: unknown) => {
              throw new Error(`Could not fetch ${kind} ${id} (${file.url})`, {
                cause: error,
              });
            },
          );
          if (buffer) file.data = { ...file.data, buffer };
        }),
      );
    },
  };
}

/** The file's bytes, or `undefined` when it is larger than `maxSize`. Stops reading as soon as it is. */
async function fetchUpTo(
  url: string,
  maxSize: number,
): Promise<Uint8Array | undefined> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${String(response.status)}`);
  }
  if (Number(response.headers.get('content-length')) > maxSize) {
    await response.body.cancel();
    return undefined;
  }

  // Node's fetch types leave the stream's chunk type as `any`; fetch bodies are always bytes.
  const reader =
    response.body.getReader() as ReadableStreamDefaultReader<Uint8Array>;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (
    let chunk = await reader.read();
    !chunk.done;
    chunk = await reader.read()
  ) {
    size += chunk.value.byteLength;
    if (size > maxSize) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(chunk.value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer;
}
