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

export type Handler<
  T extends NodeType,
  H extends HandlerHelpers = HandlerHelpers,
> = (node: NodeOf<T>, helpers: H) => string;

/** Custom output per node type. A handler replaces the built-in output for that node everywhere it appears. */
export type Handlers<H extends HandlerHelpers = HandlerHelpers> = {
  [T in NodeType]?: Handler<T, H>;
};

/** MDX handlers can also add an import line, e.g. for a component they output. */
export interface MdxHandlerHelpers extends HandlerHelpers {
  addImport: (statement: string) => void;
}

type AnyHandler<H> = (node: ContentNode, helpers: H) => string;

export function handlerFor<H extends HandlerHelpers>(
  handlers: Handlers<H>,
  node: ContentNode,
): AnyHandler<H> | undefined {
  // Handlers are keyed by node type, so the handler found always accepts this node.
  return handlers[node.type] as AnyHandler<H> | undefined;
}
