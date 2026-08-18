import { useState } from 'react'
import { FileText, ExternalLink, HardDrive } from 'lucide-react'
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
    <div className="w-full h-full flex flex-col bg-[#141824] text-slate-200 overflow-hidden select-none">
      {/* PDF Header Bar */}
      <div className="px-4 py-2 bg-[#1b2132] border-b border-white/10 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold text-slate-100 truncate">{file.name}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono">
            {formatBytes(file.sizeBytes)}
          </span>
          {onReveal && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReveal(file.path)
              }}
              className="p-1 rounded-md glass-button text-slate-400 hover:text-white"
              title="Open File Location"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#1e2333]">
        {!loadFailed ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title={file.name}
            onError={() => setLoadFailed(true)}
            className="w-full h-full border-0 pointer-events-auto"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
              <FileText className="w-10 h-10" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">PDF Document</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{file.name}</p>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-rose-400" />
              <span>{formatBytes(file.sizeBytes)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
