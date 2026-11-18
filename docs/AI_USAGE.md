# Uso de Inteligência Artificial — Coffee Delivery

Este documento registra **como**, **onde** e **por que** a Inteligência Artificial foi usada no projeto, incluindo o processo da identidade visual, os prompts de direção de arte, as decisões tomadas em conjunto e as limitações encontradas.

O objetivo é dar transparência acadêmica: a IA foi copiloto, não substituta da revisão humana.

---

## 1. Ferramentas e formato de trabalho

- **Assistente de codificação com IA no OpenCode** — leitura do repositório, proposta de arquitetura, geração e revisão de código, escrita de testes e documentação.
- **Playwright + Chrome real** — validação do build de produção, screenshots em múltiplos breakpoints, fluxo de pagamento e responsividade.
- **@axe-core/playwright** — auditoria WCAG 2.0/2.1 A/AA integrada à suíte E2E.
- **Figma / referência visual do desafio Coffee Delivery** — direção de layout, hierarquia e paleta. O arquivo compartilhado original ficou indisponível; o layout foi construído a partir da especificação do produto e da referência pública do desafio.
- **GitHub** — versionamento do projeto.

O trabalho seguiu um ciclo curto e verificável:

```
ler especificação → propor mudança pequena → implementar → rodar tsc/lint/testes
→ validar no navegador → corrigir → documentar → sugerir commit
```

Nenhum commit foi criado automaticamente pela IA. As mensagens sugeridas seguem Conventional Commits e ficam para revisão do desenvolvedor.

---

## 2. Onde a IA foi usada

| Etapa | Participação da IA | Validação humana |
|---|---|---|
| Requisitos | Leitura e organização de RF/RN/RNF em checklist | Conferência contra o enunciado |
| Arquitetura | Context + `useReducer`, separação de tipos, serviços, guards e cálculo de entrega | Decisão final e ajustes de escopo |
| Design system | Tokens semânticos, temas claro/escuro, tipografia, espaçamento e motion | Revisão visual em screenshots |
| Marca | Logo, favicon e ilustração de sucesso vetoriais; integração dos PNGs fornecidos | Aprovação estética e ajustes |
| Componentes | Geração de componentes e CSS Modules | Revisão de props, acessibilidade e reuso |
| Formulários | Schema Zod condicional, integração RHF, ViaCEP com `AbortController` | Testes manuais e correção de corrida |
| Entrega | Geocodificação, Haversine, faixas, ETA, fallback e bloqueio | Conferência com CEPs reais e testes |
| Pagamento | Simulação de cartão/PIX/dinheiro, Luhn, parcelas e overlay | Testes de aprovação/recusa e revisão de segurança |
| Testes | 124 testes unitários, 19 E2E Playwright e auditoria axe | Execução e análise dos resultados |
| Documentação | README, specs e este relatório | Revisão de conteúdo e links |

---

## 3. Identidade visual e assets

### 3.1 Conceito de branding

**Nome:** Coffee Delivery  
**Ideia:** o café especial que chega rápido, com uma xícara/copo como símbolo e um wordmark direto.  
**Personalidade:** acolhedora, artesanal, moderna e levemente lúdica.  
**Paleta:**

- Amarelo (`#DBAC2C`) — calor, energia, entrega.
- Roxo (`#4B2995` / `#8047F8`) — sofisticação, criatividade, café especial.
- Creme (`#FAFAFA`) — aconchego e contraste suave.
- Neutros escuros (`#121214` / `#202024`) — tema noturno com alto contraste.

**Tipografia:** Baloo 2 (display, geométrica e amigável) + Roboto (corpo, legibilidade).

### 3.2 Prompt de direção de arte da logo

A marca vetorial nasceu como um exercício de direção de arte e foi posteriormente renomeada para Coffee Delivery, mantendo o símbolo da xícara:

> “Crie uma marca minimalista para uma cafeteria de cafés especiais com delivery rápido. A logo deve combinar uma xícara de café estilizada com uma aura/orbita roxa ao redor, transmitindo cuidado e energia. Paleta: amarelo #DBAC2C, roxo #4B2995 e #8047F8, fundo creme. Estilo vetorial flat, formas arredondadas, sem texto, legível em 32×32 px para favicon e em 36 px no header. Evite clichês realistas, sombras pesadas ou detalhes finos demais.”

