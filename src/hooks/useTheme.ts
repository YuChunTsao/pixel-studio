import { useState } from 'react'

export function useTheme() {
  const isTelegram = document.documentElement.dataset.telegram === 'true'
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'dark'
  )

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return { theme, isTelegram, toggle }
}
