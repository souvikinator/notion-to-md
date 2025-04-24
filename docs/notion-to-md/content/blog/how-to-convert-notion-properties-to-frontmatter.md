---
title: How to Convert Notion Properties to Frontmatter with notion-to-md v4
date: 2025-03-12
authors:
  - name: souvikinator
    link: https://github.com/souvikinator
    image: https://avatars.githubusercontent.com/u/64456160?s=96&v=4
tags:
  - tutorial
  - markdown
  - v4
  - notion-to-md
  - transformers
  - renderer plugin
  - frontmatter
excludeSearch: true
comments: true
---

Converting Notion page properties to frontmatter is a common need when using Notion as a CMS. notion-to-md v4 makes this straightforward with its built-in support and further we can see how we can customize it. Let's explore how!

## Built-In Frontmatter Support

The default MDX renderer that comes with notion-to-md v4 already supports frontmatter generation. By default it is set to false. Here's how you utilize it:

```typescript
import { NotionConverter } from 'notion-to-md';
import { MDXRenderer } from 'notion-to-md/plugins/renderer';

const notionClient = new NotionClient({ auth: process.env.NOTION_TOKEN });

const n2m = new NotionConverter(notionClient).withRenderer(
  new MDXRenderer({
    frontmatter: true, // Enable frontmatter generation, default is false
  }),
);

await n2m.convert('your-page-id');
```

This will automatically convert all Notion page properties to YAML frontmatter! Here is our sample page with certain properties:

![notion page properties for frontmatter](/images/notion-properties-front-matter.png)

and this is what the output looks like:

```yaml
---
Created: '2025-01-04T02:17:00.000Z'
Tags: ['V4', 'notion to md', 'test']
PublishURL: '/page-1'
Name: 'Notion Properties as Frontmatter'
---
```

## Customizing Frontmatter

While the default method works well in many situations, you may require additional control over which attributes are included and how they are displayed. The MDXRenderer offers several configuration options for customizing frontmatter.

### Basic Configuration

```typescript {hl_lines=[6,9,10,11,12,14,15,16]}
const renderer = new MDXRenderer({
  frontmatter: {
    // Only include specific properties
    // include: ["PublishUrl"],
    // or
    exclude: ['PublishURL'],

    // set defaults
    defaults: {
      draft: true,
      comments: 'true',
    },

    rename: {
      Name: 'title',
    },
  },
});
```

> [!TIP]
> To know more about the Default renderer configuration options, read the [MDXRenderer configuration](../../docs/v4/concepts/configuration/#mdx-renderer-configuration)

Running this against the same Notion page will produce the following frontmatter:

```yaml
---
Created: '2025-01-04T02:17:00.000Z'
Tags: ['V4', 'notion to md', 'test']
title: 'Notion Properties as Frontmatter'
draft: true
comments: 'true'
---
```

### Transforming Properties

For more granular control over the _value_ of a property, the `transform` option allows you to provide custom functions to process specific properties before they are added to the frontmatter. Each transform function receives the Notion property object and all page properties, returning the final string value.

> [!NOTE] The property name is case sensitive

```typescript
import {
  NotionPageProperty,
  NotionPageProperties,
} from 'notion-to-md/types/notion';

const renderer = new MDXRenderer({
  frontmatter: {
    transform: {
      // Format dates in ISO format (YYYY-MM-DD)
      date: (property, _allProperties): string => {
        if (property.type !== 'date' || !property.date?.start) return '';
        return new Date(property.date.start).toISOString().split('T')[0];
      },

      // Convert tags to lowercase and return as JSON array string
      tags: (property, _allProperties): string => {
        if (property.type !== 'multi_select') return '';
        return JSON.stringify(
          property.multi_select.map((tag) => tag.name.toLowerCase()),
        );
      },

      // Generate slug from title property (assuming property named 'Name')
      slug: (_property, allProperties): string => {
        const titleProp = allProperties['Name'];
        if (!titleProp || titleProp.type !== 'title') return '';
        const title = titleProp.title.map((t) => t.plain_text).join('');
        return title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      },
    },
  },
});
```

This provides powerful customization without needing to override the entire frontmatter logic.

### Fine-Tuning with a Custom Variable Resolver (Advanced)

> [!TIP]
> A prerequisite going further would be having understanding of [how one can modify any existing renderer plugin](../../docs/v4/guides/how-to-modify-renderer-plugin/).

The renderer plugin uses `frontmatter` [variable to resolve frontmatter values](../../docs/v4/concepts/renderer-plugin/variables-and-templates). You can customize this behavior by adding a custom variable resolver. This method is perfect for implementing unique formatting or transformation rules, allowing you complete control over how properties are processed and displayed.

**Use Case**: Formatting Tags for a Blog Post.

Assume you're creating a blog and want your Notion "Tags" property (a multi-select field) to appear as a well-formatted list in the frontmatter. While the new `transform` option could handle formatting the tags array itself (e.g., converting to lowercase), if you need complete control over the final YAML output structure for _all_ frontmatter, overriding the resolver is still the way to go.

```typescript {hl_lines=[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]}
import { MDXRenderer } from 'notion-to-md/plugins/renderer';

const renderer = new MDXRenderer();

// Customize frontmatter with a variable resolver
renderer.addVariable('frontmatter', async (_, context) => {
  const properties = context.pageProperties;

  // Extract title and tags
  const title = properties?.Name?.title?.[0]?.plain_text || 'No Title';
  const tags = properties?.Tags?.multi_select?.map((tag) => tag.name) || [];

  // Format tags as a YAML list
  const tagsList =
    tags.length > 0
      ? `tags:\n  ${tags.map((tag: string) => `- ${tag}`).join('\n  ')}`
      : '';

  // Return the custom frontmatter
  return `---
title: "${title}"
${tagsList}
---
`;
});
```

the output:

```yaml
---
title: 'Notion Properties as Frontmatter'
tags:
  - V4
  - notion to md
  - test
---
```

oh and the best part is the configuration and the custom variable resolver works together.

> [!TIP]
> Read more about the [context](../../docs/v4/concepts/renderer-plugin/context) we are using to access properties and other things.

## Conclusion

The [plugin system](../../docs/v4/concepts/renderer-plugin/) in notion-to-md v4 makes it easy to customize every aspect of the conversion process, ensuring that your content maintains its structure and metadata as it moves from Notion to your publishing platforms.

For more advanced customization, check out the guide on [creating a renderer plugin from scratch](../../docs/v4/guides/how-to-create-renderer-from-scratch).

> [!NOTE]
>
> ## Share Your Use Case and Work
>
> Have you created an interesting customization or workflow with notion-to-md?
> We'd love to hear about it! Consider sharing your experience by:
>
> 1. Creating a blog post in the [notion-to-md blog](/notion-to-md/blog/) section
> 2. Adding an entry to our [plugin catalog](/notion-to-md/catalogue/) if you've built a > reusable plugin
> 3. Joining our community discussions on GitHub
>
> Your real-world examples can help others unlock the full potential of using Notion as a content source!
