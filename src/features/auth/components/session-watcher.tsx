import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { storageKeys } from '@/lib/storage'
import { isPrivatePath } from '../private-routes'
import { clearPrivateData } from '../session'
import { sessionStore } from '../session-store'

export function SessionWatcher() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = sessionStore.onSessionEnd((reason) => {
      clearPrivateData(queryClient)
      const { pathname, href } = router.state.location
      const onPrivateRoute = isPrivatePath(pathname)
      if (reason === 'expired') {
        if (onPrivateRoute) {
          toast.error('Sua sessão expirou. Entre novamente para continuar.')
          void router.navigate({ to: '/login', search: { redirect: href, reason: 'expired' } })
        } else {
          toast.error('Sua sessão expirou.', {
            action: {
              label: 'Entrar',
              onClick: () => void router.navigate({ to: '/login', search: { redirect: href } }),
            },
          })
        }
      } else {
        toast.success('Você saiu da sua conta.')
        if (onPrivateRoute) void router.navigate({ to: '/' })
      }
      sessionStore.acknowledgeEnd()
    })

    function onStorage(event: StorageEvent) {
      if (event.key !== storageKeys.sessionToken) return
      clearPrivateData(queryClient)
      sessionStore.syncFromStorage()
      void router.invalidate()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [queryClient, router])

  return null
}
