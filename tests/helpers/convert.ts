import type { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { compile, evaluate } from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { createElement } from 'react';
import {
  notionToMd,
  type Page,
  type Plugin,
  type Renderer,
} from '../../src/index';
import { html } from '../../src/render/html/index';
import {
  markdown,
  type MarkdownOptions,
} from '../../src/render/markdown/index';
import { mdx } from '../../src/render/mdx/index';
import { fromBlocks } from '../../src/source/from-blocks';
import type { RawBlock } from '../../src/source/types';
import { page } from './notion';

interface ConvertOptions {
  renderer?: Renderer;
  plugins?: Plugin[];
  pageObject?: ReturnType<typeof page>;
}

export async function convertBlocks(
  blocks: RawBlock[],
  options: ConvertOptions = {},
): Promise<Page> {
  return notionToMd({
    source: fromBlocks({ blocks, page: options.pageObject ?? page() }),
    renderer: options.renderer ?? markdown(),
    plugins: options.plugins ?? [],
  }).convert('11111111-1111-4111-8111-111111111111');
}

export async function toMd(
  blocks: RawBlock[],
  options: MarkdownOptions = {},
): Promise<string> {
  return (await convertBlocks(blocks, { renderer: markdown(options) })).content;
}

export async function toMdx(
  blocks: RawBlock[],
  options: MarkdownOptions = {},
): Promise<string> {
  return (await convertBlocks(blocks, { renderer: mdx(options) })).content;
}

export async function toHtml(blocks: RawBlock[]): Promise<string> {
  return (await convertBlocks(blocks, { renderer: html() })).content;
}

/** Parses Markdown the way GitHub does (CommonMark + GFM), to check what output really means. */
export function parseMarkdown(value: string): Root {
  return fromMarkdown(value, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
}

/** Renders Markdown to HTML the way GitHub does: CommonMark + GFM, with raw HTML allowed. */
export function renderMarkdown(value: string): string {
  return micromark(value, {
    allowDangerousHtml: true,
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
}

/** MDX sites need these for GFM tables, task lists and equations, so tests use them too. */
const remarkPlugins = [remarkGfm, remarkMath];

/** Throws if the MDX does not compile. */
export async function compileMdx(value: string): Promise<void> {
  await compile(value, { remarkPlugins });
}

/** Runs MDX through React and returns the HTML a reader would see. */
export async function renderMdx(value: string): Promise<string> {
  const { default: Content } = await evaluate(value, {
    ...runtime,
    remarkPlugins,
  });
  return renderToStaticMarkup(createElement(Content));
}

/** Plain text of every node of `type`, in order. */
export function textsOf(tree: Root, type: string): string[] {
  const found: string[] = [];
  const walk = (node: {
    type: string;
    value?: string;
    children?: unknown[];
  }): void => {
    if (node.type === type) found.push(collectText(node));
    for (const child of (node.children ?? []) as (typeof node)[]) walk(child);
  };
  walk(tree);
  return found;
}

function collectText(node: { value?: string; children?: unknown[] }): string {
  if (typeof node.value === 'string') return node.value;
  return ((node.children ?? []) as { value?: string; children?: unknown[] }[])
    .map(collectText)
    .join('');
}
