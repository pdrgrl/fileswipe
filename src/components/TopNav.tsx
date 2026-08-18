import { Flame, Folder, SlidersHorizontal, Volume2, VolumeX, RefreshCw } from 'lucide-react'
import type { StorageStats } from '../types'
import { formatBytes } from '../utils/formatters'

interface TopNavProps {
  folderName: string
  stats: StorageStats
  queueRemaining: number
  soundEnabled: boolean
  onToggleSound: () => void
  onOpenFilter: () => void
  onChangeFolder: () => void
  onResetScan: () => void
}

export function TopNav({
  folderName,
  stats,
  queueRemaining,
  soundEnabled,
  onToggleSound,
  onOpenFilter,
  onChangeFolder,
  onResetScan
}: TopNavProps) {
  const total = stats.totalFiles
  const reviewedCount = stats.keptCount + stats.deletedCount
  const progressPercent = total > 0 ? Math.round((reviewedCount / total) * 100) : 0

  return (
    <header className="w-full px-6 py-3.5 glass-panel border-b border-white/[0.08] flex items-center justify-between gap-4 z-40 select-none">
      {/* Left: Brand & Current Folder */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2 font-black text-lg tracking-tight bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
          <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span>FileSwipe</span>
        </div>

        {folderName && (
          <button
            onClick={onChangeFolder}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-button text-xs font-medium text-slate-300 hover:text-white max-w-[200px] truncate group border-blue-500/20 hover:border-blue-500/50"
            title="Click to Switch Folder"
          >
            <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">{folderName}</span>
          </button>
        )}
      </div>

      {/* Center: Progress Bar & Review Counter */}
      {total > 0 && (
        <div className="flex-1 max-w-xs flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-400">
            <span>Progress: {progressPercent}%</span>
            <span className="text-slate-300 font-mono">{queueRemaining} left</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-elevated border border-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Right: Storage Meter & Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Reclaimed Space Tag */}
        {stats.reclaimedBytes > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold shadow-sm shadow-rose-500/20 animate-pulse-subtle">
            <span>🔥 {formatBytes(stats.reclaimedBytes)} Reclaimed</span>
          </div>
        )}

        {/* Rescan / Restart Button */}
        <button
          onClick={onResetScan}
          className="p-2 rounded-xl glass-button text-slate-400 hover:text-white"
          title="Restart Review Queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Filter Button */}
        <button
          onClick={onOpenFilter}
          className="p-2 rounded-xl glass-button text-slate-400 hover:text-white"
          title="Filter & Sort Files"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Audio Toggle Button */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl glass-button text-slate-400 hover:text-white"
          title={soundEnabled ? "Mute Sound Effects (M)" : "Enable Sound Effects (M)"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>
    </header>
  )
}
