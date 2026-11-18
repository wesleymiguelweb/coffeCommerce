import type { Coffee } from '../types/coffee'

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { coffee: Coffee; quantity: number } }
  | { type: 'INCREMENT_ITEM_QUANTITY'; payload: { coffeeId: string } }
  | { type: 'DECREMENT_ITEM_QUANTITY'; payload: { coffeeId: string } }
  | { type: 'REMOVE_ITEM'; payload: { coffeeId: string } }
  | { type: 'CLEAR_CART' }

export const addItemAction = (
  coffee: Coffee,
  quantity: number,
): CartAction => ({
  type: 'ADD_ITEM',
  payload: { coffee, quantity },
})

export const incrementItemQuantityAction = (coffeeId: string): CartAction => ({
  type: 'INCREMENT_ITEM_QUANTITY',
  payload: { coffeeId },
})

export const decrementItemQuantityAction = (coffeeId: string): CartAction => ({
  type: 'DECREMENT_ITEM_QUANTITY',
  payload: { coffeeId },
})

export const removeItemAction = (coffeeId: string): CartAction => ({
  type: 'REMOVE_ITEM',
  payload: { coffeeId },
})

export const clearCartAction = (): CartAction => ({ type: 'CLEAR_CART' })
