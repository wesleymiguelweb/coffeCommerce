import { describe, it, expect } from 'vitest'
import { checkoutFormSchema } from '../schemas/checkoutSchema'

const validAddress = {
  cep: '90020-008',
  street: 'Rua dos Andradas',
  number: '1234',
  neighborhood: 'Centro Histórico',
  city: 'Porto Alegre',
  state: 'RS',
} as const

const validCard = {
  cardNumber: '4242 4242 4242 4242',
  cardName: 'ANA SILVA',
  cardExpiry: '12/40',
  cardCvv: '123',
  installments: '1',
} as const

describe('checkoutFormSchema — endereço', () => {
  it('deve rejeitar CEP com formato inválido', () => {
    const result = checkoutFormSchema.safeParse({
      ...validAddress,
      ...validCard,
      paymentMethod: 'credit',
      cep: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar CEP com ou sem máscara', () => {
    for (const cep of ['90020008', '90020-008']) {
      const result = checkoutFormSchema.safeParse({
        ...validAddress,
        ...validCard,
        paymentMethod: 'credit',
        cep,
      })
      expect(result.success, cep).toBe(true)
    }
  })

  it('deve rejeitar campos obrigatórios em branco', () => {
    for (const field of ['street', 'number', 'neighborhood', 'city'] as const) {
      const result = checkoutFormSchema.safeParse({
        ...validAddress,
        ...validCard,
        paymentMethod: 'credit',
        [field]: '   ',
      })
      expect(result.success, field).toBe(false)
    }
  })

  it('deve rejeitar UF que não tenha duas letras', () => {
    for (const state of ['S', 'SPX', 'S1']) {
      const result = checkoutFormSchema.safeParse({
        ...validAddress,
        ...validCard,
        paymentMethod: 'credit',
        state,
      })
      expect(result.success, state).toBe(false)
    }
  })

  it('deve aceitar complemento vazio ou ausente', () => {
    const base = {
      ...validAddress,
      ...validCard,
      paymentMethod: 'credit',
    } as const

    expect(
      checkoutFormSchema.safeParse({ ...base, complement: '' }).success,
    ).toBe(true)
    expect(checkoutFormSchema.safeParse(base).success).toBe(true)
  })
})

describe('checkoutFormSchema — método de pagamento', () => {
  it('deve rejeitar sem método de pagamento', () => {
    const result = checkoutFormSchema.safeParse({
      ...validAddress,
      paymentMethod: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar método de pagamento desconhecido', () => {
    const result = checkoutFormSchema.safeParse({
      ...validAddress,
      paymentMethod: 'bitcoin',
    })
    expect(result.success).toBe(false)
  })
})

describe('checkoutFormSchema — cartão', () => {
  const base = {
    ...validAddress,
    paymentMethod: 'credit',
    ...validCard,
  } as const

  it('deve aceitar cartão válido no crédito', () => {
    expect(checkoutFormSchema.safeParse(base).success).toBe(true)
  })

  it('deve aceitar cartão válido no débito', () => {
    expect(
      checkoutFormSchema.safeParse({
        ...base,
        paymentMethod: 'debit',
      }).success,
    ).toBe(true)
  })

  it('deve rejeitar número de cartão ausente', () => {
    const result = checkoutFormSchema.safeParse({ ...base, cardNumber: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['cardNumber'])
  })

  it('deve rejeitar número de cartão que falha no Luhn', () => {
    const result = checkoutFormSchema.safeParse({
      ...base,
      cardNumber: '4242 4242 4242 4241',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar cartão vencido', () => {
    const result = checkoutFormSchema.safeParse({
      ...base,
      cardExpiry: '01/20',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar validade fora do formato MM/AA', () => {
    const result = checkoutFormSchema.safeParse({
      ...base,
      cardExpiry: '1/2040',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar CVV curto', () => {
    const result = checkoutFormSchema.safeParse({ ...base, cardCvv: '12' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar nome do titular muito curto', () => {
    const result = checkoutFormSchema.safeParse({ ...base, cardName: 'ANA' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar parcelas fora do intervalo', () => {
    for (const installments of ['0', '7', '2.5']) {
      const result = checkoutFormSchema.safeParse({ ...base, installments })
      expect(result.success, installments).toBe(false)
    }
  })
})

describe('checkoutFormSchema — PIX e dinheiro', () => {
  it('deve aceitar PIX sem dados de cartão', () => {
    expect(
      checkoutFormSchema.safeParse({
        ...validAddress,
        paymentMethod: 'pix',
      }).success,
    ).toBe(true)
  })

  it('deve aceitar dinheiro sem troco', () => {
    expect(
      checkoutFormSchema.safeParse({
        ...validAddress,
        paymentMethod: 'cash',
      }).success,
    ).toBe(true)
  })

  it('deve aceitar troco em formato de moeda', () => {
    expect(
      checkoutFormSchema.safeParse({
        ...validAddress,
        paymentMethod: 'cash',
        changeFor: 'R$ 50,00',
      }).success,
    ).toBe(true)
  })

  it('deve rejeitar troco com dígitos demais', () => {
    expect(
      checkoutFormSchema.safeParse({
        ...validAddress,
        paymentMethod: 'cash',
        changeFor: 'R$ 1.234.567,89',
      }).success,
    ).toBe(false)
  })
})
