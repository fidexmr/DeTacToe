import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    outDir: 'build',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      util: 'util',
      web3: 'web3/dist/web3.min.js',
    },
  },
});
