---
title: "Annotation Transformers"
description: "Understanding the annotation transformer and the possibilities it offers"
weight: 4
---

Annotation transformers handle text styling and formatting within blocks. They work at the character level, handling things like bold, italic, code, etc.

#### Basic Structure

```typescript
type AnnotationTransformer = {
  transform: (params: {
    text: string;           // The text to transform
    annotations?: Record<string, boolean>;  // All annotations on this text
    metadata?: any;         // Additional context if needed
  }) => Promise<string>;
}
```

These ensure consistent formatting throughout your document, regardless of which block the text appears in.

#### Simple Example

Here's how you can create basic annotation transformers:

```typescript
const annotationTransformers = {
  // Makes text bold using **text**
  bold: {
    transform: async ({ text }) => `**${text}**`
  },

  // Makes text italic using *text*
  italic: {
    transform: async ({ text }) => `*${text}*`
  },

  // Creates inline code using `text`
  code: {
    transform: async ({ text }) => `\`${text}\``
  }
};
```

#### Real-World Examples

1. **Flexible Text Formatting**
```typescript
// Transformer that can output either Markdown or HTML
const boldTransformer = {
  transform: async ({ text, metadata }) => {
    // Use HTML when specified in metadata
    if (metadata?.html) {
      return `<strong>${text}</strong>`;
    }
    // Default to Markdown
    return `**${text}**`;
  }
};
```

2. **Link Handling**
```typescript
const linkTransformer = {
  transform: async ({ text, link }) => {
    if (!link?.url) return text;
    return `[${text}](${link.url})`;
  }
};
```

3. **Math Equations**
```typescript
const equationTransformer = {
  transform: async ({ text }) => {
    return `$${text}$`;  // Inline LaTeX format
  }
};
```

The renderer processes these in order, so transformers should be designed to work together.

#### Example Usage

```typescript
class MyRenderer extends BaseRendererPlugin {
  constructor() {
    super();

    // Register annotation transformers
    this.createAnnotationTransformers({
      bold: {
        transform: async ({ text }) => `**${text}**`
      },
      italic: {
        transform: async ({ text }) => `*${text}*`
      },
      code: {
        transform: async ({ text }) => `\`${text}\``
      },
      // NOTE: must include it's transformer if you since it's not considered as a annotation by the notion but
      // to make sure that people have the control over the links transformation we allow them to add link as annotation transformer.
      link: {
        transform: async ({ text, link }) =>
          link?.url ? `[${text}](${link.url})` : text
      }
    });
  }
}
```

{{< callout type="info" >}}
It's **better to define a link annotation transformer** if you are building a custom renderer since it's not considered as a annotation by the notion but
to make sure that people have the control over the links transformation we allow them to add link as annotation transformer.
{{< /callout >}}

#### Tips for Creating Annotation Transformers

1. **Keep It Simple**
   - Each transformer should do one thing well
   - Return just the transformed text

2. **Handle Edge Cases**
   - Empty text
   - Missing or invalid links
   - Special characters that might need escaping

3. **Consider Context**
   - Use metadata for your use case
   - Check other annotations when needed

4. **Common Use Cases**
   - Text styling (bold, italic, underline)
   - Links and references
   - Code formatting
   - Math equations
   - Custom inline elements
