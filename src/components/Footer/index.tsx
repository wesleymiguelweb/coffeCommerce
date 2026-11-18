import { Clock, MapPin } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import {
  DELIVERY_MAX_DISTANCE_KM,
  STORE_ADDRESS_DETAILS,
  STORE_ADDRESS_LINE,
  STORE_HOURS,
  STORE_MAPS_URL,
} from '../../utils/constants'
import { Logo } from '../Logo'
import styles from './styles.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandBlock}>
          <Link to="/" aria-label="Coffee Delivery — página inicial">
            <Logo />
          </Link>
          <p className={styles.tagline}>
            Cafés especiais, torrados por aqui e entregues com carinho.
          </p>
        </div>

        <div className={styles.storeInfo}>
          <a
            href={STORE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.storeAddress}
          >
            <MapPin size={18} weight="fill" aria-hidden="true" />
            <span>
              {STORE_ADDRESS_LINE}
              <br />
              {STORE_ADDRESS_DETAILS}
            </span>
          </a>
          <p>
            <Clock size={16} weight="bold" aria-hidden="true" />
            {STORE_HOURS}
          </p>
          <p>Entregamos em até {DELIVERY_MAX_DISTANCE_KM} km da cafeteria.</p>
        </div>

        <div className={styles.meta}>
          <p>© 2026 Coffee Delivery</p>
          <p>Projeto final de SPA · React, Vite e TypeScript</p>
        </div>
      </div>
    </footer>
  )
}
