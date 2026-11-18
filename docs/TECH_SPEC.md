# Technical Specification (TECH_SPEC) — Coffee Delivery

## 1. Stack Tecnológica e Justificativa

| Tecnologia / Pacote | Versão | Justificativa Técnica |
|---|---|---|
| **React** | 19.x | Biblioteca padrão para construção de SPAs modernas orientadas a componentes, explorando Hooks e concorrência nativa. |
| **Vite** | 8.x | Ferramenta de build ultrarrápida com Hot Module Replacement (HMR) instantâneo e compilação otimizada para produção. |
| **TypeScript** | 7.x (strict) | Tipagem estática estrita para garantir manutenibilidade, autocomplete confiável e prevenção de erros em tempo de compilação. |
| **React Router** | 7.x | Gerenciamento de rotas declarativas do lado do cliente (`/`, `/checkout`, `/success`), histórico do navegador e passagem segura de estado entre páginas. |
| **React Hook Form** | 7.x | Gerenciamento de formulários descontrolados (uncontrolled components) de alto desempenho, eliminando re-renderizações desnecessárias a cada caractere digitado. |
| **Zod** | 4.x | Biblioteca de declaração e validação de esquemas orientada a TypeScript com inferência estática de tipos. |
| **@hookform/resolvers** | 7.x | Integração transparente entre os esquemas do Zod e o formulário do React Hook Form. |
| **CSS Modules + Design Tokens** | CSS nativo | Estilos escopados por componente, temas claro/escuro via variáveis semânticas, zero runtime e nenhuma dependência extra de UI. *(Decisão registrada em `docs/AI_USAGE.md`.)* |
| **Phosphor Icons (@phosphor-icons/react)** | 2.x | Conjunto de ícones usado em todo o projeto (ShoppingCart, MapPin, CreditCard, Bank, PixLogo, Money, Trash, Plus, Minus, Timer, Coffee, Package). |
| **qrcode.react** | 4.x | Geração local do QR Code do PIX de demonstração, sem chamada externa. |
| **Vitest + Testing Library** | 5.x | Framework de testes unitários integrado ao Vite para validação de reducers, cálculos financeiros, geolocalização, esquemas Zod, storage e guards. |
| **Playwright** | 1.65.x | Testes E2E em Chrome real, com build de produção, mocks de rede e evidências em relatório HTML. |
| **@axe-core/playwright** | 4.x | Auditoria de acessibilidade WCAG A/AA integrada à suíte E2E. |
| **oxlint** | 1.x | Linter rápido para feedback local e CI, sem configuração pesada. |

> **Marca:** o projeto chama-se **Coffee Delivery** em todo o produto — header, footer, título da página, documentação e código. A logo, o favicon e a ilustração de sucesso são vetores originais; o hero e as 14 fotos de café são PNGs fornecidos no projeto.

---

## 2. Arquitetura da SPA e Desenho de Responsabilidades

A arquitetura do projeto adota uma separação de responsabilidades modular e limpa (Clean Code):

```
┌──────────────────────────────────────────────────────────────────────┐
│                            App Router                                │
│                     (/, /checkout, /success, *)                      │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
          ┌───────────────────────┼────────────────────────┐
          ▼                       ▼                        ▼
┌──────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│  ThemeProvider   │   │    CartProvider    │   │   ToastProvider    │
│ (Light/Dark)     │   │ (useReducer+store) │   │ (avisos efêmeros)  │
└────────┬─────────┘   └─────────┬──────────┘   └─────────┬──────────┘
         │                       │                        │
         └───────────────┬───────┴────────────┬───────────┘
                         ▼                    ▼
                  ┌─────────────┐      ┌─────────────┐
                  │  Home Page  │      │  Checkout   │
                  │ Hero+Cards  │      │ Address+Pay │
                  └──────┬──────┘      └──────┬──────┘
                         │                    │
                         ▼                    ├── useViaCep ──▶ ViaCEP
                  ┌─────────────┐             ├── coordinates ─▶ BrasilAPI / Nominatim
                  │  CoffeeCard │             ├── delivery ────▶ taxas + ETA
                  └─────────────┘             └── payment ─────▶ simulação
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │   Success   │
                                            │  Snapshot   │
                                            └─────────────┘
```

