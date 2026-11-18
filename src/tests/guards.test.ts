import { describe, it, expect } from 'vitest'
import { coffees } from '../data/coffees'
import type { Order } from '../types/order'
import {
  isCartItem,
  isCartState,
  isOrder,
  isOrderLocationState,
  isPaymentMethod,
  isTheme,
} from '../utils/guards'

const item = { coffee: coffees[0], quantity: 2 }

const order: Order = {
  id: 'CD-ABC123',
  items: [item],
  address: {
    cep: '90020008',
    street: 'Rua dos Andradas',
    number: '1234',
    complement: 'Apto 12',
    neighborhood: 'Centro Histórico',
    city: 'Porto Alegre',
    state: 'RS',
  },
  delivery: {
    distanceKm: 2.4,
    feeInCents: 590,
    minMinutes: 25,
    maxMinutes: 35,
    estimated: false,
    calculatedAt: '2026-11-18T12:00:00.000Z',
  },
  payment: {
    method: 'credit',
    status: 'approved',
    transactionId: 'PAY-ABC123',
    paidAt: '2026-11-18T12:00:00.000Z',
    cardBrand: 'visa',
    cardLast4: '4242',
    installments: 1,
  },
  itemsTotalInCents: 1980,
  totalInCents: 2570,
  createdAt: '2026-11-18T12:00:00.000Z',
}

describe('guards do carrinho', () => {
  it('deve aceitar item e estado válidos', () => {
    expect(isCartItem(item)).toBe(true)
    expect(isCartState({ items: [item] })).toBe(true)
  })

  it('deve recusar quantidade zerada, negativa ou fracionada', () => {
    for (const quantity of [0, -1, 1.5]) {
      expect(isCartItem({ ...item, quantity })).toBe(false)
    }
  })

  it('deve recusar café com preço inválido', () => {
    expect(
      isCartItem({
        ...item,
        coffee: { ...item.coffee, priceInCents: -10 },
      }),
    ).toBe(false)
  })

  it('deve recusar categorias desconhecidas', () => {
    expect(
      isCartItem({
        ...item,
        coffee: { ...item.coffee, tags: ['DESCONHECIDA'] },
      }),
    ).toBe(false)
  })
})

describe('guards de preferências', () => {
  it('deve aceitar apenas os temas suportados', () => {
    expect(isTheme('light')).toBe(true)
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('auto')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })

  it('deve aceitar os quatro métodos de pagamento', () => {
    for (const method of ['credit', 'debit', 'pix', 'cash']) {
      expect(isPaymentMethod(method), method).toBe(true)
    }
    expect(isPaymentMethod('bitcoin')).toBe(false)
  })
})

describe('guards do pedido', () => {
  it('deve aceitar um pedido íntegro', () => {
    expect(isOrder(order)).toBe(true)
    expect(isOrderLocationState({ order })).toBe(true)
  })

  it('deve aceitar um pedido em dinheiro com pagamento pendente', () => {
    expect(
      isOrder({
        ...order,
        payment: {
          method: 'cash',
          status: 'pending',
          changeForInCents: 5000,
        },
      }),
    ).toBe(true)
  })

  it('deve aceitar um pedido PIX aprovado', () => {
    expect(
      isOrder({
        ...order,
        payment: {
          method: 'pix',
          status: 'approved',
          transactionId: 'PAY-PIX123',
          paidAt: '2026-11-18T12:00:00.000Z',
        },
      }),
    ).toBe(true)
  })

  it('deve recusar pedido sem itens', () => {
    expect(isOrder({ ...order, items: [] })).toBe(false)
  })

  it('deve recusar endereço incompleto', () => {
    expect(isOrder({ ...order, address: { ...order.address, city: '' } })).toBe(
      false,
    )
  })

  it('deve recusar totais negativos', () => {
    expect(isOrder({ ...order, totalInCents: -1 })).toBe(false)
  })

  it('deve recusar total que não fecha com itens + entrega', () => {
    expect(isOrder({ ...order, totalInCents: order.totalInCents + 1 })).toBe(
      false,
    )
  })

  it('deve recusar entrega com janela de tempo invertida', () => {
    expect(
      isOrder({
        ...order,
        delivery: { ...order.delivery, minMinutes: 40, maxMinutes: 30 },
      }),
    ).toBe(false)
  })

  it('deve recusar pagamento com status desconhecido', () => {
    expect(
      isOrder({ ...order, payment: { ...order.payment, status: 'refunded' } }),
    ).toBe(false)
  })

  it('deve recusar estado de navegação sem pedido', () => {
    expect(isOrderLocationState(null)).toBe(false)
    expect(isOrderLocationState({})).toBe(false)
  })
})
