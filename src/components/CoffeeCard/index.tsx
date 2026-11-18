import { Check, ShoppingCartSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import type { Coffee } from '../../types/coffee'
import { formatAmount } from '../../utils/formatCurrency'
import { useCart } from '../../hooks/useCart'
import { useToast } from '../../hooks/useToast'
import { QuantityInput } from '../QuantityInput'
import styles from './styles.module.css'

interface CoffeeCardProps {
  coffee: Coffee
  animationDelay?: number
}

export function CoffeeCard({ coffee, animationDelay = 0 }: CoffeeCardProps) {
  const { addItem } = useCart()
  const { notify } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return

    const timeoutId = window.setTimeout(() => setJustAdded(false), 1600)
    return () => window.clearTimeout(timeoutId)
  }, [justAdded])

  function handleAddToCart() {
    addItem(coffee, quantity)
    setQuantity(1)
    setJustAdded(true)
    notify({
      title: 'Adicionado ao carrinho',
      description: `${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} de ${coffee.name}`,
    })
  }

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={styles.art}>
        <img
          src={coffee.image}
          alt={`Foto do café ${coffee.name}`}
          width={220}
          height={220}
          loading="lazy"
          className={styles.image}
        />
      </div>

      <div className={styles.body}>
        <ul className={styles.tags} aria-label="Categorias">
          {coffee.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>

        <h3 className={styles.title}>{coffee.name}</h3>
        <p className={styles.description}>{coffee.description}</p>

        <div className={styles.footer}>
          <p className={styles.price}>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>{formatAmount(coffee.priceInCents)}</span>
          </p>

          <div className={styles.actions}>
            <QuantityInput
              value={quantity}
              label={coffee.name}
              onIncrease={() => setQuantity((current) => current + 1)}
              onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              canDecrease={quantity > 1}
              size="sm"
            />

            <button
              type="button"
              className={`${styles.addButton} ${justAdded ? styles.added : ''}`}
              onClick={handleAddToCart}
              aria-label={`Adicionar ${coffee.name} ao carrinho`}
              title={`Adicionar ${coffee.name} ao carrinho`}
            >
              {justAdded ? (
                <Check size={22} weight="bold" aria-hidden="true" />
              ) : (
                <ShoppingCartSimple size={22} weight="fill" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
