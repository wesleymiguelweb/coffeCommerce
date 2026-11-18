import { describe, it, expect } from 'vitest'
import {
  formatAmount,
  formatCurrency,
  formatCurrencyInput,
} from '../utils/formatCurrency'

describe('formatCurrency', () => {
  it('deve formatar centavos em real brasileiro', () => {
    expect(formatCurrency(990)).toBe('R$\u00a09,90')
  })
  it('deve formatar zero centavos', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00')
  })
  it('deve formatar valores maiores', () => {
    expect(formatCurrency(1490)).toBe('R$\u00a014,90')
  })
  it('deve usar separador de milhar', () => {
    expect(formatCurrency(123456)).toBe('R$\u00a01.234,56')
  })
})

describe('formatAmount', () => {
  it('deve formatar centavos sem o símbolo da moeda', () => {
    expect(formatAmount(990)).toBe('9,90')
  })
  it('deve manter duas casas decimais', () => {
    expect(formatAmount(500)).toBe('5,00')
  })
  it('deve usar separador de milhar', () => {
    expect(formatAmount(123456)).toBe('1.234,56')
  })
})

describe('formatCurrencyInput', () => {
  it('deve aplicar máscara da direita para a esquerda', () => {
    expect(formatCurrencyInput('5000')).toBe('R$\u00a050,00')
    expect(formatCurrencyInput('R$ 1.234,56')).toBe('R$\u00a01.234,56')
  })

  it('deve retornar vazio quando não há dígitos', () => {
    expect(formatCurrencyInput('')).toBe('')
    expect(formatCurrencyInput('R$')).toBe('')
  })

  it('deve limitar o valor a seis dígitos', () => {
    expect(formatCurrencyInput('123456789')).toBe('R$\u00a01.234,56')
  })
})
