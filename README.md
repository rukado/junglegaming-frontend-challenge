# Kurio · Marketplace de NFTs

Solução do desafio descrito em [docs/CHALLENGE.md](docs/CHALLENGE.md).

Kurio é um marketplace de NFTs com:

- catálogo filtrável;
- detalhe com edições;
- favoritos;
- carrinho com cupom e cotação;
- checkout com carteira, revisão e pedido idempotente;
- perfil e carteiras;
- atualizações em tempo real via Socket.IO.

A API REST e o servidor Socket.IO são simulados por MSW na camada de rede.

- **Aplicação publicada:** https://junglegaming-frontend-challenge-kohl.vercel.app
- **Arquitetura, contratos e decisões:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Auditoria Lighthouse:** [lighthouse/README.md](lighthouse/README.md), com resultados da [produção](lighthouse/RESULTS.production.md) e do [build local](lighthouse/RESULTS.local.md)

## Stack

| Área               | Tecnologias                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| Base               | React 19, TypeScript 6 (strict) e Vite 8                                           |
| Rotas e dados      | TanStack Router (rotas por arquivo, code splitting automático) e TanStack Query v5 |
| Rede e tempo real  | Axios e `socket.io-client`                                                         |
| Mocks              | MSW 2 e `@mswjs/socket.io-binding`                                                 |
| Interface          | Tailwind CSS v4 e shadcn/ui (Radix), adaptados aos tokens do Figma                 |
| Formulários        | react-hook-form e zod, com schemas compartilhados entre cliente e mocks            |
| Testes e auditoria | Playwright e Lighthouse 13                                                         |
| Qualidade          | oxlint e Prettier                                                                  |

## Setup

Requisitos: Node 24 (`.nvmrc`; mínimo 22) e pnpm 11 (`corepack enable` usa a versão de `packageManager`).

```bash
pnpm install
cp .env.example .env
pnpm dev
```

A aplicação abre em `http://localhost:5173` com os mocks ativos. Na primeira execução do Playwright, instale o Chromium com `pnpm exec playwright install chromium`.

## Variáveis de ambiente

| Variável            | Padrão                         | Uso                                                                                                               |
| ------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `VITE_ENABLE_MOCKS` | `true`                         | Liga o MSW (REST e Socket.IO) no navegador. Também fica ligado no build publicado, que é a versão de demonstração |
| `VITE_API_BASE_URL` | `/api`                         | Base das chamadas REST do Axios                                                                                   |
| `VITE_SOCKET_URL`   | `https://realtime.kurio.local` | URL do servidor Socket.IO. Com mocks, é interceptada pelo MSW e não precisa existir                               |

As variáveis são validadas com zod em `src/env.ts`.

## Comandos

| Comando                             | O que faz                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Desenvolvimento com mocks e Devtools do TanStack                                                            |
| `pnpm build`                        | Verificação de tipos e build de produção                                                                    |
| `pnpm preview`                      | Serve o build de produção                                                                                   |
| `pnpm typecheck`                    | `tsc -b` em app, testes e scripts                                                                           |
| `pnpm lint`                         | oxlint                                                                                                      |
| `pnpm format` / `pnpm format:check` | Prettier                                                                                                    |
| `pnpm test:e2e`                     | Playwright em desktop e mobile; faz o build e sobe o `preview` automaticamente                              |
| `pnpm test:e2e:update`              | Atualiza as imagens de referência da regressão visual                                                       |
| `pnpm test:e2e:report`              | Abre o relatório HTML do Playwright                                                                         |
| `pnpm test:e2e:production`          | A mesma suíte contra a URL publicada, sem build local                                                       |
| `pnpm lighthouse`                   | Build e auditoria Lighthouse local (3 execuções por página e perfil), gerando `lighthouse/RESULTS.local.md` |
| `pnpm lighthouse:production`        | Auditoria Lighthouse da URL publicada, gerando `lighthouse/RESULTS.production.md`                           |

## Credenciais fictícias

| Usuário           | E-mail            | Senha       | Dados iniciais                              |
| ----------------- | ----------------- | ----------- | ------------------------------------------- |
| Ana Colecionadora | `ana@kurio.dev`   | `kurio1234` | 2 favoritos e carteira principal cadastrada |
| Bruno Artista     | `bruno@kurio.dev` | `kurio5678` | Sem favoritos e sem carteiras               |

Cupons:

