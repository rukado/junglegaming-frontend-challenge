import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { transportReady } from '@/api/transport'
import { env } from '@/env'
import { queryClient } from './query-client'
import { router } from './router'

const Devtools = import.meta.env.DEV ? lazy(() => import('./devtools')) : null
const MockPanel = env.VITE_ENABLE_MOCKS
  ? lazy(() => transportReady().then(() => import('@/mocks/panel/mock-panel')))
  : null

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Suspense fallback={null}>
        {Devtools && <Devtools />}
        {MockPanel && <MockPanel />}
      </Suspense>
    </QueryClientProvider>
  )
}
