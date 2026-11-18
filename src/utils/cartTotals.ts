import type { CartItem, CartTotals } from '../types/cart'

/** Calculates cart amounts in integer cents to avoid floating point drift. */
export function calculateCartTotals(items: CartItem[]): CartTotals {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const itemsTotalInCents = items.reduce(
    (total, item) => total + item.coffee.priceInCents * item.quantity,
    0,
  )

  return { itemCount, itemsTotalInCents }
}