Prompt complementar usado na primeira versão das ilustrações:

> “Crie 14 ilustrações vetoriais de cafés em um mesmo estilo flat, com xícaras e copos vistos de frente, fundo transparente, traço arredondado e uma pequena semente de café roxa como assinatura da marca. Cada bebida deve ser reconhecível pela cor, pelo tipo de copo e por um detalhe (espuma, gelo, canela, chantilly, fatia de laranja, folha de coco). Sem texto, sem pessoas, sem fundo fotográfico.”

### 3.3 O que aconteceu na prática

A geração de imagens raster foi tentada, mas o provedor retornou **saldo insuficiente**. Em vez de bloquear a entrega ou usar assets de terceiros, a primeira versão da identidade foi criada em **SVG original**, desenhada por código e refinada com a IA:

- `src/assets/logo.svg` — xícara com aura orbital, usada no header e no footer.
- `public/favicon.svg` — versão simplificada para 16–32 px.
- `src/assets/success-illustration.svg` — café confirmado com selo e pino de entrega.

Na etapa final, o desenvolvedor forneceu **PNGs do hero e dos 14 cafés**. A IA integrou os arquivos, ajustou recortes, sombras, tamanhos e o layout responsivo, e removeu as ilustrações antigas:

- `src/assets/Imagem.png` — hero com copo e grãos.
- `src/assets/{expresso,americano,cremoso,gelado,cefecomleite,latte,capuccino,macchiato,mocaccino,chocolateq,cubano,irlandes,arabe,havaiano}.png` — fotos dos 14 cafés.
- Os SVGs em `public/images/coffees/` e o gerador `scripts/generate-coffee-art.mjs` foram removidos por ficarem órfãos.

### 3.4 Refinamento visual com evidências

A aplicação foi revisada em navegador real, não só no código. Quatro problemas foram encontrados e corrigidos:

1. **Crash no checkout** — `paymentError?.method === paymentMethod` acessava `.message` quando ambos eram nulos. Corrigido para `paymentError && paymentError.method === paymentMethod`.
2. **Faixa de frete errada na borda** — a taxa usava a distância arredondada, então 1,504 km caía na faixa de R$ 3,50. A classificação passou a usar a distância bruta; só a exibição arredonda.
3. **Toast quebrando no mobile** — o aviso de demonstração do cartão era um flex com três nós de texto. Virou fluxo inline com `white-space: nowrap` no código.
4. **Assets órfãos** — hero e cards ainda apontavam para os SVGs antigos. A migração para PNG foi concluída e os arquivos antigos removidos.

Screenshots finais ficam em [`docs/screenshots/`](screenshots/) e são usados no README.

---

## 4. Decisões técnicas influenciadas pela IA

### 4.1 CSS Modules em vez de Tailwind

A TECH_SPEC inicial citava Tailwind, mas o scaffold não o possuía. A IA propôs CSS Modules + variáveis CSS semânticas, o que:

- evita uma dependência extra e configuração de build;
- permite dois temas com troca instantânea via `data-theme`;
- mantém o CSS escopado por componente;
- reduz o custo de runtime.

A decisão foi aceita e registrada na TECH_SPEC.

### 4.2 `sessionStorage` para o último pedido

O carrinho precisa sobreviver a fechar e reabrir o navegador (`localStorage`). Já o último pedido deve durar apenas a sessão de compra. A IA propôs `sessionStorage` para o snapshot, com validação por guard na leitura. Isso evita que um pedido antigo reapareça dias depois em `/success`.

### 4.3 Guards em vez de `as` / `any`

Como o `localStorage` é entrada não confiável, a IA propôs guards explícitos (`isCartState`, `isOrder`, `isTheme`) e leitura tipada. O carrinho é reidratado contra o catálogo atual: itens removidos ou com preço antigo são descartados/atualizados. O guard do pedido também valida a cotação de entrega e o pagamento.

### 4.4 ViaCEP com corrida controlada

O hook `useViaCep` usa `AbortController` e ignora respostas de requisições antigas. A IA identificou o risco de o usuário digitar um CEP, apagar e digitar outro enquanto a primeira resposta chega. O comportamento final:

