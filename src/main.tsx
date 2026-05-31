import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

try {
  const { init, miniApp, viewport, themeParams } = await import('@telegram-apps/sdk')
  init()
  miniApp.mountSync()
  themeParams.mountSync()
  viewport.mount()
  miniApp.bindCssVars()
  themeParams.bindCssVars()
  document.documentElement.dataset.telegram = 'true'
  const applyColorScheme = () => {
    document.documentElement.dataset.theme = themeParams.isDark() ? 'dark' : 'light'
  }
  applyColorScheme()
  themeParams.isDark.sub(applyColorScheme)
  miniApp.ready()
  if (viewport.expand.isAvailable()) viewport.expand()
} catch {
  // Running outside Telegram — use saved preference or system default
  const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  document.documentElement.dataset.theme = saved ?? system
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
