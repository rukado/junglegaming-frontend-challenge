# Resultados Lighthouse

Gerado em 2026-10-23T20:36:45.772Z por `pnpm lighthouse`.

## Medianas por página e perfil

| Página         | Perfil  | Performance | Accessibility | Best Practices | SEO |     LCP |   CLS |    TBT |     FCP | Speed Index |
| -------------- | ------- | ----------: | ------------: | -------------: | --: | ------: | ----: | -----: | ------: | ----------: |
| Início         | mobile  |    **73** ⚠ |           100 |            100 | 100 | 4724 ms | 0.001 | 170 ms | 3485 ms |     3485 ms |
| Início         | desktop |          98 |           100 |            100 | 100 | 1058 ms | 0.011 |   6 ms |  758 ms |      758 ms |
| Detalhe do NFT | mobile  |    **75** ⚠ |           100 |            100 | 100 | 4728 ms | 0.000 |  72 ms | 3592 ms |     3592 ms |
| Detalhe do NFT | desktop |          98 |           100 |            100 | 100 | 1030 ms | 0.000 |   0 ms |  765 ms |      765 ms |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Valores abaixo da meta aparecem em negrito.

## Execuções individuais

| Página         | Perfil  | Execução | Perf. | A11y |  BP | SEO |     LCP |   CLS |    TBT |
| -------------- | ------- | -------: | ----: | ---: | --: | --: | ------: | ----: | -----: |
| Início         | mobile  |        1 |    73 |  100 | 100 | 100 | 4732 ms | 0.000 | 170 ms |
| Início         | mobile  |        2 |    73 |  100 | 100 | 100 | 4712 ms | 0.001 | 171 ms |
| Início         | mobile  |        3 |    74 |  100 | 100 | 100 | 4724 ms | 0.001 | 147 ms |
| Início         | desktop |        1 |    98 |  100 | 100 | 100 | 1065 ms | 0.011 |   6 ms |
| Início         | desktop |        2 |    98 |  100 | 100 | 100 | 1050 ms | 0.011 |   4 ms |
| Início         | desktop |        3 |    98 |  100 | 100 | 100 | 1058 ms | 0.011 |   7 ms |
| Detalhe do NFT | mobile  |        1 |    75 |  100 | 100 | 100 | 4728 ms | 0.000 |  72 ms |
| Detalhe do NFT | mobile  |        2 |    75 |  100 | 100 | 100 | 4726 ms | 0.000 |  83 ms |
| Detalhe do NFT | mobile  |        3 |    75 |  100 | 100 | 100 | 4748 ms | 0.000 |  70 ms |
| Detalhe do NFT | desktop |        1 |    98 |  100 | 100 | 100 | 1030 ms | 0.000 |   0 ms |
| Detalhe do NFT | desktop |        2 |    98 |  100 | 100 | 100 | 1030 ms | 0.000 |   0 ms |
| Detalhe do NFT | desktop |        3 |    98 |  100 | 100 | 100 | 1029 ms | 0.000 |   0 ms |

## Auditorias abaixo de 90 na execução mediana

### Início · mobile

- performance: First Contentful Paint (first-contentful-paint, score 33)
- performance: Largest Contentful Paint (largest-contentful-paint, score 32)
- performance: Speed Index (speed-index, score 87)
- performance: Forced reflow (forced-reflow-insight, score 0)
- performance: Network dependency tree (network-dependency-tree-insight, score 0)
- performance: Render-blocking requests (render-blocking-insight, score 0)
- performance: Time to Interactive (interactive, score 79)
- performance: Max Potential First Input Delay (max-potential-fid, score 83)
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

- performance: First Contentful Paint (first-contentful-paint, score 32)
- performance: Largest Contentful Paint (largest-contentful-paint, score 32)
- performance: Speed Index (speed-index, score 87)
- performance: LCP request discovery (lcp-discovery-insight, score 0)
- performance: Network dependency tree (network-dependency-tree-insight, score 0)
- performance: Render-blocking requests (render-blocking-insight, score 0)
- performance: Time to Interactive (interactive, score 80)
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
- Flags do Chromium: `--no-sandbox --disable-gpu`
- Node v24.19.0 · Linux 6.18.33.2-microsoft-standard-WSL2 (x64) · Intel(R) Core(TM) i7-10700 CPU @ 2.90GHz × 16 · 16 GB RAM
- Build de produção (`vite build`) servido por `vite preview` na porta 4174, com `VITE_ENABLE_MOCKS=true` e cenário padrão dos mocks (latência curta determinística).
- Cada execução abre um perfil limpo do Chromium: sem cache, sem service worker registrado e com o banco do mock recriado a partir das fixtures.
- Mobile: mobile, throttling simulate (RTT 150 ms, 1638.4 Kbps, CPU 4×), tela 412×823 @1.75x.
- Desktop: desktop, throttling simulate (RTT 40 ms, 10240 Kbps, CPU 1×), tela 1350×940 @1x.
- 3 execuções por página e perfil; a mediana é calculada por categoria e por métrica. Os relatórios HTML/JSON versionados são os da execução com a performance mediana (`lighthouse/reports/<página>-<perfil>.{html,json}`).
