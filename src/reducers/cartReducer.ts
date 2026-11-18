import type { CartState } from '../types/cart'
import type { CartAction } from './cartActions'

export const initialCartState: CartState = { items: [] }

/**
 * Pure cart reducer. Every transition returns a new object and never mutates
 * the previous state, which keeps React updates predictable.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { coffee, quantity } = action.payload
      if (!Number.isInteger(quantity) || quantity <= 0) return state

      const existingItem = state.items.find(
        (item) => item.coffee.id === coffee.id,
      )

      if (!existingItem) {
        return { items: [...state.items, { coffee, quantity }] }
      }

      return {
        items: state.items.map((item) =>
          item.coffee.id === coffee.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      }
    }

    case 'INCREMENT_ITEM_QUANTITY': {
      const { coffeeId } = action.payload

      return {
        items: state.items.map((item) =>
          item.coffee.id === coffeeId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      }
    }

    case 'DECREMENT_ITEM_QUANTITY': {
      const { coffeeId } = action.payload

      return {
        items: state.items.flatMap((item) => {
          if (item.coffee.id !== coffeeId) return [item]
          return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []
        }),
      }
    }

    case 'REMOVE_ITEM': {
      const { coffeeId } = action.payload

      return {
        items: state.items.filter((item) => item.coffee.id !== coffeeId),
      }
    }

    case 'CLEAR_CART':
      return initialCartState

    default:
      return state
  }
}
