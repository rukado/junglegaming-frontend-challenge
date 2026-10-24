# Auditoria Lighthouse

## Como executar

```bash
pnpm lighthouse
pnpm lighthouse:production
```

| Comando                      | Alvo                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lighthouse`            | Gera o build de produção e sobe `vite preview` em HTTPS/HTTP2 na porta 4174, com certificado autoassinado |
| `pnpm lighthouse:production` | Audita a URL publicada na Vercel (`productionUrl` em `config.ts`), sem build local                        |

Os dois modos auditam cada página em cada perfil três vezes. Cada execução usa um perfil limpo do Chromium do Playwright, sem extensões, cache ou service worker registrado.

| Arquivo                                                   | Conteúdo                                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `lighthouse/config.ts`                                    | Páginas, perfis, número de execuções, metas, URL de produção e flags do Chromium        |
| `lighthouse/run.ts`                                       | Execução, cálculo das medianas e geração dos relatórios                                 |
| `lighthouse/RESULTS.<alvo>.md`                            | Medianas, execuções individuais, auditorias abaixo de 90, ambiente e condições (gerado) |
| `lighthouse/reports/<alvo>/<página>-<perfil>.{html,json}` | Relatórios completos da execução mediana de cada combinação                             |
| `lighthouse/reports/<alvo>/summary.json`                  | Pontuações e métricas de todas as execuções                                             |
| `lighthouse/reports/<alvo>/runs/`                         | Relatórios de todas as execuções (não versionados)                                      |

`<alvo>` é `local` ou `production`.

As configurações do Lighthouse são as padrão da versão 13: `mobile` (Moto G Power, 4G lento simulado, CPU 4×) e `desktop` (`desktopConfig`). O cenário dos mocks é o padrão, com latência curta e determinística. Imagens, fontes, Socket.IO e MSW são carregados exatamente como na entrega.

## Resultado

As metas são atingidas nas quatro combinações. Performance fica em 100 no desktop e acima de 90 no mobile; Accessibility, Best Practices e SEO ficam em 100. Os valores exatos estão em [`RESULTS.production.md`](RESULTS.production.md) e [`RESULTS.local.md`](RESULTS.local.md).

## Auditar pelo DevTools

Rodar o Lighthouse no DevTools de um Chrome com extensões distorce bastante o resultado. Num teste com extensões de cupons e carteira instaladas, a Performance mobile da home caiu para 55: as extensões somaram 4,2 s de CPU e 3 MB de JavaScript não usado, e o próprio relatório avisa que "Chrome extensions negatively affected this page's load performance". Para comparar com estes números, use uma janela anônima sem extensões ou os scripts acima.

## O que limitava a performance mobile

No mobile, o Lighthouse calcula as métricas por simulação (Lantern): reconstrói o carregamento a partir das requisições observadas, com RTT de 150 ms, 1,6 Mbps e CPU 4× mais lenta.

**1. Protocolo.** A primeira versão da auditoria usava `vite preview` em HTTP/1.1. Nesse protocolo, a simulação limita cada origem a 6 conexões, e os ~25 chunks do code splitting entram em fila. Resultado: Performance mobile 72–75 no build local, contra 87–90 na Vercel, que serve em HTTP/2. Compressão não explicava a diferença: o mesmo build servido com brotli em HTTP/1.1 ficou em 71–73. A auditoria local passou a usar HTTPS/HTTP2 para refletir o ambiente publicado.

**2. JavaScript antes do primeiro paint.** O app só renderiza depois que o service worker do MSW está ativo; sem essa espera, requisições iniciais escapariam da camada de rede simulada. Até lá a tela ficava vazia, o que atrasava FCP e Speed Index.

**3. Tamanho da camada de mocks.** O chunk de controle do MSW tinha 380 KB, dos quais 150 KB eram `tldts`, a lista de sufixos públicos carregada pelo `tough-cookie` para o cookie jar do MSW. A aplicação não usa cookies.

## O que foi otimizado e medido

Medições do início no mobile, servindo o build em HTTP/2 (mediana de 3 execuções):

| Mudança                                                                                                                                              | Efeito medido                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Ponto de partida                                                                                                                                     | Performance 86, FCP 2,6 s, LCP 3,0 s                                 |
| Boot shell estático no `index.html` (logo, skeletons com shimmer e texto de status para leitores de tela), substituído pelo React no primeiro render | FCP 2,6 → 1,7 s, Speed Index 3,9 → 3,2 s, Performance 86 → 89        |
| `tldts` substituído por um resolvedor mínimo de domínio (`src/mocks/public-suffix.ts`, via alias no Vite)                                            | Chunk de controle 380 → 113 KB, LCP 3,1 → 3,0 s, Performance 89 → 91 |
| `TooltipProvider` sem nenhum tooltip removido da raiz                                                                                                | Código morto fora do caminho crítico                                 |

Otimizações anteriores, ainda em vigor:

| Mudança                                                                                                                               | Efeito medido                        |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `main` com altura mínima da viewport, para o rodapé não subir enquanto o skeleton está na tela                                        | CLS do detalhe no desktop: 0,232 → 0 |
| `public/robots.txt` válido (antes o preview devolvia o HTML do SPA)                                                                   | SEO 92 → 100                         |
| Import do app e boot do MSW em paralelo, em vez de sequenciais                                                                        | Menos tempo até o primeiro render    |
| `socket.io-client` e o painel de cenários carregados só depois que a rede está pronta                                                 | Ficam fora do chunk de entrada       |
| Imagens em WebP com `srcset`/`sizes`, dimensões explícitas, `fetchpriority="high"` na imagem principal e `loading="lazy"` no restante | CLS próximo de zero                  |
| Fonte variável self-hosted (`@fontsource-variable`, woff2 de 32 KB, `font-display: swap`)                                             | Texto pinta sem esperar a fonte      |

## Alternativas testadas e descartadas

| Alternativa                                                        | Resultado                                                                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Renderizar antes de o MSW ficar ativo, segurando só as requisições | Performance 82–83: o boot do MSW e o render do React disputam a thread principal, o TBT sobe e o LCP atrasa para 3,5 s            |
| Baixar os chunks da rota atual em paralelo com o boot do MSW       | Detalhe melhorou (91–92), mas o início piorou (LCP 3,2 → 3,5 s), porque os chunks passaram a disputar banda com o MSW             |
| Carregar sob demanda o menu da conta (Radix Menu e Floating UI)    | O chunk `app` caiu de 52 para 31 KB, mas Performance e LCP ficaram na mesma faixa (87–88); a mudança não compensou a complexidade |

O gate de rede no cliente Axios (`src/api/transport.ts`) continua garantindo que nenhuma requisição saia antes de os mocks estarem prontos, independentemente da ordem de carregamento.
