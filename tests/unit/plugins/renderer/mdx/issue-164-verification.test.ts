import { describe, it, expect } from 'vitest';
import { annotationTransformers } from '@/plugins/renderer/mdx/transformers/annotations';

describe('Issue #164 - Exact Example Verification', () => {
  it('should convert the exact example from the issue correctly', async () => {
    // Simulated Notion rich text from the issue
    // Original: **NIST** stands for **N**ational **I**nstitute of **S**tandards and **T**echnology.
    const notionRichText = [
      {
        plain_text: 'NIST',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: ' stands for ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'N',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'ational ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'I',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'nstitute of ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'S',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'tandards and ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'T',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'echnology.',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
    ];

    // Simulate the transformRichText function
    const results = await Promise.all(
      notionRichText.map(async (item) => {
        let text = item.plain_text;
        const annotations = item.annotations;

        // Process annotations
        for (const [name, value] of Object.entries(annotations)) {
          if (value && annotationTransformers[name]) {
            text = await annotationTransformers[name]!.transform({
              text,
              annotations,
              metadata: {},
              manifest: {},
            });
          }
        }

        return text;
      }),
    );

    const result = results.join('');

    // Expected: **NIST** stands for **N**ational **I**nstitute of **S**tandards and **T**echnology.
    // Bug from issue:  **NIST**  stands for **N** ational **I** nstitute... (extra spaces)
    const expected: string =
      '**NIST** stands for **N**ational **I**nstitute of **S**tandards and **T**echnology.';

    expect(result).toBe(expected);
    expect(result).not.toMatch(/^\s/); // No leading space
    expect(result).not.toMatch(/\s\s/); // No double spaces
  });

  it('should NOT produce the buggy output from the issue', async () => {
    // The buggy output from the issue was:
    // " **NIST**  stands for **N** ational **I** nstitute of **S** tandards and **T** echnology."

    // Let's verify we don't produce that
    const notionRichText = [
      {
        plain_text: 'NIST',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: ' stands for ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'N',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'ational ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'I',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'nstitute of ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'S',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'tandards and ',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'T',
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
      {
        plain_text: 'echnology.',
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          code: false,
          underline: false,
          color: 'default' as any,
        },
      },
    ];

    const results = await Promise.all(
      notionRichText.map(async (item) => {
        let text = item.plain_text;
        const annotations = item.annotations;

        for (const [name, value] of Object.entries(annotations)) {
          if (value && annotationTransformers[name]) {
            text = await annotationTransformers[name]!.transform({
              text,
              annotations,
              metadata: {},
              manifest: {},
            });
          }
        }

        return text;
      }),
    );

    const result = results.join('');

    // Should NOT look like the buggy output
    const buggyOutput =
      ' **NIST**  stands for **N** ational **I** nstitute of **S** tandards and **T** echnology.';
    expect(result).not.toBe(buggyOutput);

    // Specifically check these bug symptoms
    expect(result).not.toMatch(/^ /); // Should not start with space
    expect(result).not.toMatch(/ {2}stands/); // Should not have "  stands" (double space)
    expect(result).not.toMatch(/N {2}ational/); // Should not break "National" with space
    expect(result).not.toMatch(/I {2}nstitute/); // Should not break "Institute" with space
    expect(result).not.toMatch(/S {2}tandards/); // Should not break "Standards" with space
    expect(result).not.toMatch(/T {2}echnology/); // Should not break "Technology" with space
  });
});
