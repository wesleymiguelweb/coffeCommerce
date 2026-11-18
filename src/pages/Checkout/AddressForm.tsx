import {
  CircleNotch,
  MagnifyingGlass,
  MapPinLine,
  Timer,
  WarningCircle,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormRegisterReturn,
  UseFormSetFocus,
  UseFormSetValue,
} from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { useViaCep } from '../../hooks/useViaCep'
import type { CheckoutFormData } from '../../schemas/checkoutSchema'
import { cityFallbackQuote, quoteFromCoordinates } from '../../services/delivery'
import { fetchCepCoordinates } from '../../services/coordinates'
import type { DeliveryState } from '../../types/delivery'
import { formatCep, normalizeCep } from '../../utils/cep'
import {
  DELIVERY_MAX_DISTANCE_KM,
  STORE_ADDRESS_DETAILS,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatEta } from '../../utils/formatDelivery'
import { formatDistance } from '../../utils/geo'
import styles from './styles.module.css'

interface AddressFormProps {
  register: UseFormRegister<CheckoutFormData>
  errors: FieldErrors<CheckoutFormData>
  setValue: UseFormSetValue<CheckoutFormData>
  control: Control<CheckoutFormData>
  setFocus: UseFormSetFocus<CheckoutFormData>
  delivery: DeliveryState
  deliveryError?: string
  onDeliveryChange: (state: DeliveryState) => void
}

interface FieldProps {
  id: keyof CheckoutFormData
  label: string
  registration: UseFormRegisterReturn
  error?: string
  className: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric'
  maxLength?: number
  transform?: (value: string) => string
  children?: ReactNode
}

