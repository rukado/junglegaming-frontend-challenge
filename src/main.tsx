import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setTransportReady } from '@/api/transport'
import { env } from '@/env'
import { takeMockOverrides } from '@/mocks/url-overrides'

async function bootstrap() {
  const appModule = import('@/app/app')
  if (env.VITE_ENABLE_MOCKS) {
    const overrides = takeMockOverrides()
    const mocksReady = import('@/mocks/browser').then(({ startMocks }) => startMocks(overrides))
    setTransportReady(mocksReady)
    await mocksReady
  }
  const { App } = await appModule
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
