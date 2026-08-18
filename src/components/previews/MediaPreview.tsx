import { useState } from 'react'
import { Film, Music, Play, ExternalLink, HardDrive } from 'lucide-react'
import type { FileItem } from '../../types'
import { formatBytes } from '../../utils/formatters'

interface MediaPreviewProps {
  file: FileItem
}

export function MediaPreview({ file }: MediaPreviewProps) {
  const [hasError, setHasError] = useState(false)
  const src = window.api ? window.api.getFileProtocolUrl(file.path) : file.path
  const isVideo = file.category === 'video'
  const ext = file.extension.toLowerCase()

  const handleOpenExternal = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    console.log('[MediaPreview] handleOpenExternal called for:', file.path)
    if (window.api && typeof window.api.openFile === 'function') {
      window.api.openFile(file.path)
    }
  }

  const handleReveal = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    console.log('[MediaPreview] handleReveal called for:', file.path)
    if (window.api && typeof window.api.revealItem === 'function') {
      window.api.revealItem(file.path)
    }
  }

  // If video format cannot be decoded by Chromium (e.g. MKV with HEVC/AC3 codecs)
  if (hasError || ext === 'mkv' || ext === 'avi' || ext === 'wmv') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-card)] p-8 text-center select-none">
        <div className="w-20 h-20 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
          <Film className="w-10 h-10" />
        </div>

        <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
          {ext.toUpperCase()} Video Container
        </h4>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs leading-relaxed">
          This video codec requires your system's hardware media player (e.g. VLC, MPV, Windows Media Player).
        </p>

        <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg bg-[var(--button-bg)] border border-[var(--border-app)] text-xs text-[var(--text-main)] font-mono">
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span>{formatBytes(file.sizeBytes)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 mt-5">
          <button
            onClick={handleOpenExternal}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer z-30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play in Video Player</span>
          </button>

          <button
            onClick={handleReveal}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-2 rounded-xl themed-button text-[var(--text-main)] cursor-pointer z-30"
            title="Reveal in Folder"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (isVideo) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group">
        <video
          src={src}
          controls
          autoPlay={false}
          playsInline
          onError={() => setHasError(true)}
          className="max-w-full max-h-full object-contain"
        />

        {/* External Player Quick Launch Button */}
        <button
          onClick={handleOpenExternal}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer z-30"
          title="Open in System Video Player (VLC)"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // Audio Preview
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-card)] text-[var(--text-main)] p-8">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <Music className="w-10 h-10 text-purple-400 animate-pulse-subtle" />
        </div>
      </div>

      <div className="text-center mb-6 max-w-sm px-4">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold">{file.extension} Audio Track</p>
      </div>

      <div className="w-full max-w-md px-4">
        <audio
          src={src}
          controls
          onError={() => setHasError(true)}
          className="w-full h-10 rounded-lg accent-purple-500"
        />
      </div>
    </div>
  )
}
