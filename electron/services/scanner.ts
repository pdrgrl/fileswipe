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
  'tmp',
  '.fileswipe_staging',
  '.fileswipe_trash'
])

export async function scanDirectory(
  rawPath: string,
  options: Partial<ScanFilterOptions> = {}
): Promise<ScanResult> {
  console.log('[Scanner] scanDirectory called with rawPath:', rawPath, 'options:', options)
  let rootPath = path.resolve(rawPath)

  try {
    const rootStat = await fs.stat(rootPath)
    if (!rootStat.isDirectory()) {
      console.log('[Scanner] Selected path is a file, switching to parent folder:', path.dirname(rootPath))
      rootPath = path.dirname(rootPath)
    }
  } catch (err) {
    console.error('[Scanner] Failed to stat rootPath:', rootPath, err)
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

  let scannedCount = 0

  async function traverse(currentDir: string, depth = 0) {
    // Prevent runaway recursion beyond depth 10
    if (depth > 10) return

    let entries
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true })
    } catch (err) {
      console.warn(`[Scanner] Could not read dir ${currentDir}:`, err)
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      // Skip hidden files/folders if not included
      if (!includeHidden && entry.name.startsWith('.') && entry.name !== '.') {
        continue
      }

      if (entry.isDirectory()) {
        if (IGNORED_FOLDERS.has(entry.name)) {
          continue
        }
        if (recursive) {
          await traverse(fullPath, depth + 1)
        }
      } else if (entry.isFile()) {
        scannedCount++
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
            createdAt: stats.birthtimeMs
          }

          files.push(fileItem)
          totalBytes += sizeBytes
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        } catch (fileErr) {
          console.warn(`[Scanner] Could not stat file ${fullPath}:`, fileErr)
        }
      }
    }
  }

  const startTime = Date.now()
  await traverse(rootPath)
  const elapsed = Date.now() - startTime
  console.log(`[Scanner] Scan finished in ${elapsed}ms: scanned ${scannedCount} entries, matched ${files.length} files (${totalBytes} bytes)`)

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
