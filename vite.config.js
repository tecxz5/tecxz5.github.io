import { defineConfig } from 'vite';

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
    emptyOutDir: true
  }
});
