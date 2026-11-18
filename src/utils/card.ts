import type { CardBrand } from '../types/order'
import { CARD_CVV_LENGTH, MAX_INSTALLMENTS } from './constants'
import { formatCurrency } from './formatCurrency'

const MIN_CARD_DIGITS = 13
const MAX_CARD_DIGITS = 19
const DIGITS_GROUP_SIZE = 4
const EXPIRY_MONTH_DIGITS = 2
const EXPIRY_YEAR_DIGITS = 2
const MIN_MONTH = 1
const MAX_MONTH = 12
const CENTURY = 2000
const LAST_FOUR_DIGITS = 4

const ELO_PREFIXES = [
  '4011',
  '4312',
  '4389',
  '4514',
  '4573',
  '5041',
  '5067',
  '509',
  '6277',
  '6362',
  '6363',
  '650',
  '6516',
  '6550',
]

export function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, MAX_CARD_DIGITS)
}

export function formatCardNumber(value: string): string {
  const digits = normalizeCardNumber(value)
  const groups = digits.match(
    new RegExp(`.{1,${DIGITS_GROUP_SIZE}}`, 'g'),
  )

  return groups ? groups.join(' ') : ''
}

export function formatCardExpiry(value: string): string {
  const digits = value
    .replace(/\D/g, '')
    .slice(0, EXPIRY_MONTH_DIGITS + EXPIRY_YEAR_DIGITS)

  if (digits.length <= EXPIRY_MONTH_DIGITS) return digits

  return `${digits.slice(0, EXPIRY_MONTH_DIGITS)}/${digits.slice(EXPIRY_MONTH_DIGITS)}`
}

export function formatCardCvv(value: string): string {
  return value.replace(/\D/g, '').slice(0, CARD_CVV_LENGTH)
}

/** Luhn checksum, used before any simulated authorization. */
export function isValidCardNumber(value: string): boolean {
  const digits = normalizeCardNumber(value)

  if (digits.length < MIN_CARD_DIGITS || digits.length > MAX_CARD_DIGITS) {
    return false
  }

  let sum = 0
  let shouldDouble = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    const digit = Number(digits[index])

    if (shouldDouble) {
      const doubled = digit * 2
      sum += doubled > 9 ? doubled - 9 : doubled
    } else {
      sum += digit
    }

    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

export function detectCardBrand(value: string): CardBrand {
  const digits = normalizeCardNumber(value)

  if (!digits) return 'unknown'

  if (ELO_PREFIXES.some((prefix) => digits.startsWith(prefix))) return 'elo'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^(606282|3841)/.test(digits)) return 'hipercard'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return 'mastercard'
  }
  if (/^4/.test(digits)) return 'visa'

  return 'unknown'
}

export function getCardBrandLabel(brand: CardBrand): string {
  const labels: Record<CardBrand, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    elo: 'Elo',
    amex: 'American Express',
    hipercard: 'Hipercard',
    unknown: 'Cartão',
  }

  return labels[brand]
}

/** Card expiry is valid through the last day of the informed month. */
export function isExpiryValid(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim())
  if (!match) return false

  const month = Number(match[1])
  const year = CENTURY + Number(match[2])

  if (month < MIN_MONTH || month > MAX_MONTH) return false

  const firstDayOfNextMonth = new Date(year, month, 1)
  return firstDayOfNextMonth.getTime() > now.getTime()
}

export function getCardLast4(value: string): string {
  return normalizeCardNumber(value).slice(-LAST_FOUR_DIGITS)
}

export function maskCardNumber(value: string): string {
  const last4 = getCardLast4(value)
  return last4 ? `•••• ${last4}` : ''
}

export function getInstallmentOptions(): number[] {
  return Array.from({ length: MAX_INSTALLMENTS }, (_, index) => index + 1)
}

export function formatInstallmentValue(
  totalInCents: number,
  installments: number,
): string {
  const value = Math.ceil(totalInCents / installments)
  return `${installments}x de ${formatCurrency(value)}`
}
