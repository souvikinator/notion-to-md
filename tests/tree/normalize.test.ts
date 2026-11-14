import { describe, expect, it, vi } from 'vitest';
import { normalize } from '../../src/tree/normalize';
import type { Block, List } from '../../src/tree/types';
import {
  breadcrumb,
  bullet,
  callout,
  childPage,
  code,
  heading,
  media,
  numbered,
  page,
  pageMention,
  paragraph,
  syncedBlock,
  table,
  text,
  todo,
  unsupported,
  userMention,
  dateMention,
  type Property,
} from '../helpers/notion';
import type { RawBlock } from '../../src/source/types';

const tree = (blocks: RawBlock[], warn = vi.fn()) =>
  normalize(page(), blocks, warn).children;

describe('lists', () => {
  it('groups consecutive items of the same kind into one list', () => {
    const [first, second, third] = tree([
      bullet('a'),
      bullet('b'),
      numbered('c'),
      todo(true, 'd'),
      todo(false, 'e'),
    ]) as List[];
    expect(first).toMatchObject({
      type: 'list',
      kind: 'bulleted',
      children: [{ type: 'listItem' }, { type: 'listItem' }],
    });
    expect(second).toMatchObject({ type: 'list', kind: 'numbered', start: 1 });
    expect(third).toMatchObject({ type: 'list', kind: 'todo' });
    expect(third?.children.map((item) => item.checked)).toEqual([true, false]);
  });

  it('starts a new list after another block', () => {
    const blocks = tree([numbered('a'), paragraph('break'), numbered('b')]);
    expect(blocks.map((block) => block.type)).toEqual([
      'list',
      'paragraph',
      'list',
    ]);
  });

  it('groups nested items inside their parent item', () => {
    const [list] = tree([
      bullet('parent', [numbered('one'), numbered('two')]),
    ]) as List[];
    const nested = list?.children[0]?.children[0] as List;
    expect(nested).toMatchObject({ type: 'list', kind: 'numbered' });
    expect(nested.children).toHaveLength(2);
  });

  it('keeps the start number and style Notion stores', () => {
    const [list] = tree([
      numbered('a', [], { list_start_index: 4, list_format: 'roman' }),
    ]);
    expect(list).toMatchObject({ start: 4, style: 'roman' });
  });
});

describe('rich text', () => {
  it('keeps formatting as marks and splits lines into breaks', () => {
    const [block] = tree([
      paragraph([text('bold', { bold: true, color: 'red' }), text('a\nb')]),
    ]);
    expect(block).toMatchObject({
      content: [
        { type: 'text', value: 'bold', marks: { bold: true, color: 'red' } },
        { type: 'text', value: 'a', marks: {} },
        { type: 'break' },
        { type: 'text', value: 'b', marks: {} },
      ],
    });
  });

  it('merges neighbouring pieces with the same link', () => {
    const [block] = tree([
      paragraph([
        text('click ', { link: 'https://a.com' }),
        text('here', { link: 'https://a.com', bold: true }),
      ]),
    ]);
    expect(block).toMatchObject({
      content: [{ type: 'link', url: 'https://a.com', children: [{}, {}] }],
    });
  });

  it('turns links and mentions of Notion pages into page links', () => {
    const target = '22222222-2222-4222-8222-222222222222';
    const [block] = tree([
      paragraph([
        pageMention(target, 'Mentioned'),
        text(' and '),
        text('linked', { link: `/${target.replaceAll('-', '')}` }),
      ]),
    ]);
    const content = (block as { content: unknown[] }).content;
    expect(content[0]).toMatchObject({
      type: 'pageLink',
      pageId: target,
      url: `https://www.notion.so/${target.replaceAll('-', '')}`,
    });
    expect(content[2]).toMatchObject({ type: 'pageLink', pageId: target });
  });

  it('uses the visible text of user and date mentions', () => {
    const [block] = tree([
      paragraph([userMention('Ada'), text(' on '), dateMention('2026-01-01')]),
    ]);
    expect(block).toMatchObject({
      content: [{ value: '@Ada' }, { value: ' on ' }, { value: '2026-01-01' }],
    });
  });
});

