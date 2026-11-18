# Technical Specification (TECH_SPEC) — Coffee Delivery

## 1. Stack Tecnológica e Justificativa

| Tecnologia / Pacote | Versão | Justificativa Técnica |
|---|---|---|
| **React** | 19.x | Biblioteca padrão para construção de SPAs modernas orientadas a componentes, explorando Hooks e concorrência nativa. |
| **Vite** | 8.x | Ferramenta de build ultrarrápida com Hot Module Replacement (HMR) instantâneo e compilação otimizada para produção. |
| **TypeScript** | 5.x / 7.x | Tipagem estática estrita para garantir manutenibilidade, autocomplete confiável e prevenção de erros em tempo de compilação. |
| **React Router (v7)** | 7.x | Gerenciamento de rotas declarativas do lado do cliente (`/`, `/checkout`, `/success`), histórico do navegador e passagem segura de estado entre páginas. |
| **React Hook Form** | 7.x | Gerenciamento de formulários descontrolados (uncontrolled components) de alto desempenho, eliminando re-renderizações desnecessárias a cada caractere digitado. |
| **Zod** | 3.x | Biblioteca de declaração e validação de esquemas orientada a TypeScript com inferência estática de tipos. |
| **@hookform/resolvers** | 3.x | Integração transparente entre os esquemas do Zod e o formulário do React Hook Form. |
| **Tailwind CSS + Design Tokens CSS** | 4.x / 3.x | Sistema de estilos moderno baseado em variáveis CSS semânticas com suporte nativo a Dark Mode via classe `dark`, alta performance de runtime zero e fidelidade ao design system do Figma. *(Justificativa conforme orientações do Notion)*. |
| **Phosphor Icons (@phosphor-icons/react)** | 2.x | Conjunto oficial de ícones utilizados no projeto do Figma do Coffee Delivery (ShoppingCart, MapPin, CurrencyDollar, CreditCard, Bank, Money, Trash, Plus, Minus, Timer, Coffee, Package). |
| **Vitest + Testing Library** | Latest | Framework de testes unitários integrado ao Vite para validação de reducers, cálculos financeiros, esquemas Zod e componentes. |

---

## 2. Arquitetura da SPA e Desenho de Responsabilidades

A arquitetura do projeto adota uma separação de responsabilidades modular e limpa (Clean Code):

```
┌─────────────────────────────────────────────────────────────┐
│                          App Router                         │
│                  (/, /checkout, /success)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│      ThemeProvider      │               │       CartProvider      │
│  (Dark / Light + Store) │               │  (useReducer + Storage) │
└──────────────┬──────────┘               └────────────┬────────────┘
               │                                       │
               ├───────────────────────┬───────────────┤
               ▼                       ▼               ▼
        ┌─────────────┐         ┌─────────────┐ ┌─────────────┐
        │  Home Page  │         │  Checkout   │ │   Success   │
        └──────┬──────┘         └──────┬──────┘ └──────┬──────┘
               │                       │               │
      ┌────────┴────────┐     ┌────────┴────────┐      │
      ▼                 ▼     ▼                 ▼      ▼
 ┌─────────┐       ┌─────────┐┌─────────┐ ┌─────────┐┌─────────┐
 │ Catalog │       │  Hero   ││ Address │ │ Payment ││ Details │
 │  Cards  │       │ Banner  ││ ViaCEP  │ │ Selector││Snapshot │
 └─────────┘       └─────────┘└─────────┘ └─────────┘└─────────┘
```

---

## 3. Estrutura de Diretórios do Projeto

