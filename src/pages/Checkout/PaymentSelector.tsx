import {
  Bank,
  Check,
  Copy,
  CreditCard,
  CurrencyDollar,
  LockKey,
  Money,
  PixLogo,
  WifiHigh,
} from '@phosphor-icons/react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useWatch } from 'react-hook-form'
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormRegisterReturn,
} from 'react-hook-form'
import type { CheckoutFormData } from '../../schemas/checkoutSchema'
import { createPixDemoCode } from '../../services/payment'
import type { CardBrand, PaymentMethod } from '../../types/order'
import {
  detectCardBrand,
  formatCardCvv,
  formatCardExpiry,
  formatCardNumber,
  formatInstallmentValue,
  getCardBrandLabel,
  getInstallmentOptions,
} from '../../utils/card'
import { formatCurrencyInput } from '../../utils/formatCurrency'
import { PAYMENT_METHOD_OPTIONS } from '../../utils/paymentMethod'
import styles from './styles.module.css'

const PAYMENT_ICONS = {
  credit: CreditCard,
  debit: Bank,
  pix: PixLogo,
  cash: Money,
} as const

const COPY_FEEDBACK_MS = 2200
const PIX_QR_SIZE = 172

interface PaymentFieldProps {
  id: keyof CheckoutFormData
  label: string
  registration: UseFormRegisterReturn
  error?: string
  className?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric'
  maxLength?: number
  transform?: (value: string) => string
  children?: ReactNode
}

function PaymentField({
  id,
  label,
  registration,
  error,
  className = '',
  autoComplete,
  inputMode,
  maxLength,
  transform,
  children,
}: PaymentFieldProps) {
  const { onChange, ...registrationProps } = registration

  return (
    <div className={`${styles.field} ${className}`}>
      <input
        {...registrationProps}
        id={id}
        placeholder=" "
        className={`${styles.input} ${
          error ? styles.inputError : ''
        }`}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          if (transform) {
            event.target.value = transform(event.target.value)
          }
          void onChange(event)
        }}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function getBrandClass(brand: CardBrand): string {
  return styles[`brand${brand}`] ?? ''
}

interface PaymentSelectorProps {
  register: UseFormRegister<CheckoutFormData>
  control: Control<CheckoutFormData>
  errors: FieldErrors<CheckoutFormData>
  selected?: PaymentMethod
  orderId: string
  totalInCents: number
  paymentError?: string
  disabled?: boolean
}

