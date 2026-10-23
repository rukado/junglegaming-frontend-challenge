import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/errors'

const maxQueryRetries = 2

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (!isApiError(error)) return false
  if (error.kind === 'canceled') return false
  return error.isTransient && failureCount < maxQueryRetries
}

export function retryDelay(attempt: number): number {
  return Math.min(500 * 2 ** attempt, 4_000)
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
