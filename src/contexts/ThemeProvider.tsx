import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { THEME_STORAGE_KEY } from '../utils/constants'
import { isTheme } from '../utils/guards'
import type { Theme } from '../utils/guards'
import { readStoredValue, writeStoredValue } from '../utils/storage'
import { ThemeContext } from './ThemeContext'
import type { ThemeContextValue } from './ThemeContext'

function getInitialTheme(): Theme {
  const stored = readStoredValue(THEME_STORAGE_KEY, isTheme)
  if (stored) return stored

  const documentTheme = document.documentElement.dataset.theme
  if (isTheme(documentTheme)) return documentTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'dark' ? '#121214' : '#FAFAFA')

    writeStoredValue(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