export function PaymentSelector({
  register,
  control,
  errors,
  selected,
  orderId,
  totalInCents,
  paymentError,
  disabled = false,
}: PaymentSelectorProps) {
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<number | null>(null)

  const cardNumber = useWatch({ control, name: 'cardNumber' }) ?? ''
  const cardName = useWatch({ control, name: 'cardName' }) ?? ''
  const cardExpiry = useWatch({ control, name: 'cardExpiry' }) ?? ''

  const brand = detectCardBrand(cardNumber)
  const isCard = selected === 'credit' || selected === 'debit'
  const pixCode = createPixDemoCode(orderId, totalInCents)

  useEffect(() => {
    return () => {
      if (copyTimeout.current !== null) {
        window.clearTimeout(copyTimeout.current)
      }
    }
  }, [])

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)

      if (copyTimeout.current !== null) {
        window.clearTimeout(copyTimeout.current)
      }

      copyTimeout.current = window.setTimeout(() => {
        setCopied(false)
        copyTimeout.current = null
      }, COPY_FEEDBACK_MS)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.card} aria-labelledby="payment-title">
      <header className={styles.cardHeader}>
        <span
          className={`${styles.cardIcon} ${styles.paymentIcon}`}
          aria-hidden="true"
        >
          <CurrencyDollar size={22} weight="bold" />
        </span>
        <div>
          <h2 id="payment-title" className={styles.cardTitle}>
            Pagamento
          </h2>
          <p className={styles.cardDescription}>
            O pagamento é processado aqui, em ambiente de demonstração.
            Escolha como deseja pagar.
          </p>
        </div>
      </header>

      <fieldset
        className={styles.paymentFieldset}
        aria-describedby={
          errors.paymentMethod?.message ? 'payment-error' : undefined
        }
        disabled={disabled}
      >
        <legend className="sr-only">Forma de pagamento</legend>

        <div className={styles.paymentOptions}>
          {PAYMENT_METHOD_OPTIONS.map((option) => {
            const Icon = PAYMENT_ICONS[option.id]
            const isSelected = selected === option.id

            return (
              <label
                key={option.id}
                className={`${styles.paymentOption} ${
                  isSelected ? styles.paymentSelected : ''
                }`}
              >
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value={option.id}
                  className={styles.radio}
                  aria-describedby={`payment-hint-${option.id}`}
                />
                <Icon size={22} aria-hidden="true" />
                <span className={styles.paymentText}>
                  <span className={styles.paymentLabel}>{option.label}</span>
                  <span
                    id={`payment-hint-${option.id}`}
                    className={styles.paymentHint}
                  >
                    {option.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>

        {errors.paymentMethod?.message && (
          <p id="payment-error" className={styles.fieldError} role="alert">
            {errors.paymentMethod.message}
          </p>
        )}

        {paymentError && (
          <p className={styles.paymentAlert} role="alert">
            {paymentError}
          </p>
        )}

        {isCard && (
          <div key={selected} className={styles.paymentPanel}>
            <div
              className={`${styles.cardPreview} ${getBrandClass(brand)}`}
              data-brand={brand}
              aria-hidden="true"
            >
              <div className={styles.cardPreviewTop}>
                <span className={styles.cardChip} />
                <span className={styles.cardBrand}>
                  {brand === 'unknown' ? 'CARTÃO' : getCardBrandLabel(brand).toUpperCase()}
                </span>
              </div>
              <p className={styles.cardPreviewNumber}>
                {formatCardNumber(cardNumber) || '•••• •••• •••• ••••'}
              </p>
              <div className={styles.cardPreviewBottom}>
                <span>
                  <small>Titular</small>
                  <strong>{cardName.trim().toUpperCase() || 'SEU NOME'}</strong>
                </span>
                <span>
                  <small>Validade</small>
                  <strong>{cardExpiry || 'MM/AA'}</strong>
                </span>
                <span className={styles.cardPreviewLabel}>
                  {selected === 'credit' ? 'Crédito' : 'Débito'}
                </span>
                <WifiHigh
                  size={20}
                  weight="bold"
                  className={styles.cardContactless}
                />
              </div>
            </div>

            <div className={styles.paymentFields}>
              <PaymentField
                id="cardNumber"
                label="Número do cartão"
                className={styles.cardNumberField}
                registration={register('cardNumber')}
                error={errors.cardNumber?.message}
                autoComplete="cc-number"
                inputMode="numeric"
                maxLength={23}
                transform={formatCardNumber}
              />

              <PaymentField
                id="cardName"
                label="Nome impresso no cartão"
                className={styles.cardNameField}
                registration={register('cardName')}
                error={errors.cardName?.message}
                autoComplete="cc-name"
                maxLength={60}
              />

              <PaymentField
                id="cardExpiry"
                label="Validade"
                className={styles.cardExpiryField}
                registration={register('cardExpiry')}
                error={errors.cardExpiry?.message}
                autoComplete="cc-exp"
                inputMode="numeric"
                maxLength={5}
                transform={formatCardExpiry}
              />

              <PaymentField
                id="cardCvv"
                label="CVV"
                className={styles.cardCvvField}
                registration={register('cardCvv')}
                error={errors.cardCvv?.message}
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
                transform={formatCardCvv}
              />

              {selected === 'credit' && (
                <div className={`${styles.selectField} ${styles.cardInstallmentsField}`}>
                  <label htmlFor="installments" className={styles.selectLabel}>
                    Parcelas
                  </label>
                  <select
                    {...register('installments')}
                    id="installments"
                    className={styles.select}
                    disabled={disabled}
                  >
                    {getInstallmentOptions().map((count) => (
                      <option key={count} value={count}>
                        {formatInstallmentValue(totalInCents, count)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className={styles.demoHint}>
              Demonstração: use <code>4242 4242 4242 4242</code> para aprovar.
            </p>
          </div>
        )}

        {selected === 'pix' && (
          <div className={styles.paymentPanel}>
            <div className={styles.pixLayout}>
              <div className={styles.pixQr}>
                <QRCodeSVG
                  value={pixCode}
                  size={PIX_QR_SIZE}
                  level="M"
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#272221"
                  title="QR Code PIX de demonstração"
                />
              </div>
              <div className={styles.pixCopy}>
                <strong>PIX copia e cola</strong>
                <p>
                  Escaneie o QR Code ou copie o código. A confirmação é
                  simulada e imediata.
                </p>
                <code className={styles.pixCode}>{pixCode}</code>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => void copyPixCode()}
                  disabled={disabled}
                >
                  {copied ? (
                    <Check size={16} weight="bold" aria-hidden="true" />
                  ) : (
                    <Copy size={16} weight="bold" aria-hidden="true" />
                  )}
                  {copied ? 'Código copiado' : 'Copiar código PIX'}
                </button>
                <span className="sr-only" role="status">
                  {copied ? 'Código PIX copiado para a área de transferência.' : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {selected === 'cash' && (
          <div className={styles.paymentPanel}>
            <div className={`${styles.paymentFields} ${styles.cashFields}`}>
              <PaymentField
                id="changeFor"
                label="Troco para (opcional)"
                className={styles.cashChangeField}
                registration={register('changeFor')}
                error={errors.changeFor?.message}
                inputMode="numeric"
                maxLength={12}
                transform={formatCurrencyInput}
              />
              <p className={styles.cashHint}>
                Deixe em branco se não precisar de troco. O pagamento é feito
                ao entregador.
              </p>
            </div>
          </div>
        )}
      </fieldset>

      <p className={styles.demoHint}>
        <LockKey size={14} weight="bold" aria-hidden="true" />
        Nenhum dado de cartão é enviado, armazenado ou cobrado de verdade.
      </p>
    </section>
  )
}
