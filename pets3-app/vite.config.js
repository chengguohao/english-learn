import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { wordsDataPlugin } from './words-plugin.js';

export default defineConfig({
  plugins: [viteSingleFile(), wordsDataPlugin()],
  base: './',
  build: {
    outDir: 'www',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
