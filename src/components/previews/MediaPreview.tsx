import { useState } from 'react'
import { Film, Music } from 'lucide-react'
import type { FileItem } from '../../types'

interface MediaPreviewProps {
  file: FileItem
}

export function MediaPreview({ file }: MediaPreviewProps) {
  const [hasError, setHasError] = useState(false)
  const src = window.api ? window.api.getFileProtocolUrl(file.path) : file.path
  const isVideo = file.category === 'video'

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-surface/50 p-6 text-slate-400">
        {isVideo ? <Film className="w-16 h-16 mb-2 text-slate-500" /> : <Music className="w-16 h-16 mb-2 text-slate-500" />}
        <p className="text-sm font-medium">Unable to playback media</p>
        <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{file.extension}</span>
      </div>
    )
  }

  if (isVideo) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/70 overflow-hidden">
        <video
          src={src}
          controls
          autoPlay={false}
          playsInline
          onError={() => setHasError(true)}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  // Audio Preview
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-surface to-surface-elevated p-8">
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
          <Music className="w-12 h-12 text-blue-400 animate-pulse-subtle" />
        </div>
      </div>

      <div className="text-center mb-6 max-w-sm px-4">
        <p className="text-base font-semibold text-slate-200 truncate">{file.name}</p>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{file.extension} Audio Track</p>
      </div>

      <div className="w-full max-w-md px-4">
        <audio
          src={src}
          controls
          onError={() => setHasError(true)}
          className="w-full h-10 rounded-lg accent-blue-500"
        />
      </div>
    </div>
  )
}
