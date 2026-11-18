# Diretrizes para Assistentes de IA (AGENTS.md) — Coffee Delivery

Este arquivo define as diretrizes, padrões de engenharia e restrições operacionais para assistentes de Inteligência Artificial que atuem no planejamento, desenvolvimento, refatoração, testes e revisão deste projeto.

---

## 1. Contexto do Projeto

O **Coffee Delivery** é uma aplicação web de e-commerce desenvolvida como projeto final da disciplina de **Single Page Application (SPA)**. A aplicação simula o fluxo completo de compra de uma cafeteria:
- Exploração do catálogo de 14 cafés especiais com filtros e tags.
- Seleção de quantidade e adição ao carrinho com acúmulo de produtos repetidos.
- Gerenciamento reativo do carrinho de compras com persistência no `localStorage`.
- Checkout com preenchimento automático de endereço via API pública do **ViaCEP** e validação com **Zod**.
- Cálculo de **taxa de entrega e previsão por distância real** até a cafeteria (BrasilAPI/Nominatim + Haversine).
- Pagamento **simulado localmente** (crédito, débito, PIX e dinheiro), sem gateway ou transação financeira real.
- Emissão de confirmação de pedido na tela `/success` com preservação de snapshot do pedido.
- Alternância de tema **Light / Dark** com persistência.
- Responsividade total para dispositivos móveis (320px, 375px, 768px, 1280px+).
- Identidade visual autoral com logo vetorial e PNGs de café fornecidos no projeto.
- Cobertura E2E com **Playwright + axe-core**.

---

## 2. Documentos de Referência Obrigatórios

Antes de sugerir qualquer alteração no código ou criar novos arquivos, o assistente de IA **DEVE** consultar:
1. `docs/PRD_SPEC.md` — Requisitos do produto, fluxos, RF-01 a RF-16 e Regras de Negócio RN-01 a RN-10.
2. `docs/TECH_SPEC.md` — Decisões de arquitetura, modelagem de tipos, design tokens, contratos e dependências.
3. `docs/TASKS_SPEC.md` — Fila de tarefas granulares e status atual do projeto.
4. Protótipo do Figma: `Coffee Delivery • Projeto Final React`.

---

## 3. Regras de Atuação do Assistente de IA

### 3.1 Desenvolvimento Incremental por Tarefas Pequenas
- **NUNCA gere ou altere a aplicação inteira de uma só vez**.
- Trabalhe estritamente na próxima tarefa definida no `docs/TASKS_SPEC.md`.
- Para cada tarefa:
  1. Apresente o objetivo e os critérios de aceite.
  2. Proponha e execute as alterações necessárias nos arquivos especificados.
  3. Realize a validação e testes automatizados.
  4. Atualize o status da tarefa no `docs/TASKS_SPEC.md`.
  5. Sugira o commit semântico correspondente e solicite a validação do desenvolvedor.

### 3.2 Princípios de Clean Code e TypeScript Estrito
- **Sem atalhos**: É expressamente proibido o uso de `any`, `@ts-ignore` injustificado ou cast forçado (`as unknown as T`).
- **Componentes desacoplados**: Componentes devem possuir responsabilidade única, interfaces explícitas de Props e tipagem em arquivos dedicados.
- **Imutabilidade**: Todas as mutações no estado global do carrinho devem ocorrer exclusivamente através de despachos (`dispatch`) de ações no `useReducer`, utilizando métodos imutáveis (`map`, `filter`, `concat`).
- **Nenhum valor mágico (Magic Numbers)**: Preços, faixas de frete (`DELIVERY_FEE_TIERS`), tempos de entrega, coordenadas da loja e chaves de `localStorage` devem ser constantes centralizadas.
- **Domínio puro**: Cálculos de distância, taxa, ETA, Luhn e formatação devem viver em `utils`/`services` testáveis, não em componentes.
- **Privacidade**: Nunca persistir número completo de cartão, CVV ou dados pessoais além do necessário para o snapshot do pedido.

### 3.3 Acessibilidade e Responsividade
- Toda imagem deve conter `alt` descritivo.
- Botões que contêm apenas ícones devem ter `aria-label`.
- Formulários devem possuir labels semanticamente associados aos inputs via `htmlFor`/`id`.
- O layout deve ser Mobile-First, sem quebras ou scroll horizontal em telas a partir de 320px de largura.
- Alto contraste e foco visível garantidos nos modos Claro e Escuro.
- **Exceções documentadas (decisão do desenvolvedor, 18/11/2026):** fidelidade ao Figma —
  1. `--text-label` usa `#8D8686` (`base-label` do Figma), contraste 3,05–3,57:1;
  2. o CTA amarelo usa rótulo `#FFFFFF` sobre `#DBAC2C` (2,1:1, o mesmo par do botão primário do Figma).
  A suíte E2E isola exatamente esses dois pares na regra `color-contrast` (demais elementos continuam reprovando). Não usar `--text-label` em texto de conteúdo primário.

---

## 4. Padrão de Commits Semânticos

O assistente deve orientar o versionamento seguindo a convenção **Conventional Commits**:
- `feat:` Nova funcionalidade implementada.
- `fix:` Correção de bug.
- `docs:` Alterações em especificações, documentação e README.
- `test:` Adição ou modificação de testes automatizados.
- `refactor:` Alteração de código que não adiciona funcionalidade nem corrige bug.
- `style:` Ajustes de formatação, layout, CSS ou tokens visuais.
- `chore:` Configurações de tooling, dependências ou scripts de build.

---

## 5. Limites de Escopo (Out of Scope)
- Não adicionar backend real (Node/Express, Nest, etc.), bancos de dados externos (Postgres, Firebase, Supabase) ou bibliotecas de pagamento (Stripe, Mercado Pago).
- Não implementar sistema de autenticação de usuários (login/senha/JWT).
- Manter o foco estrito na excelência técnica da SPA React/TypeScript, arquitetura de componentes, Context API, validação e persistência local.
