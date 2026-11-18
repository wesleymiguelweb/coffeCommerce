import { createContext } from 'react'
import type { CartItem, CartTotals } from '../types/cart'
import type { Coffee } from '../types/coffee'

export interface CartContextValue extends CartTotals {
  items: CartItem[]
  addItem: (coffee: Coffee, quantity?: number) => void
  incrementItem: (coffeeId: string) => void
  decrementItem: (coffeeId: string) => void
  removeItem: (coffeeId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
