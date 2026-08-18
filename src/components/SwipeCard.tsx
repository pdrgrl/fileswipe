import { FolderOpen, Calendar, HardDrive, FileText, Image, Film, Music, Archive, Code } from 'lucide-react'
import type { FileItem } from '../types'
import { formatBytes, formatTimeAgo, truncatePath } from '../utils/formatters'
import { ImagePreview } from './previews/ImagePreview'
import { MediaPreview } from './previews/MediaPreview'
import { CodePreview } from './previews/CodePreview'
import { PdfPreview } from './previews/PdfPreview'
import { ArchivePreview } from './previews/ArchivePreview'
import { GenericPreview } from './previews/GenericPreview'

interface SwipeCardProps {
  file: FileItem
  isFront?: boolean
  onReveal?: (filePath: string) => void
}

export function SwipeCard({ file, isFront = false, onReveal }: SwipeCardProps) {
  const ext = file.extension.toLowerCase()

  const renderPreview = () => {
    // 1. PDF Document Preview
    if (ext === 'pdf') {
      return <PdfPreview file={file} onReveal={onReveal} />
    }

    // 2. Archive Container Preview (.zip, .rar, .7z, .tar, .gz)
    if (file.category === 'archive' || ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'].includes(ext)) {
      return <ArchivePreview file={file} />
    }

    // 3. Image Preview
    if (file.category === 'image') {
      return <ImagePreview file={file} />
    }

    // 4. Video & Audio Preview
    if (file.category === 'video' || file.category === 'audio') {
      return <MediaPreview file={file} />
    }

    // 5. Code, Markdown, CSV, JSON, Text, Logs
    if (
      file.category === 'code' ||
      file.category === 'document' ||
      ['txt', 'log', 'csv', 'tsv', 'md', 'mdx', 'json', 'yaml', 'yml', 'xml', 'ini', 'conf', 'cfg'].includes(ext)
    ) {
      return <CodePreview file={file} />
    }

    // 6. Generic Binary / Fallback Preview
    return <GenericPreview file={file} />
  }

  const getCategoryIcon = () => {
    if (ext === 'pdf') return <FileText className="w-3.5 h-3.5 text-rose-400" />
    switch (file.category) {
      case 'image': return <Image className="w-3.5 h-3.5 text-emerald-400" />
      case 'video': return <Film className="w-3.5 h-3.5 text-blue-400" />
      case 'audio': return <Music className="w-3.5 h-3.5 text-purple-400" />
      case 'code': return <Code className="w-3.5 h-3.5 text-cyan-400" />
      case 'archive': return <Archive className="w-3.5 h-3.5 text-amber-400" />
      default: return <FileText className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden glass-panel-elevated flex flex-col shadow-2xl border border-white/10 relative select-none">
      {/* Media / Content Preview Section */}
      <div className="relative flex-1 w-full overflow-hidden bg-black/40">
        {renderPreview()}
      </div>

      {/* Card Info & Meta Footer */}
      <div className="p-5 bg-surface/95 border-t border-white/[0.07] flex flex-col gap-3 backdrop-blur-xl shrink-0">
        {/* Top line: Name & Open Folder Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-100 truncate tracking-tight" title={file.name}>
              {file.name}
            </h3>
            <p className="text-xs text-slate-400 truncate font-mono mt-0.5" title={file.path}>
              {truncatePath(file.relativePath || file.name)}
            </p>
          </div>

          {isFront && onReveal && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReveal(file.path)
              }}
              className="p-2 rounded-xl glass-button text-slate-300 hover:text-white shrink-0 hover:border-blue-500/40"
              title="Reveal in File Explorer (O)"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom line: Category, Size, Modified Date badges */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] font-medium text-slate-300 capitalize">
              {getCategoryIcon()}
              {ext === 'pdf' ? 'PDF Doc' : file.category}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] font-semibold text-slate-200">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              {formatBytes(file.sizeBytes)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatTimeAgo(file.modifiedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
