import { describe, expect, it } from 'vitest';
import { kitchenSink } from '../helpers/fixtures';
import {
  parseMarkdown,
  renderMarkdown,
  textsOf,
  toMd,
} from '../helpers/convert';
import {
  bookmark,
  bullet,
  callout,
  childPage,
  code,
  columns,
  divider,
  equation,
  heading,
  inlineEquation,
  media,
  numbered,
  paragraph,
  quote,
  table,
  text,
  todo,
  toggle,
} from '../helpers/notion';

describe('inline formatting', () => {
  it('moves spaces outside formatting so it still renders', async () => {
    const md = await toMd([
      paragraph([text('Hello '), text('bold ', { bold: true }), text('world')]),
    ]);
    expect(md).toBe('Hello **bold** world\n');
    expect(textsOf(parseMarkdown(md), 'strong')).toEqual(['bold']);
  });

  it('merges neighbouring pieces with the same formatting', async () => {
    const md = await toMd([
      paragraph([
        text('very ', { bold: true }),
        text('bold', { bold: true, italic: true }),
        text(' text', { bold: true }),
      ]),
    ]);
    expect(md).toBe('**very *bold* text**\n');
  });

  it('keeps bold next to punctuation valid (#174)', async () => {
    const md = await toMd([
      paragraph([text('foo'), text('"bar"', { bold: true }), text('baz')]),
    ]);
    expect(textsOf(parseMarkdown(md), 'strong')).toEqual(['"bar"']);
  });

  it('renders strikethrough, underline and inline code', async () => {
    const md = await toMd([
      paragraph([
        text('gone', { strikethrough: true }),
        text(' '),
        text('under', { underline: true }),
        text(' '),
        text('x = 1', { code: true }),
      ]),
    ]);
    expect(md).toBe('~~gone~~ <u>under</u> `x = 1`\n');
  });

  it('picks an inline code delimiter longer than any backtick run inside', async () => {
    const md = await toMd([paragraph([text('a``b', { code: true })])]);
    expect(textsOf(parseMarkdown(md), 'inlineCode')).toEqual(['a``b']);
  });

  it('applies formatting around links', async () => {
    const md = await toMd([
      paragraph([
        text('see ', { bold: true }),
        text('docs', { bold: true, link: 'https://a.com' }),
      ]),
    ]);
    expect(md).toBe('**see [docs](https://a.com)**\n');
  });

  it('writes line breaks as hard breaks', async () => {
    const md = await toMd([paragraph('line 1\nline 2')]);
    expect(md).toBe('line 1\\\nline 2\n');
  });

  it('writes inline equations with dollar signs', async () => {
    expect(
      await toMd([paragraph([text('area '), inlineEquation('\\pi r^2')])]),
    ).toBe('area $\\pi r^2$\n');
  });
});

describe('escaping', () => {
  const tricky = paragraph('2*3*4 and _x_ and # not a heading');

  it('keeps Markdown typed in Notion by default', async () => {
    expect(await toMd([tricky])).toBe('2*3*4 and _x_ and # not a heading\n');
  });

  it('escapes it when asked, so it renders literally (#176)', async () => {
    const md = await toMd([tricky], { escape: true });
    expect(textsOf(parseMarkdown(md), 'paragraph')).toEqual([
      '2*3*4 and _x_ and # not a heading',
    ]);
  });

  it('always escapes pipes inside table cells', async () => {
    const md = await toMd([table([['a|b', 'c']])]);
    expect(md).toContain('a\\|b');
  });
});

