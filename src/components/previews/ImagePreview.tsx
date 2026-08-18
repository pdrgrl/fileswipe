import { useState } from 'react'
import { ZoomIn, ImageOff } from 'lucide-react'
import type { FileItem } from '../../types'

interface ImagePreviewProps {
  file: FileItem
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Use custom protocol or local file path
  const src = window.api ? window.api.getFileProtocolUrl(file.path) : file.path

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-surface/50 p-6 text-slate-400">
        <ImageOff className="w-16 h-16 mb-2 text-slate-500 opacity-60" />
        <p className="text-sm font-medium">Unable to preview image</p>
        <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{file.extension}</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/40 group">
      <img
        src={src}
        alt={file.name}
        onError={() => setHasError(true)}
        className={`max-w-full max-h-full object-contain transition-transform duration-300 pointer-events-none select-none ${
          isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
        }`}
      />

      {/* Floating Zoom Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsZoomed(!isZoomed)
        }}
        className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
        title={isZoomed ? "Zoom Out" : "Zoom In"}
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  )
}
