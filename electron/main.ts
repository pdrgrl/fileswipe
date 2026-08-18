import { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { scanDirectory } from './services/scanner'
import type { ScanFilterOptions } from '../src/types'

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
      height: 38
    },
    backgroundColor: '#090b10',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  })

  // Set App title
  mainWindow.setTitle('FileSwipe - Tinder for Files')

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
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
      // url is e.g. media-file://C:/Users/pedro/Pictures/test.png or media-file:///home/user/test.png
      let decodedUrl = decodeURIComponent(request.url.replace(/^media-file:\/\//, ''))
      
      // On Windows, if path starts with /C:/, strip leading slash
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
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Folder to Sweep'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
})

// 2. Scan Directory
ipcMain.handle('fs:scan-directory', async (_event, folderPath: string, options: Partial<ScanFilterOptions>) => {
  return await scanDirectory(folderPath, options)
})

// 3. Move File to OS Trash / Recycle Bin
ipcMain.handle('fs:trash-file', async (_event, filePath: string) => {
  try {
    await shell.trashItem(filePath)
    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`Failed to trash file ${filePath}:`, errorMsg)
    return { success: false, error: errorMsg }
  }
})

// 4. Reveal in Explorer / Finder
ipcMain.handle('fs:reveal-item', async (_event, filePath: string) => {
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
    console.error(`Failed to read text snippet from ${filePath}:`, err)
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
