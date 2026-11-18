import type { Coffee } from './coffee'

export interface CartItem {
  coffee: Coffee
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

export interface CartTotals {
  itemCount: number
  itemsTotalInCents: number
}
