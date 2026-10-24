# Resultados Lighthouse · local

Gerado em 2026-10-24T04:20:15.756Z por `pnpm lighthouse` contra https://localhost:4174.

## Medianas por página e perfil

| Página         | Perfil  | Performance | Accessibility | Best Practices | SEO |     LCP |   CLS |    TBT |     FCP | Speed Index |
| -------------- | ------- | ----------: | ------------: | -------------: | --: | ------: | ----: | -----: | ------: | ----------: |
| Início         | mobile  |          91 |           100 |            100 | 100 | 2966 ms | 0.000 | 202 ms | 1512 ms |     1678 ms |
| Início         | desktop |         100 |           100 |            100 | 100 |  604 ms | 0.005 |   4 ms |  370 ms |      447 ms |
| Detalhe do NFT | mobile  |          93 |           100 |            100 | 100 | 2907 ms | 0.000 | 124 ms | 1664 ms |     1949 ms |
| Detalhe do NFT | desktop |         100 |           100 |            100 | 100 |  599 ms | 0.000 |   0 ms |  370 ms |      458 ms |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Valores abaixo da meta aparecem em negrito.

## Execuções individuais

| Página         | Perfil  | Execução | Perf. | A11y |  BP | SEO |     LCP |   CLS |    TBT |
| -------------- | ------- | -------: | ----: | ---: | --: | --: | ------: | ----: | -----: |
| Início         | mobile  |        1 |    91 |  100 | 100 | 100 | 2997 ms | 0.000 | 202 ms |
| Início         | mobile  |        2 |    90 |  100 | 100 | 100 | 2966 ms | 0.000 | 214 ms |
| Início         | mobile  |        3 |    93 |  100 | 100 | 100 | 2960 ms | 0.000 | 160 ms |
| Início         | desktop |        1 |   100 |  100 | 100 | 100 |  604 ms | 0.005 |   2 ms |
| Início         | desktop |        2 |   100 |  100 | 100 | 100 |  623 ms | 0.005 |   6 ms |
| Início         | desktop |        3 |   100 |  100 | 100 | 100 |  604 ms | 0.005 |   4 ms |
| Detalhe do NFT | mobile  |        1 |    95 |  100 | 100 | 100 | 2736 ms | 0.000 | 124 ms |
| Detalhe do NFT | mobile  |        2 |    93 |  100 | 100 | 100 | 2907 ms | 0.000 |  95 ms |
| Detalhe do NFT | mobile  |        3 |    87 |  100 | 100 | 100 | 2986 ms | 0.000 | 313 ms |
| Detalhe do NFT | desktop |        1 |   100 |  100 | 100 | 100 |  599 ms | 0.000 |   0 ms |
| Detalhe do NFT | desktop |        2 |   100 |  100 | 100 | 100 |  606 ms | 0.000 |   0 ms |
| Detalhe do NFT | desktop |        3 |   100 |  100 | 100 | 100 |  596 ms | 0.000 |   0 ms |

## Auditorias abaixo de 90 na execução mediana

### Início · mobile

- performance: Largest Contentful Paint (largest-contentful-paint, score 78)
- performance: Total Blocking Time (total-blocking-time, score 89)
- performance: Forced reflow (forced-reflow-insight, score 0)
- performance: Network dependency tree (network-dependency-tree-insight, score 0)
- performance: Render-blocking requests (render-blocking-insight, score 0)
- performance: Max Potential First Input Delay (max-potential-fid, score 55)
- performance: Reduce unused JavaScript (unused-javascript, score 0)
- performance: Reduce JavaScript execution time (bootup-time, score 0)
- performance: Minimize main-thread work (mainthread-work-breakdown, score 0)
- performance: Page prevented back/forward cache restoration (bf-cache, score 0)

### Início · desktop

- performance: Forced reflow (forced-reflow-insight, score 0)
- performance: LCP request discovery (lcp-discovery-insight, score 0)
- performance: Network dependency tree (network-dependency-tree-insight, score 0)
- performance: Render-blocking requests (render-blocking-insight, score 0)
- performance: Reduce unused JavaScript (unused-javascript, score 0)
- performance: Page prevented back/forward cache restoration (bf-cache, score 0)

### Detalhe do NFT · mobile

- performance: First Contentful Paint (first-contentful-paint, score 89)
- performance: Largest Contentful Paint (largest-contentful-paint, score 80)
- performance: LCP request discovery (lcp-discovery-insight, score 0)
- performance: Network dependency tree (network-dependency-tree-insight, score 0)
- performance: Render-blocking requests (render-blocking-insight, score 0)
- performance: Reduce unused JavaScript (unused-javascript, score 0)
- performance: Page prevented back/forward cache restoration (bf-cache, score 0)

### Detalhe do NFT · desktop

- performance: LCP request discovery (lcp-discovery-insight, score 0)
- performance: Network dependency tree (network-dependency-tree-insight, score 0)
- performance: Render-blocking requests (render-blocking-insight, score 0)
- performance: Reduce unused JavaScript (unused-javascript, score 0)
- performance: Page prevented back/forward cache restoration (bf-cache, score 0)

## Ambiente e condições

- Lighthouse 13.5.0 (API Node, `lighthouse` ^13.5.0, Chromium iniciado pelo Playwright ^1.64.1 com `--remote-debugging-port`)
- Navegador: Chromium do Playwright (Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36)
- Flags do Chromium: `--no-sandbox --disable-gpu --ignore-certificate-errors`
- Node v24.19.0 · Linux 6.18.33.2-microsoft-standard-WSL2 (x64) · Intel(R) Core(TM) i7-10700 CPU @ 2.90GHz × 16 · 16 GB RAM
- Build de produção (`vite build`) servido por `vite preview` em HTTPS/HTTP2 na porta 4174 (certificado autoassinado do `@vitejs/plugin-basic-ssl`, sem compressão), com `VITE_ENABLE_MOCKS=true` e cenário padrão dos mocks (latência curta determinística).
- Cada execução abre um perfil limpo do Chromium: sem cache, sem service worker registrado e com o banco do mock recriado a partir das fixtures.
- Mobile: mobile, throttling simulate (RTT 150 ms, 1638.4 Kbps, CPU 4×), tela 412×823 @1.75x.
- Desktop: desktop, throttling simulate (RTT 40 ms, 10240 Kbps, CPU 1×), tela 1350×940 @1x.
- 3 execuções por página e perfil; a mediana é calculada por categoria e por métrica. Os relatórios HTML/JSON versionados são os da execução com a performance mediana (`lighthouse/reports/<página>-<perfil>.{html,json}`).