---

## 3. Estrutura de Diretórios do Projeto

```
coffee-delivery/
├── public/
│   └── favicon.svg             # Favicon da marca Coffee Delivery
├── e2e/
│   ├── fixtures.ts             # Mocks de ViaCEP/BrasilAPI/Nominatim + helpers
│   ├── home.spec.ts            # Hero, catálogo, toast, filtros e tema
│   ├── checkout.spec.ts        # Crédito, débito, PIX, dinheiro, recusa e limite
│   ├── responsive.spec.ts      # 320/375/768/1280 sem overflow
│   └── a11y.spec.ts            # axe em Home, Checkout e Success
├── scripts/
│   └── capture-screenshots.mjs # Screenshots determinísticos para o README
├── src/
│   ├── assets/                 # Logo, favicon, Imagem.png, 14 PNGs e sucesso (SVG)
│   ├── components/
│   │   ├── CoffeeCard/         # Card do catálogo + quantidade + adicionar + toast
│   │   ├── CartItem/           # Linha de item no resumo do checkout
│   │   ├── EmptyState/         # Carrinho vazio e sucesso sem pedido
│   │   ├── Footer/
│   │   ├── Header/             # Logo, localização, tema, carrinho, badge e sombra
│   │   ├── Logo/
│   │   ├── QuantityInput/      # Seletor + / -
│   │   ├── ThemeToggle/
│   │   └── ToastViewport/      # Avisos globais acessíveis
│   ├── contexts/
│   │   ├── CartContext.ts      # Contrato do contexto
│   │   ├── CartProvider.tsx    # useReducer + hidratação/gravação
│   │   ├── ThemeContext.ts
│   │   ├── ThemeProvider.tsx
│   │   ├── ToastContext.ts
│   │   └── ToastProvider.tsx   # Fila de até 3 toasts + timers
│   ├── data/coffees.ts         # Catálogo tipado com 14 cafés e PNGs
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useTheme.ts
│   │   ├── useToast.ts
│   │   └── useViaCep.ts        # Consulta assíncrona com AbortController
│   ├── layouts/DefaultLayout.tsx # Skip link + transição de rota
│   ├── pages/
│   │   ├── Home/               # Hero, filtros e catálogo
│   │   ├── Checkout/           # AddressForm, PaymentSelector, CartSummary,
│   │   │                       # ProcessingOverlay
│   │   ├── Success/            # Snapshot, entrega, pagamento e confete
│   │   └── NotFound/
│   ├── reducers/
│   │   ├── cartActions.ts
│   │   └── cartReducer.ts
│   ├── schemas/checkoutSchema.ts # Validação condicional por método
│   ├── services/
│   │   ├── viaCep.ts           # Endereço por CEP
│   │   ├── coordinates.ts      # BrasilAPI v2 + Nominatim + timeout
│   │   ├── delivery.ts         # Faixas, ETA, limite e fallback
│   │   └── payment.ts          # Simulação de cartão/PIX/dinheiro
│   ├── styles/index.css        # Tokens, reset, utilitários e motion
│   ├── tests/                  # 11 arquivos / 124 testes
│   ├── types/                  # coffee, cart, delivery, order
│   ├── utils/                  # cep, geo, card, order, totals, storage, guards
│   ├── App.tsx                 # Providers + rotas
│   └── main.tsx
├── docs/
│   ├── PRD_SPEC.md
│   ├── TECH_SPEC.md
│   ├── TASKS_SPEC.md
│   ├── AI_USAGE.md
│   └── screenshots/            # Evidências visuais
├── AGENTS.md
├── playwright.config.ts
└── README.md
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

### 4.3 Tipos de Pedido, Endereço e Pagamento (`src/types/order.ts`)
```typescript
import type { CartItem } from './cart'
import type { DeliveryQuote } from './delivery'

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash'
export type PaymentStatus = 'approved' | 'pending'
export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'elo'
  | 'amex'
  | 'hipercard'
  | 'unknown'

