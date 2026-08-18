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
    <div className="flex items-center justify-center gap-4 py-4 select-none">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo || disabled}
        className={`p-3.5 rounded-2xl glass-button text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center ${
          !canUndo || disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-slate-400 hover:scale-105 active:scale-95'
        }`}
        title="Undo Last Action (Z / Ctrl+Z)"
      >
        <Undo2 className="w-5 h-5" />
      </button>

      {/* Delete / Trash Button (Swipe Left) */}
      <button
        onClick={onDelete}
        disabled={disabled}
        className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600/90 to-red-500/90 hover:from-rose-500 hover:to-red-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 hover:shadow-glow-delete border border-rose-400/30 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group"
        title="Delete to Trash (← / A)"
      >
        <Trash2 className="w-7 h-7 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* Skip Button (Swipe Down / Send to End) */}
      <button
        onClick={onSkip}
        disabled={disabled}
        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600/80 to-yellow-500/80 hover:from-amber-500 hover:to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 hover:shadow-glow-skip border border-amber-400/30 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Skip to End (↓ / S / Space)"
      >
        <Clock className="w-6 h-6" />
      </button>

      {/* Keep Button (Swipe Right) */}
      <button
        onClick={onKeep}
        disabled={disabled}
        className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600/90 to-teal-500/90 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:shadow-glow-keep border border-emerald-400/30 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group"
        title="Keep File (→ / D)"
      >
        <Check className="w-7 h-7 stroke-[3] group-hover:scale-110 transition-transform duration-200" />
      </button>

      {/* Reveal in Explorer Button */}
      {onReveal && (
        <button
          onClick={onReveal}
          disabled={disabled}
          className="p-3.5 rounded-2xl glass-button text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center hover:border-blue-400 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Open in File Explorer (O)"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
