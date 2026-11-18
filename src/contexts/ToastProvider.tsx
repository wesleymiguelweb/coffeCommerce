import { useCallback, useEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { ToastViewport } from '../components/ToastViewport'
import { TOAST_DURATION_MS } from '../utils/constants'
import { ToastContext } from './ToastContext'
import type { ToastInput, ToastItem } from './ToastContext'

const MAX_VISIBLE_TOASTS = 3
const TOAST_ID_PREFIX = 'toast'

/**
 * Keeps ephemeral notifications in one place. Each toast owns a timer that is
 * cleared when the toast is dismissed or the provider unmounts.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (input: ToastInput) => {
      nextId.current += 1
      const id = `${TOAST_ID_PREFIX}-${nextId.current}`
      const toast: ToastItem = {
        ...input,
        id,
        tone: input.tone ?? 'success',
      }

      setToasts((current) => [...current, toast].slice(-MAX_VISIBLE_TOASTS))

      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current

    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