export interface DeliveryAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface PaymentDetails {
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  paidAt?: string
  cardBrand?: CardBrand
  cardLast4?: string
  installments?: number
  changeForInCents?: number
}

export interface Order {
  id: string
  items: CartItem[]
  address: DeliveryAddress
  delivery: DeliveryQuote
  payment: PaymentDetails
  itemsTotalInCents: number
  totalInCents: number
  createdAt: string
}

export type OrderSnapshot = Order
```

`PaymentDetails` guarda apenas metadados: bandeira, últimos quatro dígitos e parcelas. O número completo e o CVV nunca entram no pedido persistido.

### 4.4 Tipos de Entrega (`src/types/delivery.ts`)
```typescript
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface DeliveryQuote {
  distanceKm: number
  feeInCents: number
  minMinutes: number
  maxMinutes: number
  estimated: boolean
  calculatedAt: string
}

export type DeliveryQuoteResult =
  | { status: 'available'; quote: DeliveryQuote }
  | { status: 'out-of-area'; distanceKm?: number }

export type DeliveryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; quote: DeliveryQuote }
  | { status: 'out-of-area'; distanceKm?: number }
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
export const checkoutFormSchema = z
  .object({
    cep: z
      .string()
      .min(1, 'Informe o CEP')
      .regex(/^\d{5}-?\d{3}$/, 'Informe um CEP válido com 8 dígitos'),
    street: z.string().trim().min(1, 'Informe a rua'),
    number: z.string().trim().min(1, 'Informe o número'),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().min(1, 'Informe o bairro'),
    city: z.string().trim().min(1, 'Informe a cidade'),
    state: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, 'Informe a UF com 2 letras'),
    paymentMethod: z.enum(['credit', 'debit', 'pix', 'cash'], {
      error: 'Selecione a forma de pagamento',
    }),
    cardNumber: z.string().trim().optional(),
    cardName: z.string().trim().optional(),
    cardExpiry: z.string().trim().optional(),
    cardCvv: z.string().trim().optional(),
    installments: z.string().trim().optional(),
    changeFor: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // Cartão (crédito/débito): Luhn, nome, MM/AA válido, CVV 3–4 e 1–6 parcelas.
    // Dinheiro: troco opcional com 1–6 dígitos.
  })

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
```

> Zod 4 usa a opção `error` (substitui `errorMap` da v3). O formulário usa `mode: 'onTouched'`, então os erros aparecem depois que o campo é tocado e no submit. A validação é **condicional**: PIX e dinheiro não exigem campos de cartão; crédito exige parcelas entre 1 e 6.

### 6.2 Integração com a API ViaCEP
- **Endpoint**: `https://viacep.com.br/ws/${cleanCep}/json/`
- Tratamento de estados:
  - `isLoading`: Desabilita campos dependentes e exibe spinner/indicador no campo de CEP.
  - `isError` ou resposta com `{ erro: true }`: Exibe mensagem amigável de CEP não encontrado e libera os campos para digitação manual.
  - Sucesso: Executa `setValue` do React Hook Form para `street`, `neighborhood`, `city` e `state` com `{ shouldValidate: true }`, e move o foco para o campo de `number`.

### 6.3 Geolocalização e Cálculo de Entrega
- **Coordenadas** (`src/services/coordinates.ts`):
  - BrasilAPI CEP v2 (`.../api/cep/v2/{cep}`) lê `location.coordinates.latitude/longitude`.
  - Fallback: Nominatim (`/search?format=jsonv2&limit=1`) com o endereço montado.
  - `AbortSignal.timeout(7000)` combinado com o sinal do componente via `AbortSignal.any`.
  - Latitude/longitude são validadas antes de entrar no domínio; payloads inválidos retornam `null`.
  - A última requisição vence: respostas antigas são ignoradas por comparação de requisição/`AbortController`.
