import { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } from 'electron'
import path from 'node:path'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { scanDirectory } from './services/scanner'
import type { ScanFilterOptions } from '../src/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('[Main Process] Starting FileSwipe...')
const preloadCjs = path.join(__dirname, 'preload.cjs')
const preloadJs = path.join(__dirname, 'preload.js')
const preloadPath = fsSync.existsSync(preloadCjs) ? preloadCjs : preloadJs
console.log('[Main Process] Preload script selected:', preloadPath, 'exists:', fsSync.existsSync(preloadPath))

// Register privileged custom scheme for serving local media
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true
    }
  }
])

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 840,
    minWidth: 800,
    minHeight: 650,
    frame: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#090b10',
      symbolColor: '#94a3b8',
      height: 56
    },
    backgroundColor: '#090b10',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    }
  })

  // Set App title
  mainWindow.setTitle('FileSwipe - Tinder for Files')

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('[Main Process] Loading dev server URL:', process.env.VITE_DEV_SERVER_URL)
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Open DevTools in dev mode to facilitate debugging
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    console.log('[Main Process] Loading production index.html')
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Setup custom protocol for media files
function registerMediaProtocol() {
  protocol.handle('media-file', (request) => {
    try {
      let decodedUrl = decodeURIComponent(request.url.replace(/^media-file:\/\//, ''))
      
      if (process.platform === 'win32' && decodedUrl.match(/^\/[a-zA-Z]:/)) {
        decodedUrl = decodedUrl.substring(1)
      }

      const fileUrl = pathToFileURL(decodedUrl).toString()
      return net.fetch(fileUrl)
    } catch (err) {
      console.error('Failed to handle media protocol:', err)
      return new Response('File not found', { status: 404 })
    }
  })
}

app.whenReady().then(() => {
  registerMediaProtocol()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers

// 1. Select Folder Dialog
ipcMain.handle('dialog:select-folder', async () => {
  console.log('[Main IPC] dialog:select-folder called')
  if (!mainWindow) {
    console.warn('[Main IPC] mainWindow is null')
    return null
  }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'dontAddToRecent'],
    title: 'Select Folder to Sweep'
  })

  console.log('[Main IPC] dialog:select-folder result:', result)
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
})

// 2. Scan Directory
ipcMain.handle('fs:scan-directory', async (_event, folderPath: string, options: Partial<ScanFilterOptions>) => {
  console.log('[Main IPC] fs:scan-directory called for:', folderPath, 'options:', options)
  const result = await scanDirectory(folderPath, options)
  console.log(`[Main IPC] scanDirectory completed with ${result.files.length} files`)
  return result
})

// 3. Move File to OS Trash / Recycle Bin
ipcMain.handle('fs:trash-file', async (_event, filePath: string) => {
  console.log('[Main IPC] fs:trash-file called for:', filePath)
  try {
    await shell.trashItem(filePath)
    console.log('[Main IPC] shell.trashItem succeeded')
    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Main IPC] Failed to trash file ${filePath}:`, errorMsg)
    return { success: false, error: errorMsg }
  }
})

// 4. Reveal in Explorer / Finder
ipcMain.handle('fs:reveal-item', async (_event, filePath: string) => {
  console.log('[Main IPC] fs:reveal-item called for:', filePath)
  shell.showItemInFolder(filePath)
})

// 5. Read Text Snippet for Code / Text previews
ipcMain.handle('fs:read-text-snippet', async (_event, filePath: string) => {
  try {
    const buffer = Buffer.alloc(10 * 1024) // up to 10KB
    const handle = await fs.open(filePath, 'r')
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    await handle.close()
    return buffer.toString('utf-8', 0, bytesRead)
  } catch (err) {
    console.error(`[Main IPC] Failed to read text snippet from ${filePath}:`, err)
    return null
  }
})

// 6. Window Controls
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize()
})
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window:close', () => {
  mainWindow?.close()
})
