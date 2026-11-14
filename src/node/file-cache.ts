import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CacheEntry, CacheStore } from '../source/cached';
import { writeAtomic } from './atomic-write';

/** A cache store for `cached()` that keeps one JSON file per page in `dir`. */
export function fileCache(dir: string): CacheStore {
  const pathFor = (pageId: string): string => join(dir, `${pageId}.json`);

  return {
    async get(pageId) {
      try {
        return JSON.parse(
          await readFile(pathFor(pageId), 'utf8'),
        ) as CacheEntry;
      } catch (error) {
        if (isMissingFile(error) || error instanceof SyntaxError)
          return undefined;
        throw error;
      }
    },
    async set(pageId, entry) {
      await writeAtomic(pathFor(pageId), (path) =>
        writeFile(path, JSON.stringify(entry)),
      );
    },
  };
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
