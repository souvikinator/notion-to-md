import { callout, table } from './md';

describe('Callout', () => {
    test('parses callout without emoji', () => {
        const text = 'Call out text content.';

        expect(callout(text)).toBe(`> ${text}`);
    });

    test('parses callout with emoji', () => {
        const text = 'Call out text content.';

        expect(callout(text, {
            type: 'emoji',
            emoji: '😍'
        })).toBe(`> 😍 ${text}`);
    });

    test('turn simple tables to markdown table', () => {
        const matrix = [
            ['foo', 'bar', 'baz', 'quux'],
            ['A1', '1', 'red', 'Lorem Ipsum'],
            ['A2', '20', 'green', 'Dolor Sit'],
            ['A3', '300', 'blue', 'Amet'],
        ];

        const rendered = `
| foo | bar | baz   | quux        |
|-----|-----|-------|-------------|
| A1  | 1   | red   | Lorem Ipsum |
| A2  | 20  | green | Dolor Sit   |
| A3  | 300 | blue  | Amet        |
`;

        expect(table(matrix)).toBe(rendered.trim());
    });
});
