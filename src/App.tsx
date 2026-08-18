import { useState, useCallback } from 'react'
import type { FileItem, ScanFilterOptions } from './types'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useCardQueue } from './hooks/useCardQueue'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { TopNav } from './components/TopNav'
import { FolderDropzone } from './components/FolderDropzone'
import { CardStack } from './components/CardStack'
import { SwipeControls } from './components/SwipeControls'
import { FilterModal } from './components/FilterModal'
import { CompletionScreen } from './components/CompletionScreen'
import { AlertCircle, X } from 'lucide-react'

const DEFAULT_FILTER_OPTIONS: ScanFilterOptions = {
  recursive: true,
  includeHidden: false,
  minSizeBytes: 0,
  categories: ['image', 'video', 'audio', 'code', 'document', 'archive', 'other'],
  sortBy: 'default'
}

export function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null)
  const [scannedFiles, setScannedFiles] = useState<FileItem[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [filterOptions, setFilterOptions] = useState<ScanFilterOptions>(DEFAULT_FILTER_OPTIONS)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const {
    soundEnabled,
    toggleSound,
    playKeep,
    playDelete,
    playSkip,
    playUndo,
    playVictory
  } = useSoundEffects()

  const {
    queue,
    history,
    activeFile,
    nextFile,
    thirdFile,
    stats,
    isCompleted,
    errorMessage,
    clearError,
    handleKeep,
    handleSkip,
    handleDelete,
    handleUndo,
    canUndo
  } = useCardQueue({
    initialFiles: scannedFiles,
    folderPath: folderPath || '',
    onKeepSound: playKeep,
    onDeleteSound: playDelete,
    onSkipSound: playSkip,
    onUndoSound: playUndo,
    onCompleteSound: playVictory
  })

  // Perform directory scan
  const scanFolder = useCallback(async (path: string, options: ScanFilterOptions) => {
    if (!window.api || !window.api.scanDirectory) {
      console.warn('Electron API not available, running in mock/web mode')
      return
    }

    setIsScanning(true)
    try {
      const result = await window.api.scanDirectory(path, options)
      setFolderPath(path)
      setScannedFiles(result.files)
    } catch (err) {
      console.error('Scan error:', err)
    } finally {
      setIsScanning(false)
    }
  }, [])

  const handleFolderSelected = useCallback((path: string) => {
    scanFolder(path, filterOptions)
  }, [filterOptions, scanFolder])

  const handleApplyFilter = useCallback((newOptions: ScanFilterOptions) => {
    setFilterOptions(newOptions)
    if (folderPath) {
      scanFolder(folderPath, newOptions)
    }
  }, [folderPath, scanFolder])

  const handleResetScan = useCallback(() => {
    if (folderPath) {
      scanFolder(folderPath, filterOptions)
    }
  }, [folderPath, filterOptions, scanFolder])

  const handleReveal = useCallback((filePath?: string) => {
    const target = filePath || activeFile?.path
    if (target && window.api?.revealItem) {
      window.api.revealItem(target)
    }
  }, [activeFile])

  // Register Keyboard Shortcuts
  useKeyboardShortcuts({
    onKeep: () => activeFile && handleKeep(activeFile),
    onDelete: () => activeFile && handleDelete(activeFile),
    onSkip: () => activeFile && handleSkip(activeFile),
    onUndo: handleUndo,
    onReveal: () => handleReveal(),
    onToggleSound: toggleSound,
    onCloseModal: () => setIsFilterModalOpen(false),
    enabled: !isFilterModalOpen && scannedFiles.length > 0 && !isCompleted
  })

  const getFolderName = (fullPath: string | null) => {
    if (!fullPath) return ''
    const normalized = fullPath.replace(/\\/g, '/').replace(/\/$/, '')
    const parts = normalized.split('/')
    return parts[parts.length - 1] || fullPath
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <TopNav
        folderName={getFolderName(folderPath)}
        stats={stats}
        queueRemaining={queue.length}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        onChangeFolder={() => {
          setFolderPath(null)
          setScannedFiles([])
        }}
        onResetScan={handleResetScan}
      />

      {/* Error / Notification Toast */}
      {errorMessage && (
        <div className="absolute top-16 inset-x-0 mx-auto w-fit max-w-lg z-50 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-rose-500/40 text-rose-300 text-xs shadow-2xl flex items-center gap-2.5 backdrop-blur-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={clearError} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden relative">
        {/* State 1: No Folder Loaded */}
        {!folderPath || scannedFiles.length === 0 ? (
          <FolderDropzone
            onFolderSelected={handleFolderSelected}
            isScanning={isScanning}
          />
        ) : isCompleted ? (
          /* State 2: Session Completed / Victory */
          <CompletionScreen
            stats={stats}
            history={history}
            folderPath={folderPath}
            onRestart={handleResetScan}
            onPickNewFolder={() => {
              setFolderPath(null)
              setScannedFiles([])
            }}
            onRevealFile={handleReveal}
          />
        ) : (
          /* State 3: Active Tinder Swiper Stack */
          <div className="flex-1 w-full flex flex-col items-center justify-between max-w-lg mx-auto">
            {/* Card Stack Area */}
            <div className="flex-1 w-full flex items-center justify-center pt-2">
              <CardStack
                activeFile={activeFile}
                nextFile={nextFile}
                thirdFile={thirdFile}
                onKeep={handleKeep}
                onDelete={handleDelete}
                onSkip={handleSkip}
                onReveal={handleReveal}
              />
            </div>

            {/* Bottom Floating Control Bar */}
            <SwipeControls
              onKeep={() => activeFile && handleKeep(activeFile)}
              onDelete={() => activeFile && handleDelete(activeFile)}
              onSkip={() => activeFile && handleSkip(activeFile)}
              onUndo={handleUndo}
              onReveal={() => handleReveal()}
              canUndo={canUndo}
            />
          </div>
        )}
      </main>

      {/* Filter & Sort Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentOptions={filterOptions}
        onApply={handleApplyFilter}
      />
    </div>
  )
}
