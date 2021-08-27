import { defineConfig } from 'vite';
import ViteReactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
  plugins: [ViteReactRefresh()],
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
});
