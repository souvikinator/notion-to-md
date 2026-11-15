import type { Inline, Text } from './types';

export interface EdgeSplit {
  /** Whitespace removed from the start. */
  before: string;
  inner: Inline[];
  /** Whitespace removed from the end. */
  after: string;
}

/**
 * Separates whitespace at the start and end of inline nodes from the content between.
 * Spaces inside inline code are content. With `breaks`, line breaks at the edges are
 * dropped too.
 */
export function splitEdgeWhitespace(
  nodes: Inline[],
  breaks = false,
): EdgeSplit {
  const inner = [...nodes];
  let before = '';
  let after = '';
  const isEdgeBreak = (node: Inline): boolean =>
    breaks && node.type === 'break';

  for (let first = inner[0]; first; first = inner[0]) {
    if (isEdgeBreak(first)) {
      inner.shift();
      continue;
    }
    if (!isPlainText(first)) break;
    const trimmed = first.value.trimStart();
    before += first.value.slice(0, first.value.length - trimmed.length);
    if (trimmed) {
      inner[0] = { ...first, value: trimmed };
      break;
    }
    inner.shift();
  }

  for (let last = inner.at(-1); last; last = inner.at(-1)) {
    if (isEdgeBreak(last)) {
      inner.pop();
      continue;
    }
    if (!isPlainText(last)) break;
    const trimmed = last.value.trimEnd();
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
