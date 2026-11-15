import { blockChildren, inlineContent, toPlainText } from '../../tree/visit';
import type {
  Block,
  Database,
  Footnote,
  Inline,
  List,
  Marks,
  Media,
  Table,
  Text,
} from '../../tree/types';
import { databaseCells, linkLabel } from '../shared';
import { handlerFor, type Handlers, type Renderer } from '../types';

export interface HtmlOptions {
  handlers?: Handlers;
}

/** Renders the document as an HTML fragment. */
export function html(options: HtmlOptions = {}): Renderer {
  return {
    render: (document) => {
      const html = createHtml(options.handlers ?? {});
      return [
        html.blocks(document.children),
        html.footnotes(document.footnotes ?? []),
      ]
        .filter(Boolean)
        .join('\n');
    },
  };
}

const builtInHtml = createHtml({});

/** Inline nodes as HTML with built-in output only. Used for HTML embedded in other formats. */
export function inlineToHtml(nodes: Inline[]): string {
  return builtInHtml.inline(nodes);
}

function createHtml(handlers: Handlers) {
  const node = (current: Block | Inline): string => {
    const custom = handlerFor(handlers, current);
    const fallback = (): string => builtIn(current);
    const output = custom
      ? custom(current, {
          content: () => inline(inlineContent(current) ?? []),
          children: () => blocks(blockChildren(current)),
          fallback,
        })
      : fallback();
    return current.type === 'text' ? withMarks(current, output) : output;
  };
  const blocks = (nodes: Block[]): string =>
    nodes.map(node).filter(Boolean).join('\n');
  const inline = (nodes: Inline[]): string => nodes.map(node).join('');

  /** A block's own text followed by its nested blocks. */
  const body = (current: Block, tag: string): string => {
    const text = inline(inlineContent(current) ?? []);
    const nested = blocks(blockChildren(current));
    return [text && `<${tag}>${text}</${tag}>`, nested]
      .filter(Boolean)
      .join('\n');
  };

  // A flat switch over every node type keeps the built-in output for each in one place.
  // eslint-disable-next-line complexity
  const builtIn = (current: Block | Inline): string => {
    switch (current.type) {
      case 'text':
        return escapeHtml(current.value);
      case 'link':
      case 'pageLink':
        return anchor(current.url, inline(current.children));
      case 'inlineEquation':
        return `<span class="math math-inline">${escapeHtml(current.value)}</span>`;
      case 'break':
        return '<br />';
      case 'footnoteReference':
        return `<sup><a href="#fn-${escapeAttribute(current.label)}" id="fnref-${escapeAttribute(current.label)}">${escapeHtml(current.label)}</a></sup>`;
      case 'paragraph':
        return body(current, 'p');
      case 'heading': {
        const heading = `<h${current.level}>${inline(current.content)}</h${current.level}>`;
        if (!current.toggleable) return heading;
        return details(
          `<summary>${heading}</summary>`,
          blocks(current.children),
        );
      }
      case 'list':
        return list(current, blocks);
      case 'listItem': {
        const checkbox =
          current.checked === undefined
            ? ''
            : `<input type="checkbox" disabled${current.checked ? ' checked' : ''} /> `;
        const nested = blocks(current.children);
        return `<li>${checkbox}${inline(current.content)}${nested && `\n${nested}\n`}</li>`;
      }
      case 'quote':
        return `<blockquote>\n${body(current, 'p')}\n</blockquote>`;
      case 'callout': {
        const icon = current.icon ? `${escapeHtml(current.icon)} ` : '';
        const text = `<p>${icon}${inline(current.content)}</p>`;
        return `<aside class="callout">\n${[text, blocks(current.children)].filter(Boolean).join('\n')}\n</aside>`;
      }
      case 'toggle':
        return details(
          `<summary>${inline(current.content)}</summary>`,
          blocks(current.children),
        );
      case 'code':
        return figure(
          `<pre><code class="language-${escapeAttribute(current.language)}">${escapeHtml(current.value)}</code></pre>`,
          inline(current.caption),
        );
      case 'equation':
        return `<div class="math math-display">${escapeHtml(current.value)}</div>`;
      case 'divider':
        return '<hr />';
      case 'table':
        return table(current, inline);
      case 'columns':
        return `<div class="columns">\n${blocks(current.children)}\n</div>`;
      case 'column':
        return `<div class="column">\n${blocks(current.children)}\n</div>`;
      case 'media':
        return media(current, inline);
      case 'embed':
        return `<p>${anchor(current.url, inline(current.caption) || escapeHtml(linkLabel(current)))}</p>`;
      case 'pageRef':
        return `<p>${anchor(current.url, escapeHtml(linkLabel(current)))}</p>`;
      case 'database':
        return database(current);
      case 'tableOfContents':
      case 'unknown':
        return '';
    }
  };

  const footnotes = (notes: Footnote[]): string => {
    if (notes.length === 0) return '';
    const items = notes.map(
      ({ label, content }) =>
        `<li id="fn-${escapeAttribute(label)}">${inline(content)} <a href="#fnref-${escapeAttribute(label)}">↩</a></li>`,
    );
    return `<section class="footnotes">\n<ol>\n${items.join('\n')}\n</ol>\n</section>`;
  };

  return { blocks, footnotes, inline };
}

