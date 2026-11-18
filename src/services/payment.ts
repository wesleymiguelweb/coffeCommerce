import type { PaymentDetails } from '../types/order'
import {
  detectCardBrand,
  getCardLast4,
  normalizeCardNumber,
} from '../utils/card'
import {
  PAYMENT_DECLINE_CARD_SUFFIX,
  PAYMENT_SIMULATION_DELAY_MS,
  PIX_KEY,
} from '../utils/constants'

const TRANSACTION_ID_RADIX = 36
const TRANSACTION_ID_LENGTH = 6

export interface CardPaymentInput {
  method: 'credit' | 'debit'
  cardNumber: string
  installments?: number
}

export interface PixPaymentInput {
  method: 'pix'
}

export type PaymentRequest = CardPaymentInput | PixPaymentInput

export type PaymentResult =
  | { status: 'approved'; payment: PaymentDetails }
  | { status: 'declined'; message: string }

export function createTransactionId(now = new Date()): string {
  const timestamp = now
    .getTime()
    .toString(TRANSACTION_ID_RADIX)
    .toUpperCase()
    .slice(-TRANSACTION_ID_LENGTH)
  return `PAY-${timestamp}`
}

/**
 * Human-readable code encoded in the demo QR. It is intentionally not a
 * banking payload: this project never talks to a payment gateway.
 */
export function createPixDemoCode(orderId: string, totalInCents: number): string {
  const amount = (totalInCents / 100).toFixed(2)
  return [
    'COFFEE-DELIVERY-DEMO',
    `pedido=${orderId}`,
    `valor=R$${amount.replace('.', ',')}`,
    `chave=${PIX_KEY}`,
    'ambiente=simulacao',
  ].join('|')
}

export function createCashPayment(
  changeForInCents?: number,
): PaymentDetails {
  return {
    method: 'cash',
    status: 'pending',
    changeForInCents,
  }
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Payment aborted', 'AbortError'))
      return
    }

    const timeoutId = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, milliseconds)

    function handleAbort() {
      globalThis.clearTimeout(timeoutId)
      reject(new DOMException('Payment aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

/**
 * Simulates a gateway round-trip. Card numbers ending in 0002 are declined so
 * the failure path can be demonstrated and tested; everything else is approved.
 */
export async function processPayment(
  request: PaymentRequest,
  signal?: AbortSignal,
  now = new Date(),
): Promise<PaymentResult> {
  await wait(PAYMENT_SIMULATION_DELAY_MS, signal)

  if (request.method === 'pix') {
    return {
      status: 'approved',
      payment: {
        method: 'pix',
        status: 'approved',
        transactionId: createTransactionId(now),
        paidAt: now.toISOString(),
      },
    }
  }

  const cardNumber = normalizeCardNumber(request.cardNumber)

  if (cardNumber.endsWith(PAYMENT_DECLINE_CARD_SUFFIX)) {
    return {
      status: 'declined',
      message:
        'Pagamento recusado pela emissora. Confira os dados ou use outro cartão.',
    }
  }

  return {
    status: 'approved',
    payment: {
      method: request.method,
      status: 'approved',
      transactionId: createTransactionId(now),
      paidAt: now.toISOString(),
      cardBrand: detectCardBrand(cardNumber),
      cardLast4: getCardLast4(cardNumber),
      installments: request.method === 'credit' ? request.installments ?? 1 : undefined,
    },
  }
}
