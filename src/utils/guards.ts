import type { CartItem, CartState } from '../types/cart'
import type { Coffee, CoffeeCategory } from '../types/coffee'
import type { DeliveryQuote } from '../types/delivery'
import type {
  CardBrand,
  DeliveryAddress,
  Order,
  PaymentDetails,
  PaymentMethod,
  PaymentStatus,
} from '../types/order'

export type Theme = 'light' | 'dark'

const COFFEE_CATEGORIES: readonly CoffeeCategory[] = [
  'TRADICIONAL',
  'ESPECIAL',
  'COM LEITE',
  'ALCOÓLICO',
  'GELADO',
]

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'credit',
  'debit',
  'pix',
  'cash',
]

const PAYMENT_STATUSES: readonly PaymentStatus[] = ['approved', 'pending']

const CARD_BRANDS: readonly CardBrand[] = [
  'visa',
  'mastercard',
  'elo',
  'amex',
  'hipercard',
  'unknown',
]

const MAX_INSTALLMENTS = 6
const CARD_LAST4_LENGTH = 4

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isCoffeeCategory(value: unknown): value is CoffeeCategory {
  return (
    typeof value === 'string' &&
    (COFFEE_CATEGORIES as readonly string[]).includes(value)
  )
}

function isCoffee(value: unknown): value is Coffee {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.description === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every(isCoffeeCategory) &&
    isNonNegativeInteger(value.priceInCents) &&
    typeof value.image === 'string'
  )
}

export function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false

  return (
    isCoffee(value.coffee) &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0
  )
}

export function isCartState(value: unknown): value is CartState {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isCartItem)
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === 'string' &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  )
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    typeof value === 'string' &&
    (PAYMENT_STATUSES as readonly string[]).includes(value)
  )
}

export function isCardBrand(value: unknown): value is CardBrand {
  return (
    typeof value === 'string' &&
    (CARD_BRANDS as readonly string[]).includes(value)
  )
}

function isDeliveryAddress(value: unknown): value is DeliveryAddress {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.cep) &&
    isNonEmptyString(value.street) &&
    isNonEmptyString(value.number) &&
    (value.complement === undefined || typeof value.complement === 'string') &&
    isNonEmptyString(value.neighborhood) &&
    isNonEmptyString(value.city) &&
    isNonEmptyString(value.state)
  )
}

export function isDeliveryQuote(value: unknown): value is DeliveryQuote {
  if (!isRecord(value)) return false

  return (
    typeof value.distanceKm === 'number' &&
    Number.isFinite(value.distanceKm) &&
    value.distanceKm >= 0 &&
    isNonNegativeInteger(value.feeInCents) &&
    isNonNegativeInteger(value.minMinutes) &&
    isNonNegativeInteger(value.maxMinutes) &&
    value.maxMinutes >= value.minMinutes &&
    typeof value.estimated === 'boolean' &&
    isNonEmptyString(value.calculatedAt)
  )
}

export function isPaymentDetails(value: unknown): value is PaymentDetails {
  if (!isRecord(value)) return false

  if (!isPaymentMethod(value.method) || !isPaymentStatus(value.status)) {
    return false
  }

  if (
    value.transactionId !== undefined &&
    !isNonEmptyString(value.transactionId)
  ) {
    return false
  }

  if (value.paidAt !== undefined && !isNonEmptyString(value.paidAt)) {
    return false
  }

  if (
    value.cardBrand !== undefined &&
    !isCardBrand(value.cardBrand)
  ) {
    return false
  }

  if (
    value.cardLast4 !== undefined &&
    (typeof value.cardLast4 !== 'string' ||
      value.cardLast4.length !== CARD_LAST4_LENGTH ||
      !/^\d+$/.test(value.cardLast4))
  ) {
    return false
  }

  if (
    value.installments !== undefined &&
    (!isNonNegativeInteger(value.installments) ||
      value.installments < 1 ||
      value.installments > MAX_INSTALLMENTS)
  ) {
    return false
  }

  if (
    value.changeForInCents !== undefined &&
    !isNonNegativeInteger(value.changeForInCents)
  ) {
    return false
  }

  return true
}

export function isOrder(value: unknown): value is Order {
  if (!isRecord(value)) return false

  if (
    !isNonEmptyString(value.id) ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    !value.items.every(isCartItem) ||
    !isDeliveryAddress(value.address) ||
    !isDeliveryQuote(value.delivery) ||
    !isPaymentDetails(value.payment) ||
    !isNonNegativeInteger(value.itemsTotalInCents) ||
    !isNonNegativeInteger(value.totalInCents) ||
    !isNonEmptyString(value.createdAt)
  ) {
    return false
  }

  return (
    value.totalInCents ===
    value.itemsTotalInCents + value.delivery.feeInCents
  )
}

export function isOrderLocationState(
  value: unknown,
): value is { order: Order } {
  return isRecord(value) && isOrder(value.order)
}
