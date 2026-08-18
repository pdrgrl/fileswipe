import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'dark' | 'light' | 'amoled'

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('fileswipe_theme') as ThemeMode
    return saved === 'light' || saved === 'dark' || saved === 'amoled' ? saved : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark', 'theme-amoled', 'dark', 'light')
    root.classList.add(`theme-${theme}`)
    if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
    }
    localStorage.setItem('fileswipe_theme', theme)
  }, [theme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState(current => {
      if (current === 'dark') return 'amoled'
      if (current === 'amoled') return 'light'
      return 'dark'
    })
  }, [])

  return { theme, setTheme, cycleTheme }
}
