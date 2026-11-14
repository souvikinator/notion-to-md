import { describe, expect, it } from 'vitest';
import { kitchenSink } from '../helpers/fixtures';
import { compileMdx, toMdx } from '../helpers/convert';
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
});
