import { describe, expect, it } from 'vitest';
import { normalizeId, notionUrl, parseNotionUrl } from '../../src/tree/ids';

describe('normalizeId', () => {
  it('adds dashes to a compact id and lowercases it', () => {
    expect(normalizeId('ABCDEF0123456789ABCDEF0123456789')).toBe(
      'abcdef01-2345-6789-abcd-ef0123456789',
    );
  });

  it('keeps a dashed id', () => {
    expect(normalizeId('abcdef01-2345-6789-abcd-ef0123456789')).toBe(
      'abcdef01-2345-6789-abcd-ef0123456789',
    );
  });

  it('leaves non-ids alone', () => {
    expect(normalizeId('not-an-id')).toBe('not-an-id');
  });
});

describe('parseNotionUrl', () => {
  const id = 'abcdef01-2345-6789-abcd-ef0123456789';
  const compact = id.replaceAll('-', '');

  it.each([
    [`/${compact}`],
    [`https://www.notion.so/${compact}`],
    [`https://www.notion.so/My-Page-${compact}`],
    [`https://www.notion.so/workspace/My-Page-${compact}?pvs=4`],
    [`https://notion.so/${id}`],
    [`https://www.notion.com/My-Page-${compact}`],
    [`https://team.notion.site/My-Page-${compact}`],
  ])('reads the page id from %s', (url) => {
    expect(parseNotionUrl(url)).toEqual({ pageId: id });
  });

  it('reads a block id from the fragment', () => {
    const block = '11111111222233334444555555555555';
    expect(
      parseNotionUrl(`https://www.notion.so/Page-${compact}#${block}`),
    ).toEqual({
      pageId: id,
      blockId: '11111111-2222-3333-4444-555555555555',
    });
  });

  it.each([
    ['https://example.com/My-Page-abcdef0123456789abcdef0123456789'],
    ['/docs/getting-started'],
    ['https://www.notion.so/product'],
    ['mailto:someone@example.com'],
  ])('ignores %s', (url) => {
    expect(parseNotionUrl(url)).toBeUndefined();
  });
});

describe('notionUrl', () => {
  it('builds a page URL with an optional block fragment', () => {
    expect(notionUrl('abcdef01-2345-6789-abcd-ef0123456789')).toBe(
      'https://www.notion.so/abcdef0123456789abcdef0123456789',
    );
    expect(
      notionUrl(
        'abcdef01-2345-6789-abcd-ef0123456789',
        '11111111-2222-3333-4444-555555555555',
      ),
    ).toBe(
      'https://www.notion.so/abcdef0123456789abcdef0123456789#11111111222233334444555555555555',
    );
  });
});
