# Arquitetura

Este documento cobre:

- as camadas da aplicação e o carregamento inicial;
- os contratos REST e os eventos Socket.IO;
- sessão, carrinho, checkout e pedidos;
- cache e reconciliação entre REST e tempo real;
- os mocks e suas limitações;
- acessibilidade, decisões de UX, desvios do Figma e limitações conhecidas.

Setup, cenários e reprodução das falhas estão no [README](README.md).

## 1. Visão geral

```
UI (routes/, features/*/components)
  │  hooks de query/mutation (features/*/queries.ts)
  ▼
TanStack Query ── chaves em app/query-keys.ts
  │
  ▼
api/endpoints/* ── request(schema, config) valida a resposta com zod
  │
  ▼
Axios (api/http.ts) ── Bearer, X-Cart-Id, 401 → fim de sessão, gate de transporte
  │                                  │
  ▼                                  ▼
MSW (service worker)            socket.io-client (realtime/client.ts)
  │                                  │
  └────── mocks/handlers ◄── banco do mock (localStorage) ──► mocks/realtime/server.ts
```

**Contratos únicos.** Os contratos zod em `src/api/contracts` são usados pelo cliente, para validar respostas e formulários, e pelos handlers MSW, para validar requisições e montar respostas. Assim, cliente e simulação não divergem.

**Mocks só na camada de rede.** Componentes, hooks e o cliente Axios não têm respostas fictícias nem atalhos de negócio. Se os mocks forem desligados, o mesmo código fala com uma API real que siga os contratos.

**Carregamento inicial (`src/main.tsx`):**

1. Os parâmetros `?scenario`/`?mockReset` são lidos e removidos da URL de forma síncrona.
2. O import do app e a inicialização do MSW começam em paralelo.
3. O app renderiza quando os dois terminam.

Duas garantias protegem esse processo:

- `api/transport.ts` mantém uma promise que o Axios aguarda antes de cada requisição, então nenhuma chamada sai antes do MSW estar ativo.
- O cliente Socket.IO e o painel de cenários só carregam depois disso. O `engine.io-client` captura `globalThis.WebSocket` quando o módulo é avaliado, então precisa vir depois de o MSW instalar a interceptação de WebSocket.

## 2. Contratos REST

Base: `VITE_API_BASE_URL` (padrão `/api`). Os corpos são JSON e os valores em ETH trafegam como string decimal; os cálculos usam `big.js`.

### Envelope de erro

```json
{
  "error": {
    "code": "AVAILABILITY_CONFLICT",
    "message": "…",
    "fieldErrors": { "campo": "…" },
    "details": {}
  }
}
```

| Código                                | HTTP        | Uso                                                                                      |
| ------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `VALIDATION_ERROR`                    | 400/413/422 | Corpo inválido; `fieldErrors` aponta os campos                                           |
| `UNAUTHENTICATED` / `SESSION_EXPIRED` | 401         | Sem token ou token expirado                                                              |
| `FORBIDDEN`                           | 403         | Recurso de outro usuário (ex.: pedido)                                                   |
| `NOT_FOUND`                           | 404         | NFT, item, pedido ou carteira inexistente                                                |
| `CONFLICT`                            | 409         | Cadastro duplicado, versão desatualizada, carteira desconectada (`details.reason`)       |
| `AVAILABILITY_CONFLICT`               | 409         | Quantidade acima do estoque ou do limite por pedido; `details.quote` traz a cotação nova |
| `QUOTE_CHANGED`                       | 409         | Cotação diverge no envio do pedido; `details.quote` traz a cotação nova                  |
| `IDEMPOTENCY_CONFLICT`                | 409         | Mesma chave com outro conteúdo                                                           |
| `COUPON_INVALID` / `COUPON_EXPIRED`   | 422         | Cupom                                                                                    |
| `WALLET_REJECTED`                     | 403         | Carteira recusou a conexão                                                               |
| `SERVICE_UNAVAILABLE` / `INTERNAL`    | 503/500     | Falhas transitórias (com retry)                                                          |

O cliente converte tudo em `ApiError` (`api/errors.ts`) com `kind` (`http`, `network`, `timeout`, `canceled`, `contract`), `isTransient` e `isAuthError`. Uma resposta que não bate com o contrato vira erro `contract`, em vez de chegar à interface.

### Recursos

