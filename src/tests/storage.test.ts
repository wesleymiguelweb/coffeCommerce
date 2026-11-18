import { beforeEach, describe, it, expect } from 'vitest'
import {
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from '../utils/storage'

const KEY = 'test:storage'

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === 'string')
  )
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('deve gravar e ler um valor do localStorage', () => {
    writeStoredValue(KEY, ['expresso', 'latte'])
    expect(readStoredValue(KEY, isStringArray)).toEqual(['expresso', 'latte'])
  })

  it('deve devolver null quando a chave não existe', () => {
    expect(readStoredValue(KEY, isStringArray)).toBeNull()
  })

  it('deve descartar JSON corrompido', () => {
    localStorage.setItem(KEY, '{not-json')
    expect(readStoredValue(KEY, isStringArray)).toBeNull()
  })

  it('deve descartar valor que não passa no guard', () => {
    writeStoredValue(KEY, { items: [] })
    expect(readStoredValue(KEY, isStringArray)).toBeNull()
  })

  it('deve gravar na sessão sem vazar para o localStorage', () => {
    writeStoredValue(KEY, ['arabe'], 'session')

    expect(readStoredValue(KEY, isStringArray, 'session')).toEqual(['arabe'])
    expect(readStoredValue(KEY, isStringArray)).toBeNull()
  })

  it('deve remover um valor gravado', () => {
    writeStoredValue(KEY, ['cubano'])
    removeStoredValue(KEY)

    expect(readStoredValue(KEY, isStringArray)).toBeNull()
  })
})