```
coffee-delivery/
├── public/
│   ├── favicon.svg             # Favicon personalizado com a logo
│   └── images/                 # Imagens dos 14 cafés
├── src/
│   ├── assets/                 # Logo gerada por IA (SVG/PNG) e ilustrações
│   ├── components/             # Componentes de UI reutilizáveis
│   │   ├── Header/             # Barra de navegação com Logo, Localização, Carrinho e ThemeToggle
│   │   ├── ThemeToggle/        # Alternador Light / Dark
│   │   ├── QuantityInput/      # Seletor de quantidade (+ / -)
│   │   ├── CoffeeCard/         # Card individual do café
│   │   ├── CartBadge/          # Indicador numérico do carrinho
│   │   ├── CartItem/           # Linha de item na lista do checkout
│   │   └── EmptyState/         # Estado vazio do carrinho
│   ├── pages/                  # Telas da SPA
│   │   ├── Home/               # Hero banner e Catálogo
│   │   ├── Checkout/           # Endereço, Pagamento e Resumo do Pedido
│   │   └── Success/            # Confirmação do pedido e snapshot
│   ├── contexts/               # Contextos do React
│   │   ├── CartContext.tsx     # Contexto e Provider do Carrinho
│   │   └── ThemeContext.tsx    # Contexto e Provider de Tema Claro/Escuro
│   ├── reducers/               # Reducer para gestão de estado imutável
│   │   ├── cartReducer.ts      # Função redutora
│   │   └── cartActions.ts      # Action creators e tipos de ações
│   ├── hooks/                  # Custom Hooks
│   │   ├── useCart.ts          # Acesso simplificado ao CartContext
│   │   ├── useTheme.ts         # Acesso simplificado ao ThemeContext
│   │   └── useViaCep.ts        # Hook para consulta assíncrona ao ViaCEP
│   ├── data/                   # Catálogo tipado de cafés
│   │   └── coffees.ts          # Array com os 14 cafés e metadados
│   ├── types/                  # Definições de tipos e interfaces
│   │   ├── coffee.ts           # Tipo Coffee
│   │   ├── cart.ts             # Tipos CartItem, CartState
│   │   └── order.ts            # Tipos DeliveryAddress, PaymentMethod, Order
│   ├── schemas/                # Esquemas de validação Zod
│   │   └── checkoutSchema.ts   # Validação do formulário de checkout
│   ├── services/               # Clientes e chamadas de API externa
│   │   └── viaCep.ts           # Requisições para https://viacep.com.br/ws/
│   ├── utils/                  # Funções utilitárias e helpers
│   │   ├── formatCurrency.ts   # Formatação monetária BRL
│   │   └── storage.ts          # Helpers tipados de localStorage
│   ├── styles/                 # Configurações globais de estilo e variáveis
│   │   └── index.css           # Variáveis CSS para Light e Dark mode
│   ├── tests/                  # Testes automatizados unitários
│   │   ├── cartReducer.test.ts # Testes de adição, remoção, incremento
│   │   ├── formatCurrency.test.ts
│   │   └── checkoutSchema.test.ts
│   ├── App.tsx                 # Rotas e Providers
│   └── main.tsx                # Ponto de entrada do React DOM
├── docs/                       # Especificações obrigatórias
│   ├── PRD_SPEC.md
│   ├── TECH_SPEC.md
│   └── TASKS_SPEC.md
├── AGENTS.md                   # Diretrizes para assistentes de IA
└── README.md                   # Documentação e apresentação geral
```

---

## 4. Modelagem de Dados e Tipos TypeScript

### 4.1 Tipos de Café e Catálogo (`src/types/coffee.ts`)
```typescript
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
  priceInCents: number // Ex: 990 = R$ 9,90
  image: string
}
```

### 4.2 Tipos do Carrinho (`src/types/cart.ts`)
```typescript
import { Coffee } from './coffee'

export interface CartItem {
  coffee: Coffee
  quantity: number
}

export interface CartState {
  items: CartItem[]
}
```

### 4.3 Tipos de Pedido e Endereço (`src/types/order.ts`)
```typescript
import { CartItem } from './cart'

export type PaymentMethod = 'credit' | 'debit' | 'cash'

export interface DeliveryAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string // UF: Ex: 'SP', 'RS'
}

export interface Order {
  id: string
  items: CartItem[]
  address: DeliveryAddress
  paymentMethod: PaymentMethod
  itemsTotalInCents: number
  deliveryFeeInCents: number
  totalInCents: number
  createdAt: string
}
```

