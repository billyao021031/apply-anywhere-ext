import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-static-files',
      writeBundle() {
        // Copy manifest.json and popup.html to dist
        const filesToCopy = ['manifest.json', 'popup.html'];
        filesToCopy.forEach(file => {
          if (existsSync(file)) {
            copyFileSync(file, resolve(__dirname, 'dist', file));
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
        popup: resolve(__dirname, 'src/popup/main.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
