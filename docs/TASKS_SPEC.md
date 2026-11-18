# Tasks Specification (TASKS_SPEC) — Plano de Implementação

Este documento estabelece o planejamento granular do desenvolvimento do **Coffee Delivery**, organizado em etapas sequenciais com critérios claros de aceite, arquivos impactados, validação e padrão de commits semânticos.

---

## Tabela Geral de Tarefas

| ID | Tarefa | Requisitos | Arquivos Afetados | Critério de Pronto | Commit | Status |
|---|---|---|---|---|---|---|
| **TASK-01** | Documentação inicial de especificações | Docs, RF-01 a RF-16 | `docs/PRD_SPEC.md`, `docs/TECH_SPEC.md`, `docs/TASKS_SPEC.md`, `AGENTS.md` | Especificações detalhadas aprovadas | `docs: add initial specs and guidelines` | [x] Concluído |
| **TASK-02** | Configuração de dependências e tooling | Setup, Stack | `package.json`, `vite.config.ts`, `tsconfig.json` | Dependências instaladas (`react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@phosphor-icons/react`, `vitest`) e build sem erros | `chore: install project dependencies` | [ ] Pendente |
| **TASK-03** | Identidade visual, Logo com IA e Design Tokens | RF-14, RF-16 | `src/assets/logo.svg`, `public/favicon.svg`, `src/styles/index.css` | Logo integrada, favicon configurado, tokens de cores e temas Light/Dark definidos | `feat: setup ai logo, favicon and design tokens` | [ ] Pendente |
| **TASK-04** | Modelagem de tipos e dados do Catálogo | RF-01, RN-08 | `src/types/*.ts`, `src/data/coffees.ts`, `src/utils/formatCurrency.ts` | 14 cafés cadastrados com tipos estritos e utilitário monetário testado | `feat: create data models, catalog data and formatters` | [ ] Pendente |
| **TASK-05** | Configuração do ThemeContext e Dark Mode | RF-14, RNF-01 | `src/contexts/ThemeContext.tsx`, `src/hooks/useTheme.ts`, `src/components/ThemeToggle/` | Alternância de tema funcionando e persistindo no localStorage | `feat: implement theme context and dark mode toggle` | [ ] Pendente |
| **TASK-06** | Estruturação de rotas e Layout Base | RF-07, RNF-02 | `src/App.tsx`, `src/components/Header/`, `src/layouts/DefaultLayout.tsx` | Navegação básica funcional com Header responsivo e badge dinâmico | `feat: setup app routes and base layout with header` | [ ] Pendente |
| **TASK-07** | Implementação do CartReducer e CartContext | RF-02 a RF-06, RN-01 a RN-03 | `src/reducers/cartReducer.ts`, `src/contexts/CartContext.tsx`, `src/hooks/useCart.ts` | Todas as ações do carrinho testadas e com persistência no localStorage | `feat: implement cart context and reducer with tests` | [ ] Pendente |
| **TASK-08** | Implementação da Home Page e Catálogo de Cafés | RF-01, RF-02, RF-03 | `src/pages/Home/`, `src/components/CoffeeCard/`, `src/components/QuantityInput/` | Hero banner responsivo e grid de cafés com seleção de quantidade e adição ao carrinho | `feat: implement home page, hero and coffee catalog` | [ ] Pendente |
| **TASK-09** | Formulário de Checkout com ViaCEP e Zod | RF-08, RF-09, RN-07 | `src/pages/Checkout/`, `src/schemas/checkoutSchema.ts`, `src/services/viaCep.ts` | Busca automática de CEP via ViaCEP, validação de campos e métodos de pagamento | `feat: implement checkout address form with via cep and zod` | [ ] Pendente |
| **TASK-10** | Resumo do Carrinho e Finalização da Compra | RF-05, RF-10, RF-11, RF-13 | `src/pages/Checkout/CartSummary.tsx`, `src/components/CartItem/` | Edição e remoção de itens na tela de checkout, cálculo de subtotal/frete/total e finalização | `feat: implement cart summary, items list and order submission` | [ ] Pendente |
| **TASK-11** | Página de Confirmação e Sucesso do Pedido | RF-12, RF-13, RN-06, RN-09 | `src/pages/Success/` | Exibição de snapshot do pedido, dados de entrega/pagamento e proteção contra acesso sem pedido | `feat: implement order success confirmation page` | [ ] Pendente |
| **TASK-12** | Testes Automatizados Unitários | Qualidade, Rubrica | `src/tests/*.test.ts` | Testes do cartReducer, formatCurrency e checkoutSchema passando com 100% de sucesso | `test: add unit tests for reducer, calculations and schemas` | [ ] Pendente |
| **TASK-13** | Revisão de Acessibilidade, Responsividade e Polish | RNF-01, RNF-02, RF-15 | Todos os componentes | Testes em 320px, 375px, 768px e 1280px; foco de teclado e contraste | `style: polish accessibility, responsive layouts and animations` | [ ] Pendente |
| **TASK-14** | Documentação Final, Evidências e README | Docs, Entrega | `README.md`, `docs/AI_USAGE.md` | README completo com prints, instruções, decisões e evidências do uso de IA | `docs: finalize readme with badges, screenshots and ai logs` | [ ] Pendente |

---

## Detalhamento das Etapas

### TASK-01: Documentação Inicial de Especificações
- **Objetivo**: Criar o PRD, Technical Spec, Tasks Spec e AGENTS.md antes da codificação.
- **Critério de Aceite**: Todos os 16 requisitos funcionais e 10 regras de negócio mapeados.
- **Status**: **Concluído**.

### TASK-02: Configuração de Dependências e Tooling
- **Objetivo**: Instalar pacotes essenciais sem conflitos e garantir compilação limpa.
- **Critério de Aceite**: `npm run build` executa sem erros.
- **Status**: **Próxima tarefa**.

### TASK-03 a TASK-14
- Seguirão o ciclo de: implementação $\rightarrow$ teste $\rightarrow$ validação $\rightarrow$ commit semântico.
