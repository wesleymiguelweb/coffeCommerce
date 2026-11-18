import { describe, it, expect } from 'vitest'
import {
  detectCardBrand,
  formatCardCvv,
  formatCardExpiry,
  formatCardNumber,
  formatInstallmentValue,
  getCardBrandLabel,
  getCardLast4,
  getInstallmentOptions,
  isExpiryValid,
  isValidCardNumber,
  maskCardNumber,
  normalizeCardNumber,
} from '../utils/card'

describe('isValidCardNumber', () => {
  it('deve aceitar números que passam no Luhn', () => {
    expect(isValidCardNumber('4242 4242 4242 4242')).toBe(true)
    expect(isValidCardNumber('5555 5555 5555 4444')).toBe(true)
  })

  it('deve recusar números que falham no Luhn', () => {
    expect(isValidCardNumber('4242 4242 4242 4241')).toBe(false)
  })

  it('deve recusar comprimento fora do intervalo', () => {
    expect(isValidCardNumber('4242')).toBe(false)
    expect(isValidCardNumber('42424242424242424242')).toBe(false)
  })
})

describe('detectCardBrand', () => {
  it.each([
    ['4111 1111 1111 1111', 'visa'],
    ['5555 5555 5555 4444', 'mastercard'],
    ['2222 2222 2222 2222', 'mastercard'],
    ['3782 822463 10005', 'amex'],
    ['6062 8288 8888 8888', 'hipercard'],
    ['4011 1234 5678 9010', 'elo'],
    ['1234 5678 9012 3456', 'unknown'],
    ['', 'unknown'],
  ])('%s deve ser %s', (number, brand) => {
    expect(detectCardBrand(number)).toBe(brand)
  })

  it('deve expor um rótulo legível', () => {
    expect(getCardBrandLabel('visa')).toBe('Visa')
    expect(getCardBrandLabel('unknown')).toBe('Cartão')
  })
})

describe('isExpiryValid', () => {
  const now = new Date(2026, 10, 18)

  it('deve aceitar o mês corrente e datas futuras', () => {
    expect(isExpiryValid('11/26', now)).toBe(true)
    expect(isExpiryValid('12/40', now)).toBe(true)
  })

  it('deve recusar mês vencido', () => {
    expect(isExpiryValid('10/26', now)).toBe(false)
    expect(isExpiryValid('01/20', now)).toBe(false)
  })

  it('deve recusar mês inexistente e formato inválido', () => {
    expect(isExpiryValid('13/40', now)).toBe(false)
    expect(isExpiryValid('00/40', now)).toBe(false)
    expect(isExpiryValid('1/40', now)).toBe(false)
  })
})

describe('máscaras do cartão', () => {
  it('deve normalizar para apenas dígitos', () => {
    expect(normalizeCardNumber('4242 4242-4242 4242')).toBe('4242424242424242')
  })

  it('deve agrupar o número em blocos de quatro', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
  })

  it('deve formatar validade e CVV', () => {
    expect(formatCardExpiry('1225')).toBe('12/25')
    expect(formatCardExpiry('12')).toBe('12')
    expect(formatCardCvv('12a345')).toBe('1234')
  })

  it('deve mascarar o número mantendo os quatro últimos dígitos', () => {
    expect(getCardLast4('4242 4242 4242 4242')).toBe('4242')
    expect(maskCardNumber('4242 4242 4242 4242')).toBe('•••• 4242')
    expect(maskCardNumber('')).toBe('')
  })
})

describe('parcelas', () => {
  it('deve oferecer de 1 a 6 parcelas', () => {
    expect(getInstallmentOptions()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('deve dividir o total arredondando para cima em centavos', () => {
    expect(formatInstallmentValue(10000, 1)).toBe('1x de R$\u00a0100,00')
    expect(formatInstallmentValue(10000, 3)).toBe('3x de R$\u00a033,34')
  })
})