- consulta automática ao completar 8 dígitos;
- botão manual para repetir;
- erro de CEP ou de rede não bloqueia o preenchimento manual;
- foco vai para “Número” após sucesso.

O mesmo cuidado foi aplicado à geocodificação: a última requisição vence e respostas antigas não sobrescrevem a cotação atual.

### 4.5 Entrega estimada, não rota real

A IA propôs uma distância em linha reta (Haversine) multiplicada por um fator viário de 1,25, com velocidade média de 24 km/h. É uma **estimativa transparente**, adequada ao escopo acadêmico e sem dependência de um serviço pago de roteamento. O limite de 12 km evita cobrar a faixa máxima para endereços inviáveis.

### 4.6 Pagamento simulado com dados mínimos

Para concluir o fluxo sem gateway, a IA propôs uma simulação local determinística:

- Luhn, validade e CVV validados no schema;
- cartões `0002` recusados para testar o caminho de erro;
- PIX com QR Code local e payload explicitamente marcado como demonstração;
- persistência apenas de bandeira, últimos 4 dígitos e parcelas.

A decisão foi revisada quanto a segurança: nenhum número completo, CVV ou dado pessoal é gravado.

### 4.7 Fidelidade ao Figma: foco amarelo, base-label, CTA e auditoria

Com os quadros oficiais de estilo e o próprio arquivo do Figma em mãos (18/11/2026), a fidelidade visual foi aplicada em três lotes após auditoria dos frames (Home, Checkout, Checkout Filled, Success, desktop, tema claro):

**Lote 1 (tokens e componentes)**

- **Input ativo com borda `#C47F17`** (`--input-focus`), como no quadro "Input Text — ACTIVE" do style board — inputs e selects deixaram de usar anel roxo; o foco de teclado global (`--focus-ring`) permanece roxo para a11y.
- **`--text-label` passou para `#8D8686`** ("base-label" oficial), por decisão explícita do desenvolvedor em prol da fidelidade visual máxima. Esse tom reprova WCAG AA para texto pequeno (3,05–3,57:1). A suíte `e2e/a11y.spec.ts` isola exatamente essa cor na regra `color-contrast`.

**Lote 2 (deltas dos frames, pedidos de "exatamente como no Figma")**

- **Logo em duas linhas** ("Coffee" bold escuro / "Delivery" cinza) com o copo roxo — como nos frames; nome acessível mantido via texto visível com espaço (fix do `label-content-name-mismatch`).
- **Badge do carrinho** de roxo para amarelo (`#DBAC2C`) com texto escuro, e botão do carrinho em squircle (raio < 100%).
- **Location pill** com `Porto Alegre, RS` (mesmo visual de pílula roxa).
- **Hero**: subtítulo exato do Figma, remoção do pill "CAFÉ ESPECIAL, TODOS OS DIAS", ícones e textos no estilo do frame (cartões com ícone branco em círculo sólido, texto de uma linha: "Compra simples e segura", "Embalagem mantêm o café intacto", "Entrega rápida e rastreada", "O café chega fresquinho até você").
- **CTA amarelo com rótulo branco** (`#FFFFFF` sobre `#DBAC2C`, 2,1:1), o mesmo par do botão primário do style board — amplia a suíte a11y para isençar também esse par exato, além de `#8D8686`.
- **Título "Uhu! Pedido confirmado"** em `--yellow-dark` (`#C47F17`) para passar AA de texto grande (o `#DBAC2C` literal reprovava até 3:1).
- **Glow roxo sutil nas bordas laterais** das páginas Checkout e Success (`.edge-glow`, decorativo).
- Remoção dos eyebrows "Checkout" e "Pedido confirmado" (não existem nos frames).
- Os filtros de categoria da Home **permanecem** apesar de não aparecerem no frame — requisito do PRD (RF-01) que a fidelidade não pode sacrificar.

**Lote 3 (auditoria final de cards e fundo)**

