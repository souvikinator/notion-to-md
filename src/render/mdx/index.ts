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
    escapeText: (text) => escapeCharacters(text, /[{}<]/g),
    // Embedded HTML already escapes `<` in text; braces would still start a JSX expression.
    escapeHtml: (html) => escapeCharacters(html, /[{}]/g),
  });
}

function escapeCharacters(value: string, characters: RegExp): string {
  return value.replace(
    characters,
    (character) => `&#${String(character.charCodeAt(0))};`,
  );
}
