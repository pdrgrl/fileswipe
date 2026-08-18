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
      return <ImagePreview file={file} isFront={isFront} />
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
      case 'video': return <Film className="w-3.5 h-3.5 text-sky-400" />
      case 'audio': return <Music className="w-3.5 h-3.5 text-purple-400" />
      case 'code': return <Code className="w-3.5 h-3.5 text-cyan-400" />
      case 'archive': return <Archive className="w-3.5 h-3.5 text-amber-400" />
      default: return <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
    }
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden themed-card-panel flex flex-col relative select-none">
      {/* Media / Content Preview Section */}
      <div className="relative flex-1 w-full overflow-hidden bg-black/40">
        {renderPreview()}
      </div>

      {/* Card Info & Meta Footer */}
      <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-app)] flex flex-col gap-2.5 backdrop-blur-xl shrink-0">
        {/* Top line: Name & Open Folder Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[var(--text-main)] truncate tracking-tight" title={file.name}>
              {file.name}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] truncate font-mono mt-0.5" title={file.path}>
              {truncatePath(file.relativePath || file.name)}
            </p>
          </div>

          {isFront && onReveal && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReveal(file.path)
              }}
              className="p-1.5 rounded-lg themed-button shrink-0"
              title="Reveal in File Explorer (O)"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            </button>
          )}
        </div>

        {/* Bottom line: Category, Size, Modified Date badges */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--button-bg)] border border-[var(--border-app)] font-medium text-[11px] text-[var(--text-main)] capitalize">
              {getCategoryIcon()}
              {ext === 'pdf' ? 'PDF Doc' : file.category}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--button-bg)] border border-[var(--border-app)] font-semibold text-[11px] text-[var(--text-main)]">
              <HardDrive className="w-3 h-3 text-sky-400" />
              {formatBytes(file.sizeBytes)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
            <Calendar className="w-3 h-3 text-[var(--text-subtle)]" />
            <span>{formatTimeAgo(file.modifiedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