- **Distância** (`src/utils/geo.ts`): Haversine em km × `DELIVERY_ROAD_FACTOR` (1,25).
- **Cotação** (`src/services/delivery.ts`):
  - `buildDeliveryQuote` recusa distâncias inválidas e acima de 12 km.
  - `findFeeInCents` percorre `DELIVERY_FEE_TIERS` usando a distância **bruta**; a exibição arredonda para 2 casas.
  - `calculateEta` soma preparo (12), deslocamento (`km / 24 × 60`) e folga (5), arredondando para cima em múltiplos de 5 e abrindo janela de 10 min.
  - `cityFallbackQuote` aceita apenas a cidade/UF da cafeteria e marca `estimated: true` com 2,5 km.
- **Constantes** (`src/utils/constants.ts`): coordenadas da loja, faixas, velocidade, tempos, limite e fallback — nenhum número mágico no componente.

### 6.4 Simulação de Pagamento
- **Cartão** (`src/services/payment.ts` + `src/utils/card.ts`):
  - Luhn, comprimento 13–19, bandeira por prefixo (Visa, Mastercard, Elo, Amex, Hipercard).
  - Validade `MM/AA` comparada ao mês corrente; CVV 3–4 dígitos.
  - A simulação aguarda `PAYMENT_SIMULATION_DELAY_MS` (1,8 s) e é abortável pelo `AbortController` do checkout.
  - Cartões terminados em `0002` retornam `declined`.
  - Persiste apenas `cardBrand`, `cardLast4`, `installments`, `transactionId` e `paidAt`.
- **PIX** (`createPixDemoCode`): payload textual identificado como demonstração (`COFFEE-DELIVERY-DEMO`), com chave PIX `11998102527`, renderizado em QR Code por `qrcode.react` e botão de copiar.
- **Dinheiro** (`createCashPayment`): status `pending`, com `changeForInCents` opcional; o pagamento ocorre na entrega.
- **UI** (`ProcessingOverlay`): diálogo modal com etapas animadas, `aria-busy`, foco contido e cancelamento no unmount.

---

## 7. Sistema de Design, Tokens e Dark Mode

### 7.1 Variáveis CSS e Tokens Semânticos (`src/styles/index.css`)
```css
:root {
  /* Marca */
  --yellow-dark: #c47f17;
  --yellow: #dbac2c;
  --yellow-light: #f1e9c9;
  --yellow-text: #8a5a0c;
  --purple-dark: #4b2995;
  --purple: #8047f8;
  --purple-light: #ebe5f9;

  /* Superfícies e texto (light) */
  --bg-page: #fafafa;
  --bg-surface: #ffffff;
  --bg-subtle: #f3f2f2;
  --bg-input: #ededed;
  --text-title: #272221;
  --text-base: #574f4d;
  --text-label: #8d8686; /* Figma base-label — ver nota de contraste AA no §8 */
  --border-color: #e6e5e5;

  /* Feedback */
  --danger: #b3261e;
  --danger-soft: #fdeceb;
  --success: #1f6b3a;
  --success-soft: #e8f5ee;
  --focus-ring: #8047f8;

  /* Elevação */
  --shadow-sm: 0 4px 12px -6px rgba(39, 34, 33, 0.16);
  --shadow-md: 0 16px 40px -22px rgba(39, 34, 33, 0.28);
  --shadow-lg: 0 28px 70px -34px rgba(39, 34, 33, 0.34);
  --shadow-brand: 0 18px 32px -18px rgba(219, 172, 44, 0.75);

  /* Forma, motion e layout */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;
  --transition-fast: 140ms ease;
  --transition-base: 220ms ease;
  --transition-slow: 420ms cubic-bezier(0.22, 1, 0.36, 1);
  --font-display: 'Baloo 2', 'Trebuchet MS', cursive;
  --font-body: 'Roboto', 'Segoe UI', system-ui, sans-serif;
  --header-height: 104px;
  /* Estado ativo de inputs per the Figma style board (borda #C47F17) */
  --input-focus: #c47f17;
}

[data-theme='dark'] {
  color-scheme: dark;

  --yellow-light: #352c14;
  --yellow-text: #f0c75e;
  --purple-dark: #b79cff;
  --purple-light: #241c3d;

  --bg-page: #121214;
  --bg-surface: #1e1e22;
  --bg-subtle: #202024;
  --bg-input: #1a1a1e;
  --text-title: #ffffff;
  --text-base: #c4c4cc;
  --text-label: #a8a8b3;
  --border-color: #323238;
}
```

