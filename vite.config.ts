import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'public/index.html'),
      },
    },
  },
  server: {
    port: 3001, // Different from backend port
    open: true, // Automatically open the browser
  },
  publicDir: 'assets', // Assets that should not be processed
});
