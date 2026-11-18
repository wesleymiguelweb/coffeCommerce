import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { PropsWithChildren } from 'react'
import { coffees } from '../data/coffees'
import {
  addItemAction,
  clearCartAction,
  decrementItemQuantityAction,
  incrementItemQuantityAction,
  removeItemAction,
} from '../reducers/cartActions'
import { cartReducer } from '../reducers/cartReducer'
import type { CartState } from '../types/cart'
import type { Coffee } from '../types/coffee'
import { calculateCartTotals } from '../utils/cartTotals'
import { CART_STORAGE_KEY } from '../utils/constants'
import { isCartState } from '../utils/guards'
import { readStoredValue, writeStoredValue } from '../utils/storage'
import { CartContext } from './CartContext'
import type { CartContextValue } from './CartContext'

const coffeeById = new Map(coffees.map((coffee) => [coffee.id, coffee]))

/**
 * Rebuilds the stored cart against the current catalog so stale prices or
 * removed products never leak into the UI. Unknown entries are discarded.
 */
function initializeCart(): CartState {
  const stored = readStoredValue(CART_STORAGE_KEY, isCartState)
  if (!stored) return { items: [] }

  const items = stored.items.flatMap((item) => {
    const coffee = coffeeById.get(item.coffee.id)
    return coffee ? [{ coffee, quantity: item.quantity }] : []
  })

  return { items }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initializeCart)

  useEffect(() => {
    writeStoredValue(CART_STORAGE_KEY, state)
  }, [state])

  const addItem = useCallback((coffee: Coffee, quantity = 1) => {
    dispatch(addItemAction(coffee, quantity))
  }, [])

  const incrementItem = useCallback((coffeeId: string) => {
    dispatch(incrementItemQuantityAction(coffeeId))
  }, [])

  const decrementItem = useCallback((coffeeId: string) => {
    dispatch(decrementItemQuantityAction(coffeeId))
  }, [])

  const removeItem = useCallback((coffeeId: string) => {
    dispatch(removeItemAction(coffeeId))
  }, [])

  const clearCart = useCallback(() => {
    dispatch(clearCartAction())
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      ...calculateCartTotals(state.items),
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [state.items, addItem, incrementItem, decrementItem, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
