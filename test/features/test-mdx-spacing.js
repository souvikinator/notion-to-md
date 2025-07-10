const { MDXRenderer } = require('../../build/plugins/renderer');

// Test blocks with potential spacing issues
const testBlocks = [
  {
    id: '1',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'First paragraph' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }
        }
      ]
    },
    parent: { type: 'page_id' }
  },
  {
    id: '2',
    type: 'heading_1',
    heading_1: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'Main Heading' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }
        }
      ],
      is_toggleable: false
    },
    parent: { type: 'page_id' }
  },
  {
    id: '3',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'List item 1' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }
        }
      ]
    },
    parent: { type: 'page_id' }
  },
  {
    id: '4',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'List item 2' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }
        }
      ]
    },
    parent: { type: 'page_id' }
  },
  {
    id: '5',
    type: 'quote',
    quote: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'A quote with multiple lines\nSecond line' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }
        }
      ]
    },
    parent: { type: 'page_id' }
  },
  {
    id: '6',
    type: 'code',
    code: {
      rich_text: [
        {
          type: 'text',
          text: { content: 'console.log("Hello");\nreturn true;' },
          annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }
        }
      ],
      language: 'javascript'
    },
    parent: { type: 'page_id' }
  }
];

async function testMDXSpacing() {
  const renderer = new MDXRenderer();
  
  // Use the process method instead of render
  const result = await renderer.process({
    pageId: 'test',
    blockTree: { blocks: testBlocks },
    pageProperties: {}
  });
  
  console.log('=== MDX Output ===');
  console.log(result.content);
  console.log('=== End MDX Output ===');
  
  // Check for specific spacing issues
  console.log('\n=== Spacing Analysis ===');
  
  // Check for double newlines
  const doubleNewlines = (result.content.match(/\n\n/g) || []).length;
  console.log(`Double newlines: ${doubleNewlines}`);
  
  // Check for triple newlines
  const tripleNewlines = (result.content.match(/\n\n\n/g) || []).length;
  console.log(`Triple newlines: ${tripleNewlines}`);
  
  // Check for inconsistent spacing around headings
  const headingSpacing = result.content.match(/# .*\n/g);
  console.log('Heading spacing patterns:', headingSpacing);
  
  // Check for list spacing
  const listSpacing = result.content.match(/- .*\n/g);
  console.log('List spacing patterns:', listSpacing);
  
  // Check for quote spacing
  const quoteSpacing = result.content.match(/> .*\n/g);
  console.log('Quote spacing patterns:', quoteSpacing);
}

testMDXSpacing().catch(console.error); 