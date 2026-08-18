import { Check, Trash2, Clock, Undo2, FolderOpen } from 'lucide-react'

interface SwipeControlsProps {
  onKeep: () => void
  onDelete: () => void
  onSkip: () => void
  onUndo: () => void
  onReveal?: () => void
  canUndo: boolean
  disabled?: boolean
}

export function SwipeControls({
  onKeep,
  onDelete,
  onSkip,
  onUndo,
  onReveal,
  canUndo,
  disabled = false
}: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center select-none py-3">
      {/* Floating Themed Capsule Dock */}
      <div className="flex items-center gap-3 px-5 py-2 rounded-full themed-dock">
        {/* 1. Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl themed-button transition-all ${
            !canUndo || disabled ? 'opacity-25 cursor-not-allowed' : ''
          }`}
          title="Undo Last Action (Z)"
        >
          <Undo2 className="w-4 h-4" />
          <span className="kbd-keycap">Z</span>
        </button>

        <div className="w-[1px] h-5 bg-[var(--border-app)]" />

        {/* 2. Delete / Trash Button (Swipe Left) */}
        <button
          onClick={onDelete}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/25 hover:border-rose-500/50 shadow-sm shadow-rose-500/10 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Trash File (← / A)"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Trash</span>
          <span className="kbd-keycap text-rose-300 border-rose-500/30 bg-rose-950/40">A</span>
        </button>

        {/* 3. Skip Button (Swipe Down) */}
        <button
          onClick={onSkip}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/25 hover:border-amber-500/50 shadow-sm shadow-amber-500/10 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Skip File (↓ / S / Space)"
        >
          <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Skip</span>
          <span className="kbd-keycap text-amber-300 border-amber-500/30 bg-amber-950/40">S</span>
        </button>

        {/* 4. Keep Button (Swipe Right) */}
        <button
          onClick={onKeep}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/25 hover:border-emerald-500/50 shadow-sm shadow-emerald-500/10 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Keep File (→ / D)"
        >
          <Check className="w-4 h-4 stroke-[3] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Keep</span>
          <span className="kbd-keycap text-emerald-300 border-emerald-500/30 bg-emerald-950/40">D</span>
        </button>

        {/* 5. Reveal in Explorer Button */}
        {onReveal && (
          <>
            <div className="w-[1px] h-5 bg-[var(--border-app)]" />
            <button
              onClick={onReveal}
              disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl themed-button transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              title="Reveal in File Explorer (O)"
            >
              <FolderOpen className="w-4 h-4 text-sky-400" />
              <span className="kbd-keycap">O</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