---

## 5. Arquitetura do Estado Global com Context API e useReducer

### 5.1 Ações do `cartReducer` (`src/reducers/cartActions.ts`)
```typescript
import { Coffee } from '../types/coffee'

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { coffee: Coffee; quantity: number } }
  | { type: 'INCREMENT_ITEM_QUANTITY'; payload: { coffeeId: string } }
  | { type: 'DECREMENT_ITEM_QUANTITY'; payload: { coffeeId: string } }
  | { type: 'REMOVE_ITEM'; payload: { coffeeId: string } }
  | { type: 'CLEAR_CART' }
```

### 5.2 Regras de Transição de Estado no Reducer (`src/reducers/cartReducer.ts`)
1. **`ADD_ITEM`**:
   - Procura se o item já existe pelo `coffee.id`.
   - Se existir: mapeia o array e atualiza a quantidade somando `payload.quantity`.
   - Se não existir: faz append `{ coffee: payload.coffee, quantity: payload.quantity }`.
2. **`INCREMENT_ITEM_QUANTITY`**:
   - Incrementa a quantidade do item especificado em +1.
3. **`DECREMENT_ITEM_QUANTITY`**:
   - Se a quantidade atual for maior que 1, decrementa em -1.
   - Se a quantidade atual for 1, remove o item do carrinho (conforme RN-01).
4. **`REMOVE_ITEM`**:
   - Filtra o array removendo o item com o `coffeeId` correspondente.
5. **`CLEAR_CART`**:
   - Retorna `{ items: [] }`.

### 5.3 Persistência no LocalStorage
- Chave de armazenamento: `@coffee-delivery:cart-state-1.0.0`.
- O estado inicial do `useReducer` é inicializado através de uma função `initializer` que lê do `localStorage`.
- Um `useEffect` no `CartProvider` sincroniza as alterações de estado com o `localStorage`.

---

## 6. Validação com Zod e React Hook Form

### 6.1 Esquema de Validação (`src/schemas/checkoutSchema.ts`)
```typescript
import { z } from 'zod'

export const checkoutFormSchema = z.object({
  cep: z
    .string()
    .min(8, 'O CEP deve conter 8 dígitos')
    .max(9, 'CEP inválido')
    .regex(/^\d{5}-?\d{3}$/, 'Formato de CEP inválido'),
  street: z.string().min(1, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Informe o bairro'),
  city: z.string().min(1, 'Informe a cidade'),
  state: z
    .string()
    .length(2, 'Informe a UF com 2 letras')
    .toUpperCase(),
  paymentMethod: z.enum(['credit', 'debit', 'cash'], {
    errorMap: () => ({ message: 'Selecione a forma de pagamento' }),
  }),
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
```

### 6.2 Integração com a API ViaCEP
- **Endpoint**: `https://viacep.com.br/ws/${cleanCep}/json/`
- Tratamento de estados:
  - `isLoading`: Desabilita campos dependentes e exibe spinner/indicador no campo de CEP.
  - `isError` ou resposta com `{ erro: true }`: Exibe mensagem amigável de CEP não encontrado e libera os campos para digitação manual.
  - Sucesso: Executa `setValue` do React Hook Form para `street`, `neighborhood`, `city` e `state` com `{ shouldValidate: true }`, e move o foco para o campo de `number`.

---

## 7. Sistema de Design, Tokens e Dark Mode

