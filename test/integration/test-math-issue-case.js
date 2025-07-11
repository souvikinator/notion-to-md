const { MDXRenderer } = require('../../build/plugins/renderer');

const testBlocks = [
  // Heading
  {
    object: 'block',
    id: 'heading-1',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        { type: 'text', text: { content: 'PROOF' }, plain_text: 'PROOF', annotations: { bold: true }, href: null }
      ],
      is_toggleable: false
    },
    parent: { type: 'page_id', page_id: 'test' },
    children: [],
  },
  // Part 1 intro
  {
    object: 'block',
    id: 'part1',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { type: 'text', text: { content: 'Part 1: Proof that there are atleast ' }, plain_text: 'Part 1: Proof that there are atleast ', annotations: {}, href: null },
        { type: 'text', text: { content: 'one' }, plain_text: 'one', annotations: { italic: true }, href: null },
        { type: 'text', text: { content: ' solution' }, plain_text: ' solution', annotations: {}, href: null }
      ],
      color: 'default'
    },
    parent: { type: 'page_id', page_id: 'test' },
    children: [],
  },
  // 1
  {
    object: 'block', id: 'item-1', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'We have concluded that given $a$ and $b$, we can always find $m,n \in \mathbb{Z}$ such that ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: '\\gcd(a, b) = am + bn' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 2
  {
    object: 'block', id: 'item-2', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Let ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: '\\gcd(a, b) = d' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 3
  {
    object: 'block', id: 'item-3', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'equation', equation: { expression: 'd \\mid c' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' means ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'c = kd' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' for some $k \in \mathbb{Z}$' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 4
  {
    object: 'block', id: 'item-4', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'We can rewrite ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'c = ax + by' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' to ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'kd = ax + by' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 5
  {
    object: 'block', id: 'item-5', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'We can always find $x, y \in \mathbb{Z}$ where ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'c = ax + by' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' because from (1), we can always find $m, n \in \mathbb{Z}$ such that ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'd = am + bn' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' and' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [
      // Block equation for c = ax + by and kd = k(am + bn)
      {
        object: 'block', id: 'item-5-eq', type: 'paragraph', paragraph: {
          rich_text: [
            { type: 'equation', equation: { expression: 'c = ax + by' }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-5' }, children: []
      },
      {
        object: 'block', id: 'item-5-eq2', type: 'paragraph', paragraph: {
          rich_text: [
            { type: 'equation', equation: { expression: 'kd = k(am + bn)' }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-5' }, children: []
      }
    ],
  },
  // 6
  {
    object: 'block', id: 'item-6', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Therefore we can find atleast one pair of $x$ and $y$ such that ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'c = ax + by' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' if ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: '\\gcd(a, b) \\mid c' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' in the form of ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'x = km' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' and ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'y = kn' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' where ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'k = \\frac{c}{\\gcd(a, b)}' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // Part 2 intro
  {
    object: 'block', id: 'part2', type: 'paragraph', paragraph: {
      rich_text: [
        { type: 'text', text: { content: 'Part 2: Proof that there are ' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: 'infinitely many' }, plain_text: '', annotations: { italic: true }, href: null },
        { type: 'text', text: { content: ' solutions' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 7
  {
    object: 'block', id: 'item-7', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'From (6), suppose $x\'$ and $y\'$ is also a solution to ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'c = ax + by' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 8
  {
    object: 'block', id: 'item-8', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Therefore we can write ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'ax + by = ax' + "'" + ' + by' + "'" }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 9
  {
    object: 'block', id: 'item-9', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'From (8) we can rearrange to ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'a(x-x\') = b(y\'-y)' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 10
  {
    object: 'block', id: 'item-10', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Let $a\' = \\frac{a}{d}$ and $b\' = \\frac{b}{d}$, $a\'$ and $b\'$ are coprime because of the following proof of contradiction' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [
      // 10a-f sublist
      ...['a', 'b', 'c', 'd', 'e', 'f'].map((letter, idx) => ({
        object: 'block',
        id: `item-10-${letter}`,
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: `(${String.fromCharCode(97 + idx)}) ` }, plain_text: '', annotations: {}, href: null },
            { type: 'text', text: { content: [
              'Assume $a\' = \\frac{a}{d}$ and $b\' = \\frac{b}{d}$ are not coprime and $d = \\gcd(a, b)$',
              'there is $e > 1$ such that $e = \\gcd(a\', b\')$',
              'Therefore $\\frac{a\'}{e} = \\frac{a}{ed}$ is an integer, same goes with $\\frac{b\'}{e} = \\frac{b}{ed}$',
              '$ed > d$ since $e > 1$',
              'Because there is an integer larger than $d$ that divides $a$ and $b$, $d \\neq \\gcd(a, b)$',
              'Therefore (a) is wrong, $a\'$ and $b\'$ are coprime $\\square$'
            ][idx] }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-10' }, children: []
      }))
    ],
  },
  // 11
  {
    object: 'block', id: 'item-11', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'From (9) and (10), ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'a\'(x-x\') = b\'(y\'-y)' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 12
  {
    object: 'block', id: 'item-12', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'From (11)' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [
      // Block equation for y'-y = ...
      {
        object: 'block', id: 'item-12-eq', type: 'paragraph', paragraph: {
          rich_text: [
            { type: 'equation', equation: { expression: `y' - y = \\frac{a'(x-x')}{b'}` }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-12' }, children: []
      },
      {
        object: 'block', id: 'item-12-eq2', type: 'paragraph', paragraph: {
          rich_text: [
            { type: 'equation', equation: { expression: `y' = y + \\frac{a'(x-x')}{b'}` }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-12' }, children: []
      }
    ],
  },
  // 13
  {
    object: 'block', id: 'item-13', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'From (11)' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [
      // Block equation for x-x' = ...
      {
        object: 'block', id: 'item-13-eq', type: 'paragraph', paragraph: {
          rich_text: [
            { type: 'equation', equation: { expression: `x-x' = \\frac{b'(y'-y)}{a'}` }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-13' }, children: []
      },
      {
        object: 'block', id: 'item-13-eq2', type: 'paragraph', paragraph: {
          rich_text: [
            { type: 'equation', equation: { expression: `x' = x - \\frac{b'(y'-y)}{a'}` }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-13' }, children: []
      }
    ],
  },
  // 14
  {
    object: 'block', id: 'item-14', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'from (11), ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: '\\frac{x-x\'}{b\'} = \\frac{y\'-y}{a\'}' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 15
  {
    object: 'block', id: 'item-15', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'equation', equation: { expression: `x'` }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' is an integer if ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: `\\frac{y'-y}{a'}` }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' is an integer because $x, b\' \in \mathbb{Z}$' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 16
  {
    object: 'block', id: 'item-16', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'equation', equation: { expression: `\\frac{y'-y}{a'}` }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' is an integer if $x\'$ is an integer because of the following proof' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [
      // 16a-g sublist
      ...['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((letter, idx) => ({
        object: 'block',
        id: `item-16-${letter}`,
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: `(${String.fromCharCode(97 + idx)}) ` }, plain_text: '', annotations: {}, href: null },
            { type: 'text', text: { content: [
              'Assume $a\' \\mid (y\'-y)$',
              'Therefore $(y\'-y) = a\'r$ for some $r \in \mathbb{Z}$',
              'From (b), $by\' - by = a\'r$',
              'Because $by\' = c - ax\'$ and $by = c - ax$, thus $ax-ax\' = a\'r$',
              'Dividing by $a$, $x-x\' = \\frac{r}{d}$',
              'From (e) rearranging to $d(x-x\')= r$, the statement is true if $x\'$ is an integer because $d,x,r \in \mathbb{Z}$',
              'Therefore $\\frac{y\'-y}{a\'} \in \mathbb{Z}$ if $x\' \in \mathbb{Z}$ $\\square$'
            ][idx] }, plain_text: '', annotations: {}, href: null }
          ], color: 'default'
        }, parent: { type: 'block_id', block_id: 'item-16' }, children: []
      }))
    ],
  },
  // 17
  {
    object: 'block', id: 'item-17', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Let  $\\frac{x-x\'}{b\'} = \\frac{y\'-y}{a\'} = t$' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 18
  {
    object: 'block', id: 'item-18', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Rewrite ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: `x' = x - \\frac{tb}{d}` }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' and ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: `y' = y + \\frac{ta}{d}` }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  },
  // 19
  {
    object: 'block', id: 'item-19', type: 'numbered_list_item', numbered_list_item: {
      rich_text: [
        { type: 'text', text: { content: 'Therefore we can find infinitely many $x$ and $y$ such that ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: 'c = ax + by' }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' if $\\gcd(a, b) \\mid c$ in the form of ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: `x = km - \\frac{tb}{d}` }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' and ' }, plain_text: '', annotations: {}, href: null },
        { type: 'equation', equation: { expression: `y = kn + \\frac{ta}{d}` }, plain_text: '', annotations: {}, href: null },
        { type: 'text', text: { content: ' where $k = \\frac{c}{\\gcd(a, b)}$ for every integer $t \in \mathbb{Z}$ $\\square$' }, plain_text: '', annotations: {}, href: null }
      ], color: 'default'
    }, parent: { type: 'page_id', page_id: 'test' }, children: [],
  }
];

async function testMathIssueCase() {
  const renderer = new MDXRenderer();
  const mdx = await renderer.renderBlocksAsMarkdown(testBlocks);
  
  console.log('--- Math Issue Case MDX Output ---');
  console.log(mdx);
  console.log('------------------------------');
}

testMathIssueCase().catch(console.error); 