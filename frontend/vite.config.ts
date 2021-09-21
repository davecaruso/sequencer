import { defineConfig } from 'vite';
import ViteReactRefresh from '@vitejs/plugin-react-refresh';
import reactJsx from 'vite-react-jsx';
import svgrPlugin from '@honkhonk/vite-plugin-svgr';

export default defineConfig({
  plugins: [ViteReactRefresh(), svgrPlugin(), reactJsx()],
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
});
