import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { env } from '@/env'

async function bootstrap() {
  if (env.VITE_ENABLE_MOCKS) {
    const { startMocks } = await import('@/mocks/browser')
    await startMocks()
  }
  const { App } = await import('@/app/app')
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