| Recurso   | Método e caminho                                             | Observações                                                                                                                                                                                                                        |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sessão    | `POST /auth/register`                                        | `{ username, email, password }` → `Session` (`token`, `expiresAt`, `user`). Conflito de e-mail ou usuário em `fieldErrors`                                                                                                         |
|           | `POST /auth/login`                                           | `{ email, password }` → `Session`                                                                                                                                                                                                  |
|           | `GET /auth/session`                                          | Valida o token e devolve `Session`; 401 se expirou                                                                                                                                                                                 |
|           | `POST /auth/logout`                                          | Invalida o token                                                                                                                                                                                                                   |
| NFTs      | `GET /nfts`                                                  | `q`, `categories[]`, `networks[]`, `minPrice`, `maxPrice`, `tab` (`all`/`new`/`trending`), `sort` (`recent`/`price-asc`/`price-desc`/`popular`), `page`, `pageSize` → `{ items, page, pageSize, total, totalPages, facets }`       |
|           | `GET /nfts/featured`                                         | Destaques da home                                                                                                                                                                                                                  |
|           | `GET /nfts/:id`                                              | Detalhe com edições (`1/1`, `1/10`, `1/50`, `open`), preço, estoque e limite por pedido, galeria, atributos e `version`                                                                                                            |
|           | `GET /nfts/:id/related`                                      | Relacionados                                                                                                                                                                                                                       |
| Favoritos | `GET /favorites`                                             | `{ nftIds, items }`                                                                                                                                                                                                                |
|           | `PUT /favorites/:nftId`, `DELETE /favorites/:nftId`          | Devolvem a lista atualizada                                                                                                                                                                                                        |
| Carrinho  | `GET /cart`                                                  | Visitante identificado por `X-Cart-Id`; usuário, pelo token                                                                                                                                                                        |
|           | `POST /cart/items`                                           | `{ nftId, editionId, quantity }`; soma à linha existente; 409 acima do limite                                                                                                                                                      |
|           | `PATCH /cart/items/:itemId`                                  | `{ quantity }`                                                                                                                                                                                                                     |
|           | `DELETE /cart/items/:itemId`                                 |                                                                                                                                                                                                                                    |
|           | `PUT /cart/coupon`, `DELETE /cart/coupon`                    | `{ code }`; 422 para cupom inválido ou expirado                                                                                                                                                                                    |
|           | `POST /cart/accept-changes`                                  | Aplica preços atuais e ajusta quantidades ao estoque                                                                                                                                                                               |
|           | `POST /cart/merge`                                           | `{ guestCartId }`; une o carrinho do visitante ao do usuário no login                                                                                                                                                              |
| Cotação   | `POST /quotes`                                               | `{ network }` → `Quote` com linhas (`ok`, `price_changed`, `insufficient`, `sold_out`), subtotal, desconto, taxa de rede, total, cupom, `purchasable`, `cartVersion` e validade de 5 min                                           |
| Pedidos   | `POST /orders`                                               | Cabeçalho `Idempotency-Key`. Corpo: `{ quoteId, walletConnectionId, expectedTotalEth, lines, collector }`. 201 ao criar, 200 ao repetir a mesma chave e conteúdo, 409 `IDEMPOTENCY_CONFLICT` para a mesma chave com outro conteúdo |
|           | `GET /orders?status=pending`                                 | Pedidos em andamento do usuário                                                                                                                                                                                                    |
|           | `GET /orders/:id`                                            | Estado e recibo (`pending` → `confirmed` ou `rejected`, ambos terminais)                                                                                                                                                           |
| Perfil    | `GET /profile`, `PATCH /profile`                             | `PATCH` exige `version`; 409 se o perfil mudou em outra sessão                                                                                                                                                                     |
|           | `PUT /profile/avatar`, `DELETE /profile/avatar`              | `{ dataUrl }` PNG, JPEG ou WebP de até 1 MB                                                                                                                                                                                        |
|           | `POST /profile/password`                                     | `{ currentPassword, newPassword }`                                                                                                                                                                                                 |
| Carteiras | `GET /wallets`, `POST /wallets`, `PUT /wallets/:id`          | Posições `primary` e `secondary`; `PUT` exige `version`; endereço duplicado → 409 com `fieldErrors.address`                                                                                                                        |
|           | `POST /wallet-connections`, `DELETE /wallet-connections/:id` | Conecta uma carteira salva numa rede; pode ser recusada (`WALLET_REJECTED`)                                                                                                                                                        |

## 3. Eventos Socket.IO

Transporte: `socket.io-client` em `VITE_SOCKET_URL`, apenas WebSocket. O token vai em `auth` no pacote `CONNECT` e é relido a cada reconexão.