function details(summary: string, content: string): string {
  return ['<details>', summary, content, '</details>']
    .filter(Boolean)
    .join('\n');
}

function list(node: List, blocks: (nodes: Block[]) => string): string {
  if (node.kind !== 'numbered') return `<ul>\n${blocks(node.children)}\n</ul>`;
  const start = node.start === 1 ? '' : ` start="${node.start}"`;
  const type =
    node.style === 'letters'
      ? ' type="a"'
      : node.style === 'roman'
        ? ' type="i"'
        : '';
  return `<ol${start}${type}>\n${blocks(node.children)}\n</ol>`;
}

function table(node: Table, inline: (nodes: Inline[]) => string): string {
  const row = (cells: Inline[][], header: boolean): string => {
    const html = cells.map((cell, index) => {
      if (header) return `<th>${inline(cell)}</th>`;
      if (node.rowHeader && index === 0)
        return `<th scope="row">${inline(cell)}</th>`;
      return `<td>${inline(cell)}</td>`;
    });
    return `<tr>${html.join('')}</tr>`;
  };
  const [first, ...rest] = node.rows;
  const head =
    node.columnHeader && first
      ? `<thead>\n${row(first.cells, true)}\n</thead>\n`
      : '';
  const bodyRows = node.columnHeader ? rest : node.rows;
  const body = bodyRows.map((current) => row(current.cells, false)).join('\n');
  return `<table>\n${head}<tbody>\n${body}\n</tbody>\n</table>`;
}

function media(node: Media, inline: (nodes: Inline[]) => string): string {
  const url = escapeAttribute(node.url);
  const caption = inline(node.caption);
  const label = caption || escapeHtml(linkLabel(node));
  switch (node.kind) {
    case 'image': {
      const image = `<img src="${url}" alt="${escapeAttribute(toPlainText(node.caption))}" />`;
      return figure(image, caption);
    }
    case 'video':
      return node.hosted
        ? `<video controls src="${url}"></video>`
        : `<p>${anchor(node.url, label)}</p>`;
    case 'audio':
      return `<audio controls src="${url}"></audio>`;
    case 'file':
    case 'pdf':
      return `<p>${anchor(node.url, label)}</p>`;
  }
}

function database(node: Database): string {
  const title = `<p>${anchor(node.url, escapeHtml(linkLabel(node)))}</p>`;
  if (node.rows.length === 0) return title;
  const head = node.columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join('');
  const rows = databaseCells(node).map((cells) => {
    const html = cells.map(({ text, url }) => {
      const value = escapeHtml(text);
      return `<td>${url ? anchor(url, value) : value}</td>`;
    });
    return `<tr>${html.join('')}</tr>`;
  });
  return `${title}\n<table>\n<thead>\n<tr>${head}</tr>\n</thead>\n<tbody>\n${rows.join('\n')}\n</tbody>\n</table>`;
}

function figure(content: string, caption: string): string {
  return caption
    ? `<figure>\n${content}\n<figcaption>${caption}</figcaption>\n</figure>`
    : content;
}

function anchor(url: string, label: string): string {
  return `<a href="${escapeAttribute(url)}">${label}</a>`;
}

const MARK_TAGS: [keyof Marks, string][] = [
  ['code', 'code'],
  ['underline', 'u'],
  ['strikethrough', 's'],
  ['italic', 'em'],
  ['bold', 'strong'],
];

function withMarks(node: Text, content: string): string {
  let html = content;
  for (const [mark, tag] of MARK_TAGS) {
    if (node.marks[mark]) html = `<${tag}>${html}</${tag}>`;
  }
  if (node.marks.color)
    html = `<span class="color-${escapeAttribute(node.marks.color)}">${html}</span>`;
  return html;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', '&quot;');
}
