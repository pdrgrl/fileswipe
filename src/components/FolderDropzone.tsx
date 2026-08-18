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
    console.log('[FolderDropzone] handleFileInputChange triggered')
    if (e.target.files && e.target.files.length > 0) {
      const firstFile = e.target.files[0]
      let detectedPath = ''
      if (window.api && typeof window.api.getPathForFile === 'function') {
        detectedPath = window.api.getPathForFile(firstFile)
      }
      if (!detectedPath) {
        detectedPath = (firstFile as unknown as { path?: string }).path || ''
      }
      console.log('[FolderDropzone] detectedPath from input:', detectedPath)

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
    console.log('[FolderDropzone] handleDrop triggered. files count:', e.dataTransfer.files?.length)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      let droppedPath = ''

      if (window.api && typeof window.api.getPathForFile === 'function') {
        droppedPath = window.api.getPathForFile(file)
      }
      if (!droppedPath) {
        droppedPath = (file as unknown as { path?: string }).path || ''
      }
      console.log('[FolderDropzone] droppedPath resolved:', droppedPath)

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
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-400 p-0.5 shadow-2xl shadow-rose-500/20 mb-4 animate-bounce">
          <div className="w-full h-full bg-[#0d111a] rounded-[22px] flex items-center justify-center">
            <Flame className="w-8 h-8 text-rose-500 fill-rose-500" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          FileSwipe
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md">
          Declutter your hard drive in seconds. Swipe right to <span className="text-emerald-400 font-semibold">Keep</span>, swipe left to <span className="text-rose-400 font-semibold">Delete</span>, and down to <span className="text-amber-400 font-semibold">Skip</span>.
        </p>
      </div>

      {/* Main Drag-and-Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handlePickFolder}
        className={`w-full max-w-xl p-10 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center backdrop-blur-xl ${
          isDragOver
            ? 'border-blue-400 bg-blue-500/10 scale-102 shadow-2xl shadow-blue-500/20'
            : 'border-white/15 bg-surface/60 hover:border-white/30 hover:bg-surface/80 shadow-glass'
        } ${isScanning ? 'opacity-50 pointer-events-none cursor-wait' : ''}`}
      >
        <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 text-blue-400">
          {isScanning ? (
            <Sparkles className="w-10 h-10 animate-spin text-amber-400" />
          ) : (
            <FolderUp className="w-10 h-10 group-hover:scale-110 transition-transform" />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-100">
          {isScanning ? 'Scanning Directory...' : isDragOver ? 'Drop Folder Here!' : 'Select or Drop a Folder'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {isScanning ? 'Indexing files and calculating storage...' : 'Drag any folder from your desktop or file manager to start sweeping'}
        </p>

        <button
          type="button"
          disabled={isScanning}
          onClick={(e) => {
            e.stopPropagation()
            handlePickFolder()
          }}
          className="mt-6 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <FolderUp className="w-4 h-4" />
          <span>Browse Folder</span>
        </button>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl mt-8">
        <div className="p-3 rounded-2xl glass-panel border-white/5 flex items-center gap-2.5">
          <Image className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium truncate">Photos & Media</span>
        </div>
        <div className="p-3 rounded-2xl glass-panel border-white/5 flex items-center gap-2.5">
          <Film className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium truncate">Videos & Audio</span>
        </div>
        <div className="p-3 rounded-2xl glass-panel border-white/5 flex items-center gap-2.5">
          <Code className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium truncate">Code & Docs</span>
        </div>
        <div className="p-3 rounded-2xl glass-panel border-white/5 flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium truncate">Safe Trash</span>
        </div>
      </div>
    </div>
  )
}
