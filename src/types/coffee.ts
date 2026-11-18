export type CoffeeCategory =
  | 'TRADICIONAL'
  | 'ESPECIAL'
  | 'COM LEITE'
  | 'ALCOÓLICO'
  | 'GELADO'

export interface Coffee {
  id: string
  name: string
  description: string
  tags: CoffeeCategory[]
  priceInCents: number
  image: string
}

