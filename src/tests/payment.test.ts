import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import {
  createCashPayment,
  createPixDemoCode,
  createTransactionId,
  processPayment,
} from '../services/payment'
import { PAYMENT_SIMULATION_DELAY_MS } from '../utils/constants'

const now = new Date('2026-11-18T12:00:00.000Z')

describe('createPixDemoCode', () => {
  it('deve identificar o pedido, o valor e o ambiente de simulação', () => {
    const code = createPixDemoCode('CD-ABC123', 2570)

    expect(code).toContain('COFFEE-DELIVERY-DEMO')
    expect(code).toContain('pedido=CD-ABC123')
    expect(code).toContain('valor=R$25,70')
    expect(code).toContain('chave=11998102527')
    expect(code).toContain('ambiente=simulacao')
  })

  it('não deve parecer um payload bancário real', () => {
    expect(createPixDemoCode('CD-ABC123', 1000)).not.toContain('000201')
  })
})

describe('createTransactionId', () => {
  it('deve gerar um identificador estável e legível', () => {
    const id = createTransactionId(now)

    expect(id).toMatch(/^PAY-[0-9A-Z]{1,6}$/)
    expect(createTransactionId(now)).toBe(id)
  })
})

describe('createCashPayment', () => {
  it('deve registrar pagamento pendente com ou sem troco', () => {
    expect(createCashPayment()).toEqual({
      method: 'cash',
      status: 'pending',
      changeForInCents: undefined,
    })
    expect(createCashPayment(5000)).toEqual({
      method: 'cash',
      status: 'pending',
      changeForInCents: 5000,
    })
  })
})

describe('processPayment', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve aprovar um cartão válido e registrar bandeira e parcelas', async () => {
    const promise = processPayment(
      {
        method: 'credit',
        cardNumber: '4242 4242 4242 4242',
        installments: 3,
      },
      undefined,
      now,
    )

    await vi.advanceTimersByTimeAsync(PAYMENT_SIMULATION_DELAY_MS)
    const result = await promise

    expect(result.status).toBe('approved')
    if (result.status === 'approved') {
      expect(result.payment).toMatchObject({
        method: 'credit',
        status: 'approved',
        cardBrand: 'visa',
        cardLast4: '4242',
        installments: 3,
        paidAt: now.toISOString(),
      })
      expect(result.payment.transactionId).toMatch(/^PAY-/)
    }
  })

  it('não deve guardar o número completo do cartão', async () => {
    const promise = processPayment(
      { method: 'debit', cardNumber: '4242 4242 4242 4242' },
      undefined,
      now,
    )

    await vi.advanceTimersByTimeAsync(PAYMENT_SIMULATION_DELAY_MS)
    const result = await promise

    expect(JSON.stringify(result)).not.toContain('4242424242424242')
    expect(JSON.stringify(result)).not.toContain('4242 4242 4242 4242')
  })

  it('deve recusar cartões terminados em 0002', async () => {
    const promise = processPayment(
      { method: 'credit', cardNumber: '4242 4242 4242 0002' },
      undefined,
      now,
    )

    await vi.advanceTimersByTimeAsync(PAYMENT_SIMULATION_DELAY_MS)
    const result = await promise

    expect(result.status).toBe('declined')
  })

  it('deve aprovar PIX imediatamente após a simulação', async () => {
    const promise = processPayment({ method: 'pix' }, undefined, now)

    await vi.advanceTimersByTimeAsync(PAYMENT_SIMULATION_DELAY_MS)
    const result = await promise

    expect(result.status).toBe('approved')
    if (result.status === 'approved') {
      expect(result.payment.method).toBe('pix')
      expect(result.payment.status).toBe('approved')
      expect(result.payment.transactionId).toBeDefined()
    }
  })

  it('deve abortar sem aprovar quando o checkout é desmontado', async () => {
    const controller = new AbortController()
    const promise = processPayment(
      { method: 'credit', cardNumber: '4242 4242 4242 4242' },
      controller.signal,
      now,
    )

    controller.abort()

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })
})
