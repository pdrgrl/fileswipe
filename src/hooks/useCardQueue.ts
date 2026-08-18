import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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
  // Store full list in a ref to avoid cloning 100k+ arrays on every swipe
  const filesRef = useRef<FileItem[]>([])
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [skippedFiles, setSkippedFiles] = useState<FileItem[]>([])
  const [history, setHistory] = useState<ActionHistoryItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Direct running statistics counters for O(1) instantaneous updates
  const [statCounts, setStatCounts] = useState({
    reclaimedBytes: 0,
    keptBytes: 0,
    deletedCount: 0,
    keptCount: 0,
    skippedCount: 0
  })

  // Sync on initial files load
  useEffect(() => {
    filesRef.current = initialFiles
    setFileList(initialFiles)
    setCurrentIndex(0)
    setSkippedFiles([])
    setHistory([])
    setErrorMessage(null)
    setStatCounts({
      reclaimedBytes: 0,
      keptBytes: 0,
      deletedCount: 0,
      keptCount: 0,
      skippedCount: 0
    })
  }, [initialFiles, folderPath])

  const initialTotalBytes = useMemo(() => {
    let sum = 0
    for (let i = 0; i < initialFiles.length; i++) {
      sum += initialFiles[i].sizeBytes
    }
    return sum
  }, [initialFiles])

  // Compute active, next, and 3rd files in O(1)
  const totalOriginal = fileList.length
  const isMainExhausted = currentIndex >= totalOriginal

  const activeFile = useMemo<FileItem | null>(() => {
    if (!isMainExhausted) {
      return fileList[currentIndex] || null
    }
    return skippedFiles[0] || null
  }, [fileList, currentIndex, isMainExhausted, skippedFiles])

  const nextFile = useMemo<FileItem | null>(() => {
    if (!isMainExhausted) {
      if (currentIndex + 1 < totalOriginal) {
        return fileList[currentIndex + 1] || null
      }
      return skippedFiles[0] || null
    }
    return skippedFiles[1] || null
  }, [fileList, currentIndex, totalOriginal, isMainExhausted, skippedFiles])

  const thirdFile = useMemo<FileItem | null>(() => {
    if (!isMainExhausted) {
      if (currentIndex + 2 < totalOriginal) {
        return fileList[currentIndex + 2] || null
      }
      const skippedOffset = 2 - (totalOriginal - currentIndex)
      return skippedFiles[skippedOffset] || null
    }
    return skippedFiles[2] || null
  }, [fileList, currentIndex, totalOriginal, isMainExhausted, skippedFiles])

  const queueRemaining = useMemo(() => {
    const mainRemaining = Math.max(0, totalOriginal - currentIndex)
    return mainRemaining + skippedFiles.length
  }, [totalOriginal, currentIndex, skippedFiles.length])

  // Completed only when we had files, the queue is exhausted, and history exists
  const isCompleted = initialFiles.length > 0 && queueRemaining === 0 && history.length > 0

  // 1. Keep File (O(1))
  const handleKeep = useCallback((fileToKeep?: FileItem) => {
    const target = fileToKeep || activeFile
    if (!target) return

    if (!isMainExhausted && fileList[currentIndex]?.id === target.id) {
      setCurrentIndex(i => i + 1)
    } else {
      setSkippedFiles(prev => prev.filter(f => f.id !== target.id))
    }

    setHistory(prev => [...prev, { file: target, action: 'keep', timestamp: Date.now() }])
    setStatCounts(prev => ({
      ...prev,
      keptBytes: prev.keptBytes + target.sizeBytes,
      keptCount: prev.keptCount + 1
    }))

    onKeepSound?.()

    if (queueRemaining === 1) {
      onCompleteSound?.()
    }
  }, [activeFile, isMainExhausted, fileList, currentIndex, onKeepSound, queueRemaining, onCompleteSound])

  // 2. Skip File (O(1))
  const handleSkip = useCallback((fileToSkip?: FileItem) => {
    const target = fileToSkip || activeFile
    if (!target) return

    if (!isMainExhausted && fileList[currentIndex]?.id === target.id) {
      setCurrentIndex(i => i + 1)
      setSkippedFiles(prev => [...prev, target])
    } else {
      // Move from front of skipped to back
      setSkippedFiles(prev => {
        const rest = prev.filter(f => f.id !== target.id)
        return [...rest, target]
      })
    }

    setHistory(prev => [...prev, { file: target, action: 'skip', timestamp: Date.now() }])
    setStatCounts(prev => ({
      ...prev,
      skippedCount: prev.skippedCount + 1
    }))

    onSkipSound?.()
  }, [activeFile, isMainExhausted, fileList, currentIndex, onSkipSound])

  // 3. Delete File (O(1))
  const handleDelete = useCallback(async (fileToDelete?: FileItem) => {
    const target = fileToDelete || activeFile
    if (!target) return

    try {
      if (window.api && typeof window.api.trashFile === 'function') {
        const result = await window.api.trashFile(target.path, target.id)
        if (!result.success) {
          setErrorMessage(`Could not trash file: ${result.error || 'Permission denied or file in use'}`)
          return
        }
      }

      if (!isMainExhausted && fileList[currentIndex]?.id === target.id) {
        setCurrentIndex(i => i + 1)
      } else {
        setSkippedFiles(prev => prev.filter(f => f.id !== target.id))
      }

      setHistory(prev => [...prev, { file: target, action: 'delete', timestamp: Date.now() }])
      setStatCounts(prev => ({
        ...prev,
        reclaimedBytes: prev.reclaimedBytes + target.sizeBytes,
        deletedCount: prev.deletedCount + 1
      }))

      onDeleteSound?.()

      if (queueRemaining === 1) {
        onCompleteSound?.()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(`Error trashing file: ${msg}`)
    }
  }, [activeFile, isMainExhausted, fileList, currentIndex, onDeleteSound, queueRemaining, onCompleteSound])

  // 4. Undo last action (O(1))
  const handleUndo = useCallback(async () => {
    if (history.length === 0) return

    const lastAction = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))

    if (lastAction.action === 'keep') {
      setStatCounts(prev => ({
        ...prev,
        keptBytes: Math.max(0, prev.keptBytes - lastAction.file.sizeBytes),
        keptCount: Math.max(0, prev.keptCount - 1)
      }))
    } else if (lastAction.action === 'delete') {
      if (window.api && typeof window.api.restoreFile === 'function') {
        await window.api.restoreFile(lastAction.file.path, lastAction.file.id)
      }
      setStatCounts(prev => ({
        ...prev,
        reclaimedBytes: Math.max(0, prev.reclaimedBytes - lastAction.file.sizeBytes),
        deletedCount: Math.max(0, prev.deletedCount - 1)
      }))
    } else if (lastAction.action === 'skip') {
      setStatCounts(prev => ({
        ...prev,
        skippedCount: Math.max(0, prev.skippedCount - 1)
      }))
      setSkippedFiles(prev => prev.filter(f => f.id !== lastAction.file.id))
    }

    // Step back pointer if possible, or push back to front of skipped
    if (currentIndex > 0 && fileList[currentIndex - 1]?.id === lastAction.file.id) {
      setCurrentIndex(i => i - 1)
    } else {
      setSkippedFiles(prev => [lastAction.file, ...prev.filter(f => f.id !== lastAction.file.id)])
    }

    onUndoSound?.()
  }, [history, currentIndex, fileList, onUndoSound])

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const stats: StorageStats = useMemo(() => ({
    initialTotalBytes,
    reclaimedBytes: statCounts.reclaimedBytes,
    keptBytes: statCounts.keptBytes,
    deletedCount: statCounts.deletedCount,
    keptCount: statCounts.keptCount,
    skippedCount: statCounts.skippedCount,
    totalFiles: initialFiles.length
  }), [initialTotalBytes, statCounts, initialFiles.length])

  return {
    queue: fileList,
    queueRemaining,
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
