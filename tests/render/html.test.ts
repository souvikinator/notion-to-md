import { describe, expect, it } from 'vitest';
import { html } from '../../src/render/html/index';
import { convertBlocks, toHtml } from '../helpers/convert';
import {
  bookmark,
  bullet,
  callout,
  childPage,
  code,
  columns,
  equation,
  heading,
  media,
  numbered,
  paragraph,
  table,
  text,
  todo,
  toggle,
} from '../helpers/notion';

describe('html', () => {
  it('escapes text and attributes', async () => {
    expect(
      await toHtml([
        paragraph([text('<b> & "q"', { link: 'https://a.com/?x="1"' })]),
      ]),
    ).toBe(
      '<p><a href="https://a.com/?x=&quot;1&quot;">&lt;b&gt; &amp; "q"</a></p>',
    );
  });

  it('renders marks and colors', async () => {
    expect(
      await toHtml([
        paragraph([
          text('x', {
            bold: true,
            italic: true,
            code: true,
            color: 'red_background',
          }),
        ]),
      ]),
    ).toBe(
      '<p><span class="color-red_background"><strong><em><code>x</code></em></strong></span></p>',
    );
  });

  it('renders nested lists and to-dos', async () => {
    expect(
      await toHtml([bullet('a', [numbered('one')]), todo(true, 'done')]),
    ).toBe(
      '<ul>\n<li>a\n<ol>\n<li>one</li>\n</ol>\n</li>\n</ul>\n<ul>\n<li><input type="checkbox" disabled checked /> done</li>\n</ul>',
    );
  });

  it('renders toggles, toggle headings and callouts', async () => {
    expect(await toHtml([toggle('T', [paragraph('in')])])).toBe(
      '<details>\n<summary>T</summary>\n<p>in</p>\n</details>',
    );
    expect(await toHtml([heading(2, 'H', [paragraph('in')])])).toContain(
      '<summary><h2>H</h2></summary>',
    );
    expect(await toHtml([callout('💡', 'tip')])).toBe(
      '<aside class="callout">\n<p>💡 tip</p>\n</aside>',
    );
  });

  it('renders code with a language class, escaped', async () => {
    expect(await toHtml([code('a < b', 'typescript')])).toBe(
      '<pre><code class="language-typescript">a &lt; b</code></pre>',
    );
  });

  it('renders tables with header rows and header columns', async () => {
    expect(await toHtml([table([['h'], ['a']], { rowHeader: true })])).toBe(
      '<table>\n<thead>\n<tr><th>h</th></tr>\n</thead>\n<tbody>\n<tr><th scope="row">a</th></tr>\n</tbody>\n</table>',
    );
  });

  it('renders images with captions as figures', async () => {
    expect(
      await toHtml([
        media('image', 'https://a.com/p.png', {
          caption: 'Cap',
          hosted: false,
        }),
      ]),
    ).toBe(
      '<figure>\n<img src="https://a.com/p.png" alt="Cap" />\n<figcaption>Cap</figcaption>\n</figure>',
    );
  });
});

describe('html review fixes', () => {
  it('wraps code with a caption in a figure', async () => {
    const block = code('x', 'js', 'Example');
    expect(await toHtml([block])).toBe(
      '<figure>\n<pre><code class="language-js">x</code></pre>\n<figcaption>Example</figcaption>\n</figure>',
    );
  });

  it('applies handlers to blocks and inline nodes', async () => {
    const result = await convertBlocks(
      [callout('💡', [text('see', { link: 'https://a.com' })])],
      {
        renderer: html({
          handlers: {
            callout: (_, { content }) => `<Note>${content()}</Note>`,
            link: (node, { content }) =>
              `<a class="ext" href="${node.url}">${content()}</a>`,
          },
        }),
      },
    );
    expect(result.content).toBe(
      '<Note><a class="ext" href="https://a.com">see</a></Note>',
    );
  });

  it('renders equations, columns, embeds and page links', async () => {
    const output = await toHtml([
      equation('x^2'),
      columns([paragraph('l')], [paragraph('r')]),
      bookmark('https://example.com'),
      childPage('Sub'),
    ]);
    expect(output).toContain('<div class="math math-display">x^2</div>');
    expect(output).toContain(
      '<div class="columns">\n<div class="column">\n<p>l</p>\n</div>',
    );
    expect(output).toContain(
      '<p><a href="https://example.com">https://example.com</a></p>',
    );
    expect(output).toMatch(
      /<p><a href="https:\/\/www\.notion\.so\/[0-9a-f]{32}">Sub<\/a><\/p>/,
    );
  });

  it('lets a text handler change the words while formatting stays', async () => {
    const result = await convertBlocks(
      [paragraph([text('shout', { bold: true })])],
      {
        renderer: html({
          handlers: { text: (node) => node.value.toUpperCase() },
        }),
      },
    );
    expect(result.content).toBe('<p><strong>SHOUT</strong></p>');
  });
});
