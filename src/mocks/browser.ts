import { setupWorker } from 'msw/browser'
import { apiBase } from './config'
import { mockControl } from './control'
import { initDb, resetDb } from './db/store'
import { resumeSettlements } from './domain/orders'
import { handlers } from './handlers'
import { setScenario } from './scenarios'

export const worker = setupWorker(...handlers)

function applyUrlOverrides() {
  const url = new URL(window.location.href)
  const scenario = url.searchParams.get('scenario')
  const reset = url.searchParams.get('mockReset')
  if (scenario) setScenario(scenario)
  if (scenario || reset) {
    url.searchParams.delete('scenario')
    url.searchParams.delete('mockReset')
    window.history.replaceState(window.history.state, '', url)
  }
  return reset === '1'
}

export async function startMocks() {
  const shouldReset = applyUrlOverrides()
  if (shouldReset) await resetDb()
  else await initDb()
  resumeSettlements()
  window.__kurioMocks = mockControl
  await worker.start({
    quiet: import.meta.env.PROD,
    serviceWorker: { url: '/mockServiceWorker.js' },
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith(apiBase)) print.warning()
    },
  })
}
