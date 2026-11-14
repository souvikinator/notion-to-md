/**
 * Bundles small apps that import one part of the built package, and fails if code
 * they did not import ends up in the bundle.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const cases = [
  {
    name: 'core with html',
    code: `import { notionToMd, notion } from 'notion-to-md'; import { html } from 'notion-to-md/html'; console.log(notionToMd, notion, html);`,
    mustNotContain: ['toMarkdown', 'gfmToMarkdown', 'mdxToMarkdown', 'node:fs'],
  },
  {
    name: 'markdown only',
    code: `import { markdown } from 'notion-to-md/markdown'; console.log(markdown);`,
    mustNotContain: ['mdxToMarkdown', 'node:fs', 'dataSources'],
  },
  {
    name: 'plugins only',
    code: `import { pageLinks } from 'notion-to-md/plugins'; console.log(pageLinks);`,
    mustNotContain: ['toMarkdown', 'node:fs', 'dataSources', 'frontmatter'],
  },
  {
    name: 'import without use',
    code: `import 'notion-to-md'; import 'notion-to-md/markdown'; import 'notion-to-md/node';`,
    maxBytes: 0,
  },
];

let failed = false;
for (const { name, code, mustNotContain = [], maxBytes } of cases) {
  const result = await build({
    stdin: { contents: code, resolveDir: root, loader: 'js' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    minify: false,
    treeShaking: true,
    logLevel: 'silent',
  });
  const output = result.outputFiles[0].text;
  const leaked = mustNotContain.filter((needle) => output.includes(needle));
  const tooBig = maxBytes !== undefined && output.trim().length > maxBytes;
  if (leaked.length > 0 || tooBig) {
    failed = true;
    console.error(
      `✗ ${name}: ${leaked.length ? `contains ${leaked.join(', ')}` : `${String(output.length)} bytes`}`,
    );
  } else {
    console.log(`✓ ${name} (${String(output.length)} bytes)`);
  }
}
process.exit(failed ? 1 : 0);
