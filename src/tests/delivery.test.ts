import { describe, it, expect } from 'vitest'
import {
  buildDeliveryQuote,
  cityFallbackQuote,
  quoteFromCoordinates,
} from '../services/delivery'
import { STORE_COORDINATES } from '../utils/constants'

function quoteFor(distanceKm: number) {
  const result = buildDeliveryQuote(distanceKm)
  if (result.status !== 'available') {
    throw new Error(`Esperava uma cotação para ${distanceKm} km`)
  }
  return result.quote
}

describe('buildDeliveryQuote — taxa por faixa de distância', () => {
  it.each([
    [0, 350],
    [1.5, 350],
    [1.51, 590],
    [4, 590],
    [4.01, 890],
    [8, 890],
    [8.01, 1290],
    [12, 1290],
  ])('a %s km a taxa é %s centavos', (distanceKm, feeInCents) => {
    expect(quoteFor(distanceKm).feeInCents).toBe(feeInCents)
  })

  it('deve recusar endereços acima de 12 km', () => {
    const result = buildDeliveryQuote(12.01)
    expect(result.status).toBe('out-of-area')
    if (result.status === 'out-of-area') {
      expect(result.distanceKm).toBe(12.01)
    }
  })

  it('deve recusar distâncias inválidas', () => {
    for (const distanceKm of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(buildDeliveryQuote(distanceKm).status).toBe('out-of-area')
    }
  })
})

describe('buildDeliveryQuote — previsão de entrega', () => {
  it('deve arredondar a janela para múltiplos de 5 minutos', () => {
    const quote = quoteFor(0)

    expect(quote.minMinutes).toBe(20)
    expect(quote.maxMinutes).toBe(30)
  })

  it('deve crescer com a distância', () => {
    const near = quoteFor(1)
    const far = quoteFor(10)

    expect(far.minMinutes).toBeGreaterThan(near.minMinutes)
    expect(far.maxMinutes).toBe(near.maxMinutes + (far.minMinutes - near.minMinutes))
  })
})

describe('quoteFromCoordinates', () => {
  it('deve cotar a menor faixa na própria cafeteria', () => {
    const result = quoteFromCoordinates(STORE_COORDINATES)
    expect(result.status).toBe('available')
    if (result.status === 'available') {
      expect(result.quote.distanceKm).toBe(0)
      expect(result.quote.feeInCents).toBe(350)
      expect(result.quote.estimated).toBe(false)
    }
  })

  it('deve marcar endereço distante como fora da área', () => {
    const result = quoteFromCoordinates({
      latitude: -23.5617698,
      longitude: -46.6553299,
    })
    expect(result.status).toBe('out-of-area')
  })
})

describe('cityFallbackQuote', () => {
  it('deve usar a estimativa por cidade quando o CEP não tem coordenadas', () => {
    const result = cityFallbackQuote({ city: 'Porto Alegre', state: 'RS' })
    expect(result.status).toBe('available')
    if (result.status === 'available') {
      expect(result.quote.estimated).toBe(true)
      expect(result.quote.distanceKm).toBe(2.5)
      expect(result.quote.feeInCents).toBe(590)
    }
  })

  it('deve aceitar variações de acento e caixa no nome da cidade', () => {
    const result = cityFallbackQuote({ city: 'PORTO ALEGRE', state: 'rs' })
    expect(result.status).toBe('available')
  })

  it('deve recusar outra cidade', () => {
    expect(
      cityFallbackQuote({ city: 'São Paulo', state: 'SP' }).status,
    ).toBe('out-of-area')
  })
})
