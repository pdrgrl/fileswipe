import { Flame, Folder, SlidersHorizontal, Volume2, VolumeX, RefreshCw, Sun, Moon, Sparkles, Minus, Square, X } from 'lucide-react'
import type { StorageStats } from '../types'
import type { ThemeMode } from '../hooks/useTheme'
import { formatBytes } from '../utils/formatters'

interface TopNavProps {
  folderName: string
  stats: StorageStats
  queueRemaining: number
  soundEnabled: boolean
  currentTheme: ThemeMode
  onCycleTheme: () => void
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
  currentTheme,
  onCycleTheme,
  onToggleSound,
  onOpenFilter,
  onChangeFolder,
  onResetScan
}: TopNavProps) {
  const total = stats.totalFiles
  const reviewedCount = stats.keptCount + stats.deletedCount
  const progressPercent = total > 0 ? Math.round((reviewedCount / total) * 100) : 0

  const handleMinimize = () => {
    if (window.api && typeof window.api.minimizeWindow === 'function') {
      window.api.minimizeWindow()
    }
  }

  const handleMaximize = () => {
    if (window.api && typeof window.api.maximizeWindow === 'function') {
      window.api.maximizeWindow()
    }
  }

  const handleClose = () => {
    if (window.api && typeof window.api.closeWindow === 'function') {
      window.api.closeWindow()
    }
  }

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light': return <Sun className="w-3.5 h-3.5 text-amber-500" />
      case 'amoled': return <Sparkles className="w-3.5 h-3.5 text-purple-400" />
      case 'dark': default: return <Moon className="w-3.5 h-3.5 text-sky-400" />
    }
  }

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light': return 'Light'
      case 'amoled': return 'AMOLED'
      case 'dark': default: return 'Dark'
    }
  }

  return (
    <header className="w-full h-11 px-3 themed-panel border-b flex items-center justify-between gap-3 z-40 select-none drag-region shrink-0">
      {/* Left: Brand & Current Folder */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-[var(--text-main)] no-drag cursor-default">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-400 p-[1px] shadow-sm">
            <div className="w-full h-full bg-[var(--bg-surface)] rounded-[7px] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <span className="font-extrabold tracking-tight">FileSwipe</span>
        </div>

        <div className="h-3.5 w-[1px] bg-[var(--border-app)]" />

        {folderName && (
          <button
            onClick={onChangeFolder}
            className="no-drag flex items-center gap-1.5 px-2 py-1 rounded-md themed-button text-xs font-medium max-w-[200px] truncate group"
            title="Click to Switch Folder"
          >
            <Folder className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-105 transition-transform" />
            <span className="truncate">{folderName}</span>
          </button>
        )}
      </div>

      {/* Center: Progress Bar & Review Counter */}
      {total > 0 && (
        <div className="flex-1 max-w-xs flex flex-col items-center gap-0.5 no-drag">
          <div className="flex items-center justify-between w-full text-[10px] text-[var(--text-muted)] font-medium">
            <span>{progressPercent}% done</span>
            <span className="font-mono text-[9px] bg-[var(--button-bg)] px-1.5 py-0.5 rounded border border-[var(--border-app)]">
              {queueRemaining} / {total} left
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Right: Tools, Theme Switcher & Integrated Window Controls */}
      <div className="flex items-center gap-1.5 no-drag">
        {/* Reclaimed Space Tag */}
        {stats.reclaimedBytes > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>{formatBytes(stats.reclaimedBytes)}</span>
          </div>
        )}

        {/* Rescan / Restart Button */}
        <button
          onClick={onResetScan}
          className="p-1.5 rounded-md themed-button"
          title="Restart Review Queue"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Filter Button */}
        <button
          onClick={onOpenFilter}
          className="p-1.5 rounded-md themed-button"
          title="Filter & Sort Files"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Audio Toggle Button */}
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-md themed-button"
          title={soundEnabled ? "Mute Audio (M)" : "Enable Audio (M)"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-[var(--text-subtle)]" />}
        </button>

        {/* 3-way Theme Switcher Button */}
        <button
          onClick={onCycleTheme}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md themed-button text-xs font-semibold"
          title={`Current Theme: ${getThemeLabel()} (Click to cycle Light / Dark / AMOLED)`}
        >
          {getThemeIcon()}
          <span className="text-[11px] font-medium hidden sm:inline">{getThemeLabel()}</span>
        </button>

        <div className="h-4 w-[1px] bg-[var(--border-app)] mx-1" />

        {/* Integrated Window Controls */}
        <div className="flex items-center gap-0.5">
          {/* Minimize */}
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded-md themed-button flex items-center justify-center hover:bg-[var(--button-hover)]"
            title="Minimize Window"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize */}
          <button
            onClick={handleMaximize}
            className="w-7 h-7 rounded-md themed-button flex items-center justify-center hover:bg-[var(--button-hover)]"
            title="Maximize / Restore"
          >
            <Square className="w-3 h-3" />
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-md themed-button flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
            title="Close Application"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
