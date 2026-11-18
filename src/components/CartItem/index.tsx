import { Trash } from '@phosphor-icons/react'
import type { CartItem as CartItemType } from '../../types/cart'
import { formatCurrency } from '../../utils/formatCurrency'
import { QuantityInput } from '../QuantityInput'
import styles from './styles.module.css'

interface CartItemProps {
  item: CartItemType
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}

export function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const { coffee, quantity } = item

  return (
    <article className={styles.item}>
      <div className={styles.thumb}>
        <img
          src={coffee.image}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.heading}>
          <h3 className={styles.name}>{coffee.name}</h3>
          <p className={styles.price}>{formatCurrency(coffee.priceInCents)}</p>
        </div>

        <div className={styles.actions}>
          <QuantityInput
            value={quantity}
            label={coffee.name}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            size="sm"
          />

          <button
            type="button"
            className={styles.remove}
            onClick={onRemove}
            aria-label={`Remover ${coffee.name} do carrinho`}
            title="Remover item"
          >
            <Trash size={16} weight="bold" aria-hidden="true" />
            <span>Remover</span>
          </button>
        </div>
      </div>
    </article>
  )
}
