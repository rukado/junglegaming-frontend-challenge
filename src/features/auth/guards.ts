import type { QueryClient } from '@tanstack/react-query'
import { redirect, type ParsedLocation } from '@tanstack/react-router'
import { loadSession } from './session'
import { sessionStore } from './session-store'

type GuardArgs = {
  context: { queryClient: QueryClient }
  location: ParsedLocation
}

export async function requireSession({ context, location }: GuardArgs) {
  const hadToken = sessionStore.getToken() !== null
  const session = await loadSession(context.queryClient)
  if (!session) {
    throw redirect({
      to: '/login',
      search: { redirect: location.href, reason: hadToken ? 'expired' : 'required' },
    })
  }
  return { session }
}
