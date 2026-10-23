import { spawn, type ChildProcess } from 'node:child_process'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import lighthouse, { desktopConfig } from 'lighthouse'
import {
  categories,
  chromeFlags,
  metrics,
  pages,
  previewPort,
  profiles,
  runsPerTarget,
  targets,
} from './config.ts'

type Profile = (typeof profiles)[number]
type Page = (typeof pages)[number]

type RunResult = {
  run: number
  scores: Record<string, number>
  metrics: Record<string, number>
  reportBase: string
}

type Summary = {
  page: Page
  profile: Profile
  runs: RunResult[]
  median: RunResult
  medianScores: Record<string, number>
  medianMetrics: Record<string, number>
  warnings: string[]
}

const root = path.dirname(fileURLToPath(import.meta.url))
const reportsDir = path.join(root, 'reports')
const runsDir = path.join(reportsDir, 'runs')
const baseUrl = `http://localhost:${previewPort}`

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, () => {
      const address = server.address()
      server.close(() =>
        typeof address === 'object' && address ? resolve(address.port) : reject(new Error('porta')),
      )
    })
  })
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

async function waitForServer(url: string, timeoutMs = 30_000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
  throw new Error(`Servidor não respondeu em ${url}`)
}

function startPreview(): ChildProcess {
  return spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(previewPort), '--strictPort'], {
    cwd: path.resolve(root, '..'),
    stdio: 'ignore',
    env: { ...process.env, VITE_ENABLE_MOCKS: 'true' },
  })
}

async function audit(
  page: Page,
  profile: Profile,
  run: number,
): Promise<
  RunResult & {
    userAgent: string
    settings: unknown
    lighthouseVersion: string
    warnings: string[]
  }
> {
  const port = await freePort()
  const browser = await chromium.launch({
    channel: 'chromium',
    args: [`--remote-debugging-port=${port}`, ...chromeFlags],
  })
  try {
    const result = await lighthouse(
      `${baseUrl}${page.path}`,
      { port, output: ['html', 'json'], logLevel: 'error' },
      profile === 'desktop' ? desktopConfig : undefined,
    )
    if (!result) throw new Error('Lighthouse não retornou resultado')
    const { lhr, report } = result
    const reportBase = `${page.id}-${profile}-${run}`
    const [html, json] = Array.isArray(report) ? report : [report, '']
    await writeFile(path.join(runsDir, `${reportBase}.html`), html ?? '')
    await writeFile(path.join(runsDir, `${reportBase}.json`), json ?? '')
    const scores = Object.fromEntries(
      categories.map((id) => [id, Math.round((lhr.categories[id]?.score ?? 0) * 100)]),
    )
    const values = Object.fromEntries(
      metrics.map(({ id }) => [id, lhr.audits[id]?.numericValue ?? Number.NaN]),
    )
    return {
      run,
      scores,
      metrics: values,
      reportBase,
      userAgent: lhr.environment.hostUserAgent,
      settings: lhr.configSettings,
      lighthouseVersion: lhr.lighthouseVersion,
      warnings: lhr.runWarnings,
    }
  } finally {
    await browser.close()
  }
}

function formatMetric(id: string, value: number) {
  if (Number.isNaN(value)) return '—'
  if (id === 'cumulative-layout-shift') return value.toFixed(3)
  return `${Math.round(value)} ms`
}

function failedAudits(json: string, category: string) {
  const lhr = JSON.parse(json) as {
    categories: Record<string, { auditRefs: Array<{ id: string; weight: number }> }>
    audits: Record<string, { title: string; score: number | null; scoreDisplayMode: string }>
  }
  return (lhr.categories[category]?.auditRefs ?? [])
    .map((ref) => ({ ref, entry: lhr.audits[ref.id] }))
    .filter(
      ({ entry }) =>
        entry &&
        entry.scoreDisplayMode !== 'notApplicable' &&
        entry.scoreDisplayMode !== 'informative' &&
        entry.scoreDisplayMode !== 'manual' &&
        entry.score !== null &&
        entry.score < 0.9,
    )
    .map(
      ({ entry, ref }) =>
        `${entry?.title} (${ref.id}, score ${Math.round((entry?.score ?? 0) * 100)})`,
    )
}

