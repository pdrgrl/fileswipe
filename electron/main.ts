import { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } from 'electron'
import path from 'node:path'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { scanDirectory } from './services/scanner'
import type { ScanFilterOptions } from '../src/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('[Main Process] Starting FileSwipe...')

function resolvePreload(): string {
  const candidates = [
    path.join(__dirname, 'preload.cjs'),
    path.join(process.cwd(), 'electron/preload.cjs'),
    path.join(__dirname, 'preload.js'),
    path.join(process.cwd(), 'dist-electron/preload.cjs')
  ]
  for (const c of candidates) {
    if (fsSync.existsSync(c)) {
      console.log('[Main Process] Resolved preload path:', c)
      return c
    }
  }
  console.warn('[Main Process] Preload candidate fallback:', candidates[0])
  return candidates[0]
}
const preloadPath = resolvePreload()

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
      let decodedUrl = decodeURIComponent(request.url.replace(/^media-file:\/\/(local\/)?/, ''))
      
      if (process.platform === 'win32') {
        if (decodedUrl.match(/^\/?[a-zA-Z]:/)) {
          decodedUrl = decodedUrl.replace(/^\//, '')
        } else if (decodedUrl.match(/^[a-zA-Z]\//)) {
          decodedUrl = `${decodedUrl[0]}:/${decodedUrl.substring(2)}`
        }
      }

      const fileUrl = pathToFileURL(decodedUrl).toString()
      return net.fetch(fileUrl)
    } catch (err) {
      console.error('[Media Protocol] Failed to handle media request for:', request.url, err)
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

// Safe Staging for Instant Undo & OS Trash Management
const stagingDir = path.join(app.getPath('temp'), 'fileswipe_staging')
if (!fsSync.existsSync(stagingDir)) {
  fsSync.mkdirSync(stagingDir, { recursive: true })
}

interface StagedEntry {
  originalPath: string
  stagedPath: string
  timestamp: number
}
const stagedFiles = new Map<string, StagedEntry>()

async function purgeStagedFiles() {
  if (stagedFiles.size === 0) return
  console.log(`[Main] Purging ${stagedFiles.size} staged files to OS Recycle Bin...`)
  for (const [, entry] of stagedFiles.entries()) {
    try {
      if (fsSync.existsSync(entry.stagedPath)) {
        await shell.trashItem(entry.stagedPath)
      }
    } catch (e) {
      console.warn(`[Main] Error sending staged file ${entry.stagedPath} to trash:`, e)
    }
  }
  stagedFiles.clear()
}

app.on('will-quit', async () => {
  await purgeStagedFiles()
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

// 3. Move File to Safe Staging (Allows instantaneous Undo restoration)
ipcMain.handle('fs:trash-file', async (_event, filePath: string, fileId?: string) => {
  console.log('[Main IPC] fs:trash-file called for:', filePath)
  try {
    const key = fileId || filePath
    const fileName = path.basename(filePath)
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${fileName}`
    const stagedPath = path.join(stagingDir, uniqueName)

    // Move file to staging
    await fs.rename(filePath, stagedPath)

    stagedFiles.set(key, {
      originalPath: filePath,
      stagedPath,
      timestamp: Date.now()
    })

    console.log('[Main IPC] File staged successfully to:', stagedPath)
    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Main IPC] Failed to stage file ${filePath}:`, errorMsg)
    return { success: false, error: errorMsg }
  }
})

// 4. Restore File from Staging on Undo (Instant restoration on disk)
ipcMain.handle('fs:restore-file', async (_event, filePath: string, fileId?: string) => {
  console.log('[Main IPC] fs:restore-file called for:', filePath)
  try {
    const key = fileId || filePath
    const entry = stagedFiles.get(key)
    if (!entry) {
      console.warn('[Main IPC] No staged file found for key:', key)
      return { success: false, error: 'File was not in staging buffer' }
    }

    const targetDir = path.dirname(entry.originalPath)
    if (!fsSync.existsSync(targetDir)) {
      await fs.mkdir(targetDir, { recursive: true })
    }

    // Move file back from staging to original path
    await fs.rename(entry.stagedPath, entry.originalPath)
    stagedFiles.delete(key)

    console.log('[Main IPC] File successfully restored on disk to:', entry.originalPath)
    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Main IPC] Failed to restore file ${filePath}:`, errorMsg)
    return { success: false, error: errorMsg }
  }
})

// 5. Purge Staged Files
ipcMain.handle('fs:purge-trash', async () => {
  await purgeStagedFiles()
})

// 6. Reveal in Explorer / Finder
ipcMain.handle('fs:reveal-item', async (_event, filePath: string) => {
  console.log('[Main IPC] fs:reveal-item called for:', filePath)
  shell.showItemInFolder(filePath)
})

// 7. Read Text Snippet for Code / Text previews
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

// 8. Window Controls
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