### 7.1 Variáveis CSS e Tokens Semânticos (`src/styles/index.css`)
```css
:root {
  /* Cores da Marca */
  --color-yellow-dark: #c47f17;
  --color-yellow: #dbac2c;
  --color-yellow-light: #f1e7c4;
  --color-purple-dark: #4b2995;
  --color-purple: #8047f8;
  --color-purple-light: #ebe5f9;

  /* Neutros Light */
  --bg-primary: #fafafa;
  --bg-card: #f3f2f2;
  --bg-input: #ededed;
  --bg-button: #e6e5e5;
  --bg-button-hover: #d7d5d5;
  --text-title: #272221;
  --text-subtitle: #403937;
  --text-base: #574f4d;
  --text-label: #8d8686;
  --border-color: #e6e5e5;
}

[data-theme='dark'] {
  /* Neutros Dark */
  --bg-primary: #121214;
  --bg-card: #202024;
  --bg-input: #1a1a1e;
  --bg-button: #29292e;
  --bg-button-hover: #323238;
  --text-title: #ffffff;
  --text-subtitle: #e1e1e6;
  --text-base: #c4c4cc;
  --text-label: #8d8d99;
  --border-color: #323238;
}
```

### 7.2 ThemeContext e Persistência
- Chave de armazenamento: `@coffee-delivery:theme-1.0.0`.
- Valor inicial: `localStorage.getItem` $\rightarrow$ caso ausente, verifica `window.matchMedia('(prefers-color-scheme: dark)').matches`.
- Alternância instantânea via aplicação do atributo `data-theme="dark"` no elemento `document.documentElement`.

---

## 8. Estratégia de Testes Automatizados

Utilizando **Vitest** e **@testing-library/react**:
1. **`cartReducer.test.ts`**:
   - Adicionar novo item ao carrinho.
   - Adicionar item existente (deve somar quantidade sem duplicar item).
   - Incrementar quantidade de item existente.
   - Decrementar quantidade (se for 1, deve remover o item).
   - Remover item do carrinho.
   - Limpar carrinho.
2. **`formatCurrency.test.ts`**:
   - Formatar centavos para Real brasileiro (`990` $\rightarrow$ `"R$ 9,90"`).
   - Formatar zero centavos (`0` $\rightarrow$ `"R$ 0,00"`).
3. **`checkoutSchema.test.ts`**:
   - Rejeitar formulário sem CEP ou com formato inválido.
   - Rejeitar formulário sem método de pagamento.
   - Aceitar formulário válido com campos preenchidos e complemento opcional.

---

## 9. Rastreabilidade com os Requisitos do PRD

| Requisito PRD | Implementação Técnica |
|---|---|
| **RF-01** (Catálogo) | `src/pages/Home`, `src/components/CoffeeCard`, `src/data/coffees.ts` |
| **RF-02** (Quantidade Home) | `src/components/QuantityInput`, estado local em `CoffeeCard` |
| **RF-03** (Adição e Acúmulo) | `CartContext`, `cartReducer` ação `ADD_ITEM` |
| **RF-04** (Badge Header) | `src/components/Header`, `useCart` somando `items.reduce` |
| **RF-05** (Modificações Carrinho) | `cartReducer` (`INCREMENT`, `DECREMENT`, `REMOVE`) |
| **RF-06** (Persistência Local) | `src/utils/storage.ts`, sincronização no `CartProvider` |
| **RF-07** (Rotas SPA) | `react-router-dom` (`/`, `/checkout`, `/success`) |
| **RF-08** (Endereço e ViaCEP) | `src/services/viaCep.ts`, `src/hooks/useViaCep.ts`, `React Hook Form` |
| **RF-09** (Forma de Pagamento) | `src/schemas/checkoutSchema.ts`, `PaymentMethodSelector` |
| **RF-10** (Cálculo Financeiro) | `src/utils/formatCurrency.ts`, constantes de frete |
| **RF-11** (Bloqueio Inválido) | `isValid` do RHF, validação de `items.length > 0` |
| **RF-12** (Confirmação Pedido) | `src/pages/Success`, snapshot passado via location state |
| **RF-13** (Limpeza Carrinho) | Ação `CLEAR_CART` após confirmação do pedido |
| **RF-14** (Dark Mode) | `src/contexts/ThemeContext.tsx`, variáveis CSS em `index.css` |
| **RF-15** (Responsividade) | Media queries e grid responsivo mobile-first |
| **RF-16** (Logo com IA) | `src/assets/logo.svg`, `public/favicon.svg`, seção no README |
