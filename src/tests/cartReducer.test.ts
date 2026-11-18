import { describe, it, expect } from 'vitest'
import { coffees } from '../data/coffees'
import {
  addItemAction,
  clearCartAction,
  decrementItemQuantityAction,
  incrementItemQuantityAction,
  removeItemAction,
} from '../reducers/cartActions'
import { cartReducer, initialCartState } from '../reducers/cartReducer'
import type { CartState } from '../types/cart'

const [expresso, latte] = coffees

function stateWith(items: CartState['items']): CartState {
  return { items }
}

describe('cartReducer', () => {
  it('deve adicionar um item ao carrinho', () => {
    const next = cartReducer(initialCartState, addItemAction(expresso, 2))

    expect(next.items).toHaveLength(1)
    expect(next.items[0]).toEqual({ coffee: expresso, quantity: 2 })
  })

  it('deve acumular a quantidade para um item já existente', () => {
    const state = stateWith([{ coffee: expresso, quantity: 1 }])
    const next = cartReducer(state, addItemAction(expresso, 3))

    expect(next.items).toHaveLength(1)
    expect(next.items[0].quantity).toBe(4)
  })

  it('deve manter itens distintos separados', () => {
    const state = stateWith([{ coffee: expresso, quantity: 1 }])
    const next = cartReducer(state, addItemAction(latte, 2))

    expect(next.items).toHaveLength(2)
    expect(next.items.map((item) => item.coffee.id)).toEqual([
      expresso.id,
      latte.id,
    ])
  })

  it('deve incrementar a quantidade de um item', () => {
    const state = stateWith([{ coffee: expresso, quantity: 2 }])
    const next = cartReducer(state, incrementItemQuantityAction(expresso.id))

    expect(next.items[0].quantity).toBe(3)
  })

  it('deve decrementar e remover o item ao chegar em zero', () => {
    const state = stateWith([{ coffee: expresso, quantity: 1 }])
    const next = cartReducer(state, decrementItemQuantityAction(expresso.id))

    expect(next.items).toEqual([])
  })

  it('deve remover um item pelo id', () => {
    const state = stateWith([
      { coffee: expresso, quantity: 1 },
      { coffee: latte, quantity: 2 },
    ])
    const next = cartReducer(state, removeItemAction(expresso.id))

    expect(next.items).toEqual([{ coffee: latte, quantity: 2 }])
  })

  it('deve limpar o carrinho', () => {
    const state = stateWith([{ coffee: expresso, quantity: 2 }])
    const next = cartReducer(state, clearCartAction())

    expect(next).toEqual(initialCartState)
  })

  it('deve ignorar ação de adição com quantidade inválida', () => {
    const state = stateWith([{ coffee: expresso, quantity: 1 }])
    const next = cartReducer(state, addItemAction(latte, 0))

    expect(next).toBe(state)
  })

  it('deve ignorar incremento de um item inexistente', () => {
    const state = stateWith([{ coffee: expresso, quantity: 1 }])
    const next = cartReducer(state, incrementItemQuantityAction('nao-existe'))

    expect(next.items).toEqual(state.items)
  })

  it('não deve mutar o estado anterior', () => {
    const state = stateWith([{ coffee: expresso, quantity: 1 }])
    const next = cartReducer(state, incrementItemQuantityAction(expresso.id))

    expect(state.items[0].quantity).toBe(1)
    expect(next).not.toBe(state)
    expect(next.items).not.toBe(state.items)
  })
})
