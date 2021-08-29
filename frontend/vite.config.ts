import { defineConfig } from 'vite';
import ViteReactRefresh from '@vitejs/plugin-react-refresh';
import svgrPlugin from '@honkhonk/vite-plugin-svgr';

export default defineConfig({
  plugins: [ViteReactRefresh(), svgrPlugin()],
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
});
