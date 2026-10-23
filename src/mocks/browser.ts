import { setupWorker } from 'msw/browser'
import { apiBase } from './config'
import { mockControl } from './control'
import { initDb, resetDb } from './db/store'
import { resumeSettlements } from './domain/orders'
import { handlers } from './handlers'
import { setScenario } from './scenarios'
import type { MockOverrides } from './url-overrides'

export const worker = setupWorker(...handlers)

export async function startMocks(overrides: MockOverrides) {
  if (overrides.scenario) setScenario(overrides.scenario)
  if (overrides.reset) await resetDb()
  else await initDb()
  resumeSettlements()
  await worker.start({
    quiet: import.meta.env.PROD,
    serviceWorker: { url: '/mockServiceWorker.js' },
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith(apiBase)) print.warning()
    },
  })
  window.__kurioMocks = mockControl
}
