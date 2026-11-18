/** Removes every non-digit character. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Returns the CEP as 8 digits, or fewer while the user is still typing. */
export function normalizeCep(value: string): string {
  return onlyDigits(value).slice(0, 8)
}

/** Masks a CEP for display, e.g. "01310100" -> "01310-100". */
export function formatCep(value: string): string {
  const digits = normalizeCep(value)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}
