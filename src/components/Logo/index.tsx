import logoMark from '../../assets/logo.svg'
import styles from './styles.module.css'

export function Logo() {
  return (
    <span className={styles.logo}>
      <img src={logoMark} alt="" width={36} height={36} className={styles.mark} />
      <span className={styles.wordmark}>
        <span className={styles.wordTop}>Coffee </span>
        <span className={styles.wordBottom}>Delivery</span>
      </span>
    </span>
  )
}
