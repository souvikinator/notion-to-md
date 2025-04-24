import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/plugins/renderer/index.ts',
    'src/plugins/exporter/index.ts',
    'src/utils/index.ts',
    'src/types/index.ts',
  ],
  format: ['cjs', 'esm'],
  splitting: true,
  clean: true,
  dts: true,
  shims: true,
  treeshake: true,
  outDir: 'build',
});
