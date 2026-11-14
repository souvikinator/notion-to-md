import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { Asset, Plugin } from '../core/types';
import { createLimiter } from '../utils/limit';
import { writeAtomic } from './atomic-write';

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

async function download(url: string, path: string): Promise<void> {
  const response = await fetch(url);
  const body = response.body;
  if (!response.ok || !body) {
    throw new Error(`HTTP ${String(response.status)}`);
  }
  await writeAtomic(path, (temporary) =>
    pipeline(Readable.fromWeb(body), createWriteStream(temporary)),
  );
}