describe('blocks', () => {
  it('reads code as plain text, ignoring formatting inside it', () => {
    const [block] = tree([
      code(
        [text('const x = '), text('42', { bold: true }), text(';')],
        'plain text',
      ),
    ]);
    expect(block).toMatchObject({
      type: 'code',
      language: 'text',
      value: 'const x = 42;',
    });
  });

  it('makes code languages safe to use as a fence info string', () => {
    const [block] = tree([code('x', 'visual basic')]);
    expect(block).toMatchObject({ language: 'visual-basic' });
  });

  it('keeps toggleable headings with their children', () => {
    const [block] = tree([heading(2, 'Title', [paragraph('inside')])]);
    expect(block).toMatchObject({
      type: 'heading',
      level: 2,
      toggleable: true,
      children: [{ type: 'paragraph' }],
    });
  });

  it('reads tables row by row', () => {
    const [block] = tree([
      table(
        [
          ['a', 'b'],
          ['c', 'd'],
        ],
        { columnHeader: false, rowHeader: true },
      ),
    ]);
    expect(block).toMatchObject({
      type: 'table',
      columnHeader: false,
      rowHeader: true,
      rows: [{}, {}],
    });
  });

  it('reads media, using the URL file name when Notion has none', () => {
    const [image, file] = tree([
      media('image', 'https://files.notion.so/a/b/my%20photo.png?sig=1'),
      media('file', 'https://files.notion.so/a/b/x.zip', {
        name: 'Archive.zip',
      }),
    ]);
    expect(image).toMatchObject({
      kind: 'image',
      hosted: true,
      name: 'my photo.png',
    });
    expect(file).toMatchObject({ kind: 'file', name: 'Archive.zip' });
  });

  it('keeps callout icons', () => {
    expect(tree([callout('💡', 'Tip')])[0]).toMatchObject({
      type: 'callout',
      icon: '💡',
    });
  });

  it('turns child pages into page references', () => {
    const [block] = tree([childPage('Sub page')]);
    expect(block).toMatchObject({ type: 'pageRef', title: 'Sub page' });
  });

  it('flattens synced blocks into their content', () => {
    expect(
      tree([syncedBlock([paragraph('shared')])]).map((block) => block.type),
    ).toEqual(['paragraph']);
  });

  it('drops breadcrumbs, which have no content', () => {
    expect(tree([breadcrumb()])).toEqual([]);
  });

  it('keeps unsupported blocks as unknown nodes and warns', () => {
    const warn = vi.fn();
    const blocks: Block[] = tree([unsupported()], warn);
    expect(blocks[0]).toMatchObject({
      type: 'unknown',
      notionType: 'unsupported',
    });
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('page properties', () => {
  const property = (value: object) => value as Property;

  it('simplifies every property type to plain data', () => {
    const document = normalize(
      page({
        Tags: property({
          id: 'a',
          type: 'multi_select',
          multi_select: [{ id: '1', name: 'x', color: 'red' }],
        }),
        Count: property({ id: 'b', type: 'number', number: null }),
        Done: property({ id: 'c', type: 'checkbox', checkbox: true }),
        When: property({
          id: 'd',
          type: 'date',
          date: { start: '2026-01-01', end: '2026-01-05', time_zone: null },
        }),
        Status: property({
          id: 'e',
          type: 'status',
          status: { id: 's', name: 'Live', color: 'green' },
        }),
        Id: property({
          id: 'f',
          type: 'unique_id',
          unique_id: { prefix: 'DOC', number: 7 },
        }),
        Files: property({
          id: 'g',
          type: 'files',
          files: [
            {
              name: 'cover.png',
              type: 'file',
              file: { url: 'https://files.notion.so/c.png', expiry_time: '' },
            },
          ],
        }),
        Formula: property({
          id: 'h',
          type: 'formula',
          formula: { type: 'string', string: 'computed' },
        }),
      }),
      [],
      vi.fn(),
    );
    expect(document.title).toBe('Test page');
    expect(document.properties).toEqual({
      Name: 'Test page',
      Tags: ['x'],
      Count: null,
      Done: true,
      When: '2026-01-01/2026-01-05',
      Status: 'Live',
      Id: 'DOC-7',
      Files: [
        {
          name: 'cover.png',
          url: 'https://files.notion.so/c.png',
          hosted: true,
        },
      ],
      Formula: 'computed',
    });
  });

  it('keeps the whole title, not only its first piece', () => {
    const document = normalize(
      page({
        Name: property({
          id: 'title',
          type: 'title',
          title: [text('My '), text('Title', { bold: true })],
        }),
      }),
      [],
      vi.fn(),
    );
    expect(document.title).toBe('My Title');
  });
});
