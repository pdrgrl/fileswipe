import fs from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'
import type { ArchiveInspectionResult, ArchiveEntry } from '../../src/types'

export async function inspectArchive(filePath: string): Promise<ArchiveInspectionResult> {
  const ext = path.extname(filePath).toLowerCase().replace(/^\./, '')
  
  if (ext === 'zip') {
    try {
      const data = await fs.readFile(filePath)
      const zip = await JSZip.loadAsync(data)
      
      const entries: ArchiveEntry[] = []
      let totalFiles = 0
      let totalDirs = 0
      let uncompressedBytes = 0

      zip.forEach((relativePath, zipEntry) => {
        const isDir = zipEntry.dir
        if (isDir) {
          totalDirs++
        } else {
          totalFiles++
        }

        // @ts-expect-error _data exists on JSZipObject internal representation
        const uncompressedSize = zipEntry._data ? (zipEntry._data.uncompressedSize || 0) : 0
        uncompressedBytes += uncompressedSize

        entries.push({
          name: relativePath,
          sizeBytes: uncompressedSize,
          isDir
        })
      })

      // Sort: Directories first, then alphabetical
      entries.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1
        if (!a.isDir && b.isDir) return 1
        return a.name.localeCompare(b.name)
      })

      return {
        entries: entries.slice(0, 100), // top 100 entries for preview
        totalFiles,
        totalDirs,
        uncompressedBytes,
        isSupported: true
      }
    } catch (err: unknown) {
      console.warn(`[ArchiveInspector] Failed to read zip ${filePath}:`, err)
      return {
        entries: [],
        totalFiles: 0,
        totalDirs: 0,
        uncompressedBytes: 0,
        isSupported: false,
        error: err instanceof Error ? err.message : 'Invalid or corrupted zip archive'
      }
    }
  }

  // Other archive types (.rar, .7z, .tar, .gz)
  return {
    entries: [],
    totalFiles: 0,
    totalDirs: 0,
    uncompressedBytes: 0,
    isSupported: false
  }
}
