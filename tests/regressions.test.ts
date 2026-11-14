/**
 * One test per reported issue, written from the issue's own example. Issues covered elsewhere
 * point to their test: #88, #158 (notion.test), #133, #161, #168 (convert.test), #163 (node.test).
 */
import { describe, expect, it } from 'vitest';
import {
  compileMdx,
  parseMarkdown,
  textsOf,
  toHtml,
  toMd,
  toMdx,
} from './helpers/convert';
import {
  bullet,
  callout,
  childPage,
  code,
  equation,
  heading,
  inlineEquation,
  media,
  numbered,
  paragraph,
  quote,
  table,
  text,
  toggle,
} from './helpers/notion';

describe('reported issues', () => {
  it('#140: nested lists with maths inside a callout keep their structure', async () => {
    const md = await toMd([
      callout(
        '📝',
        [text('PROOF', { bold: true })],
        [
          paragraph([
            text('Part 1: there is at least '),
            text('one', { italic: true }),
            text(' solution'),
          ]),
          numbered([
            text('Given '),
            inlineEquation('a'),
            text(' and '),
            inlineEquation('b'),
          ]),
          numbered([text('Let '), inlineEquation('\\gcd(a,b)=d')]),
          numbered('Because', [equation('c = ax+by')]),
          numbered('Therefore', [
            bullet('nested bullet', [numbered('deeper')]),
          ]),
        ],
      ),
    ]);
    expect(md).toBe(
      [
        '> 📝 **PROOF**',
        '>',
        '> Part 1: there is at least *one* solution',
        '>',
        '> 1. Given $a$ and $b$',
        '> 2. Let $\\gcd(a,b)=d$',
        '> 3. Because',
        '>',
        '>    $$',
        '>    c = ax+by',
        '>    $$',
        '> 4. Therefore',
        '>    - nested bullet',
        '>      1. deeper',
        '',
      ].join('\n'),
    );
    const [quoteNode] = parseMarkdown(md).children;
    const list =
      quoteNode?.type === 'blockquote'
        ? quoteNode.children.find((node) => node.type === 'list')
        : undefined;
    expect(list?.children).toHaveLength(4);
    await expect(
      compileMdx(
        await toMdx([
          callout('📝', 'x', [numbered('a', [equation('\\frac{a}{b}')])]),
        ]),
      ),
    ).resolves.toBeUndefined();
  });

  it('#151: blocks are always separated by exactly one blank line', async () => {
    const blocks = [
      heading(1, 'T'),
      paragraph('a'),
      callout('💡', 'c'),
      toggle('t', [paragraph('x')]),
      quote('q'),
      paragraph('end'),
    ];
    for (const output of [await toMd(blocks), await toMdx(blocks)]) {
      expect(output).not.toMatch(/\n\n\n/);
      expect(output.startsWith('\n')).toBe(false);
      expect(output.endsWith('end\n')).toBe(true);
    }
  });

  it('#162: content nested under list items stays inside the item', async () => {
    const md = await toMd([
      bullet('Major point', [
        bullet('Minor point 1', [
          paragraph('Image in point 1'),
          media('image', 'https://a.com/i.png', { hosted: false }),
        ]),
        bullet('Minor point 2', [callout('💡', 'Callout in point 2')]),
        bullet('Minor point 3', [quote('Quote in point 3')]),
      ]),
    ]);
    const [list] = parseMarkdown(md).children;
    expect(list?.type).toBe('list');
    expect(parseMarkdown(md).children).toHaveLength(1);
    expect(md).toContain(
      '    Image in point 1\n\n    ![](https://a.com/i.png)',
    );
    expect(md).toContain('    > 💡 Callout in point 2');
    expect(md).toContain('    > Quote in point 3');
  });

  it('#164: no extra spaces around formatted letters', async () => {
    const md = await toMd([
      paragraph([
        text('NIST', { bold: true }),
        text(' stands for '),
        text('N', { bold: true }),
        text('ational '),
        text('I', { bold: true }),
        text('nstitute'),
      ]),
    ]);
    expect(md).toBe('**NIST** stands for **N**ational **I**nstitute\n');
    expect(textsOf(parseMarkdown(md), 'strong')).toEqual(['NIST', 'N', 'I']);
  });

  it('#173: paragraphs inside toggle headings and callouts stay separate', async () => {
    const md = await toMd([
      heading(2, 'Toggle heading', [paragraph('first'), paragraph('second')]),
      callout('💡', 'Callout', [paragraph('one'), paragraph('two')]),
    ]);
    expect(md).toContain('\n\nfirst\n\nsecond\n\n</details>');
    expect(md).toContain('> 💡 Callout\n>\n> one\n>\n> two\n');
    expect(md).not.toMatch(/^ +first/m);
  });

  it('#174: bold that starts or ends with punctuation next to text still renders bold', async () => {
    const md = await toMd([
      paragraph([
        text('Call '),
        text('(now!)', { bold: true }),
        text('please'),
      ]),
    ]);
    expect(textsOf(parseMarkdown(md), 'strong')).toEqual(['(now!)']);
  });

  it('#176: backticks in inline code and code blocks do not break the output', async () => {
    const md = await toMd([
      paragraph([text('`x`', { code: true })]),
      code('```js\ncode\n```', 'markdown'),
    ]);
    const tree = parseMarkdown(md);
    expect(textsOf(tree, 'inlineCode')).toEqual(['`x`']);
    expect(textsOf(tree, 'code')).toEqual(['```js\ncode\n```']);
  });

  it('#172: a table without a header row still renders as a table', async () => {
    const md = await toMd([
      table(
        [
          ['a', 'b'],
          ['c', 'd'],
        ],
        { columnHeader: false },
      ),
    ]);
    expect(parseMarkdown(md).children[0]?.type).toBe('table');
    expect(md.split('\n').slice(2, 4)).toEqual(['| a | b |', '| c | d |']);
  });

  it('#145: highlighted text is kept', async () => {
    const blocks = [
      paragraph([
        text('normal '),
        text('highlighted', { color: 'yellow_background' }),
        text(' red', { color: 'red' }),
      ]),
    ];
    expect(await toMd(blocks)).toBe('normal <mark>highlighted</mark> red\n');
    expect(await toHtml(blocks)).toContain(
      '<span class="color-yellow_background">highlighted</span>',
    );
  });

  it('#146: links can be written in any format', async () => {
    const md = await toMd(
      [paragraph([text('Astro', { link: 'https://astro.build' })])],
      {
        handlers: {
          link: (node, { content }) =>
            `<Link href="${node.url}">${content()}</Link>`,
        },
      },
    );
    expect(md).toBe('<Link href="https://astro.build">Astro</Link>\n');
  });

  it('#106: child pages are kept as links where they appear', async () => {
    const md = await toMd([
      paragraph('before'),
      childPage('Child'),
      paragraph('after'),
    ]);
    expect(md).toMatch(
      /^before\n\n\[Child\]\(https:\/\/www\.notion\.so\/[0-9a-f]{32}\)\n\nafter\n$/,
    );
  });

  it('#47: code in Notion "plain text" gets a valid language', async () => {
    expect(await toMd([code('hello', 'plain text')])).toBe(
      '```text\nhello\n```\n',
    );
  });
});
