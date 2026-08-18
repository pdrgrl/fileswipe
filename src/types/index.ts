export type FileCategory = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'code' 
  | 'document' 
  | 'archive' 
  | 'other'

export interface FileItem {
  id: string
  name: string
  path: string
  relativePath: string
  extension: string
  sizeBytes: number
  category: FileCategory
  mimeType: string
  modifiedAt: number
  createdAt: number
  textSnippet?: string
}

export type ActionType = 'keep' | 'delete' | 'skip'

export interface ActionHistoryItem {
  file: FileItem
  action: ActionType
  timestamp: number
}

export type SortOption = 
  | 'default'
  | 'size-desc' 
  | 'size-asc' 
  | 'date-desc' 
  | 'date-asc' 
  | 'name-asc' 
  | 'random'

export interface ScanFilterOptions {
  recursive: boolean
  includeHidden: boolean
  minSizeBytes: number
  categories: FileCategory[]
  sortBy: SortOption
}

export interface ScanResult {
  folderPath: string
  files: FileItem[]
  totalBytes: number
  categoryCounts: Record<FileCategory, number>
}

export interface StorageStats {
  initialTotalBytes: number
  reclaimedBytes: number
  keptBytes: number
  deletedCount: number
  keptCount: number
  skippedCount: number
  totalFiles: number
}

export interface WindowAPI {
  selectFolder: () => Promise<string | null>
  getPathForFile: (file: File) => string
  scanDirectory: (folderPath: string, options: Partial<ScanFilterOptions>) => Promise<ScanResult>
  trashFile: (filePath: string) => Promise<{ success: boolean; error?: string }>
  revealItem: (filePath: string) => Promise<void>
  readTextSnippet: (filePath: string) => Promise<string | null>
  getFileProtocolUrl: (filePath: string) => string
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
}

declare global {
  interface Window {
    api: WindowAPI
  }
}
