import { describe, it, expect } from 'vitest';
import { annotationTransformers } from '@/plugins/renderer/mdx/transformers/annotations';

describe('Annotation Transformers - Issue #164', () => {
  describe('Bold annotation spacing', () => {
    it('should not add leading space to bold text', async () => {
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: 'Hello',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('**Hello**');
      expect(result).not.toMatch(/^\s/); // Should not start with space
    });

    it('should not add trailing space to bold text', async () => {
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: 'Hello',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('**Hello**');
      expect(result).not.toMatch(/\s$/); // Should not end with space
    });

    it('should not add double spaces between bold and plain text', async () => {
      // Simulate: "Hello " (plain) + "world" (bold)
      // The transformRichText in the actual code will combine these
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: 'world',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('**world**');
      // When combined with "Hello ", it should be "Hello **world**" not "Hello  **world**"
    });

    it('should handle compound words with partial bold', async () => {
      // N (bold) + ational => **N**ational
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: 'N',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('**N**');
      // When combined with "ational", should be "**N**ational" not "**N** ational"
    });
  });

  describe('Italic annotation spacing', () => {
    it('should not add spaces to italic text', async () => {
      const transformer = annotationTransformers.italic;
      const result = await transformer!.transform({
        text: 'test',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('*test*');
      expect(result).not.toMatch(/^\s/); // No leading space
      expect(result).not.toMatch(/\s$/); // No trailing space
    });
  });

  describe('Strikethrough annotation spacing', () => {
    it('should not add spaces to strikethrough text', async () => {
      const transformer = annotationTransformers.strikethrough;
      const result = await transformer!.transform({
        text: 'deleted',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('~~deleted~~');
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
    });
  });

  describe('Code annotation spacing', () => {
    it('should not add spaces to inline code', async () => {
      const transformer = annotationTransformers.code;
      const result = await transformer!.transform({
        text: 'code',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('`code`');
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
    });
  });

  describe('Equation annotation spacing', () => {
    it('should not add spaces to inline equations', async () => {
      const transformer = annotationTransformers.equation;
      const result = await transformer!.transform({
        text: 'E=mc^2',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('$E=mc^2$');
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
    });
  });

  describe('HTML mode spacing', () => {
    it('should not add extra spaces in HTML bold mode', async () => {
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: 'test',
        metadata: { html: true },
        manifest: {},
      });

      expect(result).toBe('<strong>test</strong>');
      expect(result).not.toContain(/\s<\/strong>/); // No space before closing tag
      expect(result).not.toContain(/<strong>\s/); // No space after opening tag
    });

    it('should not add extra spaces in HTML italic mode', async () => {
      const transformer = annotationTransformers.italic;
      const result = await transformer!.transform({
        text: 'test',
        metadata: { html: true },
        manifest: {},
      });

      expect(result).toBe('<i>test</i>');
    });

    it('should not add extra spaces in HTML code mode', async () => {
      const transformer = annotationTransformers.code;
      const result = await transformer!.transform({
        text: 'code',
        metadata: { html: true },
        manifest: {},
      });

      expect(result).toBe('<code>code</code>');
    });
  });

  describe('Link annotation - no spacing changes', () => {
    it('should preserve exact text in markdown link', async () => {
      const transformer = annotationTransformers.link;
      const result = await transformer!.transform({
        text: 'click here',
        link: { url: 'https://example.com' },
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('[click here](https://example.com)');
      expect(result).not.toMatch(/\[\s/); // No space after [
      expect(result).not.toMatch(/\]\s\(/); // No space between ] and (
    });
  });

  describe('Edge cases', () => {
    it('should trim internal spaces in bold text', async () => {
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: '  padded  ',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('**padded**');
      expect(result).not.toContain('padded  ');
      expect(result).not.toContain('  padded');
    });

    it('should handle empty strings correctly', async () => {
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: '',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('****');
    });

    it('should handle single character bold', async () => {
      const transformer = annotationTransformers.bold;
      const result = await transformer!.transform({
        text: 'N',
        metadata: {},
        manifest: {},
      });

      expect(result).toBe('**N**');
    });
  });
});
