const { MDXRenderer } = require('../../build/plugins/renderer');

// Test math/equation rendering with various edge cases
const testBlocks = [
  {
    object: 'block',
    id: 'equation-1',
    type: 'equation',
    equation: {
      expression: 'E = mc^2'
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
  },
  {
    object: 'block',
    id: 'equation-2',
    type: 'equation',
    equation: {
      expression: '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'
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
  },
  {
    object: 'block',
    id: 'paragraph-1',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'This is a paragraph with inline math: ' },
          plain_text: 'This is a paragraph with inline math: ',
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
          href: null
        },
        {
          type: 'equation',
          equation: { expression: 'x^2 + y^2 = z^2' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
          plain_text: 'x^2 + y^2 = z^2',
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
  },
  {
    object: 'block',
    id: 'paragraph-2',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'Complex inline math: ' },
          plain_text: 'Complex inline math: ',
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
          href: null
        },
        {
          type: 'equation',
          equation: { expression: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
          plain_text: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
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

async function testMathRendering() {
  const renderer = new MDXRenderer();
  const mdx = await renderer.renderBlocksAsMarkdown(testBlocks);
  
  console.log('--- Math Rendering MDX Output ---');
  console.log(mdx);
  console.log('--- Expected Output ---');
  console.log('```math');
  console.log('E = mc^2');
  console.log('```');
  console.log('');
  console.log('```math');
  console.log('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}');
  console.log('```');
  console.log('');
  console.log('This is a paragraph with inline math: $x^2 + y^2 = z^2$');
  console.log('');
  console.log('Complex inline math: $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$');
  console.log('');
  console.log('------------------------------');
}

testMathRendering().catch(console.error); 