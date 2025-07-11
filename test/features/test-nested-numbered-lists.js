const { MDXRenderer } = require('../../build/plugins/renderer');

// Test nested numbered lists
const testBlocks = [
  {
    object: 'block',
    id: '1',
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'First item' },
          plain_text: 'First item',
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
          href: null
        }
      ],
      color: 'default'
    },
    parent: { type: 'page_id', page_id: 'test' },
    children: [
      {
        object: 'block',
        id: '1-1',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Nested item 1' },
              plain_text: 'Nested item 1',
              annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
              href: null
            }
          ],
          color: 'default'
        },
        parent: { type: 'block_id', block_id: '1' },
        children: [],
        created_time: '2023-01-01T00:00:00.000Z',
        created_by: { object: 'user', id: 'test' },
        last_edited_time: '2023-01-01T00:00:00.000Z',
        last_edited_by: { object: 'user', id: 'test' },
        archived: false,
        has_children: false,
        in_trash: false
      },
      {
        object: 'block',
        id: '1-2',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Nested item 2' },
              plain_text: 'Nested item 2',
              annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
              href: null
            }
          ],
          color: 'default'
        },
        parent: { type: 'block_id', block_id: '1' },
        children: [],
        created_time: '2023-01-01T00:00:00.000Z',
        created_by: { object: 'user', id: 'test' },
        last_edited_time: '2023-01-01T00:00:00.000Z',
        last_edited_by: { object: 'user', id: 'test' },
        archived: false,
        has_children: false,
        in_trash: false
      }
    ],
    created_time: '2023-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'test' },
    last_edited_time: '2023-01-01T00:00:00.000Z',
    last_edited_by: { object: 'user', id: 'test' },
    archived: false,
    has_children: true,
    in_trash: false
  },
  {
    object: 'block',
    id: '2',
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'Second item' },
          plain_text: 'Second item',
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
          href: null
        }
      ],
      color: 'default'
    },
    parent: { type: 'page_id', page_id: 'test' },
    children: [],
    created_time: '2023-01-01T00:00:00.000Z',
    created_by: { object: 'user', id: 'test' },
    last_edited_time: '2023-01-01T00:00:00.000Z',
    last_edited_by: { object: 'user', id: 'test' },
    archived: false,
    has_children: false,
    in_trash: false
  }
];

async function testNestedNumberedLists() {
  const renderer = new MDXRenderer();
  // Use the new grouping-aware renderer method
  const mdx = await renderer.renderBlocksAsMarkdown(testBlocks);
  
  console.log('--- Nested Numbered Lists MDX Output ---');
  console.log(mdx);
  console.log('--- Expected Output ---');
  console.log('1. First item');
  console.log('    1. Nested item 1');
  console.log('    2. Nested item 2');
  console.log('');
  console.log('2. Second item');
  console.log('');
  console.log('------------------------------');
}

testNestedNumberedLists().catch(console.error); 