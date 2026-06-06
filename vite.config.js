import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'site',
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'site/index.html'),
        generator: resolve(__dirname, 'site/generator.html')
      }
    }
  }
});
