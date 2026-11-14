import type { RichTextItemResponse } from '@notionhq/client';
import { normalizeId, notionUrl, parseNotionUrl } from './ids';
import type { Inline, Marks } from './types';

type Annotations = RichTextItemResponse['annotations'];
type Mention = Extract<RichTextItemResponse, { type: 'mention' }>['mention'];
type LinkLike = Extract<Inline, { type: 'link' | 'pageLink' }>;

export function richText(items: RichTextItemResponse[]): Inline[] {
  const nodes: Inline[] = [];
  for (const item of items) {
    for (const node of itemToInline(item)) appendMerged(nodes, node);
  }
  return nodes;
}

export function plainText(items: RichTextItemResponse[]): string {
  return items.map((item) => item.plain_text).join('');
}

function itemToInline(item: RichTextItemResponse): Inline[] {
  switch (item.type) {
    case 'equation':
      return [{ type: 'inlineEquation', value: item.equation.expression }];
    case 'mention':
      return mentionToInline(
        item.mention,
        item.plain_text,
        marksOf(item.annotations),
      );
    case 'text':
      return withLink(
        textNodes(item.plain_text, marksOf(item.annotations)),
        item.href,
      );
  }
}

function mentionToInline(
  mention: Mention,
  label: string,
  marks: Marks,
): Inline[] {
  const children = textNodes(label, marks);
  switch (mention.type) {
    case 'page':
      return [pageLink(normalizeId(mention.page.id), children)];
    case 'database':
      return [pageLink(normalizeId(mention.database.id), children)];
    case 'link_preview':
      return withLink(children, mention.link_preview.url);
    case 'link_mention':
      return withLink(
        textNodes(mention.link_mention.title ?? label, marks),
        mention.link_mention.href,
      );
    case 'user':
    case 'date':
    case 'template_mention':
    case 'custom_emoji':
      return children;
  }
}

/** Wraps nodes in a page link when `href` points at a Notion page, otherwise in a normal link. */
function withLink(children: Inline[], href: string | null): Inline[] {
  if (!href) return children;
  const target = parseNotionUrl(href);
  if (target) return [pageLink(target.pageId, children, target.blockId)];
  return [{ type: 'link', url: href, children }];
}

function pageLink(
  pageId: string,
  children: Inline[],
  blockId?: string,
): Inline {
  const url = notionUrl(pageId, blockId);
  return blockId
    ? { type: 'pageLink', pageId, blockId, url, children }
    : { type: 'pageLink', pageId, url, children };
}

/** Splits text on newlines so line breaks become explicit `break` nodes. */
function textNodes(value: string, marks: Marks): Inline[] {
  const nodes: Inline[] = [];
  value.split('\n').forEach((line, index) => {
    if (index > 0) nodes.push({ type: 'break' });
    if (line) nodes.push({ type: 'text', value: line, marks: { ...marks } });
  });
  return nodes;
}

function marksOf(annotations: Annotations): Marks {
  const marks: Marks = {};
  if (annotations.bold) marks.bold = true;
  if (annotations.italic) marks.italic = true;
  if (annotations.strikethrough) marks.strikethrough = true;
  if (annotations.underline) marks.underline = true;
  if (annotations.code) marks.code = true;
  if (annotations.color !== 'default') marks.color = annotations.color;
  return marks;
}

/** Notion splits text into pieces per formatting change; neighbouring pieces with the same link become one link. */
function appendMerged(nodes: Inline[], node: Inline): void {
  const previous = nodes.at(-1);
  if (
    previous &&
    isLink(previous) &&
    isLink(node) &&
    previous.type === node.type &&
    previous.url === node.url
  ) {
    previous.children.push(...node.children);
    return;
  }
  nodes.push(node);
}

function isLink(node: Inline): node is LinkLike {
  return node.type === 'link' || node.type === 'pageLink';
}
