import { Coffee } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import styles from './styles.module.css'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  actionTo: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <section className={styles.wrapper} aria-labelledby="empty-state-title">
      <span className={styles.icon} aria-hidden="true">
        <Coffee size={38} weight="duotone" />
      </span>
      <h1 id="empty-state-title" className={styles.title}>
        {title}
      </h1>
      <p className={styles.description}>{description}</p>
      <Link to={actionTo} className={styles.action}>
        {actionLabel}
      </Link>
    </section>
  )
}
