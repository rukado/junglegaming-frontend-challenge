import { queryOptions, useQuery, type QueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/endpoints/auth'
import { isApiError } from '@/api/errors'
import { queryKeys } from '@/app/query-keys'
import { sessionStore, useSessionSnapshot } from './session-store'

export function sessionQueryOptions(token: string | null) {
  return queryOptions({
    queryKey: queryKeys.session(token),
    queryFn: ({ signal }) => authApi.session(signal),
    enabled: token !== null,
    staleTime: 60_000,
    retry: (failureCount, error) => !(isApiError(error) && error.isAuthError) && failureCount < 2,
  })
}

export type SessionState =
  | { status: 'anonymous'; user: null }
  | { status: 'loading'; user: null }
  | {
      status: 'authenticated'
      user: NonNullable<ReturnType<typeof useSessionQuery>['data']>['user']
    }

function useSessionQuery() {
  const { token } = useSessionSnapshot()
  return useQuery(sessionQueryOptions(token))
}

export function useSession(): SessionState {
  const { token } = useSessionSnapshot()
  const query = useSessionQuery()
  if (!token) return { status: 'anonymous', user: null }
  if (query.data) return { status: 'authenticated', user: query.data.user }
  if (query.isError && isApiError(query.error) && query.error.isAuthError)
    return { status: 'anonymous', user: null }
  return { status: 'loading', user: null }
}

export function useCurrentUserId(): string | null {
  const session = useSession()
  return session.status === 'authenticated' ? session.user.id : null
}

export function clearPrivateData(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ['user'] })
  queryClient.removeQueries({ queryKey: ['session'] })
  queryClient.removeQueries({ queryKey: ['cart'] })
}

export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string') return '/'
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/login') ||
    value.startsWith('/register')
  )
    return '/'
  return value
}

export async function loadSession(queryClient: QueryClient) {
  const token = sessionStore.getToken()
  if (!token) return null
  try {
    return await queryClient.ensureQueryData(sessionQueryOptions(token))
  } catch (error) {
    if (isApiError(error) && error.isAuthError) return null
    throw error
  }
}
