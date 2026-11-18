const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const MAX_CHANGE_INPUT_DIGITS = 6

const amountFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats integer cents as Brazilian currency, e.g. 990 -> "R$ 9,90". */
export function formatCurrency(valueInCents: number): string {
  return currencyFormatter.format(valueInCents / 100)
}

/** Formats integer cents without the currency symbol, e.g. 990 -> "9,90". */
export function formatAmount(valueInCents: number): string {
  return amountFormatter.format(valueInCents / 100)
}

/** Right-to-left currency mask for optional change inputs. */
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, MAX_CHANGE_INPUT_DIGITS)
  if (!digits) return ''

  return currencyFormatter.format(Number(digits) / 100)
}
