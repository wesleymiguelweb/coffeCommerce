import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { useCart } from '../../hooks/useCart'
import {
  checkoutFormSchema,
  type CheckoutFormData,
} from '../../schemas/checkoutSchema'
import { processPayment, createCashPayment } from '../../services/payment'
import type { DeliveryState } from '../../types/delivery'
import type {
  DeliveryAddress,
  Order,
  PaymentDetails,
  PaymentMethod,
} from '../../types/order'
import { normalizeCep } from '../../utils/cep'
import {
  LAST_ORDER_STORAGE_KEY,
  PAYMENT_STEP_INTERVAL_MS,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { createOrderId } from '../../utils/order'
import { getPaymentMethodLabel } from '../../utils/paymentMethod'
import { writeStoredValue } from '../../utils/storage'
import { AddressForm } from './AddressForm'
import { CartSummary } from './CartSummary'
import { PaymentSelector } from './PaymentSelector'
import { ProcessingOverlay } from './ProcessingOverlay'
import styles from './styles.module.css'

const CARD_PROCESSING_STEPS = [
  'Validando os dados do cartão',
  'Autorizando com a emissora',
  'Confirmando o pedido',
] as const

const PIX_PROCESSING_STEPS = [
  'Validando o código PIX',
  'Confirmando o recebimento',
  'Preparando o pedido',
] as const

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function Checkout() {
  const {
    items,
    itemsTotalInCents,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart()
  const navigate = useNavigate()

  const [delivery, setDelivery] = useState<DeliveryState>({ status: 'idle' })
  const [deliveryError, setDeliveryError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<{
    method: PaymentMethod
    message: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [checkoutId] = useState(() => createOrderId())
  const paymentAbort = useRef<AbortController | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    setFocus,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: 'onTouched',
    defaultValues: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      installments: '1',
      changeFor: '',
    },
  })

  const paymentMethod = useWatch({ control, name: 'paymentMethod' })
  const quote = delivery.status === 'ready' ? delivery.quote : null
  const totalInCents = itemsTotalInCents + (quote?.feeInCents ?? 0)
  const processingSteps =
    paymentMethod === 'pix' ? PIX_PROCESSING_STEPS : CARD_PROCESSING_STEPS

  const handleDeliveryChange = useCallback((nextDelivery: DeliveryState) => {
    setDelivery(nextDelivery)
    if (nextDelivery.status === 'ready') {
      setDeliveryError(null)
    }
  }, [])

  useEffect(() => {
    return () => {
      paymentAbort.current?.abort()
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Seu carrinho está vazio"
          description="Escolha seus cafés favoritos no catálogo e volte para finalizar o pedido."
          actionLabel="Ver cafés"
          actionTo="/"
        />
      </div>
    )
  }

  function finishOrder(
    payment: PaymentDetails,
    address: DeliveryAddress,
    createdAt: Date,
  ) {
    if (!quote) return

    const order: Order = {
      id: checkoutId,
      items: items.map((item) => ({ ...item })),
      address,
      delivery: quote,
      payment,
      itemsTotalInCents,
      totalInCents: itemsTotalInCents + quote.feeInCents,
      createdAt: createdAt.toISOString(),
    }

    writeStoredValue(LAST_ORDER_STORAGE_KEY, order, 'session')
    clearCart()
    navigate('/success', { replace: true, state: { order } })
  }

  async function onSubmit(data: CheckoutFormData) {
    if (delivery.status !== 'ready') {
      setDeliveryError(
        'Informe um CEP com entrega disponível para calcular a taxa antes de pagar.',
      )
      document.getElementById('cep')?.focus()
      return
    }

    setDeliveryError(null)
    setPaymentError(null)

    const address: DeliveryAddress = {
      cep: normalizeCep(data.cep),
      street: data.street,
      number: data.number,
      complement: data.complement?.trim() || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state.toUpperCase(),
    }

    const changeDigits = data.changeFor?.replace(/\D/g, '') ?? ''
    const changeForInCents = changeDigits ? Number(changeDigits) : undefined

    if (
      data.paymentMethod === 'cash' &&
      changeForInCents !== undefined &&
      changeForInCents < totalInCents
    ) {
      setError('changeFor', {
        type: 'manual',
        message: `O troco precisa ser de pelo menos ${formatCurrency(totalInCents)}.`,
      })
      document.getElementById('changeFor')?.focus()
      return
    }

    if (data.paymentMethod === 'cash') {
      finishOrder(
        createCashPayment(changeForInCents),
        address,
        new Date(),
      )
      return
    }

    const controller = new AbortController()
    paymentAbort.current = controller
    setIsProcessing(true)
    setProcessingStep(0)

    const intervalId = window.setInterval(() => {
      setProcessingStep((current) =>
        Math.min(current + 1, processingSteps.length - 1),
      )
    }, PAYMENT_STEP_INTERVAL_MS)

    let approvedPayment: PaymentDetails | null = null

    try {
      const result = await processPayment(
        data.paymentMethod === 'pix'
          ? { method: 'pix' }
          : {
              method: data.paymentMethod,
              cardNumber: data.cardNumber ?? '',
              installments: Number(data.installments ?? '1'),
            },
        controller.signal,
      )

      if (result.status === 'declined') {
        setPaymentError({
          method: data.paymentMethod,
          message: result.message,
        })
        document.getElementById('payment-title')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        return
      }

      approvedPayment = result.payment
    } catch (error) {
      if (!isAbortError(error)) {
        setPaymentError({
          method: data.paymentMethod,
          message:
            'Não foi possível processar o pagamento agora. Tente novamente.',
        })
      }
    } finally {
      window.clearInterval(intervalId)
      setIsProcessing(false)
      paymentAbort.current = null
    }

    if (approvedPayment) {
      finishOrder(approvedPayment, address, new Date())
    }
  }

  return (
    <div className={`container ${styles.page} edge-glow`} aria-busy={isProcessing}>
      <form
        className={styles.checkoutForm}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        inert={isProcessing}
      >
        <div className={styles.formColumn}>
          <div className={styles.intro}>
            <h1 className={styles.title}>Complete seu pedido</h1>
            <p className={styles.subtitle}>
              Informe o endereço, confira a previsão de entrega e pague agora.
              A taxa é calculada pela distância até a cafeteria.
            </p>
          </div>

          <AddressForm
            register={register}
            errors={errors}
            setValue={setValue}
            control={control}
            setFocus={setFocus}
            delivery={delivery}
            deliveryError={deliveryError ?? undefined}
            onDeliveryChange={handleDeliveryChange}
          />

          <PaymentSelector
            register={register}
            control={control}
            errors={errors}
            selected={paymentMethod}
            orderId={checkoutId}
            totalInCents={totalInCents}
            paymentError={
              paymentError && paymentError.method === paymentMethod
                ? paymentError.message
                : undefined
            }
            disabled={isProcessing}
          />
        </div>

        <aside className={styles.summaryColumn} aria-label="Resumo do pedido">
          <CartSummary
            items={items}
            itemsTotalInCents={itemsTotalInCents}
            delivery={delivery}
            isProcessing={isProcessing}
            onIncrease={incrementItem}
            onDecrease={decrementItem}
            onRemove={removeItem}
          />
        </aside>
      </form>

      {isProcessing && (
        <ProcessingOverlay
          methodLabel={
            paymentMethod ? getPaymentMethodLabel(paymentMethod) : 'Pagamento'
          }
          steps={processingSteps}
          activeStep={processingStep}
          totalInCents={totalInCents}
        />
      )}
    </div>
  )
}
