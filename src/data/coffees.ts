import americano from '../assets/americano.png'
import arabe from '../assets/arabe.png'
import cafeComLeite from '../assets/cefecomleite.png'
import capuccino from '../assets/capuccino.png'
import chocolateQuente from '../assets/chocolateq.png'
import cremoso from '../assets/cremoso.png'
import cubano from '../assets/cubano.png'
import expresso from '../assets/expresso.png'
import gelado from '../assets/gelado.png'
import havaiano from '../assets/havaiano.png'
import irlandes from '../assets/irlandes.png'
import latte from '../assets/latte.png'
import macchiato from '../assets/macchiato.png'
import mocaccino from '../assets/mocaccino.png'
import type { Coffee } from '../types/coffee'

export const coffees: Coffee[] = [
  {
    id: 'expresso-tradicional',
    name: 'Expresso Tradicional',
    description: 'O tradicional café feito com água quente e grãos moídos',
    tags: ['TRADICIONAL'],
    priceInCents: 990,
    image: expresso,
  },
  {
    id: 'expresso-americano',
    name: 'Expresso Americano',
    description: 'Expresso diluído, menos intenso que o tradicional',
    tags: ['TRADICIONAL'],
    priceInCents: 990,
    image: americano,
  },
  {
    id: 'expresso-cremoso',
    name: 'Expresso Cremoso',
    description: 'Café expresso tradicional com espuma cremosa',
    tags: ['TRADICIONAL'],
    priceInCents: 990,
    image: cremoso,
  },
  {
    id: 'expresso-gelado',
    name: 'Expresso Gelado',
    description: 'Bebida preparada com café expresso e cubos de gelo',
    tags: ['TRADICIONAL', 'GELADO'],
    priceInCents: 990,
    image: gelado,
  },
  {
    id: 'cafe-com-leite',
    name: 'Café com Leite',
    description: 'Meio a meio de expresso tradicional com leite vaporizado',
    tags: ['TRADICIONAL', 'COM LEITE'],
    priceInCents: 990,
    image: cafeComLeite,
  },
  {
    id: 'latte',
    name: 'Latte',
    description: 'Uma dose de café expresso com o dobro de leite e espuma cremosa',
    tags: ['TRADICIONAL', 'COM LEITE'],
    priceInCents: 990,
    image: latte,
  },
  {
    id: 'capuccino',
    name: 'Capuccino',
    description: 'Bebida com canela feita de doses iguais de café, leite e espuma',
    tags: ['TRADICIONAL', 'COM LEITE'],
    priceInCents: 990,
    image: capuccino,
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    description: 'Café expresso misturado com um pouco de leite quente e espuma',
    tags: ['TRADICIONAL', 'COM LEITE'],
    priceInCents: 990,
    image: macchiato,
  },
  {
    id: 'mocaccino',
    name: 'Mocaccino',
    description: 'Café expresso com calda de chocolate, pouco leite e espuma',
    tags: ['TRADICIONAL', 'COM LEITE'],
    priceInCents: 990,
    image: mocaccino,
  },
  {
    id: 'chocolate-quente',
    name: 'Chocolate Quente',
    description: 'Bebida feita com chocolate dissolvido no leite quente e café',
    tags: ['ESPECIAL', 'COM LEITE'],
    priceInCents: 990,
    image: chocolateQuente,
  },
  {
    id: 'cubano',
    name: 'Cubano',
    description: 'Drink gelado de café expresso com rum, creme de leite e hortelã',
    tags: ['ESPECIAL', 'ALCOÓLICO', 'GELADO'],
    priceInCents: 1490,
    image: cubano,
  },
  {
    id: 'havaiano',
    name: 'Havaiano',
    description: 'Bebida adocicada preparada com café e leite de coco',
    tags: ['ESPECIAL'],
    priceInCents: 1490,
    image: havaiano,
  },
  {
    id: 'arabe',
    name: 'Árabe',
    description: 'Bebida preparada com grãos de café árabe e especiarias',
    tags: ['ESPECIAL'],
    priceInCents: 1490,
    image: arabe,
  },
  {
    id: 'irlandes',
    name: 'Irlandês',
    description: 'Bebida a base de café, uísque irlandês, açúcar e chantilly',
    tags: ['ESPECIAL', 'ALCOÓLICO'],
    priceInCents: 1490,
    image: irlandes,
  },
]
