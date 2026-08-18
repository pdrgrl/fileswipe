import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { ScanFilterOptions, ScanResult } from '../src/types'

contextBridge.exposeInMainWorld('api', {
  selectFolder: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:select-folder')
  },
  getPathForFile: (file: File): string => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file)
      }
    } catch (err) {
      console.warn('webUtils.getPathForFile failed:', err)
    }
    return (file as unknown as { path?: string }).path || ''
  },
  scanDirectory: (folderPath: string, options: Partial<ScanFilterOptions>): Promise<ScanResult> => {
    return ipcRenderer.invoke('fs:scan-directory', folderPath, options)
  },
  trashFile: (filePath: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('fs:trash-file', filePath)
  },
  revealItem: (filePath: string): Promise<void> => {
    return ipcRenderer.invoke('fs:reveal-item', filePath)
  },
  readTextSnippet: (filePath: string): Promise<string | null> => {
    return ipcRenderer.invoke('fs:read-text-snippet', filePath)
  },
  getFileProtocolUrl: (filePath: string): string => {
    // Converts local path into our custom media-file:// protocol
    const normalized = filePath.replace(/\\/g, '/')
    return `media-file://${encodeURI(normalized)}`
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close')
})
