import { Archive, FileText, Binary, File, HardDrive, Clock, Tag } from 'lucide-react'
import type { FileItem } from '../../types'
import { formatBytes, formatDate } from '../../utils/formatters'

interface GenericPreviewProps {
  file: FileItem
}

export function GenericPreview({ file }: GenericPreviewProps) {
  const getIcon = () => {
    switch (file.category) {
      case 'archive':
        return <Archive className="w-16 h-16 text-amber-400" />
      case 'document':
        return <FileText className="w-16 h-16 text-rose-400" />
      case 'code':
        return <Binary className="w-16 h-16 text-cyan-400" />
      default:
        return <File className="w-16 h-16 text-indigo-400" />
    }
  }

  const getCategoryColor = () => {
    switch (file.category) {
      case 'archive': return 'bg-amber-500/10 border-amber-500/25 text-amber-400'
      case 'document': return 'bg-rose-500/10 border-rose-500/25 text-rose-400'
      case 'code': return 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
      default: return 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-[var(--bg-card)] text-[var(--text-main)] select-none">
      {/* Icon Card */}
      <div className={`w-28 h-28 rounded-2xl border flex items-center justify-center mb-5 shadow-xl ${getCategoryColor()}`}>
        {getIcon()}
      </div>

      {/* Extension Badge */}
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--button-bg)] border border-[var(--border-app)] text-xs font-semibold uppercase tracking-widest text-[var(--text-main)] mb-6">
        <Tag className="w-3 h-3 text-[var(--text-subtle)]" />
        {file.extension ? `.${file.extension}` : 'Unknown'}
      </div>

      {/* Metadata Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-sky-400" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[var(--text-subtle)] block uppercase font-medium">Size</span>
            <span className="text-xs font-semibold text-[var(--text-main)]">{formatBytes(file.sizeBytes)}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-400" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[var(--text-subtle)] block uppercase font-medium">Modified</span>
            <span className="text-xs font-semibold text-[var(--text-main)] truncate">{formatDate(file.modifiedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
