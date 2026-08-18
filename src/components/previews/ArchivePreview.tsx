import { useState, useEffect } from 'react'
import { Archive, Folder, File, HardDrive, Layers, Sparkles } from 'lucide-react'
import type { FileItem, ArchiveInspectionResult } from '../../types'
import { formatBytes } from '../../utils/formatters'

interface ArchivePreviewProps {
  file: FileItem
}

export function ArchivePreview({ file }: ArchivePreviewProps) {
  const [result, setResult] = useState<ArchiveInspectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    if (window.api && typeof window.api.inspectArchive === 'function') {
      window.api.inspectArchive(file.path)
        .then(res => {
          if (isMounted) {
            setResult(res)
            setLoading(false)
          }
        })
        .catch(err => {
          console.warn('Error inspecting archive:', err)
          if (isMounted) {
            setResult(null)
            setLoading(false)
          }
        })
    } else {
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [file.path])

  const filteredEntries = result?.entries.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="w-full h-full flex flex-col bg-[#0f141f] text-slate-200 overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#171e2e] border-b border-white/10 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Archive className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold text-slate-100 truncate">{file.name}</span>
        </div>

        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono uppercase font-bold tracking-wider shrink-0">
          {file.extension}
        </span>
      </div>

      {/* Hero Stats */}
      <div className="p-4 bg-white/[0.02] border-b border-white/5 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-blue-400" /> Size
          </span>
          <span className="font-bold text-slate-200 mt-0.5">{formatBytes(file.sizeBytes)}</span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" /> Files
          </span>
          <span className="font-bold text-slate-200 mt-0.5">
            {loading ? '...' : (result?.totalFiles ?? '—')}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Uncompressed
          </span>
          <span className="font-bold text-slate-200 mt-0.5">
            {loading ? '...' : (result ? formatBytes(result.uncompressedBytes) : '—')}
          </span>
        </div>
      </div>

      {/* Archive File Contents Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {result?.isSupported && result.entries.length > 5 && (
          <div className="px-4 py-2 border-b border-white/5 bg-surface/50">
            <input
              type="text"
              placeholder="Search archive contents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03] p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="text-xs">Reading archive catalog...</span>
            </div>
          ) : result && result.isSupported ? (
            filteredEntries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                {search ? 'No files match search query' : 'Empty archive'}
              </div>
            ) : (
              filteredEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.03] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {entry.isDir ? (
                      <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate text-slate-300 font-mono text-[11px]">
                      {entry.name}
                    </span>
                  </div>

                  {!entry.isDir && (
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {formatBytes(entry.sizeBytes)}
                    </span>
                  )}
                </div>
              ))
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-400">
              <Archive className="w-12 h-12 text-amber-400/50 mb-3" />
              <p className="text-xs font-semibold text-slate-300">Compressed Archive Container</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                {file.extension.toUpperCase()} archive package. {formatBytes(file.sizeBytes)} total disk footprint.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
