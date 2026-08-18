import { useState, useCallback } from 'react'
import type { FileItem, ScanFilterOptions } from './types'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useCardQueue } from './hooks/useCardQueue'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTheme } from './hooks/useTheme'
import { TopNav } from './components/TopNav'
import { FolderDropzone } from './components/FolderDropzone'
import { CardStack } from './components/CardStack'
import { SwipeControls } from './components/SwipeControls'
import { FilterModal } from './components/FilterModal'
import { CompletionScreen } from './components/CompletionScreen'
import { AlertCircle, X, FolderSearch } from 'lucide-react'

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
  const [emptyFolderNotice, setEmptyFolderNotice] = useState<string | null>(null)

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
    queueRemaining,
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
    setEmptyFolderNotice(null)
    try {
      const result = await window.api.scanDirectory(path, options)
      setFolderPath(result.folderPath || path)
      setScannedFiles(result.files)

      if (result.files.length === 0) {
        setEmptyFolderNotice(`No files found in this folder matching your current filter settings.`)
      }
    } catch (err) {
      console.error('Scan error:', err)
      setEmptyFolderNotice(`Failed to scan folder: ${err instanceof Error ? err.message : String(err)}`)
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

  const { theme, cycleTheme } = useTheme()

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <TopNav
        folderName={getFolderName(folderPath)}
        stats={stats}
        queueRemaining={queueRemaining}
        soundEnabled={soundEnabled}
        currentTheme={theme}
        onCycleTheme={cycleTheme}
        onToggleSound={toggleSound}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        onChangeFolder={() => {
          setFolderPath(null)
          setScannedFiles([])
          setEmptyFolderNotice(null)
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
        {/* State 1: No Folder Selected or Empty Directory Result */}
        {!folderPath || (scannedFiles.length === 0 && !isScanning) ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {emptyFolderNotice && (
              <div className="mb-4 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs max-w-md text-center flex items-center gap-2.5 shadow-lg shadow-amber-500/10">
                <FolderSearch className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{emptyFolderNotice}</span>
              </div>
            )}
            <FolderDropzone
              onFolderSelected={handleFolderSelected}
              isScanning={isScanning}
            />
          </div>
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
              setEmptyFolderNotice(null)
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