- **Home chapada em `#FAFAFA`**: o gradiente areia de página inteira foi removido; o único efeito é um halo creme/lavanda local atrás da ilustração do hero (pico medido ≈ `#F1EBDD`).
- **Cards fiéis ao frame**: fundo `base-card` `#F3F2F2`, raio `6px 36px`, sem borda, sombra, círculo bege, anel tracejado, fade ou gradiente atrás da foto; hover sem levantar/rotacionar. A foto fica em 112px porque os PNGs do projeto preenchem o quadro (o asset original tem padding transparente).
- **Rodapé do card**: quantidade 72×38px chapada em `base-button` `#E6E5E5` (ícones `#8047F8`) e botão do carrinho 38×38px com raio 8px.
- **Hero**: título 48px em duas linhas e subtítulo 16px, como no frame; header transparente no topo, com vidro fosco apenas ao rolar.
- **Tag**: fundo `#F1E9C9` e texto `#8A5A0C` em vez do `#C47F17` literal, mantendo contraste AA no texto de 10px (adaptação documentada).

**Lote 4 (efeitos em Tailwind CSS)**

- Instalado **Tailwind CSS 4** com `@tailwindcss/vite`; o projeto continua usando CSS Modules para layout, cores, tipografia e temas.
- Um bloco `@theme` em `src/styles/index.css` centraliza apenas tokens de efeito: `--animate-*`, `--ease-fluid`, `--shadow-elev-*` e `--color-brand-*`.
- Cada módulo que tem efeito passou a usar `@reference ../../styles/index.css` e `@apply` para transições, hover, active, sombras e animações. Os keyframes (`fade-up`, `pop`, `fade-in`, `toast-in`, `spin`, `confetti-fall`) saíram dos módulos e vivem no `@theme`.
- A intenção foi **trocar a implementação dos efeitos, não o visual**: os 19 testes E2E, os 124 testes unitários e as capturas foram revalidadas após a migração.

**Lote 5 (glow e brilho — decisão do desenvolvedor 18/11/2026)**

- Pedido explícito de **glow/brilho na interface**, aplicado ao hero e aos botões (escopo escolhido para não alterar os cards auditados).
- Hero: halo quente/lavanda local reforçado e com animação `glow-breathe` (8 s), além de um `drop-shadow` âmbar suave atrás da ilustração.
- Botões: tokens `--shadow-glow-purple`, `--shadow-glow-gold` e `--shadow-glow-soft` no `@theme`; glow no hover do carrinho, do botão de adicionar, do filtro ativo e das CTAs amarelas.
- Brilho: sweep diagonal `shine` (900 ms) nas CTAs primárias (checkout, sucesso e estados vazios), via `::after` e `@apply animate-shine`.
- `prefers-reduced-motion` continua neutralizando todas as animações. Este lote é uma adaptação documentada: o frame do Figma não traz glow nos botões.

A auditoria foi feita **no próprio Figma view-only dentro do browser**, com zoom no canvas por rueda sintética — o MCP oficial do Figma não ficou disponível na sessão (o bloco `mcpServers` precisava virar `mcp.remote` no `opencode.json` e a sessão exigiria reabrir para os tools aparecerem; a URL fornecida abre em modo de visualização pública). As telas de Dark Mode e mobile do Figma não existem no arquivo — o dark mode segue a adaptação do projeto.

Reversões conhecidas: trocar `--text-label` e a cor do CTA; remover os filtros do helper de a11y; reaplicar o gradiente areia de página inteira ou o anel tracejado nos cards; nenhuma mudança estrutural.

---

## 5. Como a qualidade foi verificada

| Verificação | Resultado |
|---|---|
| `npx tsc -b` | Sem erros (strict) |
| `npm run lint` | 2 avisos conhecidos, sem erros |
| `npm run test:run` | **124 testes** aprovados (11 arquivos) |
| `npm run test:e2e` | **19/19** testes Playwright |
| axe-core | **0 violações** WCAG 2.0/2.1 A/AA nas três telas — duas exceções únicas e documentadas (fidelidade ao Figma): `#8D8686` (`--text-label`) e o par `#FFFFFF`/`#DBAC2C` (CTA), ambos isolados na regra `color-contrast` por decisão do desenvolvedor |
| `npm run build` | Build de produção OK (alerta de chunk > 500 kB) |
| Responsividade | 320, 375, 768 e 1280 sem overflow |
| Fluxo real ViaCEP | CEP `90020008` → Rua dos Andradas; `01310100` → fora da área |
| Screenshots | 8 capturas em `docs/screenshots/` |

