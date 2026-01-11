# Open Issues for v4.0.0-alpha

## 🔴 HIGH PRIORITY (Critical Bugs)

### 1. #140 - Nested Lists and Maths Rendering (bug, v4, priority:high) ✅ RESOLVED

- **URL**: https://github.com/souvikinator/notion-to-md/issues/140
- **Created**: 2025-05-17
- **Comments**: 8
- **Status**: RESOLVED in alpha.8
- **Details**: Fixed sibling numbered list numbering, callout duplicate prefix, and annotation spacing
- **Changes**:
  - `src/core/renderer/index.ts` - Added `processChildrenWithNumbering()` helper for sequential numbering
  - `src/plugins/renderer/mdx/transformers/blocks.ts` - Fixed callout transformer duplicate prefix
  - `src/plugins/renderer/mdx/transformers/annotations.ts` - Removed extra spaces around annotations
  - `tests/rca-140-*.ts` - Added comprehensive test suite for issue #140 scenarios

### 2. #162 - Block indentation is not preserved

- **URL**: https://github.com/souvikinator/notion-to-md/issues/162
- **Created**: 2025-07-26
- **Comments**: 1
- **Status**: Related to #140, work in progress
- **Details**: Owner confirmed this is related to #140 and work in progress

### 3. #158 - Child database not converting to MD when parent is a workspace (bug, v4)

- **URL**: https://github.com/souvikinator/notion-to-md/issues/158
- **Created**: 2025-07-18
- **Comments**: 0
- **Status**: No response yet

### 4. #151 - v4 MDX output produces final content with consistent line breaks (bug, v4)

- **URL**: https://github.com/souvikinator/notion-to-md/issues/151
- **Created**: 2025-06-29
- **Comments**: 0
- **Status**: No response yet

---

## 🟡 MEDIUM PRIORITY (Recent Bugs & Features)

### 5. #163 - Only one image is downloaded for every converted page using the `downloadMediaTo` option

- **URL**: https://github.com/souvikinator/notion-to-md/issues/163
- **Created**: 2025-07-26
- **Comments**: 1
- **Status**: Owner responded they'll look into it

### 6. #166 - Numbered list in Notion serialized as bullet list in Markdown

- **URL**: https://github.com/souvikinator/notion-to-md/issues/166
- **Created**: 2025-08-15
- **Comments**: 0

### 7. #164 - Extra spaces in rendered

- **URL**: https://github.com/souvikinator/notion-to-md/issues/164
- **Created**: 2025-08-11
- **Comments**: 1

### 8. #161 - Feature: Add support for "Link to block" to URL hash conversion

- **URL**: https://github.com/souvikinator/notion-to-md/issues/161
- **Created**: 2025-07-21
- **Comments**: 1
- **Status**: Owner said: "Will try to get this live in the next release asap"

---

## ✅ RESOLVED in v4 (Can be ignored)

### #26 - feature: handle properties as frontmatter

- **Status**: Live on v4 alpha
- **Details**: Frontmatter support is implemented in v4

### #133 - Enhance media handler to handle Notion Database and Notion Page properties

- **Status**: Live on alpha.5
- **Details**: Media handling for properties is implemented

### #22 - not support notion database

- **Status**: v4 supports child_databases
- **Details**: v4 supports child_databases with custom transformers

### #146 - Support for custom link transforms (overriding md.link)

- **Status**: v4 has annotation transformers
- **Details**: v4 includes annotation transformers for link handling

### #95 - Significant Performance Improvement in Markdown Conversion Process

- **Status**: v4 architecture solves this
- **Details**: v4's new architecture addresses performance issues

### #98 - Children blocks with custom transformers are not included in the output

- **Status**: v4 architecture solves this
- **Details**: v4's new architecture handles custom transformers properly

### #106 - Child Page Reference in `toMarkdownString()` with `separateChildPage = true`

- **Status**: v4-candidate, addressed in new architecture

---

## 📝 LOW PRIORITY (Old v4-candidate issues - need validation)

### #10 - Missing tests

- **Created**: 2021-12-19
- **Labels**: enhancement, v4-candidate

### #100 - Can I get color info from notion?

- **Created**: 2023-11-03
- **Labels**: enhancement, v4-candidate

### #104 - Can you turn this into an N8N node?

- **Created**: 2023-12-29
- **Labels**: enhancement, good first issue, v4-candidate

### #72 - Use [[page title]] instead of [page title](ID#)?

- **Created**: 2023-04-16
- **Labels**: None

---

## Summary

- **High Priority Issues**: 3 (critical bugs, work in progress) - #140 resolved in alpha.8
- **Medium Priority Issues**: 4 (recent bugs & features)
- **Resolved in v4**: 8 issues (implemented or addressed)
- **Low Priority**: 4 issues (old v4-candidate, need validation)

**Total Unresolved Issues**: 7 (High + Medium Priority)
