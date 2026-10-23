import { useQueryClient } from '@tanstack/react-query'
import { WifiOff } from 'lucide-react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { realtimeEventNames, nftUpdatedEvent, orderUpdatedEvent } from '@/api/contracts'
import { queryKeys } from '@/app/query-keys'
import { useCurrentUserId } from '@/features/auth/session'
import { sessionStore } from '@/features/auth/session-store'
import { applyNftUpdated, applyOrderUpdated, createEventLedger } from './apply-events'
import { connectRealtime, disconnectRealtime, getSocket, reconnectRealtime } from './client'
import { realtimeStatusStore } from './status'

const offlineNoticeDelayMs = 4_000

function useRealtimeStatus() {
  return useSyncExternalStore(realtimeStatusStore.subscribe, realtimeStatusStore.get)
}

export default function RealtimeBridge() {
  const queryClient = useQueryClient()
  const userId = useCurrentUserId()
  const userIdRef = useRef(userId)
  const [announcement, setAnnouncement] = useState('')
  const status = useRealtimeStatus()
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  useEffect(() => {
    const socket = getSocket()
    const ledger = createEventLedger()
    let connectedOnce = false

    const announce = (message: string | null) => {
      if (message) setAnnouncement(message)
    }

    const onNftUpdated = (payload: unknown) => {
      const parsed = nftUpdatedEvent.safeParse(payload)
      if (!parsed.success) return
      const event = parsed.data
      if (!ledger.accept(event.id, `nft:${event.resource.id}`, event.version)) return
      announce(applyNftUpdated(queryClient, event).announcement)
    }

    const onOrderUpdated = (payload: unknown) => {
      const parsed = orderUpdatedEvent.safeParse(payload)
      if (!parsed.success) return
      const event = parsed.data
      if (!ledger.accept(event.id, `order:${event.resource.id}`, event.version)) return
      announce(applyOrderUpdated(queryClient, event, userIdRef.current).announcement)
    }

    const onConnect = () => {
      if (connectedOnce) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all, refetchType: 'active' })
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all, refetchType: 'active' })
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === 'user' && query.queryKey[2] === 'orders',
          refetchType: 'active',
        })
        announce('Conexão em tempo real restabelecida. Dados atualizados.')
      }
      connectedOnce = true
    }

    socket.on(realtimeEventNames.nftUpdated, onNftUpdated)
    socket.on(realtimeEventNames.orderUpdated, onOrderUpdated)
    socket.on('connect', onConnect)
    connectRealtime()

    let token = sessionStore.getToken()
    const unsubscribe = sessionStore.subscribe(() => {
      const next = sessionStore.getToken()
      if (next === token) return
      token = next
      reconnectRealtime()
    })

    return () => {
      unsubscribe()
      socket.off(realtimeEventNames.nftUpdated, onNftUpdated)
      socket.off(realtimeEventNames.orderUpdated, onOrderUpdated)
      socket.off('connect', onConnect)
      disconnectRealtime()
    }
  }, [queryClient])

  useEffect(() => {
    if (status !== 'reconnecting') return
    const timer = setTimeout(() => setShowOffline(true), offlineNoticeDelayMs)
    return () => {
      clearTimeout(timer)
      setShowOffline(false)
    }
  }, [status])

  return (
    <>
      <output aria-live="polite" className="sr-only">
        {announcement}
      </output>
      {showOffline && (
        <output
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-soft bg-surface-card px-4 py-2 text-caption text-text-secondary shadow-lg md:bottom-6"
        >
          <WifiOff aria-hidden="true" className="size-4 text-text-accent" />
          Atualizações em tempo real pausadas. Reconectando…
        </output>
      )}
    </>
  )
}