```ts
type NftUpdated = {
  id: string // identidade estável do evento (evt_000123)
  type: 'nft.updated'
  resource: { type: 'nft'; id: string }
  version: number // versão do NFT após a mudança
  occurredAt: string
  data: { priceEth: string; available: number; editions: { id; priceEth; available }[] }
}

type OrderUpdated = {
  id: string
  type: 'order.updated'
  resource: { type: 'order'; id: string }
  userId: string
  version: number
  occurredAt: string
  data: {
    status: 'pending' | 'confirmed' | 'rejected'
    txHash
    explorerUrl
    rejectionReason
    settledAt
  }
}
```

- `nft.updated` vai para todas as conexões.
- `order.updated` só vai para as conexões autenticadas como o dono do pedido. O cliente também descarta eventos de outro `userId`.
- Toda mudança no banco do mock que afeta preço, estoque ou pedido passa pelo mesmo caminho: a resposta REST e o evento saem da mesma operação.

## 4. Sessão

- **Token:** opaco, guardado no `localStorage` (`kurio.session.token`) e exposto por um store externo (`features/auth/session-store.ts`) lido com `useSyncExternalStore`.
- **Validade:** 30 minutos a partir do login, sem renovação deslizante.
- **Consulta da sessão:** `GET /auth/session` com `staleTime` de 60 s. Rotas privadas (`/checkout`, `/orders/:id`, `/profile`, `/wallets`, `/favorites`) chamam `requireSession` no `beforeLoad`.
- **Sem sessão:** a pessoa vai para `/login?redirect=<rota>&reason=required|expired` e volta à rota depois de entrar. O redirect só aceita caminhos internos.
- **401 com token enviado:** o interceptor do Axios encerra a sessão com motivo `expired`. O `SessionWatcher` decide:
  - em rota privada, redireciona para o login com o aviso;
  - em rota pública, mostra uma notificação com "Entrar".
- **Rascunho do checkout:** fica no `sessionStorage`, então o formulário volta preenchido depois de entrar de novo.
- **Logout e troca de usuário:**
  - `clearPrivateData` remove do cache tudo que está sob `['user', …]`, `['session', …]` e `['cart', …]`;
  - o socket reconecta com o novo token;
  - as chaves privadas são escopadas por `userId`, então nenhum dado de um usuário é reaproveitado por outro.
- **Abas:** um evento `storage` sincroniza login e logout entre abas.

## 5. Estado do carrinho

- **Fonte da verdade:** o servidor. O cliente guarda só o identificador do carrinho do visitante (`kurio.cart.guest`), enviado em `X-Cart-Id`.
- **Chave de cache:** `['cart', 'user:<id>' | 'guest:<id>']`. A cotação fica abaixo dela: `['cart', owner, 'quote', cartVersion, network]`.
- **Versão:** o carrinho tem `version`. A cotação é pedida por versão, então qualquer mudança no carrinho gera uma cotação nova sem invalidação manual.
- **Mutations:**
  - rodam em série (`scope: { id: 'cart' }`), sem corrida entre cliques;
  - a alteração de quantidade é otimista, com rollback se o servidor recusar (ex.: estoque);
  - a remoção oferece "Desfazer", que adiciona o item de novo.
- **Login:** o carrinho do visitante é unido ao da conta (`POST /cart/merge`), respeitando estoque e limite por pedido. O identificador do visitante é descartado depois.
- **Mudanças de preço ou estoque:** a cotação marca as linhas afetadas e `purchasable: false`. A interface mostra "Seu carrinho mudou" e bloqueia a finalização até "Atualizar carrinho" (`POST /cart/accept-changes`).
- **Compra confirmada:** o servidor remove do carrinho apenas as quantidades compradas.

## 6. Checkout e pedidos

1. **Formulário:** "Perfil do colecionador" (react-hook-form e zod), preenchido com a carteira salva e o perfil. O rascunho fica no `sessionStorage` por usuário.
2. **"Confirmar compra":**
   - resolve a carteira: usa a salva, ou cria uma na primeira posição livre;
   - conecta na rede escolhida (`POST /wallet-connections`);
   - pede uma cotação nova, ignorando o cache.
3. **Revisão (diálogo):** mostra linhas, totais, carteira, rede e colecionador.
   - Se o total mudou desde a última exibição, avisa.
   - Se há linhas alteradas, oferece "Aceitar novos valores", que aceita as mudanças e pede outra cotação.
