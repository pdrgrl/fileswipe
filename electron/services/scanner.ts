import fs from 'node:fs/promises'
import path from 'node:path'
import { classifyFile } from './fileClassifier'
import type { FileItem, ScanFilterOptions, ScanResult, FileCategory } from '../../src/types'

const IGNORED_FOLDERS = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '.idea',
  '.vscode',
  '$RECYCLE.BIN',
  'System Volume Information',
  '.cache',
  'dist',
  'dist-electron',
  'build',
  'out',
  'tmp'
])

export async function scanDirectory(
  rawPath: string,
  options: Partial<ScanFilterOptions> = {}
): Promise<ScanResult> {
  let rootPath = path.resolve(rawPath)

  try {
    const rootStat = await fs.stat(rootPath)
    if (!rootStat.isDirectory()) {
      // If a file was selected or dropped instead of a directory, sweep its parent folder
      rootPath = path.dirname(rootPath)
    }
  } catch (err) {
    console.error('Failed to stat rootPath:', rootPath, err)
  }

  const recursive = options.recursive ?? true
  const includeHidden = options.includeHidden ?? false
  const minSizeBytes = options.minSizeBytes ?? 0
  const allowedCategories = options.categories && options.categories.length > 0 
    ? new Set(options.categories) 
    : null
  const sortBy = options.sortBy ?? 'default'

  const files: FileItem[] = []
  let totalBytes = 0
  const categoryCounts: Record<FileCategory, number> = {
    image: 0,
    video: 0,
    audio: 0,
    code: 0,
    document: 0,
    archive: 0,
    other: 0
  }

  async function traverse(currentDir: string) {
    let entries
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true })
    } catch (err) {
      console.warn(`Could not read dir ${currentDir}:`, err)
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      // Skip hidden files if not included
      if (!includeHidden && entry.name.startsWith('.') && entry.name !== '.') {
        continue
      }

      if (entry.isDirectory()) {
        if (IGNORED_FOLDERS.has(entry.name)) {
          continue
        }
        if (recursive) {
          await traverse(fullPath)
        }
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(fullPath)
          const sizeBytes = stats.size

          if (sizeBytes < minSizeBytes) {
            continue
          }

          const { category, extension, mimeType } = classifyFile(entry.name)

          if (allowedCategories && !allowedCategories.has(category)) {
            continue
          }

          let textSnippet: string | undefined = undefined
          if (category === 'code' || (category === 'document' && ['txt', 'csv', 'tsv', 'md', 'json', 'log'].includes(extension))) {
            if (sizeBytes < 500 * 1024) { // Only snippet files < 500KB
              try {
                const handle = await fs.open(fullPath, 'r')
                const buffer = Buffer.alloc(Math.min(sizeBytes, 3072))
                await handle.read(buffer, 0, buffer.length, 0)
                await handle.close()
                textSnippet = buffer.toString('utf-8')
              } catch {
                // Ignore snippet read error
              }
            }
          }

          const relativePath = path.relative(rootPath, fullPath)
          const fileItem: FileItem = {
            id: `${fullPath}_${stats.mtimeMs}`,
            name: entry.name,
            path: fullPath,
            relativePath: relativePath || entry.name,
            extension,
            sizeBytes,
            category,
            mimeType,
            modifiedAt: stats.mtimeMs,
            createdAt: stats.birthtimeMs,
            textSnippet
          }

          files.push(fileItem)
          totalBytes += sizeBytes
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        } catch (fileErr) {
          console.warn(`Could not stat file ${fullPath}:`, fileErr)
        }
      }
    }
  }

  await traverse(rootPath)

  // Sort files
  if (sortBy === 'size-desc') {
    files.sort((a, b) => b.sizeBytes - a.sizeBytes)
  } else if (sortBy === 'size-asc') {
    files.sort((a, b) => a.sizeBytes - b.sizeBytes)
  } else if (sortBy === 'date-desc') {
    files.sort((a, b) => b.modifiedAt - a.modifiedAt)
  } else if (sortBy === 'date-asc') {
    files.sort((a, b) => a.modifiedAt - b.modifiedAt)
  } else if (sortBy === 'name-asc') {
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
  } else if (sortBy === 'random') {
    for (let i = files.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[files[i], files[j]] = [files[j], files[i]]
    }
  }

  return {
    folderPath: rootPath,
    files,
    totalBytes,
    categoryCounts
  }
}
