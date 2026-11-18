import {
  ArrowRight,
  CircleNotch,
  LockKey,
  Timer,
  WarningCircle,
} from '@phosphor-icons/react'
import { CartItem } from '../../components/CartItem'
import type { CartItem as CartItemType } from '../../types/cart'
import type { DeliveryState } from '../../types/delivery'
import {
  DELIVERY_MAX_DISTANCE_KM,
  STORE_ADDRESS_DETAILS,
} from '../../utils/constants'
import { formatEta } from '../../utils/formatDelivery'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDistance } from '../../utils/geo'
import styles from './styles.module.css'

interface CartSummaryProps {
  items: CartItemType[]
  itemsTotalInCents: number
  delivery: DeliveryState
  isProcessing: boolean
  onIncrease: (coffeeId: string) => void
  onDecrease: (coffeeId: string) => void
  onRemove: (coffeeId: string) => void
}

export function CartSummary({
  items,
  itemsTotalInCents,
  delivery,
  isProcessing,
  onIncrease,
  onDecrease,
  onRemove,
}: CartSummaryProps) {
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0)
  const quote = delivery.status === 'ready' ? delivery.quote : null
  const totalInCents = itemsTotalInCents + (quote?.feeInCents ?? 0)

  const deliveryFeeLabel = (() => {
    if (delivery.status === 'ready') {
      return formatCurrency(delivery.quote.feeInCents)
    }
    if (delivery.status === 'loading') return 'Calculando…'
    if (delivery.status === 'out-of-area') return 'Indisponível'
    return '—'
  })()

  return (
    <section className={styles.summary} aria-labelledby="summary-title">
      <div className={styles.summaryHeading}>
        <h2 id="summary-title" className={styles.summaryTitle}>
          Cafés selecionados
        </h2>
        <span className={styles.summaryCount}>
          {totalUnits} {totalUnits === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className={styles.summaryCard}>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.coffee.id} className={styles.itemRow}>
              <CartItem
                item={item}
                onIncrease={() => onIncrease(item.coffee.id)}
                onDecrease={() => onDecrease(item.coffee.id)}
                onRemove={() => onRemove(item.coffee.id)}
              />
            </li>
          ))}
        </ul>

        <dl className={styles.totals}>
          <div className={styles.totalRow}>
            <dt>Total de itens</dt>
            <dd>{formatCurrency(itemsTotalInCents)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>Taxa de entrega</dt>
            <dd>{deliveryFeeLabel}</dd>
          </div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <dt>Total</dt>
            <dd>
              {quote ? formatCurrency(totalInCents) : formatCurrency(itemsTotalInCents)}
            </dd>
          </div>
        </dl>

        <div className={styles.deliveryBox} aria-live="polite">
          {delivery.status === 'ready' && (
            <>
              <span className={styles.deliveryBoxIcon} aria-hidden="true">
                <Timer size={18} weight="bold" />
              </span>
              <div>
                <strong>
                  Chega em{' '}
                  {formatEta(delivery.quote.minMinutes, delivery.quote.maxMinutes)}
                </strong>
                <p>
                  {formatDistance(delivery.quote.distanceKm)} da cafeteria
                  {delivery.quote.estimated && ' · estimativa por cidade'}
                </p>
              </div>
            </>
          )}

          {delivery.status === 'loading' && (
            <>
              <span className={styles.deliveryBoxIcon} aria-hidden="true">
                <CircleNotch
                  size={18}
                  weight="bold"
                  className={styles.spinner}
                />
              </span>
              <div>
                <strong>Calculando entrega…</strong>
                <p>Buscando a distância até o seu endereço.</p>
              </div>
            </>
          )}

          {delivery.status === 'idle' && (
            <>
              <span className={styles.deliveryBoxIcon} aria-hidden="true">
                <Timer size={18} weight="bold" />
              </span>
              <div>
                <strong>Informe o CEP para calcular</strong>
                <p>Taxa e previsão variam conforme a distância.</p>
              </div>
            </>
          )}

          {delivery.status === 'out-of-area' && (
            <>
              <span
                className={`${styles.deliveryBoxIcon} ${styles.deliveryBoxWarning}`}
                aria-hidden="true"
              >
                <WarningCircle size={18} weight="bold" />
              </span>
              <div>
                <strong>Fora da área de entrega</strong>
                <p>
                  Entregamos até {DELIVERY_MAX_DISTANCE_KM} km de{' '}
                  {STORE_ADDRESS_DETAILS}.
                </p>
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={isProcessing}
          aria-busy={isProcessing}
        >
          {quote ? `Pagar ${formatCurrency(totalInCents)}` : 'Finalizar pedido'}
          <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </button>

        <p className={styles.deliveryNote}>
          <LockKey size={15} weight="bold" aria-hidden="true" />
          Pagamento simulado, sem cobrança real.
        </p>
      </div>
    </section>
  )
}
