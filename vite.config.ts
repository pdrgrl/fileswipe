import { defineConfig } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function copyPreloadPlugin() {
  const copyPreload = () => {
    try {
      const src = path.join(__dirname, 'electron/preload.cjs')
      const destDir = path.join(__dirname, 'dist-electron')
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(destDir, 'preload.cjs'))
        fs.copyFileSync(src, path.join(destDir, 'preload.js'))
      }
    } catch (e) {
      console.error('Failed to copy preload.cjs:', e)
    }
  }

  return {
    name: 'copy-preload-plugin',
    buildStart() {
      copyPreload()
    },
    closeBundle() {
      copyPreload()
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyPreloadPlugin(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