4. **"Confirmar e assinar":** envia `POST /orders` com uma `Idempotency-Key`.
   - A chave fica no `sessionStorage` junto com a impressão digital do corpo. A mesma tentativa, mesmo após refresh, timeout ou clique repetido, reaproveita a mesma chave e recupera o mesmo pedido.
   - Uma tentativa com outro conteúdo gera uma chave nova.

**Erros no envio:**

| Erro                                 | Comportamento                                                      |
| ------------------------------------ | ------------------------------------------------------------------ |
| `QUOTE_CHANGED`                      | A revisão é atualizada com `details.quote` e pede nova confirmação |
| `AVAILABILITY_CONFLICT`              | A revisão fecha e aparece um aviso com link para o carrinho        |
| `CONFLICT` com `WALLET_DISCONNECTED` | A conexão é descartada e o próximo "Confirmar compra" reconecta    |
| Timeout, erro de rede ou 5xx         | Estado incerto: "Tentar novamente" reenvia com a mesma chave       |

**Recibo (`/orders/:id`):**

- Só mostra a confirmação quando o pedido está `confirmed`. Enquanto está `pending`, mostra "Processando pagamento".
- A atualização chega pelo socket. A consulta periódica é o fallback: a cada 1,5 s sem socket e a cada 10 s com o socket conectado.
- No `/checkout`, um aviso leva a um pedido em andamento (`GET /orders?status=pending`), inclusive depois de recarregar a página.
- Durante o envio, a tela de pagamento mantém o último carrinho com itens. Assim, um pedido confirmado pelo servidor enquanto a resposta ainda não chegou não derruba o diálogo de recuperação.

## 7. Cache, retries e sincronização

