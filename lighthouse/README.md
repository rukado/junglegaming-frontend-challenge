# Auditoria Lighthouse

## Como executar

```bash
pnpm lighthouse
```

O comando gera o build de produção, sobe `vite preview` na porta 4174 e audita cada página em cada perfil três vezes. Cada execução usa um perfil limpo do Chromium do Playwright.

| Arquivo                                            | Conteúdo                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `lighthouse/config.ts`                             | Páginas, perfis, número de execuções, metas e flags do Chromium                         |
| `lighthouse/run.ts`                                | Execução, cálculo das medianas e geração dos relatórios                                 |
| `lighthouse/RESULTS.md`                            | Medianas, execuções individuais, auditorias abaixo de 90, ambiente e condições (gerado) |
| `lighthouse/reports/<página>-<perfil>.{html,json}` | Relatórios completos da execução mediana de cada combinação                             |
| `lighthouse/reports/summary.json`                  | Pontuações e métricas de todas as execuções                                             |
| `lighthouse/reports/runs/`                         | Relatórios de todas as execuções (não versionados)                                      |

As configurações do Lighthouse são as padrão da versão 13: `mobile` (Moto G Power, 4G lento simulado, CPU 4×) e `desktop` (`desktopConfig`). O cenário dos mocks é o padrão, com latência curta e determinística. Imagens, fontes, Socket.IO e MSW são carregados exatamente como na entrega.

## Resultado

Accessibility, Best Practices e SEO atingem 100 em todas as combinações. Performance fica em 98 no desktop e entre 72 e 75 no mobile (variação entre rodadas), abaixo da meta de 90. Os valores exatos estão em `RESULTS.md`.

## Por que a performance mobile fica abaixo de 90

No mobile, o Lighthouse calcula as métricas por simulação (Lantern): reconstrói o carregamento com RTT de 150 ms, 1,6 Mbps e CPU 4× mais lenta. As medições observadas no próprio trace são bem menores que as simuladas:

| Página  | FCP observado | LCP observado | FCP simulado | LCP simulado |
| ------- | ------------: | ------------: | -----------: | -----------: |
| Início  |       ~0,45 s |       ~0,45 s |       ~3,0 s |       ~4,8 s |
| Detalhe |        ~0,9 s |        ~1,0 s |       ~3,1 s |       ~4,8 s |

A diferença vem do JavaScript que precisa ser baixado e executado antes do primeiro render.

**1. A camada de mocks é a maior parte do caminho crítico.**

- MSW e suas dependências (`tough-cookie`, `tldts`, `path-to-regexp`) somam **173 KB transferidos de um total de 414 KB** de JavaScript (42%).
- O chunk do MSW é o script com maior custo de inicialização: cerca de 600 ms de execução com CPU 4×.
- O app só renderiza depois que o service worker está ativo. Sem essa espera, requisições iniciais escapariam da camada de rede simulada, e o enunciado exige que o REST passe pelos handlers MSW.
- Em produção, com uma API real, esses 173 KB e esse boot não existiriam.

**2. É um SPA renderizado no cliente.**

- `react-dom` e `zod` estão no chunk de entrada (93 KB transferidos) e são avaliados antes do primeiro paint.
- O `zod` também valida as respostas da API e os parâmetros de rota em tempo de execução.

**3. O LCP do detalhe depende de dados.** A imagem principal do NFT só é conhecida depois da resposta de `/api/nfts/:id`, que por sua vez depende do MSW estar ativo.

## O que foi otimizado e medido

| Mudança                                                                                                                                          | Efeito medido                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `main` com altura mínima da viewport, para o rodapé não subir enquanto o skeleton está na tela                                                   | CLS do detalhe no desktop: 0,232 → 0, Performance 83 → 98                                                              |
| `public/robots.txt` válido (antes o preview devolvia o HTML do SPA)                                                                              | SEO 92 → 100                                                                                                           |
| Import do app e boot do MSW em paralelo, em vez de sequenciais                                                                                   | Desktop do início 94 → 98; o mobile ficou na mesma faixa (76/74 antes, 72–75 depois, dentro da variação entre rodadas) |
| `socket.io-client` e o painel de cenários carregados só depois que a rede está pronta                                                            | Ficam fora do chunk de entrada                                                                                         |
| Imagens em WebP com `srcset`/`sizes`, dimensões explícitas, `fetchpriority="high"` na imagem principal do detalhe e `loading="lazy"` no restante | CLS próximo de zero e LCP do desktop em ~1,1 s                                                                         |
| Fonte variável self-hosted (`@fontsource-variable`, woff2 de 32 KB, `font-display: swap`)                                                        | Texto pinta sem esperar a fonte                                                                                        |

## Alternativa testada e descartada

Renderizar antes de iniciar o MSW, segurando só as requisições até ele estar ativo, piorou o mobile: Performance caiu para 61–65. O boot do MSW e o render do React passaram a disputar a thread principal entre o FCP e o TTI, o que aumentou o TBT e atrasou o LCP simulado.

Mesmo assim, ficou um gate de rede no cliente Axios (`src/api/transport.ts`). Ele garante que nenhuma requisição saia antes de os mocks estarem prontos, independentemente da ordem de carregamento.
