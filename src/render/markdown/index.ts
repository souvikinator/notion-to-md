import type { Renderer } from '../types';
import { createMarkdownRenderer, type MarkdownOptions } from './convert';

export type { MarkdownOptions } from './convert';

/** Renders the document as GitHub Flavored Markdown. */
export function markdown(options: MarkdownOptions = {}): Renderer {
  return createMarkdownRenderer(options);
}
