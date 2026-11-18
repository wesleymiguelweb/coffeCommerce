const ORDER_ID_RADIX = 36
const ORDER_ID_LENGTH = 6
const ORDER_ID_PREFIX = 'CD'

export function createOrderId(now = new Date()): string {
  const timestamp = now
    .getTime()
    .toString(ORDER_ID_RADIX)
    .toUpperCase()
    .slice(-ORDER_ID_LENGTH)

  return `${ORDER_ID_PREFIX}-${timestamp}`
}
