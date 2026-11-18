import { useContext } from 'react'
import { CartContext } from '../contexts/CartContext'
import type { CartContextValue } from '../contexts/CartContext'

export function useCart(): CartContextValue {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider.')
  }

  return context
}