| Código         | Situação                |
| -------------- | ----------------------- |
| `KURIO10`      | Válido, 10% de desconto |
| `LANCAMENTO5`  | Válido, 5% de desconto  |
| `BEMVINDO20`   | Expirado                |
| Qualquer outro | Inválido                |

Também é possível criar contas pelo cadastro. Todo o estado do mock (usuários, carrinhos, pedidos e estoque) fica no `localStorage` do navegador.

## Cenários de simulação

Há três formas de escolher um cenário. O cenário ativo persiste entre recargas, até ser trocado ou restaurado.

**1. Painel "Cenários"**

- É o botão com ícone de frasco, no canto inferior esquerdo.
- Permite trocar o cenário ativo.
- Dispara eventos `nft.updated` em um NFT: subir o preço em 0,10 ou esgotar a edição.
- Derruba as conexões Socket.IO.
- Confirma ou recusa pedidos pendentes.
- **Restaurar dados iniciais** volta todo o banco do mock às fixtures.

**2. URL**

- `?scenario=<id>` ativa um cenário e `?mockReset=1` restaura as fixtures.
- Os parâmetros são removidos da URL depois de aplicados.
- Exemplo: `/?mockReset=1&scenario=slow-network`.

**3. Console:** `window.__kurioMocks` expõe `setScenario`, `reset`, `updateNft`, `settleOrder`, `dropSockets`, `setSocketOffline`, `orders` e outros. É o mesmo controle que os testes usam.

| Cenário (`id`)             | Efeito                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `default`                  | Tudo funcionando, com latência curta e determinística (120–320 ms)                       |
| `instant`                  | Sem latência                                                                             |
| `empty-catalog`            | A listagem não retorna resultados                                                        |
| `slow-network`             | Toda resposta leva cerca de 2,5 s                                                        |
| `variable-latency`         | Cada resposta leva entre 0,2 e 2,2 s                                                     |
| `out-of-order`             | Buscas consecutivas no catálogo respondem em ordem invertida                             |
| `offline`                  | Toda chamada falha com erro de rede                                                      |
| `server-error`             | Listagem e detalhe respondem 503                                                         |
| `flaky-catalog`            | As 3 primeiras listagens falham com 500 e depois o serviço se recupera                   |
| `favorites-failure`        | Incluir ou remover favorito responde 500                                                 |
| `session-expired`          | A próxima requisição autenticada encontra a sessão expirada                              |
| `price-change-at-checkout` | Logo após a primeira cotação, o preço do primeiro item sobe e um `nft.updated` é emitido |
| `sold-out-at-checkout`     | Ao enviar o pedido, a edição do primeiro item esgota                                     |
| `order-timeout`            | O pedido é criado, mas a resposta excede o timeout do cliente (8 s)                      |
| `payment-rejected`         | O pedido é recusado na liquidação                                                        |
| `payment-pending`          | O pedido fica pendente até ser liquidado pelo painel                                     |
| `wallet-rejected`          | A carteira recusa a conexão                                                              |
| `wallet-disconnect`        | A carteira se desconecta 4 s depois de conectada                                         |
| `socket-offline`           | O servidor Socket.IO recusa conexões                                                     |

## Como reproduzir os fluxos de falha

Os passos abaixo partem de `/?mockReset=1` e, salvo indicação, com login de `ana@kurio.dev`.

