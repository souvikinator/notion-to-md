import type { RawBlock } from '../../src/source/types';
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
  linkToPage,
  media,
  numbered,
  pageMention,
  paragraph,
  quote,
  table,
  text,
  todo,
  toggle,
} from './notion';

export const OTHER_PAGE = '22222222-2222-4222-8222-222222222222';

/** A page using every common block type, nested the way real pages are. */
export function kitchenSink(): RawBlock[] {
  return [
    heading(1, 'Kitchen sink'),
    paragraph([
      text('Hello '),
      text('bold ', { bold: true }),
      text('world and '),
      text('a`b', { code: true }),
    ]),
    bullet('first'),
    bullet('second', [bullet('nested'), numbered('nested number')]),
    paragraph('After the list'),
    numbered('one'),
    numbered('two', [code('  indented()\nnext()', 'python')]),
    numbered('three'),
    todo(true, 'done'),
    todo(false, 'not done'),
    quote('A quote', [paragraph('inside quote')]),
    callout('💡', 'A callout', [bullet('point')]),
    toggle('Toggle title', [
      paragraph('first paragraph'),
      paragraph('second paragraph'),
    ]),
    heading(2, 'Toggle heading', [paragraph('hidden')]),
    code(
      [text('const x = '), text('42', { bold: true }), text('; // ```')],
      'javascript',
    ),
    equation('E = mc^2'),
    paragraph([
      text('Inline '),
      inlineEquation('a^2'),
      text(' and '),
      pageMention(OTHER_PAGE, 'Other page'),
    ]),
    divider(),
    table([
      ['Name', 'Value'],
      ['a|b', [text('line 1\nline 2')]],
    ]),
    columns(
      [paragraph('left')],
      [numbered('right one'), numbered('right two')],
    ),
    media('image', 'https://files.notion.so/space/file-id/photo.png?X-Amz=1', {
      caption: 'A photo',
    }),
    media('pdf', 'https://example.com/doc.pdf', { hosted: false }),
    bookmark('https://example.com'),
    childPage('Sub page'),
    linkToPage(OTHER_PAGE),
    heading(4, 'Small heading'),
  ];
}
