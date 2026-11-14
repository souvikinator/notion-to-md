import { mdxToMarkdown } from 'mdast-util-mdx';
import {
  createMarkdownRenderer,
  type MarkdownOptions,
} from '../markdown/convert';
import type { Renderer } from '../types';

export type MdxOptions = MarkdownOptions;

/** Renders the document as MDX. Characters MDX reads as JSX (`{`, `}`, `<`) are always escaped in text. */
export function mdx(options: MdxOptions = {}): Renderer {
  return createMarkdownRenderer(options, {
    extensions: [mdxToMarkdown()],
    escapeText: escapeJsxCharacters,
  });
}

function escapeJsxCharacters(value: string): string {
  return value.replace(
    /[{}<]/g,
    (character) => `&#${String(character.charCodeAt(0))};`,
  );
}
