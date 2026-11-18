import { createContext } from 'react'
import type { Theme } from '../utils/guards'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
