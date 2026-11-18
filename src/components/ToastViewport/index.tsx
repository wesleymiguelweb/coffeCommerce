import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import type { ToastItem } from '../../contexts/ToastContext'
import styles from './styles.module.css'

const TONE_ICONS = {
  success: CheckCircle,
  info: Info,
  warning: WarningCircle,
} as const

interface ToastViewportProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      className={styles.viewport}
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = TONE_ICONS[toast.tone]

        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.tone]}`}
          >
            <span className={styles.icon} aria-hidden="true">
              <Icon size={20} weight="fill" />
            </span>

            <div className={styles.content}>
              <strong className={styles.title}>{toast.title}</strong>
              {toast.description && (
                <p className={styles.description}>{toast.description}</p>
              )}
            </div>

            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label={`Fechar notificação: ${toast.title}`}
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
