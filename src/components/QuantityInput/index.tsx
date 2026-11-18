import { Minus, Plus } from '@phosphor-icons/react'
import styles from './styles.module.css'

interface QuantityInputProps {
  value: number
  label: string
  onIncrease: () => void
  onDecrease: () => void
  canDecrease?: boolean
  size?: 'md' | 'sm'
}

export function QuantityInput({
  value,
  label,
  onIncrease,
  onDecrease,
  canDecrease = true,
  size = 'md',
}: QuantityInputProps) {
  return (
    <div
      className={`${styles.root} ${size === 'sm' ? styles.small : ''}`}
      role="group"
      aria-label={`Quantidade de ${label}`}
    >
      <button
        type="button"
        className={styles.button}
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label={`Diminuir quantidade de ${label}`}
      >
        <Minus size={14} weight="bold" aria-hidden="true" />
      </button>
      <span className={styles.value} aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={onIncrease}
        aria-label={`Aumentar quantidade de ${label}`}
      >
        <Plus size={14} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
}