describe('blocks', () => {
  it('renders headings, including Notion heading 4', async () => {
    expect(await toMd([heading(1, 'One'), heading(4, 'Four')])).toBe(
      '# One\n\n#### Four\n',
    );
  });

  it('renders lists with nesting, numbering and to-dos', async () => {
    const md = await toMd([
      bullet('a', [bullet('a.1')]),
      bullet('b'),
      numbered('one'),
      numbered('two'),
      todo(true, 'done'),
    ]);
    expect(md).toBe('- a\n  - a.1\n- b\n\n1. one\n2. two\n\n- [x] done\n');
  });

  it('continues numbering from the start index Notion stores', async () => {
    expect(
      await toMd([numbered('x', [], { list_start_index: 3 }), numbered('y')]),
    ).toBe('3. x\n4. y\n');
  });

  it('keeps code blocks inside list items indented', async () => {
    const md = await toMd([numbered('step', [code('npm install', 'bash')])]);
    expect(md).toBe('1. step\n   ```bash\n   npm install\n   ```\n');
    expect(parseMarkdown(md).children).toHaveLength(1);
  });

  it('keeps leading indentation in code and uses a longer fence when needed', async () => {
    const md = await toMd([code('  indented\n```\nend', 'markdown')]);
    expect(md).toBe('````markdown\n  indented\n```\nend\n````\n');
  });

  it('renders quotes and callouts as block quotes with their children', async () => {
    expect(await toMd([quote('said', [paragraph('more')])])).toBe(
      '> said\n>\n> more\n',
    );
    expect(await toMd([callout('💡', 'tip', [bullet('point')])])).toBe(
      '> 💡 tip\n>\n> - point\n',
    );
  });

  it('renders toggles as details with each child as its own paragraph (#173)', async () => {
    const md = await toMd([
      toggle('Title', [paragraph('one'), paragraph('two')]),
    ]);
    expect(md).toBe(
      '<details>\n<summary>Title</summary>\n\none\n\ntwo\n\n</details>\n',
    );
  });

  it('renders toggleable headings as details with the heading in the summary', async () => {
    const md = await toMd([
      heading(3, [text('Big', { bold: true })], [paragraph('inside')]),
    ]);
    expect(md).toBe(
      '<details>\n<summary><h3><strong>Big</strong></h3></summary>\n\ninside\n\n</details>\n',
    );
  });

  it('renders equations, dividers and columns', async () => {
    expect(
      await toMd([
        equation('x^2'),
        divider(),
        columns([paragraph('left')], [paragraph('right')]),
      ]),
    ).toBe('$$\nx^2\n$$\n\n---\n\nleft\n\nright\n');
  });

  it('renders tables, adding an empty header row when Notion has none (#172)', async () => {
    expect(
      await toMd([
        table([
          ['h1', 'h2'],
          ['a', 'b'],
        ]),
      ]),
    ).toBe('| h1 | h2 |\n| - | - |\n| a | b |\n');
    const md = await toMd([table([['a', 'b']], { columnHeader: false })]);
    expect(md).toBe('| | |\n| - | - |\n| a | b |\n');
    expect(parseMarkdown(md).children[0]?.type).toBe('table');
  });

  it('writes line breaks in table cells as <br /> so the row stays on one line', async () => {
    expect(await toMd([table([['a'], [[text('one\ntwo')]]])])).toContain(
      '| one<br />two |',
    );
  });

  it('renders media, bookmarks and child pages as images and links', async () => {
    const md = await toMd([
      media('image', 'https://files.notion.so/a/b/pic.png', {
        caption: 'Alt text',
      }),
      media('file', 'https://files.notion.so/a/b/x.zip', {
        name: 'Archive.zip',
      }),
      bookmark('https://example.com', 'Example'),
      childPage('Sub page'),
    ]);
    expect(md).toContain('![Alt text](https://files.notion.so/a/b/pic.png)');
    expect(md).toContain('[Archive.zip](https://files.notion.so/a/b/x.zip)');
    expect(md).toContain('[Example](https://example.com)');
    expect(md).toMatch(
      /\[Sub page\]\(https:\/\/www\.notion\.so\/[0-9a-f]{32}\)/,
    );
  });

  it('skips empty paragraphs', async () => {
    expect(await toMd([paragraph('a'), paragraph(''), paragraph('b')])).toBe(
      'a\n\nb\n',
    );
  });
});

describe('custom handlers', () => {
  it('replaces a block type everywhere it appears, including nested (#98)', async () => {
    const md = await toMd(
      [callout('💡', 'top'), bullet('item', [callout('⚠️', 'nested')])],
      {
        handlers: {
          callout: (node, { content }) =>
            `:::note\n${node.icon ?? ''} ${content()}\n:::`,
        },
      },
    );
    expect(md).toBe(
      ':::note\n💡 top\n:::\n\n- item\n\n  :::note\n  ⚠️ nested\n  :::\n',
    );
  });

  it('gives handlers the rendered children and the built-in output', async () => {
    const md = await toMd([toggle('T', [paragraph('child')])], {
      handlers: {
        toggle: (_, { children, fallback }) =>
          `<!-- ${children()} -->\n${fallback()}`,
      },
    });
    expect(md).toContain('<!-- child -->');
    expect(md).toContain('<summary>T</summary>');
  });

  it('lets inline handlers change links', async () => {
    const md = await toMd(
      [paragraph([text('docs', { link: 'https://a.com' })])],
      {
        handlers: {
          link: (node, { content }) => `[[${content()}|${node.url}]]`,
        },
      },
    );
    expect(md).toBe('[[docs|https://a.com]]\n');
  });
});

describe('a full page', () => {
  it('parses back into the expected structure', async () => {
    const tree = parseMarkdown(await toMd(kitchenSink()));
    expect(textsOf(tree, 'heading')).toEqual(['Kitchen sink', 'Small heading']);
    expect(textsOf(tree, 'code')).toEqual([
      '  indented()\nnext()',
      'const x = 42; // ```',
    ]);
    expect(textsOf(tree, 'inlineCode')).toEqual(['a`b']);
    expect(tree.children.filter((node) => node.type === 'table')).toHaveLength(
      1,
    );
  });

  // Code inside list items is checked by parsing instead: micromark's HTML output drops
  // line endings there, while commonmark.js and markdown-it render it correctly.
  it('renders on GitHub the way it looks in Notion', async () => {
    const html = renderMarkdown(await toMd(kitchenSink()));
    expect(html).toContain(
      '<p>Hello <strong>bold</strong> world and <code>a`b</code></p>',
    );
    expect(html).toContain(
      '<details>\n<summary>Toggle title</summary>\n<p>first paragraph</p>\n<p>second paragraph</p>\n</details>',
    );
    expect(html).toContain('<td>a|b</td>\n<td>line 1<br />line 2</td>');
    expect(html).toContain(
      '<li><input type="checkbox" disabled="" checked="" /> done</li>',
    );
  });
});