O tema é aplicado antes do primeiro paint por um script inline em `index.html`, evitando “flash” de tema errado. O `ThemeProvider` mantém `data-theme`, `color-scheme` e `<meta name="theme-color">` sincronizados.

### 7.2 ThemeContext e Persistência
- Chave de armazenamento: `@coffee-delivery:theme-1.0.0`.
- Valor inicial: `localStorage.getItem` $\rightarrow$ caso ausente, verifica `window.matchMedia('(prefers-color-scheme: dark)').matches`.
- Alternância instantânea via aplicação do atributo `data-theme="dark"` no elemento `document.documentElement`.

---

## 8. Estratégia de Testes Automatizados

### 8.1 Unitários — Vitest 5 + Testing Library

1. **`cartReducer.test.ts`**: adicionar, acumular, separar cafés distintos, incrementar, decrementar/remover, remover, limpar, entradas inválidas e imutabilidade.
2. **`cartTotals.test.ts`**: carrinho vazio, quantidade e subtotal em centavos (frete fora do cálculo base).
3. **`formatCurrency.test.ts`**: `formatCurrency`, `formatAmount` e `formatCurrencyInput` com zero, milhar, máscara e limite de dígitos.
4. **`checkoutSchema.test.ts`**: CEP, campos em branco, UF, complemento, cartão (Luhn/validade/CVV/parcelas), PIX e troco.
5. **`card.test.ts`**: Luhn, bandeiras, validade, máscaras, parcelas e valor por parcela.
6. **`geo.test.ts`**: Haversine, fator viário e formatação de distância.
7. **`delivery.test.ts`**: faixas, distância bruta vs. arredondada, limite de 12 km, ETA e fallback por cidade.
8. **`payment.test.ts`**: aprovação, recusa `0002`, PIX, ausência do número completo e abortamento.
9. **`cep.test.ts`**: `onlyDigits`, `normalizeCep` e `formatCep`.
10. **`storage.test.ts`**: leitura/escrita, JSON corrompido, guard inválido, sessão e remoção.
11. **`guards.test.ts`**: carrinho, tema, pagamento, pedido (entrega + pagamento) e estado de navegação.

**Resultado:** **11 arquivos, 124 testes**, 0 `it.todo`.

### 8.2 E2E — Playwright + axe-core

`playwright.config.ts` define:

- `testDir: './e2e'`, execução paralela com 3 workers.
- `channel: 'chrome'`, locale `pt-BR`, timezone `America/Sao_Paulo`.
- `webServer: 'npm run build && npm run preview -- --port 4173 --strictPort'` com `reuseExistingServer: false`.
- `trace: 'on-first-retry'`, screenshot apenas em falha e relatório HTML em `playwright-report/`.
- APIs externas mockadas em `e2e/fixtures.ts` (ViaCEP, BrasilAPI, Nominatim), além de fontes bloqueadas para métricas estáveis.

**Cobertura:** 19 testes — Home (4), Checkout (7), Responsividade (5) e Acessibilidade (3). Resultado: **19/19 aprovados**. A suíte axe usa as tags `wcag2a`, `wcag2aa`, `wcag21a` e `wcag21aa` e falha se qualquer violação for encontrada.

