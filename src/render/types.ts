import type { Block, Inline } from '../tree/types';

export type { RenderContext, Renderer } from '../core/types';

export type ContentNode = Block | Inline;
export type NodeType = ContentNode['type'];
export type NodeOf<T extends NodeType> = Extract<ContentNode, { type: T }>;

export interface HandlerHelpers {
  /** The node's inline content (text, link label, summary) rendered in the output format. */
  content: () => string;
  /** The node's child blocks rendered in the output format. */
  children: () => string;
  /** What the built-in handler would output for this node, so a handler can wrap it. */
  fallback: () => string;
}

export type Handler<T extends NodeType> = (
  node: NodeOf<T>,
  helpers: HandlerHelpers,
) => string;

/** Custom output per node type. A handler replaces the built-in output for that node everywhere it appears. */
export type Handlers = { [T in NodeType]?: Handler<T> };

type AnyHandler = (node: ContentNode, helpers: HandlerHelpers) => string;

export function handlerFor(
  handlers: Handlers,
  node: ContentNode,
): AnyHandler | undefined {
  // Handlers are keyed by node type, so the handler found always accepts this node.
  return handlers[node.type] as AnyHandler | undefined;
}
