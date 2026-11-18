import { describe, it, expect } from 'vitest'
import { formatCep, normalizeCep, onlyDigits } from '../utils/cep'

describe('onlyDigits', () => {
  it('deve remover qualquer caractere que não seja dígito', () => {
    expect(onlyDigits('01310-100')).toBe('01310100')
    expect(onlyDigits('abc 12.3')).toBe('123')
    expect(onlyDigits('')).toBe('')
  })
})

describe('normalizeCep', () => {
  it('deve devolver os 8 dígitos do CEP', () => {
    expect(normalizeCep('01310-100')).toBe('01310100')
  })

  it('deve limitar o CEP a 8 dígitos', () => {
    expect(normalizeCep('013101009999')).toBe('01310100')
  })

  it('deve devolver menos dígitos enquanto o usuário digita', () => {
    expect(normalizeCep('0131')).toBe('0131')
  })
})

describe('formatCep', () => {
  it('deve aplicar a máscara a partir do sexto dígito', () => {
    expect(formatCep('01310100')).toBe('01310-100')
  })

  it('deve manter o valor sem máscara enquanto incompleto', () => {
    expect(formatCep('01310')).toBe('01310')
  })

  it('deve ignorar caracteres inválidos antes de formatar', () => {
    expect(formatCep('013.10-100')).toBe('01310-100')
  })
})
