import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { access, mkdir, rename, rm } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { Asset, Plugin } from '../core/types';
import { createLimiter } from '../utils/limit';

export interface DownloadMediaOptions {
  /** Folder to save files in. */
  dir: string;
  /** URL prefix used in the output instead of the file path, e.g. `/images`. */
  publicPath?: string;
  /** Also download files hosted outside Notion. Default false: their URLs do not expire. */
  external?: boolean;
  /** Downloads in flight at once. Default 4. */
  concurrency?: number;
}

/**
 * Saves files to disk so the output does not depend on Notion's expiring URLs.
 * File names come from a hash of the source file, so unchanged files are not downloaded again.
 */
export function downloadMedia(options: DownloadMediaOptions): Plugin {
  const limit = createLimiter(options.concurrency ?? 4);

  return {
    name: 'download-media',
    async resolveAsset(asset, context) {
      if (!asset.hosted && !options.external) return undefined;
      const fileName = fileNameFor(asset);
      const path = join(options.dir, fileName);
      try {
        if (!(await exists(path))) await limit(() => download(asset.url, path));
      } catch (error) {
        context.warn(
          `Could not download ${asset.kind} ${asset.id}: ${String(error)}`,
        );
        return undefined;
      }
      return options.publicPath === undefined
        ? path
        : `${options.publicPath.replace(/\/+$/, '')}/${fileName}`;
    },
  };
}

/**
 * Notion signs its file URLs with a query string that changes on every request, so only the
 * path identifies the file. External URLs are used whole.
 */
function fileNameFor(asset: Asset): string {
  const url = new URL(asset.url);
  const key = asset.hosted ? url.pathname : url.href;
  const hash = createHash('sha256').update(key).digest('hex').slice(0, 16);
  return `${hash}${extname(url.pathname).toLowerCase()}`;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Streams to a temporary file first, so an interrupted download never leaves a broken file behind. */
async function download(url: string, path: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body)
    throw new Error(`HTTP ${String(response.status)}`);
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await pipeline(
      Readable.fromWeb(response.body),
      createWriteStream(temporary),
    );
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}
