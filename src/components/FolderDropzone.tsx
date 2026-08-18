import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { FolderUp, Flame, Image, Film, Code, HardDrive, Sparkles } from 'lucide-react'
import type { ScanFilterOptions } from '../types'

interface FolderDropzoneProps {
  onFolderSelected: (folderPath: string) => void
  onScanWithOptions?: (options: ScanFilterOptions) => void
  isScanning: boolean
}

export function FolderDropzone({ onFolderSelected, isScanning }: FolderDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePickFolder = async () => {
    console.log('[FolderDropzone] handlePickFolder clicked. isScanning:', isScanning)
    if (isScanning) return

    if (window.api && typeof window.api.selectFolder === 'function') {
      try {
        console.log('[FolderDropzone] Calling window.api.selectFolder()...')
        const selected = await window.api.selectFolder()
        console.log('[FolderDropzone] window.api.selectFolder() returned:', selected)
        if (selected) {
          onFolderSelected(selected)
          return
        }
      } catch (err) {
        console.error('[FolderDropzone] Error opening folder picker dialog:', err)
      }
    } else {
      console.warn('[FolderDropzone] window.api.selectFolder is not available, falling back to file input')
      fileInputRef.current?.click()
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const firstFile = e.target.files[0]
      let detectedPath = ''
      if (window.api && typeof window.api.getPathForFile === 'function') {
        detectedPath = window.api.getPathForFile(firstFile)
      }
      if (!detectedPath) {
        detectedPath = (firstFile as unknown as { path?: string }).path || ''
      }

      if (detectedPath) {
        const normalized = detectedPath.replace(/\\/g, '/')
        const parentDir = normalized.substring(0, normalized.lastIndexOf('/'))
        onFolderSelected(parentDir || detectedPath)
      }
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      let droppedPath = ''

      if (window.api && typeof window.api.getPathForFile === 'function') {
        droppedPath = window.api.getPathForFile(file)
      }
      if (!droppedPath) {
        droppedPath = (file as unknown as { path?: string }).path || ''
      }

      if (droppedPath) {
        onFolderSelected(droppedPath)
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full select-none">
      {/* Hidden fallback directory input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        // @ts-expect-error webkitdirectory is standard for folder picking in Chromium
        webkitdirectory=""
        directory=""
        multiple
      />

      {/* Brand Hero */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-400 p-[1.5px] shadow-2xl shadow-rose-500/20 mb-3">
          <div className="w-full h-full bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center">
            <Flame className="w-7 h-7 text-amber-400 fill-amber-400" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
          FileSwipe
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1.5 max-w-md font-medium leading-relaxed">
          The fastest way to declutter folders. Swipe right to <span className="text-emerald-500 font-semibold">Keep</span>, left to <span className="text-rose-500 font-semibold">Trash</span>, and down to <span className="text-amber-500 font-semibold">Skip</span>.
        </p>
      </div>

      {/* Main Drag-and-Drop Box (Command Dropzone) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handlePickFolder}
        className={`w-full max-w-xl p-9 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden group ${
          isDragOver
            ? 'border-sky-400/80 bg-sky-500/[0.08] shadow-2xl shadow-sky-500/20 scale-[1.01]'
            : 'border-[var(--border-app)] bg-[var(--bg-card)] hover:border-[var(--border-highlight)] shadow-[var(--card-shadow)]'
        } ${isScanning ? 'opacity-50 pointer-events-none cursor-wait' : ''}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--button-bg)] border border-[var(--border-app)] flex items-center justify-center mb-4 text-sky-400 group-hover:scale-105 transition-transform">
          {isScanning ? (
            <Sparkles className="w-7 h-7 animate-spin text-amber-400" />
          ) : (
            <FolderUp className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-base font-bold text-[var(--text-main)] tracking-tight">
          {isScanning ? 'Scanning Directory...' : isDragOver ? 'Drop Folder Here!' : 'Choose Folder to Clean'}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs font-normal">
          {isScanning ? 'Indexing files and computing storage...' : 'Drop any folder or click to open native picker'}
        </p>

        <button
          type="button"
          disabled={isScanning}
          onClick={(e) => {
            e.stopPropagation()
            handlePickFolder()
          }}
          className="mt-5 px-5 py-2 rounded-xl themed-button text-[var(--text-main)] font-semibold text-xs transition-all duration-150 active:scale-95 flex items-center gap-2"
        >
          <FolderUp className="w-3.5 h-3.5 text-sky-400" />
          <span>Select Folder</span>
          <span className="kbd-keycap ml-1">⌘ O</span>
        </button>
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl mt-6">
        <div className="p-2.5 rounded-xl themed-panel flex items-center gap-2">
          <Image className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-[var(--text-main)] font-medium truncate">Images & GIFs</span>
        </div>
        <div className="p-2.5 rounded-xl themed-panel flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-xs text-[var(--text-main)] font-medium truncate">Videos & Audio</span>
        </div>
        <div className="p-2.5 rounded-xl themed-panel flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs text-[var(--text-main)] font-medium truncate">Code & PDFs</span>
        </div>
        <div className="p-2.5 rounded-xl themed-panel flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="text-xs text-[var(--text-main)] font-medium truncate">Safe Undo</span>
        </div>
      </div>
    </div>
  )
}