function Field({
  id,
  label,
  registration,
  error,
  className,
  autoComplete,
  inputMode,
  maxLength,
  transform,
  children,
}: FieldProps) {
  const { onChange, ...registrationProps } = registration

  return (
    <div className={`${styles.field} ${className}`}>
      <input
        {...registrationProps}
        id={id}
        placeholder=" "
        className={`${styles.input} ${error ? styles.inputError : ''}`}
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

export function AddressForm({
  register,
  errors,
  setValue,
  control,
  setFocus,
  delivery,
  deliveryError,
  onDeliveryChange,
}: AddressFormProps) {
  const { lookup, isLoading, error: cepRequestError } = useViaCep()
  const [filledCep, setFilledCep] = useState<string | null>(null)
  const lastLookup = useRef<string | null>(null)
  const requestId = useRef(0)
  const coordinateRequest = useRef<AbortController | null>(null)

  const cepValue = useWatch({ control, name: 'cep' }) ?? ''
  const cepDigits = normalizeCep(cepValue)
  const autoFilled = filledCep !== null && filledCep === cepDigits
  const isResolvingDelivery = delivery.status === 'loading'
  const isBusy = isLoading || isResolvingDelivery

  const runLookup = useCallback(
    async (digits: string) => {
      const currentRequest = requestId.current + 1
      requestId.current = currentRequest
      coordinateRequest.current?.abort()

      onDeliveryChange({ status: 'loading' })

      const address = await lookup(digits)
      if (currentRequest !== requestId.current) return

      if (!address) {
        setFilledCep(null)
        onDeliveryChange({ status: 'idle' })
        return
      }

      setValue('street', address.logradouro ?? '', { shouldValidate: true })
      setValue('neighborhood', address.bairro ?? '', { shouldValidate: true })
      setValue('city', address.localidade ?? '', { shouldValidate: true })
      setValue('state', (address.uf ?? '').toUpperCase(), {
        shouldValidate: true,
      })

      setFilledCep(digits)

      if (address.logradouro) {
        setFocus('number')
      }

      const controller = new AbortController()
      coordinateRequest.current = controller

      const coordinates = await fetchCepCoordinates(
        digits,
        {
          cep: digits,
          street: address.logradouro ?? '',
          number: '',
          neighborhood: address.bairro ?? '',
          city: address.localidade ?? '',
          state: address.uf ?? '',
        },
        controller.signal,
      )

      if (currentRequest !== requestId.current) return

      const result = coordinates
        ? quoteFromCoordinates(coordinates)
        : cityFallbackQuote({
            city: address.localidade ?? '',
            state: address.uf ?? '',
          })

      onDeliveryChange(
        result.status === 'available'
          ? { status: 'ready', quote: result.quote }
          : { status: 'out-of-area', distanceKm: result.distanceKm },
      )
    },
    [lookup, setValue, setFocus, onDeliveryChange],
  )

  useEffect(() => {
    if (cepDigits.length !== 8) {
      lastLookup.current = null
      requestId.current += 1
      coordinateRequest.current?.abort()
      setFilledCep(null)
      onDeliveryChange({ status: 'idle' })
      return
    }

    if (lastLookup.current === cepDigits) return

    lastLookup.current = cepDigits
    void runLookup(cepDigits)
  }, [cepDigits, runLookup, onDeliveryChange])

  const cepError =
    errors.cep?.message ??
    (cepDigits.length === 8 ? cepRequestError : null) ??
    undefined

  return (
    <section className={styles.card} aria-labelledby="address-title">
      <header className={styles.cardHeader}>
        <span className={`${styles.cardIcon} ${styles.mapIcon}`} aria-hidden="true">
          <MapPinLine size={22} weight="bold" />
        </span>
        <div>
          <h2 id="address-title" className={styles.cardTitle}>
            Endereço de entrega
          </h2>
          <p className={styles.cardDescription}>
            Informe o endereço onde deseja receber seu pedido.
          </p>
        </div>
      </header>

      <div className={styles.fields}>
        <Field
          id="cep"
          label="CEP"
          className={styles.cep}
          registration={register('cep')}
          error={cepError}
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={9}
          transform={formatCep}
        >
          <button
            type="button"
            className={styles.cepButton}
            onClick={() => void runLookup(cepDigits)}
            disabled={cepDigits.length !== 8 || isBusy}
            aria-label={
              isBusy ? 'Consultando CEP e entrega' : 'Consultar CEP no ViaCEP'
            }
            title="Consultar CEP"
          >
            {isBusy ? (
              <CircleNotch
                size={17}
                weight="bold"
                className={styles.spinner}
                aria-hidden="true"
              />
            ) : (
              <MagnifyingGlass size={17} weight="bold" aria-hidden="true" />
            )}
          </button>
        </Field>

        <Field
          id="street"
          label="Rua"
          className={styles.street}
          registration={register('street')}
          error={errors.street?.message}
          autoComplete="address-line1"
          maxLength={120}
        />

        <Field
          id="number"
          label="Número"
          className={styles.number}
          registration={register('number')}
          error={errors.number?.message}
          inputMode="numeric"
          maxLength={20}
        />

        <Field
          id="complement"
          label="Complemento (opcional)"
          className={styles.complement}
          registration={register('complement')}
          error={errors.complement?.message}
          autoComplete="address-line2"
          maxLength={120}
        />

        <Field
          id="neighborhood"
          label="Bairro"
          className={styles.neighborhood}
          registration={register('neighborhood')}
          error={errors.neighborhood?.message}
          autoComplete="address-level3"
          maxLength={80}
        />

        <Field
          id="city"
          label="Cidade"
          className={styles.city}
          registration={register('city')}
          error={errors.city?.message}
          autoComplete="address-level2"
          maxLength={80}
        />

        <Field
          id="state"
          label="UF"
          className={styles.state}
          registration={register('state')}
          error={errors.state?.message}
          autoComplete="address-level1"
          maxLength={2}
          transform={(value) => value.toUpperCase().slice(0, 2)}
        />
      </div>

      {isResolvingDelivery && (
        <p className={styles.deliveryChecking} role="status">
          <CircleNotch
            size={16}
            weight="bold"
            className={styles.spinner}
            aria-hidden="true"
          />
          Calculando distância e previsão de entrega…
        </p>
      )}

      {delivery.status === 'ready' && (
        <div className={styles.deliveryPreview}>
          <span className={styles.deliveryIcon} aria-hidden="true">
            <Timer size={18} weight="bold" />
          </span>
          <div>
            <strong>
              Chega em {formatEta(delivery.quote.minMinutes, delivery.quote.maxMinutes)}
            </strong>
            <p>
              {formatDistance(delivery.quote.distanceKm)} da cafeteria · taxa de{' '}
              {formatCurrency(delivery.quote.feeInCents)}
              {delivery.quote.estimated && ' · estimativa por cidade'}
            </p>
          </div>
        </div>
      )}

      {delivery.status === 'out-of-area' && (
        <p className={styles.deliveryWarning} role="alert">
          <WarningCircle size={18} weight="bold" aria-hidden="true" />
          <span>
            Este endereço está fora da área de entrega. Entregamos até{' '}
            {DELIVERY_MAX_DISTANCE_KM} km da cafeteria, no{' '}
            {STORE_ADDRESS_DETAILS}. Você pode tentar outro CEP.
          </span>
        </p>
      )}

      {deliveryError && (
        <p className={styles.deliveryWarning} role="alert">
          <WarningCircle size={18} weight="bold" aria-hidden="true" />
          <span>{deliveryError}</span>
        </p>
      )}

      <p className="sr-only" role="status">
        {autoFilled
          ? 'Endereço preenchido automaticamente a partir do CEP.'
          : ''}
      </p>
    </section>
  )
}
