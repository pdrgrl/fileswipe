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
      case 'archive': return 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-300'
      case 'document': return 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-300'
      case 'code': return 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-300'
      default: return 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-300'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-gradient-to-b from-surface to-surface-elevated">
      {/* Icon Card */}
      <div className={`w-28 h-28 rounded-2xl bg-gradient-to-b border flex items-center justify-center mb-6 shadow-xl ${getCategoryColor()}`}>
        {getIcon()}
      </div>

      {/* Extension Badge */}
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-slate-300 mb-6">
        <Tag className="w-3 h-3 text-slate-400" />
        {file.extension ? `.${file.extension}` : 'Unknown'}
      </div>

      {/* Metadata Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-slate-400" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Size</span>
            <span className="text-xs font-semibold text-slate-200">{formatBytes(file.sizeBytes)}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-slate-400" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Modified</span>
            <span className="text-xs font-semibold text-slate-200 truncate">{formatDate(file.modifiedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
