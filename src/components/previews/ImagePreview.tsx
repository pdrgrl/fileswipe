import { useState } from 'react'
import { ZoomIn, ZoomOut, ImageOff, Image as ImageIcon } from 'lucide-react'
import type { FileItem } from '../../types'

interface ImagePreviewProps {
  file: FileItem
  isFront?: boolean
}

export function ImagePreview({ file, isFront = true }: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Use custom protocol or local file path
  const src = window.api ? window.api.getFileProtocolUrl(file.path) : file.path

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-card)] p-6 text-[var(--text-muted)]">
        <ImageOff className="w-14 h-14 mb-2 text-[var(--text-subtle)] opacity-50" />
        <p className="text-xs font-semibold text-[var(--text-main)]">Unable to preview image</p>
        <span className="text-[10px] text-[var(--text-subtle)] mt-1 uppercase tracking-wider">{file.extension}</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/50 group">
      {/* Sleek loading shimmer while massive 8K/60MB images decode in background */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-subtle)] gap-2">
          <ImageIcon className="w-8 h-8 opacity-20 animate-pulse" />
          <span className="text-[10px] font-mono opacity-40">Loading high-res image...</span>
        </div>
      )}

      <img
        src={src}
        alt={file.name}
        loading={isFront ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`max-w-full max-h-full object-contain transition-all duration-300 pointer-events-none select-none ${
          isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-[1.02]'
        } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Floating Zoom Button (Only on front interactive card) */}
      {isFront && isLoaded && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsZoomed(!isZoomed)
          }}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
          title={isZoomed ? "Zoom Out" : "Zoom In (Toggle 150%)"}
        >
          {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  )
}
