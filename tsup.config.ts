import { defineConfig, type Options } from 'tsup';

const entry = {
  index: 'src/index.ts',
  markdown: 'src/render/markdown/index.ts',
  mdx: 'src/render/mdx/index.ts',
  html: 'src/render/html/index.ts',
  plugins: 'src/plugins/index.ts',
  node: 'src/node/index.ts',
};

const shared: Options = {
  entry,
  outDir: 'build',
  target: 'node22',
  platform: 'neutral',
  dts: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
};

export default defineConfig([
  // ESM keeps dependencies external so bundlers can share and tree-shake them.
  { ...shared, format: 'esm', clean: true },
  // The mdast libraries are ESM-only, so CommonJS consumers get them bundled in.
  {
    ...shared,
    format: 'cjs',
    noExternal: [/^mdast-/, /^micromark/, /^unist-/],
  },
]);
