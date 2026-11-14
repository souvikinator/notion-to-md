import type * as M from 'mdast';
import type { Inline, Text } from '../../tree/types';

/** `highlight` is a Notion background color, written as `<mark>`. */
type Mark = 'bold' | 'italic' | 'strikethrough' | 'underline' | 'highlight';

/** Outer marks wrap inner ones: `**_~~text~~_**`. Code is a leaf, so it is always innermost. */
const MARK_ORDER: Mark[] = [
  'bold',
  'italic',
  'strikethrough',
  'underline',
  'highlight',
];

/** Converts a single inline node once marks have been applied around it. */
export type Leaf = (
  node: Inline,
  convert: (nodes: Inline[]) => M.PhrasingContent[],
) => M.PhrasingContent[];

/**
 * Converts inline nodes to mdast, merging neighbouring nodes that share a mark into one
 * wrapper, so `**a** **b**` from two Notion pieces becomes `**a b**`.
 */
export function phrasing(nodes: Inline[], leaf: Leaf): M.PhrasingContent[] {
  const convert = (
    current: Inline[],
    outer: ReadonlySet<Mark>,
    depth: number,
  ): M.PhrasingContent[] => {
    const mark = MARK_ORDER[depth];
    if (!mark) {
      return current.flatMap((node) =>
        leaf(node, (children) => convert(children, outer, 0)),
      );
    }
    if (outer.has(mark)) return convert(current, outer, depth + 1);

    return runs(current, (node) => hasMark(node, mark)).flatMap((run) => {
      if (!run.marked) return convert(run.nodes, outer, depth + 1);
      const { before, inner, after } = splitEdgeWhitespace(run.nodes);
      if (inner.length === 0) return convert(run.nodes, outer, depth + 1);
      const children = convert(inner, new Set([...outer, mark]), depth + 1);
      return [
        ...whitespace(before),
        ...wrap(mark, children),
        ...whitespace(after),
      ];
    });
  };
  return convert(nodes, new Set(), 0);
}

function hasMark(node: Inline, mark: Mark): boolean {
  switch (node.type) {
    case 'text':
      return mark === 'highlight'
        ? (node.marks.color?.endsWith('_background') ?? false)
        : node.marks[mark] === true;
    case 'link':
    case 'pageLink':
      return (
        node.children.length > 0 &&
        node.children.every((child) => hasMark(child, mark))
      );
    case 'inlineEquation':
    case 'break':
      return false;
  }
}

function runs(
  nodes: Inline[],
  test: (node: Inline) => boolean,
): { marked: boolean; nodes: Inline[] }[] {
  const result: { marked: boolean; nodes: Inline[] }[] = [];
  for (const node of nodes) {
    const marked = test(node);
    const last = result.at(-1);
    if (last?.marked === marked) last.nodes.push(node);
    else result.push({ marked, nodes: [node] });
  }
  return result;
}

/**
 * Moves spaces at the edges of a formatted run outside of it. Notion often includes the
 * trailing space in bold text, and `**bold **` is not bold in Markdown.
 */
function splitEdgeWhitespace(nodes: Inline[]): {
  before: string;
  inner: Inline[];
  after: string;
} {
  const inner = [...nodes];
  let before = '';
  let after = '';

  for (let first = inner[0]; first && isPlainText(first); first = inner[0]) {
    const trimmed = first.value.trimStart();
    if (trimmed === first.value) break;
    before += first.value.slice(0, first.value.length - trimmed.length);
    if (trimmed) {
      inner[0] = { ...first, value: trimmed };
      break;
    }
    inner.shift();
  }

  for (
    let last = inner.at(-1);
    last && isPlainText(last);
    last = inner.at(-1)
  ) {
    const trimmed = last.value.trimEnd();
    if (trimmed === last.value) break;
    after = last.value.slice(trimmed.length) + after;
    if (trimmed) {
      inner[inner.length - 1] = { ...last, value: trimmed };
      break;
    }
    inner.pop();
  }

  return { before, inner, after };
}

function isPlainText(node: Inline): node is Text {
  return node.type === 'text' && !node.marks.code;
}

function whitespace(value: string): M.PhrasingContent[] {
  return value ? [{ type: 'text', value }] : [];
}

function wrap(mark: Mark, children: M.PhrasingContent[]): M.PhrasingContent[] {
  switch (mark) {
    case 'bold':
      return [{ type: 'strong', children }];
    case 'italic':
      return [{ type: 'emphasis', children }];
    case 'strikethrough':
      return [{ type: 'delete', children }];
    case 'underline':
      return htmlWrap('u', children);
    case 'highlight':
      return htmlWrap('mark', children);
  }
}

function htmlWrap(
  tag: string,
  children: M.PhrasingContent[],
): M.PhrasingContent[] {
  return [
    { type: 'html', value: `<${tag}>` },
    ...children,
    { type: 'html', value: `</${tag}>` },
  ];
}
