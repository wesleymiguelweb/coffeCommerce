import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '../../hooks/useTheme'
import styles from './styles.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <Sun size={20} weight="bold" aria-hidden="true" />
      ) : (
        <Moon size={20} weight="bold" aria-hidden="true" />
      )}
    </button>
  )
}
