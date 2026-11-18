import { Check, CircleNotch } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import styles from './styles.module.css'

interface ProcessingOverlayProps {
  methodLabel: string
  steps: readonly string[]
  activeStep: number
  totalInCents: number
}

export function ProcessingOverlay({
  methodLabel,
  steps,
  activeStep,
  totalInCents,
}: ProcessingOverlayProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cardRef.current?.focus()
  }, [])

  return (
    <div
      className={styles.processingOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-title"
      aria-describedby="processing-description"
    >
      <div ref={cardRef} className={styles.processingCard} tabIndex={-1}>
        <span className={styles.processingSpinner} aria-hidden="true">
          <CircleNotch size={30} weight="bold" />
        </span>

        <h2 id="processing-title" className={styles.processingTitle}>
          Processando pagamento
        </h2>
        <p id="processing-description" className={styles.processingSubtitle}>
          {methodLabel} · {formatCurrency(totalInCents)}
        </p>

        <ol className={styles.processingSteps}>
          {steps.map((step, index) => {
            const isDone = index < activeStep
            const isActive = index === activeStep

            return (
              <li
                key={step}
                className={`${styles.processingStep} ${
                  isDone ? styles.processingStepDone : ''
                } ${isActive ? styles.processingStepActive : ''}`}
              >
                <span className={styles.processingStepIcon} aria-hidden="true">
                  {isDone ? (
                    <Check size={14} weight="bold" />
                  ) : isActive ? (
                    <CircleNotch size={14} weight="bold" />
                  ) : (
                    <span className={styles.processingDot} />
                  )}
                </span>
                {step}
              </li>
            )
          })}
        </ol>

        <p className={styles.processingNotice}>
          Ambiente de demonstração — não feche esta página.
        </p>
      </div>
    </div>
  )
}
