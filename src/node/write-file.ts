import { mkdir, writeFile as write } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Page } from '../core/types';

/** Writes the page content to `path`, creating folders as needed. */
export async function writeFile(
  page: Pick<Page, 'content'>,
  path: string,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await write(path, page.content);
}
