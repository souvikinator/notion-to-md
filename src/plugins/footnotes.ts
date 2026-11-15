import type { Plugin } from '../core/types';
import type { Comment, Footnote, Inline } from '../tree/types';
import { inlineContent, visit } from '../tree/visit';

/**
 * Turns comments on blocks into footnotes: a numbered reference at the end of the block's
 * text, and the comments as a note at the end of the document. Needs a source that
 * fetches comments, e.g. `notion(client, { comments: true })`.
 */
export function footnotes(): Plugin {
  return {
    name: 'footnotes',
    transform(document, context) {
      const notes: Footnote[] = [...(document.footnotes ?? [])];
      visit(document, (node) => {
        if (!('comments' in node) || !node.comments?.length) return;
        const text = inlineContent(node);
        if (!text) {
          context.warn(
            `Comments on "${node.type}" block ${node.id} have no text to attach a footnote to.`,
          );
          return;
        }
        const label = String(notes.length + 1);
        text.push({ type: 'footnoteReference', label });
        notes.push({ label, content: joinComments(node.comments) });
      });
      if (notes.length > 0) document.footnotes = notes;
    },
  };
}

function joinComments(comments: Comment[]): Inline[] {
  return comments.flatMap((comment, index) =>
    index === 0
      ? comment.content
      : [{ type: 'text', value: ' ', marks: {} }, ...comment.content],
  );
}
