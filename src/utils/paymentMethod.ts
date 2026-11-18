import type { PaymentMethod, PaymentStatus } from '../types/order'

interface PaymentMethodOption {
  readonly id: PaymentMethod
  readonly label: string
  readonly description: string
}

export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethodOption[] = [
  {
    id: 'credit',
    label: 'Cartão de Crédito',
    description: 'Em até 6x sem juros',
  },
  {
    id: 'debit',
    label: 'Cartão de Débito',
    description: 'Aprovação na hora',
  },
  {
    id: 'pix',
    label: 'PIX',
    description: 'QR Code e confirmação imediata',
  },
  {
    id: 'cash',
    label: 'Dinheiro',
    description: 'Pague na entrega',
  },
]

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'PIX',
  cash: 'Dinheiro',
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  approved: 'Pagamento aprovado',
  pending: 'Pagamento na entrega',
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method]
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status]
}
