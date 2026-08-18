import { useState, useCallback, useEffect } from 'react'
import { sounds } from '../utils/soundEffects'

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('fileswipe_sound_enabled')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    sounds.setEnabled(enabled)
    localStorage.setItem('fileswipe_sound_enabled', String(enabled))
  }, [enabled])

  const toggleSound = useCallback(() => {
    setEnabled(prev => !prev)
  }, [])

  const playKeep = useCallback(() => sounds.playKeep(), [])
  const playDelete = useCallback(() => sounds.playDelete(), [])
  const playSkip = useCallback(() => sounds.playSkip(), [])
  const playUndo = useCallback(() => sounds.playUndo(), [])
  const playVictory = useCallback(() => sounds.playVictory(), [])

  return {
    soundEnabled: enabled,
    toggleSound,
    playKeep,
    playDelete,
    playSkip,
    playUndo,
    playVictory
  }
}