**Exceções únicas e documentadas (decisão do desenvolvedor, 18/11/2026):** a fidelidade ao Figma exige dois tons que reprovam WCAG 2 AA para texto: (1) o token `--text-label` segue o valor oficial do Figma (`#8D8686`), com contraste 3,05–3,57:1; (2) o botão primário amarelo usa rótulo branco (`#FFFFFF` sobre `#DBAC2C`, 2,1:1), o mesmo par do botão "CONFIRMAÇÃO" do style board. Em `e2e/a11y.spec.ts`, a regra `color-contrast` ignora **apenas** os nós que batem exatamente nesses pares (`fgColor` `#8D8686`, ou `fgColor` `#ffffff` **e** `bgColor` `#dbac2c`); qualquer outro contraste insuficiente — e qualquer outra regra WCAG — continua reprovando a suíte. Nenhum texto de conteúdo primário usa `--text-label`. Se a fidelidade literal ao Figma deixar de ser requisito, as reversões são de uma linha (`--text-label: #6f6866` e tokens de cor do CTA) e a remoção do filtro do helper.

### 8.3 Evidências

- `npm run test:run` → 124/124.
- `npm run test:e2e` → 19/19.
- `npx tsc -b` → sem erros.
- `npm run build` → sucesso (alerta de chunk > 500 kB).
- `node scripts/capture-screenshots.mjs` → capturas em `docs/screenshots/`.

---

## 9. Rastreabilidade com os Requisitos do PRD

| Requisito PRD | Implementação Técnica |
|---|---|
| **RF-01** (Catálogo) | `src/pages/Home`, `src/components/CoffeeCard`, `src/data/coffees.ts` |
| **RF-02** (Quantidade Home) | `src/components/QuantityInput`, estado local em `CoffeeCard` |
| **RF-03** (Adição e Acúmulo) | `src/contexts/CartProvider.tsx`, `cartReducer` ação `ADD_ITEM` |
| **RF-04** (Badge Header) | `src/components/Header`, `useCart` expondo `itemCount` |
| **RF-05** (Modificações Carrinho) | `cartReducer` (`INCREMENT`, `DECREMENT`, `REMOVE`) + `CartSummary` |
| **RF-06** (Persistência Local) | `src/utils/storage.ts`, sincronização no `CartProvider` |
| **RF-07** (Rotas SPA) | `react-router-dom` (`/`, `/checkout`, `/success`, `*`) |
| **RF-08** (Endereço e ViaCEP) | `src/services/viaCep.ts`, `src/hooks/useViaCep.ts`, `AddressForm` |
| **RF-09** (Formas de Pagamento) | `src/schemas/checkoutSchema.ts`, `PaymentSelector`, `ProcessingOverlay` |
| **RF-10** (Cálculo Financeiro e Frete) | `src/utils/cartTotals.ts`, `src/services/delivery.ts`, `DELIVERY_FEE_TIERS`, `formatCurrency` |
| **RF-11** (Bloqueio Inválido) | `checkoutFormSchema`, validação de entrega e guard de carrinho vazio |
| **RF-12** (Confirmação e Pagamento) | `src/services/payment.ts`, `src/pages/Success`, snapshot via `location.state`/`sessionStorage` |
| **RF-13** (Limpeza Carrinho) | Ação `CLEAR_CART` após confirmação do pedido |
| **RF-14** (Dark Mode) | `ThemeProvider`, `ThemeToggle` e variáveis CSS em `index.css` |
| **RF-15** (Responsividade) | Grids fluidos e media queries validadas por Playwright em 320–1280+ |
| **RF-16** (Identidade e Assets) | `src/assets/logo.svg`, `public/favicon.svg`, `Imagem.png`, PNGs em `src/assets/` |
| **RN-03** (Frete) | `src/services/delivery.ts` + `src/utils/geo.ts` + `DELIVERY_FEE_TIERS` |
| **RN-05** (Pagamento Simulado) | `src/services/payment.ts` + `src/utils/card.ts` |
| **RN-06** (Snapshot) | `sessionStorage` (`@coffee-delivery:last-order-1.0.0`) + guard `isOrder` |
| **RN-07** (Endereço/Entrega) | ViaCEP + `src/services/coordinates.ts` + `cityFallbackQuote` |
| **RNF-01** (Acessibilidade) | Skip link, foco visível, labels, `aria-live`, contraste AA e axe sem violações — **exceção única:** `--text-label` `#8D8686` (Figma) com escopo documentado na suíte a11y |
