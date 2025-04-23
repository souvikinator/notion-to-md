---
title: Changelog
description: History of changes for notion-to-md v4 releases.
weight: 5
---

This page documents the changes made in notion-to-md v4 releases.

> [!NOTE]
> This is an early alpha release meant for testing and feedback. The API may change before the stable release.

## [v4.0.0-alpha.5](./whats-new-in-v4-0-0-alpha-5/)

_Released: April 24, 2025_

### Key Highlights

- **Enhanced Frontmatter Configuration:** Gain more control over how Notion properties translate into frontmatter metadata, including powerful value transformations. Learn more: [What's New in v4.0.0-alpha.5](./whats-new-in-v4-0-0-alpha-5/#enhanced-frontmatter-configuration).

[Full Changelog](https://github.com/souvikinator/notion-to-md/compare/v4.0.0-alpha.4...v4.0.0-alpha.5)

---

## [v4.0.0-alpha.4](https://github.com/souvikinator/notion-to-md/releases/tag/v4.0.0-alpha.4)

_Released: March 13, 2025_

### Package Improvements

- Migrated build system from `tsc` to `tsup` for improved bundling
- Reduced bundle size by approx 35.52% (compared to other alpha v4 release)
- Restructured package with barrel files for cleaner imports on the user end
- Added `exports` and `typeVersion` properties for better TypeScript support
- Fixed TypeScript configuration discrepancies

### Plugin Development

- Added manifest manager access in renderer context for plugin developers, making it easier to access media/documents related info
- The media handler now performs path transformation (if provided) even if the media Notion block hasn't changed.

### Documentation

- Added new blog posts on:
  - "[How to Convert Notion Properties to Frontmatter](https://docs.joinescape.org/notion-to-md/blog/how-to-convert-notion-properties-to-frontmatter/)"
  - "[How to Convert Notion Comments to Markdown Footnotes](https://docs.joinescape.org/notion-to-md/blog/how-to-use-notion-comments-as-footnotes-in-markdown/)"
  - "[How to handle embedded media/documents like pdf in Notion](https://docs.joinescape.org/notion-to-md/blog/how-to-handle-documents-in-notion-using/)"
- Enabled comments on documentation pages
- Updated Hugo configuration for better docs site functionality

[Full Changelog](https://github.com/souvikinator/notion-to-md/compare/v4.0.0-alpha.3...v4.0.0-alpha.4)

---

## [v4.0.0-alpha.3](https://github.com/souvikinator/notion-to-md/releases/tag/v4.0.0-alpha.3)

_Released: March 9, 2025_

### Changes

- Fixed model resolution and IntelliSense issues after the build
- Moved `@notionhq/client` from dependency to peer dependency

[Full Changelog](https://github.com/souvikinator/notion-to-md/compare/v4.0.0-alpha.2...v4.0.0-alpha.3)

---

## [v4.0.0-alpha.2](https://github.com/souvikinator/notion-to-md/releases/tag/v4.0.0-alpha.2)

_Released: March 8, 2025_

This is the first alpha release of **notion-to-md v4.0.0**, a complete redesign that transforms the library from a simple markdown converter into a powerful and extensible content transformation system.

### Key Features

#### Extensibility

- Create custom formats beyond just Markdown
- Define exactly how each Notion element should appear
- Connect Notion to any publishing system or workflow

#### From Notion to Anywhere

- Turn Notion pages into blog posts, React components, documentation sites and a lot more
- Use Notion as your editor while publishing anywhere

#### Media Made Easy

- Store media where you need them: local folders, S3, your CDN or anywhere
- Full control over the media management

#### Cross-References

- Links between Notion pages work properly in your published content
- Automatically transform internal Notion links to your site's URL structure
- Keep your content connected even outside Notion

### What's New

- **Builder Pattern API**: Intuitive configuration with method chaining
- **Modular Architecture**: Core functionality is now divided into specialized components
- **Plugin System**: Easily extend with custom renderers to output any format (MD, MDX, HTML, JSX, etc.)
- **Robust Media Handling**: Multiple strategies for media content (direct URLs, download, upload to storage)
- **Page References**: Automatic handling of Notion page links for proper cross-references
- **Improved Performance**: Optimized block fetching with concurrency control

---
