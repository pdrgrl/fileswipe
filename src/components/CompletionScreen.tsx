import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Sparkles, Check, Trash2, Clock, FolderOpen, RefreshCw, HardDrive } from 'lucide-react'
import type { ActionHistoryItem, StorageStats } from '../types'
import { formatBytes, formatTimeAgo, truncatePath } from '../utils/formatters'

interface CompletionScreenProps {
  stats: StorageStats
  history: ActionHistoryItem[]
  folderPath: string
  onRestart: () => void
  onPickNewFolder: () => void
  onRevealFile?: (filePath: string) => void
}

export function CompletionScreen({
  stats,
  history,
  folderPath,
  onRestart,
  onPickNewFolder,
  onRevealFile
}: CompletionScreenProps) {
  const [filterAction, setFilterAction] = useState<'all' | 'keep' | 'delete' | 'skip'>('all')

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch {
      // Ignore if canvas isn't ready
    }
  }, [])

  const filteredHistory = history.filter(item => {
    if (filterAction === 'all') return true
    return item.action === filterAction
  })

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in select-none">
      {/* Victory Header */}
      <div className="text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-[#0d111a] rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          All Caught Up! 🎉
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-md">
          You finished reviewing all files in <span className="text-slate-200 font-mono font-medium">{truncatePath(folderPath, 35)}</span>.
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Reclaimed Space */}
        <div className="p-5 rounded-3xl glass-panel-elevated border border-rose-500/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Reclaimed</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-rose-400 mt-2">
            {formatBytes(stats.reclaimedBytes)}
          </span>
          <span className="text-[11px] text-slate-400">moved to Recycle Bin</span>
        </div>

        {/* Kept Files */}
        <div className="p-5 rounded-3xl glass-panel-elevated border border-emerald-500/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Kept</span>
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-2xl font-black text-emerald-400 mt-2">
            {stats.keptCount}
          </span>
          <span className="text-[11px] text-slate-400">{formatBytes(stats.keptBytes)} retained</span>
        </div>

        {/* Trashed Files */}
        <div className="p-5 rounded-3xl glass-panel-elevated border border-red-500/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-bold uppercase tracking-wider">Deleted</span>
            <Trash2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-red-400 mt-2">
            {stats.deletedCount}
          </span>
          <span className="text-[11px] text-slate-400">files cleaned</span>
        </div>

        {/* Skipped */}
        <div className="p-5 rounded-3xl glass-panel-elevated border border-amber-500/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Skipped</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-400 mt-2">
            {stats.skippedCount}
          </span>
          <span className="text-[11px] text-slate-400">queue passes</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPickNewFolder}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Sweep Another Folder</span>
        </button>

        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-2xl glass-button text-slate-300 hover:text-white font-semibold text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Review Folder Again</span>
        </button>
      </div>

      {/* Action History Log */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Session Activity Log ({history.length})</h3>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-white/5 text-xs">
            {(['all', 'keep', 'delete', 'skip'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterAction(tab)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                  filterAction === tab
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
          <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
            {filteredHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No items matching filter
              </div>
            ) : (
              filteredHistory.map((item, idx) => (
                <div
                  key={`${item.file.id}_${idx}`}
                  className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Action Icon Badge */}
                    <div className="shrink-0">
                      {item.action === 'keep' && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      {item.action === 'delete' && (
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </div>
                      )}
                      {item.action === 'skip' && (
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* File Name & Path */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.file.name}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{truncatePath(item.file.relativePath, 40)}</p>
                    </div>
                  </div>

                  {/* Size & Timestamp */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {formatBytes(item.file.sizeBytes)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                    {onRevealFile && (
                      <button
                        onClick={() => onRevealFile(item.file.path)}
                        className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white"
                        title="Reveal in Explorer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
