import { z } from 'zod'
import { MAX_INSTALLMENTS } from '../utils/constants'
import {
  isExpiryValid,
  isValidCardNumber,
  normalizeCardNumber,
} from '../utils/card'

const CARD_EXPIRY_PATTERN = /^\d{2}\/\d{2}$/
const CARD_CVV_PATTERN = /^\d{3,4}$/
const MIN_CARDHOLDER_NAME_LENGTH = 5
const MIN_CHANGE_DIGITS = 1
const MAX_CHANGE_DIGITS = 6

export function paymentMethodRequiresCard(
  method: 'credit' | 'debit' | 'pix' | 'cash',
): method is 'credit' | 'debit' {
  return method === 'credit' || method === 'debit'
}

export const checkoutFormSchema = z
  .object({
    cep: z
      .string()
      .min(1, 'Informe o CEP')
      .regex(/^\d{5}-?\d{3}$/, 'Informe um CEP válido com 8 dígitos'),
    street: z.string().trim().min(1, 'Informe a rua'),
    number: z.string().trim().min(1, 'Informe o número'),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().min(1, 'Informe o bairro'),
    city: z.string().trim().min(1, 'Informe a cidade'),
    state: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, 'Informe a UF com 2 letras'),
    paymentMethod: z.enum(['credit', 'debit', 'pix', 'cash'], {
      error: 'Selecione a forma de pagamento',
    }),
    cardNumber: z.string().trim().optional(),
    cardName: z.string().trim().optional(),
    cardExpiry: z.string().trim().optional(),
    cardCvv: z.string().trim().optional(),
    installments: z.string().trim().optional(),
    changeFor: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (paymentMethodRequiresCard(data.paymentMethod)) {
      const cardNumber = normalizeCardNumber(data.cardNumber ?? '')

      if (cardNumber === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['cardNumber'],
          message: 'Informe o número do cartão',
        })
      } else if (!isValidCardNumber(cardNumber)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cardNumber'],
          message: 'Número de cartão inválido',
        })
      }

      const cardName = data.cardName?.trim() ?? ''
      if (cardName.length < MIN_CARDHOLDER_NAME_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          path: ['cardName'],
          message: 'Informe o nome impresso no cartão',
        })
      }

      const expiry = data.cardExpiry?.trim() ?? ''
      if (!CARD_EXPIRY_PATTERN.test(expiry)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cardExpiry'],
          message: 'Use o formato MM/AA',
        })
      } else if (!isExpiryValid(expiry)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cardExpiry'],
          message: 'Cartão vencido ou data inválida',
        })
      }

      const cvv = data.cardCvv?.trim() ?? ''
      if (!CARD_CVV_PATTERN.test(cvv)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cardCvv'],
          message: 'Informe o CVV com 3 ou 4 dígitos',
        })
      }

      if (data.paymentMethod === 'credit') {
        const installments = Number(data.installments ?? '1')
        if (
          !Number.isInteger(installments) ||
          installments < 1 ||
          installments > MAX_INSTALLMENTS
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['installments'],
            message: 'Escolha de 1 a 6 parcelas',
          })
        }
      }
    }

    if (data.paymentMethod === 'cash' && data.changeFor) {
      const changeDigits = data.changeFor.replace(/\D/g, '')
      if (
        changeDigits.length < MIN_CHANGE_DIGITS ||
        changeDigits.length > MAX_CHANGE_DIGITS
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['changeFor'],
          message: 'Informe um valor de troco válido',
        })
      }
    }
  })

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
