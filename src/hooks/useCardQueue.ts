import { useState, useCallback, useMemo, useEffect } from 'react'
import type { FileItem, ActionHistoryItem, StorageStats } from '../types'

interface UseCardQueueProps {
  initialFiles: FileItem[]
  folderPath: string
  onKeepSound?: () => void
  onDeleteSound?: () => void
  onSkipSound?: () => void
  onUndoSound?: () => void
  onCompleteSound?: () => void
}

export function useCardQueue({
  initialFiles,
  folderPath,
  onKeepSound,
  onDeleteSound,
  onSkipSound,
  onUndoSound,
  onCompleteSound
}: UseCardQueueProps) {
  const [queue, setQueue] = useState<FileItem[]>(initialFiles)
  const [history, setHistory] = useState<ActionHistoryItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sync queue and clear history when a new folder or file list is loaded
  useEffect(() => {
    setQueue(initialFiles)
    setHistory([])
    setErrorMessage(null)
  }, [initialFiles, folderPath])

  const initialTotalBytes = useMemo(() => {
    return initialFiles.reduce((acc, f) => acc + f.sizeBytes, 0)
  }, [initialFiles])

  // Active top file and next card in stack
  const activeFile = queue[0] || null
  const nextFile = queue[1] || null
  const thirdFile = queue[2] || null

  // Compute live statistics
  const stats: StorageStats = useMemo(() => {
    let reclaimedBytes = 0
    let keptBytes = 0
    let deletedCount = 0
    let keptCount = 0
    let skippedCount = 0

    history.forEach(item => {
      if (item.action === 'delete') {
        reclaimedBytes += item.file.sizeBytes
        deletedCount++
      } else if (item.action === 'keep') {
        keptBytes += item.file.sizeBytes
        keptCount++
      } else if (item.action === 'skip') {
        skippedCount++
      }
    })

    return {
      initialTotalBytes,
      reclaimedBytes,
      keptBytes,
      deletedCount,
      keptCount,
      skippedCount,
      totalFiles: initialFiles.length
    }
  }, [history, initialFiles.length, initialTotalBytes])

  // Completed only when we had files, the queue is now exhausted, and we actually reviewed items
  const isCompleted = initialFiles.length > 0 && queue.length === 0 && history.length > 0

  // 1. Keep File
  const handleKeep = useCallback((fileToKeep?: FileItem) => {
    const target = fileToKeep || queue[0]
    if (!target) return

    setQueue(prev => prev.slice(1))
    setHistory(prev => [...prev, { file: target, action: 'keep', timestamp: Date.now() }])
    onKeepSound?.()

    if (queue.length === 1) {
      onCompleteSound?.()
    }
  }, [queue, onKeepSound, onCompleteSound])

  // 2. Skip File (send to end of queue)
  const handleSkip = useCallback((fileToSkip?: FileItem) => {
    const target = fileToSkip || queue[0]
    if (!target) return

    setQueue(prev => {
      if (prev.length <= 1) return prev // only 1 left, can't skip to back
      const rest = prev.slice(1)
      return [...rest, target]
    })
    setHistory(prev => [...prev, { file: target, action: 'skip', timestamp: Date.now() }])
    onSkipSound?.()
  }, [queue, onSkipSound])

  // 3. Delete File (safe staging + physical undo buffer)
  const handleDelete = useCallback(async (fileToDelete?: FileItem) => {
    const target = fileToDelete || queue[0]
    if (!target) return

    try {
      if (window.api && typeof window.api.trashFile === 'function') {
        const result = await window.api.trashFile(target.path, target.id)
        if (!result.success) {
          setErrorMessage(`Could not trash file: ${result.error || 'Permission denied or file in use'}`)
          return
        }
      }

      setQueue(prev => prev.slice(1))
      setHistory(prev => [...prev, { file: target, action: 'delete', timestamp: Date.now() }])
      onDeleteSound?.()

      if (queue.length === 1) {
        onCompleteSound?.()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(`Error trashing file: ${msg}`)
    }
  }, [queue, onDeleteSound, onCompleteSound])

  // 4. Undo last action (with real file restoration on disk)
  const handleUndo = useCallback(async () => {
    if (history.length === 0) return

    const lastAction = history[history.length - 1]
    const updatedHistory = history.slice(0, -1)
    setHistory(updatedHistory)

    if (lastAction.action === 'keep') {
      // Put file back to top of queue
      setQueue(prev => [lastAction.file, ...prev])
    } else if (lastAction.action === 'skip') {
      // Find the file at the end of queue and move it back to top
      setQueue(prev => {
        const filtered = prev.filter(f => f.id !== lastAction.file.id)
        return [lastAction.file, ...filtered]
      })
    } else if (lastAction.action === 'delete') {
      // Physically restore file on disk from staging buffer
      if (window.api && typeof window.api.restoreFile === 'function') {
        const result = await window.api.restoreFile(lastAction.file.path, lastAction.file.id)
        if (!result.success) {
          setErrorMessage(`Could not restore file on disk: ${result.error || 'Unknown error'}`)
        }
      }
      setQueue(prev => [lastAction.file, ...prev])
    }

    onUndoSound?.()
  }, [history, onUndoSound])

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  return {
    queue,
    history,
    activeFile,
    nextFile,
    thirdFile,
    stats,
    isCompleted,
    folderPath,
    errorMessage,
    clearError,
    handleKeep,
    handleSkip,
    handleDelete,
    handleUndo,
    canUndo: history.length > 0
  }
}
