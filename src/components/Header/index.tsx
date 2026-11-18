import { MapPin, ShoppingCart } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import {
  HEADER_SCROLL_THRESHOLD_PX,
  STORE_ADDRESS_DETAILS,
  STORE_ADDRESS_LINE,
  STORE_CITY,
  STORE_STATE,
} from '../../utils/constants'
import { Logo } from '../Logo'
import { ThemeToggle } from '../ThemeToggle'
import styles from './styles.module.css'

export function Header() {
  const { itemCount } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const itemsLabel = itemCount === 1 ? '1 item' : `${itemCount} itens`

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD_PX)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link
          to="/"
          className={styles.brand}
          aria-label="Coffee Delivery — página inicial"
        >
          <Logo />
        </Link>

        <div className={styles.actions}>
          <span
            className={styles.location}
            title={`${STORE_ADDRESS_LINE} — ${STORE_ADDRESS_DETAILS}`}
          >
            <MapPin size={20} weight="fill" aria-hidden="true" />
            <span>{STORE_CITY}, {STORE_STATE}</span>
          </span>

          <ThemeToggle />

          <Link
            to="/checkout"
            className={styles.cart}
            aria-label={`Carrinho de compras, ${itemsLabel}`}
          >
            <ShoppingCart size={22} weight="fill" aria-hidden="true" />
            {itemCount > 0 && (
              <span key={itemCount} className={styles.badge} aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
