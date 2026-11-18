import {
  ArrowRight,
  Clock,
  CreditCard,
  MapPinLine,
  Timer,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import successIllustration from '../../assets/success-illustration.svg'
import { EmptyState } from '../../components/EmptyState'
import { LAST_ORDER_STORAGE_KEY } from '../../utils/constants'
import { formatCep } from '../../utils/cep'
import {
  formatDeliveryWindow,
  formatEta,
} from '../../utils/formatDelivery'
import { formatCurrency } from '../../utils/formatCurrency'
import {
  isOrder,
  isOrderLocationState,
} from '../../utils/guards'
import { getCardBrandLabel } from '../../utils/card'
import { formatDistance } from '../../utils/geo'
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '../../utils/paymentMethod'
import { readStoredValue } from '../../utils/storage'
import styles from './styles.module.css'

const createdAtFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

const CONFETTI_COLORS = ['#DBAC2C', '#8047F8', '#4B2995', '#F1E9C9']
const CONFETTI_PIECES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 7) % 100}%`,
  delay: `${(index % 6) * 0.16}s`,
  duration: `${2.4 + (index % 4) * 0.35}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  rotation: `${(index * 53) % 360}deg`,
}))

function SuccessConfetti() {
  return (
    <div className={styles.confetti} aria-hidden="true">
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece.id}
          className={styles.confettiPiece}
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotation})`,
          }}
        />
      ))}
    </div>
  )
}

export function Success() {
  const location = useLocation()
  const [storedOrder] = useState(() =>
    readStoredValue(LAST_ORDER_STORAGE_KEY, isOrder, 'session'),
  )

  const order = isOrderLocationState(location.state)
    ? location.state.order
    : storedOrder

  if (!order) {
    return (
      <div className="container">
        <EmptyState
          title="Nenhum pedido por aqui"
          description="Ainda não encontramos um pedido confirmado nesta sessão. Escolha seu café e volte para comemorar."
          actionLabel="Ver cafés"
          actionTo="/"
        />
      </div>
    )
  }

  const { address, items, delivery, payment } = order
  const addressLine = `${address.street}, ${address.number}${
    address.complement ? ` — ${address.complement}` : ''
  }`
  const etaLabel = formatEta(delivery.minMinutes, delivery.maxMinutes)
  const deliveryWindow = formatDeliveryWindow(
    order.createdAt,
    delivery.minMinutes,
    delivery.maxMinutes,
  )
  const cardLabel = payment.cardLast4
    ? `${getCardBrandLabel(payment.cardBrand ?? 'unknown')} •••• ${payment.cardLast4}`
    : null
  const installmentLabel =
    payment.installments && payment.installments > 1
      ? `${payment.installments}x`
      : null
  const changeLabel =
    payment.changeForInCents !== undefined
      ? `Troco para ${formatCurrency(payment.changeForInCents)}`
      : null

  return (
    <div className={`container ${styles.page} edge-glow`}>
      <section className={styles.hero} aria-labelledby="success-title">
        <SuccessConfetti />
        <div className={styles.heroContent}>
          <h1 id="success-title" className={styles.title}>
            Uhu! Pedido confirmado
          </h1>
          <p className={styles.subtitle}>
            Agora é só aguardar: o café já está sendo preparado e logo chega até
            você.
          </p>
          <p className={styles.orderMeta}>
            Pedido <strong>{order.id}</strong> ·{' '}
            {createdAtFormatter.format(new Date(order.createdAt))}
          </p>
        </div>

        <div className={styles.illustration}>
          <img
            src={successIllustration}
            alt="Ilustração de um café confirmado com um selo de verificação e um pino de entrega"
            width={420}
            height={340}
          />
        </div>
      </section>

      <div className={styles.grid}>
        <section className={styles.infoCard} aria-labelledby="delivery-title">
          <h2 id="delivery-title" className="sr-only">
            Detalhes da entrega
          </h2>

          <div className={styles.infoRow}>
            <span className={`${styles.infoIcon} ${styles.purple}`} aria-hidden="true">
              <MapPinLine size={20} weight="bold" />
            </span>
            <div>
              <span className={styles.infoLabel}>Entrega em</span>
              <strong className={styles.infoValue}>{addressLine}</strong>
              <p className={styles.infoText}>
                {address.neighborhood} — {address.city}, {address.state}
              </p>
              <p className={styles.infoText}>
                CEP {formatCep(address.cep)}
              </p>
            </div>
          </div>

          <div className={styles.infoRow}>
            <span className={`${styles.infoIcon} ${styles.yellow}`} aria-hidden="true">
              <Timer size={20} weight="bold" />
            </span>
            <div>
              <span className={styles.infoLabel}>Previsão de entrega</span>
              <strong className={styles.infoValue}>{etaLabel}</strong>
              <p className={styles.infoText}>
                {deliveryWindow && `Entre ${deliveryWindow} · `}
                {formatDistance(delivery.distanceKm)} da cafeteria
              </p>
              {delivery.estimated && (
                <p className={styles.infoText}>
                  Estimativa calculada pela cidade do endereço.
                </p>
              )}
            </div>
          </div>

          <div className={styles.infoRow}>
            <span
              className={`${styles.infoIcon} ${
                payment.status === 'approved' ? styles.green : styles.yellow
              }`}
              aria-hidden="true"
            >
              {payment.status === 'approved' ? (
                <CreditCard size={20} weight="bold" />
              ) : (
                <Clock size={20} weight="bold" />
              )}
            </span>
            <div>
              <span className={styles.infoLabel}>Pagamento</span>
              <strong className={styles.infoValue}>
                {getPaymentMethodLabel(payment.method)}
                {cardLabel && ` · ${cardLabel}`}
                {installmentLabel && ` · ${installmentLabel}`}
              </strong>
              <p className={styles.infoText}>
                {getPaymentStatusLabel(payment.status)}
                {payment.transactionId && ` · ${payment.transactionId}`}
              </p>
              {changeLabel && (
                <p className={styles.infoText}>{changeLabel}</p>
              )}
              {payment.status === 'pending' && (
                <p className={styles.infoText}>
                  O valor será cobrado pelo entregador no recebimento.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className={styles.orderCard} aria-labelledby="order-title">
          <div className={styles.orderHeader}>
            <h2 id="order-title" className={styles.orderTitle}>
              Resumo do pedido
            </h2>
            <span className={styles.orderCode}>{order.id}</span>
          </div>

          <ul className={styles.orderItems}>
            {items.map((item) => (
              <li key={item.coffee.id} className={styles.orderItem}>
                <span>
                  <strong>{item.quantity}×</strong> {item.coffee.name}
                </span>
                <span>
                  {formatCurrency(item.coffee.priceInCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className={styles.orderTotals}>
            <div>
              <dt>Total de itens</dt>
              <dd>{formatCurrency(order.itemsTotalInCents)}</dd>
            </div>
            <div>
              <dt>
                Entrega · {formatDistance(delivery.distanceKm)}
              </dt>
              <dd>{formatCurrency(delivery.feeInCents)}</dd>
            </div>
            <div className={styles.orderGrandTotal}>
              <dt>Total</dt>
              <dd>{formatCurrency(order.totalInCents)}</dd>
            </div>
          </dl>

          <Link to="/" className={styles.cta}>
            Fazer novo pedido
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  )
}
