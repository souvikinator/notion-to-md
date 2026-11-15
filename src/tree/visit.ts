import type { Block, Inline, Node } from './types';

type NodeOfType<T extends Node['type']> = Extract<Node, { type: T }>;

/** Inline nodes held by `node`: a block's text, a link's label, or a caption. `undefined` when the node holds no text. */
export function inlineContent(node: Node): Inline[] | undefined {
  switch (node.type) {
    case 'paragraph':
    case 'heading':
    case 'listItem':
    case 'quote':
    case 'callout':
    case 'toggle':
      return node.content;
    case 'link':
    case 'pageLink':
      return node.children;
    case 'code':
    case 'media':
    case 'embed':
      return node.caption;
    default:
      return undefined;
  }
}

/** Blocks nested inside `node`. */
export function blockChildren(node: Node): Block[] {
  switch (node.type) {
    case 'root':
    case 'list':
    case 'columns':
    case 'column':
    case 'paragraph':
    case 'heading':
    case 'listItem':
    case 'quote':
    case 'callout':
    case 'toggle':
      return node.children;
    default:
      return [];
  }
}

/** Every node directly inside `node`, in document order. */
export function childNodes(node: Node): Node[] {
  switch (node.type) {
    case 'table':
      return node.rows.flatMap((row) => row.cells.flat());
    case 'root':
      return [
        ...node.children,
        ...(node.footnotes?.flatMap((footnote) => footnote.content) ?? []),
      ];
    default:
      return [...(inlineContent(node) ?? []), ...blockChildren(node)];
  }
}

/** Calls `fn` for `node` and every node below it, depth first. */
export function visit(node: Node, fn: (node: Node) => void): void {
  fn(node);
  for (const child of childNodes(node)) visit(child, fn);
}

/** All nodes of the given type below `node`, in document order. */
export function select<T extends Node['type']>(
  node: Node,
  type: T,
): NodeOfType<T>[] {
  const found: NodeOfType<T>[] = [];
  visit(node, (current) => {
    if (isType(current, type)) found.push(current);
  });
  return found;
}

export function isType<T extends Node['type']>(
  node: Node,
  type: T,
): node is NodeOfType<T> {
  return node.type === type;
}

/** The text of inline nodes without formatting. Line breaks become spaces. */
export function toPlainText(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'inlineEquation':
          return node.value;
        case 'break':
          return ' ';
        case 'footnoteReference':
          return '';
        case 'link':
        case 'pageLink':
          return toPlainText(node.children);
      }
    })
    .join('');
}
