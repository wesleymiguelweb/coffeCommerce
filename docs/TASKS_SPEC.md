# Tasks Specification (TASKS_SPEC) — Plano de Implementação

Este documento registra o planejamento granular do desenvolvimento do **Coffee Delivery**, com critérios de aceite, arquivos impactados, validação e commits semânticos sugeridos.

**Status geral:** todas as tarefas concluídas em **18/11/2026**.

---

## Tabela Geral de Tarefas

| ID | Tarefa | Requisitos | Arquivos Afetados | Critério de Pronto | Commit sugerido | Status |
|---|---|---|---|---|---|---|
| **TASK-01** | Documentação inicial de especificações | Docs, RF-01 a RF-16 | `docs/PRD_SPEC.md`, `docs/TECH_SPEC.md`, `docs/TASKS_SPEC.md`, `AGENTS.md` | Especificações detalhadas aprovadas | `docs: add initial specs and guidelines` | [x] Concluído |
| **TASK-02** | Configuração de dependências e tooling | Setup, Stack | `package.json`, `vite.config.ts`, `tsconfig.*.json` | Dependências instaladas, Vitest/Vite alinhados e build sem erros | `chore: install project dependencies` | [x] Concluído |
| **TASK-03** | Identidade visual, logo e design tokens | RF-14, RF-16 | `src/assets/logo.svg`, `public/favicon.svg`, `src/styles/index.css` | Logo integrada, favicon configurado, tokens light/dark definidos | `feat: setup brand, favicon and design tokens` | [x] Concluído |
| **TASK-04** | Modelagem de tipos e catálogo | RF-01, RN-08 | `src/types/*.ts`, `src/data/coffees.ts`, `src/utils/formatCurrency.ts` | 14 cafés tipados, preços em centavos e formatadores testados | `feat: create data models, catalog data and formatters` | [x] Concluído |
| **TASK-05** | ThemeContext e Dark Mode | RF-14, RNF-01 | `src/contexts/ThemeContext.ts`, `ThemeProvider.tsx`, `src/hooks/useTheme.ts`, `ThemeToggle/` | Alternância persistida, sem flash e com `data-theme` | `feat: implement theme context and dark mode toggle` | [x] Concluído |
| **TASK-06** | Rotas e layout base | RF-07, RNF-02 | `src/App.tsx`, `src/layouts/DefaultLayout.tsx`, `Header/`, `Footer/` | Rotas SPA, header responsivo, badge dinâmico e skip link | `feat: setup app routes and base layout with header` | [x] Concluído |
| **TASK-07** | CartReducer e CartContext | RF-02 a RF-06, RN-01 a RN-03 | `src/reducers/`, `src/contexts/CartProvider.tsx`, `src/hooks/useCart.ts`, `src/utils/storage.ts` | Ações testadas, persistência e reidratação segura | `feat: implement cart context and reducer with tests` | [x] Concluído |
| **TASK-08** | Home e catálogo | RF-01, RF-02, RF-03 | `src/pages/Home/`, `src/components/CoffeeCard/`, `QuantityInput/` | Hero responsivo, 14 cards, filtros e adição com quantidade | `feat: implement home page, hero and coffee catalog` | [x] Concluído |
| **TASK-09** | Checkout com ViaCEP e Zod | RF-08, RF-09, RN-07 | `AddressForm.tsx`, `checkoutSchema.ts`, `services/viaCep.ts`, `hooks/useViaCep.ts` | Busca automática, máscara, validação e pagamento | `feat: implement checkout address form with via cep and zod` | [x] Concluído |
| **TASK-10** | Resumo e finalização do pedido | RF-05, RF-10, RF-11, RF-13 | `CartSummary.tsx`, `components/CartItem/`, `utils/cartTotals.ts` | Edição/remoção, totais e criação do pedido | `feat: implement cart summary, items list and order submission` | [x] Concluído |
| **TASK-11** | Página de sucesso | RF-12, RF-13, RN-06, RN-09 | `src/pages/Success/`, `src/utils/guards.ts` | Snapshot, entrega, pagamento e proteção de acesso | `feat: implement order success confirmation page` | [x] Concluído |
| **TASK-12** | Testes unitários | Qualidade, Rubrica | `src/tests/*.test.ts` | Testes passando, sem `it.todo` | `test: add unit tests for reducer, calculations and schemas` | [x] Concluído |
| **TASK-13** | Acessibilidade, responsividade e polish | RNF-01, RNF-02, RF-15 | Componentes e estilos globais | 320/375/768/1280 sem overflow; axe 0 violações (exceto #8D8686 isolado); 44px no mobile | `style: polish accessibility, responsive layouts and animations` | [x] Concluído |
| **TASK-14** | Documentação inicial e evidências | Docs, Entrega | `README.md`, `docs/AI_USAGE.md`, `docs/screenshots/`, specs | README com prints, instruções, decisões e uso de IA | `docs: finalize readme with screenshots and ai usage` | [x] Concluído |
| **TASK-15** | Rebrand para Coffee Delivery e PNGs | RF-16 | `src/assets/`, `Header/`, `Footer/`, `Logo/`, `index.html`, `data/coffees.ts` | Hero PNG, 14 fotos PNG e wordmark em toda a UI | `feat: migrate branding to coffee delivery with png assets` | [x] Concluído |
| **TASK-16** | Entrega por distância, taxa e ETA | RF-10, RN-03, RN-07 | `types/delivery.ts`, `services/coordinates.ts`, `services/delivery.ts`, `utils/geo.ts`, `AddressForm.tsx` | Coordenadas, faixas, janela, limite de 12 km e fallback | `feat: calculate delivery fee and eta from real distance` | [x] Concluído |
| **TASK-17** | Pagamento simulado completo | RF-09, RF-12, RN-05 | `types/order.ts`, `services/payment.ts`, `utils/card.ts`, `PaymentSelector.tsx`, `ProcessingOverlay.tsx` | Crédito, débito, PIX e dinheiro aprovando/recusando na SPA | `feat: implement simulated card pix and cash payments` | [x] Concluído |
| **TASK-18** | Efeitos de UI/UX | RF-15, RNF-01 | `contexts/Toast*`, `components/ToastViewport/`, `DefaultLayout.tsx`, `Header/`, `CoffeeCard/`, estilos | Toasts, transições, hover, sombra no scroll e dark mode | `style: add toasts, route transitions and microinteractions` | [x] Concluído |
| **TASK-19** | Playwright, axe e screenshots | Qualidade, Rubrica | `playwright.config.ts`, `e2e/*.spec.ts`, `scripts/capture-screenshots.mjs` | 19 E2E verdes, axe 0 violações além da exceção #8D8686 documentada e capturas atualizadas | `test: add playwright e2e and accessibility coverage` | [x] Concluído |
| **TASK-20** | Migração de documentação e limpeza | Docs, Entrega | `README.md`, `docs/*.md`, `AGENTS.md`, assets antigos | Docs coerentes com o produto final e assets órfãos removidos | `docs: update specifications for final delivery` | [x] Concluído |
| **TASK-21** | Alinhamento ao style guide do Figma | RF-16 | `src/styles/index.css`, `src/pages/Checkout/styles.module.css`, `e2e/a11y.spec.ts`, `docs/*.md`, `AGENTS.md`, `README.md` | Input ativo com borda `#C47F17`, `--text-label: #8D8686`, screenshots atualizados, exceção AA documentada e isolada no axe | `fix: align design tokens to figma style guide` | [x] Concluído |
| **TASK-22** | Pixel-perfect das telas Home/Checkout/Success | RF-15, RF-16 | `src/components/Logo`, `Header`, `CoffeeCard`, `QuantityInput`, `src/pages/*`, `e2e/a11y.spec.ts`, `docs/*.md`, `AGENTS.md`, `README.md` | Diferenças medidas com o Figma; desvios corrigidos ou justificados | `fix: polish screens against figma reference` | [x] Concluído — comparação no Figma do browser; cards chapados `#F3F2F2` (raio 6/36, sem borda/sombra/anel), Home `#FAFAFA` com halo local, hero em 2 linhas, rodapé 72×38; 19/19 E2E; 2 exceções AA documentadas |
| **TASK-23** | Efeitos em Tailwind CSS | RF-15, RNF-01 | `vite.config.ts`, `package.json`, `src/styles/index.css`, CSS Modules de componentes/páginas, `docs/*.md`, `README.md` | Hover, transições, sombras e animações via utilities/tokens Tailwind, sem mudança visual | `style: migrate ui effects to tailwind css` | [x] Concluído — `@tailwindcss/vite` + `@theme` de efeitos; `@apply`/`@reference` nos módulos; 124 unitários e 19 E2E verdes, capturas revalidadas |
| **TASK-24** | Glow e brilho na interface | RF-15, RF-16 | `src/styles/index.css`, `src/pages/Home/styles.module.css`, `src/pages/Checkout/styles.module.css`, `src/pages/Success/styles.module.css`, `src/components/*/styles.module.css`, `docs/*.md`, `README.md` | Halo do hero com respiração, glow nos botões e sweep de brilho nas CTAs | `style: add hero glow and button shine` | [x] Concluído — tokens `shadow-glow-*`, `animate-glow-breathe` e `animate-shine`; 124 unitários e 19 E2E verdes, capturas revalidadas |
| **TASK-25** | Correções visuais dos prints finais | RF-15, RF-16 | `src/pages/Home/styles.module.css`, `src/styles/index.css`, `src/components/CartItem/styles.module.css`, `docs/*.md` | Background com efeitos de cor visíveis e miniatura do carrinho sem fundo amarelo | `fix: strengthen background glow and neutralize cart thumbnail` | [x] Concluído — halo do hero reforçado, glow lateral 18% e thumb `--bg-subtle`; 124 unitários e 19 E2E verdes, capturas revalidadas |

---

## Detalhamento das Etapas

### TASK-01 a TASK-14 — Base do produto
- Especificações, tooling, marca vetorial, tipos, catálogo, tema, rotas, carrinho, Home, checkout ViaCEP, resumo, sucesso, testes, acessibilidade e documentação inicial.
- **Resultado consolidado:** SPA funcional com 14 cafés, carrinho persistente, checkout validado, dark mode, testes unitários e auditoria axe.

### TASK-15: Rebrand e PNGs
- **Objetivo:** Alinhar o produto ao nome e aos assets finais fornecidos.
- **Critério de Aceite:** wordmark "Coffee Delivery" no header/footer/título; hero PNG e 14 fotos PNG renderizando com bom recorte nos dois temas.
- **Resultado:** `Imagem.png` no hero, PNGs importados por `src/data/coffees.ts`, novo `Logo`, `index.html` atualizado e remoção das ilustrações SVG antigas.

### TASK-16: Entrega por Distância
- **Objetivo:** Substituir o frete fixo por uma cotação real baseada no endereço.
- **Critério de Aceite:** coordenadas via BrasilAPI/Nominatim; faixas 1,5/4/8/12 km; ETA coerente; bloqueio acima de 12 km; fallback de cidade sinalizado.
- **Resultado:** `coordinates.ts`, `delivery.ts`, `geo.ts`, `types/delivery.ts`, `AddressForm` com prévia de distância/taxa/ETA, `DeliveryQuote` no pedido e testes de faixas/ETA.
- **Validação:** CEP `90020008` → 0,47 km, R$ 3,50, 20–30 min; CEP `01310100` → fora da área.

### TASK-17: Pagamento Simulado
- **Objetivo:** Concluir o pagamento no checkout com quatro métodos e feedback de erro.
- **Critério de Aceite:** cartão válido aprova; cartão `0002` recusa; PIX gera QR/código; dinheiro registra troco; nenhum dado sensível persiste.
- **Resultado:** `payment.ts`, `card.ts`, schema condicional, `PaymentSelector` com preview do cartão/parcelas/QR, `ProcessingOverlay`, pedido enriquecido com `PaymentDetails` e sucesso detalhado.
- **Validação:** testes de Luhn, validade, bandeira, parcelas, recusa, PIX, troco e abortamento.

### TASK-18: Efeitos de UI/UX
- **Objetivo:** Dar acabamento profissional sem sacrificar acessibilidade.
- **Critério de Aceite:** feedback ao adicionar, transições suaves, hover/elevação, header com sombra e respeito a `prefers-reduced-motion`.
- **Resultado:** `ToastProvider`/`ToastViewport` (3 toasts, 4,5 s), transição de rota no `DefaultLayout`, hover nos cards, badge animado, sombra no header e confete no sucesso.

### TASK-19: Playwright, axe e Screenshots
- **Objetivo:** Validar o fluxo real no build de produção e gerar evidências.
- **Critério de Aceite:** 19 testes E2E verdes; axe sem violações; capturas atualizadas para o README.
- **Resultado:** `playwright.config.ts` (Chrome, porta 4173, build+preview), `e2e/{fixtures,home,checkout,responsive,a11y}`, scripts npm e `scripts/capture-screenshots.mjs`.
- **Validação:** **19/19** E2E, **0** violações axe, **8** screenshots.

### TASK-20: Documentação Final
- **Objetivo:** Deixar README e specs coerentes com o produto entregue.
- **Critério de Aceite:** nenhuma referência à marca antiga, frete fixo, SVGs removidos ou contagem de testes desatualizada.
- **Resultado:** README reescrito, PRD/TECH/TASKS/AI_USAGE migrados, `AGENTS.md` atualizado e assets órfãos removidos.

---

## Sequência de commits sugerida

Os commits abaixo são sugestões; nada foi commitado automaticamente.

```bash
git add package.json package-lock.json tsconfig*.json vite.config.ts playwright.config.ts
git commit -m "chore: configure vitest playwright and project tooling"

git add src/assets/Imagem.png src/assets/*.png src/assets/logo.svg src/assets/success-illustration.svg public/favicon.svg
git commit -m "feat: add coffee delivery png assets and brand artwork"

git add src/types src/services src/utils src/schemas
git commit -m "feat: calculate delivery from distance and simulate payments"

git add src/contexts src/hooks src/components src/pages src/layouts src/App.tsx index.html src/styles
git commit -m "feat: finish checkout payments delivery preview and ui feedback"

git add src/tests
git commit -m "test: cover delivery tiers payments cards and order guards"

git add e2e scripts playwright.config.ts
git commit -m "test: add playwright e2e accessibility and screenshot capture"

git add README.md docs AGENTS.md .gitignore
git commit -m "docs: migrate specifications and evidence to final delivery"
```
