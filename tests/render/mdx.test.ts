import { describe, expect, it } from 'vitest';
import { kitchenSink } from '../helpers/fixtures';
import { compileMdx, renderMdx, toMdx } from '../helpers/convert';
import {
  bullet,
  equation,
  heading,
  inlineEquation,
  paragraph,
  table,
  text,
  toggle,
} from '../helpers/notion';

describe('mdx', () => {
  it('compiles a full page', async () => {
    await expect(
      compileMdx(await toMdx(kitchenSink())),
    ).resolves.toBeUndefined();
  });

  it('escapes characters MDX would read as JSX, even with escaping off', async () => {
    const mdx = await toMdx([paragraph('use {braces} and <angle> brackets')]);
    await expect(compileMdx(mdx)).resolves.toBeUndefined();
    expect(mdx).not.toContain('{braces}');
  });

  it('escapes them with escaping on too', async () => {
    await expect(
      compileMdx(await toMdx([paragraph('a {b} <c> *d*')], { escape: true })),
    ).resolves.toBeUndefined();
  });

  it('keeps toggles and their content valid JSX (#151)', async () => {
    const mdx = await toMdx([
      toggle(
        [text('Title {x}', { bold: true }), text('\nsecond line')],
        [paragraph('inside'), bullet('item')],
      ),
      heading(2, 'Toggle heading', [paragraph('hidden')]),
    ]);
    await expect(compileMdx(mdx)).resolves.toBeUndefined();
    expect(mdx).toContain(
      '<summary><strong>Title &#123;x&#125;</strong><br />second line</summary>',
    );
  });

  it('keeps tables and equations compiling', async () => {
    const mdx = await toMdx([
      table([
        ['a', 'b'],
        [[text('x\ny')], '{z}'],
      ]),
      equation('\\frac{a}{b}'),
      paragraph([text('inline '), inlineEquation('\\sqrt{2}')]),
    ]);
    await expect(compileMdx(mdx)).resolves.toBeUndefined();
  });

  it('renders escaped text back to exactly what was in Notion', async () => {
    const html = await renderMdx(
      await toMdx([
        toggle([text('Title {x}', { bold: true })], [paragraph('a {b} <c>')]),
      ]),
    );
    expect(html).toContain('<summary><strong>Title {x}</strong></summary>');
    expect(html).toContain('<p>a {b} &lt;c&gt;</p>');
  });

  it('renders a full page', async () => {
    const html = await renderMdx(await toMdx(kitchenSink()));
    expect(html).toContain('<h1>Kitchen sink</h1>');
    expect(html).toContain('<table>');
    expect(html).toContain('<details>');
  });
});