| Fluxo                          | Como reproduzir                                                                        | O que observar                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Carregamento lento             | Cenário `slow-network`, recarregar a home                                              | Skeletons com shimmer no catálogo e no detalhe                                                                                               |
| Falha e recuperação            | Cenário `server-error` ou `flaky-catalog`                                              | Mensagem de erro com "Tentar novamente"; no `flaky-catalog`, a nova tentativa funciona                                                       |
| Sem conexão                    | Cenário `offline`                                                                      | "Não foi possível conectar…" nas telas que dependem da API                                                                                   |
| Respostas fora de ordem        | Cenário `out-of-order`, digitar rápido na busca                                        | O resultado exibido sempre corresponde ao último termo; a resposta atrasada é descartada                                                     |
| Sessão expirada                | Cenário `session-expired`, abrir Perfil ou Carteiras                                   | Volta ao login com "Sua sessão expirou…" e retorna à rota depois de entrar                                                                   |
| Favorito com falha             | Cenário `favorites-failure`, clicar num coração                                        | O coração acende, apaga em seguida e aparece um aviso de erro                                                                                |
| Cupom                          | Carrinho com `NOPE`, `BEMVINDO20` e `KURIO10`                                          | Mensagens de inválido e expirado; desconto aplicado na cotação                                                                               |
| Preço alterado no checkout     | Item no carrinho, cenário `price-change-at-checkout`, abrir o pagamento e aguardar 2 s | O resumo é recalculado, "Confirmar compra" fica bloqueado e o carrinho mostra "Seu carrinho mudou" com "Atualizar carrinho"                  |
| Alteração manual em tempo real | Painel: "Subir preço +0,10" ou "Esgotar edição" com o NFT aberto ou no carrinho        | Detalhe, catálogo e carrinho atualizam sem recarregar; leitor de tela recebe o aviso                                                         |
| Item esgota no envio           | Cenário `sold-out-at-checkout`, confirmar a revisão                                    | O pedido não é criado e aparece um aviso com link para revisar o carrinho                                                                    |
| Timeout após criar pedido      | Cenário `order-timeout`, confirmar a revisão                                           | Depois de 8 s aparece "Não recebemos a confirmação…"; "Tentar novamente" reenvia com a mesma chave de idempotência e recupera o mesmo pedido |
| Clique repetido                | Duplo clique em "Confirmar e assinar"                                                  | Um único pedido                                                                                                                              |
| Pagamento recusado             | Cenário `payment-rejected`                                                             | Tela "Pagamento recusado"; os itens continuam no carrinho                                                                                    |
| Pedido pendente e reconexão    | Cenário `payment-pending`, confirmar, recarregar e abrir `/checkout`                   | Aviso "Você tem uma compra em processamento"; ao confirmar pelo painel, o recibo aparece via Socket.IO                                       |
| Carteira                       | Cenários `wallet-rejected` e `wallet-disconnect`                                       | Mensagem de conexão recusada ou de carteira desconectada, sem criar pedido                                                                   |
| Tempo real fora do ar          | Cenário `socket-offline` ou "Derrubar Socket.IO"                                       | Após 4 s, o aviso "Atualizações em tempo real pausadas"; ao reconectar, os dados ativos são recarregados                                     |
| Troca de usuário               | Entrar como Ana, sair e entrar como Bruno                                              | Favoritos, carrinho e pedidos de Ana não aparecem para Bruno                                                                                 |

## Testes

A suíte Playwright fica em `tests/e2e`: são 12 arquivos, um por cenário do enunciado, mais a regressão visual. Ela roda em dois projetos:

- **`chromium-desktop` (1440×900):** todos os testes.
- **`chromium-mobile` (390×844):** os fluxos marcados com `@mobile`.

Detalhes:

- Cada teste começa com um contexto de navegador novo e restaura as fixtures pela URL, o que isola o estado.
- Tempo e eventos são controlados pelo relógio do Playwright e por `window.__kurioMocks`.
- Os eventos passam pelo servidor Socket.IO simulado até o cliente real, nunca direto pela interface.
- Falhas geram trace, vídeo e screenshot em `test-results/`. O relatório HTML fica em `playwright-report/`.
- As imagens de referência ficam em `tests/e2e/__screenshots__`. Foram geradas em Linux; em outro sistema operacional, a renderização de fontes muda e é preciso regenerar com `pnpm test:e2e:update`.

## Deploy

O `vercel.json` configura:

- instalação com lockfile congelado e build `pnpm build`;
- rewrite de SPA, para que acesso direto e refresh funcionem em qualquer rota;
- `mockServiceWorker.js` sem cache;
- cache longo para `/assets`.

O build publicado mantém `VITE_ENABLE_MOCKS=true`, então a demonstração funciona sem backend.

A suíte Playwright também roda contra o deploy (`pnpm test:e2e:production`, ou `E2E_BASE_URL=<url> pnpm test:e2e` para outra URL). Nesse modo não há build nem `preview` locais.

## Estrutura

```
src/
  api/          contratos zod, cliente Axios, endpoints e erros
  app/          QueryClient, router, chaves de cache
  routes/       rotas por arquivo (TanStack Router)
  features/     catalog, nft, auth, favorites, cart, checkout, orders, account, wallets
  realtime/     cliente Socket.IO, aplicação de eventos e status de conexão
  components/   ui (shadcn adaptado), layout, formulários e componentes comuns
  mocks/        handlers MSW, servidor Socket.IO, banco persistente, fixtures, cenários e painel
tests/e2e/      specs Playwright, fixtures de teste e imagens de referência
lighthouse/     configuração, script, relatórios e resultados da auditoria
docs/           enunciado do desafio
```
