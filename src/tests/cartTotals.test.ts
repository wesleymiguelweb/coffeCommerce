import { describe, it, expect } from 'vitest'
import { coffees } from '../data/coffees'
import { calculateCartTotals } from '../utils/cartTotals'

const [expresso, latte] = coffees

describe('calculateCartTotals', () => {
  it('deve retornar tudo zerado para um carrinho vazio', () => {
    expect(calculateCartTotals([])).toEqual({
      itemCount: 0,
      itemsTotalInCents: 0,
    })
  })

  it('deve somar quantidades e o valor dos itens', () => {
    const totals = calculateCartTotals([
      { coffee: expresso, quantity: 2 },
      { coffee: latte, quantity: 1 },
    ])

    expect(totals.itemCount).toBe(3)
    expect(totals.itemsTotalInCents).toBe(
      expresso.priceInCents * 2 + latte.priceInCents,
    )
  })

  it('não deve embutir frete: a taxa depende da distância do endereço', () => {
    const totals = calculateCartTotals([{ coffee: expresso, quantity: 4 }])

    expect(totals).toEqual({
      itemCount: 4,
      itemsTotalInCents: expresso.priceInCents * 4,
    })
    expect(Object.keys(totals)).not.toContain('deliveryFeeInCents')
    expect(Object.keys(totals)).not.toContain('totalInCents')
  })
})
