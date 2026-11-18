import {
  Coffee as CoffeeIcon,
  Flame,
  Package,
  ShoppingCartSimple,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import heroIllustration from '../../assets/Imagem.png'
import { CoffeeCard } from '../../components/CoffeeCard'
import { coffees } from '../../data/coffees'
import type { CoffeeCategory } from '../../types/coffee'
import styles from './styles.module.css'

const CATEGORY_FILTERS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'TRADICIONAL', label: 'Tradicional' },
  { id: 'ESPECIAL', label: 'Especial' },
  { id: 'COM LEITE', label: 'Com leite' },
  { id: 'ALCOÓLICO', label: 'Alcoólico' },
  { id: 'GELADO', label: 'Gelado' },
] as const satisfies ReadonlyArray<{
  id: CoffeeCategory | 'ALL'
  label: string
}>

type CategoryFilter = (typeof CATEGORY_FILTERS)[number]['id']

const HERO_FEATURES = [
  {
    icon: ShoppingCartSimple,
    title: 'Compra simples e segura',
    tone: 'yellowDark',
  },
  {
    icon: Package,
    title: 'Embalagem mantêm o café intacto',
    tone: 'dark',
  },
  {
    icon: Flame,
    title: 'Entrega rápida e rastreada',
    tone: 'yellow',
  },
  {
    icon: CoffeeIcon,
    title: 'O café chega fresquinho até você',
    tone: 'purple',
  },
] as const

export function Home() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('ALL')

  const filteredCoffees = useMemo(() => {
    if (activeFilter === 'ALL') return coffees
    return coffees.filter((coffee) => coffee.tags.includes(activeFilter))
  }, [activeFilter])

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <h1 id="hero-title" className={styles.heroTitle}>
              Encontre o café perfeito para qualquer hora do dia
            </h1>

            <p className={styles.heroSubtitle}>
              Com o Coffee Delivery você recebe seu café onde estiver, a
              qualquer hora
            </p>

            <ul className={styles.features}>
              {HERO_FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <li key={feature.title} className={styles.feature}>
                    <span
                      className={`${styles.featureIcon} ${styles[feature.tone]}`}
                      aria-hidden="true"
                    >
                      <Icon size={20} weight="fill" />
                    </span>
                    <span className={styles.featureText}>{feature.title}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.heroArt}>
            <img
              src={heroIllustration}
              alt="Copo de café do Coffee Delivery cercado por grãos, uma esfera amarela e um traço roxo"
              width={476}
              height={360}
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className="container">
          <div className={styles.catalogHeader}>
            <div>
              <h2 id="catalog-title" className={styles.catalogTitle}>
                Nossos cafés
              </h2>
              <p className={styles.catalogSubtitle}>
                {coffees.length} opções para todos os gostos e momentos do dia.
              </p>
            </div>

            <div
              className={styles.filters}
              role="group"
              aria-label="Filtrar cafés por categoria"
            >
              {CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`${styles.filter} ${
                    activeFilter === filter.id ? styles.filterActive : ''
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                  aria-pressed={activeFilter === filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {filteredCoffees.length}{' '}
            {filteredCoffees.length === 1
              ? 'café encontrado'
              : 'cafés encontrados'}
          </p>

          <div className={styles.grid}>
            {filteredCoffees.map((coffee, index) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                animationDelay={index * 45}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
