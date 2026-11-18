import type { CartItem } from './cart'
import type { DeliveryQuote } from './delivery'

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash'

export type PaymentStatus = 'approved' | 'pending'

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'elo'
  | 'amex'
  | 'hipercard'
  | 'unknown'

export interface DeliveryAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface PaymentDetails {
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  paidAt?: string
  cardBrand?: CardBrand
  cardLast4?: string
  installments?: number
  changeForInCents?: number
}

export interface Order {
  id: string
  items: CartItem[]
  address: DeliveryAddress
  delivery: DeliveryQuote
  payment: PaymentDetails
  itemsTotalInCents: number
  totalInCents: number
  createdAt: string
}

/** The immutable snapshot rendered by the success page after the cart is cleared. */
export type OrderSnapshot = Order
