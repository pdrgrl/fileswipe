import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onKeep: () => void
  onDelete: () => void
  onSkip: () => void
  onUndo: () => void
  onReveal?: () => void
  onToggleSound?: () => void
  onCloseModal?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onKeep,
  onDelete,
  onSkip,
  onUndo,
  onReveal,
  onToggleSound,
  onCloseModal,
  enabled = true
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseModal?.()
        return
      }

      // Undo (Ctrl+Z or Cmd+Z or 'z')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        onUndo()
        return
      }

      if (e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        onUndo()
        return
      }

      // Keep (ArrowRight or 'd' or 'D')
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault()
        onKeep()
        return
      }

      // Delete (ArrowLeft or 'a' or 'A')
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault()
        onDelete()
        return
      }

      // Skip (ArrowDown or 's' or 'S' or Space)
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's' || e.key === ' ') {
        e.preventDefault()
        onSkip()
        return
      }

      // Reveal (o or O)
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault()
        onReveal?.()
        return
      }

      // Toggle Sound (m or M)
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        onToggleSound?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onKeep, onDelete, onSkip, onUndo, onReveal, onToggleSound, onCloseModal, enabled])
}
