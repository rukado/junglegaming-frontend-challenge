import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { LoginRequest, RegisterRequest, Session } from '@/api/contracts'
import { authApi } from '@/api/endpoints/auth'
import { cartApi } from '@/api/endpoints/cart'
import { queryKeys } from '@/app/query-keys'
import { peekGuestCartId, resetGuestCartId } from '@/features/cart/guest-cart'
import { clearPrivateData } from './session'
import { sessionStore } from './session-store'

function useStartSession() {
  const queryClient = useQueryClient()
  return async (session: Session) => {
    clearPrivateData(queryClient)
    sessionStore.start(session.token)
    queryClient.setQueryData(queryKeys.session(session.token), session)
    const guestCartId = peekGuestCartId()
    if (guestCartId) {
      try {
        await cartApi.merge({ guestCartId })
        resetGuestCartId()
      } catch {
        return session
      }
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
    return session
  }
}

export function useLogin() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (body: LoginRequest) => startSession(await authApi.login(body)),
  })
}

export function useRegister() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (body: RegisterRequest) => startSession(await authApi.register(body)),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout()
      } finally {
        sessionStore.end('logout')
        clearPrivateData(queryClient)
      }
    },
  })
}
