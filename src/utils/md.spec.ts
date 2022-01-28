import { callout } from './md';

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
});
