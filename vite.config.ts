import { defineConfig } from 'vite'
import ViteReactRefresh from '@vitejs/plugin-react-refresh'
import { VitePluginNode } from 'vite-plugin-node'

const isViteNode = process.argv.some(x => x.includes('vite-node.js'));

export default defineConfig({
  plugins: isViteNode 
    ? [
      ...VitePluginNode({
        server: 'express', 
        appPath: './backend/index.ts',
        port: 3001,
        tsCompiler: 'esbuild',
      })
    ]
    : [
      ViteReactRefresh(),
    ]
})
