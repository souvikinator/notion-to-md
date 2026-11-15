import { mdxToMarkdown } from 'mdast-util-mdx';
import {
  createMarkdownRenderer,
  type MarkdownOptions,
} from '../markdown/convert';
import type { MdxHandlerHelpers, Renderer } from '../types';

/** Handlers here can also call `addImport()`; imports are written at the top of the output. */
export type MdxOptions = MarkdownOptions<MdxHandlerHelpers>;

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