O E2E cobriu, entre outros: persistência do carrinho, tema, toasts, validação vazia, foco no primeiro erro, máscara de CEP, cartão aprovado/recusado, PIX, dinheiro com troco, endereço fora da área, sucesso, snapshot, limpeza do carrinho e acesso direto a `/success`.

Os 2 avisos de lint são:

- leitura de ref durante o render no `Checkout` (usada para o `AbortController`);
- `setState` síncrono em efeito no `AddressForm` ao sincronizar o estado da entrega.

Ambos estão documentados no README como débito técnico consciente; não afetam o comportamento validado.

---

## 6. Limitações e transparência

- **Geração de imagens raster indisponível** — o provedor retornou saldo insuficiente. Os PNGs finais do hero e dos cafés foram fornecidos pelo desenvolvedor; a IA não os gerou. Nenhuma imagem de terceiros foi copiada.
- **Protótipo do Figma indisponível** — o link compartilhado retornou “não foi possível localizar este item”. O layout seguiu a especificação do produto e a referência pública do desafio Coffee Delivery.
- **Entrega estimada** — distância em linha reta com fator viário e velocidade média; não há trânsito, rotas reais ou GPS.
- **Geocodificação pública** — depende da disponibilidade de BrasilAPI e Nominatim; há timeout e fallback por cidade.
- **Pagamento fictício** — não há gateway, cobrança ou backend. A aprovação é local e determinística.
- **Sem autenticação** — não há login, perfil ou histórico de pedidos entre sessões.
- **Dados de catálogo estáticos** — os 14 cafés vivem em `src/data/coffees.ts`.
- **IA não commitou** — todas as alterações ficaram na working tree para revisão e commits semânticos do desenvolvedor.
- **Vulnerabilidades de dev** — `npm audit --omit=dev` retorna 0 vulnerabilidades. O relatório completo acusa advisories em dependências transitivas de ferramentas de build (`picomatch`/`fdir` via Vite/Vitest); a correção sugerida downgrada o Vite e não foi aplicada.

---

## 7. O que a IA não substituiu

- Julgamento de escopo: o que entra e o que fica fora da entrega.
- Revisão crítica de cada trecho gerado.
- Decisão estética final da marca e dos assets.
- Validação manual da experiência em navegador.
- Commits, publicação e apresentação do projeto.

A IA acelerou a execução; a responsabilidade pelo resultado continua sendo humana.

---

## 8. Prompts de exemplo usados no desenvolvimento

Além dos prompts de arte, a IA foi instruída com pedidos como:

> “Leia `docs/PRD_SPEC.md`, `docs/TECH_SPEC.md` e `docs/TASKS_SPEC.md`. Implemente apenas a próxima tarefa, sem alterar a aplicação inteira. Rode `tsc`, lint e testes antes de sugerir o commit.”

> “Revise o fluxo de checkout: valide CEP, campos obrigatórios e pagamento; garanta foco no primeiro erro, mensagens acessíveis e nenhuma chamada duplicada ao ViaCEP.”

> “Calcule a entrega a partir da distância real entre a cafeteria e o endereço. Use coordenadas públicas com fallback, faixas de taxa, janela de previsão e bloqueio acima de 12 km. Nada de número mágico.”

> “Implemente o pagamento simulado de ponta a ponta: cartão com Luhn/validade/CVV/parcelas, PIX com QR Code e dinheiro com troco. Não persista número completo nem CVV.”

> “Valide o layout em 320, 375, 768 e 1280 px nos temas claro e escuro. Verifique overflow horizontal, alvos de toque, contraste e foco de teclado. Corrija o que encontrar.”

> “Escreva testes unitários para reducer, totais, formatação, CEP, schema, storage, guards, cartão, pagamento, geolocalização e faixas de entrega. Nada de testes vazios ou `it.todo`.”

> “Configure Playwright com Chrome real, build de produção e mocks de ViaCEP/BrasilAPI/Nominatim. Cubra os quatro pagamentos, recusa de cartão, fora da área, responsividade e axe.”

Esses pedidos refletem o método de trabalho: **escopo pequeno, verificação objetiva e documentação da decisão**.
