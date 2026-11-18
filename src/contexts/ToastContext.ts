import { createContext } from 'react'

export type ToastTone = 'success' | 'info' | 'warning'

export interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
}

export interface ToastItem extends ToastInput {
  id: string
  tone: ToastTone
}

export interface ToastContextValue {
  toasts: ToastItem[]
  notify: (toast: ToastInput) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
