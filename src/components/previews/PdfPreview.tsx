import { useState } from 'react'
import { FileText, ExternalLink, HardDrive, Eye } from 'lucide-react'
import type { FileItem } from '../../types'
import { formatBytes } from '../../utils/formatters'

interface PdfPreviewProps {
  file: FileItem
  onReveal?: (filePath: string) => void
}

export function PdfPreview({ file, onReveal }: PdfPreviewProps) {
  const [loadFailed, setLoadFailed] = useState(false)
  const fileUrl = window.api ? window.api.getFileProtocolUrl(file.path) : file.path

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-card)] text-[var(--text-main)] overflow-hidden select-none">
      {/* PDF Header Bar */}
      <div className="px-3.5 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border-app)] flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">PDF Document</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-[var(--button-bg)] border border-[var(--border-app)] text-[10px] text-[var(--text-muted)] font-mono">
            {formatBytes(file.sizeBytes)}
          </span>
          {onReveal && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReveal(file.path)
              }}
              className="p-1 rounded-md themed-button"
              title="Open File Location"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[var(--bg-app)]">
        {!loadFailed ? (
          <iframe
            src={fileUrl}
            title={file.name}
            onError={() => setLoadFailed(true)}
            className="w-full h-full border-0 pointer-events-auto"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
              <FileText className="w-10 h-10" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-main)]">PDF Document</h4>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">{file.name}</p>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg bg-[var(--button-bg)] border border-[var(--border-app)] text-xs text-[var(--text-main)]">
              <HardDrive className="w-3.5 h-3.5 text-rose-400" />
              <span>{formatBytes(file.sizeBytes)}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.api && typeof window.api.openFile === 'function') {
                  window.api.openFile(file.path)
                } else if (onReveal) {
                  onReveal(file.path)
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer z-30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Open in PDF App</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