async function main() {
  await rm(reportsDir, { recursive: true, force: true })
  await mkdir(runsDir, { recursive: true })
  const preview = startPreview()
  const summaries: Summary[] = []
  let environment = {
    userAgent: '',
    lighthouseVersion: '',
    settings: {} as Record<Profile, unknown>,
  }
  try {
    await waitForServer(baseUrl)
    for (const page of pages) {
      for (const profile of profiles) {
        const runs: Array<RunResult & { warnings: string[] }> = []
        for (let run = 1; run <= runsPerTarget; run += 1) {
          process.stdout.write(`${page.id} · ${profile} · execução ${run}/${runsPerTarget}\n`)
          const result = await audit(page, profile, run)
          environment = {
            userAgent: result.userAgent,
            lighthouseVersion: result.lighthouseVersion,
            settings: { ...environment.settings, [profile]: result.settings },
          }
          runs.push(result)
        }
        const medianScores = Object.fromEntries(
          categories.map((id) => [id, median(runs.map((run) => run.scores[id] ?? 0))]),
        )
        const medianMetrics = Object.fromEntries(
          metrics.map(({ id }) => [id, median(runs.map((run) => run.metrics[id] ?? 0))]),
        )
        const performanceMedian = medianScores.performance
        const representative =
          runs.find((run) => run.scores.performance === performanceMedian) ?? runs[0]
        if (!representative) throw new Error('Nenhuma execução registrada')
        for (const extension of ['html', 'json']) {
          await copyFile(
            path.join(runsDir, `${representative.reportBase}.${extension}`),
            path.join(reportsDir, `${page.id}-${profile}.${extension}`),
          )
        }
        summaries.push({
          page,
          profile,
          runs,
          median: representative,
          medianScores,
          medianMetrics,
          warnings: Array.from(new Set(runs.flatMap((run) => run.warnings))),
        })
      }
    }
  } finally {
    preview.kill()
  }

  const settingsFor = (profile: Profile) =>
    environment.settings[profile] as {
      formFactor: string
      throttlingMethod: string
      throttling: { rttMs: number; throughputKbps: number; cpuSlowdownMultiplier: number }
      screenEmulation: { width: number; height: number; deviceScaleFactor: number }
    }

  const lines: string[] = []
  lines.push('# Resultados Lighthouse', '')
  lines.push(`Gerado em ${new Date().toISOString()} por \`pnpm lighthouse\`.`, '')
  lines.push('## Medianas por página e perfil', '')
  lines.push(
    `| Página | Perfil | Performance | Accessibility | Best Practices | SEO | ${metrics.map((metric) => metric.label).join(' | ')} |`,
  )
  lines.push(`| --- | --- | ---: | ---: | ---: | ---: | ${metrics.map(() => '---:').join(' | ')} |`)
  for (const summary of summaries) {
    const scoreCells = categories.map((id) => {
      const value = summary.medianScores[id] ?? 0
      return value >= targets[id] ? String(value) : `**${value}** ⚠`
    })
    const metricCells = metrics.map(({ id }) =>
      formatMetric(id, summary.medianMetrics[id] ?? Number.NaN),
    )
    lines.push(
      `| ${summary.page.label} | ${summary.profile} | ${scoreCells.join(' | ')} | ${metricCells.join(' | ')} |`,
    )
  }
  lines.push(
    '',
    `Metas: Performance ≥ ${targets.performance}, Accessibility ≥ ${targets.accessibility}, Best Practices ≥ ${targets['best-practices']}, SEO ≥ ${targets.seo}. Valores abaixo da meta aparecem em negrito.`,
    '',
  )

  lines.push('## Execuções individuais', '')
  lines.push(`| Página | Perfil | Execução | Perf. | A11y | BP | SEO | LCP | CLS | TBT |`)
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const summary of summaries) {
    for (const run of summary.runs) {
      lines.push(
        `| ${summary.page.label} | ${summary.profile} | ${run.run} | ${categories.map((id) => run.scores[id]).join(' | ')} | ${formatMetric('largest-contentful-paint', run.metrics['largest-contentful-paint'] ?? Number.NaN)} | ${formatMetric('cumulative-layout-shift', run.metrics['cumulative-layout-shift'] ?? Number.NaN)} | ${formatMetric('total-blocking-time', run.metrics['total-blocking-time'] ?? Number.NaN)} |`,
      )
    }
  }

  lines.push('', '## Auditorias abaixo de 90 na execução mediana', '')
  for (const summary of summaries) {
    const json = await readFile(
      path.join(reportsDir, `${summary.page.id}-${summary.profile}.json`),
      'utf8',
    )
    const issues = categories.flatMap((category) =>
      failedAudits(json, category).map((issue) => `${category}: ${issue}`),
    )
    lines.push(`### ${summary.page.label} · ${summary.profile}`, '')
    lines.push(...(issues.length ? issues.map((issue) => `- ${issue}`) : ['- Nenhuma']))
    if (summary.warnings.length)
      lines.push('', ...summary.warnings.map((warning) => `- Aviso: ${warning}`))
    lines.push('')
  }

  const mobile = settingsFor('mobile')
  const desktop = settingsFor('desktop')
  const pkg = JSON.parse(await readFile(path.resolve(root, '..', 'package.json'), 'utf8')) as {
    devDependencies: Record<string, string>
  }
  lines.push('## Ambiente e condições', '')
  lines.push(
    `- Lighthouse ${environment.lighthouseVersion} (API Node, \`lighthouse\` ${pkg.devDependencies.lighthouse}, Chromium iniciado pelo Playwright ${pkg.devDependencies['@playwright/test']} com \`--remote-debugging-port\`)`,
  )
  lines.push(`- Navegador: Chromium do Playwright (${environment.userAgent})`)
  lines.push(`- Flags do Chromium: \`${chromeFlags.join(' ')}\``)
  lines.push(
    `- Node ${process.version} · ${os.type()} ${os.release()} (${os.arch()}) · ${os.cpus()[0]?.model ?? 'CPU'} × ${os.cpus().length} · ${Math.round(os.totalmem() / 1024 ** 3)} GB RAM`,
  )
  lines.push(
    `- Build de produção (\`vite build\`) servido por \`vite preview\` na porta ${previewPort}, com \`VITE_ENABLE_MOCKS=true\` e cenário padrão dos mocks (latência curta determinística).`,
  )
  lines.push(
    '- Cada execução abre um perfil limpo do Chromium: sem cache, sem service worker registrado e com o banco do mock recriado a partir das fixtures.',
  )
  lines.push(
    `- Mobile: ${mobile.formFactor}, throttling ${mobile.throttlingMethod} (RTT ${mobile.throttling.rttMs} ms, ${mobile.throttling.throughputKbps} Kbps, CPU ${mobile.throttling.cpuSlowdownMultiplier}×), tela ${mobile.screenEmulation.width}×${mobile.screenEmulation.height} @${mobile.screenEmulation.deviceScaleFactor}x.`,
  )
  lines.push(
    `- Desktop: ${desktop.formFactor}, throttling ${desktop.throttlingMethod} (RTT ${desktop.throttling.rttMs} ms, ${desktop.throttling.throughputKbps} Kbps, CPU ${desktop.throttling.cpuSlowdownMultiplier}×), tela ${desktop.screenEmulation.width}×${desktop.screenEmulation.height} @${desktop.screenEmulation.deviceScaleFactor}x.`,
  )
  lines.push(
    `- ${runsPerTarget} execuções por página e perfil; a mediana é calculada por categoria e por métrica. Os relatórios HTML/JSON versionados são os da execução com a performance mediana (\`lighthouse/reports/<página>-<perfil>.{html,json}\`).`,
  )
  lines.push('')

  await writeFile(path.join(root, 'RESULTS.md'), `${lines.join('\n')}`)
  await writeFile(
    path.join(reportsDir, 'summary.json'),
    JSON.stringify(
      summaries.map(({ page, profile, medianScores, medianMetrics, runs }) => ({
        page: page.id,
        profile,
        medianScores,
        medianMetrics,
        runs: runs.map(({ run, scores, metrics: values }) => ({ run, scores, metrics: values })),
      })),
      null,
      2,
    ),
  )
  process.stdout.write('Resultados em lighthouse/RESULTS.md\n')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
