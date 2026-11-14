import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Writes through a temporary file that is renamed into place, so an interrupted write
 * never leaves a half-written file at `path`.
 */
export async function writeAtomic(
  path: string,
  write: (temporaryPath: string) => Promise<void>,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await write(temporary);
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}