| Política           | Valor                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staleTime` padrão | 30 s; sessão 60 s; destaques e relacionados 5 min; cotação 30 s                                                                                     |
| `gcTime`           | 5 min                                                                                                                                               |
| Retry de queries   | Só erros transitórios (rede, timeout, 5xx, 429), no máximo 2 vezes, com backoff exponencial (0,5 s e depois 1 s; teto de 4 s)                       |
| Retry de mutations | Nunca automático; a recuperação é explícita, como no pedido idempotente                                                                             |
| Revalidação        | Ao focar a janela e ao reconectar a rede                                                                                                            |
| Cancelamento       | O `signal` do Query é repassado ao Axios; respostas de buscas antigas não chegam à interface                                                        |
| Listagem           | `placeholderData: keepPreviousData`, filtros e paginação sem piscar; o estado vive na URL (`validateSearch` com zod; arrays serializados como JSON) |
| Pré-carregamento   | Loaders das rotas e `defaultPreload: 'intent'`                                                                                                      |
| Otimista           | Favoritos e quantidade do carrinho (`onMutate`, rollback em `onError`, invalidação em `onSettled`)                                                  |

## 8. Reconciliação entre REST e Socket.IO

O bridge (`realtime/realtime-bridge.tsx`) é montado na raiz e liberado ao desmontar: remove os listeners e desconecta.

**1. Validação e deduplicação.** Cada evento é validado com zod e passa por um registro (`createEventLedger`):

- um `id` já visto é descartado;
- uma `version` menor ou igual à última aplicada para o mesmo recurso também é descartada.

**2. Aplicação idempotente.** O evento só é aplicado se for mais novo que o dado em cache (`version` do cache), o que cobre o caso em que o REST trouxe uma versão mais nova antes do evento.

**3. `nft.updated` atualiza com `setQueryData`:**

- o detalhe, incluindo as edições;
- as listagens, destaques e relacionados;
- a lista de favoritos.

Se o NFT está no carrinho, o carrinho é invalidado; a cotação nova marca a mudança e o checkout bloqueia a confirmação.

**4. `order.updated`** só é aplicado ao pedido do usuário atual. Atualiza o pedido em cache, invalida os pedidos em andamento e, quando o pedido termina, invalida também o carrinho.

**5. Anúncios.** As mudanças relevantes são anunciadas numa região `aria-live`.

**6. Reconexão.** Ao reconectar, depois da primeira conexão, as queries ativas de NFTs, carrinho e pedidos são invalidadas e recarregadas pelo REST. Isso cobre os eventos perdidos durante a queda. Se a conexão fica fora por mais de 4 s, aparece o aviso "Atualizações em tempo real pausadas. Reconectando…".

**7. Troca de sessão.** Quando o token muda, o socket reconecta com o novo token e o servidor passa a enviar os eventos de pedido do novo usuário.

## 9. Mocks

- **Banco:** fica no `localStorage` (`kurio.mock.db`, com versão de schema). Sobrevive a refresh e é recriado a partir das fixtures no reset.
- **Fixtures:**
  - 72 NFTs: 9 do Figma, com nomes e preços exatos, e 63 gerados com semente fixa (mulberry32);
  - 9 categorias e 3 redes;
  - 2 usuários com senha guardada como hash SHA-256 com salt;
  - cupons válido, válido e expirado.
- **Determinismo:** a data base é fixa (`2026-07-29`) e as latências derivam de hash do método, caminho e sequência.
- **`withNetwork`:** aplica a latência do cenário, o modo offline (`HttpResponse.error()`) e as regras de falha por rota (com limite de repetições, como em `flaky-catalog`) antes de chegar ao handler.
- **Liquidação de pedidos:** por timer (2,5 s no cenário padrão), retomado depois de recarregar, ou manual pelo painel em `payment-pending`.
- **Painel:** o painel "Cenários" e `window.__kurioMocks` usam o mesmo controle (`mocks/control.ts`), também usado pelos testes.

### Transporte Socket.IO e limitações

- O servidor usa `ws.link(VITE_SOCKET_URL)` do MSW com `@mswjs/socket.io-binding`. O link é registrado na origem: o MSW remove o prefixo `/socket.io/` antes de comparar.
- Só o transporte WebSocket é simulado (`transports: ['websocket']`); long-polling não é suportado pelo binding.
- O binding não implementa o handshake completo do engine.io. O servidor lê o pacote `CONNECT` (`40{…}`) para extrair o token e envia o ping do engine.io (`2`) a cada 20 s, para o cliente não encerrar por falta de heartbeat.
- Não há rooms nem acks. A segmentação por usuário é feita no servidor simulado, pelo `userId` de cada conexão.
- O "servidor" roda na mesma aba do cliente, dentro do processo do MSW:
  - o estado é por navegador, não compartilhado entre dispositivos ou pessoas;
  - abas diferentes têm sockets independentes, mas compartilham o banco pelo `localStorage`.
- Fechar a conexão de forma síncrona dentro do handler de conexão impedia o cliente de perceber a recusa. Agora a recusa é adiada para o próximo ciclo. O cliente também usa um timeout de conexão de 5 s, para não depender do timeout padrão de 20 s.

## 10. Acessibilidade

**Navegação e foco:**

- Link "Pular para o conteúdo" e foco visível em todos os controles.
- Diálogos e sheets do Radix prendem o foco, fecham com Escape e devolvem o foco ao gatilho.

**Formulários:**

- Labels associados, `aria-invalid` e `aria-describedby` nos erros.
- Foco no primeiro campo inválido.
- Asterisco visual com texto "(obrigatório)" para leitores de tela.

**Controles nativos e estados:**

- Elementos nativos onde há equivalente: `fieldset`/`legend`, `output`, `search`, checkboxes e radios reais.
- Botões de alternância com nome fixo e `aria-pressed`.

**Anúncios e outros:**

- Regiões `aria-live` para resultados da busca, mudanças em tempo real, quantidade e status.
- `prefers-reduced-motion` desliga animações e o shimmer.
- Contraste conforme os tokens do Figma.

A auditoria Lighthouse dá 100 em Accessibility nas quatro combinações.

## 11. Performance

O detalhe das medições, as causas e as alternativas testadas estão em [lighthouse/README.md](lighthouse/README.md). Em resumo:

- **Metas atingidas** nas quatro combinações, tanto na produção quanto no build local: Performance ≥ 90 e Accessibility, Best Practices e SEO em 100.
- **O protocolo pesa no mobile.** O Lighthouse simula a rede a partir das requisições observadas. Em HTTP/1.1 (`vite preview` padrão), os ~25 chunks disputam 6 conexões, e a Performance mobile caía para 72–75. Por isso a auditoria local serve o build em HTTPS/HTTP2, como a Vercel.

O que está aplicado:

- code splitting por rota;
- boot shell estático no `index.html` (logo e skeletons), pintado antes do JavaScript enquanto o MSW inicia;
- resolvedor mínimo de domínio no lugar do `tldts`, a lista de sufixos públicos que o MSW carrega via `tough-cookie` (ver Limitações);
- imagens WebP com `srcset`, dimensões fixas e `fetchpriority`;
- fonte variável self-hosted com `font-display: swap`;
- skeletons com as dimensões finais;
- altura mínima na área principal, para evitar layout shift.

## 12. Decisões de UX e desvios do Figma

O Figma original não é editável pelo MCP; a referência usada foi uma cópia nos rascunhos do autor. Os frames sem versão mobile seguem o mesmo sistema visual.

**Identidade e conteúdo**

- A marca segue o Figma ("KURIO"). Os 72 NFTs reaproveitam as 4 artes do Figma em tamanhos 160, 320 e 640 px.
- Login com Google/Facebook, "Esqueceu a senha?", blog, promoções, "Criadores", "Aprenda" e alguns itens do rodapé e da conta (Atividade, Ofertas, Arquivos baixados, Suporte) estão fora do escopo. Aparecem como "em breve", desabilitados, sem simular sucesso.
- No detalhe, os textos de "Contrato" e "Direitos autorais" estavam trocados no Figma; cada um foi usado com o conteúdo correspondente.
- O cadastro segue o Figma (usuário, e-mail, senha e confirmação). O nome de exibição começa igual ao usuário e é editável no perfil.

**Navegação e layout**

- No desktop, a busca do catálogo é um campo dentro da seção; o ícone de busca do header leva até ele.
- Login e cadastro são diálogos sobre a home no desktop e telas cheias no mobile, com rotas próprias (`/login`, `/register`).
- O recibo é um diálogo no desktop e uma tela no mobile, como no Figma.
- Detalhe, carrinho, pagamento e pedido usam o "chrome mínimo" do mobile (sem header, tab bar nem rodapé), como nos frames mobile.
- Perfil, Carteiras e Lista de interesse compartilham a barra lateral "Meu perfil". No mobile ela vira abas com rolagem horizontal, porque não há frame.
- O header mantém "Início" ativo nas telas de conta, como no Figma.

**Carrinho e checkout**

- No carrinho mobile, a lixeira fica no canto do card; no Figma ela se sobrepõe ao botão "+".
- No desktop do pagamento, foram adicionados os cards de carteira salva do frame mobile. "Usar outra carteira?" limpa os campos para outro endereço, que é salvo na primeira posição livre ao confirmar.
- O frame mobile do pagamento não tem o formulário do colecionador. Ele fica num bloco recolhível que abre sozinho quando falta algum dado ou há erro.
- "Tipo de carteira" (select do formulário) e "Carteira e rede" (cartões) controlam o mesmo campo, porque ambos estão no Figma.
- A etapa de revisão (diálogo) não está no Figma. Foi adicionada para exibir a cotação revalidada antes de assinar e para os fluxos de preço alterado e de recuperação.
- "Ver no Etherscan" aponta para um explorador simulado e avisa isso para leitores de tela.

**Formulários e outros**

- No perfil, um único "Salvar", como no Figma, salva os dados e também a senha quando os campos de senha estão preenchidos.
- O botão "Favoritar" mantém o mesmo texto e indica o estado com `aria-pressed` e o ícone preenchido.
- A edição escolhida no detalhe vai para a URL desde a abertura. Assim, uma mudança de preço em tempo real não troca a edição que a pessoa está vendo.

**Ferramentas**

- O lint usa oxlint em vez de ESLint, por velocidade e porque já cobre as regras de React, hooks e acessibilidade (`jsx-a11y`) usadas aqui.

## 13. Limitações conhecidas

- **Simulação no navegador:** não há backend; dados e eventos são simulados no navegador de cada pessoa. Duas pessoas no site publicado não veem as ações uma da outra.
- **Token no `localStorage`:** com uma API real, a sessão deveria usar cookie `httpOnly`. Aqui o token é exposto a XSS por ser uma simulação.
- **Carteiras simuladas:** conexão e assinatura não usam Web3. O hash da transação e o link do explorador são fictícios.
- **Cookies no MSW:** o `tldts` (lista de sufixos públicos usada pelo `tough-cookie`, dependência do MSW) é substituído por alias no Vite por `src/mocks/public-suffix.ts`. O resolvedor conhece só o sufixo privado `vercel.app` e, nos demais casos, usa os dois últimos rótulos do host. A aplicação não usa cookies, então isso só afetaria cookies de domínio em sufixos compostos como `co.uk`. Com uma API real, o MSW sai do bundle e o alias deixa de existir.
- **Performance mobile** perto do limite de 90: o boot do MSW continua no caminho crítico (ver seção 11).
- **Imagens de referência:** a regressão visual foi gerada em Linux; em outro sistema operacional é preciso regenerar.
- **Rotas privadas:** não há renderização no servidor. As rotas privadas são protegidas no cliente.
