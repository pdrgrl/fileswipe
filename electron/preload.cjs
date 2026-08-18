const { contextBridge, ipcRenderer, webUtils } = require('electron')

console.log('[Preload] Initializing FileSwipe contextBridge...')

contextBridge.exposeInMainWorld('api', {
  selectFolder: () => {
    console.log('[Preload] api.selectFolder called')
    return ipcRenderer.invoke('dialog:select-folder')
  },
  getPathForFile: (file) => {
    console.log('[Preload] api.getPathForFile called with file:', file?.name)
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        const p = webUtils.getPathForFile(file)
        console.log('[Preload] webUtils.getPathForFile returned:', p)
        if (p) return p
      }
    } catch (err) {
      console.warn('[Preload] webUtils.getPathForFile error:', err)
    }
    return (file && file.path) ? file.path : ''
  },
  scanDirectory: (folderPath, options) => {
    console.log('[Preload] api.scanDirectory called with folderPath:', folderPath)
    return ipcRenderer.invoke('fs:scan-directory', folderPath, options)
  },
  trashFile: (filePath, fileId) => {
    console.log('[Preload] api.trashFile called for:', filePath, fileId)
    return ipcRenderer.invoke('fs:trash-file', filePath, fileId)
  },
  restoreFile: (filePath, fileId) => {
    console.log('[Preload] api.restoreFile called for:', filePath, fileId)
    return ipcRenderer.invoke('fs:restore-file', filePath, fileId)
  },
  purgeTrash: () => {
    return ipcRenderer.invoke('fs:purge-trash')
  },
  revealItem: (filePath) => {
    console.log('[Preload] api.revealItem called for:', filePath)
    return ipcRenderer.invoke('fs:reveal-item', filePath)
  },
  readTextSnippet: (filePath) => {
    return ipcRenderer.invoke('fs:read-text-snippet', filePath)
  },
  inspectArchive: (filePath) => {
    console.log('[Preload] api.inspectArchive called for:', filePath)
    return ipcRenderer.invoke('fs:inspect-archive', filePath)
  },
  getFileProtocolUrl: (filePath) => {
    const normalized = (filePath || '').replace(/\\/g, '/')
    const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`
    return `media-file://local${encodeURI(cleanPath)}`
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close')
})

console.log('[Preload] window.api successfully exposed to renderer!')
